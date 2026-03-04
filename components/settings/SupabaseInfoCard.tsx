import { Database } from 'lucide-react'

function maskKey(key: string | undefined): string {
  if (!key) return '—'
  return key.slice(0, 12) + '...' + key.slice(-6)
}

export default function SupabaseInfoCard() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY

  const configured = !!(url && anon && service)

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
      <div className="flex items-start justify-between px-5 py-4 border-b border-[#1a1a1a]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database size={14} className="text-white/40" />
            <span className="text-sm font-medium text-white">Supabase</span>
            {configured ? (
              <span className="text-[10px] px-1.5 py-0.5 border border-green-900/40 bg-green-950/20 text-green-400">
                Configurado
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 border border-red-900/40 bg-red-950/20 text-red-400">
                Incompleto
              </span>
            )}
          </div>
          <p className="text-xs text-white/30">
            Banco de dados e autenticação. Configurado via <code className="text-white/40">.env.local</code>.
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">URL do Projeto</p>
          <p className="text-sm font-mono text-white/70 bg-[#111] border border-[#222] px-3 py-2.5 break-all">
            {url ?? <span className="text-red-400">Não definido</span>}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">Anon Key</p>
          <p className="text-sm font-mono text-white/50 bg-[#111] border border-[#222] px-3 py-2.5">
            {anon ? maskKey(anon) : <span className="text-red-400">Não definido</span>}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">Service Role Key</p>
          <p className="text-sm font-mono text-white/50 bg-[#111] border border-[#222] px-3 py-2.5">
            {service ? maskKey(service) : <span className="text-red-400">Não definido</span>}
          </p>
        </div>

        <p className="text-xs text-white/20">
          Para alterar, edite o arquivo <code className="text-white/30">.env.local</code> e reinicie o servidor.
        </p>
      </div>
    </div>
  )
}
