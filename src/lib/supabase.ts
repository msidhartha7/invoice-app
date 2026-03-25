import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getValidSession() {
  let {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.expires_at && Date.now() / 1000 >= session.expires_at - 60) {
    const { data } = await supabase.auth.refreshSession()
    session = data.session
  }

  return session
}
