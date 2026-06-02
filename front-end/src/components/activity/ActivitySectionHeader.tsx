import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Fonts, FontSize } from '../../constants';

type Props = {
  title: string;
};

export default function ActivitySectionHeader({ title }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.underline} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  title: {
    fontFamily: Fonts.title,
    fontSize: FontSize.category,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 6,
  },
  underline: {
    width: 120,
    height: 3,
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
});
