import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { ClipboardList } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const actionLabels: Record<string, string> = {
  'member.status_changed': 'Status alterado',
  'report.created': 'Relatório criado',
  'note.added': 'Nota adicionada',
  'member.updated': 'Membro atualizado',
  'api_key.saved': 'Chave API salva',
}

export default async function AuditLogPage() {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from('audit_log')
    .select('*, admins(email)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <PageHeader
        title="Log de Auditoria"
        description="Últimas 100 ações dos administradores"
        action={
          <Link href="/settings/api-keys" className="text-xs text-white/30 hover:text-white transition-colors">
            ← Configurações
          </Link>
        }
      />

      <div className="border border-[#1a1a1a] bg-[#0a0a0a]">
        {!logs || logs.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhuma ação registrada"
            description="As ações dos administradores aparecerão aqui"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left text-xs text-white/30 uppercase tracking-wider px-5 py-3 font-medium">Data</th>
                  <th className="text-left text-xs text-white/30 uppercase tracking-wider px-5 py-3 font-medium">Admin</th>
                  <th className="text-left text-xs text-white/30 uppercase tracking-wider px-5 py-3 font-medium">Ação</th>
                  <th className="text-left text-xs text-white/30 uppercase tracking-wider px-5 py-3 font-medium hidden md:table-cell">Tipo</th>
                  <th className="text-left text-xs text-white/30 uppercase tracking-wider px-5 py-3 font-medium hidden lg:table-cell">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0f0f0f]">
                {logs.map(log => {
                  const admin = log.admins as { email: string | null } | null
                  return (
                    <tr key={log.id} className="hover:bg-[#111] transition-colors">
                      <td className="px-5 py-3.5 text-white/30 text-xs whitespace-nowrap">
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </td>
                      <td className="px-5 py-3.5 text-white/50 text-xs">
                        {admin?.email ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 text-white text-xs">
                        {actionLabels[log.action] ?? log.action}
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        {log.target_type && (
                          <span className="text-[10px] px-1.5 py-0.5 border border-[#222] text-white/40">
                            {log.target_type}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-white/30">
                        {log.details
                          ? JSON.stringify(log.details).slice(0, 80)
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
    </div>
  )
}
