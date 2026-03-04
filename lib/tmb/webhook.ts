import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'

export function validateTmbSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  return `sha256=${hmac}` === signature || hmac === signature
}

export async function processTmbEvent(payload: Record<string, unknown>) {
  const supabase = createServiceClient()

  const eventType = payload.event_type as string | undefined
  const member = payload.member as Record<string, unknown> | undefined

  if (!member) return

  const email = member.email as string | undefined
  const name = member.name as string | undefined
  const tmbId = (member.id ?? member.uuid) as string | undefined

  let status: string = 'ativo'

  switch (eventType) {
    case 'member.added':
    case 'member.joined':
      status = 'ativo'
      break
    case 'member.removed':
    case 'member.banned':
      status = 'cancelado'
      break
    case 'member.suspended':
      status = 'inativo'
      break
  }

  if (!email) return

  // Get previous member status for history
  const { data: existingMember } = await supabase
    .from('members')
    .select('id, status')
    .eq('email', email)
    .single()

  const { data: upsertedMember } = await supabase
    .from('members')
    .upsert(
      {
        email,
        name: name ?? null,
        tmb_id: tmbId ?? null,
        origin: 'tmb',
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    )
    .select()
    .single()

  // Record status history if status changed
  if (upsertedMember) {
    const previousStatus = existingMember?.status ?? null
    if (previousStatus !== status) {
      await supabase.from('member_status_history').insert({
        member_id: upsertedMember.id,
        from_status: previousStatus,
        to_status: status,
        reason: `TMB webhook: ${eventType}`,
      })
    }
  }
}
