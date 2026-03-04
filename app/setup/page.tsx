'use client'

import { useState } from 'react'
import { Eye, EyeOff, CheckCircle, ExternalLink } from 'lucide-react'

export default function SetupPage() {
  const [form, setForm] = useState({ url: '', anonKey: '', serviceKey: '' })
  const [show, setShow] = useState({ anon: false, service: false })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: keyof typeof form, value: string) {
    setForm(p => ({ ...p, [key]: value }))
  }

  async function handleSave() {
    if (!form.url.trim() || !form.anonKey.trim() || !form.serviceKey.trim()) {
      setError('Preencha todos os campos antes de salvar.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/settings/env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: form.url, anonKey: form.anonKey, serviceKey: form.serviceKey }),
      })
      const data = await res.json()
      if (res.ok) {
        setSaved(true)
      } else {
        setError(data.error ?? 'Erro ao salvar')
      }
    } catch {
      setError('Erro de conexão')
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 border border-white/20 mb-6">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Vanguarda</h1>
          <p className="text-sm text-white/40 mt-1">Configure o banco de dados para começar</p>
        </div>

        {/* Step 1 - criar projeto */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 mb-4">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 border border-white/20 flex items-center justify-center text-xs text-white/60 font-mono">1</span>
            <div>
              <p className="text-sm font-medium text-white mb-1">Criar projeto no Supabase</p>
              <p className="text-xs text-white/40 mb-2">
                Acesse supabase.com, crie um projeto e execute o arquivo <code className="text-white/50">supabase/schema.sql</code> no SQL Editor.
              </p>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white border border-[#222] px-3 py-1.5 transition-colors"
              >
                <ExternalLink size={11} />
                Abrir Supabase
              </a>
            </div>
          </div>
        </div>

        {/* Step 2 - credenciais */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 mb-4">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 border border-white/20 flex items-center justify-center text-xs text-white/60 font-mono">2</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white mb-1">Cole as credenciais do projeto</p>
              <p className="text-xs text-white/40 mb-4">
                Encontre em <span className="text-white/60 font-mono">Project Settings → API</span>
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">URL do Projeto</label>
                  <input
                    value={form.url}
                    onChange={e => set('url', e.target.value)}
                    placeholder="https://xxxxxxxxxxxx.supabase.co"
                    className="input-field font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Anon Key <span className="text-white/20">(public)</span></label>
                  <div className="relative">
                    <input
                      type={show.anon ? 'text' : 'password'}
                      value={form.anonKey}
                      onChange={e => set('anonKey', e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="input-field font-mono text-xs pr-10"
                    />
                    <button type="button" onClick={() => setShow(p => ({ ...p, anon: !p.anon }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                      {show.anon ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Service Role Key <span className="text-white/20">(secreta)</span></label>
                  <div className="relative">
                    <input
                      type={show.service ? 'text' : 'password'}
                      value={form.serviceKey}
                      onChange={e => set('serviceKey', e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="input-field font-mono text-xs pr-10"
                    />
                    <button type="button" onClick={() => setShow(p => ({ ...p, service: !p.service }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                      {show.service ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 border border-red-800/40 bg-red-950/10 px-3 py-2 mt-3">{error}</p>
              )}

              <button
                onClick={handleSave}
                disabled={saving || saved}
                className="mt-4 w-full bg-white text-black text-sm font-medium py-2.5 hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Salvando...' : saved ? '✓ Salvo' : 'Salvar Credenciais'}
              </button>
            </div>
          </div>
        </div>

        {/* Step 3 - criar admin */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 mb-4">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 border border-white/20 flex items-center justify-center text-xs text-white/60 font-mono">3</span>
            <div>
              <p className="text-sm font-medium text-white mb-1">Criar usuário admin no Supabase</p>
              <p className="text-xs text-white/40 mb-2">Authentication → Users → Add user:</p>
              <p className="text-xs text-white/40 mt-2">
                Crie um usuário com email e senha de sua escolha. Depois execute <code className="text-white/50 font-mono">supabase/seed-admin.sql</code> substituindo o UUID do usuário criado.
              </p>
            </div>
          </div>
        </div>

        {/* Step 4 - reiniciar */}
        {saved && (
          <div className="border border-green-800/40 bg-green-950/10 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={14} className="text-green-400" />
              <span className="text-sm font-medium text-green-400">Credenciais salvas!</span>
            </div>
            <p className="text-xs text-green-400/70 mb-3">Reinicie o servidor para aplicar:</p>
            <div className="bg-black/40 border border-green-900/30 px-3 py-2 font-mono text-xs text-green-300/70">
              npm start
            </div>
            <p className="text-xs text-green-400/50 mt-2">Depois acesse{' '}
              <span className="font-mono text-green-400/70">localhost:3000/login</span>
            </p>
          </div>
        )}

        <p className="text-center text-white/15 text-xs mt-8">
          Overlens © {new Date().getFullYear()} — Vanguarda
        </p>
      </div>
    </div>
  )
}
