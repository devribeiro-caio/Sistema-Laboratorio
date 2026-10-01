import BlingToken from '../models/BlingToken.js';

const AUTH = 'https://www.bling.com.br/Api/v3/oauth';
const API = 'https://api.bling.com.br/Api/v3';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const erro = (msg, status = 502) => Object.assign(new Error(msg), { status });

const basic = () =>
  'Basic ' + Buffer.from(`${process.env.BLING_CLIENT_ID}:${process.env.BLING_CLIENT_SECRET}`).toString('base64');

export const urlAutorizacao = (state) =>
  `${AUTH}/authorize?response_type=code&client_id=${process.env.BLING_CLIENT_ID}&state=${state}`;

async function pedirToken(params) {
  const res = await fetch(`${AUTH}/token`, {
    method: 'POST',
    headers: { Authorization: basic(), 'Content-Type': 'application/x-www-form-urlencoded', 'enable-jwt': '1' },
    body: new URLSearchParams(params),
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw erro('O Bling recusou a autenticação. Reconecte a conta na aba Bling.');
  await BlingToken.findOneAndUpdate(
    { chave: 'principal' },
    { accessToken: d.access_token, refreshToken: d.refresh_token, expiraEm: new Date(Date.now() + d.expires_in * 1000) },
    { upsert: true },
  );
}

export const trocarCodigo = (code) => pedirToken({ grant_type: 'authorization_code', code });

// Evita que várias requisições simultâneas renovem o token ao mesmo tempo
// (o refresh token do Bling é trocado a cada renovação).
let renovando = null;
async function tokenValido() {
  const t = await BlingToken.findOne({ chave: 'principal' });
  if (!t) throw erro('Bling não conectado. Conecte a conta na aba Bling.', 400);
  if (t.expiraEm.getTime() - Date.now() > 60_000) return t.accessToken;
  renovando ??= pedirToken({ grant_type: 'refresh_token', refresh_token: t.refreshToken }).finally(() => { renovando = null; });
  await renovando;
  return (await BlingToken.findOne({ chave: 'principal' })).accessToken;
}

// Fila: no máximo ~2,5 requisições/s (o limite do Bling é 3/s por conta).
let fila = Promise.resolve();
function agendar(fn) {
  const r = fila.then(fn);
  fila = r.catch(() => {}).then(() => sleep(400));
  return r;
}

export function blingGet(caminho, params = {}) {
  return agendar(async () => {
    for (let tentativa = 1; tentativa <= 3; tentativa++) {
      const res = await fetch(`${API}${caminho}?${new URLSearchParams(params)}`, {
        headers: { Authorization: `Bearer ${await tokenValido()}`, Accept: 'application/json' },
      });
      if (res.status === 429) { await sleep(1500 * tentativa); continue; }
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw erro(d?.error?.description || `O Bling respondeu com erro ${res.status}.`);
      return d;
    }
    throw erro('O Bling está limitando as requisições. Tente novamente em instantes.', 429);
  });
}

export async function buscarPedido(numero) {
  const { data = [] } = await blingGet('/pedidos/vendas', { numero });
  const p = data.find((x) => String(x.numero) === String(numero));
  if (!p) return null;
  return {
    id: String(p.id), numero: String(p.numero), data: p.data, total: p.total,
    cliente: p.contato?.nome, contatoId: p.contato?.id ? String(p.contato.id) : null,
  };
}
