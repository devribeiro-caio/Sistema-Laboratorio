import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Usuario from '../src/models/Usuario.js';

await mongoose.connect(process.env.MONGO_URI);
const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
const senhaHash = await bcrypt.hash(process.env.ADMIN_SENHA, 12);

// Remove admins antigos e recria com os dados atuais do .env
await Usuario.deleteMany({ role: 'admin' });
await Usuario.create({ nome: 'Laboratório', email, senhaHash, role: 'admin', status: 'ativo' });

console.log('Admin pronto:', email);
await mongoose.disconnect();