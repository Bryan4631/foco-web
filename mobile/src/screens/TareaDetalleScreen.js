import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Banner, Button, ErrorView, LoadingView } from '../components/ui';
import { deleteTarea, getTarea, updateTarea } from '../services/tareasService';
import { colors } from '../theme';
import { parseApiError } from '../utils/errors';

export default function TareaDetalleScreen({ route, navigation }) {
  const { id } = route.params;
  const [tarea, setTarea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState('');
  const [working, setWorking] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTarea(await getTarea(id));
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  // Característica móvil: marcar la tarea como hecha con un solo toque.
  // (En la web de la Tarea 1 no se podía; la lógica sigue en la API, aquí solo se envía el estado.)
  const alternarHecha = async () => {
    setWorking(true);
    setActionError('');
    try {
      const nuevoEstado = tarea.estado === 'hecha' ? 'pendiente' : 'hecha';
      setTarea(await updateTarea(tarea.id, { estado: nuevoEstado }));
    } catch (e) {
      setActionError(parseApiError(e).message);
    } finally {
      setWorking(false);
    }
  };

  const eliminar = () => {
    Alert.alert('Eliminar tarea', '¿Seguro que quieres eliminar esta tarea?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setWorking(true);
          try {
            await deleteTarea(tarea.id);
            navigation.goBack(); // el listado se recarga al volver
          } catch (e) {
            const info = parseApiError(e);
            setActionError(info.message);
            // 404: ya no existe -> volvemos a una pantalla válida
            if (info.type === 'notFound') navigation.goBack();
          } finally {
            setWorking(false);
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingView text="Cargando tarea..." />;
  if (error) {
    // 404: mensaje y regreso a una pantalla válida; el resto: opción de reintentar
    return (
      <ErrorView
        message={error.message}
        onRetry={error.type === 'notFound' ? () => navigation.goBack() : cargar}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={{ backgroundColor: colors.bg }}>
      <Banner kind="error" text={actionError} />

      <Text style={styles.titulo}>{tarea.titulo}</Text>
      <Row label="Estado" value={tarea.estado.replace('_', ' ')} />
      <Row label="Prioridad" value={tarea.prioridad} />
      <Row label="Fecha límite" value={tarea.fecha_limite || 'Sin fecha'} />
      <Row label="Tiempo estimado" value={tarea.estimado_minutos ? `${tarea.estimado_minutos} min` : 'Sin estimar'} />
      <Row label="Descripción" value={tarea.descripcion || 'Sin descripción'} />

      <View style={styles.actions}>
        <Button
          title={tarea.estado === 'hecha' ? 'Marcar como pendiente' : 'Marcar como hecha'}
          onPress={alternarHecha}
          loading={working}
        />
        <Button title="Editar" variant="secondary" onPress={() => navigation.navigate('TareaForm', { id: tarea.id })} />
        <Button title="Eliminar" variant="danger" onPress={eliminar} disabled={working} />
      </View>
    </ScrollView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 10 },
  titulo: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 8 },
  row: { backgroundColor: colors.card, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.muted, fontSize: 12, textTransform: 'uppercase' },
  value: { color: colors.text, fontSize: 16, marginTop: 2 },
  actions: { gap: 10, marginTop: 12 },
});
