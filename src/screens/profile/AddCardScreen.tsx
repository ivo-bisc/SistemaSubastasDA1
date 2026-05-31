import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { BidUpTextField, PrimaryButton } from '../../components/auth';
import { ProfileHeaderBar, ProfileScreenShell } from '../../components/profile';
import { useProfileStore } from '../../stores';
import type { ProfileStackParamList } from '../../types';

type Nav = StackNavigationProp<ProfileStackParamList, 'AddCard'>;

export default function AddCardScreen() {
  const navigation = useNavigation<Nav>();
  const addCard = useProfileStore((s) => s.addCard);

  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiry, setExpiry] = useState('');
  const [holderName, setHolderName] = useState('');

  const handleConfirm = () => {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 4 || !holderName.trim()) {
      Alert.alert('Tarjeta', 'Completá los datos de la tarjeta.');
      return;
    }
    addCard({
      last4: digits.slice(-4),
      brand: digits.startsWith('4') ? 'visa' : 'mastercard',
      holderName: holderName.trim(),
    });
    navigation.goBack();
  };

  return (
    <ProfileScreenShell
      footer={<PrimaryButton label="Confirmar" onPress={handleConfirm} />}
    >
      <ProfileHeaderBar title="Añadir tarjeta" onBack={() => navigation.goBack()} />

      <BidUpTextField
        placeholder="Número de tarjeta"
        value={cardNumber}
        onChangeText={setCardNumber}
        keyboardType="numeric"
      />

      <View style={styles.row}>
        <BidUpTextField
          placeholder="Código de seguridad"
          value={cvv}
          onChangeText={setCvv}
          containerStyle={styles.half}
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
        />
        <BidUpTextField
          placeholder="Expiración"
          value={expiry}
          onChangeText={setExpiry}
          containerStyle={styles.half}
          placeholderTextColor="#8E8E93"
        />
      </View>

      <BidUpTextField
        placeholder="Nombre en la tarjeta"
        value={holderName}
        onChangeText={setHolderName}
      />
    </ProfileScreenShell>
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
});
