import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { SEO, SITE_URL } from '../components/SEO'

const instrSerif = { fontFamily: "'Instrument Serif', Georgia, serif" } as const
const dmSans = { fontFamily: "'DM Sans', system-ui, sans-serif" } as const

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-[1.5rem] mb-3" style={{ ...instrSerif, color: '#0D0D0D' }}>{title}</h2>
      <div className="text-[15px] leading-[1.75]" style={{ color: '#3A3A3A' }}>
        {children}
      </div>
    </section>
  )
}

export default function PrivacyPolicy() {
  useEffect(() => {
    document.body.classList.add('landing-page')
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.body.classList.remove('landing-page')
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  return (
    <>
      <SEO
        title="Privacy Policy"
        description="Read The Invoice App's Privacy Policy. Learn how we collect, use, and protect your data."
        canonical={`${SITE_URL}/privacy`}
        noindex={false}
      />
    <div style={{ background: '#F7F5F0', minHeight: '100dvh', ...dmSans }}>
      {/* Nav */}
      <nav
        className="sticky top-0 z-[90] h-16 flex items-center px-6 border-b"
        style={{
          background: 'rgba(247,245,240,0.90)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderColor: 'rgba(13,13,13,0.10)',
        }}
      >
        <div className="max-w-[800px] w-full mx-auto flex items-center justify-between">
          <Link
            to="/landing"
            className="flex items-center gap-1.5"
            style={{ ...instrSerif, fontSize: 20, color: '#0D0D0D' }}
          >
            <span style={{ color: '#5B4FE8' }} aria-hidden>✦</span>
            The Invoice App
          </Link>
          <Link
            to="/landing"
            className="text-[13px] transition-colors duration-150"
            style={{ color: '#5B4FE8' }}
          >
            ← Back
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="px-6 py-16">
        <div className="max-w-[800px] mx-auto">
          <p className="text-[13px] font-semibold tracking-[0.08em] uppercase mb-3" style={{ color: '#5B4FE8' }}>Legal</p>
          <h1 className="text-[3rem] leading-tight mb-2" style={{ ...instrSerif, color: '#0D0D0D' }}>Privacy Policy</h1>
          <p className="text-[14px] mb-12" style={{ color: '#7A7A7A' }}>Last updated: March 26, 2026</p>

          <div
            className="rounded-[22px] bg-white p-10"
            style={{ boxShadow: '0 2px 16px rgba(13,13,13,0.06), 0 0 0 1px rgba(13,13,13,0.05)' }}
          >
            <Section title="Overview">
              <p>
                The Invoice App ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service at invoice-app.store.
              </p>
            </Section>

            <Section title="Information We Collect">
              <p className="mb-3">We collect information you provide directly to us:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Account information:</strong> email address and password when you create an account.</li>
                <li><strong>Business profile:</strong> your business name, address, tax ID, and logo that you add to invoices.</li>
                <li><strong>Invoice data:</strong> client names, amounts, line items, and any images you upload to generate invoices.</li>
                <li><strong>Payment information:</strong> we use Stripe to process payments. We do not store your full card details — Stripe handles that directly.</li>
              </ul>
              <p className="mt-3">We also collect certain information automatically:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Device type, browser, and operating system.</li>
                <li>IP address and approximate location.</li>
                <li>Pages visited and features used within the app.</li>
              </ul>
            </Section>

            <Section title="How We Use Your Information">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>To provide, operate, and improve the service.</li>
                <li>To generate PDF invoices and payment links on your behalf.</li>
                <li>To process your subscription payments through Stripe.</li>
                <li>To send transactional emails (e.g. invoices forwarded to your clients at your request).</li>
                <li>To respond to your support requests.</li>
                <li>To detect and prevent fraud or abuse.</li>
              </ul>
            </Section>

            <Section title="Sharing Your Information">
              <p className="mb-3">We do not sell your personal data. We share information only in the following circumstances:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Service providers:</strong> Supabase (database and authentication), Stripe (payments), and OpenAI (quote image parsing). Each provider is bound by data processing agreements.</li>
                <li><strong>Legal requirements:</strong> if required by law, court order, or government authority.</li>
                <li><strong>Business transfer:</strong> in connection with a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction.</li>
              </ul>
            </Section>

            <Section title="Data Retention">
              <p>
                We retain your account data for as long as your account is active. Invoice data is retained for as long as you keep it in the app. If you delete your account, we will delete your personal data within 30 days, except where retention is required by law.
              </p>
            </Section>

            <Section title="Security">
              <p>
                We use industry-standard security measures including TLS encryption in transit and encrypted storage at rest. However, no method of transmission over the internet is 100% secure. We encourage you to use a strong, unique password for your account.
              </p>
            </Section>

            <Section title="Your Rights">
              <p className="mb-3">Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Access the personal data we hold about you.</li>
                <li>Correct inaccurate data.</li>
                <li>Request deletion of your data.</li>
                <li>Object to or restrict certain processing.</li>
                <li>Export your data in a portable format.</li>
              </ul>
              <p className="mt-3">To exercise any of these rights, email us at <a href="mailto:privacy@invoice-app.store" className="underline" style={{ color: '#5B4FE8' }}>privacy@invoice-app.store</a>.</p>
            </Section>

            <Section title="Cookies">
              <p>
                We use essential cookies and local storage to keep you signed in and remember your preferences. We do not use third-party advertising cookies. You can disable cookies in your browser settings, though this may affect app functionality.
              </p>
            </Section>

            <Section title="Children's Privacy">
              <p>
                The Invoice App is not directed to children under 13. We do not knowingly collect personal information from children. If we learn we have collected information from a child under 13, we will delete it promptly.
              </p>
            </Section>

            <Section title="Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material changes by email or by a notice within the app. Your continued use of the service after changes take effect constitutes your acceptance of the updated policy.
              </p>
            </Section>

            <Section title="Contact Us">
              <p>
                Questions about this policy? Reach us at <a href="mailto:privacy@invoice-app.store" className="underline" style={{ color: '#5B4FE8' }}>privacy@invoice-app.store</a>.
              </p>
            </Section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-10 mt-4" style={{ background: '#0D0D0D' }}>
        <div className="max-w-[800px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.30)' }}>© 2026 The Invoice App · invoice-app.store</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-[13px] transition-colors duration-150" style={{ color: 'rgba(255,255,255,0.50)' }}>Privacy Policy</Link>
            <Link to="/terms" className="text-[13px] transition-colors duration-150" style={{ color: 'rgba(255,255,255,0.50)' }}>Terms of Use</Link>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}
