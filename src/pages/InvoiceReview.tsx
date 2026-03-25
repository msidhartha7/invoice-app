import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useRouter, Navigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { supabase, getValidSession } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../layouts/AppLayout'
import { useAppStore } from '../store/appStore'
import type { Invoice, LineItem } from '../types'

export default function InvoiceReview() {
  const navigate = useNavigate()
  const router = useRouter()
  const { user } = useAuth()
  const {
    extractedData,
    draftForm,
    setDraftForm,
    initDraftFromExtracted,
    setCurrentInvoice,
    clearInvoiceFlow,
    editingInvoiceId,
  } = useAppStore()

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const savedInvoiceRef = useRef<Invoice | null>(null)

  useEffect(() => {
    initDraftFromExtracted()
  }, [initDraftFromExtracted])

  if (!extractedData && !draftForm) return <Navigate to="/invoice/new" />

  const clientName = draftForm?.clientName ?? ''
  const items = draftForm?.items ?? []
  const total = useMemo(() => items.reduce((sum, item) => sum + (item.amount || 0), 0), [items])

  function markTouched(field: string) {
    setTouched((prev) => new Set(prev).add(field))
  }

  function setClientName(name: string) {
    if (!draftForm) return
    setDraftForm({ ...draftForm, clientName: name })
  }

  function updateItems(updater: (prev: LineItem[]) => LineItem[]) {
    if (!draftForm) return
    setDraftForm({ ...draftForm, items: updater(draftForm.items) })
  }

  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    updateItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'rate') {
          updated.amount = Number(updated.quantity) * Number(updated.rate)
        }
        return updated
      }),
    )
  }

  function addItem() {
    updateItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0, amount: 0 },
    ])
  }

  function removeItem(id: string) {
    updateItems((prev) => prev.filter((item) => item.id !== id))
  }

  async function createPaymentLink(invoice: Invoice): Promise<string> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    console.log('[InvoiceReview] createPaymentLink: starting for invoice', invoice.id, 'supabaseUrl set=', !!supabaseUrl)
    const session = await getValidSession()
    console.log('[InvoiceReview] createPaymentLink: session valid=', !!session)

    if (supabaseUrl && session) {
      console.log('[InvoiceReview] createPaymentLink: calling edge function...')
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      const res = await fetch(`${supabaseUrl}/functions/v1/create-payment-link`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_id: invoice.id,
          amount: invoice.total_amount,
          client_name: invoice.client_name,
        }),
      })
      console.log('[InvoiceReview] createPaymentLink: response status=', res.status, 'ok=', res.ok)
      if (!res.ok) {
        const errData = (await res.json()) as { error?: string }
        console.error('[InvoiceReview] createPaymentLink: error response', errData)
        throw new Error(errData.error ?? `Payment service error: ${res.status}`)
      }
      const linkData = (await res.json()) as { payment_link?: string }
      console.log('[InvoiceReview] createPaymentLink: success, payment_link=', linkData.payment_link)
      if (!linkData.payment_link) {
        throw new Error('No payment link returned from payment processor')
      }
      return linkData.payment_link
    }

    // Mock fallback
    console.log('[InvoiceReview] createPaymentLink: using mock fallback')
    const paymentLink = `https://pay.dodopayments.com/mock/${invoice.id}`
    await supabase
      .from('invoices')
      .update({ payment_link: paymentLink, status: 'sent' })
      .eq('id', invoice.id)
    return paymentLink
  }

  async function handleSave() {
    if (!user || !clientName.trim() || items.length === 0 || total <= 0) return
    console.log('[InvoiceReview] handleSave: starting, user=', user.id, 'editing=', editingInvoiceId)
    setIsSaving(true)
    setError('')

    try {
      // Edit mode: update existing invoice
      if (editingInvoiceId) {
        const { error: updateError } = await supabase
          .from('invoices')
          .update({
            client_name: clientName.trim(),
            items,
            total_amount: total,
          })
          .eq('id', editingInvoiceId)

        if (updateError) throw updateError
        clearInvoiceFlow()
        navigate({ to: '/invoice/$invoiceId', params: { invoiceId: editingInvoiceId } })
        return
      }

      // Phase 1: Save invoice as draft
      let invoice = savedInvoiceRef.current
      if (!invoice) {
        console.log('[InvoiceReview] handleSave: phase 1 - inserting invoice draft...')
        const { data, error: insertError } = await supabase
          .from('invoices')
          .insert({
            user_id: user.id,
            client_name: clientName.trim(),
            items,
            total_amount: total,
            status: 'draft',
          })
          .select()
          .single()

        if (insertError) {
          console.error('[InvoiceReview] handleSave: phase 1 insert error', insertError)
          throw insertError
        }
        invoice = data as Invoice
        savedInvoiceRef.current = invoice
        console.log('[InvoiceReview] handleSave: phase 1 done, invoice id=', invoice.id)
      } else {
        console.log('[InvoiceReview] handleSave: phase 1 skipped (already saved), invoice id=', invoice.id)
      }

      // Phase 2: Create payment link (best-effort)
      console.log('[InvoiceReview] handleSave: phase 2 - creating payment link...')
      const paymentLink = await createPaymentLink(invoice)
      console.log('[InvoiceReview] handleSave: phase 2 done, paymentLink=', paymentLink)
      const sentInvoice: Invoice = { ...invoice, payment_link: paymentLink, status: 'sent' }
      setCurrentInvoice(sentInvoice)
      clearInvoiceFlow()
      // Restore currentInvoice since clearInvoiceFlow clears it
      useAppStore.getState().setCurrentInvoice(sentInvoice)
      console.log('[InvoiceReview] handleSave: navigating to /invoice/sent')
      navigate({ to: '/invoice/sent' })
    } catch (err) {
      const message = (err as Error).message || 'Failed to save invoice'
      console.error('[InvoiceReview] handleSave: caught error, savedInvoice=', !!savedInvoiceRef.current, 'message=', message)
      if (savedInvoiceRef.current) {
        setError(`Invoice saved, but payment link creation failed. ${message}`)
      } else {
        setError(message)
      }
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!editingInvoiceId) return
    setIsDeleting(true)
    setError('')
    try {
      const { error: deleteError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', editingInvoiceId)
      if (deleteError) throw deleteError
      clearInvoiceFlow()
      navigate({ to: '/dashboard' })
    } catch (err) {
      setError((err as Error).message || 'Failed to delete invoice')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  async function handleRetryPaymentLink() {
    if (!savedInvoiceRef.current) return
    setIsSaving(true)
    setError('')

    try {
      const paymentLink = await createPaymentLink(savedInvoiceRef.current)
      const sentInvoice: Invoice = {
        ...savedInvoiceRef.current,
        payment_link: paymentLink,
        status: 'sent',
      }
      setCurrentInvoice(sentInvoice)
      clearInvoiceFlow()
      useAppStore.getState().setCurrentInvoice(sentInvoice)
      navigate({ to: '/invoice/sent' })
    } catch (err) {
      setError(
        `Invoice saved, but payment link creation failed. ${(err as Error).message || 'Please try again.'}`,
      )
      setIsSaving(false)
    }
  }

  const isDisabled = isSaving || !clientName.trim() || items.length === 0 || total <= 0

  const bottomBar = (
    <>
      {!isSaving && (!clientName.trim() || items.length === 0 || total <= 0) && (
        <p className="text-xs text-center text-[#AAA] mb-2">
          Add a client name, at least one item, and a total above $0 to continue
        </p>
      )}
      <button
        onClick={!editingInvoiceId && savedInvoiceRef.current ? handleRetryPaymentLink : handleSave}
        disabled={isDisabled}
        className="w-full h-[56px] bg-[#6C47FF] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition"
      >
        {isSaving ? (
          <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : editingInvoiceId ? (
          `Save Changes · $${total.toFixed(2)}`
        ) : savedInvoiceRef.current ? (
          'Retry Payment Link'
        ) : (
          `Save & Send · $${total.toFixed(2)}`
        )}
      </button>
    </>
  )

  return (
    <AppLayout bottomBar={bottomBar}>
      <div className="px-6 pt-12 pb-4">
        <button
          onClick={() => router.history.back()}
          className="mb-8 flex items-center gap-2 text-sm text-[#888] hover:text-[#1A1A1A] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            {editingInvoiceId ? 'Edit Invoice' : 'Review Invoice'}
          </h1>
          {editingInvoiceId && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="Delete invoice"
              className="text-[#CCC] hover:text-red-400 active:scale-95 transition p-1"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="mb-6">
          <label className="text-xs font-semibold text-[#888] uppercase tracking-wider block mb-2">
            Client
          </label>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            onBlur={() => markTouched('clientName')}
            placeholder="Client name"
            className="w-full h-[56px] px-4 rounded-2xl border border-[#E8E8E8] bg-white text-[#1A1A1A] text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/30 focus:border-[#6C47FF] transition"
          />
          {touched.has('clientName') && !clientName.trim() && (
            <p className="text-xs text-red-500 mt-1">Client name is required</p>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-[#888] uppercase tracking-wider">
              Items
            </label>
            <button
              onClick={addItem}
              className="flex items-center gap-1 text-xs font-semibold text-[#6C47FF] active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add item
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-3xl border border-[#E8E8E8] p-4"
              >
                <div className="flex items-start gap-2 mb-3">
                  <div className="flex-1">
                    <input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      onBlur={() => markTouched(`item-${item.id}`)}
                      placeholder="Item description"
                      className="w-full text-sm font-medium text-[#1A1A1A] bg-transparent focus:outline-none placeholder-[#BBB]"
                    />
                    {touched.has(`item-${item.id}`) && !item.description.trim() && (
                      <p className="text-xs text-red-500 mt-1">Description is required</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove item"
                    className="text-[#CCC] hover:text-red-400 active:scale-95 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-[#AAA] mb-1">Qty</p>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      className="w-full h-9 px-3 rounded-xl border border-[#E8E8E8] text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#6C47FF]/30 focus:border-[#6C47FF] transition"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-[#AAA] mb-1">Rate ($)</p>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      className="w-full h-9 px-3 rounded-xl border border-[#E8E8E8] text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#6C47FF]/30 focus:border-[#6C47FF] transition"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-[#AAA] mb-1">Amount</p>
                    <p className="h-9 flex items-center text-sm font-semibold text-[#1A1A1A] pl-1">
                      ${item.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-[#6C47FF]/5 rounded-3xl p-5 flex items-center justify-between mb-4">
          <span className="font-semibold text-[#1A1A1A]">Total</span>
          <span className="text-2xl font-bold text-[#6C47FF]">${total.toFixed(2)}</span>
        </div>

        {error && (
          <div
            className={`rounded-2xl p-4 ${savedInvoiceRef.current ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'}`}
          >
            <p
              className={`text-sm ${savedInvoiceRef.current ? 'text-amber-700' : 'text-red-600'}`}
            >
              {error}
            </p>
          </div>
        )}
      </div>
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl p-6 pb-10">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-2">Delete Invoice?</h2>
            <p className="text-sm text-[#888] mb-6">
              This will permanently delete the invoice. This action cannot be undone.
            </p>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full h-[52px] bg-red-500 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition mb-3"
            >
              {isDeleting ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                'Delete Invoice'
              )}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="w-full h-[52px] bg-[#F4F4F4] text-[#1A1A1A] font-semibold rounded-2xl active:scale-95 transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
