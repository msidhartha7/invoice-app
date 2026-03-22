import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setIsLoading(true)
    setError('')
    try {
      await signIn(email.trim())
      setSent(true)
    } catch (err) {
      setError((err as Error).message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA] flex flex-col justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-sm mx-auto w-full"
      >
        <div className="mb-10">
          <div className="w-12 h-12 bg-[#6C47FF] rounded-2xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-xl select-none">N</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] leading-tight">
            The Niche Invoice
          </h1>
          <p className="text-[#888] mt-2 text-base">
            Invoicing built for creative freelancers.
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-[#1A1A1A]">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AAA] w-5 h-5 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  inputMode="email"
                  className="w-full pl-12 pr-4 h-[56px] rounded-2xl border border-[#E8E8E8] bg-white text-[#1A1A1A] placeholder-[#BBB] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/30 focus:border-[#6C47FF] transition text-base"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="h-[56px] bg-[#6C47FF] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition"
            >
              {isLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  Send Magic Link
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 border border-[#E8E8E8] text-center"
          >
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Check your inbox</h2>
            <p className="text-[#888] text-sm leading-relaxed">
              We sent a magic link to{' '}
              <strong className="text-[#1A1A1A]">{email}</strong>
            </p>
          </motion.div>
        )}

        <p className="text-center text-xs text-[#BBB] mt-8">
          No password. No spam. Ever.
        </p>
      </motion.div>
    </div>
  )
}
