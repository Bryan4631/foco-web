import api from './api';

// Capa de servicios hacia la API: las pantallas no conocen URLs ni axios.
// La lógica de negocio y las validaciones viven en Rails; aquí solo se envían y reciben datos.

// todos=true: solo tiene efecto si el usuario es admin (la API lo ignora para los demás)
export const listTareas = async ({ todos = false } = {}) => {
  const { data } = await api.get('/tareas', { params: todos ? { todos: true } : {} });
  return data;
};

export const getTarea = async (id) => {
  const { data } = await api.get(`/tareas/${id}`);
  return data;
};

// Rails espera los datos dentro de la clave "tarea" (strong params)
export const createTarea = async (tarea) => {
  const { data } = await api.post('/tareas', { tarea });
  return data;
};

export const updateTarea = async (id, tarea) => {
  const { data } = await api.patch(`/tareas/${id}`, { tarea });
  return data;
};

export const deleteTarea = (id) => api.delete(`/tareas/${id}`);

export const listAreas = async () => {
  const { data } = await api.get('/areas');
  return data;
};
