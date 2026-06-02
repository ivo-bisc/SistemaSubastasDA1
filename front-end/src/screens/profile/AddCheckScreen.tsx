import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { BidUpTextField, PrimaryButton } from '../../components/auth';
import { ProfileHeaderBar, ProfileScreenShell } from '../../components/profile';
import { useProfileStore } from '../../stores';
import type { ProfileStackParamList } from '../../types';

type Nav = StackNavigationProp<ProfileStackParamList, 'AddCheck'>;

export default function AddCheckScreen() {
  const navigation = useNavigation<Nav>();
  const addCheck = useProfileStore((s) => s.addCheck);

  const [checkNumber, setCheckNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [cuit, setCuit] = useState('');
  const [drawer, setDrawer] = useState('');

  const handleConfirm = () => {
    if (!checkNumber.trim() || !bankName.trim() || !drawer.trim()) {
      Alert.alert('Cheque', 'Completá los campos obligatorios.');
      return;
    }
    addCheck({
      checkNumber: checkNumber.trim(),
      bankName: bankName.trim(),
      issueDate: issueDate.trim(),
      cuit: cuit.trim(),
      drawer: drawer.trim(),
    });
    navigation.goBack();
  };

  return (
    <ProfileScreenShell
      footer={<PrimaryButton label="Confirmar" onPress={handleConfirm} />}
    >
      <ProfileHeaderBar title="Agregar Cheque" onBack={() => navigation.goBack()} />

      <BidUpTextField
        placeholder="Número de Cheque"
        value={checkNumber}
        onChangeText={setCheckNumber}
      />
      <BidUpTextField
        placeholder="Banco de Emisión"
        value={bankName}
        onChangeText={setBankName}
      />
      <BidUpTextField
        placeholder="Fecha de Emisión"
        value={issueDate}
        onChangeText={setIssueDate}
      />
      <BidUpTextField
        placeholder="CUIT del Emisor"
        value={cuit}
        onChangeText={setCuit}
        keyboardType="numeric"
      />
      <BidUpTextField placeholder="Librador" value={drawer} onChangeText={setDrawer} />
    </ProfileScreenShell>
  );
}
