import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Camera } from 'lucide-react'

interface CameraCaptureProps {
  onCapture: (file: File) => void
  isLoading: boolean
}

export function CameraCapture({ onCapture, isLoading }: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    onCapture(file)
  }

  function handleRetake() {
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
    inputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
        aria-label="Take a photo of your invoice"
      />
      {preview ? (
        <div className="relative w-full">
          <img
            src={preview}
            alt="Captured invoice preview"
            className="w-full max-h-64 rounded-3xl border border-[#E8E8E8] object-cover"
          />
          {!isLoading && (
            <button
              onClick={handleRetake}
              className="absolute top-3 right-3 bg-white rounded-xl px-3 py-1.5 text-xs font-semibold text-[#1A1A1A] border border-[#E8E8E8] shadow-sm active:scale-95 transition"
            >
              Retake
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="w-full h-[64px] bg-white border-2 border-dashed border-[#E8E8E8] rounded-3xl flex items-center justify-center gap-3 text-[#888] font-medium disabled:opacity-50 active:scale-[0.98] transition hover:border-[#6C47FF] hover:text-[#6C47FF]"
        >
          <Camera className="w-5 h-5" />
          Take a Photo
        </button>
      )}
    </div>
  )
}
