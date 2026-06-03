import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BidUpTextField from './BidUpTextField';
import {
  type CreditCardTouched,
  formatCardNumberInput,
  formatExpirationInput,
  formatSecurityCodeInput,
  isCardNumberValid,
  isExpirationValid,
  isHolderNameValid,
  isSecurityCodeValid,
} from '../../utils/cardForm';

type Props = {
  cardNumber: string;
  securityCode: string;
  expiration: string;
  holderName: string;
  onCardNumberChange: (value: string) => void;
  onSecurityCodeChange: (value: string) => void;
  onExpirationChange: (value: string) => void;
  onHolderNameChange: (value: string) => void;
  touched: CreditCardTouched;
  onBlur: (field: keyof CreditCardTouched) => void;
};

export default function CreditCardFields({
  cardNumber,
  securityCode,
  expiration,
  holderName,
  onCardNumberChange,
  onSecurityCodeChange,
  onExpirationChange,
  onHolderNameChange,
  touched,
  onBlur,
}: Props) {
  const cardNumberValid = useMemo(() => isCardNumberValid(cardNumber), [cardNumber]);
  const securityValid = useMemo(() => isSecurityCodeValid(securityCode), [securityCode]);
  const expirationValid = useMemo(() => isExpirationValid(expiration), [expiration]);
  const holderNameValid = useMemo(() => isHolderNameValid(holderName), [holderName]);

  return (
    <>
      <BidUpTextField
        placeholder="Número de tarjeta"
        value={cardNumber}
        onChangeText={(value) => onCardNumberChange(formatCardNumberInput(value))}
        keyboardType="numeric"
        onBlur={() => onBlur('cardNumber')}
      />
      {touched.cardNumber && !cardNumberValid ? (
        <Text style={styles.error}>El número debe tener 16 dígitos.</Text>
      ) : null}

      <View style={styles.row}>
        <View style={styles.half}>
          <BidUpTextField
            placeholder="Código de seguridad"
            value={securityCode}
            onChangeText={(value) => onSecurityCodeChange(formatSecurityCodeInput(value))}
            keyboardType="numeric"
            secureTextEntry
            onBlur={() => onBlur('securityCode')}
          />
          {touched.securityCode && !securityValid ? (
            <Text style={styles.error}>Código inválido. 3 o 4 dígitos.</Text>
          ) : null}
        </View>

        <View style={styles.half}>
          <BidUpTextField
            placeholder="Expiración (MM/AAAA)"
            value={expiration}
            onChangeText={(value) => onExpirationChange(formatExpirationInput(value))}
            onBlur={() => onBlur('expiration')}
          />
          {touched.expiration && !expirationValid ? (
            <Text style={styles.error}>
              Formato inválido. Use MM/AAAA, mes entre 01 y 12, año ≤ 2040 y no vencida.
            </Text>
          ) : null}
        </View>
      </View>

      <BidUpTextField
        placeholder="Nombre en la tarjeta"
        value={holderName}
        onChangeText={onHolderNameChange}
        onBlur={() => onBlur('holderName')}
      />
      {touched.holderName && !holderNameValid ? (
        <Text style={styles.error}>Nombre inválido. Sólo letras y mínimo 6 caracteres.</Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
  },
  error: {
    color: '#FF3B30',
    marginTop: -4,
    marginBottom: 8,
  },
});
