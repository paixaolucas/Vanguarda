import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import ReportForm from '@/components/reports/ReportForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function NewReportPage({
  searchParams,
}: {
  searchParams: Promise<{ member_id?: string }>
}) {
  const { member_id } = await searchParams
  const supabase = await createClient()
  const { data: members } = await supabase
    .from('members')
    .select('id, name, email')
    .order('name', { ascending: true })

  return (
    <div>
      <PageHeader
        title="Novo Relatório"
        description="Criar relatório individual de membro"
        action={
          <Link href="/reports" className="text-xs text-white/30 hover:text-white transition-colors">
            ← Voltar
          </Link>
        }
      />
      <div className="max-w-3xl">
        <ReportForm
          members={members ?? []}
          initialMemberId={member_id}
        />
      </div>
    </div>
  )
}
