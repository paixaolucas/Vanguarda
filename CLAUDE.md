# Vanguarda — Contexto para Claude Code

## O que é esse projeto
Plataforma interna de gestão do programa de mentoria Overlens.
Gerencia membros, financeiro, integração com Circle/Hotmart/TMB, relatórios e CRM.

## Stack
- **Next.js 15**, TypeScript, Supabase, Tailwind CSS
- `@supabase/ssr` para auth via cookies
- Tiptap para editor de texto rico
- Todo texto em **português do Brasil**

## Como rodar
```bash
npm install
npm run dev      # desenvolvimento
npm run build    # verificar erros
npm start        # produção
```

## Variáveis de ambiente necessárias (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Banco de dados (Supabase)
Rodar na ordem no SQL Editor do Supabase:
1. `supabase/schema.sql` — schema completo
2. `supabase/seed-admin.sql` — criar admin (substituir UUID)
3. `supabase/migrations/001_indexes.sql`
4. `supabase/migrations/002_member_status_history.sql`
5. `supabase/migrations/003_audit_log.sql`

## Padrões do projeto
- Tema: fundo `#000`, cards `#0a0a0a`, bordas `#1a1a1a` e `#222`, texto branco
- `createClient()` → server components (com sessão)
- `createServiceClient()` → webhooks e operações server-only (bypass RLS)
- Server components com `Suspense` para streaming/performance
- Classe CSS `.input-field` em `globals.css` para inputs
- `force-dynamic` em todas as páginas do dashboard

## Rotas principais
- `/` — Dashboard com gráficos e feeds
- `/members` — Lista com paginação + CSV export
- `/members/[id]` — Perfil completo + edição + timeline de status
- `/financial` — Transações com paginação + CSV export
- `/calendar` — Visão anual (12 meses)
- `/import` — Upload CSV para importar CRM
- `/settings/api-keys` — Chaves Hotmart, TMB, Circle
- `/settings/audit-log` — Log de ações dos admins

## GitHub
https://github.com/paixaolucas/Vanguarda

---

## Próximas implementações (ver ROADMAP.md para detalhes)

### Fase 4 — Fazer primeiro
1. **Timeline unificada** — linha do tempo cronológica no perfil do membro (transações + Circle + notas + reports + mudanças de status, tudo junto em ordem de data)
2. **Alertas de atenção** — painel no dashboard: inadimplentes há +7 dias, sem acesso Circle há +30 dias, chargebacks sem resolução
3. **Score de engajamento** — score 0–100 por membro (posts Circle + comentários + transações em dia), aparece no perfil e na lista com filtro
4. **Busca global** — Cmd/Ctrl+K, dropdown no header, busca nome/email/telefone em tempo real

### Fase 5 — Depois
5. MRR + métricas SaaS (Churn Rate, LTV, comparativo mês anterior)
6. Pipeline Kanban de follow-ups (`/pipeline`)
7. Templates de relatórios
8. Tags automáticas (`/settings/automations`)

### Fase 6 — Futuro
9. Multi-admin com permissões por mentor
10. Webhooks de saída (Slack, WhatsApp)
11. PWA mobile
