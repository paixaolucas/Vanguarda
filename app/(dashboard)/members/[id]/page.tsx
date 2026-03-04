import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import Badge, { statusBadge, statusLabel } from '@/components/ui/Badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { User, CreditCard, Activity, FileText, MessageSquare, Clock } from 'lucide-react'
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

          {/* Tags + status history load async */}
          <Suspense fallback={<SkeletonBlock className="h-24" />}>
            <MemberSidebar memberId={member.id} />
          </Suspense>
        </div>

        {/* Right column — all sections deferred */}
        <div className="lg:col-span-2 space-y-6">
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
