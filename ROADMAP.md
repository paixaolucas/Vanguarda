# Vanguarda — Roadmap de Melhorias

## 🔴 Fase 4 — Alto impacto (implementar primeiro)

### 1. Timeline unificada do membro
Linha do tempo cronológica única no perfil do membro mostrando tudo:
transações, atividade Circle, notas, reports, mudanças de status — em ordem de data.
Hoje cada seção fica separada; a timeline unifica tudo em uma view só.

### 2. Alertas de atenção no dashboard
Painel "Requer Atenção" na home com:
- Membros inadimplentes há +7 dias
- Membros sem acesso ao Circle há +30 dias
- Chargebacks recentes sem resolução
Query: members com status=inadimplente, circle_activity sem eventos recentes, transactions com event_type=chargeback recentes.

### 3. Score de engajamento
Score automático por membro (0–100) baseado em:
- Posts no Circle (circle_activity event_type=post_created)
- Comentários (event_type=comment)
- Transações em dia (status=approved, sem chargebacks)
Aparece no perfil e na lista de membros com filtro "Baixo Engajamento".
Coluna `engagement_score` calculada on-the-fly ou salva em members.

### 4. Busca global
Barra de busca no topo do Sidebar (ou header mobile).
Busca em tempo real por: nome, email, telefone → retorna membros.
Atalho de teclado: Cmd/Ctrl+K.
Componente client-side com debounce, dropdown de resultados.

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
