import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { _authState, waitForAuth } from './contexts/AuthContext'
import { supabase } from './lib/supabase'
import type { Invoice } from './types'
import Landing from './pages/Landing'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfUse from './pages/TermsOfUse'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Login from './pages/Login'
import Paywall from './pages/Paywall'
import Dashboard from './pages/Dashboard'
import NewInvoice from './pages/NewInvoice'
import InvoiceReview from './pages/InvoiceReview'
import InvoiceSent from './pages/InvoiceSent'
import InvoiceDetail from './pages/InvoiceDetail'
import BusinessProfile from './pages/BusinessProfile'

// Dev-only router devtools
const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/router-devtools').then((m) => ({
        default: m.TanStackRouterDevtools,
      })),
    )
  : () => null

const Spinner = () => (
  <div className="min-h-[100dvh] flex items-center justify-center bg-[#FAFAFA]">
    <div className="w-8 h-8 rounded-full border-2 border-[#6C47FF] border-t-transparent animate-spin" />
  </div>
)

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  ),
})

// Public: /landing
const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/landing',
  component: Landing,
})

// Public: /privacy
const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy',
  component: PrivacyPolicy,
})

// Public: /terms
const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: TermsOfUse,
})

// Public: /blog
const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/blog',
  component: Blog,
})

// Public: /blog/:slug
const blogPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/blog/$slug',
  component: BlogPost,
})

// Public: /login
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
})

// Requires auth (no subscription check): /paywall
const paywallRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/paywall',
  beforeLoad: async () => {
    await waitForAuth()
    if (!_authState.user) {
      throw redirect({ to: '/landing' })
    }
  },
  component: Paywall,
})

// Layout route: requires auth + subscription
const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  beforeLoad: async () => {
    console.log('[router] authenticatedRoute.beforeLoad: waiting for auth...')
    await waitForAuth()
    console.log('[router] authenticatedRoute.beforeLoad: auth ready, user=', _authState.user?.id ?? 'null', 'subscribed=', _authState.profile?.is_subscribed ?? false)
    if (!_authState.user) {
      console.log('[router] authenticatedRoute.beforeLoad: no user, redirecting to /landing')
      throw redirect({ to: '/landing' })
    }
    if (!_authState.profile?.is_subscribed) {
      console.log('[router] authenticatedRoute.beforeLoad: not subscribed, redirecting to /paywall')
      throw redirect({ to: '/paywall' })
    }
  },
  pendingComponent: Spinner,
  component: () => <Outlet />,
})

// Dashboard: / (index)
const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  loader: async () => {
    console.log('[router] dashboardRoute.loader: starting, user=', _authState.user?.id ?? 'null')
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', _authState.user!.id)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('[router] dashboardRoute.loader: supabase error', error)
      throw error
    }
    console.log('[router] dashboardRoute.loader: loaded', data?.length ?? 0, 'invoices')
    return { invoices: (data as Invoice[]) ?? [] }
  },
  staleTime: 30_000,
  pendingComponent: Spinner,
  errorComponent: ({ error }) => (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#FAFAFA] px-6">
      <div className="text-center">
        <p className="text-lg font-semibold text-[#1A1A1A] mb-1">Couldn't load invoices</p>
        <p className="text-sm text-[#888]">{(error as Error).message}</p>
      </div>
    </div>
  ),
  component: Dashboard,
})

// Invoice routes
const newInvoiceRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/invoice/new',
  component: NewInvoice,
})

const invoiceReviewRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/invoice/review',
  component: InvoiceReview,
})

const invoiceSentRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/invoice/sent',
  component: InvoiceSent,
})

const invoiceDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/invoice/$invoiceId',
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', params.invoiceId)
      .eq('user_id', _authState.user!.id)
      .single()
    if (error) throw error
    return { invoice: data as Invoice }
  },
  staleTime: 30_000,
  errorComponent: ({ error }) => (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#FAFAFA] px-6">
      <div className="text-center">
        <p className="text-lg font-semibold text-[#1A1A1A] mb-1">Invoice not found</p>
        <p className="text-sm text-[#888]">{(error as Error).message}</p>
      </div>
    </div>
  ),
  component: InvoiceDetail,
})

const businessProfileRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/settings',
  component: BusinessProfile,
})

// Catch-all: redirect to /
const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  beforeLoad: () => {
    throw redirect({ to: '/' })
  },
})

const routeTree = rootRoute.addChildren([
  landingRoute,
  privacyRoute,
  termsRoute,
  blogRoute,
  blogPostRoute,
  loginRoute,
  paywallRoute,
  authenticatedRoute.addChildren([
    dashboardRoute,
    newInvoiceRoute,
    invoiceReviewRoute,
    invoiceSentRoute,
    invoiceDetailRoute,
    businessProfileRoute,
  ]),
  catchAllRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
