import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View, Modal } from 'react-native';
import { useState } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { PrimaryButton } from '../../components/auth';
import {
  ProfileHeaderBar,
  ProfileMenuRow,
  ProfileScreenShell,
} from '../../components/profile';
import { Colors, Fonts, FontSize } from '../../constants';
import { useAuthStore, useProfileStore } from '../../stores';
import type { ProfileStackParamList } from '../../types';

type Nav = StackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const logout = useAuthStore((s) => s.logout);
  const { name, email, category, avatarColor } = useProfileStore();

  const handleLogout = () => {
    setModalVisible(true);
  };

  const [modalVisible, setModalVisible] = useState(false);

  const confirmLogout = () => {
    setModalVisible(false);
    logout();
    // Reset navigation to Auth -> Access
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Auth',
            state: { routes: [{ name: 'Access' }] },
          },
        ],
      })
    );
  };

  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <ProfileScreenShell>
      <View style={styles.hero}>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <ProfileMenuRow
        label="Nombre de usuario"
        onPress={() => navigation.navigate('EditUsername')}
      />
      <ProfileMenuRow
        label="Contraseña"
        onPress={() => navigation.navigate('EditPassword')}
      />
      <ProfileMenuRow
        label="Direcciones"
        onPress={() => navigation.navigate('AddressList')}
      />
      <ProfileMenuRow
        label="Medios de pago"
        onPress={() => navigation.navigate('PaymentMethods')}
      />
      <ProfileMenuRow
        label="Categoría"
        value={category}
        showChevron={false}
      />

      <View style={styles.supportRow}>
        <PrimaryButton
          label="Ayuda"
          onPress={() => Alert.alert('Ayuda', 'Próximamente disponible.')}
          style={styles.supportBtn}
        />
        <PrimaryButton
          label="Soporte"
          onPress={() => Alert.alert('Soporte', 'Próximamente disponible.')}
          style={styles.supportBtn}
        />
      </View>

      <Pressable onPress={handleLogout} hitSlop={8} style={styles.logoutWrap}>
        <Text style={styles.logout}>Cerrar sesión</Text>
      </Pressable>
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={modalStyles.overlay}>
          <View style={modalStyles.sheet}>
            <Text style={modalStyles.title}>¿Seguro que queres cerrar sesion?</Text>
            <View style={modalStyles.actions}>
              <Pressable onPress={() => setModalVisible(false)} style={modalStyles.btn}>
                <Text>Cancelar</Text>
              </Pressable>
              <Pressable onPress={confirmLogout} style={[modalStyles.btn, modalStyles.destructive]}>
                <Text style={{ color: 'white' }}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ProfileScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontFamily: Fonts.title,
    fontSize: FontSize.xxl,
    color: Colors.white,
  },
  name: {
    fontFamily: Fonts.title,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontFamily: Fonts.body,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  supportRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 28,
  },
  supportBtn: {
    flex: 1,
    borderRadius: 8,
  },
  logoutWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logout: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.base,
    color: Colors.error,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    width: '90%',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 8,
  },
  title: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSize.base,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  destructive: {
    backgroundColor: Colors.error,
    borderRadius: 6,
  },
});
