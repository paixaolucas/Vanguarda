-- ============================================================
-- Vanguarda — Supabase Schema
-- Run this SQL in your Supabase SQL editor
-- ============================================================

-- Admins (must be created before reports/notes which reference it)
create table if not exists admins (
  id uuid primary key,
  name text,
  email text unique,
  role text, -- super_admin | admin
  created_at timestamp default now()
);

-- Members (central student profile)
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique,
  phone text,
  status text, -- ativo, inativo, cancelado, inadimplente
  origin text, -- hotmart | tmb
  hotmart_id text,
  tmb_id text,
  circle_member_id text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Financial transactions
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id),
  platform text, -- hotmart | tmb
  event_type text, -- purchase | renewal | cancellation | refund | chargeback
  amount numeric,
  status text, -- approved | pending | refused | refunded
  transaction_date timestamp,
  raw_payload jsonb,
  created_at timestamp default now()
);

-- Circle activity
create table if not exists circle_activity (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id),
  circle_member_id text,
  event_type text, -- joined | post_created | comment | reaction
  event_data jsonb,
  occurred_at timestamp,
  created_at timestamp default now()
);

-- Individual reports
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id),
  title text,
  content text,
  created_by uuid references admins(id),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Internal notes (CRM)
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id),
  note text,
  created_by uuid references admins(id),
  created_at timestamp default now()
);

-- Tags
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text unique,
  color text
);

-- Member <-> Tag relation
create table if not exists member_tags (
  member_id uuid references members(id),
  tag_id uuid references tags(id),
  primary key (member_id, tag_id)
);

-- API Keys (for connecting integrations later)
create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  service text unique, -- hotmart | tmb | circle
  key_name text,
  key_value text,
  extra_config jsonb,
  updated_at timestamp default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table members enable row level security;
alter table transactions enable row level security;
alter table circle_activity enable row level security;
alter table reports enable row level security;
alter table notes enable row level security;
alter table tags enable row level security;
alter table member_tags enable row level security;
alter table admins enable row level security;
alter table api_keys enable row level security;

-- Allow authenticated users (admins) to do everything
create policy "Admins can do everything on members"
  on members for all
  to authenticated
  using (true)
  with check (true);

create policy "Admins can do everything on transactions"
  on transactions for all
  to authenticated
  using (true)
  with check (true);

create policy "Admins can do everything on circle_activity"
  on circle_activity for all
  to authenticated
  using (true)
  with check (true);

create policy "Admins can do everything on reports"
  on reports for all
  to authenticated
  using (true)
  with check (true);

create policy "Admins can do everything on notes"
  on notes for all
  to authenticated
  using (true)
  with check (true);

create policy "Admins can do everything on tags"
  on tags for all
  to authenticated
  using (true)
  with check (true);

create policy "Admins can do everything on member_tags"
  on member_tags for all
  to authenticated
  using (true)
  with check (true);

create policy "Admins can do everything on admins"
  on admins for all
  to authenticated
  using (true)
  with check (true);

create policy "Admins can do everything on api_keys"
  on api_keys for all
  to authenticated
  using (true)
  with check (true);

-- Service role bypass (for webhooks using SUPABASE_SERVICE_ROLE_KEY)
-- Service role bypasses RLS by default in Supabase

-- ============================================================
-- Seed: Admin user
-- After running this SQL, go to Supabase Auth > Users and
-- create a user with email: admin@vanguarda.com
-- password: vanguarda2024
-- Then copy the user UUID and run:
-- INSERT INTO admins (id, name, email, role) VALUES ('<uuid>', 'Admin', 'admin@vanguarda.com', 'super_admin');
-- ============================================================

-- Default tags
insert into tags (name, color) values
  ('VIP', '#ffffff'),
  ('Em Risco', '#ff0000'),
  ('Alta Engajamento', '#00ff00'),
  ('Novo Membro', '#ffffff'),
  ('Mentoria Individual', '#ffffff')
on conflict (name) do nothing;
