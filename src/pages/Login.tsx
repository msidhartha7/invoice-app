import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true)
    setError('')
    try {
      await signInWithGoogle()
    } catch (err) {
      setError((err as Error).message || 'Something went wrong')
      setIsGoogleLoading(false)
    }
  }

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
    <div className="min-h-[100dvh] bg-[#FAFAFA] flex flex-col">
      <div className="h-[3px] bg-[#6C47FF]" />
      <div className="flex-1 flex flex-col justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-sm mx-auto w-full"
      >
        <div className="mb-10">
          <div className="w-12 h-12 bg-[#6C47FF] rounded-2xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-xl select-none">I</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] leading-tight">
            The Invoice App
          </h1>
          <p className="text-[#888] mt-2 text-base">
            Invoicing built for creative freelancers.
          </p>
        </div>

        {!sent ? (
          <>
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

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[#E8E8E8]" />
            <span className="text-xs text-[#BBB] font-medium">or</span>
            <div className="flex-1 h-px bg-[#E8E8E8]" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full h-[56px] bg-white border border-[#E8E8E8] text-[#1A1A1A] font-semibold rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition hover:bg-[#F5F5F5]"
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-[#6C47FF] border-t-transparent animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </>
            )}
          </button>
          </>
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
    </div>
  )
}
