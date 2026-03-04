-- ============================================================
-- Seed admin user
-- ============================================================
-- Step 1: Go to Supabase Dashboard > Authentication > Users
--         Click "Add user" and create:
--           Email: admin@vanguarda.com
--           Password: vanguarda2024
--
-- Step 2: Copy the UUID of the created user and replace <USER_UUID> below:
-- ============================================================

INSERT INTO admins (id, name, email, role)
VALUES ('<USER_UUID>', 'Administrador', 'admin@vanguarda.com', 'super_admin')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;
