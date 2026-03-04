import PageHeader from '@/components/ui/PageHeader'
import { Link2, Users, Webhook, Zap, ClipboardList, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const settingsCards = [
  {
    href: '/integrations',
    icon: Link2,
    title: 'Integrações',
    description: 'Configure Hotmart, TMB e Circle',
  },
  {
    href: '/settings/admins',
    icon: Users,
    title: 'Admins',
    description: 'Gerencie administradores e permissões',
  },
  {
    href: '/settings/webhooks',
    icon: Webhook,
    title: 'Webhooks',
    description: 'Notifique serviços externos em tempo real',
  },
  {
    href: '/settings/automations',
    icon: Zap,
    title: 'Automações',
    description: 'Regras automáticas de tagging e ações',
  },
  {
    href: '/settings/audit-log',
    icon: ClipboardList,
    title: 'Audit Log',
    description: 'Log de ações dos administradores',
  },
]

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Gerencie administradores, automações e integrações do sistema"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
        {settingsCards.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 p-4 bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#333] transition-colors group"
          >
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-[#222] group-hover:border-[#444] transition-colors">
              <Icon size={16} className="text-white/40 group-hover:text-white/60 transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white">{title}</div>
              <div className="text-xs text-white/30 mt-0.5">{description}</div>
            </div>
            <ChevronRight size={14} className="text-white/20 group-hover:text-white/40 flex-shrink-0 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
