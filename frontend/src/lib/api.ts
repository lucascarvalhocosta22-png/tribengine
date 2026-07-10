const API_URL = '/api';

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return res.json();
}

export async function uploadXml(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}/upload/xml`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return res.json();
}

export async function uploadZip(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}/upload/zip`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return res.json();
}

export async function getDashboard() {
  return apiFetch('/dashboard');
}

export async function listNfes() {
  return apiFetch('/nfe');
}

export async function getNfe(id: number) {
  return apiFetch(`/nfe/${id}`);
}

export async function deleteNfe(id: number) {
  return apiFetch(`/nfe/${id}`, { method: 'DELETE' });
}

export async function auditarNfe(id: number) {
  return apiFetch(`/nfe/${id}/auditoria`);
}

export async function simular(params: { nome: string; mes_inicio: number; ano_inicio: number; mes_fim: number; ano_fim: number; nfe_ids: number[]; regime?: string }) {
  return apiFetch('/simular', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function simularTudo(regime: string = "geral") {
  return apiFetch('/dashboard/simular', {
    method: 'POST',
    body: JSON.stringify({ regime }),
  });
}

export async function classificarProduto(ncm: string, descricao: string, cfop: string) {
  return apiFetch(`/classificar?ncm=${encodeURIComponent(ncm)}&descricao=${encodeURIComponent(descricao)}&cfop=${encodeURIComponent(cfop)}`);
}

export async function listNfesSemCredito() {
  return apiFetch('/nfe/sem-credito');
}

export function getExcelUrl() {
  return `/api/export/excel`;
}
