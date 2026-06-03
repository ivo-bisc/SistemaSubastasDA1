import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuctionItemCard } from '../../components/home';
import ProfileHeaderBar from '../../components/profile/ProfileHeaderBar';
import { Colors, Fonts, FontSize } from '../../constants';
import { auctionService } from '../../services';
import { useAuthStore } from '../../stores';
import { formatTimeRemaining } from '../../utils/format';
import type { CatalogCategory } from '../../types/catalog';
import type { HomeStackParamList, RootStackParamList } from '../../types';

type Route = RouteProp<HomeStackParamList, 'LotDetail'>;
type Nav = StackNavigationProp<HomeStackParamList, 'LotDetail'>;

export default function LotDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const lotId = route.params.lotId;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [lot, setLot] = useState<CatalogCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace('LoginWall');
    }
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    if (!lotId) {
      setError('No encontramos este lote.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    auctionService
      .getLotDetail(lotId)
      .then(setLot)
      .catch(() => setError('No se pudo cargar el lote.'))
      .finally(() => setLoading(false));
  }, [lotId]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const displayItems = useMemo(() => {
    if (!lot) return [];
    const endDate = lot.endDate ?? '';
    return lot.items.map((item) => ({
      ...item,
      timeRemaining: formatTimeRemaining(endDate),
    }));
  }, [lot, tick]);

  const openProduct = () => {
    navigation
      .getParent()
      ?.getParent()
      ?.navigate('AuctionDetail' as keyof RootStackParamList, {
        auctionId: lotId,
      });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ProfileHeaderBar title="Lote" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !lot) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ProfileHeaderBar title="Lote" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? 'No encontramos este lote.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <ProfileHeaderBar title={lot.name} onBack={() => navigation.goBack()} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Descripción del lote</Text>
        <Text style={styles.description}>{lot.description}</Text>

        <Text style={styles.sectionLabel}>
          Productos ({lot.items.length})
        </Text>

        {displayItems.length === 0 ? (
          <Text style={styles.emptyText}>No hay ítems en este lote.</Text>
        ) : (
          displayItems.map((item) => (
            <AuctionItemCard
              key={item.id}
              item={item}
              showPrice
              onPress={openProduct}
              style={styles.productCard}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.homeBackground,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginBottom: 8,
    marginTop: 4,
  },
  description: {
    fontFamily: Fonts.body,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  productCard: {
    width: '100%',
    marginRight: 0,
    marginBottom: 14,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
