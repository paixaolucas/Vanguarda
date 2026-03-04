import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="border border-[#222] bg-[#0a0a0a] p-4 mb-4">
        <Icon size={24} className="text-white/20" strokeWidth={1} />
      </div>
      <h3 className="text-sm font-medium text-white/60 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-white/30 mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}
