import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { ProfileHeaderBar, ProfileScreenShell } from '../../components/profile';
import { Colors, Fonts, FontSize, Layout } from '../../constants';
import { formatAddressLine } from '../../data/mockProfile';
import { useProfileStore } from '../../stores';
import type { ProfileStackParamList } from '../../types';

type Nav = StackNavigationProp<ProfileStackParamList, 'AddressList'>;

export default function AddressListScreen() {
  const navigation = useNavigation<Nav>();
  const addresses = useProfileStore((s) => s.addresses);

  return (
    <ProfileScreenShell>
      <ProfileHeaderBar
        title="Direcciones"
        onBack={() => navigation.goBack()}
        rightAction={
          <Pressable
            onPress={() => navigation.navigate('AddAddress')}
            hitSlop={8}
          >
            <Text style={styles.addLink}>Agregar</Text>
          </Pressable>
        }
      />

      {addresses.map((addr) => (
        <View key={addr.id} style={styles.card}>
          <Text style={styles.addressText}>{formatAddressLine(addr)}</Text>
          <Pressable
            onPress={() =>
              navigation.navigate('AddAddress', { addressId: addr.id })
            }
            hitSlop={6}
          >
            <Text style={styles.editLink}>Editar</Text>
          </Pressable>
        </View>
      ))}
    </ProfileScreenShell>
  );
}

const styles = StyleSheet.create({
  addLink: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.md,
    color: Colors.linkBlue,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Layout.inputBackground,
    borderRadius: Layout.profileRowRadius,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
  },
  addressText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginRight: 12,
  },
  editLink: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.md,
    color: Colors.accent,
  },
});
