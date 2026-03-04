'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useCallback, useState, useTransition } from 'react'

export default function MembersFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const status = searchParams.get('status') ?? ''
  const origin = searchParams.get('origin') ?? ''

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })
      startTransition(() => {
        router.push(`/members?${params.toString()}`)
      })
    },
    [router, searchParams]
  )

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParams({ search })
  }

  function clearAll() {
    setSearch('')
    startTransition(() => {
      router.push('/members')
    })
  }

  const hasFilters = search || status || origin

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full bg-[#0a0a0a] border border-[#222] text-white placeholder-white/20 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-white text-black px-4 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          Buscar
        </button>
      </form>

      {/* Status Filter */}
      <select
        value={status}
        onChange={e => updateParams({ status: e.target.value })}
        className="bg-[#0a0a0a] border border-[#222] text-white py-2.5 px-3 text-sm focus:outline-none focus:border-white/30 appearance-none cursor-pointer"
      >
        <option value="">Todos os status</option>
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
        <option value="cancelado">Cancelado</option>
        <option value="inadimplente">Inadimplente</option>
      </select>

      {/* Origin Filter */}
      <select
        value={origin}
        onChange={e => updateParams({ origin: e.target.value })}
        className="bg-[#0a0a0a] border border-[#222] text-white py-2.5 px-3 text-sm focus:outline-none focus:border-white/30 appearance-none cursor-pointer"
      >
        <option value="">Todas as origens</option>
        <option value="hotmart">Hotmart</option>
        <option value="tmb">TMB</option>
      </select>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-white/40 hover:text-white border border-[#222] hover:border-[#333] transition-colors"
        >
          <X size={14} />
          Limpar
        </button>
      )}
    </div>
  )
}
