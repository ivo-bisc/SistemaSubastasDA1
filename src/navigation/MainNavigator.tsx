import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types';
import { Colors, Fonts, FontSize } from '../constants';

import HomeStack from './HomeStack';
import ProfileStack from './ProfileStack';
import { MyBidsScreen, MyAuctionsScreen } from '../screens/activity';

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<keyof MainTabParamList, { active: TabIconName; inactive: TabIconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  MyBids: { active: 'hammer', inactive: 'hammer-outline' },
  MyAuctions: { active: 'albums', inactive: 'albums-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: {
          fontFamily: Fonts.sora,
          fontSize: FontSize.xs,
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.border,
          height: 60,
          paddingTop: 6,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.active : icons.inactive;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen
        name="MyBids"
        component={MyBidsScreen}
        options={{ tabBarLabel: 'Mis Pujas' }}
      />
      <Tab.Screen
        name="MyAuctions"
        component={MyAuctionsScreen}
        options={{ tabBarLabel: 'Mis Subastas' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}
