import Link from 'next/link'
import { ArrowRight, DollarSign, GraduationCap, Palette, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types'

const CATEGORIES = [
  { name: 'Worksheets', slug: 'worksheets', icon: '📝', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  { name: 'Lesson Plans', slug: 'lesson-plans', icon: '📚', color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
  { name: 'Activities', slug: 'activities', icon: '🎯', color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' },
  { name: 'Flashcards', slug: 'flashcards', icon: '🃏', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  { name: 'Posters', slug: 'posters', icon: '🖼️', color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
  { name: 'Assessments', slug: 'assessments', icon: '✅', color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
]

export default async function HomePage() {
  const supabase = createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, profiles(display_name, store_name), categories(name, slug)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span>✨</span>
            <span>Designed by teachers, for teachers</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
            Share Your Teaching
            <span className="text-yellow-300 block">Creativity</span>
          </h1>
          <p className="text-xl text-brand-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload your Canva-designed worksheets, lesson plans, and activities.
            Other teachers buy them — you earn every time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/browse"
              className="bg-white text-brand-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              Browse Materials
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/register"
              className="bg-white/10 border-2 border-white/40 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-colors"
            >
              Start Selling Free
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-100 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-brand-600">10k+</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Resources</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-brand-600">5k+</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Teachers</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-brand-600">$50k+</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Earned by sellers</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Browse by Category</h2>
          <p className="text-gray-500 text-center mb-10">Find exactly what your classroom needs</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/browse?category=${cat.slug}`}
                className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${cat.color}`}
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="font-semibold text-sm text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Products */}
      {products && products.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">Latest Resources</h2>
                <p className="text-gray-500">Fresh materials from our teacher community</p>
              </div>
              <Link href="/browse" className="text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1 text-sm">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product as Product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">How It Works</h2>
          <p className="text-gray-500 text-center mb-12">Three steps to start earning from your teaching materials</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Palette className="h-8 w-8 text-brand-600" />,
                step: '01',
                title: 'Design in Canva',
                body: 'Create beautiful worksheets, lesson plans, and activities using Canva. Export as a PDF when you\'re done.',
              },
              {
                icon: <FileText className="h-8 w-8 text-brand-600" />,
                step: '02',
                title: 'Upload & Set Your Price',
                body: 'Upload your PDF to TeachShare, add a preview image, write a description, and set your price.',
              },
              {
                icon: <DollarSign className="h-8 w-8 text-brand-600" />,
                step: '03',
                title: 'Earn Money',
                body: 'Teachers discover and buy your materials. Funds are deposited automatically via Stripe.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="bg-brand-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-4xl font-black text-brand-200 mb-2">{item.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-brand-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <GraduationCap className="h-14 w-14 text-brand-300 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Ready to Share Your Materials?</h2>
          <p className="text-brand-200 text-xl mb-8">
            Join thousands of teachers earning extra income by sharing their classroom creations.
          </p>
          <Link
            href="/register"
            className="bg-white text-brand-700 px-10 py-4 rounded-xl font-bold text-xl hover:bg-brand-50 transition-colors inline-block"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  )
}
