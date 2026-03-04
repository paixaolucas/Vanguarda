'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function MemberNoteForm({ memberId }: { memberId: string }) {
  const router = useRouter()
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('notes').insert({
      member_id: memberId,
      note: note.trim(),
      created_by: user?.id ?? null,
    })

    setNote('')
    setSaving(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Adicionar nota interna..."
        rows={3}
        className="w-full bg-[#111] border border-[#222] text-white placeholder-white/20 px-3 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-colors resize-none"
      />
      <button
        type="submit"
        disabled={saving || !note.trim()}
        className="px-4 py-2 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saving ? 'Salvando...' : 'Adicionar Nota'}
      </button>
    </form>
  )
}
