import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Invoice, Profile } from '../types'

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', CAD: 'CA$', AUD: 'A$',
  INR: '₹', JPY: '¥', CHF: 'CHF ', SGD: 'S$', HKD: 'HK$',
  NZD: 'NZ$', MXN: 'MX$', BRL: 'R$', ZAR: 'R', AED: 'AED ',
  SEK: 'kr', NOK: 'kr', DKK: 'kr', KRW: '₩', THB: '฿',
}

function sym(currency: string) {
  return CURRENCY_SYMBOLS[currency] ?? `${currency} `
}

const s = StyleSheet.create({
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
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: 'right' },
  colRate: { flex: 1.5, textAlign: 'right' },
  colAmt: { flex: 1.5, textAlign: 'right' },
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
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
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
})

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
  const currencySymbol = sym(currency)
  const businessName = profile?.business_name ?? 'My Business'

  // Build address string
  const addressParts = [
    profile?.address_line1,
    profile?.address_line2,
    [profile?.city, profile?.state, profile?.zip].filter(Boolean).join(', '),
    profile?.country,
  ].filter(Boolean)

  // Build contact string
  const contactParts = [
    profile?.phone,
    profile?.business_email,
    profile?.website,
  ].filter(Boolean)

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
            <Text style={[s.brandMeta, { marginTop: 8, textAlign: 'right' }]}>{date}</Text>
          </View>
        </View>

        <View style={s.clientBlock}>
          <Text style={s.sectionLabel}>Bill To</Text>
          <Text style={s.clientName}>{invoice.client_name}</Text>
        </View>

        <View style={s.tableHead}>
          <Text style={[s.tableHeadText, s.colDesc]}>Description</Text>
          <Text style={[s.tableHeadText, s.colQty]}>Qty</Text>
          <Text style={[s.tableHeadText, s.colRate]}>Rate</Text>
          <Text style={[s.tableHeadText, s.colAmt]}>Amount</Text>
        </View>

        {invoice.items.map((item) => (
          <View key={item.id} style={s.row}>
            <Text style={[s.cell, s.colDesc]}>{item.description}</Text>
            <Text style={[s.cell, s.colQty]}>{item.quantity}</Text>
            <Text style={[s.cell, s.colRate]}>{currencySymbol}{item.rate.toFixed(2)}</Text>
            <Text style={[s.cell, s.colAmt]}>{currencySymbol}{item.amount.toFixed(2)}</Text>
          </View>
        ))}

        <View style={s.totalRow}>
          <Text style={s.totalLabel}>TOTAL DUE</Text>
          <Text style={s.totalValue}>{currencySymbol}{invoice.total_amount.toFixed(2)}</Text>
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
