import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Motor Inteligente da Reforma Tributária',
  description: 'IBS • CBS • Imposto Seletivo • cClassTrib',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div>
          <nav className="border-b border-gray-800 bg-[#0f172a] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2">
                <span className="text-xl font-bold text-blue-400">⚡ TribEngine</span>
                <span className="hidden sm:inline text-sm text-gray-400">| Reforma Tributária</span>
              </a>
              <div className="flex gap-4 text-sm items-center">
                <a href="/" className="text-gray-300 hover:text-white transition-colors">Dashboard</a>
                <a href="/nfe" className="text-gray-300 hover:text-white transition-colors">NF-e</a>
                <a href="/classificador" className="text-gray-300 hover:text-white transition-colors">Classificador</a>
                <a href="/simulacao" className="text-gray-300 hover:text-white transition-colors">Simulação</a>
                <a href="/auditoria" className="text-gray-300 hover:text-white transition-colors">Auditoria</a>
                <a href="/credito" className="text-gray-300 hover:text-white transition-colors">Créditos</a>
                <a href="/comparativo" className="text-gray-300 hover:text-white transition-colors">Old vs New</a>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
