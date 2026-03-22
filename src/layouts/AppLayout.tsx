import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouterState } from '@tanstack/react-router'

interface AppLayoutProps {
  children: ReactNode
  bottomBar?: ReactNode
}

export function AppLayout({ children, bottomBar }: AppLayoutProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA] flex flex-col max-w-md mx-auto relative">
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex-1 overflow-auto"
          style={{ paddingBottom: bottomBar ? '88px' : '0' }}
        >
          {children}
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
