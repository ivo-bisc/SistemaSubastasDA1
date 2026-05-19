import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  AuthLink,
  AuthScreen,
  AuthTitle,
  BidUpTextField,
  BrandMark,
  PrimaryButton,
} from '../../components/auth';
import { Colors, Fonts, FontSize } from '../../constants';
import { useAuthStore } from '../../stores';
import type { AuthStackParamList } from '../../types';

type Nav = StackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleContinue = () => {
    login(
      {
        id: '1',
        email: username || 'user@bidup.com',
        firstName: 'Usuario',
        lastName: 'Demo',
        dni: '',
        status: 'approved',
      },
      'demo-token'
    );
  };

  return (
    <AuthScreen
      footer={
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tenés una cuenta? </Text>
          <AuthLink onPress={() => navigation.navigate('RegisterStep1')}>
            Registrate
          </AuthLink>
        </View>
      }
    >
      <BrandMark />
      <AuthTitle>Iniciar sesión</AuthTitle>

      <BidUpTextField
        placeholder="Usuario"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <BidUpTextField
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.recoverRow}>
        <Text style={styles.recoverPrefix}>¿Olvidaste tu contraseña? </Text>
        <AuthLink onPress={() => navigation.navigate('ForgotPassword')}>
          Recuperar
        </AuthLink>
      </View>

      <View style={styles.spacer} />
      <PrimaryButton label="Continuar" onPress={handleContinue} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  recoverRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  recoverPrefix: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.black,
  },
  spacer: {
    flex: 1,
    minHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.black,
  },
});
