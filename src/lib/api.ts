import { supabase } from './supabase'
import type { ExtractedInvoiceData } from '../types'

const MOCK_EXTRACTED: ExtractedInvoiceData = {
  client_name: 'Acme Creative Co.',
  items: [
    {
      id: crypto.randomUUID(),
      description: 'Brand Identity Design',
      quantity: 1,
      rate: 800,
      amount: 800,
    },
    {
      id: crypto.randomUUID(),
      description: 'Social Media Kit (10 templates)',
      quantity: 1,
      rate: 250,
      amount: 250,
    },
    {
      id: crypto.randomUUID(),
      description: 'Rush delivery fee',
      quantity: 1,
      rate: 100,
      amount: 100,
    },
  ],
  total: 1150,
}

export async function processIntake(
  file: File | Blob,
  type: 'image' | 'audio',
): Promise<ExtractedInvoiceData> {
  const { data: sessionData } = await supabase.auth.getSession()
  const session = sessionData.session

  if (!session) throw new Error('Not authenticated')

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  if (!supabaseUrl) {
    await new Promise((resolve) => setTimeout(resolve, 1600))
    return MOCK_EXTRACTED
  }

  const formData = new FormData()
  formData.append('file', file, type === 'image' ? 'photo.jpg' : 'audio.webm')
  formData.append('type', type)

  const response = await fetch(
    `${supabaseUrl}/functions/v1/process-intake`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: formData,
    },
  )

  if (!response.ok) {
    const err = (await response.json()) as { error?: string }
    throw new Error(err.error ?? 'Failed to process intake')
  }

  return response.json() as Promise<ExtractedInvoiceData>
}
