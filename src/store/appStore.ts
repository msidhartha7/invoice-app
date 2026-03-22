import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ExtractedInvoiceData, Invoice, LineItem } from '../types'

export interface DraftForm {
  clientName: string
  items: LineItem[]
}

interface AppState {
  // Invoice creation flow
  extractedData: ExtractedInvoiceData | null
  currentInvoice: Invoice | null
  draftForm: DraftForm | null

  // Actions
  setExtractedData: (data: ExtractedInvoiceData | null) => void
  setCurrentInvoice: (invoice: Invoice | null) => void
  setDraftForm: (form: DraftForm) => void
  initDraftFromExtracted: () => void
  clearInvoiceFlow: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      extractedData: null,
      currentInvoice: null,
      draftForm: null,

      setExtractedData: (data) => set({ extractedData: data }),
      setCurrentInvoice: (invoice) => set({ currentInvoice: invoice }),
      setDraftForm: (form) => set({ draftForm: form }),
      initDraftFromExtracted: () =>
        set((state) => {
          if (state.draftForm || !state.extractedData) return state
          return {
            draftForm: {
              clientName: state.extractedData.client_name,
              items: state.extractedData.items.map((item) => ({
                ...item,
                id: item.id ?? crypto.randomUUID(),
              })),
            },
          }
        }),
      clearInvoiceFlow: () =>
        set({ extractedData: null, currentInvoice: null, draftForm: null }),
    }),
    {
      name: 'niche-invoice-app',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        extractedData: state.extractedData,
        currentInvoice: state.currentInvoice,
        draftForm: state.draftForm,
      }),
    },
  ),
)
