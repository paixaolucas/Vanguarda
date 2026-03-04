import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { FileText } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: reports } = await supabase
    .from('reports')
    .select('*, members(name, email)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader
        title="Relatórios"
        description="Relatórios individuais de membros"
        action={
          <Link
            href="/reports/new"
            className="bg-white text-black text-sm font-medium px-4 py-2.5 hover:bg-white/90 transition-colors"
          >
            + Novo Relatório
          </Link>
        }
      />

      <div className="border border-[#1a1a1a] bg-[#0a0a0a]">
        {!reports || reports.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum relatório criado"
            description="Crie o primeiro relatório clicando em 'Novo Relatório'"
          />
        ) : (
          <div className="divide-y divide-[#111]">
            {reports.map(report => {
              const member = report.members as { name: string | null; email: string | null } | null
              return (
                <Link
                  key={report.id}
                  href={`/reports/${report.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-[#111] transition-colors block"
                >
                  <div>
                    <p className="text-sm text-white font-medium">{report.title ?? 'Sem título'}</p>
                    <p className="text-xs text-white/30 mt-1">
                      {member?.name ?? member?.email ?? 'Membro não vinculado'}
                      {' • '}
                      {format(new Date(report.created_at), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <span className="text-white/20 text-xs">→</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
