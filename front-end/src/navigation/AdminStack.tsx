import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AdminStackParamList } from '../types';
import {
  AdminHomeScreen,
  AdminPendingUsersScreen,
  AdminPendingConsignmentsScreen,
  AdminProposeConditionsScreen,
} from '../screens/admin';

const Stack = createStackNavigator<AdminStackParamList>();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
      <Stack.Screen name="AdminPendingUsers" component={AdminPendingUsersScreen} />
      <Stack.Screen name="AdminPendingConsignments" component={AdminPendingConsignmentsScreen} />
      <Stack.Screen name="AdminProposeConditions" component={AdminProposeConditionsScreen} />
    </Stack.Navigator>
  );
}
