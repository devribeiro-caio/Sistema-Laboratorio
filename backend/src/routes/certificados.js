import { Router } from 'express';
import path from 'path';
import Certificado from '../models/Certificado.js';
import { auth, soAdmin } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = Router();
router.use(auth);

// Cliente: só da própria empresa (filtro vem do token, nunca do front). Admin: todos.
const escopo = (user) => (user.role === 'admin' ? {} : { empresa: user.empresa });

router.get('/', async (req, res) => {
  const certs = await Certificado.find(escopo(req.user))
    .populate('empresa', 'razaoSocial cnpj').select('-arquivo.nomeArmazenado').sort('-dataEmissao');
  res.json(certs);
});

router.post('/', soAdmin, upload.single('arquivo'), async (req, res) => {
  const { numero, empresa, tipo, descricao, dataEmissao, dataValidade } = req.body;
  if (!req.file) return res.status(400).json({ erro: 'Anexe o PDF do certificado.' });
  if (!numero || !empresa || !tipo || !dataEmissao) return res.status(400).json({ erro: 'Preencha os campos obrigatórios.' });
  if (await Certificado.exists({ numero })) return res.status(409).json({ erro: 'Já existe um certificado com este número.' });
  const cert = await Certificado.create({
    numero, empresa, tipo, descricao, dataEmissao, dataValidade: dataValidade || undefined,
    arquivo: { nomeOriginal: req.file.originalname, nomeArmazenado: req.file.filename },
    emitidoPor: req.user._id,
  });
  res.status(201).json(cert);
});

router.get('/:id/download', async (req, res) => {
  const cert = await Certificado.findOne({ _id: req.params.id, ...escopo(req.user) });
  if (!cert) return res.status(404).json({ erro: 'Certificado não encontrado.' });
  console.log(`[download] usuario=${req.user.email} certificado=${cert.numero}`); // trilha de acesso (LGPD)
  res.download(path.resolve('storage', cert.arquivo.nomeArmazenado), `certificado-${cert.numero}.pdf`);
});

export default router;
