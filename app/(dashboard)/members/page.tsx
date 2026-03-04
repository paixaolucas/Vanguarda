import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import Badge, { statusBadge, statusLabel } from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import MembersFilters from '@/components/members/MembersFilters'
import Pagination from '@/components/Pagination'
import { Users, Download } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

interface SearchParams {
  search?: string
  status?: string
  origin?: string
  page?: string
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { search, status, origin, page } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? '1', 10))
  const supabase = await createClient()

  let countQuery = supabase
    .from('members')
    .select('*', { count: 'exact', head: true })

  let query = supabase
    .from('members')
    .select('*, member_tags(tag_id, tags(id, name, color))')
    .order('created_at', { ascending: false })
    .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1)

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    countQuery = countQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  }
  if (status) {
    query = query.eq('status', status)
    countQuery = countQuery.eq('status', status)
  }
  if (origin) {
    query = query.eq('origin', origin)
    countQuery = countQuery.eq('origin', origin)
  }

  const [{ data: members }, { count: totalItems }] = await Promise.all([query, countQuery])

  const totalPages = Math.ceil((totalItems ?? 0) / PAGE_SIZE)

  const csvParams = new URLSearchParams()
  if (search) csvParams.set('search', search)
  if (status) csvParams.set('status', status)
  if (origin) csvParams.set('origin', origin)
  const csvHref = `/api/export/members${csvParams.toString() ? `?${csvParams}` : ''}`

  return (
    <div>
      <PageHeader
        title="Membros"
        description="Gerenciamento de membros do programa"
        action={
          <a
            href={csvHref}
            download="membros.csv"
            className="flex items-center gap-1.5 text-xs border border-[#222] px-3 py-1.5 text-white/50 hover:text-white hover:border-[#333] transition-colors"
          >
            <Download size={12} />
            Exportar CSV
          </a>
        }
      />

      <MembersFilters />

      <div className="border border-[#1a1a1a] bg-[#0a0a0a] mt-4">
        {!members || members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum membro encontrado"
            description={search ? 'Tente ajustar os filtros de busca' : 'Os membros aparecerão aqui quando forem sincronizados'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left text-xs text-white/30 uppercase tracking-wider px-5 py-3 font-medium">Nome</th>
                  <th className="text-left text-xs text-white/30 uppercase tracking-wider px-5 py-3 font-medium hidden sm:table-cell">Email</th>
                  <th className="text-left text-xs text-white/30 uppercase tracking-wider px-5 py-3 font-medium hidden md:table-cell">Status</th>
                  <th className="text-left text-xs text-white/30 uppercase tracking-wider px-5 py-3 font-medium hidden lg:table-cell">Origem</th>
                  <th className="text-left text-xs text-white/30 uppercase tracking-wider px-5 py-3 font-medium hidden xl:table-cell">Cadastro</th>
                  <th className="px-5 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0f0f0f]">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-[#111] transition-colors group">
                    <td className="px-5 py-3.5">
                      <Link href={`/members/${member.id}`} className="block">
                        <span className="text-white font-medium group-hover:text-white/80 transition-colors">
                          {member.name ?? '—'}
                        </span>
                        <span className="text-white/30 text-xs block sm:hidden mt-0.5">
                          {member.email}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-white/50 hidden sm:table-cell">
                      {member.email ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <Badge variant={statusBadge(member.status)}>
                        {member.status ? statusLabel[member.status] ?? member.status : '—'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      {member.origin ? (
                        <Badge variant="muted">
                          {statusLabel[member.origin] ?? member.origin}
                        </Badge>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-white/30 text-xs hidden xl:table-cell">
                      {format(new Date(member.created_at), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/members/${member.id}`}
                        className="text-white/20 hover:text-white text-xs transition-colors"
                      >
                        →
                      </Link>
                    </td>
                  </tr>
                ))}
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
