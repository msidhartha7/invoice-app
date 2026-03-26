import { useState, useEffect, useRef, type ReactNode, type CSSProperties } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from '@tanstack/react-router'
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react'

// ─── Shared animation config ──────────────────────────────────────────────────

const ease = [0.16, 1, 0.3, 1] as const

function Reveal({ children, delay = 0, className = '', style }: { children: ReactNode; delay?: number; className?: string; style?: CSSProperties }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

function CountUp({ target, suffix = '', decimals = 0 }: { target: number; suffix?: string; decimals?: number }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })

  useEffect(() => {
    if (!inView) return
    const duration = 1400
    const start = performance.now()
    const easeOut = (t: number) => 1 - (1 - t) ** 3
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      setVal(target * easeOut(p))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target])

  const display = decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString()
  return <span ref={ref}>{display}{suffix}</span>
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FlashBanner() {
  return (
    <motion.div
      initial={{ y: '-100%' }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease }}
      className="flex items-center justify-center gap-2.5 h-11 px-4 sticky top-0 z-[100] text-sm font-medium"
      style={{ background: '#FFF4E0', color: '#8B5000' }}
    >
      <span className="w-2 h-2 rounded-full flex-shrink-0 landing-pulse-dot" style={{ background: '#E53E3E' }} aria-hidden />
      <span className="landing-banner-text">
        Flash Deal — $1/month for 3 months &nbsp;·&nbsp; Offer ends Monday midnight
      </span>
    </motion.div>
  )
}

