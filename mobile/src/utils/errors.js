// Convierte cualquier error de axios en algo que la pantalla pueda mostrar.
// Regla de la Tarea 2: NUNCA mostrar trazas ni JSON crudo al usuario.
//
// Devuelve { type, message, fieldErrors }
//   type: 'network' | 'unauthorized' | 'forbidden' | 'notFound' | 'validation' | 'server'
//   fieldErrors: { campo: 'mensaje' } solo para 422 (se muestra junto a cada input)
export function parseApiError(error) {
  // Sin respuesta = sin conexión o servidor caído
  if (!error?.response) {
    return {
      type: 'network',
      message: 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.',
      fieldErrors: {},
    };
  }

  const { status, data } = error.response;

  switch (status) {
    case 401:
      return {
        type: 'unauthorized',
        message: data?.error || 'Tu sesión expiró. Inicia sesión nuevamente.',
        fieldErrors: {},
      };
    case 403:
      return {
        type: 'forbidden',
        message: 'Acceso denegado: no tienes permiso para realizar esta acción.',
        fieldErrors: {},
      };
    case 404:
      return {
        type: 'notFound',
        message: 'No encontramos lo que buscabas. Puede que ya no exista.',
        fieldErrors: {},
      };
    case 422:
      return {
        type: 'validation',
        message: 'Revisa los campos marcados.',
        fieldErrors: flattenFieldErrors(data?.errors),
      };
    default:
      return {
        type: 'server',
        message: 'Ocurrió un problema en el servidor. Inténtalo más tarde.',
        fieldErrors: {},
      };
  }
}

// La API responde { errors: { titulo: ["no puede estar en blanco"] } }.
// Nos quedamos con el primer mensaje de cada campo.
function flattenFieldErrors(errors) {
  if (!errors || typeof errors !== 'object') return {};
  const result = {};
  Object.entries(errors).forEach(([field, messages]) => {
    result[field] = Array.isArray(messages) ? messages[0] : String(messages);
  });
  return result;
}
