import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'

export function validateCircleSignature(
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

export async function getCircleWebhookSecret(): Promise<string | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('api_keys')
    .select('extra_config')
    .eq('service', 'circle')
    .single()

  if (!data?.extra_config) return null

  const config = data.extra_config as Record<string, string>
  return config.webhook_secret ?? null
}
