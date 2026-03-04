'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false })

type MemberOption = { id: string; name: string | null; email: string | null }

interface ReportFormProps {
  members: MemberOption[]
  initialMemberId?: string
  report?: {
    id: string
    title: string | null
    content: string | null
    member_id: string | null
  }
}

export default function ReportForm({ members, initialMemberId, report }: ReportFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(report?.title ?? '')
  const [memberId, setMemberId] = useState(report?.member_id ?? initialMemberId ?? '')
  const [content, setContent] = useState(report?.content ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('O título é obrigatório.')
      return
    }
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (report) {
      const { error: updateError } = await supabase
        .from('reports')
        .update({
          title: title.trim(),
          member_id: memberId || null,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', report.id)

      if (updateError) {
        setError('Erro ao atualizar relatório.')
        setSaving(false)
        return
      }
      router.push(`/reports/${report.id}`)
    } else {
      const { data, error: insertError } = await supabase
        .from('reports')
        .insert({
          title: title.trim(),
          member_id: memberId || null,
          content,
          created_by: user?.id ?? null,
        })
        .select()
        .single()

      if (insertError || !data) {
        setError('Erro ao criar relatório.')
        setSaving(false)
        return
      }
      router.push(`/reports/${data.id}`)
    }

    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-2">
          Título
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          placeholder="Título do relatório..."
          className="w-full bg-[#0a0a0a] border border-[#222] text-white placeholder-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-2">
          Membro Vinculado
        </label>
        <select
          value={memberId}
          onChange={e => setMemberId(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-[#222] text-white py-3 px-4 text-sm focus:outline-none focus:border-white/30 appearance-none"
        >
          <option value="">Nenhum membro vinculado</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>
              {m.name ?? m.email ?? m.id}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-2">
          Conteúdo
        </label>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Escreva o conteúdo do relatório..."
        />
      </div>

      {error && (
        <div className="border border-red-800/60 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-white text-black font-semibold px-6 py-2.5 text-sm hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvando...' : report ? 'Atualizar' : 'Criar Relatório'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 text-sm text-white/40 border border-[#222] hover:text-white hover:border-[#333] transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
