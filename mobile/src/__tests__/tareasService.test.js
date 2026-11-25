import api from '../services/api';
import { createTarea, deleteTarea, listTareas, updateTarea } from '../services/tareasService';

// Se reemplaza el cliente HTTP por un mock: así se prueba el servicio sin red ni backend.
jest.mock('../services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

describe('tareasService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('createTarea envía los datos dentro de la clave "tarea" (strong params de Rails)', async () => {
    api.post.mockResolvedValue({ data: { id: 1, titulo: 'Estudiar' } });

    const result = await createTarea({ titulo: 'Estudiar', area_id: 3 });

    expect(api.post).toHaveBeenCalledWith('/tareas', { tarea: { titulo: 'Estudiar', area_id: 3 } });
    expect(result).toEqual({ id: 1, titulo: 'Estudiar' });
  });

  test('updateTarea usa PATCH sobre /tareas/:id', async () => {
    api.patch.mockResolvedValue({ data: { id: 7, estado: 'hecha' } });

    await updateTarea(7, { estado: 'hecha' });

    expect(api.patch).toHaveBeenCalledWith('/tareas/7', { tarea: { estado: 'hecha' } });
  });

  test('listTareas solo manda todos=true cuando se pide (vista de admin)', async () => {
    api.get.mockResolvedValue({ data: [] });

    await listTareas();
    expect(api.get).toHaveBeenLastCalledWith('/tareas', { params: {} });

    await listTareas({ todos: true });
    expect(api.get).toHaveBeenLastCalledWith('/tareas', { params: { todos: true } });
  });

  test('deleteTarea usa DELETE sobre /tareas/:id', async () => {
    api.delete.mockResolvedValue({});
    await deleteTarea(5);
    expect(api.delete).toHaveBeenCalledWith('/tareas/5');
  });
});
