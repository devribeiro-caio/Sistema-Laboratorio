import { useEffect, useState } from 'react';
import { api, formatarCnpj } from '../api.js';

function Aviso({ msg }) {
  if (!msg) return null;
  return <p className={msg.tipo === 'erro' ? 'erro' : 'ok'} role="alert">{msg.txt}</p>;
}

function Usuarios() {
  const [lista, setLista] = useState([]);
  const carregar = () => api('/usuarios?status=pendente').then(setLista);
  useEffect(() => { carregar(); }, []);
  const agir = async (id, acao) => { await api(`/usuarios/${id}/${acao}`, { method: 'PATCH' }); carregar(); };

  return (
    <div className="cartao">
      <h2>Acessos aguardando aprovação</h2>
      {lista.length === 0 ? <p className="muted">Nenhuma solicitação pendente.</p> : (
        <ul className="itens">
          {lista.map((u) => (
            <li key={u._id}>
              <div><strong>{u.nome}</strong> · {u.email}<br />
                <small className="muted">{u.empresa?.razaoSocial} — {formatarCnpj(u.empresa?.cnpj)}</small></div>
              <div className="acoes">
                <button onClick={() => agir(u._id, 'aprovar')}>Aprovar</button>
                <button className="sec" onClick={() => agir(u._id, 'bloquear')}>Recusar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Empresas({ empresas, recarregar }) {
  const vazio = { cnpj: '', razaoSocial: '', nomeFantasia: '', email: '', telefone: '' };
  const [f, setF] = useState(vazio);
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function salvar(e) {
    e.preventDefault();
    try {
      await api('/empresas', { method: 'POST', body: f });
      setMsg({ tipo: 'ok', txt: 'Empresa cadastrada.' }); setF(vazio); recarregar();
    } catch (err) { setMsg({ tipo: 'erro', txt: err.message }); }
  }

  return (
    <div className="cartao">
      <h2>Cadastrar empresa</h2>
      <form onSubmit={salvar} className="grade">
        <label>CNPJ<input required value={f.cnpj} onChange={set('cnpj')} placeholder="00.000.000/0000-00" /></label>
        <label>Razão social<input required value={f.razaoSocial} onChange={set('razaoSocial')} /></label>
        <label>Nome fantasia<input value={f.nomeFantasia} onChange={set('nomeFantasia')} /></label>
        <label>E-mail<input type="email" value={f.email} onChange={set('email')} /></label>
        <label>Telefone<input value={f.telefone} onChange={set('telefone')} /></label>
        <div className="rodape"><button>Salvar empresa</button></div>
      </form>
      <Aviso msg={msg} />
      <h3>Empresas cadastradas ({empresas.length})</h3>
      <ul className="itens">
        {empresas.map((e) => (
          <li key={e._id}><div><strong>{e.razaoSocial}</strong><br /><small className="muted">{formatarCnpj(e.cnpj)}</small></div></li>
        ))}
      </ul>
    </div>
  );
}

function EmitirCertificado({ empresas }) {
  const [f, setF] = useState({ numero: '', empresa: '', tipo: '', descricao: '', dataEmissao: '', dataValidade: '' });
  const [arquivo, setArquivo] = useState(null);
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    fd.append('arquivo', arquivo);
    try {
      await api('/certificados', { method: 'POST', body: fd });
      setMsg({ tipo: 'ok', txt: 'Certificado emitido e disponível para o cliente.' });
      setF({ numero: '', empresa: '', tipo: '', descricao: '', dataEmissao: '', dataValidade: '' });
      setArquivo(null); e.target.reset();
    } catch (err) { setMsg({ tipo: 'erro', txt: err.message }); }
  }

  return (
    <div className="cartao">
      <h2>Emitir certificado</h2>
      <form onSubmit={enviar} className="grade">
        <label>Número<input required value={f.numero} onChange={set('numero')} /></label>
        <label>Empresa
          <select required value={f.empresa} onChange={set('empresa')}>
            <option value="">Selecione…</option>
            {empresas.map((e) => <option key={e._id} value={e._id}>{e.razaoSocial}</option>)}
          </select>
        </label>
        <label>Tipo<input required value={f.tipo} onChange={set('tipo')} placeholder="Ex.: Calibração" /></label>
        <label>Descrição<input value={f.descricao} onChange={set('descricao')} /></label>
        <label>Data de emissão<input type="date" required value={f.dataEmissao} onChange={set('dataEmissao')} /></label>
        <label>Validade<input type="date" value={f.dataValidade} onChange={set('dataValidade')} /></label>
        <label className="larga">Arquivo PDF (até 10 MB)
          <input type="file" accept="application/pdf" required onChange={(e) => setArquivo(e.target.files[0])} />
        </label>
        <div className="rodape"><button>Emitir certificado</button></div>
      </form>
      <Aviso msg={msg} />
    </div>
  );
}

export default function Admin() {
  const [empresas, setEmpresas] = useState([]);
  const [aba, setAba] = useState('usuarios');
  const recarregar = () => api('/empresas').then(setEmpresas);
  useEffect(() => { recarregar(); }, []);

  const abas = [['usuarios', 'Aprovações'], ['empresas', 'Empresas'], ['emitir', 'Emitir certificado']];
  return (
    <section>
      <h1>Laboratório</h1>
      <div className="abas" role="tablist">
        {abas.map(([id, nome]) => (
          <button key={id} role="tab" aria-selected={aba === id} className={aba === id ? 'ativa' : ''} onClick={() => setAba(id)}>{nome}</button>
        ))}
      </div>
      {aba === 'usuarios' && <Usuarios />}
      {aba === 'empresas' && <Empresas empresas={empresas} recarregar={recarregar} />}
      {aba === 'emitir' && <EmitirCertificado empresas={empresas} />}
    </section>
  );
}
