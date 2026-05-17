import Link from 'next/link'
import Image from 'next/image'
import { Download } from 'lucide-react'
import type { Product } from '@/types'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <div className="relative h-48 bg-gradient-to-br from-brand-100 to-brand-200 overflow-hidden">
          {product.preview_image_url ? (
            <Image
              src={product.preview_image_url}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <span className="text-5xl mb-2">📄</span>
              <span className="text-sm font-medium text-brand-600">No preview</span>
            </div>
          )}
          {product.grade_level && (
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-semibold text-brand-700 px-2 py-1 rounded-full">
              {product.grade_level}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors mb-1 text-sm">
            {product.title}
          </h3>
          {product.profiles?.store_name && (
            <p className="text-xs text-gray-400 mb-3">{product.profiles.store_name}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-brand-600">${product.price.toFixed(2)}</span>
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Download className="h-3 w-3" />
              <span>{product.downloads}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
