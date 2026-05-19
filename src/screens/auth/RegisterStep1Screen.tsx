import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  AuthScreen,
  AuthTitle,
  BackButton,
  BidUpTextField,
  PrimaryButton,
  StepLabel,
} from '../../components/auth';
import type { AuthStackParamList } from '../../types';

type Nav = StackNavigationProp<AuthStackParamList, 'RegisterStep1'>;

export default function RegisterStep1Screen() {
  const navigation = useNavigation<Nav>();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthScreen>
      <BackButton onPress={() => navigation.goBack()} />
      <AuthTitle>Creá tu cuenta</AuthTitle>
      <StepLabel step={1} total={3} />

      <BidUpTextField placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <BidUpTextField
        placeholder="Apellido"
        value={apellido}
        onChangeText={setApellido}
      />
      <BidUpTextField
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <BidUpTextField
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <PrimaryButton
        label="Continuar"
        onPress={() => navigation.navigate('RegisterStep2')}
        style={styles.button}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
  },
});
