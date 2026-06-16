import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { adminService } from '../../services';
import type { AdminStackParamList } from '../../types';
import { Colors, Fonts, FontSize } from '../../constants';

type Nav = StackNavigationProp<AdminStackParamList, 'AdminProposeConditions'>;
type Route = RouteProp<AdminStackParamList, 'AdminProposeConditions'>;

export default function AdminProposeConditionsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { consignacionId } = route.params;

  const [valorBase, setValorBase] = useState('');
  const [comisiones, setComisiones] = useState('');
  const [fechaSubasta, setFechaSubasta] = useState('');
  const [categoria, setCategoria] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid =
    valorBase.trim() !== '' &&
    comisiones.trim() !== '' &&
    fechaSubasta.trim() !== '' &&
    categoria.trim() !== '';

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setError(null);
    try {
      await adminService.proposeConditions(consignacionId, {
        valorBase: Number(valorBase),
        comisiones: Number(comisiones),
        fechaSubasta: fechaSubasta.trim(),
        categoria: categoria.trim().toUpperCase(),
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
      <Text style={styles.title}>Proponer condiciones</Text>
      <Text style={styles.subtitle}>Consignación #{consignacionId}</Text>

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
      <TextInput
        style={styles.input}
        placeholder="COMUN | ORO | PLATINO | DIAMANTE"
        placeholderTextColor={Colors.textSecondary}
        value={categoria}
        onChangeText={setCategoria}
        autoCapitalize="characters"
      />

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
    marginBottom: 28,
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
