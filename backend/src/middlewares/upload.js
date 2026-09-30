import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';

fs.mkdirSync('storage', { recursive: true }); // fora de pasta pública

export default multer({
  storage: multer.diskStorage({
    destination: 'storage',
    filename: (req, file, cb) => cb(null, crypto.randomUUID() + '.pdf'),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.mimetype === 'application/pdf' ? cb(null, true) : cb(new Error('Envie apenas arquivos PDF.')),
});
