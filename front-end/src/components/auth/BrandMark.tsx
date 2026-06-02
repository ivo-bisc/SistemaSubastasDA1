import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';

type Props = {
  size?: number;
  style?: ViewStyle;
};

export default function BrandMark({ size = 120, style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={require('../../assets/logo.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
        accessibilityLabel="BidUp"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
