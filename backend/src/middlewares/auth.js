import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

export async function auth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ erro: 'Faça login para continuar.' });
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Usuario.findById(id);
    if (!user || user.status !== 'ativo') return res.status(401).json({ erro: 'Sessão inválida.' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ erro: 'Sessão expirada. Entre novamente.' });
  }
}

export const soAdmin = (req, res, next) =>
  req.user.role === 'admin' ? next() : res.status(403).json({ erro: 'Acesso restrito ao laboratório.' });
