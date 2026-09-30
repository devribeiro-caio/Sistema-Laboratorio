import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../App.jsx';

export default function Login() {
  const { setUser } = useAuth();
  const [f, setF] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    try {
      await api('/auth/login', { method: 'POST', body: f });
      setUser(await api('/auth/me'));
    } catch (err) { setErro(err.message); }
  }

  return (
    <form className="cartao auth" onSubmit={enviar}>
      <h1>Entrar</h1>
      <p className="muted">Acesse os certificados emitidos para a sua empresa.</p>
      {erro && <p className="erro" role="alert">{erro}</p>}
      <label>E-mail<input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
      <label>Senha<input type="password" required value={f.senha} onChange={(e) => setF({ ...f, senha: e.target.value })} /></label>
      <button>Entrar</button>
      <p className="muted">Primeiro acesso? <Link to="/cadastro">Criar conta</Link></p>
    </form>
  );
}
