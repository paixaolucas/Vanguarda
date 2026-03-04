-- Migration 002: Member status history tracking
-- Run in Supabase SQL editor

CREATE TABLE IF NOT EXISTS member_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_status_history_member_id ON member_status_history(member_id);
CREATE INDEX IF NOT EXISTS idx_member_status_history_created_at ON member_status_history(created_at);

ALTER TABLE member_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated users" ON member_status_history
  FOR ALL USING (auth.role() = 'authenticated');
