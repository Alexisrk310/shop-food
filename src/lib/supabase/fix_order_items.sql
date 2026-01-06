-- Fix order_items table for Size and Guest Checkout

-- 1. Add 'size' column if missing
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS size TEXT;

-- 2. Add 'price_at_time' if missing
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS price_at_time NUMERIC;

-- 3. RLS Policies
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policy to avoid "already exists" error
DROP POLICY IF EXISTS "Allow anonymous inserts to order_items" ON public.order_items;

-- Re-create the policy
CREATE POLICY "Allow anonymous inserts to order_items" 
ON public.order_items 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Grant permissions explicitly
GRANT ALL ON public.order_items TO anon;
GRANT ALL ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
