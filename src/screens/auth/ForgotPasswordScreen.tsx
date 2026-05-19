import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  AuthScreen,
  AuthTitle,
  BackButton,
  BidUpTextField,
  PrimaryButton,
} from '../../components/auth';
import { Colors, Fonts, FontSize } from '../../constants';
import type { AuthStackParamList } from '../../types';

type Nav = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState('');

  return (
    <AuthScreen>
      <BackButton onPress={() => navigation.goBack()} />
      <AuthTitle>Recupero de contraseña</AuthTitle>
      <Text style={styles.subtitle}>
        Introducí tu dirección de correo electrónico
      </Text>

      <BidUpTextField
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <PrimaryButton
        label="Continuar"
        onPress={() => navigation.navigate('ForgotPasswordSent')}
        style={styles.button}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.black,
    marginTop: -12,
    marginBottom: 20,
  },
  button: {
    marginTop: 8,
  },
});
