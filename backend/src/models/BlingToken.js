import mongoose from 'mongoose';

// Um único registro: a conexão do laboratório com a conta Bling.
const schema = new mongoose.Schema({
  chave: { type: String, default: 'principal', unique: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiraEm: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model('BlingToken', schema);
