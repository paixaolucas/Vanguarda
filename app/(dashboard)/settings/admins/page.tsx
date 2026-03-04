import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import AdminsManager from '@/components/settings/AdminsManager'
import Link from 'next/link'
import { getAdminContext } from '@/lib/auth'
import { ShieldOff } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminsPage() {
  const [ctx, supabase] = await Promise.all([
    getAdminContext(),
    createClient().then(s => s),
  ])

  const { data: admins } = await (await createClient())
    .from('admins')
    .select('id, name, email, role, created_at')
    .order('created_at')

  if (ctx?.role !== 'super_admin') {
    return (
      <div>
        <PageHeader title="Admins" description="Gerenciamento de administradores" />
        <div className="flex items-center gap-3 text-white/40 mt-8">
          <ShieldOff size={16} />
          <p className="text-sm">Apenas super_admins podem gerenciar outros admins.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Admins"
        description="Gerencie os administradores e suas permissões"
        action={
          <Link href="/settings/api-keys" className="text-xs text-white/30 hover:text-white transition-colors">
            ← Configurações
          </Link>
        }
      />
      <div className="max-w-2xl">
        <AdminsManager admins={admins ?? []} currentAdminId={ctx.adminId} />
      </div>
    </div>
  )
}
