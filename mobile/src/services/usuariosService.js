import api from './api';

// Solo admin: la API responde 403 a cualquier otro rol.
export const listUsuarios = async () => {
  const { data } = await api.get('/usuarios');
  return data;
};

export const cambiarRol = async (id, rol) => {
  const { data } = await api.patch(`/usuarios/${id}`, { usuario: { rol } });
  return data;
};
