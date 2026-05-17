import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DownloadButton from '@/components/DownloadButton'
import type { Purchase } from '@/types'

export default async function PurchasesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: purchases } = await supabase
    .from('purchases')
    .select('*, products(title, preview_image_url, price, file_url, profiles(store_name, display_name))')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Purchases</h1>
        <p className="text-gray-500 mb-8">All your downloaded educational materials</p>

        {purchases && purchases.length > 0 ? (
          <div className="space-y-4">
            {purchases.map((purchase: any) => (
              <div key={purchase.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
                <div className="w-16 h-16 bg-brand-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                  {purchase.products?.preview_image_url ? (
                    <img
                      src={purchase.products.preview_image_url}
                      alt={purchase.products.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <span className="text-2xl">📄</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {purchase.products?.title ?? 'Deleted material'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    by {purchase.products?.profiles?.store_name ?? purchase.products?.profiles?.display_name ?? 'Unknown seller'}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span>${purchase.amount_paid?.toFixed(2)}</span>
                    <span>·</span>
                    <span>{new Date(purchase.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {purchase.products?.file_url && (
                  <DownloadButton filePath={purchase.products.file_url} title={purchase.products.title} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <div className="text-5xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No purchases yet</h3>
            <p className="text-gray-500 mb-6">Browse the marketplace to find materials for your classroom</p>
            <Link
              href="/browse"
              className="bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold inline-block hover:bg-brand-700 transition-colors"
            >
              Browse Materials
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
