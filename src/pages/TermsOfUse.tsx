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

export default function TermsOfUse() {
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
        title="Terms of Use"
        description="Read The Invoice App's Terms of Use. Understand the rules and conditions for using our invoicing service."
        canonical={`${SITE_URL}/terms`}
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
          <h1 className="text-[3rem] leading-tight mb-2" style={{ ...instrSerif, color: '#0D0D0D' }}>Terms of Use</h1>
          <p className="text-[14px] mb-12" style={{ color: '#7A7A7A' }}>Last updated: March 26, 2026</p>

          <div
            className="rounded-[22px] bg-white p-10"
            style={{ boxShadow: '0 2px 16px rgba(13,13,13,0.06), 0 0 0 1px rgba(13,13,13,0.05)' }}
          >
            <Section title="Acceptance of Terms">
              <p>
                By accessing or using The Invoice App at invoice-app.store ("Service"), you agree to be bound by these Terms of Use ("Terms"). If you do not agree to these Terms, do not use the Service. These Terms form a legally binding agreement between you and The Invoice App ("we", "us", or "our").
              </p>
            </Section>

            <Section title="Description of Service">
              <p>
                The Invoice App is a subscription-based tool that allows freelancers, contractors, and small businesses to create professional invoices, generate payment links, and send PDF invoices to clients. Features include AI-assisted quote parsing, PDF generation, and Stripe-powered payment collection.
              </p>
            </Section>

            <Section title="Account Registration">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>You must be at least 18 years old to create an account.</li>
                <li>You are responsible for providing accurate, complete, and current registration information.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You are responsible for all activity that occurs under your account.</li>
                <li>You must notify us immediately at <a href="mailto:support@invoice-app.store" className="underline" style={{ color: '#5B4FE8' }}>support@invoice-app.store</a> if you suspect unauthorized access to your account.</li>
              </ul>
            </Section>

            <Section title="Subscription and Billing">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>The Service is offered on a monthly subscription basis. Current pricing is displayed at invoice-app.store.</li>
                <li>Promotional pricing (e.g. $1/month for 3 months) applies only to new subscribers during the promotional period and reverts to standard pricing thereafter.</li>
                <li>Subscriptions automatically renew each billing cycle. You may cancel at any time before the renewal date to avoid being charged for the next cycle.</li>
                <li>Payments are processed by Stripe. By subscribing, you agree to Stripe's terms of service.</li>
                <li>All fees are non-refundable except where required by law or as stated in our refund policy.</li>
              </ul>
            </Section>

            <Section title="Acceptable Use">
              <p className="mb-3">You agree not to use the Service to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Violate any applicable law or regulation.</li>
                <li>Create fraudulent invoices or misrepresent your business or identity.</li>
                <li>Transmit spam, malicious code, or any content that is harmful, defamatory, or infringing.</li>
                <li>Attempt to reverse-engineer, scrape, or disrupt the Service or its infrastructure.</li>
                <li>Use the Service to facilitate money laundering, tax evasion, or any other illegal financial activity.</li>
              </ul>
              <p className="mt-3">We reserve the right to suspend or terminate accounts that violate these rules without prior notice.</p>
            </Section>

            <Section title="Your Content">
              <p>
                You retain ownership of all content you upload or create through the Service (invoices, logos, business data). By using the Service, you grant us a limited, non-exclusive license to store and process your content solely to provide the Service to you. We do not use your invoice data for any other purpose.
              </p>
            </Section>

            <Section title="Intellectual Property">
              <p>
                The Service, including its design, code, and branding, is owned by The Invoice App and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works from any part of the Service without our written consent.
              </p>
            </Section>

            <Section title="Third-Party Services">
              <p>
                The Service integrates with third-party providers including Stripe (payments), Supabase (data storage), and OpenAI (AI features). Your use of these integrations is subject to their respective terms of service and privacy policies. We are not responsible for the practices or content of third-party services.
              </p>
            </Section>

            <Section title="Disclaimers">
              <p>
                The Service is provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of viruses. AI-generated invoice parsing may contain errors — you are responsible for reviewing all invoices before sending them to clients.
              </p>
            </Section>

            <Section title="Limitation of Liability">
              <p>
                To the fullest extent permitted by law, The Invoice App shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability to you for any claim arising out of these Terms shall not exceed the amount you paid us in the 3 months preceding the claim.
              </p>
            </Section>

            <Section title="Indemnification">
              <p>
                You agree to indemnify and hold harmless The Invoice App and its affiliates from any claims, damages, or expenses (including legal fees) arising out of your use of the Service, your content, or your violation of these Terms.
              </p>
            </Section>

            <Section title="Termination">
              <p>
                You may cancel your account at any time through the app settings. We may suspend or terminate your access at any time if we believe you have violated these Terms. Upon termination, your right to use the Service ends immediately. Provisions that by their nature should survive termination (including limitation of liability and indemnification) will remain in effect.
              </p>
            </Section>

            <Section title="Governing Law">
              <p>
                These Terms are governed by the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved in the state or federal courts located in Delaware.
              </p>
            </Section>

            <Section title="Changes to These Terms">
              <p>
                We may update these Terms from time to time. We will notify you of material changes by email or by a notice within the app at least 14 days before they take effect. Your continued use of the Service after changes take effect constitutes acceptance of the revised Terms.
              </p>
            </Section>

            <Section title="Contact Us">
              <p>
                Questions about these Terms? Reach us at <a href="mailto:support@invoice-app.store" className="underline" style={{ color: '#5B4FE8' }}>support@invoice-app.store</a>.
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
