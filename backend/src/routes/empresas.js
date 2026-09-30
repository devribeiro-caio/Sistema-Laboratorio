import { Router } from 'express';
import Empresa from '../models/Empresa.js';
import { auth, soAdmin } from '../middlewares/auth.js';
import { cnpjValido, limparCnpj } from '../utils/cnpj.js';

const router = Router();
router.use(auth, soAdmin);

router.get('/', async (req, res) => res.json(await Empresa.find().sort('razaoSocial')));

router.post('/', async (req, res) => {
  const { cnpj, razaoSocial, nomeFantasia, email, telefone, endereco } = req.body;
  if (!cnpjValido(cnpj)) return res.status(400).json({ erro: 'CNPJ inválido.' });
  if (!razaoSocial) return res.status(400).json({ erro: 'Informe a razão social.' });
  const limpo = limparCnpj(cnpj);
  if (await Empresa.exists({ cnpj: limpo })) return res.status(409).json({ erro: 'Este CNPJ já está cadastrado.' });
  res.status(201).json(await Empresa.create({ cnpj: limpo, razaoSocial, nomeFantasia, email, telefone, endereco }));
});

router.put('/:id', async (req, res) => {
  const { razaoSocial, nomeFantasia, email, telefone, endereco, ativa } = req.body;
  const e = await Empresa.findByIdAndUpdate(req.params.id, { razaoSocial, nomeFantasia, email, telefone, endereco, ativa }, { new: true });
  e ? res.json(e) : res.status(404).json({ erro: 'Empresa não encontrada.' });
});

export default router;
