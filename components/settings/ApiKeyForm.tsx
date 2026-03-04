'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

interface FieldDef {
  key: string
  label: string
  placeholder?: string
  secret?: boolean
}

interface ExistingKey {
  id?: string
  service: string
  key_name: string | null
  key_value: string | null
  extra_config: Record<string, string> | null
}

interface ApiKeyFormProps {
  service: 'hotmart' | 'tmb' | 'circle'
  fields: FieldDef[]
  extraConfigFields: FieldDef[]
  existingKey: ExistingKey | null
}

export default function ApiKeyForm({ service, fields, extraConfigFields, existingKey }: ApiKeyFormProps) {
  const router = useRouter()
  const [keyName, setKeyName] = useState(existingKey?.key_name ?? '')
  const [keyValue, setKeyValue] = useState(existingKey?.key_value ?? '')
  const [extraConfig, setExtraConfig] = useState<Record<string, string>>(
    (existingKey?.extra_config as Record<string, string>) ?? {}
  )
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleSecret(key: string) {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const supabase = createClient()

    const payload = {
      service,
      key_name: keyName || null,
      key_value: keyValue || null,
      extra_config: Object.keys(extraConfig).length > 0 ? extraConfig : null,
      updated_at: new Date().toISOString(),
    }

    const { error: dbError } = await supabase
      .from('api_keys')
      .upsert(payload, { onConflict: 'service' })

    if (dbError) {
      setError('Erro ao salvar. Verifique as permissões.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Key Name */}
      <div>
        <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">
          Nome da Chave
        </label>
        <input
          type="text"
          value={keyName}
          onChange={e => setKeyName(e.target.value)}
          placeholder={fields[0]?.placeholder}
          className="w-full bg-[#111] border border-[#222] text-white placeholder-white/20 px-3 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-colors"
        />
      </div>

      {/* Key Value */}
      <div>
        <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">
          {fields[1]?.label ?? 'Valor da Chave'}
        </label>
        <div className="relative">
          <input
            type={showSecrets['key_value'] ? 'text' : 'password'}
            value={keyValue}
            onChange={e => setKeyValue(e.target.value)}
            placeholder={fields[1]?.placeholder}
            className="w-full bg-[#111] border border-[#222] text-white placeholder-white/20 px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-white/30 transition-colors font-mono"
          />
          <button
            type="button"
            onClick={() => toggleSecret('key_value')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
          >
            {showSecrets['key_value'] ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {/* Extra Config Fields */}
      {extraConfigFields.map(field => (
        <div key={field.key}>
          <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">
            {field.label}
          </label>
          <div className="relative">
            <input
              type={field.secret && !showSecrets[field.key] ? 'password' : 'text'}
              value={extraConfig[field.key] ?? ''}
              onChange={e =>
                setExtraConfig(prev => ({ ...prev, [field.key]: e.target.value }))
              }
              placeholder={field.placeholder}
              className="w-full bg-[#111] border border-[#222] text-white placeholder-white/20 px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-white/30 transition-colors font-mono"
            />
            {field.secret && (
              <button
                type="button"
                onClick={() => toggleSecret(field.key)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
              >
                {showSecrets[field.key] ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            )}
          </div>
        </div>
      ))}

      {error && (
        <p className="text-xs text-red-400 border border-red-800/40 bg-red-950/10 px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="bg-white text-black text-sm font-medium px-5 py-2.5 hover:bg-white/90 transition-colors disabled:opacity-50"
      >
        {saving ? 'Salvando...' : saved ? '✓ Salvo' : 'Salvar'}
      </button>
    </form>
  )
}
