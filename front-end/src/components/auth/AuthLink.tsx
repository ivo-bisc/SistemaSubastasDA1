import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextStyle } from 'react-native';
import { Colors, Fonts, FontSize } from '../../constants';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  bold?: boolean;
  style?: TextStyle;
};

export default function AuthLink({ children, onPress, bold, style }: Props) {
  const content = (
    <Text style={[styles.text, bold && styles.bold, style]}>{children}</Text>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} hitSlop={6}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.link,
  },
  bold: {
    fontFamily: Fonts.bodyBold,
    color: Colors.black,
    fontSize: FontSize.base,
  },
});
