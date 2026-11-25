import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Al recargar la página, verifica si hay un token guardado
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
      // Tarea 2: se consulta /me para conocer el rol (la interfaz muestra u oculta opciones según el rol)
      api
        .get('/me')
        .then((res) => setUser({ token, ...res.data.user }))
        .catch((err) => {
          // Token vencido o revocado: se cierra la sesión local
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            setUser(null);
          }
        });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user: apiUser } = response.data;
    localStorage.setItem('token', token);
    setUser({ token, ...apiUser });
    return response;
  };

  // Crea la cuenta y deja la sesión iniciada (la API devuelve el token)
  const register = async (nombre, email, password) => {
    const response = await api.post('/auth/register', { nombre, email, password });
    const { token, user: apiUser } = response.data;
    localStorage.setItem('token', token);
    setUser({ token, ...apiUser });
    return response;
  };

  // Cierra la sesión en el cliente y revoca el token en la API (DELETE /auth/logout)
  const logout = () => {
    const token = localStorage.getItem('token');
    localStorage.removeItem('token');
    setUser(null);
    if (token) {
      // Se envía el token a mano porque ya lo borramos de localStorage.
      // Si falla (token vencido, sin conexión), la sesión local ya está cerrada.
      api
        .delete('/auth/logout', { headers: { Authorization: `Bearer ${token}` } })
        .catch(() => {});
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, isAdmin: user?.rol === 'admin' }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);