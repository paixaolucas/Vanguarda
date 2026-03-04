-- Migration 001: Performance indexes
-- Run in Supabase SQL editor

-- members indexes
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_origin ON members(origin);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);

-- transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_member_id ON transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_platform ON transactions(platform);

-- circle_activity indexes
CREATE INDEX IF NOT EXISTS idx_circle_activity_member_id ON circle_activity(member_id);
CREATE INDEX IF NOT EXISTS idx_circle_activity_occurred_at ON circle_activity(occurred_at);

-- reports and notes indexes
CREATE INDEX IF NOT EXISTS idx_reports_member_id ON reports(member_id);
CREATE INDEX IF NOT EXISTS idx_notes_member_id ON notes(member_id);
