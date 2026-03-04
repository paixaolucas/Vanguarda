'use client'

import { useState, useEffect } from 'react'
import { Database, Edit2, X, Save, Eye, EyeOff, RefreshCw } from 'lucide-react'

function maskKey(key: string): string {
  if (!key) return ''
  return key.slice(0, 12) + '...' + key.slice(-6)
}

export default function SupabaseInfoCard() {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState({ anon: false, service: false })

  const [current, setCurrent] = useState({ url: '', anonKey: '', serviceKey: '' })
  const [form, setForm] = useState({ url: '', anonKey: '', serviceKey: '' })

  useEffect(() => {
    fetch('/api/settings/env')
      .then(r => r.json())
      .then(data => {
        const vals = {
          url: data.NEXT_PUBLIC_SUPABASE_URL ?? '',
          anonKey: data.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
          serviceKey: data.SUPABASE_SERVICE_ROLE_KEY ?? '',
        }
        setCurrent(vals)
        setForm(vals)
      })
      .catch(() => {})
  }, [])

  const configured = !!(current.url && current.anonKey && current.serviceKey)

  function openEdit() {
    setForm({ ...current })
    setError(null)
    setSaved(false)
    setEditing(true)
  }

  function cancelEdit() {
    setForm({ ...current })
    setError(null)
    setEditing(false)
  }

  async function handleSave() {
    if (!form.url.trim()) { setError('URL do projeto é obrigatória'); return }
    setSaving(true)
    setError(null)

    const res = await fetch('/api/settings/env', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: form.url,
        anonKey: form.anonKey,
        serviceKey: form.serviceKey,
      }),
    })

    const data = await res.json()

    if (res.ok) {
      setCurrent({ ...form })
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 5000)
    } else {
      setError(data.error ?? 'Erro ao salvar')
    }
    setSaving(false)
  }

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-[#1a1a1a]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database size={14} className="text-white/40" />
            <span className="text-sm font-medium text-white">Supabase</span>
            {configured ? (
              <span className="text-[10px] px-1.5 py-0.5 border border-green-900/40 bg-green-950/20 text-green-400">
                Configurado
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 border border-red-900/40 bg-red-950/20 text-red-400">
                Incompleto
              </span>
            )}
          </div>
          <p className="text-xs text-white/30">Banco de dados e autenticação da plataforma.</p>
        </div>
        {!editing && (
          <button
            onClick={openEdit}
            className="text-white/30 hover:text-white transition-colors"
            title="Editar"
          >
            <Edit2 size={13} />
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {!editing ? (
          <>
            {/* Read-only view */}
            <Field label="URL do Projeto">
              <p className="text-sm font-mono text-white/70 bg-[#111] border border-[#222] px-3 py-2.5 break-all">
                {current.url || <span className="text-red-400">Não definido</span>}
              </p>
            </Field>

            <Field label="Anon Key">
              <p className="text-sm font-mono text-white/50 bg-[#111] border border-[#222] px-3 py-2.5">
                {current.anonKey
                  ? maskKey(current.anonKey)
                  : <span className="text-red-400">Não definido</span>}
              </p>
            </Field>

            <Field label="Service Role Key">
              <p className="text-sm font-mono text-white/50 bg-[#111] border border-[#222] px-3 py-2.5">
                {current.serviceKey
                  ? maskKey(current.serviceKey)
                  : <span className="text-red-400">Não definido</span>}
              </p>
            </Field>

            {saved && (
              <div className="flex items-center gap-2 text-xs text-green-400 border border-green-900/40 bg-green-950/10 px-3 py-2">
                <RefreshCw size={12} />
                Salvo. Reinicie o servidor para aplicar as mudanças.
              </div>
            )}
          </>
        ) : (
          <>
            {/* Edit form */}
            <Field label="URL do Projeto">
              <input
                value={form.url}
                onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                placeholder="https://xxxx.supabase.co"
                className="input-field font-mono text-sm"
              />
            </Field>

            <Field label="Anon Key">
              <div className="relative">
                <input
                  type={showSecrets.anon ? 'text' : 'password'}
                  value={form.anonKey}
                  onChange={e => setForm(p => ({ ...p, anonKey: e.target.value }))}
                  placeholder="eyJhbGciOiJIUzI1NiIs..."
                  className="input-field font-mono text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets(p => ({ ...p, anon: !p.anon }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showSecrets.anon ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Field>

            <Field label="Service Role Key">
              <div className="relative">
                <input
                  type={showSecrets.service ? 'text' : 'password'}
                  value={form.serviceKey}
                  onChange={e => setForm(p => ({ ...p, serviceKey: e.target.value }))}
                  placeholder="eyJhbGciOiJIUzI1NiIs..."
                  className="input-field font-mono text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets(p => ({ ...p, service: !p.service }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showSecrets.service ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Field>

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
                onClick={cancelEdit}
                className="px-4 py-2 border border-[#222] text-white/40 text-sm hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-[11px] text-white/20">
              Após salvar, reinicie o servidor com <code className="text-white/30">npm start</code> para aplicar.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">{label}</p>
      {children}
    </div>
  )
}
