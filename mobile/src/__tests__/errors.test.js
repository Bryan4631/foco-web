import { parseApiError } from '../utils/errors';

// Helper: simula el error que lanza axios cuando la API responde con un status
const apiError = (status, data = {}) => ({ response: { status, data } });

describe('parseApiError', () => {
  test('sin respuesta del servidor => error de red (sin conexión)', () => {
    const info = parseApiError({ message: 'Network Error' });
    expect(info.type).toBe('network');
    expect(info.message).toMatch(/conexión/i);
  });

  test('401 => sesión no autorizada', () => {
    expect(parseApiError(apiError(401)).type).toBe('unauthorized');
  });

  test('403 => mensaje claro de acceso denegado, no un error técnico', () => {
    const info = parseApiError(apiError(403, { error: 'No tienes permiso para realizar esta acción' }));
    expect(info.type).toBe('forbidden');
    expect(info.message).toMatch(/acceso denegado/i);
  });

  test('404 => recurso inexistente', () => {
    expect(parseApiError(apiError(404)).type).toBe('notFound');
  });

  test('422 => deja el primer mensaje de cada campo para mostrarlo junto al input', () => {
    const info = parseApiError(apiError(422, { errors: { titulo: ['no puede estar en blanco', 'es muy corto'] } }));
    expect(info.type).toBe('validation');
    expect(info.fieldErrors).toEqual({ titulo: 'no puede estar en blanco' });
  });

  test('500 => mensaje genérico, sin filtrar trazas del servidor', () => {
    const info = parseApiError(apiError(500, { error: 'PG::ConnectionBad stack trace...' }));
    expect(info.type).toBe('server');
    expect(info.message).not.toMatch(/PG::/);
  });
});
