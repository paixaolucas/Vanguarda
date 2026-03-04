'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { X } from 'lucide-react'

export default function FinancialFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const platform = searchParams.get('platform') ?? ''
  const status = searchParams.get('status') ?? ''
  const from = searchParams.get('from') ?? ''
  const to = searchParams.get('to') ?? ''

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value)
        else params.delete(key)
      })
      startTransition(() => {
        router.push(`/financial?${params.toString()}`)
      })
    },
    [router, searchParams]
  )

  const hasFilters = platform || status || from || to

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={platform}
        onChange={e => updateParams({ platform: e.target.value })}
        className="bg-[#0a0a0a] border border-[#222] text-white py-2.5 px-3 text-sm focus:outline-none focus:border-white/30 appearance-none cursor-pointer"
      >
        <option value="">Todas as plataformas</option>
        <option value="hotmart">Hotmart</option>
        <option value="tmb">TMB</option>
      </select>

      <select
        value={status}
        onChange={e => updateParams({ status: e.target.value })}
        className="bg-[#0a0a0a] border border-[#222] text-white py-2.5 px-3 text-sm focus:outline-none focus:border-white/30 appearance-none cursor-pointer"
      >
        <option value="">Todos os status</option>
        <option value="approved">Aprovado</option>
        <option value="pending">Pendente</option>
        <option value="refused">Recusado</option>
        <option value="refunded">Reembolsado</option>
      </select>

      <div className="flex items-center gap-2">
        <span className="text-xs text-white/30">De</span>
        <input
          type="date"
          value={from}
          onChange={e => updateParams({ from: e.target.value })}
          className="bg-[#0a0a0a] border border-[#222] text-white py-2.5 px-3 text-sm focus:outline-none focus:border-white/30 [color-scheme:dark]"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-white/30">Até</span>
        <input
          type="date"
          value={to}
          onChange={e => updateParams({ to: e.target.value })}
          className="bg-[#0a0a0a] border border-[#222] text-white py-2.5 px-3 text-sm focus:outline-none focus:border-white/30 [color-scheme:dark]"
        />
      </div>

      {hasFilters && (
        <button
          onClick={() => {
            startTransition(() => router.push('/financial'))
          }}
          className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-white/40 hover:text-white border border-[#222] hover:border-[#333] transition-colors"
        >
          <X size={14} />
          Limpar
        </button>
      )}
    </div>
  )
}
