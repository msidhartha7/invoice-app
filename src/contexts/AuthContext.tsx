import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  signIn: (email: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

// Module-level auth state bridge — readable by TanStack Router's beforeLoad
// without going through React context
export let _authState: { user: User | null; profile: Profile | null } = {
  user: null,
  profile: null,
}

let _authReadyResolve: (() => void) | null = null
const _authReadyPromise = new Promise<void>((resolve) => {
  _authReadyResolve = resolve
})

export function waitForAuth(): Promise<void> {
  return _authReadyPromise
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Raw fetch bypasses supabase.from(), which internally calls auth.getSession()
  // and deadlocks when invoked inside onAuthStateChange (lock contention).
  async function fetchProfile(userId: string, accessToken: string) {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=*&limit=1`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    )
    if (!res.ok) {
      console.error('[AuthContext] fetchProfile HTTP error', res.status)
      return null
    }
    const rows = (await res.json()) as Profile[]
    const data = rows[0] ?? null
    setProfile(data)
    return data
  }

  async function refreshProfile() {
    if (!user) return
    const { data: { session } } = await supabase.auth.getSession()
    if (session) await fetchProfile(user.id, session.access_token)
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] onAuthStateChange: event=', event, 'user=', session?.user?.id ?? 'null')
        setUser(session?.user ?? null)
        if (session?.user) {
          try {
            console.log('[AuthContext] onAuthStateChange: fetching profile for user=', session.user.id)
            const fetchedProfile = await fetchProfile(session.user.id, session.access_token)
            console.log('[AuthContext] onAuthStateChange: profile result, is_subscribed=', fetchedProfile?.is_subscribed ?? false)
            _authState = { user: session.user, profile: fetchedProfile }
          } catch (profileErr) {
            console.error('[AuthContext] onAuthStateChange: profile fetch failed', profileErr)
            _authState = { user: session.user, profile: null }
          } finally {
            setIsLoading(false)
            // Only resolve on INITIAL_SESSION — this is the first stable event after
            // Supabase finishes initialization. SIGNED_IN can fire earlier (e.g. OAuth
            // callback) while a DB trigger is still writing the profile row, causing
            // fetchProfile to hang and return stale data.
            if (event === 'INITIAL_SESSION') {
              console.log('[AuthContext] onAuthStateChange: resolving _authReadyPromise (INITIAL_SESSION)')
              _authReadyResolve?.()
            }
          }
        } else {
          setProfile(null)
          _authState = { user: null, profile: null }
          setIsLoading(false)
          if (event === 'INITIAL_SESSION') {
            console.log('[AuthContext] onAuthStateChange: no session, resolving _authReadyPromise (INITIAL_SESSION)')
            _authReadyResolve?.()
          }
        }
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) throw error
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext value={{ user, profile, isLoading, signIn, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthContext>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
