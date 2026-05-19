import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Colors, Fonts, FontSize } from '../../constants';
import { CatalogCategory } from '../../types/catalog';
import AuctionItemCard, { AUCTION_CARD_WIDTH } from './AuctionItemCard';

type Props = {
  category: CatalogCategory;
  showPrice: boolean;
  onItemPress?: (itemId: string) => void;
};

export default function CategorySection({
  category,
  showPrice,
  onItemPress,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{category.name}</Text>
      <View style={styles.underline} />
      <FlatList
        data={category.items}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <AuctionItemCard
            item={item}
            showPrice={showPrice}
            onPress={() => onItemPress?.(item.id)}
          />
        )}
        getItemLayout={(_, index) => ({
          length: AUCTION_CARD_WIDTH + 12,
          offset: (AUCTION_CARD_WIDTH + 12) * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  title: {
    fontFamily: Fonts.title,
    fontSize: FontSize.category,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 6,
  },
  underline: {
    alignSelf: 'center',
    width: 120,
    height: 3,
    backgroundColor: Colors.accent,
    borderRadius: 2,
    marginBottom: 14,
  },
  list: {
    paddingHorizontal: 4,
  },
});
