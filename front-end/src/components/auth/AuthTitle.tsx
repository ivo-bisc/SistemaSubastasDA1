import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { Colors, FontSize, Fonts } from '../../constants';

type Props = {
  children: string;
  style?: TextStyle;
};

export default function AuthTitle({ children, style }: Props) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontFamily: Fonts.title,
    fontSize: FontSize.xxxl,
    color: Colors.black,
    marginBottom: 24,
  },
});
