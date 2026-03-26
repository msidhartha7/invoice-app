import { useRef, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouterState } from '@tanstack/react-router'

const PULL_THRESHOLD = 60

interface AppLayoutProps {
  children: ReactNode
  bottomBar?: ReactNode
  onRefresh?: () => Promise<void>
}

export function AppLayout({ children, bottomBar, onRefresh }: AppLayoutProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const scrollRef = useRef<HTMLElement>(null)
  const touchStartY = useRef(0)
  const [pullY, setPullY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!onRefresh) return
    touchStartY.current = e.touches[0].clientY
  }, [onRefresh])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!onRefresh || refreshing) return
    const el = scrollRef.current
    if (!el || el.scrollTop > 0) return
    const dy = e.touches[0].clientY - touchStartY.current
    if (dy > 0) setPullY(Math.min(dy * 0.5, PULL_THRESHOLD))
  }, [onRefresh, refreshing])

  const handleTouchEnd = useCallback(async () => {
    if (!onRefresh || refreshing) return
    if (pullY >= PULL_THRESHOLD) {
      setPullY(0)
      setRefreshing(true)
      try { await onRefresh() } finally { setRefreshing(false) }
    } else {
      setPullY(0)
    }
  }, [onRefresh, refreshing, pullY])

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA] flex flex-col max-w-md mx-auto relative">
      <div className="h-[3px] bg-[#6C47FF] flex-shrink-0" />
      <AnimatePresence mode="wait">
        <motion.main
          ref={scrollRef}
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="flex-1 overflow-auto"
          style={{ paddingBottom: bottomBar ? '88px' : '0' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {(refreshing || pullY > 0) && (
            <div
              className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-10"
              style={{ paddingTop: refreshing ? 12 : Math.max(pullY - 20, 4) }}
            >
              <div className={`w-5 h-5 rounded-full border-2 border-[#6C47FF] border-t-transparent ${refreshing ? 'animate-spin' : 'opacity-50'}`} />
            </div>
          )}
          <div style={{ transform: pullY > 0 ? `translateY(${pullY}px)` : undefined, transition: pullY === 0 ? 'transform 0.2s ease' : undefined }}>
            {children}
            <p className="text-center text-[10px] text-[#CCC] pb-6 pt-4 select-none tracking-wide">
              The Invoice App
            </p>
          </div>
        </motion.main>
      </AnimatePresence>

      {bottomBar && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#FAFAFA]/95 backdrop-blur-sm border-t border-[#E8E8E8] px-6 py-4 z-50">
          {bottomBar}
        </div>
      )}
    </div>
  )
}
