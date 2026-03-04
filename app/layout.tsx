import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vanguarda — Painel Interno',
  description: 'Plataforma de gestão interna Overlens',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  )
}
