import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Check, Zap, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { createCheckoutSession } from '../lib/dodo'

const FEATURES = [
  'AI invoice extraction from photos & voice',
  'Professional PDF generation',
  'Instant client payment links',
  'Unlimited invoices',
  'Invoice history & status tracking',
]

export default function Paywall() {
  const { user, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const isDev = !import.meta.env.VITE_DODO_CHECKOUT_URL

  async function handleSubscribe() {
    if (!user) return
    setIsLoading(true)
    setError('')
    try {
      if (isDev) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_subscribed: true })
          .eq('id', user.id)
        if (updateError) throw updateError
        await refreshProfile()
        navigate({ to: '/' })
      } else {
        createCheckoutSession(user.id, user.email ?? '')
      }
    } catch (err) {
      setError((err as Error).message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA] flex flex-col">
      <div className="h-[3px] bg-[#6C47FF]" />
    <div className="flex-1 flex flex-col justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-sm mx-auto w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-[#6C47FF]/10 text-[#6C47FF] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Zap className="w-3.5 h-3.5" />
            One flat price. No surprises.
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">
            Unlock The Invoice App
          </h1>
          <p className="text-[#888] mt-2">
            Send professional invoices in under 60 seconds.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8E8E8] p-6 shadow-sm mb-4">
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-5xl font-bold text-[#1A1A1A]">$12</span>
            <span className="text-[#888]">/month</span>
          </div>

          <ul className="flex flex-col gap-3 mb-8">
            {FEATURES.map((feat) => (
              <li key={feat} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#6C47FF]/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-[#6C47FF]" />
                </div>
                <span className="text-sm text-[#1A1A1A]">{feat}</span>
              </li>
            ))}
          </ul>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl mb-4">
              {error}
            </p>
          )}

          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full h-[56px] bg-[#6C47FF] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition"
          >
            {isLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : isDev ? (
              '✨ Activate (Dev Mode)'
            ) : (
              'Start Subscription →'
            )}
          </button>

          {isDev && (
            <p className="text-center text-xs text-[#BBB] mt-3">
              Dev mode — skips Dodo Payments checkout
            </p>
          )}
        </div>

        <p className="text-center text-xs text-[#BBB] mb-6">
          Cancel any time. No questions asked.
        </p>

        <button
          onClick={signOut}
          className="mx-auto flex items-center gap-2 text-xs text-[#BBB] hover:text-[#888] transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </motion.div>
    </div>
    </div>
  )
}
