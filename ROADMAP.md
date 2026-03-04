# Vanguarda — Referência Técnica

## Stack

- **Next.js 15**, TypeScript, Supabase, Tailwind CSS
- Textos em **português do Brasil**
- Tema: bg `#000`, cards `#0a0a0a`, bordas `#1a1a1a` / `#222`
- Classe CSS `.input-field` em `globals.css` para todos os inputs

---

## Padrões de código

- **Server components** com `Suspense` streaming — cada seção pesada é um `async function` próprio com `<Suspense fallback=...>`
- **`createClient()`** → para server components (usa sessão do usuário, respeita RLS)
- **`createServiceClient()`** → para webhooks e automações (service role, bypass RLS)
- **`getAdminContext()`** em `lib/auth.ts` → retorna `{ role, adminId, name, email }` do admin logado
- Rotas de API em `app/api/...` — sempre retornam `NextResponse.json()`
- `export const dynamic = 'force-dynamic'` em todas as páginas do dashboard

---

## Setup inicial (novo ambiente)

1. Criar projeto no [Supabase](https://supabase.com/dashboard)
2. Rodar no SQL Editor, **nesta ordem**:
   - `supabase/schema.sql`
   - `supabase/migrations/001_indexes.sql`
   - `supabase/migrations/002_member_status_history.sql`
   - `supabase/migrations/003_audit_log.sql`
   - `supabase/migrations/004_follow_ups.sql`
   - `supabase/migrations/005_admin_roles.sql`
   - `supabase/migrations/006_webhook_subscriptions.sql`
3. Criar usuário admin em **Authentication → Users** no Supabase
4. Rodar `supabase/seed-admin.sql` substituindo `<USER_UUID>` pelo UUID criado
5. Preencher `.env.local` com as credenciais (ou acessar `/setup` no browser)
6. `npm install && npm start`

---

## Rotas principais

| Rota | Descrição |
|---|---|
| `/` | Dashboard com métricas, alertas e gráficos |
| `/members` | Lista de membros com filtros e paginação |
| `/members/[id]` | Perfil completo: timeline, score, notas, relatórios |
| `/financial` | Histórico de transações com filtros |
| `/reports` | Relatórios individuais (editor rich text) |
| `/pipeline` | Kanban de follow-ups (Para Contatar / Em Contato / Resolvido) |
| `/calendar` | Visão anual de eventos por membro |
| `/import` | Importação de CSV do CRM |
| `/settings/api-keys` | Chaves de API e botão de importação Hotmart |
| `/integrations` | Hub de integrações Circle, Hotmart, TMB |
| `/settings/admins` | Gerenciar admins e roles |
| `/settings/webhooks` | Webhooks de saída por evento |
| `/settings/automations` | Regras automáticas de tagging |
| `/settings/audit-log` | Log de ações dos admins |
| `/setup` | Configurar Supabase (sem login) |

---

## Roles de admin

| Role | Acesso |
|---|---|
| `super_admin` | Tudo, incluindo gerenciar outros admins |
| `admin` | Somente membros atribuídos a ele (`assigned_admin_id`) |
| `viewer` | Leitura — banner "Modo Leitura" visível no topo |

---

## Webhooks de entrada (integrações)

- **Hotmart** → `POST /api/webhooks/hotmart`
- **TMB** → `POST /api/webhooks/tmb`
- **Circle** → `POST /api/circle/sync`

## Webhooks de saída (notificações)

Configurados em `/settings/webhooks`. Eventos disparados automaticamente:
- `member.created` — nova compra aprovada
- `member.chargeback` — chargeback registrado
- `member.cancelled` — cancelamento
- `member.delinquent` — pagamento atrasado

---

## PWA

O app é instalável no celular. Para ativar o ícone:
- Adicionar `public/icons/icon-192.png` e `public/icons/icon-512.png`

O service worker (`public/sw.js`) já está ativo e faz cache dos assets estáticos.

---

## Deploy (Vercel)

1. Importar repositório em [vercel.com](https://vercel.com)
2. Adicionar as 3 variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
3. Deploy automático a cada `git push` na branch `main`
