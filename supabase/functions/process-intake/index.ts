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

  const requestId = crypto.randomUUID().slice(0, 8)
  console.log(`[${requestId}] process-intake start method=${req.method}`)

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.warn(`[${requestId}] missing Authorization header`)
      return json({ error: 'Unauthorized' }, 401)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.warn(`[${requestId}] auth failed error=${authError?.message}`)
      return json({ error: 'Unauthorized' }, 401)
    }
    console.log(`[${requestId}] authenticated userId=${user.id}`)

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_subscribed')
      .eq('id', user.id)
      .single()

    if (!profile?.is_subscribed) {
      console.warn(`[${requestId}] subscription check failed userId=${user.id}`)
      return json({ error: 'Subscription required' }, 403)
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null

    if (!file || !type) {
      console.warn(`[${requestId}] missing form fields file=${!!file} type=${type}`)
      return json({ error: 'Missing file or type' }, 400)
    }
    console.log(`[${requestId}] received file name=${file.name} size=${file.size} type=${type}`)

    const MAX_IMAGE_BYTES = 4 * 1024 * 1024 // 4 MB
    if (type === 'image' && file.size > MAX_IMAGE_BYTES) {
      console.warn(`[${requestId}] image too large size=${file.size} limit=${MAX_IMAGE_BYTES}`)
      return json({ error: 'Image too large. Please use a photo under 4 MB.' }, 413)
    }

    const openAIKey = Deno.env.get('OPENAI_API_KEY')

    if (!openAIKey) {
      console.log(`[${requestId}] no OPENAI_API_KEY — returning mock data`)
      // Mock mode — return sample data when API key is not set
      return json({
        client_name: 'Acme Creative Co.',
        project_name: 'Brand Refresh',
        items: [
          { id: crypto.randomUUID(), description: 'Brand Identity Design', size: '', quantity: 1, rate: 800, amount: 800 },
          { id: crypto.randomUUID(), description: 'Social Media Kit', size: '', quantity: 1, rate: 250, amount: 250 },
        ],
        delivery_fee: 0,
        total: 1050,
      })
    }

    let extractedData: unknown

    if (type === 'image') {
      console.log(`[${requestId}] calling OpenAI vision API mimeType=${file.type || 'image/jpeg'}`)
      let bytes: ArrayBuffer | null = await file.arrayBuffer()
      const base64 = base64Encode(bytes)
      bytes = null // free the buffer before building the JSON body
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
                  text: 'Extract invoice/bill data. Return ONLY valid JSON with: client_name (string), project_name (string or null), items (array of {description, size, quantity, rate, amount} where size is a size/spec string like "2x4x10\'" or empty string), delivery_fee (number, 0 if none), total (number including all charges). No markdown.',
                },
              ],
            },
          ],
          max_tokens: 2000,
        }),
      })

      if (!res.ok) {
        const errBody = await res.text()
        console.error(`[${requestId}] OpenAI vision API error status=${res.status}`, errBody)
        return json({ error: `OpenAI API error: ${res.status}`, detail: errBody }, 502)
      }
      console.log(`[${requestId}] OpenAI vision API responded status=${res.status}`)

      const aiResponse = (await res.json()) as {
        choices?: Array<{ message: { content: string } }>
        error?: { message: string }
      }

      if (aiResponse.error) {
        console.error(`[${requestId}] OpenAI vision response error:`, aiResponse.error)
        return json({ error: `OpenAI error: ${aiResponse.error.message}` }, 502)
      }

      const rawContent = aiResponse.choices?.[0]?.message?.content ?? ''
      const jsonText = rawContent.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
      try {
        extractedData = JSON.parse(jsonText)
        console.log(`[${requestId}] vision extraction complete`)
      } catch {
        console.error(`[${requestId}] failed to parse OpenAI vision response:`, rawContent)
        return json({ error: 'AI returned unparseable response', raw: rawContent }, 422)
      }
    } else {
      console.log(`[${requestId}] calling Whisper API audioType=${file.type || 'audio/webm'}`)
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
        console.error(`[${requestId}] Whisper API error status=${whisperRes.status}`, errBody)
        return json({ error: `Whisper API error: ${whisperRes.status}`, detail: errBody }, 502)
      }

      const transcript = await whisperRes.text()
      console.log(`[${requestId}] Whisper transcription complete transcriptLength=${transcript.length}`)

      console.log(`[${requestId}] calling OpenAI GPT-4o-mini to parse transcript`)
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
                'Extract invoice/bill data from voice transcripts. Return ONLY valid JSON with: client_name (string), project_name (string or null), items (array of {description, size, quantity, rate, amount} where size is a size/spec string or empty string), delivery_fee (number, 0 if none), total (number including all charges).',
            },
            { role: 'user', content: transcript },
          ],
          max_tokens: 1000,
        }),
      })

      if (!parseRes.ok) {
        const errBody = await parseRes.text()
        console.error(`[${requestId}] OpenAI parse API error status=${parseRes.status}`, errBody)
        return json({ error: `OpenAI API error: ${parseRes.status}`, detail: errBody }, 502)
      }
      console.log(`[${requestId}] OpenAI parse API responded status=${parseRes.status}`)

      const parseData = (await parseRes.json()) as {
        choices?: Array<{ message: { content: string } }>
        error?: { message: string }
      }

      if (parseData.error) {
        console.error(`[${requestId}] OpenAI parse response error:`, parseData.error)
        return json({ error: `OpenAI error: ${parseData.error.message}` }, 502)
      }

      const rawContent = parseData.choices?.[0]?.message?.content ?? ''
      const jsonText = rawContent.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
      try {
        extractedData = JSON.parse(jsonText)
        console.log(`[${requestId}] audio extraction complete`)
      } catch {
        console.error(`[${requestId}] failed to parse OpenAI audio response:`, rawContent)
        return json({ error: 'AI returned unparseable response', raw: rawContent }, 422)
      }
    }

    // Ensure all items have UUIDs and a size field
    const data = extractedData as { items?: Array<Record<string, unknown>> }
    if (Array.isArray(data.items)) {
      data.items = data.items.map((item) => ({
        ...item,
        id: item.id ?? crypto.randomUUID(),
        size: item.size ?? '',
      }))
    }

    console.log(`[${requestId}] process-intake complete itemCount=${Array.isArray(data.items) ? data.items.length : 'unknown'}`)
    return json(extractedData)
  } catch (err) {
    console.error(`[${requestId}] process-intake unhandled error:`, err)
    const message = err instanceof Error ? err.message : String(err)
    return json({ error: message || 'Internal server error' }, 500)
  }
})
