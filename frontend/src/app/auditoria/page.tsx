'use client'

import { useEffect, useState } from 'react'
import { listNfes, auditarNfe } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AuditoriaPage() {
  const [nfes, setNfes] = useState<any[]>([])
  const [auditoria, setAuditoria] = useState<any[]>([])
  const [selectedNfe, setSelectedNfe] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    listNfes().then(setNfes).catch(console.error)
  }, [])

  const handleAuditar = async (id: number) => {
    setLoading(true)
    setErro('')
    setSelectedNfe(id)
    try {
      const r = await auditarNfe(id)
      setAuditoria(r)
    } catch (err: any) {
      setErro(err.message)
    }
    setLoading(false)
  }

  const inconsistencias = auditoria.filter(a => a.inconsistencias_fiscais > 0)
  const alertasTotal = auditoria.reduce((acc, a) => acc + a.alertas.length, 0)
  const problemasTotal = auditoria.reduce((acc, a) => acc + a.problemas.length, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Auditoria Fiscal Automática</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">NF-es ({nfes.length})</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {nfes.map((nfe: any) => (
                <div
                  key={nfe.id}
                  className={`p-3 rounded-lg cursor-pointer border text-sm transition-colors ${
                    selectedNfe === nfe.id ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-gray-500'
                  }`}
                  onClick={() => handleAuditar(nfe.id)}
                >
                  <div className="font-medium truncate">{nfe.remetente_nome || nfe.destinatario_nome}</div>
                  <div className="text-xs text-gray-400 mt-1">Nº {nfe.numero} | {formatCurrency(nfe.valor_total)}</div>
                  <div className="text-xs text-gray-500">{formatDate(nfe.data_emissao)}</div>
                </div>
              ))}
            </div>
            {erro && <div className="text-red-400 text-sm mt-2">{erro}</div>}
          </div>
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="card flex items-center justify-center h-64 text-gray-500">Auditando...</div>
          ) : auditoria.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="card text-center p-4">
                  <div className="text-2xl font-bold text-red-400">{problemasTotal}</div>
                  <div className="text-xs text-gray-400 mt-1">Problemas</div>
                </div>
                <div className="card text-center p-4">
                  <div className="text-2xl font-bold text-yellow-400">{alertasTotal}</div>
                  <div className="text-xs text-gray-400 mt-1">Alertas</div>
                </div>
                <div className="card text-center p-4">
                  <div className="text-2xl font-bold text-orange-400">{inconsistencias.length}</div>
                  <div className="text-xs text-gray-400 mt-1">Itens com Inconsistências</div>
                </div>
              </div>

              <div className="space-y-4">
                {auditoria.map((a: any, i: number) => (
                  <div key={i} className={`card border-l-4 ${
                    a.problemas.length > 0 ? 'border-l-red-500' : 
                    a.alertas.length > 0 ? 'border-l-yellow-500' : 'border-l-green-500'
                  }`}>
                    <h3 className="font-medium mb-2">{a.descricao || `Item ${i + 1}`}</h3>
                    
                    {a.problemas.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-semibold text-red-400 uppercase">Problemas</span>
                        {a.problemas.map((p: string, j: number) => (
                          <div key={j} className="flex items-center gap-2 text-sm text-red-300 mt-1">
                            <span>✗</span> {p}
                          </div>
                        ))}
                      </div>
                    )}

                    {a.alertas.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-semibold text-yellow-400 uppercase">Alertas</span>
                        {a.alertas.map((al: string, j: number) => (
                          <div key={j} className="flex items-center gap-2 text-sm text-yellow-300 mt-1">
                            <span>⚠</span> {al}
                          </div>
                        ))}
                      </div>
                    )}

                    {a.sugestoes.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-blue-400 uppercase">Sugestões</span>
                        {a.sugestoes.map((s: string, j: number) => (
                          <div key={j} className="flex items-center gap-2 text-sm text-blue-300 mt-1">
                            <span>→</span> {s}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-3 flex-wrap">
                      {a.ncm_incompativel && <span className="badge badge-danger">NCM Incompatível</span>}
                      {a.cclass_trib_incorreto && <span className="badge badge-danger">cClassTrib Incorreto</span>}
                      {a.tributacao_errada && <span className="badge badge-danger">Tributação Errada</span>}
                      {a.reducao_incorreta && <span className="badge badge-warning">Redução Incorreta</span>}
                      {a.cfop_incompativel && <span className="badge badge-warning">CFOP Incompatível</span>}
                      {a.credito_perdido && <span className="badge badge-info">Crédito Perdido</span>}
                      {a.economia_tributaria && <span className="badge badge-success">Economia Possível</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="card flex items-center justify-center h-64 text-gray-500">
              Selecione uma NF-e para auditar
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
