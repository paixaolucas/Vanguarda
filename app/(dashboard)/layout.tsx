import Sidebar from '@/components/ui/Sidebar'
import { getAdminContext } from '@/lib/auth'
import { Eye } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ctx = await getAdminContext()
  const isViewer = ctx?.role === 'viewer'

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      {/* Main content offset for sidebar */}
      <main className="md:ml-56 pt-14 md:pt-0 min-h-screen">
        {isViewer && (
          <div className="flex items-center gap-2 px-6 py-2 bg-[#0a0a0a] border-b border-[#1a1a1a] text-xs text-white/40">
            <Eye size={12} />
            Modo Leitura — você tem acesso somente visualização
          </div>
        )}
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
