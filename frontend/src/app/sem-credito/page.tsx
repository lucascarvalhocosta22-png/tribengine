'use client'

import { useEffect, useState } from 'react'
import { listNfesSemCredito } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function SemCreditoPage() {
  const [nfes, setNfes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listNfesSemCredito().then(setNfes).catch(console.error).finally(() => setLoading(false))
  }, [])

  const total = nfes.reduce((s, n) => s + (n.valor_total || 0), 0)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Compras sem Crédito IBS/CBS</h1>
      <p className="text-sm text-gray-400 mb-6">
        Fornecedores optantes pelo Simples Nacional — LC 214/2025, Art. 28: não geram crédito de IBS/CBS
      </p>

      {loading ? (
        <div className="text-gray-400">Carregando...</div>
      ) : nfes.length === 0 ? (
        <div className="card text-center text-gray-500">Nenhuma compra de fornecedor Simples Nacional encontrada.</div>
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card text-center">
              <div className="text-2xl font-bold text-yellow-400">{nfes.length}</div>
              <div className="text-xs text-gray-400 mt-1">NF-es sem crédito</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-yellow-400">{formatCurrency(total)}</div>
              <div className="text-xs text-gray-400 mt-1">Valor total sem crédito</div>
            </div>
          </div>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left py-2 px-2">NF-e</th>
                    <th className="text-left py-2 px-2">Data</th>
                    <th className="text-left py-2 px-2">Fornecedor</th>
                    <th className="text-left py-2 px-2">CNPJ</th>
                    <th className="text-right py-2 px-2">Valor</th>
                    <th className="text-left py-2 px-2">Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {nfes.map((n: any) => (
                    <tr key={n.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-2 px-2">{n.numero}</td>
                      <td className="py-2 px-2 text-gray-400">{formatDate(n.data_emissao)}</td>
                      <td className="py-2 px-2">{n.remetente_nome}</td>
                      <td className="py-2 px-2 text-gray-400">{n.remetente_cnpj}</td>
                      <td className="py-2 px-2 text-right text-yellow-400">{formatCurrency(n.valor_total)}</td>
                      <td className="py-2 px-2 text-xs text-gray-500">{n.motivo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
