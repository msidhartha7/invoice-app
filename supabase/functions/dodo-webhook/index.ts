import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Signs: webhook-id + "." + webhook-timestamp + "." + rawBody
// webhook-signature header is "v1,<base64>"
async function verifySvixSignature(
  secret: string,
  msgId: string,
  timestamp: string,
  rawBody: string,
  signatureHeader: string,
): Promise<boolean> {
  const toSign = `${msgId}.${timestamp}.${rawBody}`
  const secretBytes = Uint8Array.from(atob(secret.replace(/^whsec_/, '')), (c) => c.charCodeAt(0))
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(toSign))
  const computed = btoa(String.fromCharCode(...new Uint8Array(sig)))
  return signatureHeader.split(' ').some((s) => s.replace(/^v1,/, '') === computed)
}

serve(async (req) => {
  try {
    const webhookSecret = Deno.env.get('DODO_WEBHOOK_SECRET')
    const msgId = req.headers.get('webhook-id')
    const timestamp = req.headers.get('webhook-timestamp')
    const signatureHeader = req.headers.get('webhook-signature')
    const rawBody = await req.text()

    if (webhookSecret) {
      if (!msgId || !timestamp || !signatureHeader) {
        return new Response('Unauthorized', { status: 401 })
      }
      const valid = await verifySvixSignature(webhookSecret, msgId, timestamp, rawBody, signatureHeader)
      if (!valid) {
        return new Response('Invalid signature', { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody) as {
      type: string
      data: {
        customer?: { customer_id?: string; email?: string }
        metadata?: { invoice_id?: string }
      }
    }
    const { type, data } = payload
    const customerId = data.customer?.customer_id
    const customerEmail = data.customer?.email

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    switch (type) {
      case 'subscription.active': {
        // Look up user by email, then save dodo_customer_id and activate
        if (customerEmail) {
          const { data: authUser } = await supabase.auth.admin.listUsers()
          const match = authUser?.users?.find((u) => u.email === customerEmail)
          if (match) {
            await supabase
              .from('profiles')
              .update({ is_subscribed: true, dodo_customer_id: customerId })
              .eq('id', match.id)
          }
        }
        break
      }

      case 'subscription.renewed':
        if (customerId) {
          await supabase
            .from('profiles')
            .update({ is_subscribed: true })
            .eq('dodo_customer_id', customerId)
        }
        break

      case 'subscription.cancelled':
      case 'subscription.failed':
        if (customerId) {
          await supabase
            .from('profiles')
            .update({ is_subscribed: false })
            .eq('dodo_customer_id', customerId)
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
