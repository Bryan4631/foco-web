import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function PerfilScreen() {
  const { user, logout, isAdmin } = useAuth();
  const [closing, setClosing] = useState(false);

  const cerrarSesion = async () => {
    setClosing(true);
    await logout(); // al terminar, user = null y la navegación vuelve al login
  };

  return (
    <View style={styles.container}>
      <Text style={styles.nombre}>{user?.nombre}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <View style={[styles.badge, isAdmin && { backgroundColor: '#ede9fe' }]}>
        <Text style={styles.badgeText}>{isAdmin ? 'Administrador' : 'Usuario'}</Text>
      </View>

      <View style={{ marginTop: 32 }}>
        <Button title="Cerrar sesión" variant="danger" onPress={cerrarSesion} loading={closing} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  nombre: { fontSize: 26, fontWeight: '800', color: colors.text },
  email: { color: colors.muted, marginBottom: 12 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#dbeafe', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 14 },
  badgeText: { fontWeight: '600', color: colors.text },
});
