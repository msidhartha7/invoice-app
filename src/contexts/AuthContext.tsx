import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

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

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data as Profile | null)
    return data as Profile | null
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id)
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] onAuthStateChange: event=', event, 'user=', session?.user?.id ?? 'null')
        setUser(session?.user ?? null)
        if (session?.user) {
          try {
            console.log('[AuthContext] onAuthStateChange: fetching profile for user=', session.user.id)
            const timeout = new Promise<null>((resolve) =>
              setTimeout(() => {
                console.warn('[AuthContext] onAuthStateChange: profile fetch timed out after 5s')
                resolve(null)
              }, 5000),
            )
            const fetchedProfile = await Promise.race([fetchProfile(session.user.id), timeout])
            console.log('[AuthContext] onAuthStateChange: profile result, is_subscribed=', fetchedProfile?.is_subscribed ?? false)
            _authState = { user: session.user, profile: fetchedProfile }
          } catch (profileErr) {
            console.error('[AuthContext] onAuthStateChange: profile fetch failed', profileErr)
            _authState = { user: session.user, profile: null }
          } finally {
            setIsLoading(false)
            console.log('[AuthContext] onAuthStateChange: resolving _authReadyPromise')
            _authReadyResolve?.()
          }
        } else {
          setProfile(null)
          _authState = { user: null, profile: null }
          setIsLoading(false)
          console.log('[AuthContext] onAuthStateChange: no session, resolving _authReadyPromise')
          _authReadyResolve?.()
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
