import React, { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { CreditCardFields, PrimaryButton } from '../../components/auth';
import { ProfileHeaderBar, ProfileScreenShell } from '../../components/profile';
import { useProfileStore } from '../../stores';
import type { ProfileStackParamList } from '../../types';
import {
  ALL_CARD_TOUCHED,
  buildCardMedioPagoRequest,
  EMPTY_CARD_TOUCHED,
  isCreditCardFormValid,
  type CreditCardTouched,
} from '../../utils/cardForm';

type Nav = StackNavigationProp<ProfileStackParamList, 'AddCard'>;

export default function AddCardScreen() {
  const navigation = useNavigation<Nav>();
  const addCardViaApi = useProfileStore((s) => s.addCardViaApi);
  const loadProfile = useProfileStore((s) => s.loadProfile);

  const [cardNumber, setCardNumber] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [expiration, setExpiration] = useState('');
  const [holderName, setHolderName] = useState('');
  const [touched, setTouched] = useState<CreditCardTouched>(EMPTY_CARD_TOUCHED);
  const [loading, setLoading] = useState(false);

  const formValid = useMemo(
    () => isCreditCardFormValid(cardNumber, securityCode, expiration, holderName),
    [cardNumber, securityCode, expiration, holderName]
  );

  const handleBlur = (field: keyof CreditCardTouched) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const handleConfirm = async () => {
    setTouched(ALL_CARD_TOUCHED);
    if (!formValid) return;

    setLoading(true);
    try {
      await addCardViaApi(buildCardMedioPagoRequest(cardNumber, holderName, expiration));
      await loadProfile();
      navigation.goBack();
    } catch {
      Alert.alert('Tarjeta', 'No se pudo registrar la tarjeta. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileScreenShell
      footer={
        <PrimaryButton
          label="Confirmar"
          onPress={handleConfirm}
          disabled={!formValid || loading}
        />
      }
    >
      <ProfileHeaderBar title="Añadir tarjeta" onBack={() => navigation.goBack()} />

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
    </ProfileScreenShell>
  );
}
