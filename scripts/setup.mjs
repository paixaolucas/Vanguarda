/**
 * Vanguarda — Setup automático (usando https nativo)
 */
import https from 'https'

const PROJECT_REF = 'gukgrzhlpnpbwskouivy'
const SUPABASE_URL = `${PROJECT_REF}.supabase.co`
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1a2dyemhscG5wYndza291aXZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAzMjczOSwiZXhwIjoyMDgyNjA4NzM5fQ.-9S1epA3EQpyvQEQC-yP-YAsGOr7LEuIRW_BGSHZ35o'

function request(options, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null
    const opts = {
      hostname: options.hostname,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    }
    const req = https.request(opts, (res) => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }) }
        catch { resolve({ status: res.statusCode, body: data }) }
      })
    })
    req.on('error', reject)
    if (payload) req.write(payload)
    req.end()
  })
}

// ── Executar SQL via pg_meta ──────────────────────────────────────────────────
async function runSQL(query) {
  const res = await request(
    { hostname: SUPABASE_URL, path: '/pg/v1/query', method: 'POST' },
    { query }
  )
  if (res.status >= 400) throw new Error(`${res.status}: ${JSON.stringify(res.body).slice(0, 200)}`)
  return res.body
}

// ── Criar usuário via Auth Admin API ─────────────────────────────────────────
async function createAdminUser() {
  const res = await request(
    { hostname: SUPABASE_URL, path: '/auth/v1/admin/users', method: 'POST' },
    { email: 'admin@vanguarda.com', password: 'vanguarda2024', email_confirm: true }
  )
  if (res.status === 422 || JSON.stringify(res.body).includes('already')) {
    console.log('  ⚠ Usuário já existe, buscando...')
    return await getExistingUser()
  }
  if (res.status >= 400) throw new Error(`Auth ${res.status}: ${JSON.stringify(res.body).slice(0, 200)}`)
  return res.body
}

async function getExistingUser() {
  const res = await request(
    { hostname: SUPABASE_URL, path: '/auth/v1/admin/users?per_page=1000', method: 'GET' },
  )
  const users = res.body.users ?? []
  const user = users.find(u => u.email === 'admin@vanguarda.com')
  if (!user) throw new Error('Usuário não encontrado.')
  return user
}

// ── Inserir admin via REST ────────────────────────────────────────────────────
async function insertAdmin(userId) {
  const res = await request(
    {
      hostname: SUPABASE_URL,
      path: '/rest/v1/admins',
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates' },
    },
    { id: userId, name: 'Administrador', email: 'admin@vanguarda.com', role: 'super_admin' }
  )
  if (res.status >= 400 && res.status !== 409) {
    throw new Error(`Insert ${res.status}: ${JSON.stringify(res.body).slice(0, 200)}`)
  }
}

