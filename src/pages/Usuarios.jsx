import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// Página solo para administradores. Un usuario normal que entre por la URL
// recibe 403 de la API y ve un mensaje de acceso denegado (no un error técnico).
export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/usuarios');
        setUsuarios(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        } else if (err.response?.status === 403) {
          setError(err.userMessage);
        } else {
          setError('Error al cargar los usuarios.');
        }
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const cambiarRol = async (u) => {
    setError('');
    setMensaje('');
    const nuevoRol = u.rol === 'admin' ? 'usuario' : 'admin';
    try {
      const res = await api.patch(`/usuarios/${u.id}`, { usuario: { rol: nuevoRol } });
      setUsuarios(usuarios.map((x) => (x.id === u.id ? res.data : x)));
      setMensaje(`${res.data.nombre} ahora tiene el rol ${res.data.rol}.`);
    } catch (err) {
      if (err.response?.status === 403) {
        setError(err.userMessage);
      } else {
        setError(err.response?.data?.errors?.rol?.[0] || 'No se pudo cambiar el rol.');
      }
    }
  };

  if (loading) {
    return (
      <div className="state-box">
        <div className="spinner" />
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Usuarios</h1>
          <p>Administra los roles de quienes usan Foco.</p>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.nombre} {u.id === user?.id ? '(tú)' : ''}
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.rol === 'admin' ? 'badge-accent' : ''}`}>{u.rol}</span>
                </td>
                <td>
                  {/* No se ofrece cambiar el propio rol (la API también lo rechaza con 422) */}
                  {u.id !== user?.id && (
                    <button className="btn btn-ghost" onClick={() => cambiarRol(u)}>
                      {u.rol === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
