import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Fonts, FontSize } from '../../constants';
import { AuctionBidEntry } from '../../data/mockAuctionDetail';
import { formatCurrency, getInitials } from '../../utils/format';

type Props = {
  bid: AuctionBidEntry;
  variant?: 'light' | 'dark';
  currency?: string;
};

export default function BidHistoryRow({ bid, variant = 'light', currency = 'ARS' }: Props) {
  const isLight = variant === 'light';

  return (
    <View style={[styles.row, isLight ? styles.rowLight : styles.rowDark]}>
      <View style={[styles.avatar, { backgroundColor: bid.avatarColor }]}>
        <Text style={styles.avatarText}>{getInitials(bid.bidderName)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, isLight && styles.nameLight]}>{bid.bidderName}</Text>
        <Text style={[styles.time, isLight && styles.timeLight]}>{bid.timeAgo}</Text>
      </View>
      <Text style={[styles.amount, isLight && styles.amountLight]}>
        {formatCurrency(bid.amount, currency, true)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowLight: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  rowDark: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontFamily: Fonts.soraBold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: Fonts.soraBold,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  nameLight: {
    color: Colors.black,
  },
  time: {
    fontFamily: Fonts.sora,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
  },
  timeLight: {
    color: Colors.textSecondary,
  },
  amount: {
    fontFamily: Fonts.soraBold,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  amountLight: {
    color: Colors.black,
  },
});
