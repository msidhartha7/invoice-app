import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ExtractedInvoiceData, Invoice, LineItem } from '../types'

export interface DraftForm {
  clientName: string
  projectName: string
  items: LineItem[]
  discountType: 'percentage' | 'fixed'
  discountValue: number
  deliveryFee: number
}

interface AppState {
  // Invoice creation flow
  extractedData: ExtractedInvoiceData | null
  currentInvoice: Invoice | null
  draftForm: DraftForm | null
  editingInvoiceId: string | null

  // Actions
  setExtractedData: (data: ExtractedInvoiceData | null) => void
  setCurrentInvoice: (invoice: Invoice | null) => void
  setDraftForm: (form: DraftForm) => void
  setEditingInvoiceId: (id: string | null) => void
  initDraftFromExtracted: () => void
  clearInvoiceFlow: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      extractedData: null,
      currentInvoice: null,
      draftForm: null,
      editingInvoiceId: null,

      setExtractedData: (data) => set({ extractedData: data }),
      setCurrentInvoice: (invoice) => set({ currentInvoice: invoice }),
      setDraftForm: (form) => set({ draftForm: form }),
      setEditingInvoiceId: (id) => set({ editingInvoiceId: id }),
      initDraftFromExtracted: () =>
        set((state) => {
          if (state.draftForm || !state.extractedData) return state
          return {
            draftForm: {
              clientName: state.extractedData.client_name || 'John Doe',
              projectName: state.extractedData.project_name ?? '',
              items: state.extractedData.items.map((item) => ({
                ...item,
                id: item.id ?? crypto.randomUUID(),
                quantity: item.quantity || 1,
              })),
              discountType: 'percentage',
              discountValue: 0,
              deliveryFee: state.extractedData.delivery_fee ?? 0,
            },
          }
        }),
      clearInvoiceFlow: () =>
        set({ extractedData: null, currentInvoice: null, draftForm: null, editingInvoiceId: null }),
    }),
    {
      name: 'niche-invoice-app',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        extractedData: state.extractedData,
        currentInvoice: state.currentInvoice,
        draftForm: state.draftForm,
        editingInvoiceId: state.editingInvoiceId,
      }),
    },
  ),
)
