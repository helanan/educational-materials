'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DownloadButtonProps {
  filePath: string
  title: string
}

export default function DownloadButton({ filePath, title }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleDownload = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.storage
        .from('materials')
        .createSignedUrl(filePath, 3600)
      if (error) throw error
      const a = document.createElement('a')
      a.href = data.signedUrl
      a.download = title
      a.click()
    } catch {
      alert('Download failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-brand-700 transition-colors disabled:opacity-50 shrink-0"
    >
      <Download className="h-4 w-4" />
      {loading ? 'Loading…' : 'Download'}
    </button>
  )
}
