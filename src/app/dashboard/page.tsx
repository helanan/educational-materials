import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, TrendingUp, Package, DollarSign, Eye, Edit } from 'lucide-react'
import type { Product } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: products }, { data: purchases }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }),
    supabase.from('purchases').select('amount_paid, products!inner(seller_id)').eq('products.seller_id', user.id),
  ])

  const totalEarnings = purchases?.reduce((sum, p) => sum + (p.amount_paid ?? 0), 0) ?? 0
  const totalDownloads = products?.reduce((sum, p) => sum + (p.downloads ?? 0), 0) ?? 0

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {profile?.store_name ?? 'My Dashboard'}
            </h1>
            <p className="text-gray-500 mt-1">Manage your educational materials</p>
          </div>
          <Link
            href="/dashboard/upload"
            className="bg-brand-600 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Upload New
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[
            { icon: <DollarSign className="h-5 w-5 text-brand-600" />, label: 'Total Earnings', value: `$${totalEarnings.toFixed(2)}` },
            { icon: <Package className="h-5 w-5 text-brand-600" />, label: 'Listings', value: String(products?.length ?? 0) },
            { icon: <TrendingUp className="h-5 w-5 text-brand-600" />, label: 'Total Downloads', value: String(totalDownloads) },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-brand-100 p-2 rounded-lg">{stat.icon}</div>
                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Listings table */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">My Listings</h2>
          </div>

          {products && products.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {products.map((product: Product) => (
                <div key={product.id} className="p-5 flex items-center gap-4">
                  <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                    {product.preview_image_url ? (
                      <Image
                        src={product.preview_image_url}
                        alt={product.title}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full rounded-xl"
                      />
                    ) : (
                      <span className="text-2xl">📄</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{product.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span>${product.price.toFixed(2)}</span>
                      <span>·</span>
                      <span>{product.downloads} downloads</span>
                      <span>·</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          product.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {product.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/products/${product.id}`}
                      className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                    <Link
                      href={`/dashboard/edit/${product.id}`}
                      className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="text-5xl mb-4">📂</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-500 mb-6">Upload your first material to start earning</p>
              <Link
                href="/dashboard/upload"
                className="bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-brand-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Upload Your First Material
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
