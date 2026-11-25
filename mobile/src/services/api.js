import axios from 'axios';
import { API_URL } from '../config';
import { getToken } from '../storage/tokenStorage';

// Cliente HTTP único: todas las llamadas a la API Rails pasan por aquí.
const api = axios.create({
  baseURL: API_URL,
  timeout: 20000, // margen para redes móviles lentas
  headers: { 'Content-Type': 'application/json' },
});

// 1) Adjunta el token en cada petición: Authorization: Bearer <jwt>
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2) Si la API responde 401 (token vencido, revocado o inválido), avisamos a AuthContext
//    para que cierre la sesión local; la navegación vuelve sola al login.
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    // En el login un 401 significa "credenciales incorrectas", no "sesión vencida".
    if (error.response?.status === 401 && !isLoginRequest) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;
