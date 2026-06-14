import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { ProfileHeaderBar, ProfileScreenShell } from '../../components/profile';
import { Colors, Fonts, FontSize, Layout } from '../../constants';
import { useProfileStore } from '../../stores';
import { metricsService } from '../../services';
import type { ProfileStackParamList } from '../../types';

type Nav = StackNavigationProp<ProfileStackParamList, 'Fines'>;

type Multa = {
  multaId: string;
  monto: number;
  motivo: string;
  fechaGeneracion: string;
  fechaLimitePago: string;
  estado: 'PENDIENTE' | 'PAGADA' | 'DERIVADA_JUSTICIA';
  puedeParticiparNuevamente: boolean;
};

function formatDate(isoString?: string): string {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function statusLabel(estado: Multa['estado']): string {
  if (estado === 'PENDIENTE') return 'Pendiente';
  if (estado === 'PAGADA') return 'Pagada';
  return 'Derivada a justicia';
}

function notify(title: string, message: string): void {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

function cardLabel(card: { alias: string; tipo: string; moneda: string }): string {
  return [card.alias, card.tipo, card.moneda].filter(Boolean).join(' · ') || 'Tarjeta';
}

function statusColor(estado: Multa['estado']): string {
  if (estado === 'PENDIENTE') return Colors.warning;
  if (estado === 'PAGADA') return Colors.success;
  return Colors.error;
}

export default function FinesScreen() {
  const navigation = useNavigation<Nav>();
  const cards = useProfileStore((s) => s.cards);

  const [fines, setFines] = useState<Multa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payingFine, setPayingFine] = useState<Multa | null>(null);

  const loadFines = () => {
    setLoading(true);
    setError(null);
    metricsService
      .getFines()
      .then((res) => {
        const mapped: Multa[] = (res.data ?? []).map((m: any) => ({
          multaId: String(m.multaId),
          monto: Number(m.monto),
          motivo: m.motivo,
          fechaGeneracion: m.fechaGeneracion,
          fechaLimitePago: m.fechaLimitePago,
          estado: m.estado,
          puedeParticiparNuevamente: m.puedeParticiparNuevamente,
        }));
        setFines(mapped);
      })
      .catch(() => setError('No se pudieron cargar las multas.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFines();
  }, []);

  const handlePay = (multa: Multa) => {
    if (cards.length === 0) {
      notify('Sin medio de pago', 'Necesitás agregar un medio de pago antes de pagar una multa.');
      return;
    }
    setPayingFine(multa);
  };

  const confirmPay = (medioPagoId: string) => {
    const multa = payingFine;
    if (!multa) return;

    setPayingFine(null);
    setPayingId(multa.multaId);
    metricsService
      .payFine(multa.multaId, medioPagoId)
      .then(() => {
        loadFines();
      })
      .catch(() => {
        notify('Error', 'No se pudo procesar el pago. Intentá de nuevo.');
      })
      .finally(() => setPayingId(null));
  };

  return (
    <ProfileScreenShell>
      <ProfileHeaderBar title="Multas" onBack={() => navigation.goBack()} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : fines.length === 0 ? (
        <Text style={styles.empty}>No tenés multas registradas.</Text>
      ) : (
        fines.map((multa) => (
          <View key={multa.multaId} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.amount}>${multa.monto.toLocaleString('es-AR')}</Text>
              <View style={[styles.badge, { backgroundColor: statusColor(multa.estado) }]}>
                <Text style={styles.badgeText}>{statusLabel(multa.estado)}</Text>
              </View>
            </View>
            <Text style={styles.reason}>{multa.motivo}</Text>
            <Text style={styles.dueDate}>
              Fecha límite de pago: {formatDate(multa.fechaLimitePago)}
            </Text>

            {multa.estado === 'PENDIENTE' && (
              <Pressable
                style={[styles.payButton, payingId === multa.multaId && styles.payButtonDisabled]}
                onPress={() => handlePay(multa)}
                disabled={payingId === multa.multaId}
              >
                <Text style={styles.payButtonText}>
                  {payingId === multa.multaId ? 'Procesando…' : 'Pagar'}
                </Text>
              </Pressable>
            )}
          </View>
        ))
      )}

      <Modal visible={payingFine !== null} transparent animationType="fade">
        <View style={modalStyles.overlay}>
          <View style={modalStyles.sheet}>
            <Text style={modalStyles.title}>Pagar multa</Text>
            <Text style={modalStyles.subtitle}>
              Elegí el medio de pago con el que querés abonar esta multa.
            </Text>

            {cards.map((card) => (
              <Pressable
                key={card.id}
                style={({ pressed }) => [modalStyles.option, pressed && modalStyles.optionPressed]}
                onPress={() => confirmPay(card.id)}
              >
                <Text style={modalStyles.optionText}>{cardLabel(card)}</Text>
              </Pressable>
            ))}

            <Pressable onPress={() => setPayingFine(null)} style={modalStyles.cancelBtn}>
              <Text style={modalStyles.cancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ProfileScreenShell>
  );
}

const styles = StyleSheet.create({
  centered: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 24,
  },
  empty: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
  card: {
    backgroundColor: Layout.inputBackground,
    borderRadius: Layout.profileRowRadius,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amount: {
    fontFamily: Fonts.title,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  reason: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  dueDate: {
    fontFamily: Fonts.body,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  payButton: {
    marginTop: 12,
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    width: '90%',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 8,
  },
  title: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.base,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  option: {
    backgroundColor: Layout.inputBackground,
    borderRadius: Layout.profileRowRadius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  optionPressed: {
    opacity: 0.85,
  },
  optionText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  cancelText: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.base,
    color: Colors.error,
  },
});
