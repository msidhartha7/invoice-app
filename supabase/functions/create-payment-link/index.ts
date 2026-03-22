import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    const body = (await req.json()) as {
      invoice_id: string
      amount: number
      client_name: string
    }

    const { invoice_id, amount, client_name } = body
    if (!invoice_id || !amount) return json({ error: 'Missing required fields' }, 400)

    const dodoAPIKey = Deno.env.get('DODO_API_KEY')
    let paymentLink: string

    if (!dodoAPIKey) {
      paymentLink = `https://pay.dodopayments.com/mock/${invoice_id}`
    } else {
      const dodoRes = await fetch('https://api.dodopayments.com/payments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${dodoAPIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billing: { amount: Math.round(amount * 100), currency: 'USD' },
          customer: { name: client_name },
          metadata: { invoice_id },
          return_url: `${Deno.env.get('APP_URL') ?? ''}/invoice/sent`,
        }),
      })
      const dodoData = (await dodoRes.json()) as { payment_link: string }
      paymentLink = dodoData.payment_link
    }

    const { error: updateError } = await supabase
      .from('invoices')
      .update({ payment_link: paymentLink, status: 'sent' })
      .eq('id', invoice_id)
      .eq('user_id', user.id)

    if (updateError) throw updateError

    return json({ payment_link: paymentLink })
  } catch (err) {
    console.error('create-payment-link error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})
