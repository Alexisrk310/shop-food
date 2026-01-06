-- Allow NULL values in user_id for Guest Checkout
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;
