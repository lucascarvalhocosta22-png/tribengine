'use client'

import { useEffect, useState } from 'react'
import { formatCurrency, formatPercent } from '@/lib/utils'

const API_URL = '/api'

export default function ComparativoPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [apenas5102, setApenas5102] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/comparativo/old-new`).then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-400">Carregando...</div>
  if (!data) return <div className="text-center py-20 text-red-400">Erro ao carregar</div>

  const cfops = ['cfop_5102', 'cfop_5405', 'outros_cfop']
  const labels: any = { cfop_5102: 'CFOP 5102 (Venda Normal)', cfop_5405: 'CFOP 5405 (Alíq. Zero)', outros_cfop: 'Outros CFOPs' }
  const oldLabels: any = { cfop_5102: 'PIS/COFINS 4,65%', cfop_5405: 'PIS/COFINS 0% (Alíq. Zero)', outros_cfop: 'PIS/COFINS 4,65%' }

  const activeCfops = apenas5102 ? ['cfop_5102'] : cfops

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Comparativo: Sistema Antigo vs Reforma</h1>
      <p className="text-sm text-gray-400 mb-6">
        Comparação entre PIS/COFINS (sistema atual) e IBS/CBS (reforma tributária) sobre as vendas
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card text-center border-green-700">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Total de Vendas</div>
          <div className="text-2xl font-bold text-green-400">{formatCurrency(data.total_geral?.total_vendas)}</div>
          <div className="text-xs text-gray-500 mt-1">{data.total_geral?.total_itens} itens</div>
        </div>
        <div className="card text-center border-blue-700">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">PIS/COFINS (Sistema Antigo)</div>
          <div className="text-2xl font-bold text-blue-400">{formatCurrency(data.total_geral?.antigo_total)}</div>
          <div className="text-xs text-gray-500 mt-1">Alíquota efetiva:{' '}
            {formatPercent((data.total_geral?.antigo_total / data.total_geral?.total_vendas * 100) || 0)}
          </div>
        </div>
        <div className="card text-center border-orange-700">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">IBS/CBS (Reforma)</div>
          <div className={`text-2xl font-bold ${data.total_geral?.diferenca_total > 0 ? 'text-orange-400' : 'text-green-400'}`}>
            {formatCurrency(data.total_geral?.novo_total)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {data.total_geral?.diferenca_total > 0 ? (
              <span className="text-orange-400">↑ {formatCurrency(data.total_geral?.diferenca_total)} a mais</span>
            ) : (
              <span className="text-green-400">↓ {formatCurrency(Math.abs(data.total_geral?.diferenca_total))} a menos</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={apenas5102} onChange={e => setApenas5102(e.target.checked)}
            className="w-4 h-4 accent-blue-600" />
          Mostrar apenas CFOP 5102 (venda normal)
        </label>
      </div>

      <div className="space-y-4 mb-8">
        {activeCfops.map((key) => {
          const cfop = data[key]
          if (!cfop) return null
          const diff = cfop.diferenca || 0
          const isPositive = diff > 0
          return (
            <div key={key} className="card">
              <h3 className="font-semibold mb-4">{labels[key]}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-xs text-gray-400">Total</div>
                  <div className="font-semibold text-white">{formatCurrency(cfop.total)}</div>
                  <div className="text-xs text-gray-500">{cfop.itens} itens</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-xs text-gray-400">{oldLabels[key]}</div>
                  <div className="font-semibold text-blue-400">{formatCurrency(cfop.antigo_pis_cofins)}</div>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-xs text-gray-400">Novo IBS</div>
                  <div className="font-semibold text-blue-300">{formatCurrency(cfop.novo_ibs)}</div>
                  <div className="text-xs text-gray-500">+ CBS {formatCurrency(cfop.novo_cbs)}</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${isPositive ? 'bg-orange-900/50' : 'bg-green-900/50'}`}>
                  <div className="text-xs text-gray-400">Diferença</div>
                  <div className={`font-semibold ${isPositive ? 'text-orange-400' : 'text-green-400'}`}>
                    {isPositive ? '↑' : '↓'} {formatCurrency(Math.abs(diff))}
                  </div>
                  {cfop.variacao_percentual !== 0 && (
                    <div className="text-xs text-gray-400">{isPositive ? '+' : ''}{cfop.variacao_percentual}%</div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Resumo com Créditos de Compra</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-400">Crédito IBS (Compras)</div>
            <div className="font-semibold text-purple-400">{formatCurrency(data.creditos_compra?.ibs_credito)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Crédito CBS (Compras)</div>
            <div className="font-semibold text-purple-400">{formatCurrency(data.creditos_compra?.cbs_credito)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Débito IBS+CBS (Vendas)</div>
            <div className="font-semibold text-orange-400">{formatCurrency(data.total_geral?.novo_total)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Saldo Líquido a Recolher</div>
            <div className={`font-semibold ${(data.total_geral?.novo_total - data.creditos_compra?.ibs_credito - data.creditos_compra?.cbs_credito) > 0 ? 'text-orange-400' : 'text-green-400'}`}>
              {formatCurrency(data.total_geral?.novo_total - data.creditos_compra?.ibs_credito - data.creditos_compra?.cbs_credito)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 card">
        <h2 className="text-lg font-semibold mb-4">Entendendo a Comparação</h2>
        <div className="text-sm text-gray-300 space-y-2">
          <p><strong className="text-blue-400">Sistema Antigo (PIS/COFINS):</strong></p>
          <ul className="list-disc list-inside text-gray-400 ml-4 space-y-1">
            <li>CFOP 5102 (venda normal): alíquota de <strong className="text-white">4,65%</strong> sobre o faturamento</li>
            <li>CFOP 5405 (venda alíquota zero): <strong className="text-white">0%</strong> — não paga PIS/COFINS</li>
          </ul>
          <p className="mt-3"><strong className="text-orange-400">Novo Sistema (IBS/CBS):</strong></p>
          <ul className="list-disc list-inside text-gray-400 ml-4 space-y-1">
            <li>IBS: <strong className="text-white">17,7%</strong> + CBS: <strong className="text-white">8,8%</strong> = 26,5%</li>
            <li>Restaurantes (Art. 275): <strong className="text-white">40% de redução</strong> nos débitos → alíquota efetiva de ~15,9%</li>
            <li>Compras de fornecedores <strong className="text-white">Simples Nacional</strong> não geram crédito</li>
            <li>Produtos com <strong className="text-white">alíquota zero, imunidade, isenção</strong> não geram crédito na compra</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
