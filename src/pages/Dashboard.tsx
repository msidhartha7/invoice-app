import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, FileText, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../layouts/AppLayout'
import { InvoiceCard } from '../components/InvoiceCard'
import type { Invoice } from '../types'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setInvoices((data as Invoice[]) ?? [])
      })
      .then(
        () => setIsLoading(false),
        () => setIsLoading(false),
      )
  }, [user])

  const bottomBar = (
    <button
      onClick={() => navigate('/invoice/new')}
      className="w-full h-[56px] bg-[#6C47FF] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition"
    >
      <Plus className="w-5 h-5" />
      New Invoice
    </button>
  )

  return (
    <AppLayout bottomBar={bottomBar}>
      <div className="px-6 pt-12 pb-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">
              {profile?.business_name ?? 'My Invoices'}
            </h1>
            <p className="text-sm text-[#888] mt-0.5">
              {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={signOut}
            aria-label="Sign out"
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#F0F0F0] text-[#888] active:scale-95 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-[#6C47FF] border-t-transparent animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 bg-[#6C47FF]/10 rounded-3xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-[#6C47FF]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">No invoices yet</h3>
            <p className="text-sm text-[#888]">Tap "New Invoice" below to get started</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            {invoices.map((invoice, i) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <InvoiceCard invoice={invoice} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
