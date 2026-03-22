import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AuthGuard } from './components/AuthGuard'
import Login from './pages/Login'
import Paywall from './pages/Paywall'
import Dashboard from './pages/Dashboard'
import NewInvoice from './pages/NewInvoice'
import InvoiceReview from './pages/InvoiceReview'
import InvoiceSent from './pages/InvoiceSent'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/paywall"
            element={
              <AuthGuard requireSubscription={false}>
                <Paywall />
              </AuthGuard>
            }
          />
          <Route
            path="/"
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            }
          />
          <Route
            path="/invoice/new"
            element={
              <AuthGuard>
                <NewInvoice />
              </AuthGuard>
            }
          />
          <Route
            path="/invoice/review"
            element={
              <AuthGuard>
                <InvoiceReview />
              </AuthGuard>
            }
          />
          <Route
            path="/invoice/sent"
            element={
              <AuthGuard>
                <InvoiceSent />
              </AuthGuard>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
