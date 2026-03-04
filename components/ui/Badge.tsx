type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'muted'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-white/80 border-white/10',
  success: 'bg-green-950/40 text-green-400 border-green-900/40',
  warning: 'bg-yellow-950/40 text-yellow-400 border-yellow-900/40',
  error: 'bg-red-950/40 text-red-400 border-red-900/40',
  muted: 'bg-[#111] text-white/40 border-[#222]',
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium border ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export function statusBadge(status: string | null) {
  const map: Record<string, BadgeVariant> = {
    ativo: 'success',
    inativo: 'muted',
    cancelado: 'error',
    inadimplente: 'warning',
    approved: 'success',
    pending: 'warning',
    refused: 'error',
    refunded: 'error',
  }
  return map[status ?? ''] ?? 'default'
}

export const statusLabel: Record<string, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  cancelado: 'Cancelado',
  inadimplente: 'Inadimplente',
  approved: 'Aprovado',
  pending: 'Pendente',
  refused: 'Recusado',
  refunded: 'Reembolsado',
  hotmart: 'Hotmart',
  tmb: 'TMB',
  purchase: 'Compra',
  renewal: 'Renovação',
  cancellation: 'Cancelamento',
  refund: 'Reembolso',
  chargeback: 'Chargeback',
  joined: 'Entrou',
  post_created: 'Post',
  comment: 'Comentário',
  reaction: 'Reação',
}
