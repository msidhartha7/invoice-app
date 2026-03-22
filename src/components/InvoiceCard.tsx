import { useNavigate } from '@tanstack/react-router'
import type { Invoice } from '../types'

const STATUS: Record<Invoice['status'], string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-600',
  paid: 'bg-green-100 text-green-600',
}

export function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const navigate = useNavigate()
  const date = new Date(invoice.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div
      className="bg-white rounded-3xl border border-[#E8E8E8] p-5 cursor-pointer active:scale-[0.98] transition"
      onClick={() => navigate({ to: '/invoice/$invoiceId', params: { invoiceId: invoice.id } })}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1A1A1A] truncate">{invoice.client_name}</p>
          <p className="text-xs text-[#AAA] mt-0.5">{date}</p>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className="text-base font-bold text-[#1A1A1A]">
            ${invoice.total_amount.toFixed(2)}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS[invoice.status]}`}
          >
            {invoice.status}
          </span>
        </div>
      </div>
    </div>
  )
}
