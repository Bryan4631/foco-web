import axios from 'axios';

const api = axios.create({
  // La URL de la API se configura con VITE_API_URL (ver .env.example).
  // Si no existe, usa la API de producción (apifoco.frubilarz.cl).
  baseURL: import.meta.env.VITE_API_URL || 'https://apifoco.frubilarz.cl/api/v1',
});

// Este interceptor adjunta el token automáticamente en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tarea 2: si la API responde 403 (sin permiso) se deja un mensaje claro en el error,
// para que las pantallas muestren "acceso denegado" y no un error técnico.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      error.userMessage = 'Acceso denegado: no tienes permiso para realizar esta acción.';
    }
    return Promise.reject(error);
  }
);

export default api;