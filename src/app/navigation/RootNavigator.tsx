import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useT } from '../../i18n';
import { HomeScreen } from '../../screens/HomeScreen';
import { PlayScreen } from '../../screens/PlayScreen';
import { ResultScreen } from '../../screens/ResultScreen';
import { SettingsScreen } from '../../screens/SettingsScreen';
import { colors } from '../../theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const t = useT();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Play"
        component={PlayScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          title: t('settings.title'),
          headerStyle: { backgroundColor: colors.surfaceAlt },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '900' },
        }}
      />
    </Stack.Navigator>
  );
}
