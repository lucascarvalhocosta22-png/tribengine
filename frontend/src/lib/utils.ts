export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function getConfiancaColor(confianca: number): string {
  if (confianca >= 90) return 'text-green-400';
  if (confianca >= 75) return 'text-yellow-400';
  return 'text-red-400';
}

export function getConfiancaBadge(confianca: number): string {
  if (confianca >= 90) return 'badge badge-success';
  if (confianca >= 75) return 'badge badge-warning';
  return 'badge badge-danger';
}

export function getNivelConfianca(confianca: number): string {
  if (confianca >= 90) return 'Alta';
  if (confianca >= 75) return 'Média';
  return 'Necessita Revisão';
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const MESES = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];
