-- Pipeline de follow-ups
CREATE TABLE IF NOT EXISTS follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'para_contatar', -- para_contatar | em_contato | resolvido
  notes TEXT,
  due_date DATE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_follow_ups_member_id ON follow_ups(member_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON follow_ups(status);
