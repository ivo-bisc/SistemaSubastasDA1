import React, { useState, useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
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
  const [touched, setTouched] = useState({
    nombre: false,
    apellido: false,
    email: false,
    password: false,
  });

  // Validation rules
  const nameRegex = useMemo(() => /^[A-Za-zÁÉÍÓÚáéíóúÑñ]{3,}$/, []);
  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);
  const passwordRegex = useMemo(() => /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}/, []);

  const nombreValid = nameRegex.test(nombre);
  const apellidoValid = nameRegex.test(apellido);
  const emailValid = emailRegex.test(email);
  const passwordValid = passwordRegex.test(password);

  const isFormValid = nombreValid && apellidoValid && emailValid && passwordValid;

  return (
    <AuthScreen>
      <BackButton onPress={() => navigation.goBack()} />
      <AuthTitle>Creá tu cuenta</AuthTitle>
      <StepLabel step={1} total={3} />

      <BidUpTextField
        placeholder="Nombre"
        value={nombre}
        onChangeText={(v) => {
          setNombre(v);
        }}
        onBlur={() => setTouched((s) => ({ ...s, nombre: true }))}
      />
      {touched.nombre && !nombreValid ? (
        <Text style={{ color: '#FF3B30', marginBottom: 8 }}>
          Nombre inválido. Mínimo 3 letras, sólo letras.
        </Text>
      ) : null}
      <BidUpTextField
        placeholder="Apellido"
        value={apellido}
        onChangeText={(v) => setApellido(v)}
        onBlur={() => setTouched((s) => ({ ...s, apellido: true }))}
      />
      {touched.apellido && !apellidoValid ? (
        <Text style={{ color: '#FF3B30', marginBottom: 8 }}>
          Apellido inválido. Mínimo 3 letras, sólo letras.
        </Text>
      ) : null}
      <BidUpTextField
        placeholder="Correo electrónico"
        value={email}
        onChangeText={(v) => setEmail(v)}
        keyboardType="email-address"
        autoCapitalize="none"
        onBlur={() => setTouched((s) => ({ ...s, email: true }))}
      />
      {touched.email && !emailValid ? (
        <Text style={{ color: '#FF3B30', marginBottom: 8 }}>
          Ingrese un correo válido (ejemplo@dominio.com).
        </Text>
      ) : null}
      <BidUpTextField
        placeholder="Contraseña"
        value={password}
        onChangeText={(v) => setPassword(v)}
        secureTextEntry
        onBlur={() => setTouched((s) => ({ ...s, password: true }))}
      />
      {touched.password && !passwordValid ? (
        <Text style={{ color: '#FF3B30', marginBottom: 8 }}>
          Contraseña inválida. Mínimo 8 caracteres, debe incluir número, mayúscula y minúscula.
        </Text>
      ) : null}

      <PrimaryButton
        label="Continuar"
        onPress={() => {
          // mark all touched to show errors if any
          setTouched({ nombre: true, apellido: true, email: true, password: true });
          if (isFormValid) navigation.navigate('RegisterStep2', { nombre, apellido, email, password });
        }}
        style={styles.button}
        disabled={!isFormValid}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
  },
});
