'use client'

import { useState } from 'react'
import { Shield, Trash2, Plus, User, Eye } from 'lucide-react'

type Admin = {
  id: string
  name: string | null
  email: string | null
  role: string | null
  created_at: string
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  viewer: 'Visualizador',
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'text-yellow-400 border-yellow-800/40 bg-yellow-950/10',
  admin: 'text-blue-400 border-blue-800/40 bg-blue-950/10',
  viewer: 'text-white/40 border-[#333] bg-[#111]',
}

export default function AdminsManager({
  admins: initialAdmins,
  currentAdminId,
}: {
  admins: Admin[]
  currentAdminId: string
}) {
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ email: '', name: '', role: 'admin' })
  const [addError, setAddError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd() {
    if (!addForm.email.trim()) { setAddError('Email é obrigatório'); return }
    setAdding(true)
    setAddError(null)
    const res = await fetch('/api/settings/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    })
    const data = await res.json()
    if (!res.ok) { setAddError(data.error ?? 'Erro ao adicionar'); setAdding(false); return }
    setAdmins(prev => [...prev, data])
    setAddForm({ email: '', name: '', role: 'admin' })
    setShowAdd(false)
    setAdding(false)
  }

  async function handleRoleChange(id: string, role: string) {
    setSaving(id)
    setError(null)
    const res = await fetch('/api/settings/admins', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Erro ao atualizar'); setSaving(null); return }
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, role } : a))
    setSaving(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este admin?')) return
    const res = await fetch('/api/settings/admins', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Erro ao remover'); return }
    setAdmins(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Role legend */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-4">
        <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">Níveis de Acesso</p>
        <div className="space-y-2 text-xs text-white/40">
          <div className="flex items-center gap-2">
            <Shield size={12} className="text-yellow-400" />
            <span className="text-yellow-400 font-medium">Super Admin</span> — acesso total, gerencia outros admins
          </div>
          <div className="flex items-center gap-2">
            <User size={12} className="text-blue-400" />
            <span className="text-blue-400 font-medium">Admin</span> — vê apenas membros atribuídos a ele
          </div>
          <div className="flex items-center gap-2">
            <Eye size={12} className="text-white/40" />
            <span className="text-white/40 font-medium">Visualizador</span> — acesso somente leitura
          </div>
        </div>
      </div>

      {/* Admins list */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <span className="text-sm font-medium text-white">Administradores</span>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white border border-[#222] px-3 py-1.5 hover:border-[#333] transition-colors"
          >
            <Plus size={12} />
            Adicionar
          </button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="px-5 py-4 border-b border-[#1a1a1a] space-y-3 bg-[#060606]">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Email (do Supabase Auth)</label>
                <input
                  value={addForm.email}
                  onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="admin@exemplo.com"
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Nome</label>
                <input
                  value={addForm.name}
                  onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Nome do admin"
                  className="input-field text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Role</label>
              <select
                value={addForm.role}
                onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))}
                className="input-field text-sm"
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
                <option value="viewer">Visualizador</option>
              </select>
            </div>
            {addError && <p className="text-xs text-red-400">{addError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={adding}
                className="bg-white text-black text-xs px-4 py-2 font-medium hover:bg-white/90 disabled:opacity-50 transition-colors"
              >
                {adding ? 'Adicionando...' : 'Adicionar'}
              </button>
              <button
                onClick={() => { setShowAdd(false); setAddError(null) }}
                className="px-4 py-2 text-xs text-white/40 border border-[#222] hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
            <p className="text-[11px] text-white/20">
              O usuário já deve existir em Authentication → Users no Supabase.
            </p>
          </div>
        )}

        {error && (
          <div className="px-5 py-2 border-b border-[#1a1a1a]">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {admins.length === 0 ? (
          <p className="text-xs text-white/30 text-center py-8">Nenhum admin cadastrado</p>
        ) : (
          <div className="divide-y divide-[#111]">
            {admins.map(admin => (
              <div key={admin.id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-8 h-8 bg-[#1a1a1a] border border-[#222] flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{admin.name ?? admin.email}</p>
                  {admin.name && <p className="text-xs text-white/30 truncate">{admin.email}</p>}
                  {admin.id === currentAdminId && (
                    <span className="text-[10px] text-white/20">(você)</span>
                  )}
                </div>

                {/* Role selector */}
                <select
                  value={admin.role ?? 'admin'}
                  onChange={e => handleRoleChange(admin.id, e.target.value)}
                  disabled={saving === admin.id || admin.id === currentAdminId}
                  className={`text-[11px] border px-2 py-1 bg-transparent focus:outline-none appearance-none cursor-pointer disabled:opacity-50 transition-colors ${ROLE_COLORS[admin.role ?? 'admin'] ?? 'text-white/40 border-[#333]'}`}
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Visualizador</option>
                </select>

                {/* Delete */}
                {admin.id !== currentAdminId && (
                  <button
                    onClick={() => handleDelete(admin.id)}
                    className="text-white/20 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                    title="Remover admin"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
