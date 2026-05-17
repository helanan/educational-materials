'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-brand-600" />
            <span className="text-xl font-bold text-gray-900">TeachShare</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/browse" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">
              Browse
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">
                  Dashboard
                </Link>
                <Link href="/dashboard/purchases" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">
                  My Purchases
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-1">
            <Link href="/browse" className="block px-4 py-2 text-gray-600 hover:text-brand-600 font-medium">
              Browse
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block px-4 py-2 text-gray-600 hover:text-brand-600 font-medium">
                  Dashboard
                </Link>
                <Link href="/dashboard/purchases" className="block px-4 py-2 text-gray-600 hover:text-brand-600 font-medium">
                  My Purchases
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:text-brand-600 font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-4 py-2 text-gray-600 hover:text-brand-600 font-medium">
                  Sign In
                </Link>
                <Link href="/register" className="block px-4 py-2 text-gray-600 hover:text-brand-600 font-medium">
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
