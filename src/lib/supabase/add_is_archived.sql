-- Add is_archived column for Soft Delete
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
