import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/ui/StatCard'
import Badge, { statusBadge, statusLabel } from '@/components/ui/Badge'
import BarChart from '@/components/BarChart'
import { Users, TrendingDown, DollarSign, UserPlus, Activity, ArrowRight, BarChart2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Suspense } from 'react'
import { SkeletonBlock } from '@/components/ui/PageSkeleton'

export const dynamic = 'force-dynamic'

function formatCurrency(value: number | null) {
  if (!value) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatCurrencyShort(value: number): string {
  if (value >= 1000) return `R$${(value / 1000).toFixed(1)}k`
  return `R$${value.toFixed(0)}`
}

// Fast: stats only
async function DashboardStats() {
  const supabase = await createClient()
  const now = new Date()
  const startOfCurrentMonth = startOfMonth(now).toISOString()

  const [
    { count: totalActive },
    { count: newThisMonth },
    { count: cancellationsThisMonth },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
    supabase.from('members').select('*', { count: 'exact', head: true }).gte('created_at', startOfCurrentMonth),
    supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('event_type', 'cancellation').gte('transaction_date', startOfCurrentMonth),
    supabase.from('transactions').select('amount').eq('status', 'approved').gte('transaction_date', startOfCurrentMonth),
  ])

  const revenueThisMonth = (revenueData ?? []).reduce((sum, t) => sum + (t.amount ?? 0), 0)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard title="Membros Ativos" value={totalActive ?? 0} icon={Users} description="Total na plataforma" />
      <StatCard title="Novos este Mês" value={newThisMonth ?? 0} icon={UserPlus} description="Desde o início do mês" success />
      <StatCard title="Cancelamentos" value={cancellationsThisMonth ?? 0} icon={TrendingDown} description="Este mês" alert={(cancellationsThisMonth ?? 0) > 0} />
      <StatCard title="Receita do Mês" value={formatCurrency(revenueThisMonth)} icon={DollarSign} description="Transações aprovadas" success={revenueThisMonth > 0} />
    </div>
  )
}

