'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  CalendarDays,
  Upload,
  KanbanSquare,
} from 'lucide-react'
import { useState } from 'react'
import GlobalSearch from '@/components/GlobalSearch'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/members', label: 'Membros', icon: Users },
  { href: '/reports', label: 'Relatórios', icon: FileText },
  { href: '/financial', label: 'Financeiro', icon: DollarSign },
  { href: '/calendar', label: 'Calendário', icon: CalendarDays },
  { href: '/import', label: 'Importar CRM', icon: Upload },
  { href: '/pipeline', label: 'Pipeline', icon: KanbanSquare },
  { href: '/settings/api-keys', label: 'Configurações', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Vanguarda</p>
            <p className="text-white/30 text-[10px] uppercase tracking-widest">Overlens</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-[#1a1a1a]">
        <GlobalSearch />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map(item => {
            const active = isActive(item)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-sm ${
                    active
                      ? 'bg-white text-black font-medium'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} strokeWidth={active ? 2.5 : 1.5} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#1a1a1a]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/30 hover:text-white hover:bg-white/5 transition-colors w-full rounded-sm"
        >
          <LogOut size={16} strokeWidth={1.5} />
          <span>Sair</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-[#050505] border-r border-[#1a1a1a] fixed top-0 left-0 z-40">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#050505] border-b border-[#1a1a1a] flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border border-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-xs">V</span>
          </div>
          <span className="text-white font-semibold text-sm">Vanguarda</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white/50 hover:text-white transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute top-14 left-0 bottom-0 w-56 bg-[#050505] border-r border-[#1a1a1a] flex flex-col">
            <NavContent />
          </aside>
        </div>
      )}
    </>
  )
}
