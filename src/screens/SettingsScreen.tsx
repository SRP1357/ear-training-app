import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { synth } from '../audio/synth';
import { Body, ChoiceButton, Eyebrow, Panel, Screen, Title } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { useSettings } from '../storage/settings';
import { TIMBRES } from '../theory/catalog';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { Timbre } from '../theory/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen(_props: Props) {
  const { timbre, setTimbre } = useSettings();

  const preview = async (next: Timbre) => {
    setTimbre(next);
    await synth.playNotes([60, 64, 67], 0.28, 0.05);
  };

  return (
    <Screen>
      <Eyebrow>System</Eyebrow>
      <Title>Settings</Title>
      <Body>Local preferences only. Nothing is uploaded or synced.</Body>

      <Panel>
        <Text style={styles.label}>Timbre</Text>
        <Text style={styles.help}>Used across every drill.</Text>
        <View style={styles.grid}>
          {TIMBRES.map((item) => (
            <View key={item.id} style={styles.cell}>
              <ChoiceButton
                label={item.label}
                state={timbre === item.id ? 'correct' : 'idle'}
                onPress={() => {
                  void preview(item.id);
                }}
              />
            </View>
          ))}
        </View>
      </Panel>

      <Panel>
        <Text style={styles.label}>Privacy</Text>
        <Text style={styles.help}>
          No accounts, ads, analytics, or network calls for training data. Your answers and
          settings remain on this device.
        </Text>
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.monoMed,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.ink,
    marginBottom: 6,
  },
  help: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cell: {
    width: '48%',
    flexGrow: 1,
  },
});
