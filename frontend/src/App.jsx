import { createContext, useContext, useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { api } from './api.js';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Certificados from './pages/Certificados.jsx';
import Admin from './pages/Admin.jsx';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

function Protegida({ children, admin }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api('/auth/me').then(setUser).catch(() => setUser(null)).finally(() => setCarregando(false));
  }, []);

  const sair = async () => { await api('/auth/logout', { method: 'POST' }); setUser(null); };

  if (carregando) return <p className="centro">Carregando…</p>;

  return (
    <AuthCtx.Provider value={{ user, setUser }}>
      {user && (
        <header className="topo">
          <strong>Portal de Certificados</strong>
          <nav>
            <Link to="/">Certificados</Link>
            {user.role === 'admin' && <Link to="/admin">Laboratório</Link>}
          </nav>
          <span className="usuario">
            {user.nome}{user.empresa ? ` · ${user.empresa.razaoSocial}` : ''}
            <button className="link" onClick={sair}>Sair</button>
          </span>
        </header>
      )}
      <main>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/cadastro" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/" element={<Protegida><Certificados /></Protegida>} />
          <Route path="/admin" element={<Protegida admin><Admin /></Protegida>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </AuthCtx.Provider>
  );
}
