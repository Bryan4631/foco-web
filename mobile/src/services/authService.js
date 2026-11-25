import api from './api';

// POST /auth/login -> { token, expires_at, user: { id, nombre, email, rol } }
export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

// GET /me -> { user }
export const fetchMe = async () => {
  const { data } = await api.get('/me');
  return data.user;
};

// DELETE /auth/logout: la API revoca el jti del token
export const logoutRequest = () => api.delete('/auth/logout');
