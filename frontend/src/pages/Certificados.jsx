import { useEffect, useState } from 'react';
import { api, formatarCnpj, formatarData } from '../api.js';
import { useAuth } from '../App.jsx';

function situacao(validade) {
  if (!validade) return { txt: 'Sem validade', cls: 'neutro' };
  const dias = Math.ceil((new Date(validade) - new Date()) / 86400000);
  if (dias < 0) return { txt: 'Vencido', cls: 'vencido' };
  if (dias <= 30) return { txt: `Vence em ${dias} dia${dias === 1 ? '' : 's'}`, cls: 'atencao' };
  return { txt: 'Válido', cls: 'valido' };
}

export default function Certificados() {
  const { user } = useAuth();
  const [lista, setLista] = useState(null);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');
  const admin = user.role === 'admin';

  useEffect(() => { api('/certificados').then(setLista).catch((e) => setErro(e.message)); }, []);

  const q = busca.toLowerCase();
  const filtrada = (lista || []).filter((c) =>
    [c.numero, c.tipo, c.empresa?.razaoSocial].some((v) => (v || '').toLowerCase().includes(q)));

  return (
    <section>
      <div className="linha">
        <h1>{admin ? 'Todos os certificados' : 'Seus certificados'}</h1>
        <input className="busca" type="search" placeholder="Buscar por número, tipo ou empresa" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>
      {erro && <p className="erro">{erro}</p>}
      {lista && filtrada.length === 0 && (
        <p className="muted">{lista.length === 0 ? 'Nenhum certificado emitido ainda. Quando o laboratório emitir, ele aparecerá aqui.' : 'Nenhum resultado para esta busca.'}</p>
      )}
      {filtrada.length > 0 && (
        <div className="tabela-wrap">
          <table>
            <thead><tr>
              <th>Número</th>{admin && <th>Empresa</th>}<th>Tipo</th><th>Emissão</th><th>Validade</th><th>Situação</th><th></th>
            </tr></thead>
            <tbody>
              {filtrada.map((c) => {
                const s = situacao(c.dataValidade);
                return (
                  <tr key={c._id}>
                    <td>{c.numero}</td>
                    {admin && <td>{c.empresa?.razaoSocial}<br /><small className="muted">{formatarCnpj(c.empresa?.cnpj)}</small></td>}
                    <td>{c.tipo}</td>
                    <td>{formatarData(c.dataEmissao)}</td>
                    <td>{formatarData(c.dataValidade)}</td>
                    <td><span className={`selo ${s.cls}`}>{s.txt}</span></td>
                    <td><a className="botao-sec" href={`/api/certificados/${c._id}/download`}>Baixar PDF</a></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
