import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Fonts, FontSize } from '../../constants';
import { useAuthStore } from '../../stores';
import HomeHeader from '../../components/home/HomeHeader';
import ConsignPromoBanner from '../../components/home/ConsignPromoBanner';
import PrimaryButton from '../../components/auth/PrimaryButton';
import {
  ActivityItemCard,
  ActivityBadgeType,
  ActivitySectionHeader,
  ActivityToolbar,
  DropdownFilter,
  DropdownOption,
} from '../../components/activity';
import { MockAuctionItem } from '../../data/mockActivity';
import type { MyAuctionsStackParamList } from '../../types';
import { consignService } from '../../services';
import { formatRelativeDate } from '../../utils/format';
import { resolveImageUrl } from '../../utils/media';

const FILTER_OPTIONS: DropdownOption[] = [
  { value: 'all', label: 'Todas mis Subastas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'approved_pending_lot', label: 'Sin lote' },
  { value: 'published', label: 'Publicadas' },
  { value: 'rejected', label: 'Rechazadas' },
  { value: 'finished', label: 'Finalizadas' },
];

type Nav = StackNavigationProp<MyAuctionsStackParamList, 'MyAuctionsMain'>;

function getModerationBadge(
  moderationStatus: MockAuctionItem['moderationStatus']
): ActivityBadgeType {
  if (moderationStatus === 'pending') return 'pending';
  if (moderationStatus === 'approved_pending_lot') return 'approved_pending_lot';
  if (moderationStatus === 'published') return 'published';
  if (moderationStatus === 'rejected') return 'rejected';
  return 'pending';
}

function parseTitulo(datosAdicionales: string, descripcion: string): string {
  try {
    const datos = JSON.parse(datosAdicionales);
    return datos.nombre || descripcion;
  } catch {
    return descripcion;
  }
}

interface ConsignmentItem extends MockAuctionItem {
  valorBase?: number;
  comisiones?: number;
  subastaId?: string;
  fechaSubasta?: string;
  rawEstado?: string;
}

function formatAmount(value?: number): string {
  if (value === undefined || value === null) return '—';
  return `$${Number(value).toLocaleString('es-AR')}`;
}

function formatDate(isoString?: string): string {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function MyAuctionsScreen() {
  const navigation = useNavigation<Nav>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const [filter, setFilter] = useState('all');
  const [auctions, setAuctions] = useState<ConsignmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] = useState<ConsignmentItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<'accept' | 'reject' | null>(null);

  const loadAuctions = useCallback(() => {
    setLoading(true);
    consignService
      .getConsignaciones()
      .then((res) => {
        const estadoMap: Record<string, { mod: MockAuctionItem['moderationStatus']; status: MockAuctionItem['status'] }> = {
          PENDIENTE_INSPECCION:  { mod: 'pending',              status: 'soon'     },
          RECHAZADO:             { mod: 'rejected',             status: 'canceled' },
          PROPUESTA_ENVIADA:     { mod: 'approved_pending_lot', status: 'soon'     },
          ACEPTADO_POR_USUARIO:  { mod: 'approved_pending_lot', status: 'soon'     },
          RECHAZADO_POR_USUARIO: { mod: 'rejected',             status: 'canceled' },
          INCLUIDO_EN_SUBASTA:   { mod: 'published',            status: 'soon'     },
        };
        const mapped: ConsignmentItem[] = (res.data ?? []).map((c: any) => {
          const e = estadoMap[c.estado] ?? { mod: 'pending', status: 'soon' };
          const precio = c.valorBase ?? c.precioSugerido;
          return {
            id: String(c.consignacionId),
            title: parseTitulo(c.datosAdicionales, c.descripcion),
            imageUrl: resolveImageUrl(c.fotosUrls?.[0]),
            timeRemaining: c.fechaSubasta ? formatRelativeDate(c.fechaSubasta) : '—',
            currentPrice: precio ? `$${Number(precio).toLocaleString('es-AR')}` : '—',
            status: e.status,
            moderationStatus: e.mod,
            rejectionReason: c.motivoRechazo ?? undefined,
            valorBase: c.valorBase,
            comisiones: c.comisiones,
            subastaId: c.subastaId !== undefined && c.subastaId !== null ? String(c.subastaId) : undefined,
            fechaSubasta: c.fechaSubastaPropuesta ?? c.fechaSubasta,
            rawEstado: c.estado,
          };
        });
        setAuctions(mapped);
        setError(null);
      })
      .catch(() => setError('No se pudieron cargar las subastas.'))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAuctions();
    }, [loadAuctions])
  );

  const filteredAuctions = auctions.filter((auction) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return auction.moderationStatus === 'pending';
    if (filter === 'approved_pending_lot') {
      return auction.moderationStatus === 'approved_pending_lot';
    }
    if (filter === 'published') return auction.moderationStatus === 'published';
    if (filter === 'rejected') return auction.moderationStatus === 'rejected';
    if (filter === 'finished') return auction.status === 'finished';
    return true;
  });

  const goHome = () => {
    navigation.getParent()?.navigate('Home');
  };

  const handleChatPress = () => {
    navigation.getParent()?.navigate('Home', { screen: 'ChatList' });
  };

  const handleCreateAuction = () => {
    navigation.navigate('UploadItem', { returnTo: 'myAuctions' });
  };

  const handleItemPress = (auction: ConsignmentItem) => {
    if (auction.rawEstado === 'PROPUESTA_ENVIADA') {
      setSelectedItem(auction);
      setShowModal(true);
      return;
    }
    if (auction.rawEstado === 'INCLUIDO_EN_SUBASTA' && auction.subastaId) {
      navigation.getParent()?.getParent()?.navigate('AuctionDetail', {
        auctionId: auction.subastaId,
      });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleAcceptConditions = () => {
    if (!selectedItem) return;
    setActionLoading('accept');
    consignService
      .acceptConditions(selectedItem.id)
      .then(() => {
        closeModal();
        loadAuctions();
      })
      .catch(() => Alert.alert('Error', 'No se pudieron aceptar las condiciones. Probá de nuevo.'))
      .finally(() => setActionLoading(null));
  };

  const handleRejectConditions = () => {
    if (!selectedItem) return;
    Alert.alert(
      'Rechazar condiciones',
      'El bien será devuelto con un cargo. ¿Querés continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: () => {
            setActionLoading('reject');
            consignService
              .rejectConditions(selectedItem.id)
              .then(() => {
                closeModal();
                loadAuctions();
              })
              .catch(() => Alert.alert('Error', 'No se pudieron rechazar las condiciones. Probá de nuevo.'))
              .finally(() => setActionLoading(null));
          },
        },
      ]
    );
  };

  const renderAuctionItem = ({ item }: { item: ConsignmentItem }) => (
    <ActivityItemCard
      title={item.title}
      imageUrl={item.imageUrl}
      timeRemaining={item.timeRemaining}
      primaryPrice={item.currentPrice}
      secondaryPrice={
        item.moderationStatus === 'published' ? 'Puja máxima' : undefined
      }
      badgeType={getModerationBadge(item.moderationStatus)}
      statusNote={
        item.moderationStatus === 'rejected' && item.rejectionReason
          ? `Motivo: ${item.rejectionReason}`
          : item.rawEstado === 'PROPUESTA_ENVIADA'
            ? 'Propuesta recibida — revisá las condiciones'
            : item.rawEstado === 'ACEPTADO_POR_USUARIO'
              ? 'Condiciones aceptadas — pendiente de subasta'
              : undefined
      }
      onPress={() => handleItemPress(item)}
    />
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HomeHeader
        isLoggedIn={isAuthenticated}
        onIngresar={logout}
        onChatPress={handleChatPress}
      />

      <ConsignPromoBanner onPress={handleCreateAuction} />

      <ActivitySectionHeader title="Mis subastas" />

      <ActivityToolbar onBack={goHome}>
        <DropdownFilter
          options={FILTER_OPTIONS}
          selectedValue={filter}
          onValueChange={setFilter}
        />
      </ActivityToolbar>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.accent}
          style={{ marginTop: 48 }}
        />
      ) : error ? (
        <View style={styles.emptyCard}>
          <Ionicons name="alert-circle-outline" size={40} color={Colors.cardTime} />
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAuctions}
          keyExtractor={(item) => item.id}
          renderItem={renderAuctionItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="albums-outline" size={40} color={Colors.cardTime} />
              <Text style={styles.emptyText}>No tenés subastas en esta categoría.</Text>
            </View>
          }
        />
      )}

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.sheet}>
            <Text style={modalStyles.title}>{selectedItem?.title}</Text>

            <View style={modalStyles.row}>
              <Text style={modalStyles.label}>Valor base</Text>
              <Text style={modalStyles.value}>{formatAmount(selectedItem?.valorBase)}</Text>
            </View>
            <View style={modalStyles.row}>
              <Text style={modalStyles.label}>Comisión</Text>
              <Text style={modalStyles.value}>{formatAmount(selectedItem?.comisiones)}</Text>
            </View>
            <View style={modalStyles.row}>
              <Text style={modalStyles.label}>Fecha estimada de subasta</Text>
              <Text style={modalStyles.value}>{formatDate(selectedItem?.fechaSubasta)}</Text>
            </View>

            <View style={modalStyles.actions}>
              <PrimaryButton
                label="Rechazar condiciones"
                onPress={handleRejectConditions}
                loading={actionLoading === 'reject'}
                disabled={actionLoading !== null}
                style={modalStyles.rejectBtn}
              />
              <PrimaryButton
                label="Aceptar condiciones"
                onPress={handleAcceptConditions}
                loading={actionLoading === 'accept'}
                disabled={actionLoading !== null}
                style={modalStyles.acceptBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.homeBackground,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 24,
  },
  emptyCard: {
    marginHorizontal: 12,
    marginTop: 8,
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: Colors.white,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.md,
    color: Colors.cardTime,
    marginTop: 12,
    textAlign: 'center',
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    width: '100%',
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontFamily: Fonts.title,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  value: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  actions: {
    marginTop: 12,
    gap: 10,
  },
  rejectBtn: {
    backgroundColor: Colors.error,
  },
  acceptBtn: {
    backgroundColor: Colors.accent,
  },
});
