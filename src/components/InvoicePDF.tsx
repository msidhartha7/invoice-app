import { Document, Page, Text, View } from '@react-pdf/renderer'
import type { Invoice, Profile } from '../types'
import { formatAmount } from '../lib/currency'

const A4_HEIGHT = 841.89

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

  const subtotal = invoice.items.reduce((sum, i) => sum + (i.amount || 0), 0)
  const discountValue = invoice.discount_value ?? 0
  const discountType = invoice.discount_type
  const discountAmount =
    discountValue > 0 && discountType
      ? discountType === 'percentage'
        ? subtotal * (discountValue / 100)
        : Math.min(discountValue, subtotal)
      : 0
  const afterDiscount = subtotal - discountAmount
  const taxRate = profile?.tax_rate ?? 0
  const taxAmount = afterDiscount * (taxRate / 100)
  const deliveryFee = invoice.delivery_fee ?? 0
  const hasExtras = discountAmount > 0 || taxRate > 0 || deliveryFee > 0

  return (
    <Document>
      <Page
        size="A4"
        style={{
          paddingTop: 40,
          paddingBottom: 60,
          paddingLeft: 52,
          paddingRight: 40,
          backgroundColor: '#FFFFFF',
          fontFamily: 'Helvetica',
        }}
      >
        {/* Blue left strip */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 4,
            height: A4_HEIGHT,
            backgroundColor: '#2563EB',
          }}
        />

        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1A1A1A' }}>
              {businessName}
            </Text>
            {addressParts.map((line, i) => (
              <Text key={i} style={{ fontSize: 8, color: '#6B7280', marginTop: 2 }}>{line}</Text>
            ))}
            {contactParts.map((line, i) => (
              <Text key={i} style={{ fontSize: 8, color: '#6B7280', marginTop: 2 }}>{line}</Text>
            ))}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#9CA3AF' }}>
              I N V O I C E
            </Text>
            <Text style={{ fontSize: 10, color: '#111827', marginTop: 6 }}>{date}</Text>
          </View>
        </View>

        {/* Divider after header */}
        <View style={{ height: 0.5, backgroundColor: '#E5E7EB', marginBottom: 20 }} />

        {/* Bill To */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#9CA3AF', marginBottom: 4 }}>
            B I L L   T O
          </Text>
          <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#111827' }}>
            {invoice.client_name}
          </Text>
          {invoice.project_name ? (
            <Text style={{ fontSize: 9, color: '#6B7280', marginTop: 2 }}>{invoice.project_name}</Text>
          ) : null}
        </View>

        {/* Table header row */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#F3F4F6',
            paddingVertical: 6,
            paddingHorizontal: 4,
          }}
        >
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#6B7280', width: 200 }}>DESCRIPTION</Text>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#6B7280', width: 60 }}>SIZE/SPEC</Text>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#6B7280', width: 40, textAlign: 'right' }}>QTY</Text>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#6B7280', width: 70, textAlign: 'right' }}>RATE</Text>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#6B7280', width: 70, textAlign: 'right' }}>AMOUNT</Text>
        </View>
        {/* Bottom border under header only */}
        <View style={{ height: 0.5, backgroundColor: '#E5E7EB' }} />

        {/* Table rows — zebra striped */}
        {invoice.items.map((item, index) => (
          <View
            key={item.id}
            style={{
              flexDirection: 'row',
              backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
              paddingVertical: 6,
              paddingHorizontal: 4,
            }}
          >
            <Text style={{ fontSize: 9, color: '#374151', width: 200 }}>{item.description}</Text>
            <Text style={{ fontSize: 9, color: '#374151', width: 60 }}>{item.size ?? ''}</Text>
            <Text style={{ fontSize: 9, color: '#374151', width: 40, textAlign: 'right' }}>{String(item.quantity)}</Text>
            <Text style={{ fontSize: 9, color: '#374151', width: 70, textAlign: 'right' }}>{fmt(item.rate)}</Text>
            <Text style={{ fontSize: 9, color: '#374151', width: 70, textAlign: 'right' }}>{fmt(item.amount)}</Text>
          </View>
        ))}

        {/* Totals block — right-aligned, ~200pt wide */}
        <View style={{ alignItems: 'flex-end', marginTop: 16 }}>
          <View style={{ width: 200 }}>
            {hasExtras ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
                <Text style={{ fontSize: 9, color: '#374151' }}>Subtotal</Text>
                <Text style={{ fontSize: 9, color: '#374151' }}>{fmt(subtotal)}</Text>
              </View>
            ) : null}
            {discountAmount > 0 ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
                <Text style={{ fontSize: 9, color: '#374151' }}>
                  {discountType === 'percentage' ? `Discount (${discountValue}%)` : 'Discount'}
                </Text>
                <Text style={{ fontSize: 9, color: '#16A34A' }}>{`-${fmt(discountAmount)}`}</Text>
              </View>
            ) : null}
            {taxRate > 0 ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
                <Text style={{ fontSize: 9, color: '#374151' }}>{`Tax (${taxRate}%)`}</Text>
                <Text style={{ fontSize: 9, color: '#374151' }}>{fmt(taxAmount)}</Text>
              </View>
            ) : null}
            {deliveryFee > 0 ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
                <Text style={{ fontSize: 9, color: '#374151' }}>Delivery Fee</Text>
                <Text style={{ fontSize: 9, color: '#374151' }}>{fmt(deliveryFee)}</Text>
              </View>
            ) : null}
            {/* Divider above Total Due */}
            <View style={{ height: 0.5, backgroundColor: '#E5E7EB', marginVertical: 4 }} />
            {/* Total Due row */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#EFF6FF',
                paddingVertical: 4,
                paddingHorizontal: 4,
              }}
            >
              <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#111827' }}>TOTAL DUE</Text>
              <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#2563EB' }}>
                {fmt(invoice.total_amount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment link */}
        {invoice.payment_link ? (
          <View
            style={{
              marginTop: 24,
              backgroundColor: '#EFF6FF',
              padding: 12,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#2563EB', marginBottom: 4 }}>
              P A Y   O N L I N E
            </Text>
            <Text style={{ fontSize: 9, color: '#374151' }}>{invoice.payment_link}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={{ position: 'absolute', bottom: 24, left: 52, right: 40 }}>
          <View style={{ height: 0.5, backgroundColor: '#E5E7EB', marginBottom: 6 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 8, color: '#9CA3AF' }}>
              {profile?.tax_id ? `Tax ID: ${profile.tax_id}` : ''}
            </Text>
            <Text style={{ fontSize: 8, color: '#9CA3AF' }}>Generated by The Niche Invoice</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