function Nav({ scrolled, menuOpen, onMenuToggle }: { scrolled: boolean; menuOpen: boolean; onMenuToggle: () => void }) {
  return (
    <nav
      className="sticky top-11 z-[90] h-16 flex items-center px-6 border-b transition-shadow duration-300"
      style={{
        background: 'rgba(247,245,240,0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderColor: 'rgba(13,13,13,0.10)',
        boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      <div className="max-w-[1200px] w-full mx-auto flex items-center justify-between">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-1.5" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: '#0D0D0D' }}>
          <span style={{ color: '#5B4FE8' }} aria-hidden>✦</span>
          The Invoice App
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-7 list-none" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          {['Features', 'How it works', 'Pricing', 'FAQ'].map(label => (
            <li key={label}>
              <a
                href={`#${label.toLowerCase().replace(' ', '-')}`}
                className="text-sm transition-colors duration-150 relative group"
                style={{ color: '#3A3A3A' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#0D0D0D')}
                onMouseLeave={e => (e.currentTarget.style.color = '#3A3A3A')}
              >
                {label}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 group-hover:w-full transition-all duration-200" style={{ background: '#0D0D0D' }} />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-white px-5 py-2 rounded-full transition-all duration-200 landing-btn-shimmer"
            style={{ background: '#5B4FE8', fontFamily: "'DM Sans', system-ui, sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.background = '#4740C7'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(91,79,232,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#5B4FE8'; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}
          >
            Get Started <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            className="md:hidden flex flex-col gap-[5px] p-1"
            onClick={onMenuToggle}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen
              ? <X className="w-5 h-5" style={{ color: '#0D0D0D' }} />
              : <Menu className="w-5 h-5" style={{ color: '#0D0D0D' }} />
            }
          </button>
        </div>
      </div>
    </nav>
  )
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <motion.div
      initial={false}
      animate={open ? { opacity: 1, y: 0, display: 'flex' } : { opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease }}
      className="fixed left-0 right-0 z-[89] flex-col px-6 pt-4 pb-6 border-b"
      style={{
        top: '108px',
        background: 'rgba(247,245,240,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'rgba(13,13,13,0.10)',
        display: open ? 'flex' : 'none',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {['Features', 'How it works', 'Pricing', 'FAQ'].map(label => (
        <a
          key={label}
          href={`#${label.toLowerCase().replace(' ', '-')}`}
          className="block py-3.5 text-[17px] border-b"
          style={{ color: '#3A3A3A', borderColor: 'rgba(13,13,13,0.10)' }}
          onClick={onClose}
        >
          {label}
        </a>
      ))}
      <Link
        to="/login"
        className="mt-4 text-center text-white text-base font-semibold py-3.5 rounded-full"
        style={{ background: '#5B4FE8' }}
        onClick={onClose}
      >
        Get Started →
      </Link>
    </motion.div>
  )
}

function PhoneMockup() {
  return (
    <div className="phone-entrance-wrapper">
      <motion.div
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease }}
      >
        <div className="landing-phone-float relative">
          {/* Glow */}
          <div
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-full landing-phone-glow pointer-events-none"
            style={{ width: 160, height: 24, background: '#5B4FE8', filter: 'blur(22px)' }}
            aria-hidden
          />
          {/* Frame */}
          <div
            className="rounded-[48px] p-3"
            style={{
              width: 300,
              background: '#1A1A1A',
              boxShadow: '0 40px 80px rgba(0,0,0,0.35), 0 0 0 2px #2A2A2A',
            }}
            role="img"
            aria-label="The Invoice App showing invoice list"
          >
            {/* Notch */}
            <div className="w-24 h-6 mx-auto mb-1 rounded-b-2xl" style={{ background: '#1A1A1A' }} aria-hidden />
            {/* Screen */}
            <div className="rounded-[38px] overflow-hidden bg-white">
              {/* Status bar */}
              <div className="flex items-center justify-between px-4 pt-3 pb-1 text-[11px] font-semibold" style={{ color: '#1A1A1A' }} aria-hidden>
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <svg width="14" height="11" viewBox="0 0 16 12" fill="#1A1A1A"><rect x="0" y="8" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="7" rx="0.5"/><rect x="9" y="2" width="3" height="10" rx="0.5"/><rect x="13.5" y="0" width="2.5" height="12" rx="0.5" opacity="0.25"/></svg>
                  <svg width="14" height="11" viewBox="0 0 16 12" fill="#1A1A1A"><circle cx="8" cy="8.5" r="1.5"/><path d="M4.7 6.8C5.8 5.7 6.8 5.1 8 5.1s2.2.6 3.3 1.7l1-1C11 4.4 9.6 3.7 8 3.7S5 4.4 3.7 5.8l1 1z" opacity="0.65"/><path d="M1.6 3.8C3.3 2.1 5.5 1 8 1s4.7 1.1 6.4 2.8l1-1C13.4.9 10.9-.3 8-.3S2.6.9.6 2.8l1 1z" opacity="0.35"/></svg>
                  <svg width="20" height="11" viewBox="0 0 22 12" fill="none"><rect x="0.5" y="0.5" width="17" height="11" rx="2" stroke="#1A1A1A" strokeWidth="1.2"/><rect x="17.5" y="3.5" width="2" height="5" rx="1" fill="#1A1A1A" opacity="0.45"/><rect x="2" y="2" width="13" height="8" rx="1.2" fill="#1A1A1A"/></svg>
                </div>
              </div>
              {/* App header */}
              <div className="px-3.5 pb-3 border-b flex items-center justify-between" style={{ borderColor: '#F0F0F0' }}>
                <div>
                  <div className="text-[15px] font-bold" style={{ color: '#1A1A1A', fontFamily: "'DM Sans', system-ui, sans-serif" }}>The Invoice App</div>
                  <div className="text-[10px]" style={{ color: '#999' }}>5 invoices</div>
                </div>
                <div className="flex gap-2.5" aria-hidden>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </div>
              </div>
              {/* Invoice list */}
              <div className="p-2 pt-3 flex flex-col gap-1.5" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                {[
                  { name: 'John Davies',      amount: '$652.90',    date: 'Mar 26, 2026' },
                  { name: 'John Davies',      amount: '$652.90',    date: 'Mar 25, 2026' },
                  { name: 'John Davies',      amount: '$631.84',    date: 'Mar 25, 2026' },
                  { name: 'Acme Creative Co.',amount: '$1,050.00',  date: 'Mar 25, 2026' },
                  { name: 'Sidhartha',        amount: '$23,614.25', date: 'Mar 25, 2026' },
                ].map((inv, i) => (
                  <div key={i} className="bg-white rounded-[10px] px-3 py-2.5 flex justify-between items-start" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)' }}>
                    <div>
                      <div className="text-[12px] font-semibold" style={{ color: '#1A1A1A' }}>{inv.name}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: '#999' }}>{inv.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[12px] font-bold" style={{ color: '#1A1A1A' }}>{inv.amount}</div>
                      <div className="inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded mt-0.5" style={{ background: '#FFF4E0', color: '#8B5000' }}>Draft</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* New invoice button */}
              <div className="mx-2 mb-6 text-center text-[13px] font-semibold text-white py-2.5 rounded-[22px]" style={{ background: '#5B4FE8', fontFamily: "'DM Sans', system-ui, sans-serif" }} aria-hidden>
                ＋ New Invoice
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────

const faqItems = [
  {
    q: 'How does the photo scan actually work?',
    a: 'You point your camera at any handwritten quote — whether it\'s on a napkin, notepad, or whiteboard. The app uses OCR to read the text and automatically maps it to invoice line items. It takes about 3 seconds.',
  },
  {
    q: 'Do my clients need to download the app to pay?',
    a: 'No. You send them a link. They open it in any browser and pay with card or bank transfer. No app required on their end.',
  },
  {
    q: 'What happens after the 3-month $1 deal?',
    a: 'After 3 months, the subscription becomes $12/month. You\'ll get a reminder before the price changes. Cancel at any time from your account settings — no penalty, no questions.',
  },
  {
    q: 'Can I use my own logo on invoices?',
    a: 'Yes. Upload your logo once in settings and it appears on every invoice automatically.',
  },
  {
    q: 'Is the app available on Android?',
    a: 'Yes — The Invoice App is available on both iOS and Android. Download from the App Store or Google Play.',
  },
  {
    q: 'Is my data secure?',
    a: 'All invoice data is encrypted in transit and at rest. Payment processing uses industry-standard security. We never store your clients\' card details.',
  },
]

// ─── Invoice preview (showcase section) ──────────────────────────────────────

function InvoicePreview() {
  const arrowRef = useRef<SVGPathElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.4 })

  useEffect(() => {
    if (inView && arrowRef.current) {
      arrowRef.current.classList.add('draw')
    }
  }, [inView])

  return (
    <div ref={sectionRef} className="flex flex-col md:flex-row items-center gap-8 max-w-[900px] mx-auto mt-12">
      {/* Before */}
      <Reveal className="flex-1 w-full">
        <span className="inline-block text-[11px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full mb-2.5" style={{ background: '#FFE4E4', color: '#C0392B' }}>Before</span>
        <div
          className="relative rounded-[14px] p-4 pl-12 min-h-[220px]"
          style={{ background: '#FFFEF0', border: '1px solid #E8E8D0', boxShadow: '0 2px 16px rgba(13,13,13,0.08), 0 0 0 1px rgba(13,13,13,0.05)' }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-9 rounded-l-[14px]" style={{ background: '#FFC1CC', borderRight: '2px solid #FFB3C0' }} aria-hidden />
          <div className="absolute left-2.5 top-5 flex flex-col gap-[18px]" aria-hidden>
            {[...Array(5)].map((_, i) => <span key={i} className="w-3.5 h-3.5 rounded-full block" style={{ background: '#F7F5F0', border: '2px solid #DDD' }} />)}
          </div>
          {['client name: John D', 'logo design — 8hrs', 'rate: $80/hr', 'total: $640', 'due: ASAP'].map((line, i) => (
            <div key={i} className="py-2 border-b text-[17px]" style={{ borderColor: '#C8DDF0', fontFamily: "'Caveat', cursive", color: '#2A2A4A', opacity: i === 4 ? 0.45 : 1 }}>
              {line}
            </div>
          ))}
        </div>
      </Reveal>

      {/* Arrow */}
      <Reveal delay={0.2} className="flex flex-col items-center gap-2 flex-shrink-0">
        <span className="text-sm italic" style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: '#5B4FE8', whiteSpace: 'nowrap' }}>10 seconds</span>
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="#5B4FE8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-0 md:rotate-0 rotate-90" aria-hidden>
          <path ref={arrowRef} className="landing-arrow-path" d="M8 26 C10 12 28 8 36 20 C40 26 40 30 38 34 M32 28 L38 34 L44 28" />
        </svg>
      </Reveal>

      {/* After */}
      <Reveal delay={0.3} className="flex-1 w-full">
        <span className="inline-block text-[11px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full mb-2.5" style={{ background: '#E4F5EE', color: '#1A6B4A' }}>After</span>
        <div className="rounded-[22px] p-5 bg-white" style={{ boxShadow: '0 2px 16px rgba(13,13,13,0.08), 0 0 0 1px rgba(13,13,13,0.05)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          <div className="flex justify-between items-start pb-3.5 border-b mb-3.5" style={{ borderColor: 'rgba(13,13,13,0.10)' }}>
            <div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold" style={{ background: '#EAE8FC', color: '#5B4FE8' }}>YB</div>
              <div className="text-[12px] font-bold mt-1" style={{ color: '#0D0D0D' }}>Your Business Name</div>
            </div>
            <div className="text-right text-[11px]" style={{ color: '#7A7A7A' }}>
              <div>Invoice #0042</div>
              <div>Mar 26, 2026</div>
            </div>
          </div>
          <div className="mb-3.5">
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#7A7A7A' }}>Bill to</div>
            <div className="text-[14px] font-semibold" style={{ color: '#0D0D0D' }}>John Davies</div>
          </div>
          <table className="w-full text-[12px] mb-3.5" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Description', 'Qty', 'Rate', 'Amount'].map((h, i) => (
                  <th key={h} className="py-1.5 border-b text-[10px] uppercase tracking-wider font-medium" style={{ borderColor: 'rgba(13,13,13,0.10)', color: '#7A7A7A', textAlign: i === 3 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 border-b" style={{ borderColor: 'rgba(13,13,13,0.08)', color: '#0D0D0D' }}>Logo Design</td>
                <td className="py-2 border-b" style={{ borderColor: 'rgba(13,13,13,0.08)', color: '#0D0D0D' }}>8 hrs</td>
                <td className="py-2 border-b" style={{ borderColor: 'rgba(13,13,13,0.08)', color: '#0D0D0D' }}>$80</td>
                <td className="py-2 border-b text-right" style={{ borderColor: 'rgba(13,13,13,0.08)', color: '#0D0D0D' }}>$640.00</td>
              </tr>
            </tbody>
          </table>
          <div className="flex flex-col gap-1 mb-3.5 text-[12px]">
            {[['Subtotal', '$640.00'], ['Tax (0%)', '$0.00']].map(([l, v]) => (
              <div key={l} className="flex justify-between" style={{ color: '#3A3A3A' }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <div className="flex justify-between text-[14px] font-bold pt-2 border-t-2" style={{ color: '#0D0D0D', borderColor: '#0D0D0D' }}>
              <span>Total</span><span>$640.00</span>
            </div>
          </div>
          <a href="https://invoice-app.store" className="block w-full text-center text-white text-[13px] font-semibold py-2.5 rounded-full" style={{ background: '#5B4FE8' }}>
            Pay Now $640.00
          </a>
        </div>
      </Reveal>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [countdown, setCountdown] = useState({ h: '00', m: '00', s: '00' })
  const underlineRef = useRef<SVGPathElement>(null)
  const underlineTriggered = useRef(false)

  // Nav scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Countdown to Monday midnight
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const midnight = new Date()
      // Advance to the coming Monday (day 1), then set to midnight
      const daysUntilMonday = (8 - now.getDay()) % 7 || 7
      midnight.setDate(now.getDate() + daysUntilMonday)
      midnight.setHours(0, 0, 0, 0)
      let rem = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000))
      const h = Math.floor(rem / 3600); rem %= 3600
      const m = Math.floor(rem / 60); const s = rem % 60
      setCountdown({ h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Body overrides — enable normal scroll/select for marketing page
  useEffect(() => {
    document.body.classList.add('landing-page')
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.body.classList.remove('landing-page')
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  // Underline draw — trigger after hero mounts
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (underlineRef.current && !underlineTriggered.current) {
        underlineRef.current.classList.add('draw')
        underlineTriggered.current = true
      }
    }, 800)
    return () => clearTimeout(timeout)
  }, [])

  const dmSans = { fontFamily: "'DM Sans', system-ui, sans-serif" } as const
  const instrSerif = { fontFamily: "'Instrument Serif', Georgia, serif" } as const

  return (
    <div id="top" style={{ background: '#F7F5F0', ...dmSans }}>
      <FlashBanner />
      <Nav scrolled={scrolled} menuOpen={menuOpen} onMenuToggle={() => setMenuOpen(v => !v)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="min-h-[calc(100dvh-108px)] flex items-center px-6 py-20"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(91,79,232,0.04) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(91,79,232,0.04) 1px, transparent 1px)',
            'radial-gradient(ellipse 800px 600px at 90% 10%, rgba(91,79,232,0.08), transparent)',
          ].join(', '),
          backgroundSize: '32px 32px, 32px 32px, cover',
        }}
      >
        <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[60fr_40fr] gap-10 lg:gap-16 items-center">

          {/* Left */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1, ease }}>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-[0.08em] uppercase px-3.5 py-1.5 rounded-full mb-5" style={{ background: '#EAE8FC', color: '#5B4FE8' }}>
                <span aria-hidden>✦</span> Limited Time · $1/month for 3 months
              </span>
            </motion.div>

            <motion.h1
              className="mb-5 leading-[1.05]"
              style={{ ...instrSerif, fontSize: 'clamp(2.8rem, 6vw, 5rem)', color: '#0D0D0D' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, ease }}
            >
              Snap your quote.<br />
              Send a pro{' '}
              <span className="relative inline-block italic" style={{ color: '#5B4FE8' }}>
                invoice
                <svg className="absolute left-0 w-full overflow-visible" style={{ bottom: -4, height: 8 }} viewBox="0 0 120 8" preserveAspectRatio="none" aria-hidden>
                  <path ref={underlineRef} className="landing-underline-path" d="M2 6 Q30 2 60 5 Q90 8 118 4" />
                </svg>
              </span>.<br />
              Get paid faster.
            </motion.h1>

            <motion.p
              className="text-[18px] leading-relaxed mb-8 max-w-[480px]"
              style={{ color: '#3A3A3A' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35, ease }}
            >
              The Invoice App turns your handwritten quotes into professional invoices — with a payment link and PDF — in under 10 seconds.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45, ease }}
            >
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-base font-semibold text-white px-8 py-4 rounded-full transition-all duration-200 landing-btn-shimmer"
                style={{ background: '#5B4FE8' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#4740C7'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(91,79,232,0.35)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#5B4FE8'; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}
              >
                →&nbsp; Start for $1/month
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 text-[15px] font-medium px-6 py-4 rounded-full border transition-all duration-200"
                style={{ color: '#0D0D0D', borderColor: 'rgba(13,13,13,0.10)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(13,13,13,0.2)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(13,13,13,0.10)' }}
              >
                ▶&nbsp; See how it works
              </a>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-4 mt-5"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55, ease }}
            >
              {['No credit card required to explore', 'Cancel anytime', 'iOS & Android'].map(t => (
                <span key={t} className="flex items-center gap-1 text-[12px]" style={{ color: '#7A7A7A' }}>
                  <span style={{ color: '#1A9E72' }}>✓</span> {t}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: Phone */}
          <div className="flex justify-center items-center order-first lg:order-last">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF STRIP ───────────────────────────────────────────── */}
      <div className="bg-white border-t border-b py-10 px-6" style={{ borderColor: 'rgba(13,13,13,0.10)' }}>
        <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:flex md:justify-around items-center gap-6">
          {[
            { num: null, display: null, countTarget: 12000, suffix: '+', label: 'Invoices sent', decimals: 0 },
            { num: '⚡ <10 sec', label: 'Invoice generation' },
            { num: '💳 Built-in', label: 'Payment links' },
            { num: null, display: null, countTarget: 4.9, suffix: '/5', label: 'App store rating', decimals: 1 },
            { num: '📱 Both', label: 'iOS & Android' },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 0.08} className="text-center px-3 relative">
              <span className="block text-[26px] leading-tight" style={{ ...instrSerif, color: '#0D0D0D' }}>
                {s.countTarget != null
                  ? <CountUp target={s.countTarget} suffix={s.suffix ?? ''} decimals={s.decimals ?? 0} />
                  : s.num
                }
              </span>
              <span className="block text-[13px] mt-1" style={{ color: '#7A7A7A' }}>{s.label}</span>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ─── PROBLEM ──────────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-[1200px] mx-auto">
          <Reveal>
            <h2 className="text-center mb-4 text-[2.5rem] leading-tight" style={{ ...instrSerif, color: '#0D0D0D' }}>
              You're losing time — and money — on paperwork.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-center text-[18px] leading-relaxed max-w-[560px] mx-auto mb-12" style={{ color: '#3A3A3A' }}>
              Every minute spent converting a scribbled quote into a proper invoice is a minute not spent doing the work you're actually paid for.
            </p>
          </Reveal>
          <div className="flex flex-col md:flex-row gap-5 items-stretch">
            {[
              { icon: '📝', title: 'The quote is on a napkin.', body: "You wrote it on site. Professional? Not exactly." },
              { icon: '⏳', title: 'Transcribing takes forever.', body: "Copy it, format it, add line items, do the math. It's 2026 — this shouldn't take 30 minutes." },
              { icon: '💸', title: 'Getting paid is an afterthought.', body: "No payment link = slower cash flow." },
            ].map((card, i) => (
              <div key={i} className="flex-1 flex items-center gap-2">
                <Reveal delay={i * 0.15} className="flex-1">
                  <div className="bg-white rounded-[22px] p-8 h-full" style={{ boxShadow: '0 2px 16px rgba(13,13,13,0.08), 0 0 0 1px rgba(13,13,13,0.05)' }}>
                    <span className="text-3xl block mb-3.5" aria-hidden>{card.icon}</span>
                    <div className="text-[18px] font-semibold mb-2" style={{ color: '#0D0D0D' }}>{card.title}</div>
                    <p className="text-[15px] leading-relaxed" style={{ color: '#3A3A3A' }}>{card.body}</p>
                  </div>
                </Reveal>
                {i < 2 && <span className="hidden md:block text-[20px] opacity-40 flex-shrink-0" style={{ color: '#7A7A7A' }} aria-hidden>→</span>}
              </div>
            ))}
          </div>
          <Reveal delay={0.4}>
            <p className="text-center mt-12 text-[1.6rem] italic" style={{ ...instrSerif, color: '#5B4FE8' }}>There's a better way.</p>
          </Reveal>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-white px-6 py-20">
        <div className="max-w-[1200px] mx-auto">
          <Reveal><h2 className="text-center text-[2.5rem] leading-tight mb-12" style={{ ...instrSerif, color: '#0D0D0D' }}>From scribble to invoice in 3 steps.</h2></Reveal>
          <div className="relative">
            <div className="hidden md:block absolute top-11 border-t-2 border-dashed" style={{ left: '16.67%', right: '16.67%', borderColor: 'rgba(13,13,13,0.10)' }} aria-hidden />
            <div className="flex flex-col md:flex-row gap-10 relative z-10">
              {[
                {
                  n: '01', icon: '📷', title: 'Point. Snap. Done.',
                  body: 'Aim your camera at any handwritten quote or receipt — the app reads it instantly. Or type details in manually.',
                  pills: ['🏗 Contractors: "Quote on-site before you pack up."', '📸 Photographers: "Invoice before you leave the shoot."', '💻 Freelancers: "Turn a chat message into an invoice."'],
                },
                { n: '02', icon: '📋', title: 'A clean invoice appears instantly.', body: 'The app generates a professional invoice automatically. Edit any line item, add your logo, adjust the total. Takes seconds.' },
                { n: '03', icon: '💳', title: 'Share a link. Get paid.', body: 'Every invoice includes a payment link your client can open on their phone. Accept cards, bank transfers. PDF included.' },
              ].map((step, i) => (
                <Reveal key={i} delay={i * 0.15} className="flex-1 text-center">
                  <div className="text-[64px] leading-none opacity-25 mb-[-8px]" style={{ ...instrSerif, color: '#5B4FE8' }} aria-hidden>{step.n}</div>
                  <div className="w-16 h-16 rounded-[14px] flex items-center justify-center text-[26px] mx-auto mb-4" style={{ background: '#EAE8FC' }} aria-hidden>{step.icon}</div>
                  <h3 className="text-[18px] font-bold mb-2.5" style={{ color: '#0D0D0D' }}>{step.title}</h3>
                  <p className="text-[15px] leading-relaxed mb-4" style={{ color: '#3A3A3A' }}>{step.body}</p>
                  {step.pills && (
                    <div className="flex flex-col gap-1.5 items-start text-left">
                      {step.pills.map(p => (
                        <span key={p} className="text-[12px] font-medium px-3 py-1 rounded-full" style={{ background: '#EAE8FC', color: '#5B4FE8' }}>{p}</span>
                      ))}
                    </div>
                  )}
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ────────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-20">
        <div className="max-w-[1200px] mx-auto">
          <Reveal><h2 className="text-center text-[2.5rem] leading-tight mb-12" style={{ ...instrSerif, color: '#0D0D0D' }}>Everything you need to get paid professionally.</h2></Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '📸', title: 'Photo Scan', body: 'Point your camera at any handwritten note. The app reads and converts it in under 3 seconds.' },
              { icon: '✏️', title: 'Manual Input', body: 'Prefer to type? Add line items, quantities, and rates directly. Clean interface, fast entry.' },
              { icon: '🧾', title: 'Auto-Generated Invoices', body: 'Professional, branded invoice created instantly. Looks like you hired a designer.' },
              { icon: '💳', title: 'Built-in Payment Links', body: 'Shareable link so clients pay immediately — from their phone, no app required.' },
              { icon: '📄', title: 'PDF Download', body: 'Client-ready PDF sent to your email or downloaded instantly. Perfect for records.' },
              { icon: '📱', title: 'iOS & Android', body: 'Works beautifully on both platforms. Native performance, not a web app.' },
            ].map((feat, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div
                  className="bg-white rounded-[22px] p-7 h-full transition-all duration-300 cursor-default group"
                  style={{ boxShadow: '0 2px 16px rgba(13,13,13,0.08), 0 0 0 1px rgba(13,13,13,0.05)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(13,13,13,0.12), 0 0 0 1px rgba(13,13,13,0.06)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(13,13,13,0.08), 0 0 0 1px rgba(13,13,13,0.05)' }}
                >
                  <div className="w-14 h-14 rounded-[14px] flex items-center justify-center text-[26px] mb-4" style={{ background: '#EAE8FC' }} aria-hidden>{feat.icon}</div>
                  <h3 className="text-[17px] font-bold mb-2" style={{ color: '#0D0D0D' }}>{feat.title}</h3>
                  <p className="text-[14px] leading-relaxed" style={{ color: '#3A3A3A' }}>{feat.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INVOICE SHOWCASE ─────────────────────────────────────────────── */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-[1200px] mx-auto">
          <Reveal><h2 className="text-center text-[2.5rem] leading-tight mb-3" style={{ ...instrSerif, color: '#0D0D0D' }}>From messy note to polished invoice.</h2></Reveal>
          <Reveal delay={0.1}><p className="text-center text-[18px] mb-0 max-w-[480px] mx-auto" style={{ color: '#3A3A3A' }}>See the transformation — in under 10 seconds.</p></Reveal>
          <InvoicePreview />
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="px-6 py-20 text-center" style={{ background: '#0D0D0D' }}>
        <div className="max-w-[1200px] mx-auto">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-4 py-1.5 rounded-full mb-6 text-white" style={{ background: 'rgba(255,255,255,0.10)' }}>
              ⚡ Flash Deal · Today Only
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-[3.5rem] leading-tight text-white mb-3" style={{ ...instrSerif }}>Try The Invoice App for $1.</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-[18px] max-w-[480px] mx-auto mb-10" style={{ color: 'rgba(255,255,255,0.70)' }}>
              Get 3 full months at $1/month. Then $12/month — cancel anytime.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="max-w-[480px] mx-auto rounded-[32px] p-10" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div className="text-[16px] mb-1" style={{ color: 'rgba(255,100,100,0.85)', textDecoration: 'line-through' }}>$12/month</div>
              <div className="flex items-end justify-center gap-1 mb-7">
                <span className="text-[72px] text-white leading-none" style={{ ...instrSerif }}>$1</span>
                <span className="text-[20px] pb-2.5" style={{ color: 'rgba(255,255,255,0.50)' }}>/month</span>
              </div>
              <ul className="mb-7 list-none text-left">
                {['Unlimited invoices', 'Photo scan — unlimited', 'Built-in payment links', 'PDF download & email', 'iOS & Android apps', 'Cancel anytime'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-[15px] text-white py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                    <span style={{ color: '#1A9E72' }} aria-hidden>✓</span> {item}
                  </li>
                ))}
              </ul>
              <a
                href="https://invoice-app.store"
                className="block w-full text-center text-white font-semibold py-4.5 rounded-full text-[16px] transition-all duration-200 landing-btn-shimmer"
                style={{ background: '#5B4FE8', padding: '18px' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#4740C7'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(91,79,232,0.35)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#5B4FE8'; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}
              >
                Start for $1/month →
              </a>
              <p className="text-[12px] mt-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                🔒 Secure checkout · Cancel anytime · No hidden fees
              </p>
            </div>
          </Reveal>

          {/* Countdown */}
          <Reveal delay={0.4}>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-11">
              <span className="text-[14px]" style={{ color: 'rgba(255,255,255,0.60)' }}>Offer expires in:</span>
              <div className="flex items-center gap-2">
                {[['h', 'Hours'], ['m', 'Mins'], ['s', 'Secs']].map(([key, label], i) => (
                  <div key={key} className="flex items-center gap-2">
                    {i > 0 && <span className="text-[24px]" style={{ ...instrSerif, color: 'rgba(255,255,255,0.40)' }} aria-hidden>:</span>}
                    <div className="rounded-lg px-4 py-3 text-center min-w-[62px]" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <span className="block text-[28px] text-white leading-none" style={{ ...instrSerif }}>{countdown[key as keyof typeof countdown]}</span>
                      <span className="block text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.50)' }}>{label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-[1200px] mx-auto">
          <Reveal><h2 className="text-center text-[2.5rem] leading-tight mb-12" style={{ ...instrSerif, color: '#0D0D0D' }}>Small businesses love The Invoice App.</h2></Reveal>
          <div className="flex flex-col md:flex-row gap-6 overflow-x-auto md:overflow-visible" style={{ scrollSnapType: 'x mandatory' }}>
            {[
              { init: 'MT', name: 'Marcus T.', role: 'Electrical Contractor', quote: "I was invoicing clients from my van on paper for 5 years. This app paid for itself in the first week." },
              { init: 'PS', name: 'Priya S.', role: 'Wedding Photographer', quote: "The photo scan is witchcraft. I point my camera at my notepad, and a beautiful invoice appears. My clients think I have a whole admin team." },
              { init: 'TB', name: 'Tom B.', role: 'Freelance Designer', quote: "Getting paid used to take 2 weeks. Now clients pay the same day because the link is right there in the invoice. Game changer." },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 0.15} className="flex-1 min-w-[280px]" style={{ scrollSnapAlign: 'start' }}>
                <div className="bg-white rounded-[22px] p-7 relative overflow-visible h-full" style={{ boxShadow: '0 2px 16px rgba(13,13,13,0.08), 0 0 0 1px rgba(13,13,13,0.05)' }}>
                  <div className="absolute -top-2 left-5 text-[72px] leading-none pointer-events-none select-none" style={{ ...instrSerif, color: '#EAE8FC' }} aria-hidden>"</div>
                  <div className="text-[16px] mb-3" style={{ color: '#5B4FE8', letterSpacing: 2 }} aria-label="5 stars">★★★★★</div>
                  <p className="text-[15px] leading-[1.65] mb-5" style={{ color: '#3A3A3A' }}>"{t.quote}"</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0" style={{ background: '#EAE8FC', color: '#5B4FE8' }} aria-hidden>{t.init}</div>
                    <div>
                      <div className="text-[14px] font-semibold" style={{ color: '#0D0D0D' }}>{t.name}</div>
                      <div className="text-[12px]" style={{ color: '#7A7A7A' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="bg-white px-6 py-20">
        <div className="max-w-[1200px] mx-auto">
          <Reveal><h2 className="text-center text-[2.5rem] leading-tight mb-12" style={{ ...instrSerif, color: '#0D0D0D' }}>Frequently asked questions.</h2></Reveal>
          <div className="max-w-[700px] mx-auto">
            {faqItems.map((item, i) => (
              <div key={i} className="border-b" style={{ borderColor: 'rgba(13,13,13,0.10)' }}>
                {i === 0 && <div className="border-t" style={{ borderColor: 'rgba(13,13,13,0.10)' }} />}
                <button
                  className="w-full flex items-center justify-between gap-4 py-5 text-left text-[16px] font-semibold"
                  style={{ color: '#0D0D0D' }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  {item.q}
                  <ChevronDown
                    className="w-5 h-5 flex-shrink-0 transition-transform duration-300"
                    style={{ color: '#7A7A7A', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    aria-hidden
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.35, ease }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 text-[15px] leading-relaxed" style={{ color: '#3A3A3A' }}>{item.a}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────────────── */}
      <section
        className="px-6 py-24 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #5B4FE8 0%, #7B6FFF 50%, #4740C7 100%)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '20px 20px' }}
          aria-hidden
        />
        <div className="max-w-[1200px] mx-auto relative">
          <Reveal>
            <h2 className="text-[3rem] leading-tight text-white mb-4" style={{ ...instrSerif }}>Stop losing money to paperwork.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-[18px] leading-relaxed max-w-[500px] mx-auto mb-9" style={{ color: 'rgba(255,255,255,0.80)' }}>
              Join thousands of freelancers, contractors, and photographers who invoice professionally — from their phone.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <a
              href="https://invoice-app.store"
              className="inline-flex items-center gap-2 bg-white font-bold rounded-full text-[18px] px-12 py-5 transition-all duration-200"
              style={{ color: '#5B4FE8' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ''; (e.currentTarget as HTMLElement).style.transform = '' }}
            >
              Get Started for $1/month <ArrowRight className="w-4 h-4" />
            </a>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-5 text-[13px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Today only · $1/month for 3 months · Cancel anytime
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="px-6 py-12" style={{ background: '#0D0D0D' }}>
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between gap-10">
          <div className="max-w-[280px]">
            <div className="text-[18px] text-white mb-2" style={{ ...instrSerif }}>The Invoice App</div>
            <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.50)' }}>
              Snap your quote. Send a pro invoice. Get paid faster.
            </p>
            <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.30)' }}>
              © 2026 The Invoice App · invoice-app.store
            </p>
          </div>
          <div className="flex gap-14">
            {[
              { heading: 'Product', links: [['Features', '#features'], ['How it works', '#how-it-works'], ['Pricing', '#pricing']] },
              { heading: 'Legal', links: [['Privacy Policy', 'https://invoice-app.store/privacy'], ['Terms of Service', 'https://invoice-app.store/terms']] },
            ].map(group => (
              <div key={group.heading}>
                <h4 className="text-[12px] font-bold tracking-[0.1em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.40)' }}>{group.heading}</h4>
                {group.links.map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    className="block text-[13px] mb-2 transition-colors duration-150"
                    style={{ color: 'rgba(255,255,255,0.50)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.90)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.50)')}
                  >
                    {label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
