import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants';
import { hasImageUrl, resolveImageUrl } from '../../utils/media';

type Props = {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  iconSize?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
};

export default function RemoteImage({
  uri,
  style,
  containerStyle,
  iconSize = 32,
  resizeMode = 'cover',
}: Props) {
  const resolved = resolveImageUrl(uri);

  if (!hasImageUrl(resolved)) {
    return (
      <View style={[styles.placeholder, containerStyle, style as ViewStyle]}>
        <Ionicons name="image-outline" size={iconSize} color={Colors.cardTime} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: resolved }}
      style={[style, containerStyle]}
      resizeMode={resizeMode}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
