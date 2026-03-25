import { useState, useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { ArrowLeft, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../layouts/AppLayout'

const CURRENCIES = [
  { code: 'USD', label: 'USD — US Dollar ($)' },
  { code: 'EUR', label: 'EUR — Euro (€)' },
  { code: 'GBP', label: 'GBP — British Pound (£)' },
  { code: 'CAD', label: 'CAD — Canadian Dollar (CA$)' },
  { code: 'AUD', label: 'AUD — Australian Dollar (A$)' },
  { code: 'INR', label: 'INR — Indian Rupee (₹)' },
  { code: 'JPY', label: 'JPY — Japanese Yen (¥)' },
  { code: 'CHF', label: 'CHF — Swiss Franc' },
  { code: 'SGD', label: 'SGD — Singapore Dollar (S$)' },
  { code: 'HKD', label: 'HKD — Hong Kong Dollar (HK$)' },
  { code: 'NZD', label: 'NZD — New Zealand Dollar (NZ$)' },
  { code: 'MXN', label: 'MXN — Mexican Peso (MX$)' },
  { code: 'BRL', label: 'BRL — Brazilian Real (R$)' },
  { code: 'ZAR', label: 'ZAR — South African Rand (R)' },
  { code: 'AED', label: 'AED — UAE Dirham' },
  { code: 'SEK', label: 'SEK — Swedish Krona (kr)' },
  { code: 'NOK', label: 'NOK — Norwegian Krone (kr)' },
  { code: 'DKK', label: 'DKK — Danish Krone (kr)' },
  { code: 'KRW', label: 'KRW — South Korean Won (₩)' },
  { code: 'THB', label: 'THB — Thai Baht (฿)' },
]

interface FormState {
  business_name: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  business_email: string
  tax_id: string
  tax_rate: string
  currency: string
  website: string
}

export default function BusinessProfile() {
  const router = useRouter()
  const { user, profile, refreshProfile } = useAuth()

  const [form, setForm] = useState<FormState>({
    business_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
    business_email: '',
    tax_id: '',
    tax_rate: '',
    currency: 'USD',
    website: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile) {
      setForm({
        business_name: profile.business_name ?? '',
        address_line1: profile.address_line1 ?? '',
        address_line2: profile.address_line2 ?? '',
        city: profile.city ?? '',
        state: profile.state ?? '',
        zip: profile.zip ?? '',
        country: profile.country ?? '',
        phone: profile.phone ?? '',
        business_email: profile.business_email ?? '',
        tax_id: profile.tax_id ?? '',
        tax_rate: profile.tax_rate != null ? String(profile.tax_rate) : '',
        currency: profile.currency ?? 'USD',
        website: profile.website ?? '',
      })
    }
  }, [profile])

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!user) return
    setIsSaving(true)
    setError('')
    setSaved(false)

    const { error: updateError } = await supabase.from('profiles').update({
      business_name: form.business_name.trim() || null,
      address_line1: form.address_line1.trim() || null,
      address_line2: form.address_line2.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      zip: form.zip.trim() || null,
      country: form.country.trim() || null,
      phone: form.phone.trim() || null,
      business_email: form.business_email.trim() || null,
      tax_id: form.tax_id.trim() || null,
      tax_rate: form.tax_rate.trim() ? parseFloat(form.tax_rate) : null,
      currency: form.currency,
      website: form.website.trim() || null,
    }).eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setIsSaving(false)
      return
    }

    await refreshProfile()
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const inputClass =
    'w-full h-[52px] px-4 rounded-2xl border border-[#E8E8E8] bg-white text-[#1A1A1A] text-base focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/30 focus:border-[#6C47FF] transition'

  const label = (text: string) => (
    <label className="text-xs font-semibold text-[#888] uppercase tracking-wider block mb-2">
      {text}
    </label>
  )

  const bottomBar = (
    <button
      onClick={handleSave}
      disabled={isSaving}
      className="w-full h-[56px] bg-[#6C47FF] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition"
    >
      {isSaving ? (
        <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
      ) : saved ? (
        <>
          <Check className="w-5 h-5" />
          Saved
        </>
      ) : (
        'Save'
      )}
    </button>
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

        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-8">Business Profile</h1>

        {/* Business Info */}
        <section className="mb-6">
          <p className="text-xs font-semibold text-[#6C47FF] uppercase tracking-wider mb-4">Business</p>
          <div className="flex flex-col gap-4">
            <div>
              {label('Business Name')}
              <input
                value={form.business_name}
                onChange={(e) => set('business_name', e.target.value)}
                placeholder="Acme Inc."
                className={inputClass}
              />
            </div>
            <div>
              {label('Website')}
              <input
                value={form.website}
                onChange={(e) => set('website', e.target.value)}
                placeholder="https://acme.com"
                type="url"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="mb-6">
          <p className="text-xs font-semibold text-[#6C47FF] uppercase tracking-wider mb-4">Address</p>
          <div className="flex flex-col gap-4">
            <div>
              {label('Address Line 1')}
              <input
                value={form.address_line1}
                onChange={(e) => set('address_line1', e.target.value)}
                placeholder="123 Main St"
                className={inputClass}
              />
            </div>
            <div>
              {label('Address Line 2')}
              <input
                value={form.address_line2}
                onChange={(e) => set('address_line2', e.target.value)}
                placeholder="Suite 100"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                {label('City')}
                <input
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  placeholder="New York"
                  className={inputClass}
                />
              </div>
              <div>
                {label('State / Province')}
                <input
                  value={form.state}
                  onChange={(e) => set('state', e.target.value)}
                  placeholder="NY"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                {label('ZIP / Postal Code')}
                <input
                  value={form.zip}
                  onChange={(e) => set('zip', e.target.value)}
                  placeholder="10001"
                  className={inputClass}
                />
              </div>
              <div>
                {label('Country')}
                <input
                  value={form.country}
                  onChange={(e) => set('country', e.target.value)}
                  placeholder="USA"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-6">
          <p className="text-xs font-semibold text-[#6C47FF] uppercase tracking-wider mb-4">Contact</p>
          <div className="flex flex-col gap-4">
            <div>
              {label('Phone')}
              <input
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
                type="tel"
                className={inputClass}
              />
            </div>
            <div>
              {label('Business Email')}
              <input
                value={form.business_email}
                onChange={(e) => set('business_email', e.target.value)}
                placeholder="billing@acme.com"
                type="email"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Tax & Currency */}
        <section className="mb-8">
          <p className="text-xs font-semibold text-[#6C47FF] uppercase tracking-wider mb-4">Tax & Currency</p>
          <div className="flex flex-col gap-4">
            <div>
              {label('Tax ID / VAT / GST Number')}
              <input
                value={form.tax_id}
                onChange={(e) => set('tax_id', e.target.value)}
                placeholder="US 12-3456789"
                className={inputClass}
              />
            </div>
            <div>
              {label('Default Tax Rate (%)')}
              <input
                value={form.tax_rate}
                onChange={(e) => set('tax_rate', e.target.value)}
                placeholder="0"
                type="number"
                min="0"
                max="100"
                step="0.1"
                className={inputClass}
              />
            </div>
            <div>
              {label('Currency')}
              <select
                value={form.currency}
                onChange={(e) => set('currency', e.target.value)}
                className="w-full h-[52px] px-4 rounded-2xl border border-[#E8E8E8] bg-white text-[#1A1A1A] text-base focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/30 focus:border-[#6C47FF] transition appearance-none"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl p-4 bg-red-50 border border-red-200 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
