'use client'

import { useState } from 'react'
import { classificarProduto } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

export default function ClassificadorPage() {
  const [ncm, setNcm] = useState('')
  const [descricao, setDescricao] = useState('')
  const [cfop, setCfop] = useState('')
  const [resultado, setResultado] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const classificar = async () => {
    if (!descricao) return
    setLoading(true)
    setErro('')
    try {
      const r = await classificarProduto(ncm, descricao, cfop)
      setResultado(r)
    } catch (err: any) {
      setErro(err.message)
    }
    setLoading(false)
  }

  const confianca = resultado?.classificacao?.confianca || 0
  const nivelCor = confianca >= 90 ? 'text-green-400' : confianca >= 75 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Classificador Tributário - TribAI Engine</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Dados do Produto</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">NCM (opcional)</label>
              <input value={ncm} onChange={e => setNcm(e.target.value)} placeholder="Ex: 2204.10.00" maxLength={10} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Descrição do Produto *</label>
              <input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Vinho tinto fino" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">CFOP (opcional)</label>
              <input value={cfop} onChange={e => setCfop(e.target.value)} placeholder="Ex: 5101" maxLength={4} />
            </div>
            <button onClick={classificar} disabled={loading || !descricao} className="btn-primary w-full">
              {loading ? 'Classificando...' : 'Classificar Produto'}
            </button>
            {erro && <div className="text-red-400 text-sm">{erro}</div>}
          </div>
        </div>

        {resultado && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Resultado da Classificação</h2>
            
            <div className="text-center mb-6">
              <div className={`text-5xl font-bold ${nivelCor}`}>{confianca.toFixed(1)}%</div>
              <div className={`text-sm mt-1 ${nivelCor}`}>
                {confianca >= 90 ? 'Confiança Alta' : confianca >= 75 ? 'Confiança Média' : 'Necessita Revisão'}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">cClassTrib</span>
                <span className="font-bold text-blue-400">{resultado.classificacao.cclass_trib}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Descrição</span>
                <span>{resultado.classificacao.cclasstrib_descricao}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Regime</span>
                <span className="text-purple-400">{resultado.classificacao.regime_especifico}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">CST IBS</span>
                <span>{resultado.classificacao.cst_ibms}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">CST CBS</span>
                <span>{resultado.classificacao.cst_cbs}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">CST Imposto Seletivo</span>
                <span>{resultado.classificacao.cst_is}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Alíquota IBS</span>
                <span className="text-blue-400">{resultado.classificacao.aliquota_ibms}%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Alíquota CBS</span>
                <span className="text-green-400">{resultado.classificacao.aliquota_cbs}%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Alíquota IS</span>
                <span className="text-yellow-400">{resultado.classificacao.aliquota_is}%</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2 text-sm">Cálculos</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="text-gray-400 text-xs">IBS</div>
                  <div className="font-bold text-blue-400">{formatCurrency(resultado.calculo.valor_ibms)}</div>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="text-gray-400 text-xs">CBS</div>
                  <div className="font-bold text-green-400">{formatCurrency(resultado.calculo.valor_cbs)}</div>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="text-gray-400 text-xs">IS</div>
                  <div className="font-bold text-yellow-400">{formatCurrency(resultado.calculo.valor_is)}</div>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="text-gray-400 text-xs">Carga Total</div>
                  <div className="font-bold text-white">{formatCurrency(resultado.calculo.carga_total)}</div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <details>
                <summary className="cursor-pointer text-sm text-blue-400 font-medium">Fundamentação Legal</summary>
                <div className="mt-2 text-sm text-gray-300 whitespace-pre-line">
                  {resultado.classificacao.fundamentacao_legal}
                </div>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
