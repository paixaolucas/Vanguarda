# Vanguarda — Roadmap de Melhorias

## ✅ Fase 4 — Concluída
Timeline unificada, alertas de atenção, score de engajamento e busca global (Cmd/Ctrl+K) foram implementados.

---

## ✅ Fase 5 — Concluída
MRR/métricas SaaS no dashboard, pipeline Kanban (/pipeline), templates de relatórios e automações de tags (/settings/automations) implementados.

> **Nota:** Rodar `supabase/migrations/004_follow_ups.sql` no Supabase SQL Editor antes de usar o Pipeline.

---

## 🟢 Fase 6 — Futuro

### 9. Múltiplos admins com permissões
- Admin pode ser atribuído a um subconjunto de membros
- Role: super_admin (tudo), admin (só seus membros), viewer (só leitura)
- Filtro automático de membros por admin logado

### 10. Webhooks de saída / notificações
- Configurar URL de destino (Slack, WhatsApp via Z-API, Discord)
- Eventos: novo membro, chargeback, cancelamento, inadimplência
- Tabela `webhook_subscriptions` com evento + URL + headers

### 11. App mobile (PWA)
- manifest.json + service worker
- Ícone instalável no celular
- Páginas otimizadas para touch
- Notificações push para alertas

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
