import { useState, useEffect } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, ArrowRight, Clock, Menu, X } from 'lucide-react'
import { articles, type Block } from '../content/blog/articles'
import { SEO, SITE_URL } from '../components/SEO'

const instrSerif = { fontFamily: "'Instrument Serif', Georgia, serif" } as const
const dmSans = { fontFamily: "'DM Sans', system-ui, sans-serif" } as const

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function BlogNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <nav
        className="sticky top-0 z-[90] h-16 flex items-center px-6 border-b transition-shadow duration-300"
        style={{
          background: 'rgba(247,245,240,0.90)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderColor: 'rgba(13,13,13,0.10)',
          boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.08)' : 'none',
          ...dmSans,
        }}
      >
        <div className="max-w-[1200px] w-full mx-auto flex items-center justify-between">
          <Link to="/landing" className="flex items-center gap-1.5" style={{ ...instrSerif, fontSize: 20, color: '#0D0D0D' }}>
            <span style={{ color: '#5B4FE8' }} aria-hidden>✦</span>
            The Invoice App
          </Link>

          <ul className="hidden md:flex items-center gap-7 list-none">
            {[['Features', '/landing#features'], ['How it works', '/landing#how-it-works'], ['Pricing', '/landing#pricing']].map(([label, href]) => (
              <li key={label}>
                <a
                  href={href}
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
            <li>
              <Link
                to="/blog"
                className="text-sm font-semibold transition-colors duration-150"
                style={{ color: '#5B4FE8' }}
              >
                Blog
              </Link>
            </li>
          </ul>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-white px-5 py-2 rounded-full transition-all duration-200"
              style={{ background: '#5B4FE8' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#4740C7'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#5B4FE8'; (e.currentTarget as HTMLElement).style.transform = '' }}
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              className="md:hidden flex items-center p-1"
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X className="w-5 h-5" style={{ color: '#0D0D0D' }} /> : <Menu className="w-5 h-5" style={{ color: '#0D0D0D' }} />}
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div
          className="fixed left-0 right-0 z-[89] flex flex-col px-6 pt-4 pb-6 border-b"
          style={{
            top: 64,
            background: 'rgba(247,245,240,0.97)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(13,13,13,0.10)',
            ...dmSans,
          }}
        >
          {[['Features', '/landing#features'], ['How it works', '/landing#how-it-works'], ['Pricing', '/landing#pricing']].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="block py-3.5 text-[17px] border-b"
              style={{ color: '#3A3A3A', borderColor: 'rgba(13,13,13,0.10)' }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
          <Link
            to="/blog"
            className="block py-3.5 text-[17px] font-semibold border-b"
            style={{ color: '#5B4FE8', borderColor: 'rgba(13,13,13,0.10)' }}
            onClick={() => setMenuOpen(false)}
          >
            Blog
          </Link>
          <Link
            to="/login"
            className="mt-4 text-center text-white text-base font-semibold py-3.5 rounded-full"
            style={{ background: '#5B4FE8' }}
            onClick={() => setMenuOpen(false)}
          >
            Get Started →
          </Link>
        </div>
      )}
    </>
  )
}

function BlogFooter() {
  return (
    <footer className="px-6 py-12" style={{ background: '#0D0D0D', ...dmSans }}>
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between gap-10">
        <div className="max-w-[280px]">
          <div className="text-[18px] text-white mb-2" style={instrSerif}>The Invoice App</div>
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.50)' }}>
            Snap your quote. Send a pro invoice. Get paid faster.
          </p>
          <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.30)' }}>
            © 2026 The Invoice App · invoice-app.store
          </p>
        </div>
        <div className="flex gap-14">
          {[
            { heading: 'Product', links: [['Features', '/landing#features'], ['How it works', '/landing#how-it-works'], ['Pricing', '/landing#pricing']] },
            { heading: 'Company', links: [['Blog', '/blog'], ['Privacy Policy', '/privacy'], ['Terms of Use', '/terms']] },
          ].map(group => (
            <div key={group.heading}>
              <h4 className="text-[12px] font-bold tracking-[0.1em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.40)' }}>{group.heading}</h4>
              {group.links.map(([label, href]) => (
                <Link
                  key={label}
                  to={href as any}
                  className="block text-[13px] mb-2 transition-colors duration-150"
                  style={{ color: 'rgba(255,255,255,0.50)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.90)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.50)')}
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}

function ArticleBlock({ block }: { block: Block }) {
  if (block.type === 'heading') {
    return (
      <h2
        className="text-[1.55rem] leading-snug mt-10 mb-3"
        style={{ ...instrSerif, color: '#0D0D0D' }}
      >
        {block.text}
      </h2>
    )
  }

  if (block.type === 'tldr') {
    return (
      <div
        className="my-8 rounded-[18px] px-7 py-6"
        style={{
          background: 'rgba(91,79,232,0.07)',
          borderLeft: '3px solid #5B4FE8',
        }}
      >
        <p className="text-[12px] font-bold tracking-[0.12em] uppercase mb-2" style={{ color: '#5B4FE8' }}>
          TL;DR
        </p>
        <p className="text-[15px] leading-relaxed font-medium" style={{ color: '#1A1A1A' }}>
          {block.text}
        </p>
      </div>
    )
  }

  return (
    <p className="text-[17px] leading-[1.85] mb-5" style={{ color: '#3A3A3A' }}>
      {block.text}
    </p>
  )
}

function NotFound() {
  return (
    <div style={{ background: '#F7F5F0', minHeight: '100dvh', ...dmSans }}>
      <BlogNav />
      <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
        <p className="text-[4rem] mb-4" aria-hidden>✦</p>
        <h1 className="text-[2rem] mb-3" style={{ ...instrSerif, color: '#0D0D0D' }}>Article not found.</h1>
        <p className="text-[16px] mb-8" style={{ color: '#6A6A6A' }}>That article doesn't exist or may have moved.</p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-[14px] font-semibold px-6 py-3 rounded-full text-white"
          style={{ background: '#5B4FE8' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
      <BlogFooter />
    </div>
  )
}

export default function BlogPost() {
  const { slug } = useParams({ from: '/blog/$slug' })
  const article = articles.find(a => a.slug === slug)

  useEffect(() => {
    document.body.classList.add('landing-page')
    document.documentElement.style.scrollBehavior = 'smooth'
    window.scrollTo(0, 0)
    return () => {
      document.body.classList.remove('landing-page')
      document.documentElement.style.scrollBehavior = ''
    }
  }, [slug])

  if (!article) return <NotFound />

  const relatedArticles = articles
    .filter(a => a.slug !== article.slug && a.category === article.category)
    .slice(0, 2)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishDate,
    url: `${SITE_URL}/blog/${article.slug}`,
    author: {
      '@type': 'Organization',
      name: 'The Invoice App',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Invoice App',
      url: SITE_URL,
    },
    keywords: article.targetKeyword,
    articleSection: article.category,
  }

  return (
    <>
      <SEO
        title={article.title}
        description={article.excerpt}
        canonical={`${SITE_URL}/blog/${article.slug}`}
        ogType="article"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <div style={{ background: '#F7F5F0', minHeight: '100dvh', ...dmSans }}>
        <BlogNav />

        {/* ─── ARTICLE HERO ─────────────────────────────────────────────────── */}
        <div
          className="px-6 pt-12 pb-10 border-b"
          style={{
            borderColor: 'rgba(13,13,13,0.08)',
            backgroundImage: [
              'linear-gradient(rgba(91,79,232,0.03) 1px, transparent 1px)',
              'linear-gradient(90deg, rgba(91,79,232,0.03) 1px, transparent 1px)',
            ].join(', '),
            backgroundSize: '32px 32px',
          }}
        >
          <div className="max-w-[720px] mx-auto">
            {/* Breadcrumb */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium mb-6 transition-colors duration-150"
              style={{ color: '#7A7A7A' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#5B4FE8')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#7A7A7A')}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All articles
            </Link>

            {/* Category */}
            <span
              className="inline-block text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1 rounded-full mb-5"
              style={{ background: 'rgba(91,79,232,0.08)', color: '#5B4FE8' }}
            >
              {article.category}
            </span>

            {/* Title */}
            <h1
              className="text-[2.4rem] md:text-[3rem] leading-[1.1] mb-5"
              style={{ ...instrSerif, color: '#0D0D0D' }}
            >
              {article.title}
            </h1>

            {/* Excerpt */}
            <p className="text-[18px] leading-relaxed mb-6" style={{ color: '#4A4A4A' }}>
              {article.excerpt}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-[13px]" style={{ color: '#9A9A9A' }}>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime} min read
              </div>
              <span>·</span>
              <span>{formatDate(article.publishDate)}</span>
            </div>
          </div>
        </div>

        {/* ─── ARTICLE BODY ─────────────────────────────────────────────────── */}
        <article className="px-6 py-12">
          <div className="max-w-[720px] mx-auto">
            {article.content.map((block, i) => (
              <ArticleBlock key={i} block={block} />
            ))}
          </div>
        </article>

        {/* ─── CTA BAND ─────────────────────────────────────────────────────── */}
        <section
          className="mx-6 mb-14 rounded-[28px] px-8 py-12 text-center"
          style={{ background: 'linear-gradient(135deg, #5B4FE8 0%, #7B6FFF 50%, #4740C7 100%)' }}
        >
          <p className="text-[12px] font-bold tracking-[0.15em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Limited deal
          </p>
          <h2 className="text-[1.8rem] text-white mb-3 leading-tight" style={instrSerif}>
            Try The Invoice App for $1/month.
          </h2>
          <p className="text-[15px] mb-7 max-w-[420px] mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Snap your quote. Send a professional invoice. Get paid faster — from your phone, on-site.
          </p>
          <a
            href="https://invoice-app.store"
            className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-full text-[15px] transition-all duration-200"
            style={{ background: '#fff', color: '#5B4FE8' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ''}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get started at invoice-app.store <ArrowRight className="w-4 h-4" />
          </a>
        </section>

        {/* ─── RELATED ARTICLES ─────────────────────────────────────────────── */}
        {relatedArticles.length > 0 && (
          <section className="px-6 pb-14">
            <div className="max-w-[1200px] mx-auto">
              <h2 className="text-[1.4rem] mb-6" style={{ ...instrSerif, color: '#0D0D0D' }}>
                More in {article.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {relatedArticles.map(related => (
                  <Link
                    key={related.slug}
                    to="/blog/$slug"
                    params={{ slug: related.slug }}
                    className="group bg-white rounded-[22px] p-6 transition-all duration-200"
                    style={{ boxShadow: '0 2px 16px rgba(13,13,13,0.06), 0 0 0 1px rgba(13,13,13,0.05)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(13,13,13,0.10), 0 0 0 1px rgba(91,79,232,0.15)'
                      ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(13,13,13,0.06), 0 0 0 1px rgba(13,13,13,0.05)'
                      ;(e.currentTarget as HTMLElement).style.transform = ''
                    }}
                  >
                    <h3
                      className="text-[1.15rem] leading-snug mb-2 group-hover:text-[#5B4FE8] transition-colors duration-200"
                      style={{ ...instrSerif, color: '#0D0D0D' }}
                    >
                      {related.title}
                    </h3>
                    <p className="text-[13px] leading-relaxed mb-4 line-clamp-2" style={{ color: '#6A6A6A' }}>
                      {related.excerpt}
                    </p>
                    <span className="text-[13px] font-semibold flex items-center gap-1" style={{ color: '#5B4FE8' }}>
                      Read <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <BlogFooter />
      </div>
    </>
  )
}