// ── SQL statements ────────────────────────────────────────────────────────────
const statements = [
  `create table if not exists admins (id uuid primary key, name text, email text unique, role text, created_at timestamp default now())`,
  `create table if not exists members (id uuid primary key default gen_random_uuid(), name text, email text unique, phone text, status text, origin text, hotmart_id text, tmb_id text, circle_member_id text, created_at timestamp default now(), updated_at timestamp default now())`,
  `create table if not exists transactions (id uuid primary key default gen_random_uuid(), member_id uuid references members(id), platform text, event_type text, amount numeric, status text, transaction_date timestamp, raw_payload jsonb, created_at timestamp default now())`,
  `create table if not exists circle_activity (id uuid primary key default gen_random_uuid(), member_id uuid references members(id), circle_member_id text, event_type text, event_data jsonb, occurred_at timestamp, created_at timestamp default now())`,
  `create table if not exists reports (id uuid primary key default gen_random_uuid(), member_id uuid references members(id), title text, content text, created_by uuid references admins(id), created_at timestamp default now(), updated_at timestamp default now())`,
  `create table if not exists notes (id uuid primary key default gen_random_uuid(), member_id uuid references members(id), note text, created_by uuid references admins(id), created_at timestamp default now())`,
  `create table if not exists tags (id uuid primary key default gen_random_uuid(), name text unique, color text)`,
  `create table if not exists member_tags (member_id uuid references members(id), tag_id uuid references tags(id), primary key (member_id, tag_id))`,
  `create table if not exists api_keys (id uuid primary key default gen_random_uuid(), service text unique, key_name text, key_value text, extra_config jsonb, updated_at timestamp default now())`,
  `alter table members enable row level security`,
  `alter table transactions enable row level security`,
  `alter table circle_activity enable row level security`,
  `alter table reports enable row level security`,
  `alter table notes enable row level security`,
  `alter table tags enable row level security`,
  `alter table member_tags enable row level security`,
  `alter table admins enable row level security`,
  `alter table api_keys enable row level security`,
  `do $$ begin if not exists (select 1 from pg_policies where tablename='members' and policyname='Admins can do everything on members') then create policy "Admins can do everything on members" on members for all to authenticated using (true) with check (true); end if; end $$`,
  `do $$ begin if not exists (select 1 from pg_policies where tablename='transactions' and policyname='Admins can do everything on transactions') then create policy "Admins can do everything on transactions" on transactions for all to authenticated using (true) with check (true); end if; end $$`,
  `do $$ begin if not exists (select 1 from pg_policies where tablename='circle_activity' and policyname='Admins can do everything on circle_activity') then create policy "Admins can do everything on circle_activity" on circle_activity for all to authenticated using (true) with check (true); end if; end $$`,
  `do $$ begin if not exists (select 1 from pg_policies where tablename='reports' and policyname='Admins can do everything on reports') then create policy "Admins can do everything on reports" on reports for all to authenticated using (true) with check (true); end if; end $$`,
  `do $$ begin if not exists (select 1 from pg_policies where tablename='notes' and policyname='Admins can do everything on notes') then create policy "Admins can do everything on notes" on notes for all to authenticated using (true) with check (true); end if; end $$`,
  `do $$ begin if not exists (select 1 from pg_policies where tablename='tags' and policyname='Admins can do everything on tags') then create policy "Admins can do everything on tags" on tags for all to authenticated using (true) with check (true); end if; end $$`,
  `do $$ begin if not exists (select 1 from pg_policies where tablename='member_tags' and policyname='Admins can do everything on member_tags') then create policy "Admins can do everything on member_tags" on member_tags for all to authenticated using (true) with check (true); end if; end $$`,
  `do $$ begin if not exists (select 1 from pg_policies where tablename='admins' and policyname='Admins can do everything on admins') then create policy "Admins can do everything on admins" on admins for all to authenticated using (true) with check (true); end if; end $$`,
  `do $$ begin if not exists (select 1 from pg_policies where tablename='api_keys' and policyname='Admins can do everything on api_keys') then create policy "Admins can do everything on api_keys" on api_keys for all to authenticated using (true) with check (true); end if; end $$`,
  `insert into tags (name, color) values ('VIP','#ffffff'),('Em Risco','#ff0000'),('Alta Engajamento','#00ff00'),('Novo Membro','#ffffff'),('Mentoria Individual','#ffffff') on conflict (name) do nothing`,
]

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Vanguarda — Setup automático\n')

  // Teste de conexão
  console.log('📡 Testando conexão...')
  const test = await request({ hostname: SUPABASE_URL, path: '/rest/v1/', method: 'GET' })
  if (test.status >= 400 && test.status !== 200) {
    console.error('  ✗ Falha na conexão. Status:', test.status)
    process.exit(1)
  }
  console.log('  ✓ Conectado\n')

  // Tentar rodar schema via pg_meta
  console.log('🗄  Criando schema SQL...')
  let schemaOk = false
  try {
    await runSQL('SELECT 1')
    console.log('  ✓ Endpoint pg/v1/query disponível\n')
    for (const sql of statements) {
      const preview = sql.trim().replace(/\s+/g, ' ').slice(0, 70)
      try {
        await runSQL(sql)
        process.stdout.write('  ✓ ' + preview + '...\n')
      } catch (e) {
        process.stdout.write('  ~ ' + preview + '... (já existe)\n')
      }
    }
    schemaOk = true
    console.log('')
  } catch (e) {
    console.log(`  ⚠ pg/v1/query indisponível neste plano.\n`)
    console.log('  ── AÇÃO NECESSÁRIA ──────────────────────────────────────')
    console.log('  Abra o link abaixo, cole o schema e clique em Run:\n')
    console.log('  https://supabase.com/dashboard/project/gukgrzhlpnpbwskouivy/sql/new\n')
    console.log('  Arquivo: supabase/schema.sql\n')
    console.log('  ─────────────────────────────────────────────────────────\n')
  }

  // Criar usuário admin
  console.log('👤 Criando usuário admin...')
  let userId
  try {
    const user = await createAdminUser()
    userId = user.id
    console.log(`  ✓ ${user.email} — UUID: ${userId}\n`)
  } catch (e) {
    console.error('  ✗', e.message)
    process.exit(1)
  }

  // Inserir na tabela (só se o schema foi criado)
  if (schemaOk) {
    console.log('📝 Inserindo admin na tabela...')
    try {
      await insertAdmin(userId)
      console.log('  ✓ Registro criado em admins\n')
    } catch (e) {
      console.log('  ⚠', e.message)
      printInsertSQL(userId)
    }
  } else {
    printInsertSQL(userId)
  }

  console.log('═══════════════════════════════════════════')
  if (schemaOk) {
    console.log('✅ Setup completo!')
  } else {
    console.log('⚠  Execute o schema.sql e o INSERT acima.')
    console.log('   Depois rode: npm start')
  }
  console.log('   Login: admin@vanguarda.com / vanguarda2024')
  console.log('   URL:   http://localhost:3000')
}

function printInsertSQL(userId) {
  console.log('  → Execute no SQL Editor:')
  console.log(`     INSERT INTO admins (id, name, email, role)`)
  console.log(`     VALUES ('${userId}', 'Administrador', 'admin@vanguarda.com', 'super_admin');\n`)
}

main().catch(e => { console.error('Erro fatal:', e.message); process.exit(1) })
