import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { paymentService } from '../../services';
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
  const [touched, setTouched] = useState({
    cardNumber: false,
    securityCode: false,
    expiration: false,
    cardName: false,
  });

  const onlyDigits = (s: string) => s.replace(/\D/g, '');

  // Validation
  const cardNumberValid = useMemo(() => onlyDigits(cardNumber).length === 16, [cardNumber]);
  const securityValid = useMemo(() => /^[0-9]{3,4}$/.test(securityCode), [securityCode]);
  const expirationValid = useMemo(() => {
    const m = expiration.match(/^(0[1-9]|1[0-2])\/(\d{4})$/);
    if (!m) return false;
    const month = parseInt(m[1], 10);
    const year = parseInt(m[2], 10);
    const now = new Date();
    const expDate = new Date(year, month - 1, 1);
    // Reject unrealistic future years
    if (year > 2040) return false;
    // Accept current month or future
    return expDate >= new Date(now.getFullYear(), now.getMonth(), 1);
  }, [expiration]);
  const cardNameValid = useMemo(() => {
    // allow letters and spaces, require at least 6 letters (excluding spaces)
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(cardName)) return false;
    const lettersOnly = cardName.replace(/\s+/g, '');
    return lettersOnly.length >= 6;
  }, [cardName]);

  const formValid = cardNumberValid && securityValid && expirationValid && cardNameValid;
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  return (
    <AuthScreen>
      <BackButton onPress={() => navigation.goBack()} />
      <AuthTitle>Creá tu cuenta</AuthTitle>
      <StepLabel step={3} total={3} />

      <BidUpTextField
        placeholder="Número de tarjeta"
        value={cardNumber}
        onChangeText={(v) => setCardNumber(onlyDigits(v).slice(0, 16))}
        keyboardType="numeric"
        onBlur={() => setTouched((s) => ({ ...s, cardNumber: true }))}
      />
      {touched.cardNumber && !cardNumberValid ? (
        <Text style={{ color: '#FF3B30', marginBottom: 8 }}>El número debe tener 16 dígitos.</Text>
      ) : null}

      <View style={styles.row}>
        <BidUpTextField
          placeholder="Código de seguridad"
          value={securityCode}
          onChangeText={(v) => setSecurityCode(onlyDigits(v).slice(0, 4))}
          keyboardType="numeric"
          containerStyle={[styles.half, styles.halfLeft]}
          onBlur={() => setTouched((s) => ({ ...s, securityCode: true }))}
        />
        {touched.securityCode && !securityValid ? (
          <Text style={{ color: '#FF3B30', marginBottom: 8 }}>Código inválido. 3 o 4 dígitos.</Text>
        ) : null}
        <BidUpTextField
          placeholder="Expiración (MM/AAAA)"
          value={expiration}
          onChangeText={(v) => {
            // format MM/YYYY while typing
            const digits = onlyDigits(v).slice(0, 6); // MMYYYY
            if (digits.length <= 2) setExpiration(digits);
            else setExpiration(digits.slice(0, 2) + '/' + digits.slice(2));
          }}
          containerStyle={[styles.half, styles.halfRight]}
          onBlur={() => setTouched((s) => ({ ...s, expiration: true }))}
        />
        {touched.expiration && !expirationValid ? (
          <Text style={{ color: '#FF3B30', marginBottom: 8 }}>
            Formato inválido. Use MM/AAAA, mes entre 01 y 12, año ≤ 2040 y no vencida.
          </Text>
        ) : null}
      </View>

      <BidUpTextField
        placeholder="Nombre en la tarjeta"
        value={cardName}
        onChangeText={(v) => setCardName(v)}
        onBlur={() => setTouched((s) => ({ ...s, cardName: true }))}
      />
      {touched.cardName && !cardNameValid ? (
        <Text style={{ color: '#FF3B30', marginBottom: 8 }}>
          Nombre inválido. Sólo letras y mínimo 6 caracteres.
        </Text>
      ) : null}

      <AuthLink bold onPress={() => navigation.navigate('PendingApproval')}>
        Más tarde
      </AuthLink>

      {apiError ? (
        <Text style={{ color: '#FF3B30', marginBottom: 8 }}>{apiError}</Text>
      ) : null}

      <PrimaryButton
        label="Continuar"
        onPress={async () => {
          setTouched({ cardNumber: true, securityCode: true, expiration: true, cardName: true });
          if (!formValid) return;
          setLoading(true);
          setApiError(null);
          try {
            await paymentService.addPaymentMethod({
              tipo: 'TARJETA_CREDITO',
              alias: cardName,
              moneda: 'ARS',
              numeroTarjeta: cardNumber,
              titular: cardName,
              vencimiento: expiration,
              tipoTarjeta: 'CREDITO',
            });
            navigation.navigate('PendingApproval');
          } catch {
            setApiError('No se pudo registrar la tarjeta. Intentá de nuevo.');
          } finally {
            setLoading(false);
          }
        }}
        style={styles.button}
        disabled={!formValid || loading}
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
