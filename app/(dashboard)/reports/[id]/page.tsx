import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import ReportForm from '@/components/reports/ReportForm'
import Link from 'next/link'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: report }, { data: members }] = await Promise.all([
    supabase
      .from('reports')
      .select('*, members(name, email)')
      .eq('id', id)
      .single(),
    supabase.from('members').select('id, name, email').order('name', { ascending: true }),
  ])

  if (!report) notFound()

  const member = report.members as { name: string | null; email: string | null } | null

  return (
    <div>
      <PageHeader
        title={report.title ?? 'Relatório'}
        description={
          member
            ? `${member.name ?? member.email} • ${format(new Date(report.created_at), 'dd/MM/yyyy')}`
            : format(new Date(report.created_at), 'dd/MM/yyyy')
        }
        action={
          <Link href="/reports" className="text-xs text-white/30 hover:text-white transition-colors">
            ← Voltar
          </Link>
        }
      />
      <div className="max-w-3xl">
        <ReportForm
          members={members ?? []}
          report={{
            id: report.id,
            title: report.title,
            content: report.content,
            member_id: report.member_id,
          }}
        />
      </div>
    </div>
  )
}
