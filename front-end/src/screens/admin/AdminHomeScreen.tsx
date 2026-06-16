import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AdminStackParamList } from '../../types';
import { Colors, Fonts, FontSize } from '../../constants';

type Nav = StackNavigationProp<AdminStackParamList, 'AdminHome'>;

export default function AdminHomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel Admin</Text>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AdminPendingUsers')}
      >
        <Text style={styles.cardText}>Usuarios pendientes</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AdminPendingConsignments')}
      >
        <Text style={styles.cardText}>Consignaciones pendientes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: Fonts.soraBold,
    fontSize: FontSize.xxl,
    color: Colors.textPrimary,
    marginBottom: 32,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
});
