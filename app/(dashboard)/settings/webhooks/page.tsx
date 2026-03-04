'use client'

import { useState, useEffect } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import { Webhook, Plus, Trash2, ToggleLeft, ToggleRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

type WebhookSub = {
  id: string
  event_type: string
  url: string
  headers: Record<string, string>
  active: boolean
  created_at: string
}

const EVENT_OPTIONS = [
  { value: 'member.created', label: 'Novo Membro', description: 'Quando uma compra aprovada cria/reativa um membro' },
  { value: 'member.chargeback', label: 'Chargeback', description: 'Quando um chargeback é registrado' },
  { value: 'member.cancelled', label: 'Cancelamento', description: 'Quando um membro cancela a assinatura' },
  { value: 'member.delinquent', label: 'Inadimplência', description: 'Quando um pagamento é atrasado' },
]

export default function WebhooksPage() {
  const [subs, setSubs] = useState<WebhookSub[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ event_type: 'member.created', url: '', headers: '' })
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/settings/webhooks')
      .then(r => r.json())
      .then(data => { setSubs(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleAdd() {
    if (!form.url.trim()) { setFormError('URL é obrigatória'); return }
    try { new URL(form.url) } catch { setFormError('URL inválida'); return }

    let parsedHeaders: Record<string, string> = {}
    if (form.headers.trim()) {
      try { parsedHeaders = JSON.parse(form.headers) } catch { setFormError('Headers devem ser JSON válido'); return }
    }

    setSaving(true)
    setFormError(null)
    const res = await fetch('/api/settings/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: form.event_type, url: form.url, headers: parsedHeaders }),
    })
    const data = await res.json()
    if (!res.ok) { setFormError(data.error ?? 'Erro ao salvar'); setSaving(false); return }
    setSubs(prev => [data, ...prev])
    setForm({ event_type: 'member.created', url: '', headers: '' })
    setShowAdd(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)
  }

  async function toggleActive(id: string, active: boolean) {
    setToggling(id)
    await fetch(`/api/settings/webhooks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    })
    setSubs(prev => prev.map(s => s.id === id ? { ...s, active: !active } : s))
    setToggling(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este webhook?')) return
    await fetch(`/api/settings/webhooks/${id}`, { method: 'DELETE' })
    setSubs(prev => prev.filter(s => s.id !== id))
  }

  const eventLabel = (evt: string) => EVENT_OPTIONS.find(e => e.value === evt)?.label ?? evt

  return (
    <div>
      <PageHeader
        title="Webhooks de Saída"
        description="Notifique serviços externos quando eventos ocorrem"
        action={
          <Link href="/settings/api-keys" className="text-xs text-white/30 hover:text-white transition-colors">
            ← Configurações
          </Link>
        }
      />

      <div className="max-w-2xl space-y-6">
        {/* Event reference */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">Eventos Disponíveis</p>
          <div className="space-y-2">
            {EVENT_OPTIONS.map(evt => (
              <div key={evt.value} className="flex items-start gap-3">
                <code className="text-[11px] text-white/50 bg-[#111] border border-[#222] px-2 py-0.5 flex-shrink-0 mt-0.5">{evt.value}</code>
                <p className="text-xs text-white/30">{evt.description}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-white/20 mt-3">
            Payload: <code className="text-white/30">{'{"event": "...", "data": {...}, "timestamp": "..."}'}</code>
          </p>
        </div>

        {/* Subscriptions list */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
            <div className="flex items-center gap-2">
              <Webhook size={14} className="text-white/40" />
              <span className="text-sm font-medium text-white">Assinaturas</span>
            </div>
            <div className="flex items-center gap-3">
              {saved && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <CheckCircle size={12} /> Salvo
                </span>
              )}
              <button
                onClick={() => setShowAdd(!showAdd)}
                className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white border border-[#222] px-3 py-1.5 hover:border-[#333] transition-colors"
              >
                <Plus size={12} />
                Adicionar
              </button>
            </div>
          </div>

          {/* Add form */}
          {showAdd && (
            <div className="px-5 py-4 border-b border-[#1a1a1a] space-y-3 bg-[#060606]">
              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Evento</label>
                <select
                  value={form.event_type}
                  onChange={e => setForm(p => ({ ...p, event_type: e.target.value }))}
                  className="input-field text-sm"
                >
                  {EVENT_OPTIONS.map(evt => (
                    <option key={evt.value} value={evt.value}>{evt.label} ({evt.value})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">URL de Destino</label>
                <input
                  value={form.url}
                  onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                  placeholder="https://hooks.slack.com/services/..."
                  className="input-field text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">
                  Headers Extras <span className="text-white/20 normal-case">(JSON opcional)</span>
                </label>
                <input
                  value={form.headers}
                  onChange={e => setForm(p => ({ ...p, headers: e.target.value }))}
                  placeholder='{"Authorization": "Bearer token"}'
                  className="input-field text-sm font-mono"
                />
              </div>
              {formError && <p className="text-xs text-red-400">{formError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="bg-white text-black text-xs px-4 py-2 font-medium hover:bg-white/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  onClick={() => { setShowAdd(false); setFormError(null) }}
                  className="px-4 py-2 text-xs text-white/40 border border-[#222] hover:text-white transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* List */}
          {loading ? (
            <p className="text-xs text-white/30 text-center py-8">Carregando...</p>
          ) : subs.length === 0 ? (
            <p className="text-xs text-white/30 text-center py-8">Nenhum webhook configurado</p>
          ) : (
            <div className="divide-y divide-[#111]">
              {subs.map(sub => (
                <div key={sub.id} className="px-5 py-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 border ${
                        sub.active
                          ? 'border-green-900/40 bg-green-950/10 text-green-400'
                          : 'border-[#333] bg-[#111] text-white/30'
                      }`}>
                        {eventLabel(sub.event_type)}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-white/50 truncate">{sub.url}</p>
                    {Object.keys(sub.headers ?? {}).length > 0 && (
                      <p className="text-[11px] text-white/20 mt-0.5">
                        {Object.keys(sub.headers).length} header(s) customizado(s)
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(sub.id, sub.active)}
                      disabled={toggling === sub.id}
                      className="text-white/30 hover:text-white transition-colors disabled:opacity-50"
                      title={sub.active ? 'Desativar' : 'Ativar'}
                    >
                      {sub.active ? <ToggleRight size={18} className="text-green-400" /> : <ToggleLeft size={18} />}
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="text-white/20 hover:text-red-400 transition-colors p-0.5"
                      title="Remover"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
