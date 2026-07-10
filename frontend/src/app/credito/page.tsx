'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { apiFetch } from '@/lib/api'

export default function CreditoPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    apiFetch('/credito/analise').then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-400">Carregando...</div>
  if (!data) return <div className="text-center py-20 text-red-400">Erro ao carregar</div>

  const fornecedores = data.fornecedores || []

  const filtered = fornecedores.filter((f: any) => {
    if (filtro === 'com_credito') return f.total_credito > 0
    if (filtro === 'sem_credito') return f.total_credito === 0
    if (filtro === 'parcial') return f.itens_sem_credito > 0 && f.itens_com_credito > 0
    return true
  }).filter((f: any) => {
    if (!busca) return true
    const q = busca.toLowerCase()
    return f.fornecedor.toLowerCase().includes(q) || f.cnpj.includes(q)
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Análise de Créditos IBS/CBS</h1>
        <a href="/api/credito/export/excel" className="btn-secondary text-xs">
          Exportar Excel
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-400">{data.total_fornecedores}</div>
          <div className="text-xs text-gray-400 mt-1">Fornecedores</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-400">{formatCurrency(data.total_credito_ibms)}</div>
          <div className="text-xs text-gray-400 mt-1">Total Crédito IBS</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-400">{formatCurrency(data.total_credito_cbs)}</div>
          <div className="text-xs text-gray-400 mt-1">Total Crédito CBS</div>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <input type="text" placeholder="Buscar fornecedor ou CNPJ..." value={busca}
          onChange={e => setBusca(e.target.value)}
          className="max-w-xs px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
        />
        <div className="flex gap-1">
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'com_credito', label: 'Com Crédito' },
            { key: 'sem_credito', label: 'Sem Crédito' },
            { key: 'parcial', label: 'Parcial' },
          ].map(f => (
            <button key={f.key} onClick={() => setFiltro(f.key)}
              className={`px-3 py-1.5 text-xs rounded ${filtro === f.key ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((f: any) => (
          <FornecedorCard key={f.cnpj} fornecedor={f} />
        ))}
        {filtered.length === 0 && <div className="card text-center text-gray-500">Nenhum fornecedor encontrado</div>}
      </div>
    </div>
  )
}

function FornecedorCard({ fornecedor }: { fornecedor: any }) {
  const [aberto, setAberto] = useState(false)
  const cor = fornecedor.total_credito > 0
    ? (fornecedor.itens_sem_credito > 0 ? 'text-yellow-400' : 'text-green-400')
    : 'text-red-400'
  const status = fornecedor.total_credito > 0
    ? (fornecedor.itens_sem_credito > 0 ? 'Parcial' : 'Gera Crédito')
    : 'Sem Crédito'

  return (
    <div className="card">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setAberto(!aberto)}>
        <div className="flex-1">
          <div className="font-semibold">{fornecedor.fornecedor}</div>
          <div className="text-xs text-gray-500">{fornecedor.cnpj} — {fornecedor.total_itens} itens</div>
        </div>
        <div className="text-right mr-4">
          <div className="text-xs text-gray-400">Total Compras</div>
          <div className="font-semibold">{formatCurrency(fornecedor.total_compras)}</div>
        </div>
        <div className="text-right mr-4">
          <div className="text-xs text-gray-400">Crédito</div>
          <div className={`font-semibold ${cor}`}>{formatCurrency(fornecedor.total_credito)}</div>
        </div>
        <div className={`px-2 py-1 text-xs rounded font-medium ${
          status === 'Sem Crédito' ? 'bg-red-900 text-red-300' :
          status === 'Parcial' ? 'bg-yellow-900 text-yellow-300' :
          'bg-green-900 text-green-300'
        }`}>{status}</div>
        <span className="ml-2 text-gray-500">{aberto ? '▲' : '▼'}</span>
      </div>

      {aberto && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-1 px-2">Descrição</th>
                <th className="text-center py-1 px-2">NCM</th>
                <th className="text-center py-1 px-2">cClass</th>
                <th className="text-right py-1 px-2">Valor</th>
                <th className="text-right py-1 px-2">IBS</th>
                <th className="text-right py-1 px-2">CBS</th>
                <th className="text-center py-1 px-2">Crédito?</th>
                <th className="text-left py-1 px-2">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {fornecedor.itens.map((item: any) => {
                const gerou = item.gerou_credito
                const motivos = item.motivos_sem_credito || []
                return (
                  <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-1 px-2 max-w-[200px] truncate" title={item.descricao}>{item.descricao}</td>
                    <td className="py-1 px-2 text-center text-gray-400">{item.ncm}</td>
                    <td className="py-1 px-2 text-center">{item.cclass_trib}</td>
                    <td className="py-1 px-2 text-right">{formatCurrency(item.valor_total)}</td>
                    <td className={`py-1 px-2 text-right ${gerou ? 'text-blue-400' : 'text-gray-500'}`}>
                      {item.valor_ibms > 0 ? formatCurrency(item.valor_ibms) : 'R$ 0,00'}
                    </td>
                    <td className={`py-1 px-2 text-right ${gerou ? 'text-green-400' : 'text-gray-500'}`}>
                      {item.valor_cbs > 0 ? formatCurrency(item.valor_cbs) : 'R$ 0,00'}
                    </td>
                    <td className="py-1 px-2 text-center">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${gerou ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {gerou ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="py-1 px-2 text-xs text-gray-400 max-w-[200px]">
                      {motivos.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {motivos.map((m: any, i: number) => (
                            <span key={i} className="bg-gray-700 px-1.5 py-0.5 rounded" title={m.detalhe}>{m.motivo}</span>
                          ))}
                        </div>
                      ) : gerou ? (
                        <span className="text-green-500">Gerou crédito</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
