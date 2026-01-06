-- Add all missing columns to orders table for Guest Checkout and WhatsApp integration

-- 1. Customer Email (Critical for Guest Checkout)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- 2. Customer Name
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- 3. Shipping Details
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS neighborhood TEXT;

-- 4. Payment & Costs
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'mercadopago',
ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC DEFAULT 0;

-- 5. Notes
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 6. Update Policies to allow Guest Insert (Service Role usually handles this, but good to have)
-- Enable RLS just in case
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for guest checkout)
CREATE POLICY "Allow anonymous inserts to orders" 
ON public.orders 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Allow anonymous to read their own order if they have the ID (optional, but good for success page)
-- This is trickier without user_id, usually resolved by Service Role on backend.

-- Grant permissions
GRANT ALL ON public.orders TO anon;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
