import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../layouts/AppLayout'
import type { Invoice, LineItem, ExtractedInvoiceData } from '../types'

export default function InvoiceReview() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const extracted = (
    location.state?.extractedData ?? { client_name: '', items: [], total: 0 }
  ) as ExtractedInvoiceData

  const [clientName, setClientName] = useState(extracted.client_name)
  const [items, setItems] = useState<LineItem[]>(
    extracted.items.map((item) => ({ ...item, id: item.id ?? crypto.randomUUID() })),
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const total = items.reduce((sum, item) => sum + (item.amount || 0), 0)

  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
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
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0, amount: 0 },
    ])
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  async function handleSave() {
    if (!user || !clientName.trim() || items.length === 0) return
    setIsSaving(true)
    setError('')

    try {
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

      if (insertError) throw insertError

      const savedInvoice = data as Invoice
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData.session

      let paymentLink: string

      if (supabaseUrl && session) {
        const res = await fetch(`${supabaseUrl}/functions/v1/create-payment-link`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invoice_id: savedInvoice.id,
            amount: total,
            client_name: clientName.trim(),
          }),
        })
        const linkData = (await res.json()) as { payment_link: string }
        paymentLink = linkData.payment_link
      } else {
        paymentLink = `https://pay.dodopayments.com/mock/${savedInvoice.id}`
        await supabase
          .from('invoices')
          .update({ payment_link: paymentLink, status: 'sent' })
          .eq('id', savedInvoice.id)
      }

      navigate('/invoice/sent', {
        state: {
          invoice: {
            ...savedInvoice,
            payment_link: paymentLink,
            status: 'sent',
          } satisfies Invoice,
        },
      })
    } catch (err) {
      setError((err as Error).message || 'Failed to save invoice')
      setIsSaving(false)
    }
  }

  const bottomBar = (
    <button
      onClick={handleSave}
      disabled={isSaving || !clientName.trim() || items.length === 0}
      className="w-full h-[56px] bg-[#6C47FF] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition"
    >
      {isSaving ? (
        <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
      ) : (
        `Save & Send · $${total.toFixed(2)}`
      )}
    </button>
  )

  return (
    <AppLayout bottomBar={bottomBar}>
      <div className="px-6 pt-12 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm text-[#888] hover:text-[#1A1A1A] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Review Invoice</h1>

        <div className="mb-6">
          <label className="text-xs font-semibold text-[#888] uppercase tracking-wider block mb-2">
            Client
          </label>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Client name"
            className="w-full h-[56px] px-4 rounded-2xl border border-[#E8E8E8] bg-white text-[#1A1A1A] text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/30 focus:border-[#6C47FF] transition"
          />
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
                  <input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Item description"
                    className="flex-1 text-sm font-medium text-[#1A1A1A] bg-transparent focus:outline-none placeholder-[#BBB]"
                  />
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
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
