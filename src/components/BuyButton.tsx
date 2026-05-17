'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { ShoppingCart } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface BuyButtonProps {
  productId: string
  price: number
}

export default function BuyButton({ productId, price }: BuyButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const { sessionId, error } = await res.json()
      if (error) {
        alert(error)
        return
      }
      const stripe = await stripePromise
      await stripe?.redirectToCheckout({ sessionId })
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ShoppingCart className="h-5 w-5" />
      {loading ? 'Processing…' : `Buy for $${price.toFixed(2)}`}
    </button>
  )
}
