import 'dotenv/config';
import mongoose from 'mongoose';
import app from './src/app.js';

await mongoose.connect(process.env.MONGO_URI);
app.listen(process.env.PORT || 3000, () => console.log('API rodando na porta', process.env.PORT || 3000));
