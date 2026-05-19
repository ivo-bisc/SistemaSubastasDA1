import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  AuthScreen,
  AuthTitle,
  BackButton,
  BidUpTextField,
  CheckboxRow,
  PrimaryButton,
  StepLabel,
} from '../../components/auth';
import type { AuthStackParamList } from '../../types';

type Nav = StackNavigationProp<AuthStackParamList, 'RegisterStep2'>;

export default function RegisterStep2Screen() {
  const navigation = useNavigation<Nav>();
  const [tipoDoc, setTipoDoc] = useState('');
  const [numeroDoc, setNumeroDoc] = useState('');
  const [pais, setPais] = useState('');
  const [direccion, setDireccion] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  return (
    <AuthScreen>
      <BackButton onPress={() => navigation.goBack()} />
      <AuthTitle>Creá tu cuenta</AuthTitle>
      <StepLabel step={2} total={3} />

      <BidUpTextField
        placeholder="Tipo de documento"
        value={tipoDoc}
        onChangeText={setTipoDoc}
      />
      <BidUpTextField
        placeholder="Número de documento"
        value={numeroDoc}
        onChangeText={setNumeroDoc}
        keyboardType="numeric"
      />
      <BidUpTextField placeholder="País" value={pais} onChangeText={setPais} />
      <BidUpTextField
        placeholder="Dirección"
        value={direccion}
        onChangeText={setDireccion}
      />
      <BidUpTextField
        placeholder="Código postal"
        value={codigoPostal}
        onChangeText={setCodigoPostal}
        keyboardType="numeric"
      />

      <CheckboxRow
        label="Acepto los términos y condiciones"
        checked={termsAccepted}
        onToggle={() => setTermsAccepted((v) => !v)}
      />

      <PrimaryButton
        label="Continuar"
        onPress={() => navigation.navigate('RegisterStep3')}
        disabled={!termsAccepted}
        style={styles.button}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 4,
  },
});
