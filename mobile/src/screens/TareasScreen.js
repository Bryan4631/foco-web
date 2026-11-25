import { useCallback, useLayoutEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button, ErrorView, LoadingView } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { listTareas } from '../services/tareasService';
import { colors, prioridadColor } from '../theme';
import { parseApiError } from '../utils/errors';

export default function TareasScreen({ navigation }) {
  const { isAdmin } = useAuth();
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [verTodas, setVerTodas] = useState(false); // solo se muestra al admin

  const cargar = useCallback(
    async (esRefresco = false) => {
      esRefresco ? setRefreshing(true) : setLoading(true);
      setError(null);
      try {
        setTareas(await listTareas({ todos: isAdmin && verTodas }));
      } catch (e) {
        setError(parseApiError(e));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isAdmin, verTodas]
  );

  // Recarga cada vez que la pantalla vuelve a estar en foco (ej. después de crear o editar)
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  // Botones del encabezado: "Usuarios" solo existe para el rol admin
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          {isAdmin && (
            <Pressable onPress={() => navigation.navigate('Usuarios')} accessibilityLabel="Usuarios">
              <Text style={styles.headerLink}>Usuarios</Text>
            </Pressable>
          )}
          <Pressable onPress={() => navigation.navigate('Perfil')} accessibilityLabel="Perfil">
            <Text style={styles.headerLink}>Perfil</Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation, isAdmin]);

  if (loading) return <LoadingView text="Cargando tareas..." />;
  if (error) return <ErrorView message={error.message} onRetry={() => cargar()} />;

  return (
    <View style={styles.container}>
      {isAdmin && (
        <View style={styles.adminRow}>
          <Text style={styles.adminText}>Ver tareas de todos los usuarios</Text>
          <Switch value={verTodas} onValueChange={setVerTodas} />
        </View>
      )}

      <FlatList
        data={tareas}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} />}
        ListEmptyComponent={<Text style={styles.empty}>Aún no tienes tareas. Crea la primera.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('TareaDetalle', { id: item.id })}
            accessibilityRole="button"
            accessibilityLabel={`Tarea ${item.titulo}`}
          >
            <View style={[styles.dot, { backgroundColor: prioridadColor[item.prioridad] }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.titulo, item.estado === 'hecha' && styles.hecha]}>{item.titulo}</Text>
              <Text style={styles.meta}>
                {item.estado.replace('_', ' ')} · prioridad {item.prioridad}
                {item.fecha_limite ? ` · vence ${item.fecha_limite}` : ''}
              </Text>
            </View>
          </Pressable>
        )}
      />

      <View style={styles.footer}>
        <Button title="Nueva tarea" onPress={() => navigation.navigate('TareaForm', {})} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerButtons: { flexDirection: 'row', gap: 16 },
  headerLink: { color: colors.primary, fontWeight: '600' },
  adminRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 0 },
  adminText: { color: colors.text },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  dot: { width: 12, height: 12, borderRadius: 6 },
  titulo: { fontSize: 16, fontWeight: '600', color: colors.text },
  hecha: { textDecorationLine: 'line-through', color: colors.muted },
  meta: { color: colors.muted, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  footer: { padding: 16 },
});
