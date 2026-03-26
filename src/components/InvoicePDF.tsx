import { Document, Page, Text, View } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'
import type { Invoice, Profile } from '../types'
import { formatAmount } from '../lib/currency'

// Plain objects — no StyleSheet.create() to avoid registry ID mismatch
// when Vite bundles multiple copies of @react-pdf/renderer
const s: Record<string, Style> = {
  page: { padding: 48, backgroundColor: '#FFFFFF', fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  brandName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1A1A1A' },
  brandMeta: { fontSize: 9, color: '#888888', marginTop: 3, lineHeight: 1.5 },
  badge: {
    backgroundColor: '#6C47FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontFamily: 'Helvetica-Bold' },
  sectionLabel: {
    fontSize: 8,
    color: '#888888',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  clientBlock: { marginBottom: 36 },
  clientName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#1A1A1A' },
  tableHead: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingBottom: 8,
    marginBottom: 4,
  },
  tableHeadText: {
    fontSize: 8,
    color: '#888888',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cell: { fontSize: 11, color: '#1A1A1A' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#1A1A1A',
  },
  totalLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#1A1A1A' },
  totalValue: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#6C47FF' },
  taxRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  taxLabel: { fontSize: 9, color: '#888888' },
  taxValue: { fontSize: 9, color: '#888888' },
  payBlock: {
    marginTop: 36,
    backgroundColor: '#F5F3FF',
    padding: 14,
    borderRadius: 10,
  },
  payLabel: {
    fontSize: 8,
    color: '#6C47FF',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
  },
  payLink: { fontSize: 10, color: '#1A1A1A' },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 48,
    right: 48,
    textAlign: 'center',
    fontSize: 8,
    color: '#BBBBBB',
  },
}

// Pre-merged column styles to avoid style arrays entirely
const colDesc: Style = { ...s.cell, flex: 3 }
const colSize: Style = { ...s.cell, flex: 1.5, color: '#888888', fontSize: 10 }
const colQty: Style = { ...s.cell, flex: 1, textAlign: 'right' }
const colRate: Style = { ...s.cell, flex: 1.5, textAlign: 'right' }
const colAmt: Style = { ...s.cell, flex: 1.5, textAlign: 'right' }
const thDesc: Style = { ...s.tableHeadText, flex: 3 }
const thSize: Style = { ...s.tableHeadText, flex: 1.5 }
const thQty: Style = { ...s.tableHeadText, flex: 1, textAlign: 'right' }
const thRate: Style = { ...s.tableHeadText, flex: 1.5, textAlign: 'right' }
const thAmt: Style = { ...s.tableHeadText, flex: 1.5, textAlign: 'right' }
const brandMetaRight: Style = { ...s.brandMeta, marginTop: 8, textAlign: 'right' }

interface InvoicePDFProps {
  invoice: Invoice
  profile: Profile | null
}

export function InvoicePDF({ invoice, profile }: InvoicePDFProps) {
  const date = new Date(invoice.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const currency = profile?.currency ?? 'USD'
  const businessName = profile?.business_name ?? 'My Business'
  const fmt = (n: number) => formatAmount(n, currency)

  const addressParts = [
    profile?.address_line1,
    profile?.address_line2,
    [profile?.city, profile?.state, profile?.zip].filter(Boolean).join(', '),
    profile?.country,
  ].filter(Boolean) as string[]

  const contactParts = [
    profile?.phone,
    profile?.business_email,
    profile?.website,
  ].filter(Boolean) as string[]

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text style={s.brandName}>{businessName}</Text>
            {addressParts.map((line, i) => (
              <Text key={i} style={s.brandMeta}>{line}</Text>
            ))}
            {contactParts.map((line, i) => (
              <Text key={i} style={s.brandMeta}>{line}</Text>
            ))}
          </View>
          <View>
            <View style={s.badge}>
              <Text style={s.badgeText}>INVOICE</Text>
            </View>
            <Text style={brandMetaRight}>{date}</Text>
          </View>
        </View>

        <View style={s.clientBlock}>
          <Text style={s.sectionLabel}>Bill To</Text>
          <Text style={s.clientName}>{invoice.client_name}</Text>
          {invoice.project_name ? (
            <Text style={{ ...s.brandMeta, marginTop: 4 }}>{invoice.project_name}</Text>
          ) : null}
        </View>

        <View style={s.tableHead}>
          <Text style={thDesc}>Description</Text>
          <Text style={thSize}>Size / Spec</Text>
          <Text style={thQty}>Qty</Text>
          <Text style={thRate}>Rate</Text>
          <Text style={thAmt}>Amount</Text>
        </View>

        {invoice.items.map((item) => (
          <View key={item.id} style={s.row}>
            <Text style={colDesc}>{item.description}</Text>
            <Text style={colSize}>{item.size ?? ''}</Text>
            <Text style={colQty}>{String(item.quantity)}</Text>
            <Text style={colRate}>{fmt(item.rate)}</Text>
            <Text style={colAmt}>{fmt(item.amount)}</Text>
          </View>
        ))}

        {(() => {
          const subtotal = invoice.items.reduce((sum, i) => sum + (i.amount || 0), 0)
          const discountValue = invoice.discount_value ?? 0
          const discountType = invoice.discount_type
          const discountAmount = discountValue > 0 && discountType
            ? discountType === 'percentage' ? subtotal * (discountValue / 100) : Math.min(discountValue, subtotal)
            : 0
          const afterDiscount = subtotal - discountAmount
          const taxRate = profile?.tax_rate ?? 0
          const taxAmount = afterDiscount * (taxRate / 100)
          const deliveryFee = invoice.delivery_fee ?? 0
          const hasExtras = discountAmount > 0 || taxRate > 0 || deliveryFee > 0
          return (
            <>
              {hasExtras ? (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                  <Text style={s.taxLabel}>Subtotal</Text>
                  <Text style={s.taxValue}>{fmt(subtotal)}</Text>
                </View>
              ) : null}
              {discountAmount > 0 ? (
                <View style={s.taxRow}>
                  <Text style={s.taxLabel}>{discountType === 'percentage' ? `Discount (${discountValue}%)` : 'Discount'}</Text>
                  <Text style={{ ...s.taxValue, color: '#16a34a' }}>{`-${fmt(discountAmount)}`}</Text>
                </View>
              ) : null}
              {taxRate > 0 ? (
                <View style={s.taxRow}>
                  <Text style={s.taxLabel}>{`Tax (${taxRate}%)`}</Text>
                  <Text style={s.taxValue}>{fmt(taxAmount)}</Text>
                </View>
              ) : null}
              {deliveryFee > 0 ? (
                <View style={s.taxRow}>
                  <Text style={s.taxLabel}>Delivery Fee</Text>
                  <Text style={s.taxValue}>{fmt(deliveryFee)}</Text>
                </View>
              ) : null}
            </>
          )
        })()}

        <View style={s.totalRow}>
          <Text style={s.totalLabel}>TOTAL DUE</Text>
          <Text style={s.totalValue}>{fmt(invoice.total_amount)}</Text>
        </View>

        {profile?.tax_id ? (
          <View style={s.taxRow}>
            <Text style={s.taxLabel}>Tax ID</Text>
            <Text style={s.taxValue}>{profile.tax_id}</Text>
          </View>
        ) : null}

        {invoice.payment_link ? (
          <View style={s.payBlock}>
            <Text style={s.payLabel}>Pay Online</Text>
            <Text style={s.payLink}>{invoice.payment_link}</Text>
          </View>
        ) : null}

        <Text style={s.footer}>Generated by The Niche Invoice</Text>
      </Page>
    </Document>
  )
}
