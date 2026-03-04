import { createClient } from '@/lib/supabase/server'

export type AdminRole = 'super_admin' | 'admin' | 'viewer'

export interface AdminContext {
  userId: string
  adminId: string
  name: string | null
  email: string | null
  role: AdminRole
}

export async function getAdminContext(): Promise<AdminContext | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: admin } = await supabase
      .from('admins')
      .select('id, name, email, role')
      .eq('id', user.id)
      .single()

    if (!admin) return null

    return {
      userId: user.id,
      adminId: admin.id,
      name: admin.name ?? null,
      email: admin.email ?? null,
      role: (admin.role ?? 'super_admin') as AdminRole,
    }
  } catch {
    return null
  }
}
