import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface AuthGuardProps {
  children: ReactNode
  requireSubscription?: boolean
}

export function AuthGuard({ children, requireSubscription = true }: AuthGuardProps) {
  const { user, profile, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-8 h-8 rounded-full border-2 border-[#6C47FF] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (requireSubscription && !profile?.is_subscribed) return <Navigate to="/paywall" replace />

  return <>{children}</>
}
