import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Layout } from '../../constants';

type Props = {
  onPress: () => void;
};

export default function BackButton({ onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
      hitSlop={8}
    >
      <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: Layout.backButtonSize,
    height: Layout.backButtonSize,
    borderRadius: Layout.backButtonSize / 2,
    backgroundColor: Layout.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pressed: {
    opacity: 0.7,
  },
});
