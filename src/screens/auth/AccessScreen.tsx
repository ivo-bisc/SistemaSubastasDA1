import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  AuthLink,
  AuthScreen,
  AuthTitle,
  BrandMark,
  PrimaryButton,
} from '../../components/auth';
import { useAuthStore } from '../../stores';
import type { AuthStackParamList } from '../../types';

type Nav = StackNavigationProp<AuthStackParamList, 'Access'>;

export default function AccessScreen() {
  const navigation = useNavigation<Nav>();
  const setGuest = useAuthStore((s) => s.setGuest);

  return (
    <AuthScreen contentStyle={styles.content}>
      <BrandMark />
      <AuthTitle>BidUp</AuthTitle>
      <View style={styles.actions}>
        <PrimaryButton
          label="Iniciar sesión"
          onPress={() => navigation.navigate('Login')}
        />
        <PrimaryButton
          label="Registrarse"
          onPress={() => navigation.navigate('RegisterStep1')}
          style={styles.secondary}
        />
        <AuthLink onPress={setGuest} bold style={styles.guest}>
          Ingresar como invitado
        </AuthLink>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  actions: {
    marginTop: 8,
  },
  secondary: {
    marginTop: 12,
  },
  guest: {
    textAlign: 'center',
    marginTop: 24,
  },
});
