import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Fonts, FontSize } from '../../constants';
import { getInitials } from '../../utils/format';

type Props = {
  title: string;
  sellerName: string;
  sellerAvatarColor: string;
  status: string;
  categories: string[];
  titleSize?: number;
};

export default function AuctionProductInfo({
  title,
  sellerName,
  sellerAvatarColor,
  status,
  categories,
  titleSize = FontSize.xxxl,
}: Props) {
  return (
    <>
      <Text style={[styles.title, { fontSize: titleSize }]}>{title}</Text>

      <View style={styles.sellerRow}>
        <View style={[styles.sellerAvatar, { backgroundColor: sellerAvatarColor }]}>
          <Text style={styles.sellerInitials}>{getInitials(sellerName)}</Text>
        </View>
        <Text style={styles.sellerName}>{sellerName}</Text>
      </View>

      <Text style={styles.metaLine}>
        <Text style={styles.metaBold}>Estado: </Text>
        {status}
      </Text>

      <View style={styles.tagsRow}>
        <Text style={styles.metaBold}>Categorías: </Text>
        {categories.map((cat) => (
          <View key={cat} style={styles.tag}>
            <Text style={styles.tagText}>{cat}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: Fonts.soraBold,
    color: Colors.white,
    marginBottom: 12,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sellerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sellerInitials: {
    fontFamily: Fonts.soraBold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  sellerName: {
    fontFamily: Fonts.sora,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  metaLine: {
    fontFamily: Fonts.sora,
    fontSize: FontSize.sm,
    color: Colors.white,
    marginBottom: 8,
  },
  metaBold: {
    fontFamily: Fonts.soraBold,
    color: Colors.white,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 4,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontFamily: Fonts.soraBold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
});
