import { createServiceClient } from '@/lib/supabase/server'

async function getCircleToken(): Promise<{ token: string; communityId: string } | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('api_keys')
    .select('key_value, extra_config')
    .eq('service', 'circle')
    .single()

  if (!data?.key_value) {
    // Fallback to env vars
    const token = process.env.CIRCLE_API_TOKEN
    const communityId = process.env.CIRCLE_COMMUNITY_ID
    if (token && communityId) return { token, communityId }
    return null
  }

  const communityId = (data.extra_config as Record<string, string>)?.community_id
    ?? process.env.CIRCLE_COMMUNITY_ID
    ?? ''

  return { token: data.key_value, communityId }
}

export async function syncCircleMembers() {
  const creds = await getCircleToken()
  if (!creds) throw new Error('Circle API token não configurado')

  const { token, communityId } = creds
  const supabase = createServiceClient()

  let page = 1
  let hasMore = true
  const results: { synced: number; errors: number } = { synced: 0, errors: 0 }

  while (hasMore) {
    const response = await fetch(
      `https://app.circle.so/api/v1/community_members?community_id=${communityId}&page=${page}&per_page=100`,
      {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Circle API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const members = Array.isArray(data) ? data : data.community_members ?? []

    if (members.length === 0) {
      hasMore = false
      break
    }

    for (const cm of members) {
      try {
        const email = cm.email as string | undefined
        const name = cm.name as string | undefined
        const circleMemberId = String(cm.id ?? cm.user_id ?? '')

        if (!email) continue

        // Upsert member
        const { data: member } = await supabase
          .from('members')
          .upsert(
            {
              email,
              name: name ?? null,
              circle_member_id: circleMemberId,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'email' }
          )
          .select()
          .single()

        if (member) {
          // Record join activity
          await supabase.from('circle_activity').upsert(
            {
              member_id: member.id,
              circle_member_id: circleMemberId,
              event_type: 'joined',
              event_data: cm,
              occurred_at: cm.created_at ?? new Date().toISOString(),
            },
            { onConflict: 'id' }
          )
        }

        results.synced++
      } catch {
        results.errors++
      }
    }

    page++
    if (members.length < 100) hasMore = false
  }

  return results
}

export async function processCircleWebhookEvent(payload: Record<string, unknown>) {
  const supabase = createServiceClient()

  const kind = payload.kind as string | undefined
  const recordData = payload.data as Record<string, unknown> | undefined

  if (!kind || !recordData) return

  // Handle member removal/deletion
  if (kind === 'community_member.deleted' || kind === 'community_member.removed') {
    const email = recordData.email as string | undefined
    const circleMemberId = String(recordData.id ?? '')

    if (!email) return

    const { data: member } = await supabase
      .from('members')
      .select('id, status')
      .eq('email', email)
      .single()

    if (member) {
      const previousStatus = member.status

      await supabase
        .from('members')
        .update({
          status: 'cancelado',
          updated_at: new Date().toISOString(),
        })
        .eq('id', member.id)

      // Record status history
      await supabase.from('member_status_history').insert({
        member_id: member.id,
        from_status: previousStatus,
        to_status: 'cancelado',
        reason: `Removido do Circle (evento: ${kind})`,
      })

      await supabase.from('circle_activity').insert({
        member_id: member.id,
        circle_member_id: circleMemberId,
        event_type: 'removed',
        event_data: recordData,
        occurred_at: (recordData.updated_at as string) ?? new Date().toISOString(),
      })
    }
    return
  }

  let eventType: string = 'joined'
  let email: string | undefined
  let circleMemberId: string | undefined
  let occurredAt: string = new Date().toISOString()

  if (kind === 'community_member.created' || kind === 'community_member.updated') {
    eventType = 'joined'
    email = recordData.email as string | undefined
    circleMemberId = String(recordData.id ?? '')
    occurredAt = (recordData.created_at as string) ?? occurredAt
  } else if (kind === 'post.created') {
    eventType = 'post_created'
    const author = recordData.author as Record<string, unknown> | undefined
    email = author?.email as string | undefined
    circleMemberId = String(author?.id ?? '')
    occurredAt = (recordData.created_at as string) ?? occurredAt
  } else if (kind === 'comment.created') {
    eventType = 'comment'
    const author = recordData.author as Record<string, unknown> | undefined
    email = author?.email as string | undefined
    circleMemberId = String(author?.id ?? '')
    occurredAt = (recordData.created_at as string) ?? occurredAt
  }

  if (!email) return

  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('email', email)
    .single()

  if (!member) return

  await supabase.from('circle_activity').insert({
    member_id: member.id,
    circle_member_id: circleMemberId ?? null,
    event_type: eventType,
    event_data: recordData,
    occurred_at: occurredAt,
  })
}
