import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  AuthScreen,
  BrandMark,
  EmailSentIllustration,
  PrimaryButton,
} from '../../components/auth';
import { Colors, Fonts, FontSize } from '../../constants';
import type { AuthStackParamList } from '../../types';

type Nav = StackNavigationProp<AuthStackParamList, 'ForgotPasswordSent'>;

export default function ForgotPasswordSentScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <AuthScreen contentStyle={styles.content}>
      <BrandMark />
      <EmailSentIllustration />
      <Text style={styles.message}>
        Te enviamos un email para restablecer tu contraseña
      </Text>
      <PrimaryButton
        label="Volver al inicio de sesión"
        onPress={() => navigation.navigate('Login')}
        style={styles.button}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
  },
  message: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.base,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  button: {
    marginTop: 'auto',
  },
});
