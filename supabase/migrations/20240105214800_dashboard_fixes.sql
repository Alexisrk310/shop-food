-- Migration: Dashboard Fixes
-- Created at: 2024-01-05
-- Description: Adds dashboard_activities table, delete_user_by_id RPC, and activity triggers.

-- 1. Create dashboard_activities table
CREATE TABLE IF NOT EXISTS public.dashboard_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  message text NOT NULL,
  type text NOT NULL, -- 'order', 'user', 'review', 'system'
  read boolean DEFAULT false,
  action_url text,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.dashboard_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can view all activities
-- Depends on existing is_owner() function
DROP POLICY IF EXISTS "Owners can view all dashboard activities" ON public.dashboard_activities;
CREATE POLICY "Owners can view all dashboard activities"
  ON public.dashboard_activities
  FOR SELECT
  USING ( public.is_owner() );

-- Policy: Owners can update activities (mark as read)
DROP POLICY IF EXISTS "Owners can update dashboard activities" ON public.dashboard_activities;
CREATE POLICY "Owners can update dashboard activities"
  ON public.dashboard_activities
  FOR UPDATE
  USING ( public.is_owner() );

-- 2. Create delete_user_by_id function (RPC)
CREATE OR REPLACE FUNCTION public.delete_user_by_id(user_id uuid)
RETURNS void AS $$
BEGIN
  -- Check if executing user is an owner
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Delete from auth.users (requires security definer privilege)
  DELETE FROM auth.users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Triggers to auto-populate activities

-- Trigger Function: log_new_order_activity
CREATE OR REPLACE FUNCTION public.log_new_order_activity()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.dashboard_activities (message, type, action_url, user_id)
  VALUES (
    'Nuevo pedido #' || substring(new.id::text, 1, 8) || ' por ' || to_char(new.total, 'FM$999,999,999'),
    'order',
    '/dashboard/orders?openOrderId=' || new.id,
    new.user_id
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_order_created ON public.orders;
CREATE TRIGGER on_new_order_created
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.log_new_order_activity();

-- Trigger Function: log_new_user_activity
CREATE OR REPLACE FUNCTION public.log_new_user_activity()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.dashboard_activities (message, type, action_url, user_id)
  VALUES (
    'Nuevo usuario registrado: ' || COALESCE(new.email, 'Sin email'),
    'user',
    '/dashboard/users?openUserId=' || new.id,
    new.id
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_user_created ON public.profiles;
CREATE TRIGGER on_new_user_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.log_new_user_activity();

-- Trigger Function: log_new_review_activity
CREATE OR REPLACE FUNCTION public.log_new_review_activity()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.dashboard_activities (message, type, action_url, user_id)
  VALUES (
    'Nueva reseña de ' || new.username || ' (' || new.rating || ' estrellas)',
    'review',
    '/dashboard/reviews?highlightProductId=' || new.product_id,
    new.user_id
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_review_created ON public.reviews;
CREATE TRIGGER on_new_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.log_new_review_activity();
