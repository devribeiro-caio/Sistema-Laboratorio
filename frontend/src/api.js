export async function api(url, { method = 'GET', body } = {}) {
  const isForm = body instanceof FormData;
  const res = await fetch('/api' + url, {
    method,
    credentials: 'include',
    headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.erro || 'Algo deu errado. Tente novamente.');
  return data;
}

export const formatarCnpj = (v = '') =>
  v.replace(/\D/g, '').padEnd(14, ' ').replace(/^(.{2})(.{3})(.{3})(.{4})(.{2}).*/, '$1.$2.$3/$4-$5').trim();

export const formatarData = (d) => (d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—');
