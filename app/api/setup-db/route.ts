import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Rota de setup único — remove este arquivo após configuração
// Acesse: http://localhost:3000/api/setup-db?token=setup-vanguarda

const SETUP_TOKEN = 'setup-vanguarda'

const SQL_STATEMENTS = [
  `create table if not exists admins (
    id uuid primary key,
    name text,
    email text unique,
    role text,
    created_at timestamp default now()
  )`,
  `create table if not exists members (
    id uuid primary key default gen_random_uuid(),
    name text,
    email text unique,
    phone text,
    status text,
    origin text,
    hotmart_id text,
    tmb_id text,
    circle_member_id text,
    created_at timestamp default now(),
    updated_at timestamp default now()
  )`,
  `create table if not exists transactions (
    id uuid primary key default gen_random_uuid(),
    member_id uuid references members(id),
    platform text,
    event_type text,
    amount numeric,
    status text,
    transaction_date timestamp,
    raw_payload jsonb,
    created_at timestamp default now()
  )`,
  `create table if not exists circle_activity (
    id uuid primary key default gen_random_uuid(),
    member_id uuid references members(id),
    circle_member_id text,
    event_type text,
    event_data jsonb,
    occurred_at timestamp,
    created_at timestamp default now()
  )`,
  `create table if not exists reports (
    id uuid primary key default gen_random_uuid(),
    member_id uuid references members(id),
    title text,
    content text,
    created_by uuid references admins(id),
    created_at timestamp default now(),
    updated_at timestamp default now()
  )`,
  `create table if not exists notes (
    id uuid primary key default gen_random_uuid(),
    member_id uuid references members(id),
    note text,
    created_by uuid references admins(id),
    created_at timestamp default now()
  )`,
  `create table if not exists tags (
    id uuid primary key default gen_random_uuid(),
    name text unique,
    color text
  )`,
  `create table if not exists member_tags (
    member_id uuid references members(id),
    tag_id uuid references tags(id),
    primary key (member_id, tag_id)
  )`,
  `create table if not exists api_keys (
    id uuid primary key default gen_random_uuid(),
    service text unique,
    key_name text,
    key_value text,
    extra_config jsonb,
    updated_at timestamp default now()
  )`,
  `alter table members enable row level security`,
  `alter table transactions enable row level security`,
  `alter table circle_activity enable row level security`,
  `alter table reports enable row level security`,
  `alter table notes enable row level security`,
  `alter table tags enable row level security`,
  `alter table member_tags enable row level security`,
  `alter table admins enable row level security`,
  `alter table api_keys enable row level security`,
  `do $$ begin if not exists (select 1 from pg_policies where tablename='members' and policyname='rls_members') then create policy "rls_members" on members for all to authenticated using (true) with check (true); end if; end $$`,
  `do $$ begin if not exists (select 1 from pg_policies where tablename='transactions' and policyname='rls_transactions') then create policy "rls_transactions" on transactions for all to authenticated using (true) with check (true); end if; end $$`,
  `do $$ begin if not exists (select 1 from pg_policies where tablename='circle_activity' and policyname='rls_circle_activity') then create policy "rls_circle_activity" on circle_activity for all to authenticated using (true) with check (true); end if; end $$`,
  `do $$ begin if not exists (select 1 from pg_policies where tablename='reports' and policyname='rls_reports') then create policy "rls_reports" on reports for all to authenticated using (true) with check (true); end if; end $$`,
  `do $$ begin if not exists (select 1 from pg_policies where tablename='notes' and policyname='rls_notes') then create policy "rls_notes" on notes for all to authenticated using (true) with check (true); end if; end $$`,
  `do $$ begin if not exists (select 1 from pg_policies where tablename='tags' and policyname='rls_tags') then create policy "rls_tags" on tags for all to authenticated using (true) with check (true); end if; end $$`,
  `do $$ begin if not exists (select 1 from pg_policies where tablename='member_tags' and policyname='rls_member_tags') then create policy "rls_member_tags" on member_tags for all to authenticated using (true) with check (true); end if; end $$`,
  `do $$ begin if not exists (select 1 from pg_policies where tablename='admins' and policyname='rls_admins') then create policy "rls_admins" on admins for all to authenticated using (true) with check (true); end if; end $$`,
  `do $$ begin if not exists (select 1 from pg_policies where tablename='api_keys' and policyname='rls_api_keys') then create policy "rls_api_keys" on api_keys for all to authenticated using (true) with check (true); end if; end $$`,
  `insert into tags (name, color) values
    ('VIP','#ffffff'),('Em Risco','#ff0000'),('Alta Engajamento','#00ff00'),
    ('Novo Membro','#ffffff'),('Mentoria Individual','#ffffff')
  on conflict (name) do nothing`,
]

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (token !== SETUP_TOKEN) {
    return NextResponse.json({ error: 'Token inválido.' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const log: string[] = []

  // ── 1. Criar schema via pg/v1/query ────────────────────────────────────────
  log.push('=== SCHEMA SQL ===')
  let schemaOk = false

  for (const sql of SQL_STATEMENTS) {
    const preview = sql.trim().replace(/\s+/g, ' ').slice(0, 60)
    try {
      const res = await fetch(`${supabaseUrl}/pg/v1/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
          'Content-Type': 'application/json',
          'x-connection-encrypted': 'true',
        },
        body: JSON.stringify({ query: sql }),
      })
      if (res.ok) {
        log.push(`✓ ${preview}`)
        schemaOk = true
      } else {
        const err = await res.text()
        log.push(`~ ${preview} (${res.status}: ${err.slice(0, 80)})`)
      }
    } catch (e) {
      log.push(`✗ ${preview} (${e instanceof Error ? e.message : String(e)})`)
      break
    }
  }

  // ── 2. Criar usuário admin ─────────────────────────────────────────────────
  log.push('\n=== USUÁRIO ADMIN ===')
  let userId: string | null = null

  try {
    const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@vanguarda.com',
        password: 'vanguarda2024',
        email_confirm: true,
      }),
    })
    const userData = await createRes.json()

    if (createRes.ok) {
      userId = userData.id
      log.push(`✓ Usuário criado: ${userData.email} (${userId})`)
    } else if (createRes.status === 422 || JSON.stringify(userData).includes('already')) {
      // Buscar usuário existente
      const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?per_page=1000`, {
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
      })
      const listData = await listRes.json()
      const existing = (listData.users ?? []).find((u: { email: string }) => u.email === 'admin@vanguarda.com')
      if (existing) {
        userId = existing.id
        log.push(`~ Usuário já existe: ${existing.email} (${userId})`)
      }
    } else {
      log.push(`✗ Erro ao criar usuário: ${JSON.stringify(userData).slice(0, 200)}`)
    }
  } catch (e) {
    log.push(`✗ Erro: ${e instanceof Error ? e.message : String(e)}`)
  }

  // ── 3. Inserir na tabela admins ────────────────────────────────────────────
  if (userId && schemaOk) {
    log.push('\n=== TABELA ADMINS ===')
    try {
      const supabase = createServiceClient()
      const { error } = await supabase.from('admins').upsert({
        id: userId,
        name: 'Administrador',
        email: 'admin@vanguarda.com',
        role: 'super_admin',
      })
      if (error) {
        log.push(`~ ${error.message}`)
      } else {
        log.push(`✓ Admin inserido na tabela`)
      }
    } catch (e) {
      log.push(`✗ ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // ── Resposta HTML ──────────────────────────────────────────────────────────
  const allOk = schemaOk && userId !== null
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Vanguarda — Setup</title>
  <style>
    body { background:#000; color:#fff; font-family:monospace; padding:2rem; max-width:700px; margin:0 auto; }
    h1 { font-size:1.2rem; margin-bottom:1rem; }
    pre { background:#0a0a0a; border:1px solid #222; padding:1rem; white-space:pre-wrap; font-size:0.8rem; line-height:1.6; }
    .ok { color:#4ade80; font-size:1rem; margin-top:1.5rem; }
    .warn { color:#facc15; font-size:1rem; margin-top:1.5rem; }
    a { color:#fff; }
    .btn { display:inline-block; margin-top:1.5rem; padding:0.75rem 1.5rem; background:#fff; color:#000; text-decoration:none; font-weight:600; }
  </style>
</head>
<body>
  <h1>Vanguarda — Setup automático</h1>
  <pre>${log.join('\n')}</pre>
  ${allOk
    ? `<p class="ok">✅ Setup concluído! Acesse o painel:</p>
       <a href="/login" class="btn">Ir para o Login →</a>`
    : `<p class="warn">⚠️ Setup parcial. Verifique os itens acima.<br>
       Se o schema não foi criado, rode <code>supabase/schema.sql</code> no SQL Editor do Supabase e recarregue esta página.</p>
       ${userId ? `<p style="color:#999;font-size:.8rem">UUID do admin: <code>${userId}</code></p>` : ''}
    `
  }
</body>
</html>`

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
}
