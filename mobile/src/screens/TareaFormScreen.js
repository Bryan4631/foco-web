import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Banner, Button, ErrorView, FormField, LoadingView } from '../components/ui';
import { createTarea, getTarea, listAreas, updateTarea } from '../services/tareasService';
import { colors } from '../theme';
import { parseApiError } from '../utils/errors';

const PRIORIDADES = ['baja', 'media', 'alta'];

// Sirve para crear (sin params.id) y para editar (con params.id)
export default function TareaFormScreen({ route, navigation }) {
  const id = route.params?.id;
  const editando = Boolean(id);

  const [areas, setAreas] = useState([]);
  const [form, setForm] = useState({ titulo: '', descripcion: '', fecha_limite: '', prioridad: 'media', estimado_minutos: '', area_id: null });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);

  const setCampo = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  // Carga las áreas (para elegir) y, si se edita, la tarea actual
  const cargar = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const listaAreas = await listAreas();
      setAreas(listaAreas);
      if (editando) {
        const t = await getTarea(id);
        setForm({
          titulo: t.titulo,
          descripcion: t.descripcion || '',
          fecha_limite: t.fecha_limite || '',
          prioridad: t.prioridad,
          estimado_minutos: t.estimado_minutos ? String(t.estimado_minutos) : '',
          area_id: t.area_id,
        });
      } else if (listaAreas.length > 0) {
        setCampo('area_id', listaAreas[0].id);
      }
    } catch (e) {
      setLoadError(parseApiError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({ title: editando ? 'Editar tarea' : 'Nueva tarea' });
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const guardar = async () => {
    setSaving(true);
    setFieldErrors({});
    setApiError('');

    // Se envían los datos tal cual; las validaciones las hace la API (no se duplican aquí)
    const payload = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      fecha_limite: form.fecha_limite || null,
      prioridad: form.prioridad,
      estimado_minutos: form.estimado_minutos ? Number(form.estimado_minutos) : null,
      area_id: form.area_id,
    };

    try {
      if (editando) {
        await updateTarea(id, payload);
      } else {
        await createTarea(payload);
      }
      navigation.goBack(); // el listado se recarga solo al recuperar el foco
    } catch (e) {
      const info = parseApiError(e);
      setFieldErrors(info.fieldErrors); // 422: mensaje junto a cada campo
      setApiError(info.type === 'validation' ? '' : info.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingView />;
  if (loadError) return <ErrorView message={loadError.message} onRetry={cargar} />;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} style={{ backgroundColor: colors.bg }} keyboardShouldPersistTaps="handled">
        <Banner kind="error" text={apiError} />

        <FormField label="Título" value={form.titulo} onChangeText={(v) => setCampo('titulo', v)} error={fieldErrors.titulo} placeholder="Ej: Estudiar para la prueba" />
        <FormField label="Descripción" value={form.descripcion} onChangeText={(v) => setCampo('descripcion', v)} error={fieldErrors.descripcion} multiline />
        <FormField label="Fecha límite (AAAA-MM-DD)" value={form.fecha_limite} onChangeText={(v) => setCampo('fecha_limite', v)} error={fieldErrors.fecha_limite} placeholder="2026-12-01" />
        <FormField label="Tiempo estimado (minutos)" value={form.estimado_minutos} onChangeText={(v) => setCampo('estimado_minutos', v)} error={fieldErrors.estimado_minutos} keyboardType="numeric" />

        <Text style={styles.label}>Prioridad</Text>
        <View style={styles.chips}>
          {PRIORIDADES.map((p) => (
            <Chip key={p} text={p} active={form.prioridad === p} onPress={() => setCampo('prioridad', p)} />
          ))}
        </View>

        <Text style={styles.label}>Área</Text>
        <View style={styles.chips}>
          {areas.map((a) => (
            <Chip key={a.id} text={a.nombre} active={form.area_id === a.id} onPress={() => setCampo('area_id', a.id)} />
          ))}
        </View>
        {fieldErrors.area ? <Text style={styles.error}>{fieldErrors.area}</Text> : null}

        <Button title={editando ? 'Guardar cambios' : 'Crear tarea'} onPress={guardar} loading={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Chip({ text, active, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }} style={[styles.chip, active && styles.chipActive]}>
      <Text style={{ color: active ? '#fff' : colors.text }}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  label: { fontWeight: '600', color: colors.text, marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  error: { color: colors.danger, marginBottom: 10 },
});
