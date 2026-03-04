import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-bold text-white/10 mb-4">404</p>
        <h1 className="text-xl font-semibold text-white mb-2">Página não encontrada</h1>
        <p className="text-sm text-white/30 mb-8">A página que você procura não existe.</p>
        <Link
          href="/"
          className="text-sm text-white/50 hover:text-white border border-[#222] px-4 py-2.5 transition-colors"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}
