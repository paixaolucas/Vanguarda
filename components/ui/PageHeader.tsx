interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8 pb-6 border-b border-[#1a1a1a]">
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-white/40 mt-1">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
