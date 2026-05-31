import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import BrandMark from './BrandMark';
import { Colors, Fonts, FontSize } from '../../constants';

type Props = {
  compact?: boolean;
  style?: ViewStyle;
};

export default function WelcomeBranding({ compact, style }: Props) {
  return (
    <View style={[styles.wrap, compact && styles.compact, style]}>
      <BrandMark size={compact ? 110 : 140} />
      <Text style={styles.title}>BidUp</Text>
      <Text style={styles.slogan}>Descubrí. Ofrecé. Ganá.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  compact: {
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.title,
    fontSize: FontSize.xxxl,
    color: Colors.white,
    marginTop: 12,
  },
  slogan: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.white,
    marginTop: 8,
    textAlign: 'center',
  },
});
