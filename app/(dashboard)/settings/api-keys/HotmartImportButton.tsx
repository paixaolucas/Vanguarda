'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

export default function HotmartImportButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ message: string; error?: string } | null>(null)

  async function handleImport() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/hotmart/import', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer internal',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ message: data.message ?? 'Importação concluída' })
      } else {
        setResult({ message: data.error ?? 'Erro na importação', error: data.error })
      }
    } catch {
      setResult({ message: 'Erro de conexão', error: 'connection' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/50 font-medium">Importar Histórico</p>
          <p className="text-[11px] text-white/30 mt-0.5">Importa todas as vendas históricas via REST API</p>
        </div>
        <button
          onClick={handleImport}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs border border-[#222] px-3 py-1.5 text-white/50 hover:text-white hover:border-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Download size={12} />
          )}
          {loading ? 'Importando...' : 'Importar Histórico'}
        </button>
      </div>
      {result && (
        <p className={`text-[11px] mt-2 ${result.error ? 'text-red-400' : 'text-green-400'}`}>
          {result.message}
        </p>
      )}
    </div>
  )
}
