import { createServiceClient } from '@/lib/supabase/server'

export type WebhookEventType =
  | 'member.created'
  | 'member.chargeback'
  | 'member.cancelled'
  | 'member.delinquent'

export async function dispatchWebhook(
  eventType: WebhookEventType,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = createServiceClient()
    const { data: subscriptions } = await supabase
      .from('webhook_subscriptions')
      .select('url, headers')
      .eq('event_type', eventType)
      .eq('active', true)

    if (!subscriptions || subscriptions.length === 0) return

    const body = JSON.stringify({ event: eventType, data: payload, timestamp: new Date().toISOString() })

    await Promise.allSettled(
      subscriptions.map(sub => {
        const extraHeaders = (sub.headers as Record<string, string>) ?? {}
        return fetch(sub.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Vanguarda-Event': eventType,
            ...extraHeaders,
          },
          body,
          signal: AbortSignal.timeout(8000),
        })
      })
    )
  } catch {
    // Never throw — webhook dispatch is best-effort
  }
}
