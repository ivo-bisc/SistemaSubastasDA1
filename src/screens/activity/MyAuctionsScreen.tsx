import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Fonts, FontSize } from '../../constants';
import { useAuthStore } from '../../stores';
import HomeHeader from '../../components/home/HomeHeader';
import {
  ActivityItemCard,
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

  // Filter items logically based on user selection
  const filteredAuctions = MOCK_AUCTIONS.filter((auction) => {
    if (filter === 'all') return true;
    if (filter === 'canceled') return auction.status === 'canceled';
    if (filter === 'finished') return auction.status === 'finished';
    return true;
  });

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const handleMenuPress = () => {
    navigation.getParent()?.navigate('Profile');
  };

  const handleChatPress = () => {
    navigation.navigate('Home', { screen: 'ChatList' });
  };

  const handleItemPress = (auctionId: string) => {
    navigation.navigate('AuctionDetail', { auctionId });
  };

  const renderAuctionItem = ({ item }: { item: MockAuctionItem }) => {
    // Label for auctions is "Puja máxima:"
    return (
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
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Reusable Home Header */}
      <HomeHeader
        isLoggedIn={isAuthenticated}
        onIngresar={logout}
        onMenuPress={handleMenuPress}
        onChatPress={handleChatPress}
      />

      {/* Screen Title Capsule */}
      <View style={styles.titleWrap}>
        <View style={styles.titleCapsule}>
          <Text style={styles.titleText}>Mis subastas</Text>
        </View>
      </View>

      {/* Controls Row: Back Arrow + Dropdown Filter */}
      <View style={styles.controlsRow}>
        <Pressable
          style={({ pressed }) => [
            styles.backCircleBtn,
            pressed && styles.backCircleBtnPressed,
          ]}
          onPress={handleBackPress}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.black} />
        </Pressable>

        <DropdownFilter
          options={FILTER_OPTIONS}
          selectedValue={filter}
          onValueChange={setFilter}
        />
      </View>

      {/* Items List */}
      <FlatList
        data={filteredAuctions}
        keyExtractor={(item) => item.id}
        renderItem={renderAuctionItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="albums-outline" size={48} color={Colors.textSecondary} />
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
    backgroundColor: Colors.background,
  },
  titleWrap: {
    alignItems: 'center',
    marginVertical: 12,
  },
  titleCapsule: {
    backgroundColor: '#292852', // Dark blue/violet capsule
    paddingHorizontal: 60,
    paddingVertical: 12,
    borderRadius: 24,
    width: '90%',
    alignItems: 'center',
  },
  titleText: {
    fontFamily: Fonts.title,
    fontSize: FontSize.lg,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  backCircleBtnPressed: {
    backgroundColor: '#E5E5E5',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
});
