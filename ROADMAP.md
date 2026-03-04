# Vanguarda — Roadmap de Melhorias

## ✅ Fase 4 — Concluída
Timeline unificada, alertas de atenção, score de engajamento e busca global (Cmd/Ctrl+K) foram implementados.

---

## ✅ Fase 5 — Concluída
MRR/métricas SaaS no dashboard, pipeline Kanban (/pipeline), templates de relatórios e automações de tags (/settings/automations) implementados.

> **Nota:** Rodar `supabase/migrations/004_follow_ups.sql` no Supabase SQL Editor antes de usar o Pipeline.

---

## ✅ Fase 6 — Concluída
Múltiplos admins com roles (super_admin/admin/viewer), webhooks de saída configuráveis e PWA (manifest + service worker) implementados.

> **Notas de setup:**
> - Rodar `supabase/migrations/005_admin_roles.sql` e `006_webhook_subscriptions.sql` no Supabase SQL Editor
> - Para PWA funcionar com ícone, adicionar `public/icons/icon-192.png` e `public/icons/icon-512.png`

---

## Stack e contexto técnico para o próximo dev

- **Next.js 15**, TypeScript, Supabase, Tailwind CSS (tema black/white)
- Todos os textos em **português do Brasil**
- Cores: bg `#000`, cards `#0a0a0a`, bordas `#1a1a1a`/`#222`
- Server components com `Suspense` streaming para performance
- `createClient()` para server, `createServiceClient()` para webhooks (bypass RLS)
- Classe CSS `.input-field` em globals.css para inputs
- Migrations pendentes de rodar no Supabase: `supabase/migrations/001_indexes.sql`, `002_member_status_history.sql`, `003_audit_log.sql`
- Build passa com `npm run build` — manter isso após cada fase
