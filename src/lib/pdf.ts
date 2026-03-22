import { pdf } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import { createElement } from 'react'
import type { ReactElement } from 'react'
import { InvoicePDF } from '../components/InvoicePDF'
import type { Invoice } from '../types'

export async function downloadInvoicePDF(
  invoice: Invoice,
  businessName: string,
): Promise<void> {
  const element = createElement(InvoicePDF, { invoice, businessName }) as ReactElement<DocumentProps>
  const blob = await pdf(element).toBlob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `invoice-${invoice.client_name
    .replace(/\s+/g, '-')
    .toLowerCase()}-${invoice.id.slice(0, 8)}.pdf`
  anchor.click()
  URL.revokeObjectURL(url)
}
