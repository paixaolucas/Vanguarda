import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  alert?: boolean
  success?: boolean
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  alert,
  success,
}: StatCardProps) {
  return (
    <div className={`bg-[#0a0a0a] border p-5 ${alert ? 'border-red-900/40' : success ? 'border-green-900/30' : 'border-[#1a1a1a]'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-3">
            {title}
          </p>
          <p className={`text-3xl font-semibold tracking-tight ${alert ? 'text-red-400' : success ? 'text-green-400' : 'text-white'}`}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-white/30 mt-2">{description}</p>
          )}
        </div>
        <div className={`p-2 border ${alert ? 'border-red-900/30 bg-red-950/20' : success ? 'border-green-900/20 bg-green-950/10' : 'border-[#222] bg-[#111]'}`}>
          <Icon
            size={18}
            className={alert ? 'text-red-500' : success ? 'text-green-500' : 'text-white/40'}
            strokeWidth={1.5}
          />
        </div>
      </div>
    </div>
  )
}
