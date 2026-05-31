import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { Colors, Fonts, FontSize, Layout } from '../../constants';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export default function SecondaryButton({
  label,
  onPress,
  disabled,
  loading,
  style,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={Colors.accent} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: Layout.buttonHeight,
    borderRadius: Layout.pillBorderRadius,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.base,
    color: Colors.accent,
  },
});
