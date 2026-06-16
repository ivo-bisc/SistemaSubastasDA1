import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { adminService } from '../../services';
import type { AdminStackParamList } from '../../types';
import { Colors, Fonts, FontSize } from '../../constants';

type Nav = StackNavigationProp<AdminStackParamList, 'AdminPendingConsignments'>;

interface PendingConsignment {
  id: number;
  titulo?: string;
  descripcion?: string;
  usuarioNombre?: string;
  usuarioEmail?: string;
}

export default function AdminPendingConsignmentsScreen() {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<PendingConsignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [motivoInput, setMotivoInput] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getPendingConsignments();
      setItems(res.data);
    } catch {
      setError('No se pudieron cargar las consignaciones pendientes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRejectConfirm = async (id: number) => {
    if (!motivoInput.trim()) return;
    setActionError(null);
    try {
      await adminService.rejectConsignment(String(id), motivoInput.trim());
      setItems((prev) => prev.filter((c) => c.id !== id));
      setRejectingId(null);
      setMotivoInput('');
    } catch {
      setActionError('Error al rechazar la consignación.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Consignaciones pendientes</Text>
      </View>
      {actionError ? <Text style={styles.errorText}>{actionError}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay consignaciones pendientes.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.itemTitle}>
              {item.titulo ?? item.descripcion ?? `Consignación #${item.id}`}
            </Text>
            {item.usuarioNombre ? (
              <Text style={styles.meta}>{item.usuarioNombre}</Text>
            ) : null}
            {item.usuarioEmail ? (
              <Text style={styles.meta}>{item.usuarioEmail}</Text>
            ) : null}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.btn, styles.btnPropose]}
                onPress={() =>
                  navigation.navigate('AdminProposeConditions', {
                    consignacionId: String(item.id),
                  })
                }
              >
                <Text style={styles.btnText}>Proponer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnReject]}
                onPress={() => {
                  setRejectingId(item.id);
                  setMotivoInput('');
                  setActionError(null);
                }}
              >
                <Text style={styles.btnText}>Rechazar</Text>
              </TouchableOpacity>
            </View>
            {rejectingId === item.id && (
              <View style={styles.inlineForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Motivo del rechazo"
                  placeholderTextColor={Colors.textSecondary}
                  value={motivoInput}
                  onChangeText={setMotivoInput}
                />
                <TouchableOpacity
                  style={[styles.btn, styles.btnConfirm]}
                  onPress={() => handleRejectConfirm(item.id)}
                >
                  <Text style={styles.btnText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    marginRight: 4,
    padding: 4,
  },
  title: {
    fontFamily: Fonts.soraBold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  meta: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  btn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnPropose: {
    backgroundColor: Colors.accent,
  },
  btnReject: {
    backgroundColor: Colors.error,
  },
  btnConfirm: {
    backgroundColor: Colors.primary,
    flex: 0,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  btnText: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  inlineForm: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
  },
  errorText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.error,
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
