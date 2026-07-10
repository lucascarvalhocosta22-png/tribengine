'use client'

import { useEffect, useState } from 'react'
import { listNfes, simular, apiFetch } from '@/lib/api'
import { formatCurrency, MESES } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'

const CORES = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
const REGIMES = [
  { value: 'geral', label: 'Regime Geral (IBS 8% + CBS 8%)' },
  { value: 'restaurante', label: 'Restaurante / Bar / Delivery (Redução 40%)' },
]

export default function SimulacaoPage() {
  const [nfes, setNfes] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [resultados, setResultados] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [regime, setRegime] = useState('geral')
  const [modo, setModo] = useState<'importado' | 'manual'>('importado')
  const [mes, setMes] = useState(6)
  const [manualCompra, setManualCompra] = useState('')
  const [manualVenda, setManualVenda] = useState('')
  const [manualRedCompra, setManualRedCompra] = useState(false)
  const [manualRedVenda, setManualRedVenda] = useState(false)

  useEffect(() => {
    listNfes().then(setNfes).catch(console.error)
  }, [])

  function isCompra(n: any): boolean {
    if (n.tipo_declarado === 'compra') return true
    if (n.tipo_declarado === 'venda') return false
    if (n.itens?.length) return n.itens.some((i: any) => ['1','2','3'].includes((i.cfop || '')[0]))
    const p = n.natureza_operacao?.toLowerCase() || ''
    return p.includes('compra') || p.includes('entrada') || p.includes('aquisição') || !p
  }
  function isVenda(n: any): boolean {
    if (n.tipo_declarado === 'venda') return true
    if (n.tipo_declarado === 'compra') return false
    if (n.itens?.length) return n.itens.some((i: any) => ['5','6','7'].includes((i.cfop || '')[0]))
    const p = n.natureza_operacao?.toLowerCase() || ''
    return p.includes('venda') || p.includes('saída') || p.includes('remessa')
  }
  const comprasNfe = nfes.filter(isCompra)
  const vendasNfe = nfes.filter(isVenda)

  const toggleNfe = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleSimular = async (ids?: number[]) => {
    const nfeIds = ids ?? selectedIds
    if (modo === 'importado' && nfeIds.length === 0) return
    if (modo === 'manual' && !manualCompra && !manualVenda) return
    setLoading(true)
    setErro('')
    try {
      let r: any
      if (modo === 'manual') {
        const body = {
          nome: `Manual - ${REGIMES.find(r => r.value === regime)?.label}`,
          mes_inicio: mes, ano_inicio: 2026, mes_fim: mes, ano_fim: 2026,
          nfe_ids: [],
          regime,
          manual: {
            total_compras: parseFloat(manualCompra) || 0,
            total_vendas: parseFloat(manualVenda) || 0,
            reducao_compras: manualRedCompra,
            reducao_vendas: manualRedVenda,
          },
        }
        r = await apiFetch('/simular', {
          method: 'POST',
          body: JSON.stringify(body),
        })
      } else {
        r = await simular({
          nome: `Simulação - ${REGIMES.find(r => r.value === regime)?.label}`,
          mes_inicio: mes, ano_inicio: 2026, mes_fim: mes, ano_fim: 2026,
          nfe_ids: nfeIds, regime,
        })
      }
      setResultados(r.resultados || [])
    } catch (err: any) { setErro(err.message) }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Simular Minha Operação</h1>
      <p className="text-gray-400 mb-6 text-sm">
        Escolha o regime, selecione NF-es importadas ou digite valores manualmente.
        <span className="text-yellow-400 ml-2">cClassTrib 01.02.01 (alimentos preparados) tem redução automática de 40% no IBS/CBS.</span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card mb-4">
            <h2 className="text-lg font-semibold mb-3">Regime de Tributação</h2>
            <div className="space-y-2">
              {REGIMES.map(r => (
                <label key={r.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${regime === r.value ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-gray-500'}`}>
                  <input type="radio" name="regime" value={r.value} checked={regime === r.value} onChange={e => setRegime(e.target.value)} className="w-4 h-4" />
                  <span className="text-sm">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card mb-4">
            <h2 className="text-lg font-semibold mb-3">Mês</h2>
            <select value={mes} onChange={e => setMes(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
              {MESES.map(m => <option key={m.value} value={m.value}>{m.label}/2026</option>)}
            </select>
          </div>

          <div className="card mb-4">
            <h2 className="text-lg font-semibold mb-3">Modo de Entrada</h2>
            <div className="flex gap-2 mb-3">
              <button onClick={() => setModo('importado')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${modo === 'importado' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>NF-es Importadas</button>
              <button onClick={() => setModo('manual')} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${modo === 'manual' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>Digitar Valores</button>
            </div>

            {modo === 'importado' ? (
              <>
                <button onClick={() => handleSimular(nfes.map(n => n.id))} disabled={loading || nfes.length === 0} className="btn-primary w-full mb-3 bg-purple-600 hover:bg-purple-700 border-purple-500">⚡ Simular com Todas NF-es</button>
                <h3 className="text-xs text-gray-500 mb-2">{selectedIds.length} NF-es selecionadas</h3>
                <div className="mb-3">
                  <div className="text-sm text-blue-400 font-medium mb-1">COMPRA (crédito)</div>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {comprasNfe.map((n: any) => (
                      <label key={n.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 cursor-pointer text-sm">
                        <input type="checkbox" checked={selectedIds.includes(n.id)} onChange={() => toggleNfe(n.id)} className="w-4 h-4" />
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${n.tipo_declarado === 'compra' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-400'}`}>C</span>
                        <span className="truncate flex-1 text-xs">{n.remetente_nome} Nº {n.numero}</span>
                        <span className="text-blue-400 text-xs">{formatCurrency(n.valor_total)}</span>
                      </label>
                    ))}
                    {comprasNfe.length === 0 && <div className="text-xs text-gray-500">Nenhuma NF-e de compra</div>}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="text-sm text-green-400 font-medium mb-1">VENDA (débito)</div>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {vendasNfe.map((n: any) => (
                      <label key={n.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 cursor-pointer text-sm">
                        <input type="checkbox" checked={selectedIds.includes(n.id)} onChange={() => toggleNfe(n.id)} className="w-4 h-4" />
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${n.tipo_declarado === 'venda' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>V</span>
                        <span className="truncate flex-1 text-xs">{n.remetente_nome} Nº {n.numero}</span>
                        <span className="text-green-400 text-xs">{formatCurrency(n.valor_total)}</span>
                      </label>
                    ))}
                    {vendasNfe.length === 0 && <div className="text-xs text-gray-500">Nenhuma NF-e de venda</div>}
                  </div>
                </div>
                <button onClick={() => handleSimular()} disabled={loading || selectedIds.length === 0} className="btn-primary w-full">{loading ? 'Calculando...' : 'Calcular Selecionadas'}</button>
              </>
            ) : (
              <>
                <div className="mb-3">
                  <label className="text-sm text-blue-400 font-medium mb-1 block">Total de COMPRAS (R$) — gera crédito</label>
                  <input type="number" step="0.01" value={manualCompra} onChange={e => setManualCompra(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" placeholder="Ex: 15000" />
                  <label className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <input type="checkbox" checked={manualRedCompra} onChange={e => setManualRedCompra(e.target.checked)} className="w-3 h-3" /> Compras com redução na alíquota (ex: insumos básicos)
                  </label>
                </div>
                <div className="mb-3">
                  <label className="text-sm text-green-400 font-medium mb-1 block">Total de VENDAS (R$) — gera débito</label>
                  <input type="number" step="0.01" value={manualVenda} onChange={e => setManualVenda(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" placeholder="Ex: 35000" />
                  <label className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <input type="checkbox" checked={manualRedVenda} onChange={e => setManualRedVenda(e.target.checked)} className="w-3 h-3" /> Vendas com redução de 40% (alimentos preparados / refeições)
                  </label>
                </div>
                <button onClick={() => handleSimular()} disabled={loading || (!manualCompra && !manualVenda)} className="btn-primary w-full">{loading ? 'Calculando...' : 'Calcular Valores Manuais'}</button>
              </>
            )}
            {erro && <div className="text-red-400 text-sm mt-2">{erro}</div>}
          </div>
        </div>

        <div className="lg:col-span-2">
          {resultados.length > 0 ? (
            <ResultadoView resultados={resultados} regime={regime} />
          ) : (
            <div className="card flex items-center justify-center h-96 text-gray-500">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-4 opacity-20">⚡</div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Simulação do Mês</h3>
                <p className="text-sm text-gray-500">
                  {modo === 'importado'
                    ? 'Escolha as NF-es ao lado ou clique em "Simular com Todas NF-es". O sistema aplica redução automática de 40% em itens de alimentação (cClass 01.02.01).'
                    : 'Digite os totais de compras e vendas do mês. Marque "redução" se aplicável.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultadoView({ resultados, regime }: { resultados: any[], regime: string }) {
  const r = resultados[0]
  if (!r) return null
  const saldo = r.saldo_liquido || 0
  const isCredor = saldo >= 0
  const c = r.comparativo_sistema_antigo || {}

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Resultado — {MESES.find(m => m.value === r.mes)?.label || r.mes}/{r.ano}</h2>
      <div className="text-xs text-gray-500 mb-4">Regime: {regime === 'restaurante' ? 'Restaurante (Redução 40%)' : 'Geral'}</div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="text-center p-3 bg-gray-800 rounded-lg">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Compras</div>
          <div className="text-lg font-bold text-blue-400">{formatCurrency(r.total_compras || 0)}</div>
        </div>
        <div className="text-center p-3 bg-gray-800 rounded-lg">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Vendas</div>
          <div className="text-lg font-bold text-green-400">{formatCurrency(r.total_vendas || 0)}</div>
        </div>
        <div className="text-center p-3 bg-gray-800 rounded-lg">
          <div className="text-xs text-purple-400 uppercase tracking-wide">Créditos (Compras)</div>
          <div className="text-lg font-bold text-purple-400">{formatCurrency(r.total_creditos || 0)}</div>
          <div className="text-xs text-gray-500">IBS {formatCurrency(r.ibs_credito)} + CBS {formatCurrency(r.cbs_credito)}{r.credito_presumido > 0 ? ` + Pres ${formatCurrency(r.credito_presumido)}` : ''}</div>
        </div>
        <div className="text-center p-3 bg-gray-800 rounded-lg">
          <div className="text-xs text-orange-400 uppercase tracking-wide">Débitos (Vendas)</div>
          <div className="text-lg font-bold text-orange-400">{formatCurrency(r.total_debitos || 0)}</div>
          <div className="text-xs text-gray-500">IBS {formatCurrency(r.ibs_debito)} + CBS {formatCurrency(r.cbs_debito)}{r.is_debito > 0 ? ` + IS ${formatCurrency(r.is_debito)}` : ''}</div>
        </div>
      </div>

      <div className={`text-center p-6 rounded-lg mb-6 border-2 ${isCredor ? 'border-green-500/50 bg-green-900/10' : 'border-yellow-500/50 bg-yellow-900/10'}`}>
        <div className="text-sm text-gray-400 uppercase tracking-wide mb-1">Saldo Líquido</div>
        <div className={`text-3xl font-bold ${isCredor ? 'text-green-400' : 'text-yellow-400'}`}>
          {isCredor ? '↙ ' : '↗ '}{formatCurrency(Math.abs(saldo))}
        </div>
        <div className={`text-sm mt-1 ${isCredor ? 'text-green-300' : 'text-yellow-300'}`}>
          {isCredor ? 'Saldo Credor — créditos a recuperar' : 'Saldo Devedor — valor a recolher'}
        </div>
      </div>

      {c.total_antigo > 0 && (
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div className="p-3 bg-gray-800 rounded-lg">
            <div className="text-gray-400">PIS/COFINS (CFOP 5102)</div>
            <div className="text-orange-400 font-bold">{formatCurrency(c.total_antigo)}</div>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <div className="text-gray-400">IBS/CBS (Reforma)</div>
            <div className="text-blue-400 font-bold">{formatCurrency(c.total_novo)}</div>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <div className="text-gray-400">Diferença</div>
            <div className={`font-bold ${(c.economia || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(Math.abs(c.economia || 0))}
              <span className="text-xs ml-1">{(c.economia || 0) >= 0 ? 'a menos' : 'a mais'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {(r.compras_detalhes || []).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-blue-400 mb-2">Detalhes Compras (créditos)</h3>
            <div className="text-xs space-y-1 max-h-48 overflow-y-auto">
              {(r.compras_detalhes || []).map((d: any, i: number) => (
                <div key={i} className="flex justify-between p-1.5 bg-gray-800/50 rounded">
                  <span className="truncate flex-1">{d.descricao}</span>
                  <span className="text-purple-400 ml-2">{formatCurrency((d.ibs_credito || 0) + (d.cbs_credito || 0))}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {(r.vendas_detalhes || []).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-green-400 mb-2">Detalhes Vendas (débitos)</h3>
            <div className="text-xs space-y-1 max-h-48 overflow-y-auto">
              {(r.vendas_detalhes || []).map((d: any, i: number) => (
                <div key={i} className="flex justify-between p-1.5 bg-gray-800/50 rounded">
                  <span className="truncate flex-1">{d.descricao}</span>
                  <span className={`ml-2 ${d.fator_reducao === 0.6 ? 'text-yellow-400' : 'text-orange-400'}`}>
                    {formatCurrency((d.ibs || 0) + (d.cbs || 0) + (d.is || 0))}
                    {d.fator_reducao === 0.6 && <span className="text-yellow-600 ml-1">(-40%)</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
