import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import empresaRoutes from './routes/empresas.js';
import usuarioRoutes from './routes/usuarios.js';
import certificadoRoutes from './routes/certificados.js';

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/certificados', certificadoRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ erro: err.message || 'Erro interno' });
});

export default app;
