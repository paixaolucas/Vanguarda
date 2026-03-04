'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Edit2, X, Save } from 'lucide-react'

interface MemberEditFormProps {
  memberId: string
  initialData: {
    name: string | null
    email: string | null
    phone: string | null
    origin: string | null
    hotmart_id: string | null
    tmb_id: string | null
    circle_member_id: string | null
  }
}

const origins = [
  { value: 'hotmart', label: 'Hotmart' },
  { value: 'tmb', label: 'The Members Place' },
  { value: 'circle', label: 'Circle' },
  { value: 'manual', label: 'Manual' },
]

export default function MemberEditForm({ memberId, initialData }: MemberEditFormProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: initialData.name ?? '',
    email: initialData.email ?? '',
    phone: initialData.phone ?? '',
    origin: initialData.origin ?? '',
    hotmart_id: initialData.hotmart_id ?? '',
    tmb_id: initialData.tmb_id ?? '',
    circle_member_id: initialData.circle_member_id ?? '',
  })

  function set(key: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error: dbError } = await supabase
      .from('members')
      .update({
        name: form.name || null,
        email: form.email || null,
        phone: form.phone || null,
        origin: form.origin || null,
        hotmart_id: form.hotmart_id || null,
        tmb_id: form.tmb_id || null,
        circle_member_id: form.circle_member_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)

    if (dbError) {
      setError('Erro ao salvar. Tente novamente.')
      setSaving(false)
      return
    }

    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  function handleCancel() {
    setForm({
      name: initialData.name ?? '',
      email: initialData.email ?? '',
      phone: initialData.phone ?? '',
      origin: initialData.origin ?? '',
      hotmart_id: initialData.hotmart_id ?? '',
      tmb_id: initialData.tmb_id ?? '',
      circle_member_id: initialData.circle_member_id ?? '',
    })
    setError(null)
    setEditing(false)
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="w-full flex items-center justify-center gap-2 text-xs border border-[#222] px-3 py-2 text-white/30 hover:text-white hover:border-[#333] transition-colors"
      >
        <Edit2 size={12} />
        Editar Dados
      </button>
    )
  }

  return (
    <div className="bg-[#0a0a0a] border border-white/10 p-5 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Editar Dados</span>
        <button onClick={handleCancel} className="text-white/30 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>

      <Field label="Nome">
        <input
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Nome completo"
          className="input-field"
        />
      </Field>

      <Field label="Email">
        <input
          value={form.email}
          onChange={e => set('email', e.target.value)}
          placeholder="email@exemplo.com"
          type="email"
          className="input-field"
        />
      </Field>

      <Field label="Telefone / WhatsApp">
        <input
          value={form.phone}
          onChange={e => set('phone', e.target.value)}
          placeholder="+55 11 99999-9999"
          className="input-field"
        />
      </Field>

      <Field label="Origem">
        <select
          value={form.origin}
          onChange={e => set('origin', e.target.value)}
          className="input-field appearance-none"
        >
          <option value="">Selecionar...</option>
          {origins.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Field>

      <div className="border-t border-[#1a1a1a] pt-4 space-y-3">
        <p className="text-[10px] text-white/30 uppercase tracking-wider">IDs Externos</p>
        <Field label="ID Hotmart">
          <input
            value={form.hotmart_id}
            onChange={e => set('hotmart_id', e.target.value)}
            placeholder="código da transação"
            className="input-field font-mono text-xs"
          />
        </Field>
        <Field label="ID TMB">
          <input
            value={form.tmb_id}
            onChange={e => set('tmb_id', e.target.value)}
            placeholder="id do membro TMB"
            className="input-field font-mono text-xs"
          />
        </Field>
        <Field label="ID Circle">
          <input
            value={form.circle_member_id}
            onChange={e => set('circle_member_id', e.target.value)}
            placeholder="id do membro Circle"
            className="input-field font-mono text-xs"
          />
        </Field>
      </div>

      {error && (
        <p className="text-xs text-red-400 border border-red-800/40 bg-red-950/10 px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-1.5 bg-white text-black text-sm py-2 font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          <Save size={13} />
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          onClick={handleCancel}
          className="px-4 py-2 border border-[#222] text-white/40 text-sm hover:text-white transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}
