import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ExtractedInvoiceData, Invoice } from '../types'

interface AppState {
  // Invoice creation flow
  extractedData: ExtractedInvoiceData | null
  currentInvoice: Invoice | null

  // Dashboard cache
  dashboardInvoices: Invoice[]
  dashboardFetchedAt: number | null

  // Actions
  setExtractedData: (data: ExtractedInvoiceData | null) => void
  setCurrentInvoice: (invoice: Invoice | null) => void
  clearInvoiceFlow: () => void
  setDashboardInvoices: (invoices: Invoice[]) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      extractedData: null,
      currentInvoice: null,
      dashboardInvoices: [],
      dashboardFetchedAt: null,

      setExtractedData: (data) => set({ extractedData: data }),
      setCurrentInvoice: (invoice) => set({ currentInvoice: invoice }),
      clearInvoiceFlow: () => set({ extractedData: null, currentInvoice: null }),
      setDashboardInvoices: (invoices) =>
        set({ dashboardInvoices: invoices, dashboardFetchedAt: Date.now() }),
    }),
    {
      name: 'niche-invoice-app',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist data, not actions
      partialize: (state) => ({
        extractedData: state.extractedData,
        currentInvoice: state.currentInvoice,
        dashboardInvoices: state.dashboardInvoices,
        dashboardFetchedAt: state.dashboardFetchedAt,
      }),
    },
  ),
)
