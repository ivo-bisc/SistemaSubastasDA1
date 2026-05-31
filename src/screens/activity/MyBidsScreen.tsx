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
import { MOCK_BIDS, MockBidItem } from '../../data/mockActivity';

const FILTER_OPTIONS: DropdownOption[] = [
  { value: 'all', label: 'Todas Mis Pujas' },
  { value: 'lost', label: 'Perdidas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'won', label: 'Ganadas' },
];

export default function MyBidsScreen() {
  const navigation = useNavigation<any>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const [filter, setFilter] = useState('all');

  // Filter items logically based on user selection
  const filteredBids = MOCK_BIDS.filter((bid) => {
    if (filter === 'all') return true;
    if (filter === 'lost') return bid.status === 'lost';
    if (filter === 'won') return bid.status === 'won';
    if (filter === 'pending') return bid.status === 'losing' || bid.status === 'winning';
    return true;
  });

  const handleBackPress = () => {
    // Go to Home main if possible, else default goBack
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
    // Navigate to auction detail
    navigation.navigate('AuctionDetail', { auctionId });
  };

  const renderBidItem = ({ item }: { item: MockBidItem }) => {
    return (
      <ActivityItemCard
        title={item.title}
        imageUrl={item.imageUrl}
        timeRemaining={item.timeRemaining}
        primaryPrice={item.currentPrice}
        secondaryPrice={`Tu Puja: ${item.myBid}`}
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
          <Text style={styles.titleText}>Mis pujas</Text>
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
        data={filteredBids}
        keyExtractor={(item) => item.id}
        renderItem={renderBidItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="hammer-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No tenés pujas en esta categoría.</Text>
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
