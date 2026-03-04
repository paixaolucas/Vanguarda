import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import KanbanBoard from '@/components/pipeline/KanbanBoard'

export const dynamic = 'force-dynamic'

export default async function PipelinePage() {
  const supabase = await createClient()

  const [followUpsResult, membersResult] = await Promise.all([
    supabase
      .from('follow_ups')
      .select('*, members(id, name, email)')
      .order('created_at', { ascending: false }),
    supabase
      .from('members')
      .select('id, name, email')
      .order('name', { ascending: true }),
  ])

  const followUps = followUpsResult.data ?? []
  const members = membersResult.data ?? []

  return (
    <div>
      <PageHeader
        title="Pipeline de Follow-ups"
        description="Gerencie o acompanhamento dos membros em 3 etapas"
      />
      <KanbanBoard
        initialItems={followUps as Parameters<typeof KanbanBoard>[0]['initialItems']}
        members={members}
      />
    </div>
  )
}
