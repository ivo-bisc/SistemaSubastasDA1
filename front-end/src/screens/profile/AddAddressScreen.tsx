import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { BidUpTextField, PrimaryButton } from '../../components/auth';
import { ProfileHeaderBar, ProfileScreenShell } from '../../components/profile';
import { useProfileStore } from '../../stores';
import type { ProfileStackParamList } from '../../types';

type Nav = StackNavigationProp<ProfileStackParamList, 'AddAddress'>;
type Route = RouteProp<ProfileStackParamList, 'AddAddress'>;

export default function AddAddressScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const addresses = useProfileStore((s) => s.addresses);
  const addAddress = useProfileStore((s) => s.addAddress);
  const updateAddress = useProfileStore((s) => s.updateAddress);

  const existing = useMemo(
    () => addresses.find((a) => a.id === route.params?.addressId),
    [addresses, route.params?.addressId]
  );

  const [province, setProvince] = useState(existing?.province ?? '');
  const [city, setCity] = useState(existing?.city ?? '');
  const [street1, setStreet1] = useState(existing?.street1 ?? '');
  const [street2, setStreet2] = useState(existing?.street2 ?? '');
  const [number, setNumber] = useState(existing?.number ?? '');
  const [bell, setBell] = useState(existing?.bell ?? '');
  const [zipCode, setZipCode] = useState(existing?.zipCode ?? '');

  const title = existing ? 'Editar dirección' : 'Añadir dirección';

  const handleConfirm = () => {
    if (!province.trim() || !city.trim() || !street1.trim() || !number.trim()) {
      Alert.alert('Dirección', 'Completá los campos obligatorios.');
      return;
    }
    const payload = {
      province: province.trim(),
      city: city.trim(),
      street1: street1.trim(),
      street2: street2.trim() || undefined,
      number: number.trim(),
      bell: bell.trim() || undefined,
      zipCode: zipCode.trim(),
    };
    if (existing) {
      updateAddress(existing.id, payload);
    } else {
      addAddress(payload);
    }
    navigation.goBack();
  };

  return (
    <ProfileScreenShell
      footer={<PrimaryButton label="Confirmar" onPress={handleConfirm} />}
    >
      <ProfileHeaderBar title={title} onBack={() => navigation.goBack()} />

      <BidUpTextField placeholder="Provincia" value={province} onChangeText={setProvince} />
      <BidUpTextField placeholder="Ciudad" value={city} onChangeText={setCity} />
      <BidUpTextField placeholder="Calle 1" value={street1} onChangeText={setStreet1} />
      <BidUpTextField placeholder="Calle 2" value={street2} onChangeText={setStreet2} />

      <View style={styles.row}>
        <BidUpTextField
          placeholder="Número"
          value={number}
          onChangeText={setNumber}
          containerStyle={styles.half}
          keyboardType="numeric"
        />
        <BidUpTextField
          placeholder="Timbre"
          value={bell}
          onChangeText={setBell}
          containerStyle={styles.half}
        />
      </View>

      <BidUpTextField
        placeholder="Código postal"
        value={zipCode}
        onChangeText={setZipCode}
        containerStyle={styles.halfRow}
        keyboardType="numeric"
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
  halfRow: {
    width: '48%',
  },
});
