'use client'

import { useState, useTransition } from 'react'
import { ChevronRight, ChevronLeft, Trash2, Plus, Calendar, User } from 'lucide-react'
import Link from 'next/link'

type Member = { id: string; name: string | null; email: string | null }

type FollowUp = {
  id: string
  member_id: string | null
  status: string
  notes: string | null
  due_date: string | null
  created_at: string
  members: Member | null
}

type MemberOption = { id: string; name: string | null; email: string | null }

const COLUMNS = [
  { key: 'para_contatar', label: 'Para Contatar', color: 'text-yellow-400' },
  { key: 'em_contato', label: 'Em Contato', color: 'text-blue-400' },
  { key: 'resolvido', label: 'Resolvido', color: 'text-green-400' },
]

function getNextStatus(current: string): string | null {
  const idx = COLUMNS.findIndex(c => c.key === current)
  return idx < COLUMNS.length - 1 ? COLUMNS[idx + 1].key : null
}

function getPrevStatus(current: string): string | null {
  const idx = COLUMNS.findIndex(c => c.key === current)
  return idx > 0 ? COLUMNS[idx - 1].key : null
}

export default function KanbanBoard({
  initialItems,
  members,
}: {
  initialItems: FollowUp[]
  members: MemberOption[]
}) {
  const [items, setItems] = useState<FollowUp[]>(initialItems)
  const [isPending, startTransition] = useTransition()
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ member_id: '', notes: '', due_date: '' })
  const [addError, setAddError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  async function moveItem(id: string, newStatus: string) {
    setItems(prev => prev.map(it => it.id === id ? { ...it, status: newStatus } : it))
    startTransition(async () => {
      await fetch(`/api/pipeline/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
    })
  }

  async function deleteItem(id: string) {
    setItems(prev => prev.filter(it => it.id !== id))
    await fetch(`/api/pipeline/${id}`, { method: 'DELETE' })
  }

  async function handleAdd() {
    if (!addForm.member_id) { setAddError('Selecione um membro'); return }
    setAdding(true)
    setAddError(null)
    const res = await fetch('/api/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    })
    const data = await res.json()
    if (!res.ok) { setAddError(data.error ?? 'Erro ao adicionar'); setAdding(false); return }
    setItems(prev => [data, ...prev])
    setAddForm({ member_id: '', notes: '', due_date: '' })
    setShowAdd(false)
    setAdding(false)
  }

  const columns = COLUMNS.map(col => ({
    ...col,
    items: items.filter(it => it.status === col.key),
  }))

  return (
    <div>
      {/* Add button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 text-xs border border-[#222] px-3 py-1.5 text-white/50 hover:text-white hover:border-[#333] transition-colors"
        >
          <Plus size={12} />
          Adicionar Follow-up
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-4 mb-6 space-y-3">
          <p className="text-sm font-medium text-white mb-3">Novo Follow-up</p>
          <div>
            <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Membro</label>
            <select
              value={addForm.member_id}
              onChange={e => setAddForm(p => ({ ...p, member_id: e.target.value }))}
              className="input-field text-sm"
            >
              <option value="">Selecionar membro...</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name ?? m.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Notas</label>
            <input
              value={addForm.notes}
              onChange={e => setAddForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Contexto ou motivo do contato..."
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Prazo</label>
            <input
              type="date"
              value={addForm.due_date}
              onChange={e => setAddForm(p => ({ ...p, due_date: e.target.value }))}
              className="input-field text-sm"
            />
          </div>
          {addError && <p className="text-xs text-red-400">{addError}</p>}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAdd}
              disabled={adding}
              className="bg-white text-black text-sm px-4 py-2 font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {adding ? 'Adicionando...' : 'Adicionar'}
            </button>
            <button
              onClick={() => { setShowAdd(false); setAddError(null) }}
              className="px-4 py-2 text-sm text-white/40 border border-[#222] hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col, colIdx) => (
          <div key={col.key} className="bg-[#0a0a0a] border border-[#1a1a1a] min-h-[300px]">
            {/* Column header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${col.color}`}>{col.label}</span>
              </div>
              <span className="text-xs text-white/20 bg-[#111] border border-[#222] px-2 py-0.5">
                {col.items.length}
              </span>
            </div>

            {/* Cards */}
            <div className="p-3 space-y-2">
              {col.items.length === 0 && (
                <p className="text-xs text-white/20 text-center py-6">Sem itens</p>
              )}
              {col.items.map(item => {
                const memberData = item.members as Member | null
                const next = getNextStatus(item.status)
                const prev = getPrevStatus(item.status)

                return (
                  <div key={item.id} className="bg-[#111] border border-[#1a1a1a] p-3 group">
                    {/* Member */}
                    <div className="flex items-start gap-2 mb-2">
                      <User size={12} className="text-white/30 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/members/${item.member_id}`}
                          className="text-sm text-white hover:text-white/70 transition-colors truncate block"
                        >
                          {memberData?.name ?? memberData?.email ?? 'Membro desconhecido'}
                        </Link>
                        {memberData?.name && (
                          <p className="text-[11px] text-white/30 truncate">{memberData.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {item.notes && (
                      <p className="text-xs text-white/50 mb-2 leading-relaxed">{item.notes}</p>
                    )}

                    {/* Due date */}
                    {item.due_date && (
                      <div className="flex items-center gap-1.5 text-[11px] text-white/30 mb-3">
                        <Calendar size={10} />
                        <span>{new Date(item.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 pt-1 border-t border-[#1a1a1a]">
                      {prev && (
                        <button
                          onClick={() => moveItem(item.id, prev)}
                          disabled={isPending}
                          className="flex items-center gap-0.5 text-[11px] text-white/30 hover:text-white transition-colors px-1.5 py-1"
                          title={`Mover para ${COLUMNS.find(c => c.key === prev)?.label}`}
                        >
                          <ChevronLeft size={12} />
                        </button>
                      )}
                      {next && (
                        <button
                          onClick={() => moveItem(item.id, next)}
                          disabled={isPending}
                          className="flex items-center gap-0.5 text-[11px] text-white/30 hover:text-white transition-colors px-1.5 py-1"
                          title={`Mover para ${COLUMNS.find(c => c.key === next)?.label}`}
                        >
                          <ChevronRight size={12} />
                          <span>{COLUMNS.find(c => c.key === next)?.label}</span>
                        </button>
                      )}
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="ml-auto text-white/20 hover:text-red-400 transition-colors p-1"
                        title="Remover"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
