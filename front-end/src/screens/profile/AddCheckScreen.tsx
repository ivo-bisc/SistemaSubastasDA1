import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { BidUpTextField, PrimaryButton } from '../../components/auth';
import { ProfileHeaderBar, ProfileScreenShell } from '../../components/profile';
import { useProfileStore } from '../../stores';
import { paymentService } from '../../services/paymentService';
import type { ProfileStackParamList } from '../../types';

type Nav = StackNavigationProp<ProfileStackParamList, 'AddCheck'>;

export default function AddCheckScreen() {
  const navigation = useNavigation<Nav>();
  const loadProfile = useProfileStore((s) => s.loadProfile);

  const [checkNumber, setCheckNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [cuit, setCuit] = useState('');
  const [drawer, setDrawer] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const addCheckViaApi = async () => {
    await paymentService.addPaymentMethod({
      tipo: 'CHEQUE_CERTIFICADO',
      alias: checkNumber.trim(),
      moneda: 'ARS',
      montoCheque: Number(amount),
    });
    await loadProfile();
  };

  const handleConfirm = async () => {
    if (!checkNumber.trim() || !bankName.trim() || !drawer.trim() || !amount.trim()) {
      Alert.alert('Cheque', 'Completá los campos obligatorios.');
      return;
    }

    setLoading(true);
    try {
      await addCheckViaApi();
      navigation.goBack();
    } catch {
      Alert.alert('Cheque', 'No se pudo registrar el cheque. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileScreenShell
      footer={<PrimaryButton label="Confirmar" onPress={handleConfirm} disabled={loading} />}
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
      <BidUpTextField
        placeholder="Monto del Cheque"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
    </ProfileScreenShell>
  );
}
