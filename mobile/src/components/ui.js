import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';

// Estado de carga visible (requisito: "indicador de carga visible")
export function LoadingView({ text = 'Cargando...' }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.muted}>{text}</Text>
    </View>
  );
}

// Aviso de error con opción de reintentar (sin conexión / servidor caído / 403 / 404)
export function ErrorView({ message, onRetry }) {
  return (
    <View style={styles.center}>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && <Button title="Reintentar" onPress={onRetry} />}
    </View>
  );
}

export function Button({ title, onPress, variant = 'primary', disabled = false, loading = false }) {
  const background = variant === 'danger' ? colors.danger : variant === 'secondary' ? colors.card : colors.primary;
  const textColor = variant === 'secondary' ? colors.primary : '#fff';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, opacity: disabled || loading ? 0.6 : pressed ? 0.85 : 1 },
        variant === 'secondary' && { borderWidth: 1, borderColor: colors.primary },
      ]}
    >
      {loading ? <ActivityIndicator color={textColor} /> : <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>}
    </Pressable>
  );
}

// Campo de formulario con su mensaje de error JUNTO al input (errores 422)
export function FormField({ label, error, ...inputProps }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[styles.input, error && { borderColor: colors.danger }]}
        {...inputProps}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

// Mensaje de éxito / información (confirmación de operaciones)
export function Banner({ text, kind = 'success' }) {
  if (!text) return null;
  const background = kind === 'success' ? '#dcfce7' : '#fee2e2';
  const color = kind === 'success' ? '#166534' : '#991b1b';
  return (
    <View style={[styles.banner, { backgroundColor: background }]}>
      <Text style={{ color }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  muted: { color: colors.muted },
  errorText: { color: colors.danger, textAlign: 'center', fontSize: 16 },
  button: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10, alignItems: 'center', justifyContent: 'center', minHeight: 46 },
  buttonText: { fontWeight: '600', fontSize: 16 },
  field: { marginBottom: 14 },
  label: { fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, backgroundColor: colors.card, color: colors.text },
  fieldError: { color: colors.danger, marginTop: 4 },
  banner: { padding: 12, borderRadius: 10, marginBottom: 12 },
});
