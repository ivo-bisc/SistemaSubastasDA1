import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { BidUpTextField, PrimaryButton } from '../../components/auth';
import { ProfileHeaderBar, ProfileScreenShell } from '../../components/profile';
import { useProfileStore } from '../../stores';
import type { ProfileStackParamList } from '../../types';

type Nav = StackNavigationProp<ProfileStackParamList, 'EditUsername'>;

export default function EditUsernameScreen() {
  const navigation = useNavigation<Nav>();
  const current = useProfileStore((s) => s.username);
  const setUsername = useProfileStore((s) => s.setUsername);
  const [username, setLocal] = useState(current);

  const handleSave = () => {
    const trimmed = username.trim();
    if (!trimmed) {
      Alert.alert('Nombre de usuario', 'Ingresá un nombre de usuario válido.');
      return;
    }
    setUsername(trimmed);
    navigation.goBack();
  };

  return (
    <ProfileScreenShell
      footer={<PrimaryButton label="Guardar" onPress={handleSave} />}
    >
      <ProfileHeaderBar
        title="Nombre de usuario"
        onBack={() => navigation.goBack()}
      />
      <BidUpTextField
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={setLocal}
        autoCapitalize="none"
        containerStyle={styles.field}
      />
    </ProfileScreenShell>
  );
}

const styles = StyleSheet.create({
  field: {
    marginTop: 8,
  },
});
