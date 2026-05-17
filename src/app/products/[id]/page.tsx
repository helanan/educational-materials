import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Download, FileText, Tag, GraduationCap, BookOpen } from 'lucide-react'
import BuyButton from '@/components/BuyButton'

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, profiles(display_name, store_name, bio), categories(name, slug)')
    .eq('id', params.id)
    .eq('is_published', true)
    .single()

  if (!product) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  let hasPurchased = false
  if (user) {
    const { data: purchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('product_id', product.id)
      .maybeSingle()
    hasPurchased = !!purchase
  }

  const isOwnListing = user?.id === product.seller_id

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/browse" className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 mb-8 text-sm">
          ← Back to Browse
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: preview + description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="relative h-80 bg-gradient-to-br from-brand-100 to-brand-200">
                {product.preview_image_url ? (
                  <Image
                    src={product.preview_image_url}
                    alt={product.title}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-8xl mb-4">📄</span>
                    <p className="text-brand-600 font-medium">No preview available</p>
                  </div>
                )}
                {!hasPurchased && !isOwnListing && (
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                      Purchase to download
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
                {product.profiles && (
                  <p className="text-sm text-gray-500 mb-4">
                    by{' '}
                    <span className="font-medium text-brand-600">
                      {product.profiles.store_name || product.profiles.display_name}
                    </span>
                  </p>
                )}
                {product.description && (
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                  {product.grade_level && (
                    <div className="text-center">
                      <GraduationCap className="h-5 w-5 text-brand-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Grade Level</p>
                      <p className="text-sm font-semibold text-gray-900">{product.grade_level}</p>
                    </div>
                  )}
                  {product.subject && (
                    <div className="text-center">
                      <BookOpen className="h-5 w-5 text-brand-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Subject</p>
                      <p className="text-sm font-semibold text-gray-900">{product.subject}</p>
                    </div>
                  )}
                  {product.page_count && (
                    <div className="text-center">
                      <FileText className="h-5 w-5 text-brand-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Pages</p>
                      <p className="text-sm font-semibold text-gray-900">{product.page_count}</p>
                    </div>
                  )}
                  <div className="text-center">
                    <Download className="h-5 w-5 text-brand-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Downloads</p>
                    <p className="text-sm font-semibold text-gray-900">{product.downloads}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: purchase panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <div className="text-4xl font-bold text-brand-600 mb-6">
                ${product.price.toFixed(2)}
              </div>

              {isOwnListing ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-sm text-gray-600">
                  This is your listing.{' '}
                  <Link href={`/dashboard/edit/${product.id}`} className="text-brand-600 font-semibold">
                    Edit it
                  </Link>
                </div>
              ) : hasPurchased ? (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p className="text-green-700 font-semibold text-sm">✓ You own this resource</p>
                  </div>
                  <Link
                    href="/dashboard/purchases"
                    className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold text-center block hover:bg-brand-700 transition-colors"
                  >
                    Go to Downloads
                  </Link>
                </div>
              ) : (
                <BuyButton productId={product.id} price={product.price} />
              )}

              <div className="mt-6 space-y-3 text-sm text-gray-600 border-t border-gray-100 pt-6">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-brand-500 shrink-0" />
                  <span>Instant digital download</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand-500 shrink-0" />
                  <span>PDF format, print-ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-brand-500 shrink-0" />
                  <span>Single classroom license</span>
                </div>
              </div>

              {product.categories && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-2">Category</p>
                  <Link
                    href={`/browse?category=${product.categories.slug}`}
                    className="inline-block bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-brand-100 transition-colors"
                  >
                    {product.categories.name}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
