import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/ui/StatCard'
import Badge, { statusBadge, statusLabel } from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import FinancialFilters from '@/components/financial/FinancialFilters'
import Pagination from '@/components/Pagination'
import { DollarSign, TrendingDown, AlertTriangle, RefreshCw, Download } from 'lucide-react'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

interface SearchParams {
  platform?: string
  status?: string
  from?: string
  to?: string
  page?: string
}

function formatCurrency(value: number | null) {
  if (!value) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default async function FinancialPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { platform, status, from, to, page } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? '1', 10))
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { data: approvedThisMonth },
    { count: chargebackCount },
    { count: refundCount },
    { count: cancellationCount },
  ] = await Promise.all([
    supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'approved')
      .gte('transaction_date', startOfMonth),
    supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'chargeback'),
    supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'refund'),
    supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'cancellation')
      .gte('transaction_date', startOfMonth),
  ])

  const revenueThisMonth = (approvedThisMonth ?? []).reduce(
    (sum, t) => sum + (t.amount ?? 0),
    0
  )

  let baseQuery = supabase
    .from('transactions')
    .select('*, members(name, email)', { count: 'exact' })
    .order('transaction_date', { ascending: false })

  let countQuery = supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })

  if (platform) {
    baseQuery = baseQuery.eq('platform', platform)
    countQuery = countQuery.eq('platform', platform)
  }
  if (status) {
    baseQuery = baseQuery.eq('status', status)
    countQuery = countQuery.eq('status', status)
  }
  if (from) {
    baseQuery = baseQuery.gte('transaction_date', from)
    countQuery = countQuery.gte('transaction_date', from)
  }
  if (to) {
    baseQuery = baseQuery.lte('transaction_date', to)
    countQuery = countQuery.lte('transaction_date', to)
  }

  const [{ data: transactions }, { count: totalItems }] = await Promise.all([
    baseQuery.range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1),
    countQuery,
  ])

  const totalPages = Math.ceil((totalItems ?? 0) / PAGE_SIZE)

  const csvParams = new URLSearchParams()
  if (platform) csvParams.set('platform', platform)
  if (status) csvParams.set('status', status)
  if (from) csvParams.set('from', from)
  if (to) csvParams.set('to', to)
  const csvHref = `/api/export/transactions${csvParams.toString() ? `?${csvParams}` : ''}`

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Controle financeiro e transações"
        action={
          <a
            href={csvHref}
            download="transacoes.csv"
            className="flex items-center gap-1.5 text-xs border border-[#222] px-3 py-1.5 text-white/50 hover:text-white hover:border-[#333] transition-colors"
          >
            <Download size={12} />
            Exportar CSV
          </a>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Receita do Mês"
          value={formatCurrency(revenueThisMonth)}
          icon={DollarSign}
          success={revenueThisMonth > 0}
        />
        <StatCard
          title="Cancelamentos"
          value={cancellationCount ?? 0}
          icon={TrendingDown}
          alert={(cancellationCount ?? 0) > 0}
          description="Este mês"
        />
        <StatCard
          title="Chargebacks"
          value={chargebackCount ?? 0}
          icon={AlertTriangle}
          alert={(chargebackCount ?? 0) > 0}
          description="Total histórico"
        />
        <StatCard
          title="Reembolsos"
          value={refundCount ?? 0}
          icon={RefreshCw}
          alert={(refundCount ?? 0) > 0}
          description="Total histórico"
        />
      </div>

      {(chargebackCount ?? 0) > 0 && (
        <div className="mb-6 border border-red-800/40 bg-red-950/10 px-5 py-4 flex items-center gap-3">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-400">
            <strong>{chargebackCount}</strong> chargeback{(chargebackCount ?? 0) !== 1 ? 's' : ''} registrado{(chargebackCount ?? 0) !== 1 ? 's' : ''} no histórico. Verifique as transações abaixo.
          </p>
        </div>
      )}

      <FinancialFilters />

      <div className="border border-[#1a1a1a] bg-[#0a0a0a] mt-4">
        {!transactions || transactions.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="Nenhuma transação encontrada"
            description="As transações aparecerão aqui quando chegarem via webhook"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left text-xs text-white/30 uppercase tracking-wider px-5 py-3 font-medium">Membro</th>
                  <th className="text-left text-xs text-white/30 uppercase tracking-wider px-5 py-3 font-medium hidden sm:table-cell">Plataforma</th>
                  <th className="text-left text-xs text-white/30 uppercase tracking-wider px-5 py-3 font-medium">Evento</th>
                  <th className="text-left text-xs text-white/30 uppercase tracking-wider px-5 py-3 font-medium hidden md:table-cell">Status</th>
                  <th className="text-left text-xs text-white/30 uppercase tracking-wider px-5 py-3 font-medium">Valor</th>
                  <th className="text-left text-xs text-white/30 uppercase tracking-wider px-5 py-3 font-medium hidden lg:table-cell">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0f0f0f]">
                {transactions.map(tx => {
                  const member = tx.members as { name: string | null; email: string | null } | null
                  const isAlert = tx.event_type === 'chargeback' || tx.event_type === 'refund'
                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-[#111] transition-colors ${isAlert ? 'border-l-2 border-l-red-900/50' : ''}`}
                    >
                      <td className="px-5 py-3.5 text-white">
                        {member?.name ?? member?.email ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <Badge variant="muted">
                          {tx.platform ? statusLabel[tx.platform] ?? tx.platform : '—'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={isAlert ? 'text-red-400' : 'text-white/70'}>
                          {tx.event_type ? statusLabel[tx.event_type] ?? tx.event_type : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <Badge variant={statusBadge(tx.status)}>
                          {tx.status ? statusLabel[tx.status] ?? tx.status : '—'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-white font-medium">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-white/30 text-xs hidden lg:table-cell">
                        {tx.transaction_date
                          ? format(new Date(tx.transaction_date), 'dd/MM/yyyy HH:mm')
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems ?? 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  )
}
