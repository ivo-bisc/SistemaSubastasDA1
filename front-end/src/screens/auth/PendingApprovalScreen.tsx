import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, FontSize } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../stores';

export default function PendingApprovalScreen() {
  const navigation = useNavigation<any>();

  const setGuest = useAuthStore((s) => s.setGuest);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    // Si el registro ya autenticó al usuario (login() en RegisterStep2),
    // no pisar esa sesión con un estado de invitado.
    const id = setTimeout(() => {
      if (!isAuthenticated) setGuest();
      navigation.navigate('Main' as any, { screen: 'Home' as any });
    }, 5000);
    return () => clearTimeout(id);
  }, [navigation, setGuest, isAuthenticated]);
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Todo listo</Text>
        <Text style={styles.subtitle}>
          Aguardá mientras verificamos los datos
        </Text>
        <Text style={styles.hourglass}>⏳</Text>
      </View>
      <View style={styles.homeIndicator} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontFamily: Fonts.title,
    fontSize: FontSize.xxxl,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 48,
  },
  hourglass: {
    fontSize: 120,
    lineHeight: 140,
  },
  homeIndicator: {
    alignSelf: 'center',
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.black,
    marginBottom: 8,
    opacity: 0.2,
  },
});
