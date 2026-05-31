import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize } from '../../constants';

export type ActivityBadgeType =
  | 'winning'
  | 'losing'
  | 'won'
  | 'lost'
  | 'soon'
  | 'finished'
  | 'canceled';

interface Props {
  title: string;
  imageUrl: string;
  timeRemaining: string;
  primaryPrice: string;
  secondaryPrice?: string; // Optional: e.g. "Tu Puja: $X"
  badgeType: ActivityBadgeType;
  onPress?: () => void;
}

export default function ActivityItemCard({
  title,
  imageUrl,
  timeRemaining,
  primaryPrice,
  secondaryPrice,
  badgeType,
  onPress,
}: Props) {
  // Determine badge styling and text dynamically
  const getBadgeConfig = (type: ActivityBadgeType) => {
    switch (type) {
      case 'winning':
        return {
          text: 'Estás Ganando!',
          bg: '#8CA73A', // Olive green
          color: Colors.white,
          icon: 'checkmark-circle-outline',
        };
      case 'losing':
        return {
          text: 'Estás Perdiendo!',
          bg: Colors.accent, // Orange
          color: Colors.white,
          icon: 'alert-circle-outline',
        };
      case 'won':
        return {
          text: 'Ganaste!',
          bg: Colors.success, // Solid Green
          color: Colors.white,
          icon: 'trophy-outline',
        };
      case 'lost':
        return {
          text: 'Perdiste',
          bg: Colors.error, // Solid Red
          color: Colors.white,
          icon: 'close-circle-outline',
        };
      case 'soon':
        return {
          text: 'Falta Poco!',
          bg: Colors.accent, // Orange
          color: Colors.white,
          icon: 'hourglass-outline',
        };
      case 'finished':
        return {
          text: 'Finalizada!',
          bg: Colors.success, // Solid Green
          color: Colors.white,
          icon: 'checkmark-circle-outline',
        };
      case 'canceled':
        return {
          text: 'Cancelada',
          bg: Colors.error, // Solid Red
          color: Colors.white,
          icon: 'ban-outline',
        };
      default:
        return {
          text: '',
          bg: Colors.border,
          color: Colors.black,
          icon: undefined,
        };
    }
  };

  const badgeConfig = getBadgeConfig(badgeType);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      {/* Thumbnail Circle */}
      <View style={styles.imageWrap}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.fallbackImage]}>
            <Ionicons name="hammer" size={24} color={Colors.textSecondary} />
          </View>
        )}
      </View>

      {/* Center Details */}
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.timeRow}>
          <Text style={styles.hourglassIcon}>⌛</Text>
          <Text style={styles.timeText}>{timeRemaining}</Text>
        </View>
      </View>

      {/* Right Pricing and Badge */}
      <View style={styles.rightSide}>
        <View style={styles.priceContainer}>
          <Text style={styles.primaryPrice}>{primaryPrice}</Text>
          {secondaryPrice ? (
            <Text style={styles.secondaryPrice}>{secondaryPrice}</Text>
          ) : null}
        </View>

        {/* Badge Capsule */}
        <View style={[styles.badge, { backgroundColor: badgeConfig.bg }]}>
          {badgeConfig.icon ? (
            <Ionicons
              name={badgeConfig.icon as any}
              size={12}
              color={badgeConfig.color}
              style={styles.badgeIcon}
            />
          ) : null}
          <Text style={[styles.badgeText, { color: badgeConfig.color }]}>
            {badgeConfig.text}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pressed: {
    backgroundColor: '#F9F9F9',
  },
  imageWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.black,
    lineHeight: 16,
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hourglassIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  timeText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  rightSide: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 64,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  primaryPrice: {
    fontFamily: Fonts.title,
    fontSize: FontSize.base,
    color: Colors.black,
    lineHeight: 18,
  },
  secondaryPrice: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 9.5,
  },
});
