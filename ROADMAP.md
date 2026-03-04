# Vanguarda — Roadmap de Melhorias

## ✅ Fase 4 — Concluída
Timeline unificada, alertas de atenção, score de engajamento e busca global (Cmd/Ctrl+K) foram implementados.

---

## 🟡 Fase 5 — Médio impacto

### 5. MRR e métricas SaaS no dashboard
- MRR (Receita Recorrente Mensal)
- Churn Rate mensal
- LTV médio por membro
- Comparativo mês anterior (delta %)
Nova seção no dashboard abaixo dos stat cards existentes.

### 6. Pipeline de follow-ups (Kanban)
Nova página `/pipeline` com colunas: "Para Contatar", "Em Contato", "Resolvido".
Tabela `follow_ups` no Supabase: member_id, status, assigned_to, notes, due_date.
Drag & drop entre colunas (ou botões simples para mover).

### 7. Relatórios com templates
Templates pré-definidos na página /reports/new:
- "Sessão de Mentoria" (campos: data, tema, próximos passos)
- "Revisão Mensal" (campos: progresso, obstáculos, metas)
- "Primeiro Contato"
Selecionar template pré-preenche o editor com estrutura.

### 8. Tags automáticas
Página /settings/automations com regras configuráveis:
- "Se sem posts no Circle em 30 dias → aplicar tag Inativo"
- "Se chargeback → aplicar tag Risco"
- "Se membro há menos de 7 dias → aplicar tag Novo Membro"
Cron job ou trigger manual que roda as regras.

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
