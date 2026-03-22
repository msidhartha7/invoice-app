import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Link as LinkIcon, Download } from 'lucide-react'
import { AppLayout } from '../layouts/AppLayout'
import { downloadInvoicePDF } from '../lib/pdf'
import { useAuth } from '../contexts/AuthContext'
import type { Invoice } from '../types'

export default function InvoiceSent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()
  const [copied, setCopied] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const invoice = location.state?.invoice as Invoice | undefined

  async function handleCopyLink() {
    if (!invoice?.payment_link) return
    try {
      await navigator.clipboard.writeText(invoice.payment_link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for non-HTTPS contexts
      const ta = document.createElement('textarea')
      ta.value = invoice.payment_link
      ta.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleDownloadPDF() {
    if (!invoice) return
    setPdfLoading(true)
    try {
      await downloadInvoicePDF(invoice, profile?.business_name ?? 'My Business')
    } finally {
      setPdfLoading(false)
    }
  }

  const bottomBar = (
    <button
      onClick={() => navigate('/')}
      className="w-full h-[56px] bg-[#1A1A1A] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition"
    >
      <Home className="w-4 h-4" />
      Back to Dashboard
    </button>
  )

  return (
    <AppLayout bottomBar={bottomBar}>
      <div className="px-6 pt-16 pb-4 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-20 h-20 bg-[#6C47FF]/10 rounded-3xl flex items-center justify-center mb-6"
        >
          <span className="text-4xl select-none">🎉</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full"
        >
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Invoice Ready!</h1>
          <p className="text-[#888] text-sm mb-8 leading-relaxed">
            Share the payment link with{' '}
            <strong className="text-[#1A1A1A]">
              {invoice?.client_name ?? 'your client'}
            </strong>{' '}
            to get paid.
          </p>

          {invoice?.payment_link && (
            <div className="w-full bg-white rounded-3xl border border-[#E8E8E8] p-4 mb-4 text-left">
              <p className="text-xs text-[#AAA] mb-2 font-semibold uppercase tracking-wider">
                Payment Link
              </p>
              <p className="text-xs text-[#1A1A1A] font-mono break-all leading-relaxed">
                {invoice.payment_link}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleCopyLink}
              disabled={!invoice?.payment_link}
              className="h-[56px] bg-[#6C47FF] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition"
            >
              <LinkIcon className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Payment Link'}
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={!invoice || pdfLoading}
              className="h-[56px] bg-white border border-[#E8E8E8] text-[#1A1A1A] font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition"
            >
              {pdfLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-[#1A1A1A] border-t-transparent animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download PDF
            </button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
