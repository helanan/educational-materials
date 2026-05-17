import Link from 'next/link'
import { CheckCircle, Download, ArrowRight } from 'lucide-react'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 max-w-md w-full text-center">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Purchase Complete!</h1>
        <p className="text-gray-500 mb-8">
          Your material is now available for download. Head to your purchases page to get it.
        </p>
        <div className="space-y-3">
          <Link
            href="/dashboard/purchases"
            className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors"
          >
            <Download className="h-5 w-5" />
            Download Now
          </Link>
          <Link
            href="/browse"
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
          >
            Continue Browsing
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
