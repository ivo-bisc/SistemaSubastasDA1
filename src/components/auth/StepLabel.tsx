import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Colors, Fonts, FontSize } from '../../constants';

type Props = {
  step: number;
  total: number;
};

export default function StepLabel({ step, total }: Props) {
  return (
    <Text style={styles.label}>
      Paso {step}/{total}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
});
