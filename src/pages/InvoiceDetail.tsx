import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { getRouteApi } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, Link as LinkIcon, Download } from 'lucide-react'
import { AppLayout } from '../layouts/AppLayout'
import { downloadInvoicePDF } from '../lib/pdf'
import { useAuth } from '../contexts/AuthContext'

const routeApi = getRouteApi('/invoice/$invoiceId')

const STATUS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-600',
  paid: 'bg-green-100 text-green-600',
}

export default function InvoiceDetail() {
  const router = useRouter()
  const { invoice } = routeApi.useLoaderData()
  const { profile } = useAuth()
  const [copied, setCopied] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const date = new Date(invoice.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  async function handleCopyLink() {
    if (!invoice.payment_link) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice for ${invoice.client_name}`,
          url: invoice.payment_link,
        })
        return
      } catch {
        // User dismissed share sheet — fall through to clipboard copy
      }
    }

    try {
      await navigator.clipboard.writeText(invoice.payment_link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
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
    setPdfLoading(true)
    try {
      await downloadInvoicePDF(invoice, profile?.business_name ?? 'My Business')
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="px-6 pt-12 pb-8">
        {/* Back button */}
        <button
          onClick={() => router.history.back()}
          className="flex items-center gap-1.5 text-[#888] mb-6 active:opacity-60 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-[#1A1A1A] truncate">{invoice.client_name}</h1>
              <p className="text-sm text-[#AAA] mt-1">{date}</p>
            </div>
            <span
              className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize mt-1 flex-shrink-0 ${STATUS[invoice.status] ?? 'bg-gray-100 text-gray-600'}`}
            >
              {invoice.status}
            </span>
          </div>

          {/* Line items */}
          <div className="bg-white rounded-3xl border border-[#E8E8E8] overflow-hidden">
            <div className="px-5 pt-4 pb-2">
              <p className="text-xs font-semibold text-[#AAA] uppercase tracking-wider mb-3">
                Items
              </p>
              <div className="flex flex-col gap-3">
                {invoice.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A]">{item.description}</p>
                      <p className="text-xs text-[#AAA] mt-0.5">
                        {item.quantity} × ${item.rate.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[#1A1A1A] flex-shrink-0">
                      ${item.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-[#E8E8E8] px-5 py-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#888]">Total</p>
              <p className="text-lg font-bold text-[#1A1A1A]">${invoice.total_amount.toFixed(2)}</p>
            </div>
          </div>

          {/* Payment link */}
          {invoice.payment_link && (
            <div className="bg-white rounded-3xl border border-[#E8E8E8] p-5">
              <p className="text-xs font-semibold text-[#AAA] uppercase tracking-wider mb-2">
                Payment Link
              </p>
              <p className="text-xs text-[#1A1A1A] font-mono break-all leading-relaxed">
                {invoice.payment_link}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {invoice.payment_link && (
              <button
                onClick={handleCopyLink}
                className="h-[56px] bg-[#6C47FF] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <LinkIcon className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Payment Link'}
              </button>
            )}

            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
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
