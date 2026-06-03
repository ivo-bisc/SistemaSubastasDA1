import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { BidUpTextField, PrimaryButton } from '../../components/auth';
import { ProfileHeaderBar, ProfileScreenShell } from '../../components/profile';
import { useProfileStore } from '../../stores';
import type { ProfileStackParamList } from '../../types';

type Nav = StackNavigationProp<ProfileStackParamList, 'AddAddress'>;

export default function AddAddressScreen() {
  const navigation = useNavigation<Nav>();
  const currentAddress = useProfileStore((s) => s.address);
  const updateAddress = useProfileStore((s) => s.updateAddress);

  const [value, setValue] = useState(currentAddress);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!value.trim()) {
      Alert.alert('Domicilio', 'Ingresá tu domicilio legal.');
      return;
    }
    setSaving(true);
    try {
      await updateAddress(value.trim());
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el domicilio. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProfileScreenShell
      footer={
        <PrimaryButton
          label={saving ? 'Guardando…' : 'Confirmar'}
          onPress={handleConfirm}
          disabled={saving}
        />
      }
    >
      <ProfileHeaderBar title="Editar domicilio" onBack={() => navigation.goBack()} />
      <BidUpTextField
        placeholder="Domicilio legal (ej: Av. Corrientes 1234, CABA)"
        value={value}
        onChangeText={setValue}
      />
    </ProfileScreenShell>
  );
}
