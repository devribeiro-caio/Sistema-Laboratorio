import { Router } from 'express';
import Usuario from '../models/Usuario.js';
import { auth, soAdmin } from '../middlewares/auth.js';

const router = Router();
router.use(auth, soAdmin);

router.get('/', async (req, res) => {
  const filtro = req.query.status ? { status: req.query.status } : {};
  res.json(await Usuario.find({ ...filtro, role: 'cliente' }).populate('empresa', 'razaoSocial cnpj').sort('-createdAt'));
});

const mudarStatus = (status) => async (req, res) => {
  const u = await Usuario.findOneAndUpdate({ _id: req.params.id, role: 'cliente' }, { status }, { new: true });
  u ? res.json(u) : res.status(404).json({ erro: 'Usuário não encontrado.' });
};
router.patch('/:id/aprovar', mudarStatus('ativo'));
router.patch('/:id/bloquear', mudarStatus('bloqueado'));

export default router;
