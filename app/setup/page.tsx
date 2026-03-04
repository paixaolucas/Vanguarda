export default function SetupPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 border border-white/20 mb-6">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Vanguarda</h1>
          <p className="text-sm text-white/40 mt-1">Configuração inicial necessária</p>
        </div>

        {/* Alert */}
        <div className="border border-yellow-800/50 bg-yellow-950/20 px-5 py-4 mb-8">
          <p className="text-sm font-medium text-yellow-400 mb-1">
            Credenciais Supabase não configuradas
          </p>
          <p className="text-xs text-yellow-400/70">
            O arquivo <code className="font-mono bg-yellow-950/40 px-1">.env.local</code> precisa ser preenchido
            antes de iniciar o servidor.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-5">
          {/* Step 1 */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 border border-white/20 flex items-center justify-center text-xs text-white/60 font-mono">1</span>
              <div>
                <p className="text-sm font-medium text-white mb-1">Criar projeto no Supabase</p>
                <p className="text-xs text-white/40">
                  Acesse{' '}
                  <span className="font-mono text-white/60">supabase.com</span>
                  {' '}e crie um novo projeto.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 border border-white/20 flex items-center justify-center text-xs text-white/60 font-mono">2</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">Executar o schema SQL</p>
                <p className="text-xs text-white/40 mb-2">
                  No Supabase Dashboard → SQL Editor, execute o arquivo:
                </p>
                <code className="block text-xs font-mono bg-[#111] border border-[#222] px-3 py-2 text-white/60">
                  supabase/schema.sql
                </code>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 border border-white/20 flex items-center justify-center text-xs text-white/60 font-mono">3</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">Criar usuário admin</p>
                <p className="text-xs text-white/40 mb-2">
                  Em Authentication → Users, crie um usuário:
                </p>
                <div className="bg-[#111] border border-[#222] px-3 py-2 text-xs font-mono text-white/60 space-y-0.5">
                  <p>Email: <span className="text-white">admin@vanguarda.com</span></p>
                  <p>Senha: <span className="text-white">vanguarda2024</span></p>
                </div>
                <p className="text-xs text-white/40 mt-2">
                  Depois copie o UUID e execute <code className="font-mono bg-[#111] px-1">supabase/seed-admin.sql</code> substituindo{' '}
                  <code className="font-mono text-white/50">&lt;USER_UUID&gt;</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 border border-white/20 flex items-center justify-center text-xs text-white/60 font-mono">4</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">Preencher o .env.local</p>
                <p className="text-xs text-white/40 mb-2">
                  Copie as chaves em{' '}
                  <span className="font-mono text-white/60">Project Settings → API</span>:
                </p>
                <div className="bg-[#111] border border-[#222] px-3 py-2 text-xs font-mono text-white/50 space-y-0.5">
                  <p>NEXT_PUBLIC_SUPABASE_URL=<span className="text-white/30">https://xxx.supabase.co</span></p>
                  <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=<span className="text-white/30">eyJ...</span></p>
                  <p>SUPABASE_SERVICE_ROLE_KEY=<span className="text-white/30">eyJ...</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 border border-white/20 flex items-center justify-center text-xs text-white/60 font-mono">5</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">Reiniciar o servidor</p>
                <div className="bg-[#111] border border-[#222] px-3 py-2 text-xs font-mono text-white/60">
                  npm run build &amp;&amp; npm start
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-white/15 text-xs mt-8">
          Overlens © {new Date().getFullYear()} — Vanguarda
        </p>
      </div>
    </div>
  )
}
