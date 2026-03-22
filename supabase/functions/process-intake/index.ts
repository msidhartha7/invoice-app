import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { encode as base64Encode } from 'https://deno.land/std@0.168.0/encoding/base64.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorized' }, 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SB_PUBLISHABLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_subscribed')
      .eq('id', user.id)
      .single()

    if (!profile?.is_subscribed) return json({ error: 'Subscription required' }, 403)

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null

    if (!file || !type) return json({ error: 'Missing file or type' }, 400)

    const openAIKey = Deno.env.get('OPENAI_API_KEY')

    if (!openAIKey) {
      // Mock mode — return sample data when API key is not set
      return json({
        client_name: 'Acme Creative Co.',
        items: [
          { id: crypto.randomUUID(), description: 'Brand Identity Design', quantity: 1, rate: 800, amount: 800 },
          { id: crypto.randomUUID(), description: 'Social Media Kit', quantity: 1, rate: 250, amount: 250 },
        ],
        total: 1050,
      })
    }

    let extractedData: unknown

    if (type === 'image') {
      const bytes = await file.arrayBuffer()
      const base64 = base64Encode(bytes)
      const mimeType = file.type || 'image/jpeg'

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
                {
                  type: 'text',
                  text: 'Extract invoice data. Return ONLY valid JSON with: client_name (string), items (array of {description, quantity, rate, amount}), total (number). No markdown.',
                },
              ],
            },
          ],
          max_tokens: 2000,
        }),
      })

      if (!res.ok) {
        const errBody = await res.text()
        console.error('OpenAI vision API error:', res.status, errBody)
        return json({ error: `OpenAI API error: ${res.status}`, detail: errBody }, 502)
      }

      const aiResponse = (await res.json()) as {
        choices?: Array<{ message: { content: string } }>
        error?: { message: string }
      }

      if (aiResponse.error) {
        console.error('OpenAI vision response error:', aiResponse.error)
        return json({ error: `OpenAI error: ${aiResponse.error.message}` }, 502)
      }

      const rawContent = aiResponse.choices?.[0]?.message?.content ?? ''
      const jsonText = rawContent.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
      try {
        extractedData = JSON.parse(jsonText)
      } catch {
        console.error('Failed to parse OpenAI vision response:', rawContent)
        return json({ error: 'AI returned unparseable response', raw: rawContent }, 422)
      }
    } else {
      const audioBlob = new Blob([await file.arrayBuffer()], {
        type: file.type || 'audio/webm',
      })
      const audioForm = new FormData()
      audioForm.append('file', audioBlob, 'audio.webm')
      audioForm.append('model', 'whisper-1')
      audioForm.append('response_format', 'text')

      const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${openAIKey}` },
        body: audioForm,
      })

      if (!whisperRes.ok) {
        const errBody = await whisperRes.text()
        console.error('Whisper API error:', whisperRes.status, errBody)
        return json({ error: `Whisper API error: ${whisperRes.status}`, detail: errBody }, 502)
      }

      const transcript = await whisperRes.text()

      const parseRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'Extract invoice data from voice transcripts. Return ONLY valid JSON with: client_name, items (array of {description, quantity, rate, amount}), total.',
            },
            { role: 'user', content: transcript },
          ],
          max_tokens: 1000,
        }),
      })

      if (!parseRes.ok) {
        const errBody = await parseRes.text()
        console.error('OpenAI parse API error:', parseRes.status, errBody)
        return json({ error: `OpenAI API error: ${parseRes.status}`, detail: errBody }, 502)
      }

      const parseData = (await parseRes.json()) as {
        choices?: Array<{ message: { content: string } }>
        error?: { message: string }
      }

      if (parseData.error) {
        console.error('OpenAI parse response error:', parseData.error)
        return json({ error: `OpenAI error: ${parseData.error.message}` }, 502)
      }

      const rawContent = parseData.choices?.[0]?.message?.content ?? ''
      const jsonText = rawContent.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
      try {
        extractedData = JSON.parse(jsonText)
      } catch {
        console.error('Failed to parse OpenAI audio response:', rawContent)
        return json({ error: 'AI returned unparseable response', raw: rawContent }, 422)
      }
    }

    // Ensure all items have UUIDs
    const data = extractedData as { items?: Array<Record<string, unknown>> }
    if (Array.isArray(data.items)) {
      data.items = data.items.map((item) => ({ ...item, id: item.id ?? crypto.randomUUID() }))
    }

    return json(extractedData)
  } catch (err) {
    console.error('process-intake unhandled error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return json({ error: message || 'Internal server error' }, 500)
  }
})
