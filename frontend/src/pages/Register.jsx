import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Register() {
  const [f, setF] = useState({ nome: '', email: '', cnpj: '', senha: '' });
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    try {
      const r = await api('/auth/register', { method: 'POST', body: f });
      setOk(r.mensagem);
    } catch (err) { setErro(err.message); }
  }

  if (ok) return (
    <div className="cartao auth">
      <h1>Cadastro enviado</h1>
      <p>{ok}</p>
      <Link to="/login">Voltar para o login</Link>
    </div>
  );

  return (
    <form className="cartao auth" onSubmit={enviar}>
      <h1>Criar conta</h1>
      <p className="muted">Use o CNPJ da empresa cadastrada no laboratório. Seu acesso será liberado após aprovação.</p>
      {erro && <p className="erro" role="alert">{erro}</p>}
      <label>Seu nome<input required value={f.nome} onChange={set('nome')} /></label>
      <label>E-mail<input type="email" required value={f.email} onChange={set('email')} /></label>
      <label>CNPJ da empresa<input required inputMode="numeric" placeholder="00.000.000/0000-00" value={f.cnpj} onChange={set('cnpj')} /></label>
      <label>Senha (mínimo 8 caracteres)<input type="password" minLength={8} required value={f.senha} onChange={set('senha')} /></label>
      <button>Solicitar acesso</button>
      <p className="muted">Já tem conta? <Link to="/login">Entrar</Link></p>
    </form>
  );
}
