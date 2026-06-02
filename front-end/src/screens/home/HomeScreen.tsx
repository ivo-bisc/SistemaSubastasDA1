import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CategorySection,
  ConsignPromoBanner,
  HomeHeader,
} from '../../components/home';
import { Colors } from '../../constants';
import { auctionService } from '../../services';
import { useAuthStore } from '../../stores';
import type {
  HomeStackParamList,
  MainTabParamList,
  RootStackParamList,
} from '../../types';

type HomeNav = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, 'HomeMain'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    StackNavigationProp<RootStackParamList>
  >
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const [searchQuery, setSearchQuery] = useState('');
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showPrice = isAuthenticated;

  useEffect(() => {
    setLoading(true);
    auctionService
      .getAuctions()
      .then((res) => setAuctions(res.data ?? []))
      .catch(() => setError('No se pudieron cargar las subastas.'))
      .finally(() => setLoading(false));
  }, []);

  const requireAuth = (action: () => void) => {
    if (isAuthenticated) {
      action();
      return;
    }
    navigation.navigate('LoginWall');
  };

  const openLot = (lotId: string) => {
    requireAuth(() => navigation.navigate('LotDetail', { lotId }));
  };

  const categories = useMemo(
    () =>
      auctions.map((s: any) => ({
        id: String(s.id),
        name: s.title,
        description: s.description ?? '',
        items: [
          {
            id: String(s.id),
            title: s.description || s.title,
            price: '',
            timeRemaining: '',
            imageUrl: '',
          },
        ],
      })),
    [auctions]
  );

  const filteredCategories = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return categories;
    return categories.filter((c) =>
      [c.name, c.description].join(' ').toLowerCase().includes(normalizedQuery)
    );
  }, [searchQuery, categories]);

  const openAuction = (itemId: string) => {
    requireAuth(() => {
      navigation.getParent()?.getParent()?.navigate('AuctionDetail', {
        auctionId: itemId,
      });
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HomeHeader
        isLoggedIn={isAuthenticated}
        onIngresar={logout}
        onChatPress={() => navigation.navigate('ChatList')}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <ConsignPromoBanner onPress={() => navigation.navigate('UploadItem', { returnTo: 'home' })} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.black} style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{error}</Text>
          </View>
        ) : filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              showPrice={showPrice}
              onLotPress={openLot}
              onItemPress={openAuction}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No encontramos resultados</Text>
            <Text style={styles.emptyText}>
              Probá con otro nombre de artículo o categoría.
            </Text>
          </View>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 16,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.cardTime,
    textAlign: 'center',
    lineHeight: 20,
  },
});
