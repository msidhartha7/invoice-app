import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff } from 'lucide-react'

interface VoiceRecorderProps {
  onRecorded: (blob: Blob) => void
  isLoading: boolean
}

export function VoiceRecorder({ onRecorded, isLoading }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecording, setHasRecording] = useState(false)
  const [permissionError, setPermissionError] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  async function startRecording() {
    chunksRef.current = []
    setPermissionError(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach((t) => t.stop())
        setHasRecording(true)
        onRecorded(blob)
      }
      recorder.start()
      setIsRecording(true)
    } catch {
      setPermissionError(true)
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }

  function handleReset() {
    setHasRecording(false)
    chunksRef.current = []
  }

  if (hasRecording) {
    return (
      <div className="w-full bg-green-50 border border-green-200 rounded-3xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-100 rounded-2xl flex items-center justify-center">
            <Mic className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A]">Audio recorded</p>
            <p className="text-xs text-[#888]">Ready to process</p>
          </div>
        </div>
        {!isLoading && (
          <button
            onClick={handleReset}
            className="text-xs text-[#888] hover:text-[#1A1A1A] font-medium transition"
          >
            Redo
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <motion.button
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onMouseLeave={isRecording ? stopRecording : undefined}
        disabled={isLoading}
        className="w-full h-[64px] bg-white border-2 border-dashed border-[#E8E8E8] rounded-3xl flex items-center justify-center gap-3 font-medium disabled:opacity-50 select-none touch-none"
        animate={
          isRecording
            ? { borderColor: '#FF4444', backgroundColor: '#FFF5F5' }
            : { borderColor: '#E8E8E8', backgroundColor: '#FFFFFF' }
        }
        transition={{ duration: 0.15 }}
      >
        <motion.div
          animate={isRecording ? { scale: [1, 1.25, 1] } : { scale: 1 }}
          transition={isRecording ? { repeat: Infinity, duration: 0.7 } : {}}
        >
          {isRecording ? (
            <MicOff className="w-5 h-5 text-red-500" />
          ) : (
            <Mic className="w-5 h-5 text-[#888]" />
          )}
        </motion.div>
        <span className={isRecording ? 'text-red-500 font-semibold' : 'text-[#888]'}>
          {isRecording ? 'Release to stop' : 'Hold to Record'}
        </span>
      </motion.button>
      {permissionError && (
        <p className="text-xs text-red-500 text-center">
          Microphone permission required. Please allow access and try again.
        </p>
      )}
    </div>
  )
}
