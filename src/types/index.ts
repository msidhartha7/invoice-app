export interface Profile {
  id: string
  is_subscribed: boolean
  business_name: string | null
  dodo_customer_id: string | null
  created_at: string
}

export interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface Invoice {
  id: string
  user_id: string
  client_name: string
  items: LineItem[]
  total_amount: number
  status: 'draft' | 'sent' | 'paid'
  payment_link: string | null
  created_at: string
}

export interface ExtractedInvoiceData {
  client_name: string
  items: LineItem[]
  total: number
}
