'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, FileText, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { id: 1, name: 'Worksheets' },
  { id: 2, name: 'Lesson Plans' },
  { id: 3, name: 'Activities' },
  { id: 4, name: 'Flashcards' },
  { id: 5, name: 'Posters' },
  { id: 6, name: 'Assessments' },
]

const GRADE_LEVELS = ['Pre-K', 'K-2', '3-5', '6-8', '9-12', 'Higher Ed']
const SUBJECTS = ['Math', 'Reading', 'Science', 'Social Studies', 'Art', 'Music', 'PE', 'Language Arts', 'Other']

export default function UploadPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    grade_level: '',
    subject: '',
    page_count: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setPreviewImage(f)
      setPreviewUrl(URL.createObjectURL(f))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setError('Please select a file to upload'); return }
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setProgress('Uploading material…')
      const fileExt = file.name.split('.').pop()
      const filePath = `files/${user.id}/${Date.now()}.${fileExt}`
      const { error: fileError } = await supabase.storage.from('materials').upload(filePath, file)
      if (fileError) throw fileError

      let previewImageUrl: string | null = null
      if (previewImage) {
        setProgress('Uploading preview image…')
        const imgExt = previewImage.name.split('.').pop()
        const imgPath = `previews/${user.id}/${Date.now()}.${imgExt}`
        const { error: imgError } = await supabase.storage.from('materials').upload(imgPath, previewImage)
        if (!imgError) {
          const { data: { publicUrl } } = supabase.storage.from('materials').getPublicUrl(imgPath)
          previewImageUrl = publicUrl
        }
      }

      setProgress('Creating listing…')
      const { error: insertError } = await supabase.from('products').insert({
        seller_id: user.id,
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        category_id: form.category_id ? parseInt(form.category_id) : null,
        grade_level: form.grade_level || null,
        subject: form.subject || null,
        page_count: form.page_count ? parseInt(form.page_count) : null,
        file_url: filePath,
        preview_image_url: previewImageUrl,
        is_published: true,
      })
      if (insertError) throw insertError

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message ?? 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-brand-600 hover:text-brand-700 font-medium text-sm">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Upload New Material</h1>
          <p className="text-gray-500 mt-1">Share your Canva creation with teachers worldwide</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* File upload */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Material File *</h2>
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                file ? 'border-brand-400 bg-brand-50' : 'border-gray-300 hover:border-brand-400 hover:bg-brand-50'
              }`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-brand-600" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null) }}
                    className="ml-2 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="font-semibold text-gray-700">Click to upload your PDF</p>
                  <p className="text-sm text-gray-400 mt-1">PDF, PNG, JPG, ZIP — up to 50 MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.zip"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Preview image */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Preview Image{' '}
              <span className="text-gray-400 font-normal text-sm">(optional but recommended)</span>
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Upload a screenshot of your material so buyers can see what they&apos;re getting.
            </p>
            <div
              onClick={() => imageRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                previewUrl ? 'border-brand-400 bg-brand-50' : 'border-gray-300 hover:border-brand-400 hover:bg-brand-50'
              }`}
            >
              {previewUrl ? (
                <div className="relative inline-block">
                  <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPreviewImage(null); setPreviewUrl(null) }}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">🖼️</div>
                  <p className="text-sm font-semibold text-gray-700">Click to add a preview image</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10 MB</p>
                </div>
              )}
            </div>
            <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. 3rd Grade Multiplication Worksheets Bundle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                rows={4}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                placeholder="What's included, how it can be used, skills it covers…"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  min="0.50"
                  max="200"
                  step="0.50"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="3.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Count</label>
                <input
                  type="number"
                  value={form.page_count}
                  onChange={(e) => setForm({ ...form, page_count: e.target.value })}
                  min="1"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                <select
                  value={form.grade_level}
                  onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select grade</option>
                  {GRADE_LEVELS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Select subject</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                {progress || 'Uploading…'}
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Publish Material
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
