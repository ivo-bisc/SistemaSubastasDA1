import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize } from '../../constants';
import { formatCurrency } from '../../utils/format';

type Props = {
  initialPrice: number;
  lastBid: number;
  currency: string;
  timeRemaining: string;
  liveCount?: number;
};

export default function AuctionStatsCards({
  initialPrice,
  lastBid,
  currency,
  timeRemaining,
  liveCount = 24,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.half}>
        <Text style={styles.label}>Precio inicial</Text>
        <Text style={styles.value}>
          {formatCurrency(initialPrice, currency).replace(` ${currency}`, '')}{' '}
          <Text style={styles.currency}>{currency}</Text>
        </Text>
        <View style={styles.liveRow}>
          <View style={styles.avatarStack}>
            <View style={[styles.miniAvatar, { backgroundColor: '#E57373' }]} />
            <View style={[styles.miniAvatar, styles.miniOverlap, { backgroundColor: '#64B5F6' }]} />
            <View style={[styles.miniAvatar, styles.miniOverlap, { backgroundColor: '#81C784' }]} />
            <View style={[styles.miniAvatar, styles.miniOverlap, { backgroundColor: '#FFB74D' }]} />
          </View>
          <Text style={styles.liveText}>+{liveCount} en vivo</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.half}>
        <Text style={styles.label}>Última puja</Text>
        <Text style={styles.value}>
          {formatCurrency(lastBid, currency).replace(` ${currency}`, '')}{' '}
          <Text style={styles.currency}>{currency}</Text>
        </Text>
        <View style={styles.timerRow}>
          <Ionicons name="time-outline" size={14} color={Colors.accent} />
          <Text style={styles.timerText}>{timeRemaining}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  half: {
    flex: 1,
    paddingHorizontal: 4,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  label: {
    fontFamily: Fonts.sora,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontFamily: Fonts.soraBold,
    fontSize: FontSize.md,
    color: Colors.black,
    marginBottom: 8,
  },
  currency: {
    fontFamily: Fonts.soraBold,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  miniOverlap: {
    marginLeft: -7,
  },
  liveText: {
    fontFamily: Fonts.sora,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontFamily: Fonts.sora,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
});
