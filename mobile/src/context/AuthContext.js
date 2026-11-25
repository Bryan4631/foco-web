import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setUnauthorizedHandler } from '../services/api';
import { fetchMe, login as loginRequest, logoutRequest } from '../services/authService';
import { clearToken, getToken, saveToken } from '../storage/tokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true mientras revisamos si hay sesión guardada

  // Cierra la sesión solo en el dispositivo (sin llamar a la API).
  const clearSession = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  // Cuando la API responde 401, el interceptor de api.js llama a esto
  // y la navegación vuelve al login (porque user pasa a null).
  useEffect(() => {
    setUnauthorizedHandler(clearSession);
  }, [clearSession]);

  // Al abrir la app: si hay token guardado, lo validamos pidiendo /me (también trae el rol).
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await getToken();
        if (token) setUser(await fetchMe());
      } catch {
        // Token vencido/inválido, o sin conexión: se parte en el login.
        await clearToken();
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: loggedUser } = await loginRequest(email, password);
    await saveToken(token);
    setUser(loggedUser);
  }, []);

  // Orden correcto: primero se avisa a la API (con el token todavía guardado) y
  // recién después se borra el token local. Si la API falla, igual se cierra la sesión local.
  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // sin conexión o token ya vencido: no importa, seguimos cerrando
    } finally {
      await clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, loading, login, logout, isAdmin: user?.rol === 'admin' }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
