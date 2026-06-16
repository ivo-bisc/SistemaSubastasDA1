import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { adminService } from '../../services';
import { Colors, Fonts, FontSize } from '../../constants';

interface PendingUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function AdminPendingUsersScreen() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [categoriaInput, setCategoriaInput] = useState('');
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
    if (!categoriaInput.trim()) return;
    setActionError(null);
    try {
      await adminService.approveUser(String(id), categoriaInput.trim().toUpperCase());
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setApprovingId(null);
      setCategoriaInput('');
    } catch {
      setActionError('Error al aprobar el usuario. Verificá la categoría.');
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
      <Text style={styles.title}>Usuarios pendientes</Text>
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
                  setCategoriaInput('');
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
                <TextInput
                  style={styles.input}
                  placeholder="COMUN | ORO | PLATINO | DIAMANTE"
                  placeholderTextColor={Colors.textSecondary}
                  value={categoriaInput}
                  onChangeText={setCategoriaInput}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={[styles.btn, styles.btnConfirm]}
                  onPress={() => handleApproveConfirm(item.id)}
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
  title: {
    fontFamily: Fonts.soraBold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    marginBottom: 16,
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
  btnConfirm: {
    backgroundColor: Colors.accent,
    marginTop: 8,
    flex: 0,
    paddingHorizontal: 24,
  },
  btnText: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  inlineForm: {
    marginTop: 12,
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
