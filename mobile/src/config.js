// La URL de la API viene de la variable de entorno EXPO_PUBLIC_API_URL (archivo .env).
// No se escribe en el código a propósito: así el mismo build apunta a local o a producción.
export const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  // Aviso claro en desarrollo si se olvidó crear el .env
  console.warn('Falta EXPO_PUBLIC_API_URL. Copia .env.example como .env y reinicia Expo.');
}
