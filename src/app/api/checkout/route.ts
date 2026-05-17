import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Please sign in to purchase.' }, { status: 401 })
  }

  const { productId } = await request.json()

  const { data: product } = await supabase
    .from('products')
    .select('id, title, description, price, preview_image_url, seller_id')
    .eq('id', productId)
    .eq('is_published', true)
    .single()

  if (!product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
  }

  if (product.seller_id === user.id) {
    return NextResponse.json({ error: 'You cannot purchase your own listing.' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('purchases')
    .select('id')
    .eq('buyer_id', user.id)
    .eq('product_id', productId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'You already own this material.' }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.title,
              description: product.description ?? undefined,
              images: product.preview_image_url ? [product.preview_image_url] : [],
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${productId}`,
      metadata: {
        product_id: productId,
        buyer_id: user.id,
        amount: product.price.toString(),
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
