import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize } from '../../constants';

type Props = {
  title: string;
  onBack?: () => void;
  rightAction?: ReactNode;
};

export default function ProfileHeaderBar({ title, onBack, rightAction }: Props) {
  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={8} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={Colors.textSecondary} />
        </Pressable>
      ) : (
        <View style={styles.backPlaceholder} />
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{rightAction ?? <View style={styles.backPlaceholder} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 40,
  },
  back: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 40,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.title,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  right: {
    width: 72,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
