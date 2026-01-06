-- Migration: Add Payment Method to Orders
-- Created at: 2026-01-05
-- Description: Adds payment_method column to distinguish between Mercado Pago and WhatsApp orders.

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'mercadopago';

-- Update existing rows to have the default value if needed (though DEFAULT handles new ones)
UPDATE public.orders SET payment_method = 'mercadopago' WHERE payment_method IS NULL;
