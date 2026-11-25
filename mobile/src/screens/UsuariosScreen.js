import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Banner, Button, ErrorView, LoadingView } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { cambiarRol, listUsuarios } from '../services/usuariosService';
import { colors } from '../theme';
import { parseApiError } from '../utils/errors';

// Pantalla solo para administradores. Aunque alguien lograra abrirla, la API respondería 403.
export default function UsuariosScreen() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState({ text: '', kind: 'success' });
  const [cambiandoId, setCambiandoId] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsuarios(await listUsuarios());
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const alternarRol = async (u) => {
    const nuevoRol = u.rol === 'admin' ? 'usuario' : 'admin';
    setCambiandoId(u.id);
    setMensaje({ text: '', kind: 'success' });
    try {
      const actualizado = await cambiarRol(u.id, nuevoRol);
      setUsuarios((prev) => prev.map((x) => (x.id === actualizado.id ? actualizado : x)));
      setMensaje({ text: `${actualizado.nombre} ahora es ${actualizado.rol}`, kind: 'success' });
    } catch (e) {
      const info = parseApiError(e);
      // 422: p. ej. "no puedes quitarte tu propio rol de administrador"
      const detalle = info.fieldErrors.rol || info.message;
      setMensaje({ text: detalle, kind: 'error' });
    } finally {
      setCambiandoId(null);
    }
  };

  if (loading) return <LoadingView text="Cargando usuarios..." />;
  if (error) return <ErrorView message={error.message} onRetry={cargar} />;

  return (
    <View style={styles.container}>
      <Banner text={mensaje.text} kind={mensaje.kind} />
      <FlatList
        data={usuarios}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nombre}>
                {item.nombre} {item.id === user.id ? '(tú)' : ''}
              </Text>
              <Text style={styles.meta}>
                {item.email} · {item.rol}
              </Text>
            </View>
            {item.id !== user.id && (
              <Button
                title={item.rol === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                variant="secondary"
                onPress={() => alternarRol(item)}
                loading={cambiandoId === item.id}
              />
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  nombre: { fontWeight: '700', color: colors.text },
  meta: { color: colors.muted },
});
