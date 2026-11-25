import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoadingView } from './src/components/ui';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import TareaDetalleScreen from './src/screens/TareaDetalleScreen';
import TareaFormScreen from './src/screens/TareaFormScreen';
import TareasScreen from './src/screens/TareasScreen';
import UsuariosScreen from './src/screens/UsuariosScreen';

const Stack = createNativeStackNavigator();

function Navigation() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <LoadingView text="Iniciando..." />;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // Con sesión: pantallas de la app. Si la API responde 401, user pasa a null
          // y React Navigation vuelve solo a la pantalla de Login.
          <>
            <Stack.Screen name="Tareas" component={TareasScreen} options={{ title: 'Mis tareas' }} />
            <Stack.Screen name="TareaDetalle" component={TareaDetalleScreen} options={{ title: 'Detalle' }} />
            <Stack.Screen name="TareaForm" component={TareaFormScreen} />
            <Stack.Screen name="Perfil" component={PerfilScreen} />
            {/* La pantalla de usuarios solo existe en la navegación del admin */}
            {isAdmin && <Stack.Screen name="Usuarios" component={UsuariosScreen} />}
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Navigation />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
