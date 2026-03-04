import Sidebar from '@/components/ui/Sidebar'
import { getAdminContext } from '@/lib/auth'
import { Eye } from 'lucide-react'
import { Suspense } from 'react'

async function ViewerBanner() {
  const ctx = await getAdminContext()
  if (ctx?.role !== 'viewer') return null
  return (
    <div className="flex items-center gap-2 px-6 py-2 bg-[#0a0a0a] border-b border-[#1a1a1a] text-xs text-white/40">
      <Eye size={12} />
      Modo Leitura — você tem acesso somente visualização
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      {/* Main content offset for sidebar */}
      <main className="md:ml-56 pt-14 md:pt-0 min-h-screen">
        <Suspense fallback={null}>
          <ViewerBanner />
        </Suspense>
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
