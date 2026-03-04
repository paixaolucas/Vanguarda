'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, User } from 'lucide-react'
import Link from 'next/link'
import Badge, { statusBadge, statusLabel } from '@/components/ui/Badge'

interface MemberResult {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  status: string | null
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MemberResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults([])
    }
  }, [open])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.members ?? [])
    } catch {
      setResults([])
    }
    setLoading(false)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(val), 250)
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 w-full text-white/30 hover:text-white hover:bg-white/5 transition-colors text-sm rounded-sm"
      >
        <Search size={16} strokeWidth={1.5} />
        <span className="flex-1 text-left">Buscar...</span>
        <kbd className="text-[10px] text-white/20 border border-[#333] px-1.5 py-0.5">⌘K</kbd>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-[#222] shadow-2xl">
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1a1a1a]">
              <Search size={16} className="text-white/30 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={handleChange}
                placeholder="Buscar por nome, email ou telefone..."
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/20"
              />
              {query ? (
                <button
                  onClick={() => { setQuery(''); setResults([]) }}
                  className="text-white/30 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              ) : (
                <kbd className="text-[10px] text-white/20 border border-[#333] px-1.5 py-0.5 flex-shrink-0">Esc</kbd>
              )}
            </div>

            {/* Results */}
            {query.length >= 2 ? (
              <div>
                {loading ? (
                  <div className="px-4 py-6 text-center text-xs text-white/30">Buscando...</div>
                ) : results.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-white/30">
                    Nenhum resultado para &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  <div className="divide-y divide-[#111] max-h-80 overflow-y-auto">
                    {results.map(member => (
                      <Link
                        key={member.id}
                        href={`/members/${member.id}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#111] transition-colors"
                      >
                        <div className="w-7 h-7 bg-[#1a1a1a] border border-[#222] flex items-center justify-center flex-shrink-0">
                          <User size={12} className="text-white/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{member.name ?? member.email}</p>
                          {member.name && (
                            <p className="text-xs text-white/30 truncate">{member.email}</p>
                          )}
                        </div>
                        <Badge variant={statusBadge(member.status)}>
                          {member.status ? statusLabel[member.status] ?? member.status : '—'}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 py-4 text-xs text-white/20 text-center">
                Digite ao menos 2 caracteres para buscar
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
