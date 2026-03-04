export type MemberStatus = 'ativo' | 'inativo' | 'cancelado' | 'inadimplente'
export type MemberOrigin = 'hotmart' | 'tmb'
export type TransactionPlatform = 'hotmart' | 'tmb'
export type TransactionEventType = 'purchase' | 'renewal' | 'cancellation' | 'refund' | 'chargeback'
export type TransactionStatus = 'approved' | 'pending' | 'refused' | 'refunded'
export type CircleEventType = 'joined' | 'post_created' | 'comment' | 'reaction'
export type AdminRole = 'super_admin' | 'admin'
export type ApiService = 'hotmart' | 'tmb' | 'circle'

export interface Member {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  status: MemberStatus | null
  origin: MemberOrigin | null
  hotmart_id: string | null
  tmb_id: string | null
  circle_member_id: string | null
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  member_id: string | null
  platform: TransactionPlatform | null
  event_type: TransactionEventType | null
  amount: number | null
  status: TransactionStatus | null
  transaction_date: string | null
  raw_payload: Record<string, unknown> | null
  created_at: string
}

export interface CircleActivity {
  id: string
  member_id: string | null
  circle_member_id: string | null
  event_type: CircleEventType | null
  event_data: Record<string, unknown> | null
  occurred_at: string | null
  created_at: string
}

export interface Report {
  id: string
  member_id: string | null
  title: string | null
  content: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  member?: Member
  admin?: Admin
}

export interface Note {
  id: string
  member_id: string | null
  note: string | null
  created_by: string | null
  created_at: string
  admin?: Admin
}

export interface Tag {
  id: string
  name: string
  color: string | null
}

export interface MemberTag {
  member_id: string
  tag_id: string
  tag?: Tag
}

export interface Admin {
  id: string
  name: string | null
  email: string | null
  role: AdminRole | null
  created_at: string
}

export interface ApiKey {
  id: string
  service: ApiService
  key_name: string | null
  key_value: string | null
  extra_config: Record<string, unknown> | null
  updated_at: string
}

export interface MemberWithDetails extends Member {
  transactions?: Transaction[]
  circle_activity?: CircleActivity[]
  reports?: Report[]
  notes?: Note[]
  tags?: Tag[]
}

export interface DashboardStats {
  totalActive: number
  newThisMonth: number
  cancellationsThisMonth: number
  revenueThisMonth: number
}
