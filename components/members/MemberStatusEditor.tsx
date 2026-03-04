'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Badge, { statusBadge, statusLabel } from '@/components/ui/Badge'
import { Edit2 } from 'lucide-react'

const statuses = ['ativo', 'inativo', 'cancelado', 'inadimplente']

export default function MemberStatusEditor({
  memberId,
  currentStatus,
}: {
  memberId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('members')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', memberId)
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Status</span>
        <button
          onClick={() => setEditing(!editing)}
          className="text-white/30 hover:text-white transition-colors"
        >
          <Edit2 size={13} />
        </button>
      </div>
      {editing ? (
        <div className="space-y-2">
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full bg-[#111] border border-[#222] text-white py-2 px-3 text-sm focus:outline-none focus:border-white/30 appearance-none"
          >
            {statuses.map(s => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-white text-black text-sm py-2 font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              onClick={() => { setEditing(false); setStatus(currentStatus) }}
              className="px-3 py-2 border border-[#222] text-white/40 text-sm hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <Badge variant={statusBadge(status)}>
          {statusLabel[status] ?? status}
        </Badge>
      )}
    </div>
  )
}
