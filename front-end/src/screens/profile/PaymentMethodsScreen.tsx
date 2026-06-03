import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileHeaderBar, ProfileScreenShell } from '../../components/profile';
import { Colors, Fonts, FontSize, Layout } from '../../constants';
import { useProfileStore } from '../../stores';
import type { MockCard } from '../../data/mockProfile';
import type { ProfileStackParamList } from '../../types';

type Nav = StackNavigationProp<ProfileStackParamList, 'PaymentMethods'>;

function formatCardLabel(card: MockCard): string {
  const parts = [card.alias, card.tipo, card.moneda].filter(Boolean);
  if (parts.length > 0) return parts.join(' · ');
  if (card.last4) return `**** ${card.last4}`;
  return 'Tarjeta';
}

function CardBrandIcon({ brand }: { brand?: MockCard['brand'] }) {
  const name = brand === 'visa' ? 'card' : 'card-outline';
  return <Ionicons name={name} size={22} color={Colors.accent} />;
}

export default function PaymentMethodsScreen() {
  const navigation = useNavigation<Nav>();
  const cards = useProfileStore((s) => s.cards);
  const checks = useProfileStore((s) => s.checks);

  return (
    <ProfileScreenShell>
      <ProfileHeaderBar
        title="Medios de pago"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tarjetas</Text>
        <Pressable onPress={() => navigation.navigate('AddCard')} hitSlop={8}>
          <Text style={styles.addLink}>Agregar</Text>
        </Pressable>
      </View>

      {cards.map((card) => (
        <View key={card.id} style={styles.cardRow}>
          <CardBrandIcon brand={card.brand} />
          <Text style={styles.cardMask}>{formatCardLabel(card)}</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </View>
      ))}

      {cards.length === 0 ? (
        <Text style={styles.empty}>No hay tarjetas guardadas</Text>
      ) : null}

      <View style={[styles.sectionHeader, styles.sectionGap]}>
        <Text style={styles.sectionTitle}>Cheques</Text>
        <Pressable onPress={() => navigation.navigate('AddCheck')} hitSlop={8}>
          <Text style={styles.addLink}>Agregar</Text>
        </Pressable>
      </View>

      {checks.length === 0 ? (
        <Text style={styles.empty}>No hay cheques guardados</Text>
      ) : (
        checks.map((check) => (
          <View key={check.id} style={styles.cardRow}>
            <Ionicons name="document-text-outline" size={22} color={Colors.accent} />
            <Text style={styles.cardMask}>Cheque {check.checkNumber}</Text>
          </View>
        ))
      )}
    </ProfileScreenShell>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionGap: {
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  addLink: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.md,
    color: Colors.linkBlue,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Layout.inputBackground,
    borderRadius: Layout.profileRowRadius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    gap: 12,
  },
  cardMask: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  empty: {
    fontFamily: Fonts.body,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    paddingVertical: 8,
  },
});
