import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  AuthLink,
  AuthScreen,
  AuthTitle,
  BackButton,
  BidUpTextField,
  PrimaryButton,
  StepLabel,
} from '../../components/auth';
import type { AuthStackParamList } from '../../types';

type Nav = StackNavigationProp<AuthStackParamList, 'RegisterStep3'>;

export default function RegisterStep3Screen() {
  const navigation = useNavigation<Nav>();
  const [cardNumber, setCardNumber] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [expiration, setExpiration] = useState('');
  const [cardName, setCardName] = useState('');

  return (
    <AuthScreen>
      <BackButton onPress={() => navigation.goBack()} />
      <AuthTitle>Creá tu cuenta</AuthTitle>
      <StepLabel step={3} total={3} />

      <BidUpTextField
        placeholder="Número de tarjeta"
        value={cardNumber}
        onChangeText={setCardNumber}
        keyboardType="numeric"
      />

      <View style={styles.row}>
        <BidUpTextField
          placeholder="Código de seguridad"
          value={securityCode}
          onChangeText={setSecurityCode}
          keyboardType="numeric"
          containerStyle={[styles.half, styles.halfLeft]}
        />
        <BidUpTextField
          placeholder="Expiración"
          value={expiration}
          onChangeText={setExpiration}
          containerStyle={[styles.half, styles.halfRight]}
        />
      </View>

      <BidUpTextField
        placeholder="Nombre en la tarjeta"
        value={cardName}
        onChangeText={setCardName}
      />

      <AuthLink bold onPress={() => navigation.navigate('PendingApproval')}>
        Más tarde
      </AuthLink>

      <PrimaryButton
        label="Continuar"
        onPress={() => navigation.navigate('PendingApproval')}
        style={styles.button}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  half: {
    flex: 1,
    marginBottom: 12,
  },
  halfLeft: {
    marginRight: 6,
  },
  halfRight: {
    marginLeft: 6,
  },
  button: {
    marginTop: 16,
  },
});
