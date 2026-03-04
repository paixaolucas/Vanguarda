-- Adiciona assigned_admin_id aos membros (para filtro por admin)
ALTER TABLE members ADD COLUMN IF NOT EXISTS assigned_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL;

-- Garante coluna role em admins (já existe no schema, mas pode estar NULL)
UPDATE admins SET role = 'super_admin' WHERE role IS NULL;

CREATE INDEX IF NOT EXISTS idx_members_assigned_admin ON members(assigned_admin_id);
