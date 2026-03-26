import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { getRouteApi } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, Link as LinkIcon, Download, Pencil } from 'lucide-react'
import { AppLayout } from '../layouts/AppLayout'
import { downloadInvoicePDF } from '../lib/pdf'
import { useAuth } from '../contexts/AuthContext'
import { useAppStore } from '../store/appStore'
import { formatAmount } from '../lib/currency'
import { getValidSession } from '../lib/supabase'

const routeApi = getRouteApi('/authenticated/invoice/$invoiceId')

const STATUS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-600',
  paid: 'bg-green-100 text-green-600',
}

export default function InvoiceDetail() {
  const navigate = useNavigate()
  const { invoice } = routeApi.useLoaderData()
  const { profile } = useAuth()
  const { setDraftForm, setEditingInvoiceId } = useAppStore()
  const [localInvoice, setLocalInvoice] = useState(invoice)
  const [copied, setCopied] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [linkLoading, setLinkLoading] = useState(false)

  const date = new Date(localInvoice.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  async function handleCreatePaymentLink() {
    setLinkLoading(true)
    try {
      const session = await getValidSession()
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-link`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_id: localInvoice.id,
          amount: localInvoice.total_amount,
          client_name: localInvoice.client_name,
        }),
      })
      const data = (await res.json()) as { payment_link?: string }
      if (data.payment_link) {
        setLocalInvoice((prev) => ({ ...prev, payment_link: data.payment_link!, status: 'sent' }))
      }
    } finally {
      setLinkLoading(false)
    }
  }

  async function handleCopyLink() {
    if (!localInvoice.payment_link) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice for ${localInvoice.client_name}`,
          url: localInvoice.payment_link,
        })
        return
      } catch {
        // User dismissed share sheet — fall through to clipboard copy
      }
    }

    try {
      await navigator.clipboard.writeText(localInvoice.payment_link!)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = localInvoice.payment_link!
      ta.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleEdit() {
    setDraftForm({
      clientName: localInvoice.client_name,
      projectName: localInvoice.project_name ?? '',
      items: localInvoice.items,
      discountType: localInvoice.discount_type ?? 'percentage',
      discountValue: localInvoice.discount_value ?? 0,
      deliveryFee: localInvoice.delivery_fee ?? 0,
    })
    setEditingInvoiceId(localInvoice.id)
    navigate({ to: '/invoice/review' })
  }

  async function handleDownloadPDF() {
    setPdfLoading(true)
    try {
      await downloadInvoicePDF(localInvoice, profile ?? null)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="px-6 pt-12 pb-8">
        {/* Back button */}
        <button
          onClick={() => navigate({ to: '/' })}
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
              <h1 className="text-2xl font-bold text-[#1A1A1A] truncate">{localInvoice.client_name}</h1>
              {localInvoice.project_name && (
                <p className="text-sm text-[#888] mt-0.5 truncate">{localInvoice.project_name}</p>
              )}
              <p className="text-sm text-[#AAA] mt-1">{date}</p>
            </div>
            <span
              className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize mt-1 flex-shrink-0 ${STATUS[localInvoice.status] ?? 'bg-gray-100 text-gray-600'}`}
            >
              {localInvoice.status}
            </span>
          </div>

          {/* Line items */}
          <div className="bg-white rounded-3xl border border-[#E8E8E8] overflow-hidden">
            <div className="px-5 pt-4 pb-2">
              <p className="text-xs font-semibold text-[#AAA] uppercase tracking-wider mb-3">
                Items
              </p>
              <div className="flex flex-col gap-3">
                {localInvoice.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A]">{item.description}</p>
                      {item.size && (
                        <p className="text-xs text-[#888] mt-0.5">{item.size}</p>
                      )}
                      <p className="text-xs text-[#AAA] mt-0.5">
                        {item.quantity} × {formatAmount(item.rate, profile?.currency ?? 'USD')}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[#1A1A1A] flex-shrink-0">
                      {formatAmount(item.amount, profile?.currency ?? 'USD')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-[#E8E8E8] px-5 py-4 flex flex-col gap-1.5">
              {(() => {
                const cur = profile?.currency ?? 'USD'
                const subtotal = localInvoice.items.reduce((s, i) => s + (i.amount || 0), 0)
                const discountValue = localInvoice.discount_value ?? 0
                const discountType = localInvoice.discount_type
                const discountAmount = discountValue > 0 && discountType
                  ? discountType === 'percentage' ? subtotal * (discountValue / 100) : Math.min(discountValue, subtotal)
                  : 0
                const afterDiscount = subtotal - discountAmount
                const taxRate = profile?.tax_rate ?? 0
                const taxAmount = afterDiscount * (taxRate / 100)
                const deliveryFee = localInvoice.delivery_fee ?? 0
                const hasExtras = discountAmount > 0 || taxRate > 0 || deliveryFee > 0
                return (
                  <>
                    {hasExtras && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#AAA]">Subtotal</p>
                        <p className="text-xs text-[#888]">{formatAmount(subtotal, cur)}</p>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#AAA]">
                          Discount{discountType === 'percentage' ? ` (${discountValue}%)` : ''}
                        </p>
                        <p className="text-xs text-green-600">−{formatAmount(discountAmount, cur)}</p>
                      </div>
                    )}
                    {taxRate > 0 && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#AAA]">Tax ({taxRate}%)</p>
                        <p className="text-xs text-[#888]">{formatAmount(taxAmount, cur)}</p>
                      </div>
                    )}
                    {deliveryFee > 0 && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#AAA]">Delivery Fee</p>
                        <p className="text-xs text-[#888]">{formatAmount(deliveryFee, cur)}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-semibold text-[#888]">Total</p>
                      <p className="text-lg font-bold text-[#1A1A1A]">{formatAmount(localInvoice.total_amount, cur)}</p>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>

          {/* Paid section */}
          {localInvoice.status === 'paid' && localInvoice.payment_id && (
            <div className="bg-green-50 rounded-3xl border border-green-100 p-5">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">
                Payment Received
              </p>
              <p className="text-xs text-[#1A1A1A] font-mono break-all leading-relaxed">
                {localInvoice.payment_id}
              </p>
            </div>
          )}

          {/* Payment link */}
          {localInvoice.payment_link && (
            <div className="bg-white rounded-3xl border border-[#E8E8E8] p-5">
              <p className="text-xs font-semibold text-[#AAA] uppercase tracking-wider mb-2">
                Payment Link
              </p>
              <p className="text-xs text-[#1A1A1A] font-mono break-all leading-relaxed">
                {localInvoice.payment_link}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {!localInvoice.payment_link && (
              <button
                onClick={handleCreatePaymentLink}
                disabled={linkLoading}
                className="h-[56px] bg-[#6C47FF] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95 transition"
              >
                {linkLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <LinkIcon className="w-4 h-4" />
                )}
                {linkLoading ? 'Creating...' : 'Create Payment Link'}
              </button>
            )}

            {localInvoice.payment_link && (
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

            <button
              onClick={handleEdit}
              className="h-[56px] bg-white border border-[#E8E8E8] text-[#1A1A1A] font-semibold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Pencil className="w-4 h-4" />
              Edit Bill
            </button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}
