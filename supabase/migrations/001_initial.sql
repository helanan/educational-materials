-- ============================================================
-- TeachShare — Initial Schema
-- Run this in your Supabase SQL editor or via the CLI
-- ============================================================

-- Profiles (extends auth.users)
create table public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  display_name  text,
  bio           text,
  avatar_url    text,
  is_seller     boolean default false not null,
  store_name    text,
  created_at    timestamptz default now() not null
);

-- Categories
create table public.categories (
  id    serial primary key,
  name  text not null,
  slug  text unique not null,
  icon  text
);

insert into public.categories (name, slug, icon) values
  ('Worksheets',   'worksheets',   '📝'),
  ('Lesson Plans', 'lesson-plans', '📚'),
  ('Activities',   'activities',   '🎯'),
  ('Flashcards',   'flashcards',   '🃏'),
  ('Posters',      'posters',      '🖼️'),
  ('Assessments',  'assessments',  '✅');

-- Products
create table public.products (
  id                  uuid default gen_random_uuid() primary key,
  seller_id           uuid references public.profiles(id) on delete cascade not null,
  title               text not null,
  description         text,
  price               numeric(10, 2) not null check (price >= 0),
  category_id         integer references public.categories(id),
  file_url            text not null,
  preview_image_url   text,
  grade_level         text,
  subject             text,
  page_count          integer,
  downloads           integer default 0 not null,
  is_published        boolean default false not null,
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null
);

-- Purchases
create table public.purchases (
  id                uuid default gen_random_uuid() primary key,
  buyer_id          uuid references public.profiles(id) on delete set null,
  product_id        uuid references public.products(id) on delete set null,
  stripe_session_id text unique,
  amount_paid       numeric(10, 2) not null,
  created_at        timestamptz default now() not null
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles  enable row level security;
alter table public.products   enable row level security;
alter table public.purchases  enable row level security;

-- Profiles
create policy "Profiles are publicly readable"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Products
create policy "Published products are publicly readable"
  on products for select using (is_published = true or seller_id = auth.uid());

create policy "Sellers can insert products"
  on products for insert with check (seller_id = auth.uid());

create policy "Sellers can update their own products"
  on products for update using (seller_id = auth.uid());

create policy "Sellers can delete their own products"
  on products for delete using (seller_id = auth.uid());

-- Purchases
create policy "Buyers can view their own purchases"
  on purchases for select using (buyer_id = auth.uid());

-- Purchases are inserted by the service role (webhook) — no RLS insert policy needed for anon/user

-- ============================================================
-- Helper functions
-- ============================================================

-- Increment download counter (called by Stripe webhook via service role)
create or replace function public.increment_downloads(product_id uuid)
returns void
language sql
security definer
as $$
  update public.products
  set downloads = downloads + 1, updated_at = now()
  where id = product_id;
$$;

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, display_name, is_seller, store_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'display_name',
    coalesce((new.raw_user_meta_data ->> 'is_seller')::boolean, false),
    new.raw_user_meta_data ->> 'store_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Storage
-- Run these in the Supabase dashboard > Storage section:
--
-- 1. Create a bucket named "materials"
-- 2. Make the "previews/" folder public:
--      Bucket policies > Add policy > SELECT for public (anon)
--      Using: bucket_id = 'materials' AND name LIKE 'previews/%'
-- 3. Keep "files/" folder private (downloads via signed URLs)
-- ============================================================
