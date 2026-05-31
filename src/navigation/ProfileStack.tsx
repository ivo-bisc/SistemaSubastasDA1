import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from '../types';
import {
  ProfileScreen,
  AddressListScreen,
  AddAddressScreen,
  PaymentMethodsScreen,
  AddCardScreen,
  AddCheckScreen,
} from '../screens/profile';

const Stack = createStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="AddressList" component={AddressListScreen} />
      <Stack.Screen name="AddAddress" component={AddAddressScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="AddCard" component={AddCardScreen} />
      <Stack.Screen name="AddCheck" component={AddCheckScreen} />
    </Stack.Navigator>
  );
}
