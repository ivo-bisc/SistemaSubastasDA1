import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Fonts, FontSize } from '../../constants';
import { useAuthStore } from '../../stores';
import HomeHeader from '../../components/home/HomeHeader';
import {
  ActivityItemCard,
  ActivitySectionHeader,
  ActivityToolbar,
  DropdownFilter,
  DropdownOption,
} from '../../components/activity';
import { MOCK_AUCTIONS, MockAuctionItem } from '../../data/mockActivity';

const FILTER_OPTIONS: DropdownOption[] = [
  { value: 'all', label: 'Todas mis Subastas' },
  { value: 'canceled', label: 'Canceladas' },
  { value: 'finished', label: 'Finalizadas' },
];

export default function MyAuctionsScreen() {
  const navigation = useNavigation<any>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const [filter, setFilter] = useState('all');

  const filteredAuctions = MOCK_AUCTIONS.filter((auction) => {
    if (filter === 'all') return true;
    if (filter === 'canceled') return auction.status === 'canceled';
    if (filter === 'finished') return auction.status === 'finished';
    return true;
  });

  const goHome = () => {
    navigation.navigate('Home');
  };

  const handleChatPress = () => {
    navigation.navigate('Home', { screen: 'ChatList' });
  };

  const handleItemPress = (auctionId: string) => {
    navigation.navigate('AuctionDetail', { auctionId });
  };

  const renderAuctionItem = ({ item }: { item: MockAuctionItem }) => (
    <ActivityItemCard
      title={item.title}
      imageUrl={item.imageUrl}
      timeRemaining={item.timeRemaining}
      primaryPrice={item.currentPrice}
      secondaryPrice="Puja máxima"
      badgeType={item.status}
      onPress={() => handleItemPress(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HomeHeader
        isLoggedIn={isAuthenticated}
        onIngresar={logout}
        onChatPress={handleChatPress}
      />

      <ActivitySectionHeader title="Mis subastas" />

      <ActivityToolbar onBack={goHome}>
        <DropdownFilter
          options={FILTER_OPTIONS}
          selectedValue={filter}
          onValueChange={setFilter}
        />
      </ActivityToolbar>

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
