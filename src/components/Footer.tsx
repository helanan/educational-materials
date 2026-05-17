import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-brand-400" />
              <span className="text-white font-bold text-lg">TeachShare</span>
            </div>
            <p className="text-sm text-gray-400">
              Educational materials by teachers, for teachers. Share your creativity and earn.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/browse" className="hover:text-white transition-colors">Browse All</Link></li>
              <li><Link href="/browse?category=worksheets" className="hover:text-white transition-colors">Worksheets</Link></li>
              <li><Link href="/browse?category=lesson-plans" className="hover:text-white transition-colors">Lesson Plans</Link></li>
              <li><Link href="/browse?category=activities" className="hover:text-white transition-colors">Activities</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Sell</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/register" className="hover:text-white transition-colors">Become a Seller</Link></li>
              <li><Link href="/dashboard/upload" className="hover:text-white transition-colors">Upload Materials</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Seller Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:support@teachshare.com" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} TeachShare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
