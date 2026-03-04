'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Tag, X, Plus } from 'lucide-react'
import { Tag as TagType } from '@/types'

interface Props {
  memberId: string
  currentTagIds: string[]
  currentTags: { id: string; name: string; color: string | null }[]
  allTags: TagType[]
}

export default function MemberTagsManager({
  memberId,
  currentTagIds,
  currentTags,
  allTags,
}: Props) {
  const router = useRouter()
  const [tagIds, setTagIds] = useState<string[]>(currentTagIds)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)

  const availableTags = allTags.filter(t => !tagIds.includes(t.id))

  async function addTag(tagId: string) {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('member_tags').insert({ member_id: memberId, tag_id: tagId })
    setTagIds(prev => [...prev, tagId])
    setSaving(false)
    setAdding(false)
    router.refresh()
  }

  async function removeTag(tagId: string) {
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('member_tags')
      .delete()
      .eq('member_id', memberId)
      .eq('tag_id', tagId)
    setTagIds(prev => prev.filter(id => id !== tagId))
    setSaving(false)
    router.refresh()
  }

  const displayTags = allTags.filter(t => tagIds.includes(t.id))

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-white/40" />
          <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Tags</span>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="text-white/30 hover:text-white transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {displayTags.length === 0 && !adding && (
          <p className="text-xs text-white/20">Nenhuma tag aplicada</p>
        )}
        {displayTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-[#111] border border-[#222] text-white/60"
          >
            {tag.name}
            <button
              onClick={() => removeTag(tag.id)}
              disabled={saving}
              className="text-white/20 hover:text-white transition-colors"
            >
              <X size={10} />
            </button>
          </span>
        ))}
      </div>

      {adding && (
        <div className="mt-2">
          {availableTags.length === 0 ? (
            <p className="text-xs text-white/30">Todas as tags já aplicadas</p>
          ) : (
            <select
              onChange={e => { if (e.target.value) addTag(e.target.value) }}
              defaultValue=""
              className="w-full bg-[#111] border border-[#222] text-white py-2 px-3 text-sm focus:outline-none focus:border-white/30 appearance-none"
            >
              <option value="" disabled>Selecionar tag...</option>
              {availableTags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  )
}
