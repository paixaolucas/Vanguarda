import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const DAY_NAMES = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

interface SearchParams {
  year?: string
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

interface DayData {
  members: number
  revenue: number
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { year: yearParam } = await searchParams
  const currentYear = parseInt(yearParam ?? String(new Date().getFullYear()), 10)
  const today = new Date()

  const supabase = await createClient()

  const yearStart = `${currentYear}-01-01T00:00:00.000Z`
  const yearEnd = `${currentYear}-12-31T23:59:59.999Z`

  const [{ data: yearMembers }, { data: yearTransactions }] = await Promise.all([
    supabase
      .from('members')
      .select('created_at')
      .gte('created_at', yearStart)
      .lte('created_at', yearEnd),
    supabase
      .from('transactions')
      .select('transaction_date, amount')
      .eq('status', 'approved')
      .gte('transaction_date', yearStart)
      .lte('transaction_date', yearEnd),
  ])

  // Build day-keyed map
  const dayMap: Record<string, DayData> = {}

  for (const m of yearMembers ?? []) {
    const key = m.created_at.slice(0, 10)
    if (!dayMap[key]) dayMap[key] = { members: 0, revenue: 0 }
    dayMap[key].members++
  }

  for (const tx of yearTransactions ?? []) {
    const date = tx.transaction_date?.slice(0, 10)
    if (!date) continue
    if (!dayMap[date]) dayMap[date] = { members: 0, revenue: 0 }
    dayMap[date].revenue += tx.amount ?? 0
  }

  // Year totals
  const totalMembers = Object.values(dayMap).reduce((s, d) => s + d.members, 0)
  const totalRevenue = Object.values(dayMap).reduce((s, d) => s + d.revenue, 0)

  const prevYear = currentYear - 1
  const nextYear = currentYear + 1

  return (
    <div>
      <PageHeader
        title="Calendário"
        description="Visão anual de membros e receita"
        action={
          <div className="flex items-center gap-3">
            <Link
              href={`/calendar?year=${prevYear}`}
              className="flex items-center justify-center w-7 h-7 border border-[#222] text-white/50 hover:text-white hover:border-[#333] transition-colors"
            >
              <ChevronLeft size={14} />
            </Link>
            <span className="text-sm font-medium text-white w-12 text-center">{currentYear}</span>
            <Link
              href={`/calendar?year=${nextYear}`}
              className="flex items-center justify-center w-7 h-7 border border-[#222] text-white/50 hover:text-white hover:border-[#333] transition-colors"
            >
              <ChevronRight size={14} />
            </Link>
          </div>
        }
      />

      {/* Year summary */}
      <div className="flex items-center gap-6 mb-8 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white/60 inline-block" />
          <span className="text-white/50">
            <span className="text-white font-medium">{totalMembers}</span> novos membros em {currentYear}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500/70 inline-block" />
          <span className="text-white/50">
            <span className="text-white font-medium">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
            </span> em receita aprovada
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6 text-xs text-white/30">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white/50" /> Novo membro
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500/70" /> Receita
        </span>
      </div>

      {/* 12 month grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }, (_, monthIndex) => {
          const daysInMonth = getDaysInMonth(currentYear, monthIndex)
          const firstDow = getFirstDayOfWeek(currentYear, monthIndex)
          const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === monthIndex

          // Month totals
          const monthMembers = Array.from({ length: daysInMonth }, (_, d) => {
            const key = toDateKey(currentYear, monthIndex, d + 1)
            return dayMap[key]?.members ?? 0
          }).reduce((s, v) => s + v, 0)

          const monthRevenue = Array.from({ length: daysInMonth }, (_, d) => {
            const key = toDateKey(currentYear, monthIndex, d + 1)
            return dayMap[key]?.revenue ?? 0
          }).reduce((s, v) => s + v, 0)

          return (
            <div
              key={monthIndex}
              className={`bg-[#0a0a0a] border p-4 ${isCurrentMonth ? 'border-white/20' : 'border-[#1a1a1a]'}`}
            >
              {/* Month header */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-medium ${isCurrentMonth ? 'text-white' : 'text-white/60'}`}>
                  {MONTH_NAMES[monthIndex]}
                  {isCurrentMonth && <span className="ml-1.5 text-[9px] px-1 border border-white/20 text-white/40">Atual</span>}
                </span>
                <div className="text-right">
                  {monthMembers > 0 && (
                    <span className="text-[10px] text-white/40">{monthMembers} membros</span>
                  )}
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAY_NAMES.map((d, i) => (
                  <div key={i} className="text-center text-[9px] text-white/20 py-0.5">{d}</div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-px">
                {/* Empty cells before first day */}
                {Array.from({ length: firstDow }, (_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }, (_, dayIndex) => {
                  const day = dayIndex + 1
                  const key = toDateKey(currentYear, monthIndex, day)
                  const data = dayMap[key]
                  const isToday =
                    today.getFullYear() === currentYear &&
                    today.getMonth() === monthIndex &&
                    today.getDate() === day

                  return (
                    <div
                      key={day}
                      className={`relative flex flex-col items-center py-0.5 rounded-sm ${
                        isToday ? 'bg-white/10' : data ? 'hover:bg-white/5' : ''
                      }`}
                      title={data ? `${data.members} membros, R$ ${data.revenue.toFixed(2)}` : undefined}
                    >
                      <span className={`text-[10px] leading-none mb-0.5 ${
                        isToday ? 'text-white font-medium' : 'text-white/40'
                      }`}>
                        {day}
                      </span>
                      {/* Dots */}
                      <div className="flex gap-px min-h-[4px]">
                        {data?.members > 0 && (
                          <span className="w-1 h-1 rounded-full bg-white/60" />
                        )}
                        {data?.revenue > 0 && (
                          <span className="w-1 h-1 rounded-full bg-green-500/70" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Month revenue footer */}
              {monthRevenue > 0 && (
                <div className="mt-3 pt-2 border-t border-[#1a1a1a]">
                  <p className="text-[10px] text-white/30 text-right">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthRevenue)}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
