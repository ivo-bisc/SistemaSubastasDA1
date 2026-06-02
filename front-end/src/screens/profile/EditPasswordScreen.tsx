import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { BidUpTextField, PrimaryButton } from '../../components/auth';
import { ProfileHeaderBar, ProfileScreenShell } from '../../components/profile';
import { useProfileStore } from '../../stores';
import type { ProfileStackParamList } from '../../types';

type Nav = StackNavigationProp<ProfileStackParamList, 'EditPassword'>;

export default function EditPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const setPassword = useProfileStore((s) => s.setPassword);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Contraseña', 'La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Contraseña', 'Las contraseñas no coinciden.');
      return;
    }
    setPassword(newPassword);
    Alert.alert('Listo', 'Tu contraseña fue actualizada.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <ProfileScreenShell
      footer={<PrimaryButton label="Guardar" onPress={handleSave} />}
    >
      <ProfileHeaderBar title="Contraseña" onBack={() => navigation.goBack()} />
      <BidUpTextField
        placeholder="Contraseña actual"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
        containerStyle={styles.field}
      />
      <BidUpTextField
        placeholder="Nueva contraseña"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        containerStyle={styles.field}
      />
      <BidUpTextField
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        containerStyle={styles.field}
      />
    </ProfileScreenShell>
  );
}

const styles = StyleSheet.create({
  field: {
    marginTop: 4,
  },
});
