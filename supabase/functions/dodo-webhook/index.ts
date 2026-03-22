import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

async function verifyHmacSha256(
  secret: string,
  payload: string,
  signature: string,
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  )
  const sigBytes = Uint8Array.from(
    signature.match(/.{2}/g)?.map((b) => parseInt(b, 16)) ?? [],
  )
  return crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(payload))
}

serve(async (req) => {
  try {
    const webhookSecret = Deno.env.get('DODO_WEBHOOK_SECRET')
    const signature = req.headers.get('dodo-signature')
    const rawBody = await req.text()

    if (webhookSecret) {
      if (!signature) {
        return new Response('Unauthorized', { status: 401 })
      }
      const valid = await verifyHmacSha256(webhookSecret, rawBody, signature)
      if (!valid) {
        return new Response('Invalid signature', { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody) as {
      event_type: string
      data: { customer_id?: string; metadata?: { invoice_id?: string } }
    }
    const { event_type, data } = payload

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    switch (event_type) {
      case 'subscription.activated':
      case 'subscription.renewed':
        if (data.customer_id) {
          await supabase
            .from('profiles')
            .update({ is_subscribed: true })
            .eq('dodo_customer_id', data.customer_id)
        }
        break

      case 'subscription.cancelled':
      case 'subscription.failed':
        if (data.customer_id) {
          await supabase
            .from('profiles')
            .update({ is_subscribed: false })
            .eq('dodo_customer_id', data.customer_id)
        }
        break

      case 'payment.completed':
        if (data.metadata?.invoice_id) {
          await supabase
            .from('invoices')
            .update({ status: 'paid' })
            .eq('id', data.metadata.invoice_id)
        }
        break
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('dodo-webhook error:', err)
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
