import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminService } from '../../services';
import { Colors, Fonts, FontSize } from '../../constants';

const CATEGORIAS = ['COMUN', 'ESPECIAL', 'PLATA', 'ORO', 'PLATINO'] as const;
type Categoria = typeof CATEGORIAS[number];

interface PendingUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function AdminPendingUsersScreen() {
  const navigation = useNavigation<any>();
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [categoriaSelected, setCategoriaSelected] = useState<Categoria | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getPendingUsers();
      setUsers(res.data);
    } catch {
      setError('No se pudieron cargar los usuarios pendientes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleReject = async (id: number) => {
    setActionError(null);
    try {
      await adminService.rejectUser(String(id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setActionError('Error al rechazar el usuario.');
    }
  };

  const handleApproveConfirm = async (id: number) => {
    if (!categoriaSelected) return;
    setActionError(null);
    try {
      await adminService.approveUser(String(id), categoriaSelected);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setApprovingId(null);
      setCategoriaSelected(null);
    } catch {
      setActionError('Error al aprobar el usuario.');
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
        <Text style={styles.title}>Usuarios pendientes</Text>
      </View>
      {actionError ? <Text style={styles.errorText}>{actionError}</Text> : null}
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay usuarios pendientes.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.btn, styles.btnApprove]}
                onPress={() => {
                  setApprovingId(item.id);
                  setCategoriaSelected(null);
                  setActionError(null);
                }}
              >
                <Text style={styles.btnText}>Aprobar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnReject]}
                onPress={() => handleReject(item.id)}
              >
                <Text style={styles.btnText}>Rechazar</Text>
              </TouchableOpacity>
            </View>
            {approvingId === item.id && (
              <View style={styles.inlineForm}>
                <Text style={styles.categoriaLabel}>Categoría:</Text>
                <View style={styles.categoriaRow}>
                  {CATEGORIAS.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catBtn,
                        categoriaSelected === cat && styles.catBtnSelected,
                      ]}
                      onPress={() => setCategoriaSelected(cat)}
                    >
                      <Text
                        style={[
                          styles.catBtnText,
                          categoriaSelected === cat && styles.catBtnTextSelected,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.confirmWrapper}>
                  <TouchableOpacity
                    style={[styles.btnConfirm, !categoriaSelected && styles.btnDisabled]}
                    onPress={() => handleApproveConfirm(item.id)}
                    disabled={!categoriaSelected}
                  >
                    <Text style={styles.btnText}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    marginRight: 4,
    padding: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
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
  name: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  email: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnApprove: {
    backgroundColor: Colors.success,
  },
  btnReject: {
    backgroundColor: Colors.error,
  },
  confirmWrapper: {
    marginTop: 12,
    alignItems: 'center',
  },
  btnConfirm: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  inlineForm: {
    marginTop: 12,
  },
  categoriaLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  categoriaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.white,
  },
  catBtnSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent,
  },
  catBtnText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  catBtnTextSelected: {
    color: Colors.white,
    fontFamily: Fonts.bodyBold,
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
