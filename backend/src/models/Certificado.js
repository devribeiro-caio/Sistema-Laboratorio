import mongoose from 'mongoose';

const certificadoSchema = new mongoose.Schema({
  numero: { type: String, required: true, unique: true, trim: true },
  empresa: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true, index: true },
  tipo: { type: String, required: true, trim: true },
  descricao: String,
  dataEmissao: { type: Date, required: true },
  dataValidade: Date,
  arquivo: { nomeOriginal: String, nomeArmazenado: String },
  emitidoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
}, { timestamps: true });

export default mongoose.model('Certificado', certificadoSchema);
