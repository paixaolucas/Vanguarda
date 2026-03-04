import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Ensure tag exists and return its id
async function getOrCreateTag(supabase: ReturnType<typeof createServiceClient>, name: string, color: string): Promise<string> {
  const { data: existing } = await supabase.from('tags').select('id').eq('name', name).single()
  if (existing) return existing.id
  const { data: created } = await supabase.from('tags').insert({ name, color }).select('id').single()
  return created!.id
}

async function applyTag(supabase: ReturnType<typeof createServiceClient>, memberIds: string[], tagId: string): Promise<number> {
  if (memberIds.length === 0) return 0
  const rows = memberIds.map(id => ({ member_id: id, tag_id: tagId }))
  const { data } = await supabase
    .from('member_tags')
    .upsert(rows, { onConflict: 'member_id,tag_id', ignoreDuplicates: true })
    .select('member_id')
  return (data ?? []).length
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const rules: string[] = body.rules ?? ['inativo', 'risco', 'novo_membro']

  const supabase = createServiceClient()
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const results: Record<string, number> = {}

  if (rules.includes('inativo')) {
    // Active members without circle posts in 30 days → tag "Inativo"
    const tagId = await getOrCreateTag(supabase, 'Inativo', '#6b7280')
    const { data: recentActivity } = await supabase
      .from('circle_activity')
      .select('member_id')
      .gte('occurred_at', thirtyDaysAgo)
    const recentIds = new Set((recentActivity ?? []).map(a => a.member_id))
    const { data: activeMembers } = await supabase
      .from('members')
      .select('id')
      .eq('status', 'ativo')
    const targets = (activeMembers ?? []).map(m => m.id).filter(id => !recentIds.has(id))
    results.inativo = await applyTag(supabase, targets, tagId)
  }

  if (rules.includes('risco')) {
    // Members with chargebacks → tag "Risco"
    const tagId = await getOrCreateTag(supabase, 'Risco', '#ef4444')
    const { data: chargebacks } = await supabase
      .from('transactions')
      .select('member_id')
      .eq('event_type', 'chargeback')
      .not('member_id', 'is', null)
    const memberIds = [...new Set((chargebacks ?? []).map(c => c.member_id as string))]
    results.risco = await applyTag(supabase, memberIds, tagId)
  }

  if (rules.includes('novo_membro')) {
    // Members created in last 7 days → tag "Novo Membro"
    const tagId = await getOrCreateTag(supabase, 'Novo Membro', '#22c55e')
    const { data: newMembers } = await supabase
      .from('members')
      .select('id')
      .gte('created_at', sevenDaysAgo)
    const memberIds = (newMembers ?? []).map(m => m.id)
    results.novo_membro = await applyTag(supabase, memberIds, tagId)
  }

  return NextResponse.json({ success: true, results })
}
