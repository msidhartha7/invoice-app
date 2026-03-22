import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { CameraCapture } from '../components/CameraCapture'
import { VoiceRecorder } from '../components/VoiceRecorder'
import { processIntake } from '../lib/api'
import { AppLayout } from '../layouts/AppLayout'
import { useAppStore } from '../store/appStore'
import type { ExtractedInvoiceData } from '../types'

export default function NewInvoice() {
  const navigate = useNavigate()
  const { setExtractedData, clearInvoiceFlow } = useAppStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  async function handleProcess(file: File | Blob, type: 'image' | 'audio') {
    setIsProcessing(true)
    setError('')
    clearInvoiceFlow()
    try {
      const data: ExtractedInvoiceData = await processIntake(file, type)
      setExtractedData(data)
      navigate('/invoice/review')
    } catch (err) {
      setError((err as Error).message || 'Processing failed. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <AppLayout>
      <div className="px-6 pt-12 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm text-[#888] hover:text-[#1A1A1A] transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">New Invoice</h1>
        <p className="text-[#888] text-sm mb-8">
          Snap a photo of your notes or dictate the details — AI handles the rest.
        </p>

        <div className="flex flex-col gap-4">
          <CameraCapture
            onCapture={(file) => handleProcess(file, 'image')}
            isLoading={isProcessing}
          />
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E8E8E8]" />
            <span className="text-xs text-[#BBB] font-medium">or</span>
            <div className="flex-1 h-px bg-[#E8E8E8]" />
          </div>
          <VoiceRecorder
            onRecorded={(blob) => handleProcess(blob, 'audio')}
            isLoading={isProcessing}
          />
        </div>

        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 bg-[#6C47FF]/5 border border-[#6C47FF]/20 rounded-3xl p-6 flex flex-col items-center gap-3 text-center"
            >
              <div className="w-10 h-10 bg-[#6C47FF]/10 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#6C47FF] animate-pulse" />
              </div>
              <div>
                <p className="font-semibold text-[#1A1A1A] text-sm">AI is reading your invoice</p>
                <p className="text-xs text-[#888] mt-0.5">Just a moment…</p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
