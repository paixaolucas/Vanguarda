'use client'

import { useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import { Zap, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

const RULES = [
  {
    key: 'inativo',
    label: 'Sem posts no Circle em 30 dias',
    action: 'Aplicar tag "Inativo"',
    description: 'Membros ativos sem nenhuma atividade no Circle nos últimos 30 dias recebem a tag Inativo.',
  },
  {
    key: 'risco',
    label: 'Chargeback registrado',
    action: 'Aplicar tag "Risco"',
    description: 'Membros que possuem ao menos um chargeback na plataforma recebem a tag Risco.',
  },
  {
    key: 'novo_membro',
    label: 'Membro há menos de 7 dias',
    action: 'Aplicar tag "Novo Membro"',
    description: 'Membros criados nos últimos 7 dias recebem a tag Novo Membro automaticamente.',
  },
]

export default function AutomationsPage() {
  const [selected, setSelected] = useState<string[]>(['inativo', 'risco', 'novo_membro'])
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<Record<string, number> | null>(null)
  const [error, setError] = useState<string | null>(null)

  function toggle(key: string) {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  async function runAutomations() {
    if (selected.length === 0) return
    setRunning(true)
    setResults(null)
    setError(null)
    try {
      const res = await fetch('/api/automations/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: selected }),
      })
      const data = await res.json()
      if (res.ok) {
        setResults(data.results)
      } else {
        setError(data.error ?? 'Erro ao executar automações')
      }
    } catch {
      setError('Erro de conexão')
    }
    setRunning(false)
  }

  const labelMap: Record<string, string> = {
    inativo: 'Inativo',
    risco: 'Risco',
    novo_membro: 'Novo Membro',
  }

  return (
    <div>
      <PageHeader
        title="Automações"
        description="Regras automáticas de tagging para membros"
        action={
          <Link
            href="/settings/api-keys"
            className="text-xs text-white/30 hover:text-white transition-colors"
          >
            ← Configurações
          </Link>
        }
      />

      <div className="max-w-2xl space-y-4">
        {/* Rules list */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[#1a1a1a]">
            <Zap size={14} className="text-white/40" />
            <span className="text-sm font-medium text-white">Regras de Tagging</span>
            <span className="text-xs text-white/30 ml-auto">Selecione as regras a executar</span>
          </div>

          <div className="divide-y divide-[#111]">
            {RULES.map(rule => (
              <div
                key={rule.key}
                className="px-5 py-4 flex items-start gap-4 cursor-pointer hover:bg-[#111] transition-colors"
                onClick={() => toggle(rule.key)}
              >
                {/* Toggle */}
                <div className={`flex-shrink-0 mt-0.5 w-4 h-4 border flex items-center justify-center transition-colors ${
                  selected.includes(rule.key)
                    ? 'border-white bg-white'
                    : 'border-[#333] bg-transparent'
                }`}>
                  {selected.includes(rule.key) && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm text-white font-medium">Se:</span>
                    <span className="text-sm text-white/70">{rule.label}</span>
                    <span className="text-white/30 text-xs">→</span>
                    <span className="text-sm text-white/70">{rule.action}</span>
                  </div>
                  <p className="text-xs text-white/30">{rule.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="border border-green-800/40 bg-green-950/10 px-5 py-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={14} className="text-green-400" />
              <span className="text-sm font-medium text-green-400">Automações executadas</span>
            </div>
            {Object.entries(results).map(([key, count]) => (
              <div key={key} className="flex items-center justify-between text-xs text-green-400/70">
                <span>Tag &ldquo;{labelMap[key] ?? key}&rdquo;</span>
                <span>{count} {count === 1 ? 'membro tagueado' : 'membros tagueados'}</span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-xs text-red-400 border border-red-800/40 bg-red-950/10 px-4 py-3">
            {error}
          </p>
        )}

        {/* Run button */}
        <button
          onClick={runAutomations}
          disabled={running || selected.length === 0}
          className="flex items-center gap-2 bg-white text-black text-sm font-medium px-6 py-2.5 hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          {running ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Executando...
            </>
          ) : (
            <>
              <Zap size={14} />
              Executar Agora ({selected.length} {selected.length === 1 ? 'regra' : 'regras'})
            </>
          )}
        </button>

        <p className="text-xs text-white/20">
          As tags são criadas automaticamente se não existirem. Membros já tagueados não são duplicados.
        </p>
      </div>
    </div>
  )
}
