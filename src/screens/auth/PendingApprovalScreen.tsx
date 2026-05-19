import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, FontSize } from '../../constants';

export default function PendingApprovalScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Todo listo</Text>
        <Text style={styles.subtitle}>
          Aguardá mientras verificamos los datos
        </Text>
        <Text style={styles.hourglass}>⏳</Text>
      </View>
      <View style={styles.homeIndicator} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontFamily: Fonts.title,
    fontSize: FontSize.xxxl,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 48,
  },
  hourglass: {
    fontSize: 120,
    lineHeight: 140,
  },
  homeIndicator: {
    alignSelf: 'center',
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.black,
    marginBottom: 8,
    opacity: 0.2,
  },
});
