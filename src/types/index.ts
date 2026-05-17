export interface Profile {
  id: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  is_seller: boolean
  store_name: string | null
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  icon: string | null
}

export interface Product {
  id: string
  seller_id: string
  title: string
  description: string | null
  price: number
  category_id: number | null
  file_url: string
  preview_image_url: string | null
  grade_level: string | null
  subject: string | null
  page_count: number | null
  downloads: number
  is_published: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
  categories?: Category
}

export interface Purchase {
  id: string
  buyer_id: string
  product_id: string
  stripe_session_id: string | null
  amount_paid: number
  created_at: string
  products?: Product & { profiles?: Profile }
}
