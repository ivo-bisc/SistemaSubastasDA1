import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { ProfileHeaderBar, ProfileScreenShell } from '../../components/profile';
import { Colors, Fonts, FontSize, Layout } from '../../constants';
import { useProfileStore } from '../../stores';
import type { ProfileStackParamList } from '../../types';

type Nav = StackNavigationProp<ProfileStackParamList, 'AddressList'>;

export default function AddressListScreen() {
  const navigation = useNavigation<Nav>();
  const address = useProfileStore((s) => s.address);

  return (
    <ProfileScreenShell>
      <ProfileHeaderBar
        title="Domicilio"
        onBack={() => navigation.goBack()}
        rightAction={
          <Pressable onPress={() => navigation.navigate('AddAddress')} hitSlop={8}>
            <Text style={styles.editLink}>Editar</Text>
          </Pressable>
        }
      />

      <View style={styles.card}>
        {address ? (
          <Text style={styles.addressText}>{address}</Text>
        ) : (
          <Text style={styles.emptyText}>Sin domicilio registrado</Text>
        )}
      </View>
    </ProfileScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Layout.inputBackground,
    borderRadius: Layout.profileRowRadius,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
  },
  addressText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  editLink: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.md,
    color: Colors.accent,
  },
});
