import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  senhaHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'cliente'], default: 'cliente' },
  empresa: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa' },
  status: { type: String, enum: ['pendente', 'ativo', 'bloqueado'], default: 'pendente' },
}, { timestamps: true });

export default mongoose.model('Usuario', usuarioSchema);
