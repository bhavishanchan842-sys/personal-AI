import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AppProvider } from './src/context/AppContext';
import ChatScreen from './src/screens/ChatScreen';
import MemoryScreen from './src/screens/MemoryScreen';
import PersonaScreen from './src/screens/PersonaScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: {
                backgroundColor: '#0a0e18',
                borderTopColor: 'rgba(255, 255, 255, 0.08)',
                height: 60,
                paddingBottom: 8,
                paddingTop: 6
              },
              tabBarActiveTintColor: '#06b6d4',
              tabBarInactiveTintColor: '#64748b',
              tabBarLabelStyle: {
                fontSize: 10.5,
                fontWeight: '600'
              },
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'Chat') {
                  iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                } else if (route.name === 'Vault') {
                  iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
                } else if (route.name === 'Persona') {
                  iconName = focused ? 'happy' : 'happy-outline';
                } else if (route.name === 'Identity') {
                  iconName = focused ? 'person-circle' : 'person-circle-outline';
                } else if (route.name === 'Settings') {
                  iconName = focused ? 'settings' : 'settings-outline';
                }
                return <Ionicons name={iconName} size={20} color={focused ? '#8b5cf6' : color} />;
              }
            })}
          >
            <Tab.Screen name="Chat" component={ChatScreen} />
            <Tab.Screen name="Vault" component={MemoryScreen} />
            <Tab.Screen name="Persona" component={PersonaScreen} />
            <Tab.Screen name="Identity" component={ProfileScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
