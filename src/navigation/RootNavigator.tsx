import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChordDrillScreen } from '../screens/ChordDrillScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { InKeyChordsScreen } from '../screens/InKeyChordsScreen';
import { InKeyNotesScreen } from '../screens/InKeyNotesScreen';
import { IntervalDrillScreen } from '../screens/IntervalDrillScreen';
import { ScaleDrillScreen } from '../screens/ScaleDrillScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TunerScreen } from '../screens/TunerScreen';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.ink,
    border: colors.line,
    primary: colors.accent,
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShadowVisible: false,
          headerTintColor: colors.ink,
          headerTitleStyle: {
            fontFamily: fonts.monoMed,
            fontSize: 13,
          },
          headerStyle: {
            backgroundColor: colors.bg,
          },
          contentStyle: {
            backgroundColor: colors.bg,
          },
          animation: 'fade',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="IntervalDrill"
          component={IntervalDrillScreen}
          options={{ title: 'INTERVALS' }}
        />
        <Stack.Screen
          name="ChordDrill"
          component={ChordDrillScreen}
          options={{ title: 'CHORDS' }}
        />
        <Stack.Screen
          name="ScaleDrill"
          component={ScaleDrillScreen}
          options={{ title: 'SCALES' }}
        />
        <Stack.Screen
          name="InKeyChords"
          component={InKeyChordsScreen}
          options={{ title: 'IN KEY / CHORDS' }}
        />
        <Stack.Screen
          name="InKeyNotes"
          component={InKeyNotesScreen}
          options={{ title: 'IN KEY / NOTES' }}
        />
        <Stack.Screen
          name="Tuner"
          component={TunerScreen}
          options={{ title: 'TUNER' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'SETTINGS' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
