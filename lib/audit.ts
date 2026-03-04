import { createServiceClient } from '@/lib/supabase/server'

export async function logAction(
  adminId: string | null,
  action: string,
  targetType: string | null,
  targetId: string | null,
  details?: Record<string, unknown>
) {
  try {
    const supabase = createServiceClient()
    await supabase.from('audit_log').insert({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details: details ?? null,
    })
  } catch (err) {
    // Never throw — audit logging should not break primary operations
    console.error('Audit log error:', err)
  }
}
