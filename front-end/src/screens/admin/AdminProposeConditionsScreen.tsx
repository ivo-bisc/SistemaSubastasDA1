import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { adminService } from '../../services';
import type { AdminStackParamList } from '../../types';
import { Colors, Fonts, FontSize } from '../../constants';

type Nav = StackNavigationProp<AdminStackParamList, 'AdminProposeConditions'>;
type Route = RouteProp<AdminStackParamList, 'AdminProposeConditions'>;

const CATEGORIAS = ['COMUN', 'ESPECIAL', 'PLATA', 'ORO', 'PLATINO'] as const;
type Categoria = typeof CATEGORIAS[number];

export default function AdminProposeConditionsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { consignacionId } = route.params;

  const [valorBase, setValorBase] = useState('');
  const [comisiones, setComisiones] = useState('');
  const [fechaSubasta, setFechaSubasta] = useState('');
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid =
    valorBase.trim() !== '' &&
    comisiones.trim() !== '' &&
    fechaSubasta.trim() !== '' &&
    categoria !== null;

  const handleSubmit = async () => {
    if (!isValid || !categoria) return;
    setLoading(true);
    setError(null);
    try {
      await adminService.proposeConditions(consignacionId, {
        valorBase: Number(valorBase),
        comisiones: Number(comisiones),
        fechaSubasta: fechaSubasta.trim(),
        categoria,
      });
      navigation.goBack();
    } catch {
      setError('Error al enviar la propuesta. Verificá los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <View>
          <Text style={styles.title}>Proponer condiciones</Text>
          <Text style={styles.subtitle}>Consignación #{consignacionId}</Text>
        </View>
      </View>

      <Text style={styles.label}>Valor base</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 50000"
        placeholderTextColor={Colors.textSecondary}
        value={valorBase}
        onChangeText={setValorBase}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Comisión (%)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 10"
        placeholderTextColor={Colors.textSecondary}
        value={comisiones}
        onChangeText={setComisiones}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Fecha de subasta</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DDTHH:mm"
        placeholderTextColor={Colors.textSecondary}
        value={fechaSubasta}
        onChangeText={setFechaSubasta}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Categoría</Text>
      <View style={styles.categoriaRow}>
        {CATEGORIAS.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catBtn, categoria === cat && styles.catBtnSelected]}
            onPress={() => setCategoria(cat)}
          >
            <Text style={[styles.catBtnText, categoria === cat && styles.catBtnTextSelected]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.submitBtn, (!isValid || loading) && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={!isValid || loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.submitText}>Enviar propuesta</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  backBtn: {
    marginRight: 4,
    padding: 4,
  },
  title: {
    fontFamily: Fonts.soraBold,
    fontSize: FontSize.xxl,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  label: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    marginBottom: 20,
  },
  categoriaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  catBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
  },
  catBtnSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent,
  },
  catBtnText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
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
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
});
