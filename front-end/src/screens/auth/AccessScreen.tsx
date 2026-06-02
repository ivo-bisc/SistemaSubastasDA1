import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  PrimaryButton,
  SecondaryButton,
  WelcomeBranding,
} from '../../components/auth';
import { useAuthStore } from '../../stores';
import { Colors, Fonts, FontSize, Layout } from '../../constants';
import type { AuthStackParamList } from '../../types';

type Nav = StackNavigationProp<AuthStackParamList, 'Access'>;

export default function AccessScreen() {
  const navigation = useNavigation<Nav>();
  const setGuest = useAuthStore((s) => s.setGuest);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.inner}>
        <WelcomeBranding compact style={styles.branding} />
        <View style={styles.actions}>
          <PrimaryButton
            label="Iniciar sesión"
            onPress={() => navigation.navigate('Login')}
            pill
          />
          <SecondaryButton
            label="Registrarse"
            onPress={() => navigation.navigate('RegisterStep1')}
            style={styles.secondaryBtn}
          />
          <Pressable onPress={setGuest} hitSlop={8} style={styles.guestWrap}>
            <Text style={styles.guest}>Ingresar como invitado</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.authBackground,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  branding: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 24,
  },
  actions: {
    paddingBottom: 8,
  },
  secondaryBtn: {
    marginTop: 14,
  },
  guestWrap: {
    marginTop: 28,
    alignItems: 'center',
  },
  guest: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.white,
    textDecorationLine: 'underline',
  },
});
