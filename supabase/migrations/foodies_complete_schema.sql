-- FOODIES APPLICATION COMPLETE SCHEMA
-- Run this in the Supabase SQL Editor to set up the entire database from scratch.

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Profiles Table (User Data)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  gender text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- Profile Policies
-- Profile Policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Helper function to check if user is owner (Bypasses RLS to avoid recursion)
create or replace function public.is_owner()
returns boolean as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role = 'owner'
  );
end;
$$ language plpgsql security definer;

drop policy if exists "Owners can view all profiles" on public.profiles;
create policy "Owners can view all profiles" on public.profiles for select using (public.is_owner());

-- 2.1 Addresses Table
create table if not exists public.addresses (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  recipient_name text not null,
  address_line1 text not null,
  neighborhood text,
  city text not null,
  phone text not null,
  is_default boolean default false
);

alter table public.addresses enable row level security;

drop policy if exists "Users can view own addresses" on public.addresses;
create policy "Users can view own addresses" on public.addresses for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own addresses" on public.addresses;
create policy "Users can insert own addresses" on public.addresses for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own addresses" on public.addresses;
create policy "Users can update own addresses" on public.addresses for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own addresses" on public.addresses;
create policy "Users can delete own addresses" on public.addresses for delete using (auth.uid() = user_id);

-- 3. Products Table (Food Menu)
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  price decimal(10,2) not null,
  sale_price decimal(10,2),
  compare_at_price decimal(10,2),
  category text,
  images text[] default '{}'::text[], -- Array of image URLs
  stock integer default 0,
  stock_by_size jsonb default '{}'::jsonb,
  is_new boolean default true,
  is_featured boolean default false -- "Favorito de la casa"
);

alter table public.products enable row level security;

-- Product Policies
-- Product Policies
drop policy if exists "Public products are viewable by everyone" on public.products;
create policy "Public products are viewable by everyone" on public.products for select using (true);

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products" on public.products for insert with check (auth.role() = 'authenticated'); -- Simplified for demo, ideally check 'role' in profiles

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products" on public.products for update using (auth.role() = 'authenticated');

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products" on public.products for delete using (auth.role() = 'authenticated');

-- 4. Orders Table
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  status text default 'pending',
  total decimal(10,2) not null,
  payment_id text,
  customer_name text,
  shipping_address text,
  city text,
  phone text,
  shipping_cost decimal(10,2) default 0
);

alter table public.orders enable row level security;

-- Order Policies
-- Order Policies
drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own orders" on public.orders;
create policy "Users can insert own orders" on public.orders for insert with check (auth.uid() = user_id);

drop policy if exists "Owners can view all orders" on public.orders;
create policy "Owners can view all orders" on public.orders for select using (public.is_owner());

-- 5. Order Items Table
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders not null,
  product_id uuid references public.products not null,
  quantity integer not null,
  price_at_time decimal(10,2) not null
);

alter table public.order_items enable row level security;

-- Order Items Policies
-- Order Items Policies
drop policy if exists "Users can view own order items" on public.order_items;
create policy "Users can view own order items" on public.order_items for select using (
  exists (select 1 from public.orders where id = public.order_items.order_id and user_id = auth.uid())
);

drop policy if exists "Owners can view all order items" on public.order_items;
create policy "Owners can view all order items" on public.order_items for select using (
  public.is_owner()
);

-- 6. Favorites Table
create table if not exists public.favorites (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  product_id uuid not null,
  product_data jsonb -- Snapshot of product data
);

alter table public.favorites enable row level security;

-- Favorites Policies
-- Favorites Policies
drop policy if exists "Users can view their own favorites" on public.favorites;
create policy "Users can view their own favorites" on public.favorites for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own favorites" on public.favorites;
create policy "Users can insert their own favorites" on public.favorites for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own favorites" on public.favorites;
create policy "Users can delete their own favorites" on public.favorites for delete using (auth.uid() = user_id);

-- 7. Triggers (User Creation)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    'user'
  )
  on conflict (id) do update
  set 
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. Storage (Bucket Creation)
-- Create 'products' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Storage Policies
-- Storage Policies
drop policy if exists "Allow authenticated uploads" on storage.objects;
create policy "Allow authenticated uploads" on storage.objects for insert to authenticated with check (bucket_id = 'products');

drop policy if exists "Allow public read access" on storage.objects;
create policy "Allow public read access" on storage.objects for select to public using (bucket_id = 'products');

drop policy if exists "Allow authenticated deletes" on storage.objects;
create policy "Allow authenticated deletes" on storage.objects for delete to authenticated using (bucket_id = 'products');


-- 9. Carts System (Persistent Cart)
create table if not exists public.carts (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.carts enable row level security;

drop policy if exists "Public can create carts" on public.carts;
create policy "Public can create carts" on public.carts for insert with check (true);

drop policy if exists "Public can view their own cart" on public.carts;
create policy "Public can view their own cart" on public.carts for select using (true); -- Simplified for session-based access, ideally controlled via stricter policies if user is attached

create table if not exists public.cart_items (
  id uuid default uuid_generate_v4() primary key,
  cart_id uuid references public.carts on delete cascade not null,
  product_id uuid references public.products not null,
  quantity integer default 1,
  size text default 'Estándar',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(cart_id, product_id, size)
);

alter table public.cart_items enable row level security;

drop policy if exists "Public can manage cart items" on public.cart_items;
create policy "Public can manage cart items" on public.cart_items for all using (true) with check (true); -- Open for anonymous carts managed by ID in local storage


-- 11. Newsletter Module
create table if not exists public.newsletter_subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Start public insert" on public.newsletter_subscribers;
create policy "Start public insert" on public.newsletter_subscribers for insert with check (true);

drop policy if exists "Admins can view subscribers" on public.newsletter_subscribers;
create policy "Admins can view subscribers" on public.newsletter_subscribers for select using (
  public.is_owner()
);


-- 12. Reviews Module
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products not null,
  user_id uuid references auth.users not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  username text, -- Display name snapshot
  reply text, -- Owner reply
  replied_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;

drop policy if exists "Public can read reviews" on public.reviews;
create policy "Public can read reviews" on public.reviews for select using (true);

drop policy if exists "Authenticated users can create reviews" on public.reviews;
create policy "Authenticated users can create reviews" on public.reviews for insert with check (auth.role() = 'authenticated');

drop policy if exists "Users can delete own reviews" on public.reviews;
create policy "Users can delete own reviews" on public.reviews for delete using (auth.uid() = user_id);

drop policy if exists "Admins can update reviews (reply)" on public.reviews;
create policy "Admins can update reviews (reply)" on public.reviews for update using (
  public.is_owner()
);

drop policy if exists "Admins can delete any review" on public.reviews;
create policy "Admins can delete any review" on public.reviews for delete using (
  public.is_owner()
);

