import axios from 'axios';

const api = axios.create({
  // La URL de la API se configura con VITE_API_URL (ver .env.example).
  // Si no existe, usa la API de producción en Render.
  baseURL: import.meta.env.VITE_API_URL || 'https://foco-api-rk4y.onrender.com/api/v1',
});

// Este interceptor adjunta el token automáticamente en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;