// Deferred: charts
async function DashboardCharts() {
  const supabase = await createClient()
  const now = new Date()

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i)
    return {
      label: format(d, 'MMM', { locale: ptBR }),
      start: startOfMonth(d).toISOString(),
      end: endOfMonth(d).toISOString(),
    }
  })

  const [{ data: monthlyTransactions }, { data: monthlyMembers }] = await Promise.all([
    supabase.from('transactions').select('amount, transaction_date').eq('status', 'approved').gte('transaction_date', months[0].start).lte('transaction_date', months[5].end),
    supabase.from('members').select('created_at').gte('created_at', months[0].start).lte('created_at', months[5].end),
  ])

  const revenueByMonth = months.map(m => ({
    label: m.label,
    value: (monthlyTransactions ?? []).filter(t => t.transaction_date >= m.start && t.transaction_date <= m.end).reduce((sum, t) => sum + (t.amount ?? 0), 0),
  }))

  const membersByMonth = months.map(m => ({
    label: m.label,
    value: (monthlyMembers ?? []).filter(mb => mb.created_at >= m.start && mb.created_at <= m.end).length,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 size={14} className="text-white/40" />
          <span className="text-sm font-medium text-white">Receita por Mês</span>
          <span className="text-xs text-white/30 ml-auto">últimos 6 meses</span>
        </div>
        <BarChart data={revenueByMonth} formatValue={formatCurrencyShort} />
      </div>
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
        <div className="flex items-center gap-2 mb-5">
          <UserPlus size={14} className="text-white/40" />
          <span className="text-sm font-medium text-white">Novos Membros por Mês</span>
          <span className="text-xs text-white/30 ml-auto">últimos 6 meses</span>
        </div>
        <BarChart data={membersByMonth} formatValue={v => String(v)} />
      </div>
    </div>
  )
}

// Deferred: attention alerts
async function DashboardAlerts() {
  const supabase = await createClient()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: inadimplentes },
    { data: recentCircleActivity },
    { data: activeMembers },
    { data: chargebacks },
  ] = await Promise.all([
    supabase.from('members').select('id, name, email, updated_at').eq('status', 'inadimplente').lt('updated_at', sevenDaysAgo).limit(5),
    supabase.from('circle_activity').select('member_id').gte('occurred_at', thirtyDaysAgo),
    supabase.from('members').select('id, name, email').eq('status', 'ativo').limit(200),
    supabase.from('transactions').select('id, member_id, created_at, members(name, email)').eq('event_type', 'chargeback').order('created_at', { ascending: false }).limit(5),
  ])

  const recentCircleMemberIds = new Set((recentCircleActivity ?? []).map(a => a.member_id))
  const inactiveOnCircle = (activeMembers ?? [])
    .filter(m => !recentCircleMemberIds.has(m.id))
    .slice(0, 5)

  const totalAlerts = (inadimplentes?.length ?? 0) + inactiveOnCircle.length + (chargebacks?.length ?? 0)

  if (totalAlerts === 0) return null

  return (
    <div className="mb-6">
      <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[#1a1a1a]">
          <AlertTriangle size={14} className="text-yellow-400" />
          <span className="text-sm font-medium text-white">Requer Atenção</span>
          <span className="ml-auto text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-800/40 px-2 py-0.5">
            {totalAlerts} {totalAlerts === 1 ? 'item' : 'itens'}
          </span>
        </div>

        <div className="divide-y divide-[#111]">
          {/* Inadimplentes > 7 dias */}
          {(inadimplentes ?? []).map(m => (
            <Link key={m.id} href={`/members/${m.id}`} className="flex items-start gap-3 px-5 py-3 hover:bg-[#111] transition-colors">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-400 mt-2" />
              <div className="min-w-0">
                <p className="text-sm text-white">{m.name ?? m.email}</p>
                <p className="text-xs text-white/30">Inadimplente há mais de 7 dias</p>
              </div>
              <ArrowRight size={12} className="text-white/20 flex-shrink-0 mt-1.5" />
            </Link>
          ))}

          {/* Sem acesso Circle > 30 dias */}
          {inactiveOnCircle.map(m => (
            <Link key={m.id} href={`/members/${m.id}`} className="flex items-start gap-3 px-5 py-3 hover:bg-[#111] transition-colors">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2" />
              <div className="min-w-0">
                <p className="text-sm text-white">{m.name ?? m.email}</p>
                <p className="text-xs text-white/30">Sem atividade no Circle há mais de 30 dias</p>
              </div>
              <ArrowRight size={12} className="text-white/20 flex-shrink-0 mt-1.5" />
            </Link>
          ))}

          {/* Chargebacks recentes */}
          {(chargebacks ?? []).map(cb => {
            const rawMember = cb.members
            const member = (Array.isArray(rawMember) ? rawMember[0] : rawMember) as { name: string | null; email: string | null } | null
            return (
              <Link key={cb.id} href={`/members/${cb.member_id}`} className="flex items-start gap-3 px-5 py-3 hover:bg-[#111] transition-colors">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-orange-400 mt-2" />
                <div className="min-w-0">
                  <p className="text-sm text-white">{member?.name ?? member?.email ?? 'Membro desconhecido'}</p>
                  <p className="text-xs text-white/30">
                    Chargeback em {cb.created_at ? format(new Date(cb.created_at), 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                  </p>
                </div>
                <ArrowRight size={12} className="text-white/20 flex-shrink-0 mt-1.5" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Deferred: activity feeds
async function DashboardFeeds() {
  const supabase = await createClient()
  const [{ data: recentActivity }, { data: recentTransactions }] = await Promise.all([
    supabase.from('circle_activity').select('*, members(name, email)').order('occurred_at', { ascending: false }).limit(8),
    supabase.from('transactions').select('*, members(name, email)').order('created_at', { ascending: false }).limit(8),
  ])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Circle Activity */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-white/40" />
            <span className="text-sm font-medium text-white">Atividade Circle</span>
          </div>
          <Link href="/members" className="flex items-center gap-1 text-xs text-white/30 hover:text-white transition-colors">
            Ver membros <ArrowRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-[#111]">
          {!recentActivity || recentActivity.length === 0 ? (
            <div className="px-5 py-8 text-center text-xs text-white/30">Nenhuma atividade registrada</div>
          ) : (
            recentActivity.map((activity) => {
              const member = activity.members as { name: string | null; email: string | null } | null
              return (
                <div key={activity.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{member?.name ?? member?.email ?? 'Membro desconhecido'}</p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {activity.event_type ? statusLabel[activity.event_type] ?? activity.event_type : '—'}
                    </p>
                  </div>
                  <span className="text-xs text-white/20">
                    {activity.occurred_at ? format(new Date(activity.occurred_at), 'dd/MM HH:mm') : '—'}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-white/40" />
            <span className="text-sm font-medium text-white">Transações Recentes</span>
          </div>
          <Link href="/financial" className="flex items-center gap-1 text-xs text-white/30 hover:text-white transition-colors">
            Ver todas <ArrowRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-[#111]">
          {!recentTransactions || recentTransactions.length === 0 ? (
            <div className="px-5 py-8 text-center text-xs text-white/30">Nenhuma transação registrada</div>
          ) : (
            recentTransactions.map((tx) => {
              const member = tx.members as { name: string | null; email: string | null } | null
              return (
                <div key={tx.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{member?.name ?? member?.email ?? 'Membro desconhecido'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/30">
                        {tx.event_type ? statusLabel[tx.event_type] ?? tx.event_type : '—'}
                      </span>
                      <Badge variant={statusBadge(tx.status)}>
                        {tx.status ? statusLabel[tx.status] ?? tx.status : '—'}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-white">{formatCurrency(tx.amount)}</span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const now = new Date()

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Visão geral — ${format(now, 'MMMM yyyy', { locale: ptBR })}`}
      />

      {/* Stats load first */}
      <Suspense fallback={
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-24" />)}
        </div>
      }>
        <DashboardStats />
      </Suspense>

      {/* Alerts deferred */}
      <Suspense fallback={null}>
        <DashboardAlerts />
      </Suspense>

      {/* Charts deferred */}
      <Suspense fallback={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SkeletonBlock className="h-48" />
          <SkeletonBlock className="h-48" />
        </div>
      }>
        <DashboardCharts />
      </Suspense>

      {/* Activity feeds deferred */}
      <Suspense fallback={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonBlock className="h-64" />
          <SkeletonBlock className="h-64" />
        </div>
      }>
        <DashboardFeeds />
      </Suspense>
    </div>
  )
}
