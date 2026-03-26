export interface Profile {
  id: string
  is_subscribed: boolean
  business_name: string | null
  dodo_customer_id: string | null
  created_at: string
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  phone: string | null
  business_email: string | null
  tax_id: string | null
  tax_rate: number | null
  currency: string
  website: string | null
}

export interface LineItem {
  id: string
  description: string
  size?: string
  quantity: number
  rate: number
  amount: number
}

export interface Invoice {
  id: string
  user_id: string
  client_name: string
  project_name: string | null
  items: LineItem[]
  total_amount: number
  discount_type: 'percentage' | 'fixed' | null
  discount_value: number
  delivery_fee: number
  status: 'draft' | 'sent' | 'paid'
  payment_link: string | null
  payment_id: string | null
  created_at: string
}

export interface ExtractedInvoiceData {
  client_name: string
  project_name?: string
  items: LineItem[]
  delivery_fee?: number
  total: number
}
