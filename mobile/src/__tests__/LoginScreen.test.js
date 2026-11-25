import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import LoginScreen from '../screens/LoginScreen';

// Se simula el contexto de autenticación: probamos solo el formulario de login.
const mockLogin = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

describe('LoginScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  test('con los campos vacíos muestra errores y no llama a la API', async () => {
    await render(<LoginScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByText('Ingresa tu correo')).toBeTruthy();
    expect(screen.getByText('Ingresa tu contraseña')).toBeTruthy();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('con datos válidos llama a login con el correo y la contraseña', async () => {
    mockLogin.mockResolvedValue();
    await render(<LoginScreen />);

    await fireEvent.changeText(screen.getByLabelText('Correo'), 'demo@foco.cl');
    await fireEvent.changeText(screen.getByLabelText('Contraseña'), 'demo12345');
    await fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('demo@foco.cl', 'demo12345'));
  });

  test('si la API responde 401 muestra "Correo o contraseña incorrectos"', async () => {
    mockLogin.mockRejectedValue({ response: { status: 401, data: { error: 'Correo o contraseña incorrectos' } } });
    await render(<LoginScreen />);

    await fireEvent.changeText(screen.getByLabelText('Correo'), 'demo@foco.cl');
    await fireEvent.changeText(screen.getByLabelText('Contraseña'), 'mala');
    await fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByText('Correo o contraseña incorrectos')).toBeTruthy();
  });

  test('si no hay conexión muestra un aviso claro, no un error técnico', async () => {
    mockLogin.mockRejectedValue(new Error('Network Error'));
    await render(<LoginScreen />);

    await fireEvent.changeText(screen.getByLabelText('Correo'), 'demo@foco.cl');
    await fireEvent.changeText(screen.getByLabelText('Contraseña'), 'demo12345');
    await fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByText(/No hay conexión con el servidor/)).toBeTruthy();
  });
});
