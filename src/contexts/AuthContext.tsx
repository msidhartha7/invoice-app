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
    
    console.log(supabase);  
    console.log(await supabase.auth.getSession()) // debug log to check session state

    const { data, error, status } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      // .
      // .maybeSingle()  // handles missing row cleanly

    if (error) {
      console.error('[AuthContext] fetchProfile error', { userId, status, error })
      // for 404 / 406 we may want to continue with null profile, not crash the whole app
      if (status === 406 || status === 404) {
        setProfile(null)
        return null
      }
      throw error // let caller catch unhandled cases
    }

    if (!data) {
      setProfile(null)
      return null
    }

    setProfile(data as Profile)
    return data as Profile
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
            const fetchedProfile = await fetchProfile(session.user.id)
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
