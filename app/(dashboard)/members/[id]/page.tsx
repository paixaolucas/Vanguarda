import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import Badge, { statusBadge, statusLabel } from '@/components/ui/Badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { User, CreditCard, Activity, FileText, MessageSquare, Clock, GitBranch, Zap } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import MemberNoteForm from '@/components/members/MemberNoteForm'
import MemberTagsManager from '@/components/members/MemberTagsManager'
import MemberStatusEditor from '@/components/members/MemberStatusEditor'
import MemberEditForm from '@/components/members/MemberEditForm'
import { SkeletonBlock } from '@/components/ui/PageSkeleton'

export const dynamic = 'force-dynamic'

function formatCurrency(value: number | null) {
  if (!value) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function SectionSkeleton() {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
      <div className="px-5 py-4 border-b border-[#1a1a1a]">
        <SkeletonBlock className="h-4 w-32" />
      </div>
      <div className="p-5 space-y-3">
        {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-10" />)}
      </div>
    </div>
  )
}

// Async section components — each fetches its own data

async function MemberTransactions({ memberId }: { memberId: string }) {
  const supabase = await createClient()
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('member_id', memberId)
    .order('transaction_date', { ascending: false })
    .limit(20)

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[#1a1a1a]">
        <CreditCard size={14} className="text-white/40" />
        <span className="text-sm font-medium text-white">Histórico Financeiro</span>
        {transactions && transactions.length > 0 && (
          <span className="ml-auto text-xs text-white/20">{transactions.length}</span>
        )}
      </div>
      {!transactions || transactions.length === 0 ? (
        <p className="text-xs text-white/30 text-center py-8">Sem transações</p>
      ) : (
        <div className="divide-y divide-[#111]">
          {transactions.map(tx => (
            <div key={tx.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white">
                    {tx.event_type ? statusLabel[tx.event_type] ?? tx.event_type : '—'}
                  </span>
                  <Badge variant={statusBadge(tx.status)}>
                    {tx.status ? statusLabel[tx.status] ?? tx.status : '—'}
                  </Badge>
                </div>
                <p className="text-xs text-white/30 mt-0.5">
                  {tx.platform ? statusLabel[tx.platform] ?? tx.platform : '—'}
                  {tx.transaction_date ? ` • ${format(new Date(tx.transaction_date), 'dd/MM/yyyy HH:mm')}` : ''}
                </p>
              </div>
              <span className="text-sm font-medium text-white">{formatCurrency(tx.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

async function MemberCircleActivity({ memberId }: { memberId: string }) {
  const supabase = await createClient()
  const { data: circleActivity } = await supabase
    .from('circle_activity')
    .select('*')
    .eq('member_id', memberId)
    .order('occurred_at', { ascending: false })
    .limit(20)

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[#1a1a1a]">
        <Activity size={14} className="text-white/40" />
        <span className="text-sm font-medium text-white">Atividade Circle</span>
        {circleActivity && circleActivity.length > 0 && (
          <span className="ml-auto text-xs text-white/20">{circleActivity.length}</span>
        )}
      </div>
      {!circleActivity || circleActivity.length === 0 ? (
        <p className="text-xs text-white/30 text-center py-8">Sem atividade registrada</p>
      ) : (
        <div className="divide-y divide-[#111]">
          {circleActivity.map(act => (
            <div key={act.id} className="px-5 py-3 flex items-center justify-between">
              <span className="text-sm text-white">
                {act.event_type ? statusLabel[act.event_type] ?? act.event_type : '—'}
              </span>
              <span className="text-xs text-white/30">
                {act.occurred_at
                  ? format(new Date(act.occurred_at), 'dd/MM/yyyy HH:mm')
                  : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

async function MemberReports({ memberId }: { memberId: string }) {
  const supabase = await createClient()
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-white/40" />
          <span className="text-sm font-medium text-white">Relatórios</span>
        </div>
        <Link
          href={`/reports/new?member_id=${memberId}`}
          className="text-xs text-white/30 hover:text-white transition-colors"
        >
          + Novo
        </Link>
      </div>
      {!reports || reports.length === 0 ? (
        <p className="text-xs text-white/30 text-center py-8">Sem relatórios</p>
      ) : (
        <div className="divide-y divide-[#111]">
          {reports.map(report => (
            <Link
              key={report.id}
              href={`/reports/${report.id}`}
              className="px-5 py-3 flex items-center justify-between hover:bg-[#111] transition-colors block"
            >
              <span className="text-sm text-white">{report.title ?? 'Sem título'}</span>
              <span className="text-xs text-white/30">
                {format(new Date(report.created_at), 'dd/MM/yyyy')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

async function MemberNotes({ memberId }: { memberId: string }) {
  const supabase = await createClient()
  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[#1a1a1a]">
        <MessageSquare size={14} className="text-white/40" />
        <span className="text-sm font-medium text-white">Notas Internas</span>
      </div>
      <div className="p-5">
        <MemberNoteForm memberId={memberId} />
      </div>
      {notes && notes.length > 0 && (
        <div className="border-t border-[#1a1a1a] divide-y divide-[#111]">
          {notes.map(note => (
            <div key={note.id} className="px-5 py-4">
              <p className="text-sm text-white/80 whitespace-pre-wrap">{note.note}</p>
              <p className="text-xs text-white/20 mt-2">
                {format(new Date(note.created_at), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

async function MemberStatusHistory({ memberId }: { memberId: string }) {
  const supabase = await createClient()
  const { data: statusHistory } = await supabase
    .from('member_status_history')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (!statusHistory || statusHistory.length === 0) return null

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={14} className="text-white/40" />
        <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Histórico de Status</span>
      </div>
      <div className="relative">
        <div className="absolute left-1.5 top-0 bottom-0 w-px bg-[#222]" />
        <div className="space-y-4">
          {statusHistory.map((entry) => (
            <div key={entry.id} className="pl-6 relative">
              <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full border border-[#333] bg-[#0a0a0a]" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {entry.from_status && (
                    <>
                      <Badge variant={statusBadge(entry.from_status)}>
                        {statusLabel[entry.from_status] ?? entry.from_status}
                      </Badge>
                      <span className="text-white/30 text-xs">→</span>
                    </>
                  )}
                  <Badge variant={statusBadge(entry.to_status)}>
                    {statusLabel[entry.to_status] ?? entry.to_status}
                  </Badge>
                </div>
                {entry.reason && (
                  <p className="text-[11px] text-white/30 mt-1">{entry.reason}</p>
                )}
                <p className="text-[10px] text-white/20 mt-0.5">
                  {format(new Date(entry.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

async function MemberEngagementScore({ memberId }: { memberId: string }) {
  const supabase = await createClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: circleActivity }, { data: approvedTx }, { data: chargebacks }] = await Promise.all([
    supabase.from('circle_activity').select('event_type').eq('member_id', memberId).gte('occurred_at', thirtyDaysAgo),
    supabase.from('transactions').select('id').eq('member_id', memberId).eq('status', 'approved'),
    supabase.from('transactions').select('id').eq('member_id', memberId).eq('event_type', 'chargeback'),
  ])

  const posts = (circleActivity ?? []).filter(a => a.event_type === 'post_created').length
  const comments = (circleActivity ?? []).filter(a => a.event_type === 'comment').length
  const approved = (approvedTx ?? []).length
  const cbs = (chargebacks ?? []).length

  // Score: circle activity up to 50pts, financial health up to 50pts
  const circleScore = Math.min(50, posts * 10 + comments * 5)
  const financeBase = approved > 0 ? Math.min(50, approved * 10) : 0
  const financePenalty = cbs * 20
  const financeScore = Math.max(0, financeBase - financePenalty)
  const total = Math.min(100, circleScore + financeScore)

  const color = total >= 70 ? 'text-green-400' : total >= 40 ? 'text-yellow-400' : 'text-red-400'
  const barColor = total >= 70 ? 'bg-green-500' : total >= 40 ? 'bg-yellow-500' : 'bg-red-500'
  const label = total >= 70 ? 'Alto' : total >= 40 ? 'Médio' : 'Baixo'

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={14} className="text-white/40" />
        <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Score de Engajamento</span>
        <span className={`ml-auto text-lg font-bold ${color}`}>{total}</span>
      </div>
      <div className="w-full h-1.5 bg-[#1a1a1a] mb-3">
        <div className={`h-full transition-all ${barColor}`} style={{ width: `${total}%` }} />
      </div>
      <div className="flex items-center justify-between text-[11px] text-white/30">
        <span className={color}>{label} engajamento</span>
        <span>0 — 100</span>
      </div>
      <div className="mt-3 space-y-1.5 text-[11px] text-white/30">
        <div className="flex justify-between">
          <span>Posts Circle (30 dias)</span>
          <span className="text-white/50">{posts} post{posts !== 1 ? 's' : ''} · {comments} coment{comments !== 1 ? 'ários' : 'ário'}</span>
        </div>
        <div className="flex justify-between">
          <span>Transações aprovadas</span>
          <span className="text-white/50">{approved}</span>
        </div>
        {cbs > 0 && (
          <div className="flex justify-between text-red-400/60">
            <span>Chargebacks</span>
            <span>{cbs}</span>
          </div>
        )}
      </div>
    </div>
  )
}

async function MemberTimeline({ memberId }: { memberId: string }) {
  const supabase = await createClient()

  const [
    { data: transactions },
    { data: circleActivity },
    { data: notes },
    { data: reports },
    { data: statusHistory },
  ] = await Promise.all([
    supabase.from('transactions').select('id, event_type, status, amount, transaction_date, platform').eq('member_id', memberId).order('transaction_date', { ascending: false }).limit(30),
    supabase.from('circle_activity').select('id, event_type, occurred_at').eq('member_id', memberId).order('occurred_at', { ascending: false }).limit(30),
    supabase.from('notes').select('id, note, created_at').eq('member_id', memberId).order('created_at', { ascending: false }).limit(20),
    supabase.from('reports').select('id, title, created_at').eq('member_id', memberId).order('created_at', { ascending: false }).limit(20),
    supabase.from('member_status_history').select('id, from_status, to_status, reason, created_at').eq('member_id', memberId).order('created_at', { ascending: false }).limit(20),
  ])

  type TimelineEvent = {
    id: string
    date: string
    type: 'transaction' | 'circle' | 'note' | 'report' | 'status'
    label: string
    sub?: string
    badge?: string
    badgeVariant?: string
    href?: string
  }

  const events: TimelineEvent[] = [
    ...(transactions ?? []).map(t => ({
      id: `tx-${t.id}`,
      date: t.transaction_date ?? '',
      type: 'transaction' as const,
      label: t.event_type ? statusLabel[t.event_type] ?? t.event_type : 'Transação',
      sub: `${t.platform ? statusLabel[t.platform] ?? t.platform : ''} • ${formatCurrency(t.amount)}`,
      badge: t.status ?? '',
    })),
    ...(circleActivity ?? []).map(a => ({
      id: `ca-${a.id}`,
      date: a.occurred_at ?? '',
      type: 'circle' as const,
      label: a.event_type ? statusLabel[a.event_type] ?? a.event_type : 'Atividade Circle',
    })),
    ...(notes ?? []).map(n => ({
      id: `note-${n.id}`,
      date: n.created_at ?? '',
      type: 'note' as const,
      label: 'Nota interna',
      sub: n.note?.slice(0, 60) + (n.note && n.note.length > 60 ? '…' : ''),
    })),
    ...(reports ?? []).map(r => ({
      id: `rep-${r.id}`,
      date: r.created_at ?? '',
      type: 'report' as const,
      label: r.title ?? 'Relatório',
      href: `/reports/${r.id}`,
    })),
    ...(statusHistory ?? []).map(s => ({
      id: `sh-${s.id}`,
      date: s.created_at ?? '',
      type: 'status' as const,
      label: `Status: ${s.from_status ? `${statusLabel[s.from_status] ?? s.from_status} → ` : ''}${statusLabel[s.to_status] ?? s.to_status}`,
      sub: s.reason ?? undefined,
    })),
  ]

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (events.length === 0) return null

  const typeIcon: Record<string, string> = {
    transaction: '💳',
    circle: '⬡',
    note: '📝',
    report: '📄',
    status: '🔄',
  }

  const typeColor: Record<string, string> = {
    transaction: 'border-blue-900/40 bg-blue-950/10',
    circle: 'border-purple-900/40 bg-purple-950/10',
    note: 'border-yellow-900/40 bg-yellow-950/10',
    report: 'border-white/10 bg-white/5',
    status: 'border-green-900/40 bg-green-950/10',
  }

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[#1a1a1a]">
        <GitBranch size={14} className="text-white/40" />
        <span className="text-sm font-medium text-white">Timeline</span>
        <span className="ml-auto text-xs text-white/20">{events.length} eventos</span>
      </div>
      <div className="p-5">
        <div className="relative">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-[#1a1a1a]" />
          <div className="space-y-3">
            {events.map(event => {
              const content = (
                <div className={`pl-7 relative`}>
                  <div className={`absolute left-0 top-2 w-4 h-4 border flex items-center justify-center text-[8px] ${typeColor[event.type]}`}>
                    {typeIcon[event.type]}
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm text-white/80">{event.label}</p>
                      {event.sub && (
                        <p className="text-xs text-white/30 mt-0.5 truncate">{event.sub}</p>
                      )}
                      {event.badge && (
                        <Badge variant={statusBadge(event.badge)} className="mt-1">
                          {statusLabel[event.badge] ?? event.badge}
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-white/20 flex-shrink-0 pt-0.5">
                      {event.date ? format(new Date(event.date), 'dd/MM/yy HH:mm') : '—'}
                    </span>
                  </div>
                </div>
              )

              if (event.href) {
                return (
                  <a key={event.id} href={event.href} className="block hover:opacity-80 transition-opacity">
                    {content}
                  </a>
                )
              }
              return <div key={event.id}>{content}</div>
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

async function MemberSidebar({ memberId }: { memberId: string }) {
  const supabase = await createClient()
  const [{ data: memberTags }, { data: allTags }] = await Promise.all([
    supabase.from('member_tags').select('tag_id, tags(id, name, color)').eq('member_id', memberId),
    supabase.from('tags').select('*').order('name'),
  ])

  const memberTagIds = (memberTags ?? []).map(mt => mt.tag_id)
  const currentTags = (memberTags ?? [])
    .map(mt => {
      const t = mt.tags
      if (!t) return null
      const tag = Array.isArray(t) ? t[0] : t
      return tag as { id: string; name: string; color: string | null } | null
    })
    .filter(Boolean)

  return (
    <>
      <MemberTagsManager
        memberId={memberId}
        currentTagIds={memberTagIds}
        currentTags={currentTags as { id: string; name: string; color: string | null }[]}
        allTags={allTags ?? []}
      />
      <Suspense fallback={null}>
        <MemberStatusHistory memberId={memberId} />
      </Suspense>
    </>
  )
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Only fetch the core member data first — everything else is deferred
  const { data: member } = await supabase.from('members').select('*').eq('id', id).single()
  if (!member) notFound()

  return (
    <div>
      <PageHeader
        title={member.name ?? member.email ?? 'Membro'}
        description={member.email ?? undefined}
        action={
          <Link href="/members" className="text-xs text-white/30 hover:text-white transition-colors">
            ← Voltar
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* Profile Card */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <div className="flex items-center gap-2 mb-4">
              <User size={14} className="text-white/40" />
              <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Dados Pessoais</span>
            </div>
            <div className="space-y-3">
              <DataRow label="Nome" value={member.name} />
              <DataRow label="Email" value={member.email} mono={false} breakAll />
              <DataRow label="Telefone" value={member.phone} />
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Origem</p>
                {member.origin ? (
                  <Badge variant="muted">{statusLabel[member.origin] ?? member.origin}</Badge>
                ) : <p className="text-sm text-white">—</p>}
              </div>
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Membro desde</p>
                <p className="text-sm text-white">
                  {format(new Date(member.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
              {member.hotmart_id && <DataRow label="ID Hotmart" value={member.hotmart_id} mono />}
              {member.tmb_id && <DataRow label="ID TMB" value={member.tmb_id} mono />}
              {member.circle_member_id && <DataRow label="ID Circle" value={member.circle_member_id} mono />}
            </div>
          </div>

          <MemberEditForm memberId={member.id} initialData={member} />

          <MemberStatusEditor memberId={member.id} currentStatus={member.status ?? 'ativo'} />

          {/* Engagement score */}
          <Suspense fallback={<SkeletonBlock className="h-32" />}>
            <MemberEngagementScore memberId={member.id} />
          </Suspense>

          {/* Tags + status history load async */}
          <Suspense fallback={<SkeletonBlock className="h-24" />}>
            <MemberSidebar memberId={member.id} />
          </Suspense>
        </div>

        {/* Right column — all sections deferred */}
        <div className="lg:col-span-2 space-y-6">
          {/* Unified timeline */}
          <Suspense fallback={<SectionSkeleton />}>
            <MemberTimeline memberId={member.id} />
          </Suspense>

          <Suspense fallback={<SectionSkeleton />}>
            <MemberTransactions memberId={member.id} />
          </Suspense>

          <Suspense fallback={<SectionSkeleton />}>
            <MemberCircleActivity memberId={member.id} />
          </Suspense>

          <Suspense fallback={<SectionSkeleton />}>
            <MemberReports memberId={member.id} />
          </Suspense>

          <Suspense fallback={<SectionSkeleton />}>
            <MemberNotes memberId={member.id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function DataRow({
  label,
  value,
  mono = false,
  breakAll = false,
}: {
  label: string
  value: string | null | undefined
  mono?: boolean
  breakAll?: boolean
}) {
  return (
    <div>
      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm text-white ${mono ? 'font-mono text-xs text-white/50' : ''} ${breakAll ? 'break-all' : ''}`}>
        {value ?? '—'}
      </p>
    </div>
  )
}
