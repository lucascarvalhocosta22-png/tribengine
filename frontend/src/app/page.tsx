'use client'

import { useEffect, useState } from 'react'
import { getDashboard } from '@/lib/api'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function Dashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard().then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-400">Carregando dashboard...</div>
  if (!data) return <div className="text-center py-20 text-red-400">Erro ao carregar dados</div>

  const saldo = (data.saldo_liquido || 0)
  const isCredor = saldo >= 0

  const creditoPie = [
    { name: 'IBS Crédito', value: data.ibs_credito || 0 },
    { name: 'CBS Crédito', value: data.cbs_credito || 0 },
    { name: 'IS Débito', value: data.is_debito || 0 },
  ].filter(d => d.value > 0)

  const debitoVsCredito = [
    { name: 'IBS', Crédito: data.ibs_credito || 0, Débito: data.ibs_debito || 0 },
    { name: 'CBS', Crédito: data.cbs_credito || 0, Débito: data.cbs_debito || 0 },
    { name: 'IS', Crédito: 0, Débito: data.is_debito || 0 },
  ]

  const statusData = [
    { name: 'Com Redução', value: data.com_reducao },
    { name: 'Isentos', value: data.isentos },
    { name: 'Monofásicos', value: data.monofasicos },
    { name: 'Seletivo', value: data.seletivos },
    { name: 'Pendentes', value: data.pendentes },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard Tributário</h1>
        <div className="flex gap-2">
          <a href="/comparativo" className="btn-secondary text-xs">
            Old vs New
          </a>
          <a href="/credito" className="btn-secondary text-xs">
            Análise Créditos
          </a>
          <a href="/api/export/excel" className="btn-secondary text-xs">
            Exportar Excel
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-400">{data.total_nfes}</div>
          <div className="text-xs text-gray-400 mt-1">NF-es</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-400">{data.total_itens}</div>
          <div className="text-xs text-gray-400 mt-1">Itens</div>
        </div>
        <div className="card text-center">
          <div className="text-lg font-bold text-green-400">{formatCurrency(data.total_compras)}</div>
          <div className="text-xs text-gray-400 mt-1">Compras</div>
        </div>
        <div className="card text-center">
          <div className="text-lg font-bold text-green-400">{formatCurrency(data.total_vendas)}</div>
          <div className="text-xs text-gray-400 mt-1">Vendas</div>
        </div>
        <div className="card text-center">
          <div className="text-lg font-bold text-yellow-400">{formatCurrency(data.carga_tributaria)}</div>
          <div className="text-xs text-gray-400 mt-1">Carga Tributária IBS/CBS</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Compras → Créditos</div>
          <div className="text-2xl font-bold text-purple-400">{formatCurrency(data.total_creditos || 0)}</div>
          <div className="flex justify-center gap-4 text-xs text-gray-500 mt-2">
            <span>IBS: {formatCurrency(data.ibs_credito || 0)}</span>
            <span>CBS: {formatCurrency(data.cbs_credito || 0)}</span>
          </div>
        </div>
        <div className="card text-center">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Vendas → Débitos</div>
          <div className="text-2xl font-bold text-orange-400">{formatCurrency(data.total_debitos || 0)}</div>
          <div className="flex justify-center gap-4 text-xs text-gray-500 mt-2">
            <span>IBS: {formatCurrency(data.ibs_debito || 0)}</span>
            <span>CBS: {formatCurrency(data.cbs_debito || 0)}</span>
            {data.is_debito > 0 && <span>IS: {formatCurrency(data.is_debito)}</span>}
          </div>
        </div>
        <div className={`card text-center border-2 ${isCredor ? 'border-green-500/50' : 'border-yellow-500/50'}`}>
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Saldo Líquido</div>
          <div className={`text-2xl font-bold ${isCredor ? 'text-green-400' : 'text-yellow-400'}`}>
            {isCredor ? '↙ ' : '↗ '}{formatCurrency(Math.abs(saldo))}
          </div>
          <div className={`text-xs mt-2 ${isCredor ? 'text-green-300' : 'text-yellow-300'}`}>
            {isCredor ? 'Saldo Credor — créditos a recuperar' : 'Saldo Devedor — valor a recolher'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Crédito vs Débito por Tributo</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={debitoVsCredito}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey="Crédito" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Débito" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Distribuição dos Tributos</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={creditoPie} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>
                {creditoPie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Produtos por Status Tributário</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={120} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

          {data.compras_sem_credito_total > 0 && (
            <div className="card border-yellow-700">
              <h2 className="text-lg font-semibold mb-3">Compras sem Crédito</h2>
              <div className="text-2xl font-bold text-red-400 mb-1">{data.compras_sem_credito_total} itens</div>
              <div className="text-sm text-gray-400 mb-3">{formatCurrency(data.compras_sem_credito_valor)} em compras sem direito a crédito IBS/CBS</div>
              <div className="space-y-2">
                {(data.compras_sem_credito_motivos || []).map((m: any) => (
                  <div key={m.motivo} className="flex items-center justify-between text-sm bg-gray-800/50 rounded px-3 py-2">
                    <span className="text-gray-300">{m.motivo}</span>
                    <div className="text-right">
                      <span className="text-white font-medium">{m.itens} itens</span>
                      <span className="text-gray-500 ml-2">{formatCurrency(m.valor)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-yellow-400 mt-3">LC 214/2025, Art. 28: compras de SN não geram crédito</p>
              <div className="flex gap-3 mt-2">
                <a href="/sem-credito" className="text-xs text-blue-400 hover:text-blue-300 underline">Só SN →</a>
                <a href="/credito" className="text-xs text-blue-400 hover:text-blue-300 underline">Análise completa →</a>
              </div>
            </div>
          )}
          <div className="card">
          <h2 className="text-lg font-semibold mb-4">Indicadores de Carga Tributária</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Carga Tributária Total</span>
                <span className="font-semibold">{formatCurrency(data.carga_tributaria)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${Math.min(data.carga_percentual * 3, 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Carga Percentual</span>
                <span className="font-semibold">{formatPercent(data.carga_percentual)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${Math.min(data.carga_percentual * 3, 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Alíquota Efetiva IBS/CBS</span>
                <span className="font-semibold">{formatPercent(data.carga_percentual)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${Math.min(data.carga_percentual * 2, 100)}%` }}></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Compare com o sistema antigo em <a href="/comparativo" className="text-blue-400 underline">Old vs New</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
