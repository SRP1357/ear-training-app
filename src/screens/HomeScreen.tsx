import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Body, CardButton, Eyebrow, Screen, Title } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <Screen topInset>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Eyebrow>Ear Lab // Local Unit</Eyebrow>
        <Title>Train the ear.{'\n'}Stay on device.</Title>
        <Body>
          Intervals, chords, scales, in-key hearing, and a chromatic tuner. No accounts. No
          tracking. Nothing leaves your device.
        </Body>

        <Text style={styles.section}>Vocabulary</Text>
        <CardButton
          title="Intervals"
          subtitle="Unison through octave. Pure audio, then piano-roll confirm."
          onPress={() => navigation.navigate('IntervalDrill')}
        />
        <CardButton
          title="Chords"
          subtitle="Triads and sevenths. Block chord first, arpeggio after answer."
          onPress={() => navigation.navigate('ChordDrill')}
        />
        <CardButton
          title="Scales"
          subtitle="Modes, minors, pentatonics, blues. Ascend once from the root."
          onPress={() => navigation.navigate('ScaleDrill')}
        />

        <Text style={styles.section}>In a Key</Text>
        <CardButton
          title="Chords in Key"
          subtitle="Chain through diatonic triad functions in major or natural minor."
          onPress={() => navigation.navigate('InKeyChords')}
        />
        <CardButton
          title="Notes in Key"
          subtitle="Chain through scale degrees inside one octave."
          onPress={() => navigation.navigate('InKeyNotes')}
        />

        <Text style={styles.section}>Tuner</Text>
        <CardButton
          title="Chromatic Tuner"
          subtitle="Voice or instrument. Microphone audio stays on this device."
          onPress={() => navigation.navigate('Tuner')}
        />

        <View style={styles.footerRule} />
        <CardButton
          title="Settings"
          subtitle="Synth timbre. Preferences stay on this device."
          onPress={() => navigation.navigate('Settings')}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 10,
    marginBottom: 10,
    fontFamily: fonts.monoMed,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  footerRule: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 8,
  },
});
