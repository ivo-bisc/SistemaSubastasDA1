import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Colors, Fonts, FontSize, Layout } from '../../constants';

type Props = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
};

export default function BidUpTextField({
  containerStyle,
  placeholderTextColor = Colors.textSecondary,
  style,
  ...props
}: Props) {
  return (
    <View style={[styles.wrap, containerStyle]}>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={placeholderTextColor}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
  },
  input: {
    minHeight: Layout.inputMinHeight,
    borderRadius: Layout.inputBorderRadius,
    backgroundColor: Layout.inputBackground,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: Fonts.input,
    fontSize: FontSize.base,
    color: Colors.black,
  },
});
