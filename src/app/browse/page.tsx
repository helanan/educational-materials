import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import { Search } from 'lucide-react'
import type { Product } from '@/types'

const CATEGORIES = [
  { name: 'All', slug: '' },
  { name: 'Worksheets', slug: 'worksheets' },
  { name: 'Lesson Plans', slug: 'lesson-plans' },
  { name: 'Activities', slug: 'activities' },
  { name: 'Flashcards', slug: 'flashcards' },
  { name: 'Posters', slug: 'posters' },
  { name: 'Assessments', slug: 'assessments' },
]

const GRADE_LEVELS = ['Pre-K', 'K-2', '3-5', '6-8', '9-12', 'Higher Ed']

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Most Downloaded', value: 'popular' },
]

interface SearchParams {
  q?: string
  category?: string
  grade?: string
  sort?: string
  min_price?: string
  max_price?: string
}

export default async function BrowsePage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient()

  let query = supabase
    .from('products')
    .select('*, profiles(display_name, store_name), categories(name, slug)')
    .eq('is_published', true)

  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }
  if (searchParams.grade) {
    query = query.eq('grade_level', searchParams.grade)
  }
  if (searchParams.min_price) {
    query = query.gte('price', parseFloat(searchParams.min_price))
  }
  if (searchParams.max_price) {
    query = query.lte('price', parseFloat(searchParams.max_price))
  }

  switch (searchParams.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'popular':
      query = query.order('downloads', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data: products } = await query.limit(48)

  const filtered = searchParams.category
    ? products?.filter((p: any) => p.categories?.slug === searchParams.category)
    : products

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header + Search */}
      <div className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Materials</h1>
          <form method="GET" action="/browse" className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="q"
                defaultValue={searchParams.q}
                placeholder="Search worksheets, lesson plans…"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <select
              name="sort"
              defaultValue={searchParams.sort}
              className="border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 hidden lg:block">
          <form method="GET" action="/browse">
            {searchParams.q && <input type="hidden" name="q" value={searchParams.q} />}
            {searchParams.sort && <input type="hidden" name="sort" value={searchParams.sort} />}

            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Category</h3>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <label key={cat.slug} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={cat.slug}
                        defaultChecked={
                          searchParams.category === cat.slug ||
                          (!searchParams.category && cat.slug === '')
                        }
                        className="text-brand-600 accent-brand-600"
                      />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Grade Level</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="grade"
                      value=""
                      defaultChecked={!searchParams.grade}
                      className="accent-brand-600"
                    />
                    <span className="text-sm text-gray-700">All Grades</span>
                  </label>
                  {GRADE_LEVELS.map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="grade"
                        value={g}
                        defaultChecked={searchParams.grade === g}
                        className="accent-brand-600"
                      />
                      <span className="text-sm text-gray-700">{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Price</h3>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    name="min_price"
                    placeholder="Min"
                    defaultValue={searchParams.min_price}
                    min="0"
                    step="0.50"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-gray-400 shrink-0">–</span>
                  <input
                    type="number"
                    name="max_price"
                    placeholder="Max"
                    defaultValue={searchParams.max_price}
                    min="0"
                    step="0.50"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-600 text-white py-2 rounded-lg font-semibold hover:bg-brand-700 transition-colors text-sm"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-6">{filtered?.length ?? 0} resources found</p>
          {filtered && filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((product: any) => (
                <ProductCard key={product.id} product={product as Product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No materials found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
