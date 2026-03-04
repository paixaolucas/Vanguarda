import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { dispatchWebhook } from '@/lib/webhooks/dispatch'

export function validateHotmartSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto
    .createHmac('sha1', secret)
    .update(payload)
    .digest('hex')
  return hmac === signature
}

export async function processHotmartEvent(payload: Record<string, unknown>) {
  const supabase = createServiceClient()

  const event = payload.event as string
  const data = payload.data as Record<string, unknown>

  if (!data) return

  const buyer = data.buyer as Record<string, unknown> | undefined
  const purchase = data.purchase as Record<string, unknown> | undefined

  const email = buyer?.email as string | undefined
  const name = buyer?.name as string | undefined
  const hotmartId = (buyer?.code ?? purchase?.transaction) as string | undefined
  const amount = (purchase?.price as Record<string, unknown>)?.value as number | undefined
  const transactionCode = purchase?.transaction as string | undefined

  let status: string = 'ativo'
  let eventType: string = 'purchase'
  let txStatus: string = 'approved'

  switch (event) {
    case 'PURCHASE_COMPLETE':
    case 'PURCHASE_APPROVED':
      eventType = 'purchase'
      txStatus = 'approved'
      status = 'ativo'
      break
    case 'PURCHASE_CANCELED':
      eventType = 'cancellation'
      txStatus = 'refused'
      status = 'cancelado'
      break
    case 'PURCHASE_REFUNDED':
      eventType = 'refund'
      txStatus = 'refunded'
      status = 'cancelado'
      break
    case 'PURCHASE_CHARGEBACK':
      eventType = 'chargeback'
      txStatus = 'refunded'
      status = 'cancelado'
      break
    case 'SUBSCRIPTION_CANCELLATION':
      eventType = 'cancellation'
      txStatus = 'refused'
      status = 'cancelado'
      break
    case 'PURCHASE_DELAYED':
      eventType = 'purchase'
      txStatus = 'pending'
      status = 'inadimplente'
      break
  }

  if (!email) return

  // Get previous member status for history
  const { data: existingMember } = await supabase
    .from('members')
    .select('id, status')
    .eq('email', email)
    .single()

  // Upsert member
  const { data: member, error: memberError } = await supabase
    .from('members')
    .upsert(
      {
        email,
        name: name ?? null,
        hotmart_id: hotmartId ?? transactionCode ?? null,
        origin: 'hotmart',
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    )
    .select()
    .single()

  if (memberError || !member) {
    console.error('Error upserting member:', memberError)
    return
  }

  // Record status history if status changed
  const previousStatus = existingMember?.status ?? null
  if (previousStatus !== status) {
    await supabase.from('member_status_history').insert({
      member_id: member.id,
      from_status: previousStatus,
      to_status: status,
      reason: `Hotmart webhook: ${event}`,
    })
  }

  // Insert transaction
  await supabase.from('transactions').insert({
    member_id: member.id,
    platform: 'hotmart',
    event_type: eventType,
    amount: amount ?? null,
    status: txStatus,
    transaction_date: new Date().toISOString(),
    raw_payload: payload,
  })

  // Dispatch outgoing webhooks
  const webhookPayload = { member_id: member.id, email, name: name ?? null, amount: amount ?? null, platform: 'hotmart' }
  if (eventType === 'purchase' && txStatus === 'approved') {
    await dispatchWebhook(!existingMember ? 'member.created' : 'member.created', webhookPayload)
  } else if (eventType === 'chargeback') {
    await dispatchWebhook('member.chargeback', webhookPayload)
  } else if (eventType === 'cancellation') {
    await dispatchWebhook('member.cancelled', webhookPayload)
  } else if (status === 'inadimplente') {
    await dispatchWebhook('member.delinquent', webhookPayload)
  }
}
