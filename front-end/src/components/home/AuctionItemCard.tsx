import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize } from '../../constants';
import { CatalogCardItem } from '../../types/catalog';

type Props = {
  item: CatalogCardItem;
  showPrice: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export default function AuctionItemCard({
  item,
  showPrice,
  onPress,
  style,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        {showPrice ? (
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>{item.price}</Text>
          </View>
        ) : null}
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={12} color={Colors.cardTime} />
          <Text style={styles.timeText}>{item.timeRemaining}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const CARD_WIDTH = 148;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  pressed: {
    opacity: 0.92,
  },
  image: {
    width: '100%',
    height: 118,
    backgroundColor: Colors.border,
  },
  body: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
  },
  title: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.cardTitle,
    color: Colors.black,
    lineHeight: 14,
    marginBottom: 6,
  },
  priceTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.cardPrice,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  priceText: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.cardTime,
    marginLeft: 4,
  },
});

export const AUCTION_CARD_WIDTH = CARD_WIDTH;
