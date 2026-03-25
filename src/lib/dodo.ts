const DODO_CHECKOUT_URL = import.meta.env.VITE_DODO_CHECKOUT_URL ?? ''
const DODO_PLAN_ID = import.meta.env.VITE_DODO_PLAN_ID ?? ''

export function createCheckoutSession(userId: string, email: string): void {
  if (!DODO_CHECKOUT_URL) return

  const url = new URL(DODO_CHECKOUT_URL)
  url.searchParams.set('productId', DODO_PLAN_ID)
  url.searchParams.set('email', email)
  url.searchParams.set('disableEmail', 'true')
  url.searchParams.set('metadata[user_id]', userId)
  url.searchParams.set('redirectUrl', 'https://invoice-app.store')
  window.location.href = url.toString()
}
