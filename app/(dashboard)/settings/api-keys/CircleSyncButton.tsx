'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

export default function CircleSyncButton() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleSync() {
    setSyncing(true)
    setResult(null)
    try {
      const res = await fetch('/api/circle/sync', {
        headers: { Authorization: 'Bearer internal' },
      })
      const data = await res.json()
      if (data.success) {
        setResult(`Sincronizados: ${data.synced} | Erros: ${data.errors}`)
      } else {
        setResult(`Erro: ${data.error}`)
      }
    } catch {
      setResult('Erro de conexão')
    }
    setSyncing(false)
  }

  return (
    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#1a1a1a]">
      <button
        onClick={handleSync}
        disabled={syncing}
        className="flex items-center gap-2 px-4 py-2 border border-[#222] text-sm text-white/60 hover:text-white hover:border-[#333] transition-colors disabled:opacity-50"
      >
        <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
        {syncing ? 'Sincronizando...' : 'Sincronizar membros Circle'}
      </button>
      {result && (
        <span className="text-xs text-white/40">{result}</span>
      )}
    </div>
  )
}
