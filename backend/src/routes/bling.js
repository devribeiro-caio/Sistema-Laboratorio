import { Router } from 'express';
import crypto from 'crypto';
import Empresa from '../models/Empresa.js';
import BlingToken from '../models/BlingToken.js';
import { auth, soAdmin } from '../middlewares/auth.js';
import { cnpjValido, limparCnpj } from '../utils/cnpj.js';
import { urlAutorizacao, trocarCodigo, blingGet, buscarPedido } from '../services/bling.js';

const router = Router();
router.use(auth, soAdmin);

router.get('/status', async (req, res) => {
  const t = await BlingToken.findOne({ chave: 'principal' });
  res.json({ conectado: !!t, atualizadoEm: t?.updatedAt });
});

router.get('/conectar', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  res.cookie('bling_state', state, { httpOnly: true, sameSite: 'lax', maxAge: 10 * 60 * 1000 });
  res.redirect(urlAutorizacao(state));
});

router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state || state !== req.cookies.bling_state)
    return res.status(400).send('Autorização inválida ou expirada. Volte e tente conectar novamente.');
  res.clearCookie('bling_state');
  await trocarCodigo(code);
  res.redirect('/admin');
});

// Importa contatos do Bling que tenham CNPJ válido. Empresas já existentes
// só ganham o vínculo (blingId); razão social e demais dados não são sobrescritos.
router.post('/importar-clientes', async (req, res) => {
  const ops = [];
  let pagina = 1, lidos = 0, ignorados = 0;
  for (;;) {
    const { data = [] } = await blingGet('/contatos', { pagina, limite: 100 });
    for (const c of data) {
      const cnpj = limparCnpj(c.numeroDocumento);
      if (!cnpjValido(cnpj)) { ignorados++; continue; }
      ops.push({ updateOne: {
        filter: { cnpj },
        update: { $set: { blingId: String(c.id) }, $setOnInsert: { razaoSocial: c.nome, telefone: c.telefone || c.celular } },
        upsert: true,
      } });
    }
    lidos += data.length;
    if (data.length < 100) break;
    pagina++;
  }
  const r = ops.length ? await Empresa.bulkWrite(ops) : { upsertedCount: 0, modifiedCount: 0 };
  res.json({ lidos, novas: r.upsertedCount, vinculadas: r.modifiedCount, ignorados });
});

router.get('/pedidos', async (req, res) => {
  if (!req.query.numero) return res.status(400).json({ erro: 'Informe o número do pedido.' });
  const p = await buscarPedido(req.query.numero);
  p ? res.json(p) : res.status(404).json({ erro: 'Pedido não encontrado no Bling.' });
});

export default router;
