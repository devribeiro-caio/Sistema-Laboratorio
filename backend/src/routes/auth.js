import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import Usuario from '../models/Usuario.js';
import Empresa from '../models/Empresa.js';
import { auth } from '../middlewares/auth.js';
import { cnpjValido, limparCnpj } from '../utils/cnpj.js';

const router = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { erro: 'Muitas tentativas. Tente em 15 minutos.' } });

// Cadastro do cliente: o CNPJ precisa já ter sido cadastrado pelo laboratório.
router.post('/register', limiter, async (req, res) => {
  const { nome, email, senha, cnpj } = req.body;
  if (!nome || !email || !senha || senha.length < 8)
    return res.status(400).json({ erro: 'Preencha todos os campos. A senha deve ter ao menos 8 caracteres.' });
  if (!cnpjValido(cnpj)) return res.status(400).json({ erro: 'CNPJ inválido.' });

  const empresa = await Empresa.findOne({ cnpj: limparCnpj(cnpj), ativa: true });
  if (!empresa) return res.status(404).json({ erro: 'CNPJ não encontrado. Fale com o laboratório para cadastrar sua empresa.' });
  if (await Usuario.exists({ email: email.toLowerCase() })) return res.status(409).json({ erro: 'E-mail já cadastrado.' });

  await Usuario.create({ nome, email, senhaHash: await bcrypt.hash(senha, 12), empresa: empresa._id });
  res.status(201).json({ mensagem: 'Cadastro enviado. Você terá acesso após a aprovação do laboratório.' });
});

router.post('/login', limiter, async (req, res) => {
  const { email, senha } = req.body;
  const user = await Usuario.findOne({ email: (email || '').toLowerCase() }).select('+senhaHash');
  if (!user || !(await bcrypt.compare(senha || '', user.senhaHash)))
    return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
  if (user.status === 'pendente') return res.status(403).json({ erro: 'Seu cadastro ainda aguarda aprovação do laboratório.' });
  if (user.status === 'bloqueado') return res.status(403).json({ erro: 'Acesso bloqueado. Fale com o laboratório.' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.cookie('token', token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 8 * 3600 * 1000,
  });
  res.json({ nome: user.nome, role: user.role });
});

router.post('/logout', (req, res) => { res.clearCookie('token'); res.json({ ok: true }); });

router.get('/me', auth, async (req, res) => {
  const u = await req.user.populate('empresa', 'razaoSocial cnpj');
  res.json({ nome: u.nome, email: u.email, role: u.role, empresa: u.empresa });
});

export default router;
