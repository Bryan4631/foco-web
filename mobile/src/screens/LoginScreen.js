import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Banner, Button, FormField } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { parseApiError } from '../utils/errors';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validación mínima del formulario (la validación real vive en la API)
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Ingresa tu correo';
    if (!password) newErrors.password = 'Ingresa tu contraseña';
    setErrors(newErrors);
    setApiError('');
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      // Si sale bien, AuthContext guarda el usuario y la navegación cambia sola.
    } catch (error) {
      const info = parseApiError(error);
      // 401 en login = credenciales incorrectas
      setApiError(info.type === 'unauthorized' ? 'Correo o contraseña incorrectos' : info.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Foco</Text>
          <Text style={styles.subtitle}>Organiza tus estudios y tu emprendimiento</Text>

          <Banner kind="error" text={apiError} />

          <FormField
            label="Correo"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="tu@correo.cl"
          />
          <FormField
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            placeholder="••••••••"
          />

          <Button title="Iniciar sesión" onPress={handleSubmit} loading={submitting} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, justifyContent: 'center', flexGrow: 1 },
  title: { fontSize: 36, fontWeight: '800', color: colors.primary },
  subtitle: { color: colors.muted, marginBottom: 28 },
});
