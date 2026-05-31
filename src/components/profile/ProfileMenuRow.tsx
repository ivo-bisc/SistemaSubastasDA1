import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize, Layout } from '../../constants';

type Props = {
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
};

export default function ProfileMenuRow({
  label,
  value,
  onPress,
  showChevron = true,
}: Props) {
  const content = (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.right}>
        {value ? <Text style={styles.value}>{value}</Text> : null}
        {showChevron && onPress ? (
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        ) : null}
      </View>
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Layout.inputBackground,
    borderRadius: Layout.profileRowRadius,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    fontFamily: Fonts.body,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
