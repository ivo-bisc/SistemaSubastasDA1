import React, { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { paymentService } from '../../services';
import { useAuthStore } from '../../stores';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  AuthLink,
  AuthScreen,
  AuthTitle,
  BackButton,
  CreditCardFields,
  PrimaryButton,
  StepLabel,
} from '../../components/auth';
import type { AuthStackParamList } from '../../types';
import {
  ALL_CARD_TOUCHED,
  buildCardMedioPagoRequest,
  EMPTY_CARD_TOUCHED,
  isCreditCardFormValid,
  type CreditCardTouched,
} from '../../utils/cardForm';

type Nav = StackNavigationProp<AuthStackParamList, 'RegisterStep3'>;

export default function RegisterStep3Screen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const { tokenAcceso, usuarioId, nombre, apellido, email, dni } = route.params as {
    tokenAcceso: string; usuarioId: number; nombre: string; apellido: string; email: string; dni: string;
  };
  const login = useAuthStore((s) => s.login);

  const doLogin = () => login(
    { id: String(usuarioId), email, firstName: nombre, lastName: apellido, dni, status: 'pending', role: 'POSTOR' },
    tokenAcceso
  );
  const [cardNumber, setCardNumber] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [expiration, setExpiration] = useState('');
  const [holderName, setHolderName] = useState('');
  const [touched, setTouched] = useState<CreditCardTouched>(EMPTY_CARD_TOUCHED);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const formValid = useMemo(
    () => isCreditCardFormValid(cardNumber, securityCode, expiration, holderName),
    [cardNumber, securityCode, expiration, holderName]
  );

  const handleBlur = (field: keyof CreditCardTouched) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  return (
    <AuthScreen>
      <BackButton onPress={() => navigation.goBack()} />
      <AuthTitle>Creá tu cuenta</AuthTitle>
      <StepLabel step={3} total={3} />

      <CreditCardFields
        cardNumber={cardNumber}
        securityCode={securityCode}
        expiration={expiration}
        holderName={holderName}
        onCardNumberChange={setCardNumber}
        onSecurityCodeChange={setSecurityCode}
        onExpirationChange={setExpiration}
        onHolderNameChange={setHolderName}
        touched={touched}
        onBlur={handleBlur}
      />

      <AuthLink bold onPress={() => { doLogin(); }}>
        Más tarde
      </AuthLink>

      {apiError ? <Text style={styles.error}>{apiError}</Text> : null}

      <PrimaryButton
        label="Continuar"
        onPress={async () => {
          setTouched(ALL_CARD_TOUCHED);
          if (!formValid) return;

          setLoading(true);
          setApiError(null);
          try {
            await paymentService.addPaymentMethod(
              buildCardMedioPagoRequest(cardNumber, holderName, expiration)
            );
            doLogin();
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
  button: {
    marginTop: 16,
  },
  error: {
    color: '#FF3B30',
    marginBottom: 8,
  },
});
