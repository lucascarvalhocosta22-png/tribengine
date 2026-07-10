'use client'

import { useEffect, useState } from 'react'
import { listNfes, uploadXml, uploadZip, deleteNfe, getNfe } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

const API_URL = '/api'

export default function NFePage() {
  const [nfes, setNfes] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingCompra, setUploadingCompra] = useState(false)
  const [uploadingVenda, setUploadingVenda] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [msg, setMsg] = useState('')
  const [busca, setBusca] = useState('')
  const [maxExibir, setMaxExibir] = useState(50)

  const load = () => {
    setLoading(true)
    listNfes().then(setNfes).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, tipo: string) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const setUploading = tipo === 'compra' ? setUploadingCompra : setUploadingVenda
    setUploading(true); setMsg(''); setUploadProgress('')
    let success = 0, errors = 0, lastErr = ''
    const total = files.length

    const uploadBatch = async (batchFiles: File[]): Promise<{ ok: number; fail: number; err: string }> => {
      const hasZip = batchFiles.some(f => f.name.endsWith('.zip'))
      if (hasZip || batchFiles.length === 1) {
        let ok = 0, fail = 0, err = ''
        for (const file of batchFiles) {
          try {
            const fd = new FormData(); fd.append('file', file)
            const url = file.name.endsWith('.zip') ? `/upload/zip` : `/upload/xml`
            const res = await fetch(`${API_URL}${url}?tipo=${tipo}`, { method: 'POST', body: fd })
            if (!res.ok) { const e = await res.text(); throw new Error(e) }
            ok++
          } catch (e: any) { fail++; err = `${file.name}: ${e.message}` }
        }
        return { ok, fail, err }
      }
      const fd = new FormData()
      for (const f of batchFiles) fd.append('files', f)
      try {
        const res = await fetch(`${API_URL}/upload/batch?tipo=${tipo}`, { method: 'POST', body: fd })
        const r = await res.json()
        if (!res.ok) throw new Error(r.detail || 'Erro batch')
        const ok = r.resultados?.filter((x: any) => x.sucesso).length || 0
        const fail = r.resultados?.filter((x: any) => !x.sucesso).length || 0
        const erros = r.resultados?.filter((x: any) => !x.sucesso).map((x: any) => `${x.arquivo}: ${x.erro}`).join('; ') || ''
        return { ok, fail, err: erros }
      } catch (e: any) { return { ok: batchFiles.filter(f => !f.name.endsWith('.zip')).length, fail: 0, err: '' } }
    }

    try {
      const BATCH_SIZE = 500
      const fileList = Array.from(files)
      for (let i = 0; i < fileList.length; i += BATCH_SIZE) {
        const batch = fileList.slice(i, i + BATCH_SIZE)
        const r = await uploadBatch(batch)
        success += r.ok; errors += r.fail
        if (r.err) lastErr = r.err.slice(0, 200)
        setUploadProgress(`${Math.min(i + BATCH_SIZE, total)}/${total} processados...`)
      }
      if (success > 0) {
        const s = `${success}/${total} nota(s) importada(s)`
        setMsg(errors > 0 ? `${s}, ${errors} erro(s). Ex: ${lastErr}` : s)
      } else setMsg(`Erro: ${lastErr}`)
      load()
    } catch (err: any) { setMsg(`Erro: ${err.message}`) }
    setUploading(false); setUploadProgress('')
    e.target.value = ''
  }

  const handleUploadCompra = (e: React.ChangeEvent<HTMLInputElement>) => handleUpload(e, 'compra')
  const handleUploadVenda = (e: React.ChangeEvent<HTMLInputElement>) => handleUpload(e, 'venda')

  const handleSelect = async (id: number) => {
    try { const nfe = await getNfe(id); setSelected(nfe) } catch (err) { console.error(err) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deletar NF-e?')) return
    await deleteNfe(id)
    if (selected?.id === id) setSelected(null)
    load()
  }

  const handleDeleteAll = async () => {
    if (!confirm(`Deletar TODAS as ${nfes.length} NF-es? Isso não pode ser desfeito.`)) return
    try {
      await fetch(`${API_URL}/nfe`, { method: 'DELETE' })
      setSelected(null)
      setMsg('Todas as NF-es foram deletadas.')
      load()
    } catch (err: any) { setMsg(`Erro: ${err.message}`) }
  }

  const compras = nfes.filter(n => n.tipo_declarado === 'compra')
  const vendas = nfes.filter(n => n.tipo_declarado === 'venda')
  const semTipo = nfes.filter(n => !n.tipo_declarado)

  const renderNfeCard = (nfe: any) => (
    <div
      key={nfe.id}
      className={`p-3 rounded-lg cursor-pointer border text-sm transition-colors ${
        selected?.id === nfe.id ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-gray-500'
      }`}
      onClick={() => handleSelect(nfe.id)}
    >
      <div className="flex justify-between items-start">
        <div className="font-medium truncate flex-1">{nfe.remetente_nome || nfe.destinatario_nome || 'NF-e'}</div>
        <span className={`text-xs px-2 py-0.5 rounded font-medium ml-2 ${
          nfe.tipo_declarado === 'compra' ? 'bg-blue-900 text-blue-300' :
          nfe.tipo_declarado === 'venda' ? 'bg-green-900 text-green-300' :
          'bg-gray-700 text-gray-400'
        }`}>
          {nfe.tipo_declarado === 'compra' ? 'COMPRA' : nfe.tipo_declarado === 'venda' ? 'VENDA' : 'AUTO'}
        </span>
      </div>
      <div className="text-gray-400 text-xs mt-1">
        Série {nfe.serie} Nº {nfe.numero} | {formatDate(nfe.data_emissao)}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-green-400 text-xs">{formatCurrency(nfe.valor_total)}</span>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(nfe.id) }} className="text-red-400 text-xs hover:text-red-300">Deletar</button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Importar NF-e</h1>
        <a href="/api/export/excel" className="btn-secondary text-xs">
          Exportar Excel
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card border-blue-700 border-dashed border-2">
          <h2 className="text-lg font-semibold text-blue-400 mb-2">📥 Importar NOTAS de COMPRA</h2>
          <p className="text-xs text-gray-400 mb-4">Estas notas gerarão <strong className="text-purple-400">créditos</strong> de IBS/CBS</p>
          <label className={`btn-primary cursor-pointer w-full justify-center ${uploadingCompra ? 'opacity-50' : ''}`}>
            {uploadingCompra ? 'Importando...' : 'Selecionar XMLs ou ZIP'}
            <input type="file" accept=".xml,.zip" className="hidden" onChange={handleUploadCompra} disabled={uploadingCompra} multiple />
          </label>
          {uploadProgress && uploadingCompra && <div className="text-xs text-gray-400 mt-2">{uploadProgress}</div>}
          {compras.length > 0 && (
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-2">{compras.length} nota(s) de compra importada(s)</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">{compras.slice(0, 100).map(renderNfeCard)}</div>
            </div>
          )}
        </div>

        <div className="card border-green-700 border-dashed border-2">
          <h2 className="text-lg font-semibold text-green-400 mb-2">📤 Importar NOTAS de VENDA / SAÍDA</h2>
          <p className="text-xs text-gray-400 mb-4">Estas notas gerarão <strong className="text-orange-400">débitos</strong> de IBS/CBS/IS</p>
          <label className={`btn-primary cursor-pointer w-full justify-center bg-green-700 hover:bg-green-600 border-green-500 ${uploadingVenda ? 'opacity-50' : ''}`}>
            {uploadingVenda ? 'Importando...' : 'Selecionar XMLs ou ZIP'}
            <input type="file" accept=".xml,.zip" className="hidden" onChange={handleUploadVenda} disabled={uploadingVenda} multiple />
          </label>
          {uploadProgress && uploadingVenda && <div className="text-xs text-gray-400 mt-2">{uploadProgress}</div>}
          {vendas.length > 0 && (
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-2">{vendas.length} nota(s) de venda importada(s)</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">{vendas.slice(0, 100).map(renderNfeCard)}</div>
            </div>
          )}
        </div>
      </div>

      {msg && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${msg.includes('Erro') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
          {msg}
        </div>
      )}

      {semTipo.length > 0 && (
        <div className="card mb-6 border-yellow-700">
          <h3 className="text-sm font-semibold text-yellow-400 mb-2">⚠ NF-es sem tipo declarado ({semTipo.length})</h3>
          <p className="text-xs text-gray-500 mb-2">Foram detectadas automaticamente pelo CFOP. Considere reimportá-las com o tipo correto.</p>
          <div className="space-y-2 max-h-40 overflow-y-auto">{semTipo.map(renderNfeCard)}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Todas NF-es ({nfes.length})</h2>
              <div className="flex gap-2">
                <button onClick={() => setMaxExibir(maxExibir + 100)} className="text-xs text-blue-400 hover:text-blue-300">+100</button>
                {nfes.length > 0 && (
                  <button onClick={handleDeleteAll} className="text-xs text-red-400 hover:text-red-300 border border-red-800 px-2 py-1 rounded">
                    Deletar Todas
                  </button>
                )}
              </div>
            </div>
            <input
              type="text" placeholder="Buscar NF-e..." value={busca}
              onChange={e => { setBusca(e.target.value); setMaxExibir(50) }}
              className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded mb-3 text-white placeholder-gray-500"
            />
            {loading ? (
              <div className="text-gray-400 text-sm">Carregando...</div>
            ) : nfes.length === 0 ? (
              <div className="text-gray-400 text-sm">Nenhuma NF-e importada</div>
            ) : (
              <div>
                <div className="text-xs text-gray-500 mb-1">{compras.length} compras | {vendas.length} vendas | {semTipo.length} sem tipo</div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {nfes.filter(n => !busca || n.remetente_nome?.toLowerCase().includes(busca.toLowerCase()) || n.destinatario_nome?.toLowerCase().includes(busca.toLowerCase()) || n.numero?.toString().includes(busca)).slice(0, maxExibir).map(renderNfeCard)}
                  {maxExibir < nfes.length && (
                    <button onClick={() => setMaxExibir(maxExibir + 100)} className="w-full text-xs text-blue-400 hover:text-blue-300 py-2 border border-dashed border-gray-700 rounded">
                      Mostrar mais 100 ({nfes.length - maxExibir} restantes)
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Detalhes da NF-e</h2>
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div><span className="text-gray-400">Remetente:</span> <span className="text-white">{selected.remetente_nome}</span></div>
                <div><span className="text-gray-400">CNPJ:</span> <span className="text-white">{selected.remetente_cnpj}</span></div>
                <div><span className="text-gray-400">Destinatário:</span> <span className="text-white">{selected.destinatario_nome}</span></div>
                <div><span className="text-gray-400">Valor Total:</span> <span className="text-green-400 font-bold">{formatCurrency(selected.valor_total)}</span></div>
                <div><span className="text-gray-400">Natureza:</span> <span className="text-white">{selected.natureza_operacao}</span></div>
                <div><span className="text-gray-400">Tipo:</span>
                  <span className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${
                    selected.tipo_declarado === 'compra' ? 'bg-blue-900 text-blue-300' :
                    selected.tipo_declarado === 'venda' ? 'bg-green-900 text-green-300' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {selected.tipo_declarado || 'Auto detectado'}
                  </span>
                </div>
                {selected.simples_nacional === 'Sim' && (
                  <div><span className="text-gray-400">Simples Nacional:</span>
                    <span className="ml-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-900 text-yellow-300">
                      Sim — sem crédito IBS/CBS
                    </span>
                  </div>
                )}
              </div>

              <h3 className="font-semibold mb-3">Itens ({selected.itens?.length || 0})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left py-2 px-2">Código</th>
                      <th className="text-left py-2 px-2">Descrição</th>
                      <th className="text-center py-2 px-2">NCM</th>
                      <th className="text-center py-2 px-2">cClassTrib</th>
                      <th className="text-center py-2 px-2">Conf.</th>
                      <th className="text-right py-2 px-2">Valor</th>
                      <th className="text-right py-2 px-2">IBS</th>
                      <th className="text-right py-2 px-2">CBS</th>
                      <th className="text-right py-2 px-2">IS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.itens?.map((item: any, i: number) => (
                      <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-2 px-2 text-gray-400">{item.codigo_produto}</td>
                        <td className="py-2 px-2 max-w-[200px] truncate" title={item.descricao}>{item.descricao}</td>
                        <td className="py-2 px-2 text-center">{item.ncm}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={`badge ${item.precisa_revisao === 'Sim' ? 'badge-warning' : 'badge-success'}`}>
                            {item.cclass_trib}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">{item.confianca?.toFixed(1)}%</td>
                        <td className="py-2 px-2 text-right">{formatCurrency(item.valor_total)}</td>
                        <td className="py-2 px-2 text-right text-blue-400">{formatCurrency(item.valor_ibms)}</td>
                        <td className="py-2 px-2 text-right text-green-400">{formatCurrency(item.valor_cbs)}</td>
                        <td className="py-2 px-2 text-right text-yellow-400">{formatCurrency(item.valor_is)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card flex items-center justify-center h-64 text-gray-500">
              Selecione uma NF-e para visualizar os detalhes
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
