import mongoose from 'mongoose';

const empresaSchema = new mongoose.Schema({
  cnpj: { type: String, required: true, unique: true },
  razaoSocial: { type: String, required: true, trim: true },
  nomeFantasia: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true },
  telefone: String,
  endereco: { logradouro: String, cidade: String, uf: String, cep: String },
  ativa: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Empresa', empresaSchema);
