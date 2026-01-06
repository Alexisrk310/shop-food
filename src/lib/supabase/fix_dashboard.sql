-- 1. Create Dashboard Activities Table for Notifications
CREATE TABLE IF NOT EXISTS dashboard_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  action_type TEXT NOT NULL, -- 'ORDER_UPDATE', 'USER_UPDATE', 'NEW_ORDER'
  description TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_email TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id)
);

-- Enable RLS
ALTER TABLE dashboard_activities ENABLE ROW LEVEL SECURITY;

-- Policies (Drop first to avoid "already exists" error)
DROP POLICY IF EXISTS "Owners can view activities" ON dashboard_activities;
CREATE POLICY "Owners can view activities" ON dashboard_activities
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'owner')
  );

DROP POLICY IF EXISTS "Service Role can manage activities" ON dashboard_activities;
CREATE POLICY "Service Role can manage activities" ON dashboard_activities
  FOR ALL
  USING ( true )
  WITH CHECK ( true );

-- 2. Insert Dummy Activity to Test Notifications
INSERT INTO dashboard_activities (action_type, description, actor_name, actor_email, read)
VALUES ('SYSTEM_INIT', 'Dashboard notifications initialized', 'System', 'system@nomadastore.com', false);

-- 3. CRITICAL: Enable Realtime
-- This is often required for the client to receive updates
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
COMMIT;
-- OR if you want to be specific (safer in some envs):
-- ALTER PUBLICATION supabase_realtime ADD TABLE dashboard_activities;
