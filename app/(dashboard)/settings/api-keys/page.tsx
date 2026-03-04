import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import ApiKeyForm from '@/components/settings/ApiKeyForm'
import CircleSyncButton from './CircleSyncButton'
import HotmartImportButton from './HotmartImportButton'
import SupabaseInfoCard from '@/components/settings/SupabaseInfoCard'
import { Key, ClipboardList } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const services = [
  {
    id: 'hotmart' as const,
    label: 'Hotmart',
    description: 'Integração com a plataforma Hotmart para webhooks e sincronização de compras.',
    fields: [
      { key: 'key_name', label: 'Nome da Chave', placeholder: 'hotmart-api-key' },
      { key: 'key_value', label: 'Client Secret / Webhook Secret', placeholder: 'hs_xxx...', secret: true },
    ],
    extraConfig: [
      { key: 'client_id', label: 'Client ID', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
      { key: 'client_secret', label: 'Client Secret (OAuth)', placeholder: 'xxxxxxxxxxxxxxxx', secret: true },
    ],
  },
  {
    id: 'tmb' as const,
    label: 'The Members Place',
    description: 'Integração com TMB para gerenciamento de membros.',
    fields: [
      { key: 'key_name', label: 'Nome da Chave', placeholder: 'tmb-api-key' },
      { key: 'key_value', label: 'API Key / Webhook Secret', placeholder: 'tmb_xxx...', secret: true },
    ],
    extraConfig: [],
  },
  {
    id: 'circle' as const,
    label: 'Circle',
    description: 'Integração com Circle usando Admin API (plano Business). Não inclui Data API.',
    fields: [
      { key: 'key_name', label: 'Nome da Chave', placeholder: 'circle-api-token' },
      { key: 'key_value', label: 'API Token', placeholder: 'cir_xxx...', secret: true },
    ],
    extraConfig: [
      { key: 'community_id', label: 'Community ID', placeholder: '12345' },
      { key: 'webhook_secret', label: 'Webhook Secret', placeholder: 'whsec_xxx...', secret: true },
    ],
  },
]

export default async function ApiKeysPage() {
  const supabase = await createClient()
  const { data: apiKeys } = await supabase.from('api_keys').select('*')

  const keyMap = Object.fromEntries(
    (apiKeys ?? []).map(k => [k.service, k])
  )

  return (
    <div>
      <PageHeader
        title="Chaves de API"
        description="Configure as integrações com plataformas externas"
        action={
          <Link
            href="/settings/audit-log"
            className="flex items-center gap-1.5 text-xs border border-[#222] px-3 py-1.5 text-white/50 hover:text-white hover:border-[#333] transition-colors"
          >
            <ClipboardList size={12} />
            Log de Auditoria
          </Link>
        }
      />

      <div className="space-y-6 max-w-2xl">
        <SupabaseInfoCard />

        {services.map(service => (
          <div key={service.id} className="bg-[#0a0a0a] border border-[#1a1a1a]">
            <div className="flex items-start justify-between px-5 py-4 border-b border-[#1a1a1a]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Key size={14} className="text-white/40" />
                  <span className="text-sm font-medium text-white">{service.label}</span>
                  {keyMap[service.id] && (
                    <span className="text-[10px] px-1.5 py-0.5 border border-green-900/40 bg-green-950/20 text-green-400">
                      Configurado
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/30">{service.description}</p>
              </div>
            </div>
            <div className="p-5">
              <ApiKeyForm
                service={service.id}
                fields={service.fields}
                extraConfigFields={service.extraConfig}
                existingKey={keyMap[service.id] ?? null}
              />
              {service.id === 'circle' && <CircleSyncButton />}
              {service.id === 'hotmart' && <HotmartImportButton />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
