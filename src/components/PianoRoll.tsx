import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { midiToName } from '../theory/pitch';
import type { RollEvent } from '../theory/types';

type Props = {
  events: RollEvent[];
  label?: string;
};

export function PianoRoll({ events, label }: Props) {
  if (events.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Awaiting signal</Text>
      </View>
    );
  }

  const midis = events.map((e) => e.midi);
  const minMidi = Math.min(...midis) - 1;
  const maxMidi = Math.max(...midis) + 1;
  const pitchCount = Math.max(1, maxMidi - minMidi + 1);
  const totalTime = Math.max(...events.map((e) => e.start + e.duration), 0.8);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.roll}>
        {Array.from({ length: pitchCount }, (_, i) => {
          const midi = maxMidi - i;
          return <View key={midi} style={styles.lane} />;
        })}
        {events.map((event, index) => {
          const top = ((maxMidi - event.midi) / pitchCount) * 100;
          const height = (1 / pitchCount) * 100;
          const left = (event.start / totalTime) * 100;
          const width = Math.max(4, (event.duration / totalTime) * 100);
          return (
            <View
              key={`${event.midi}-${index}`}
              style={[
                styles.note,
                {
                  top: `${top}%`,
                  height: `${height}%`,
                  left: `${left}%`,
                  width: `${width}%`,
                },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.legend}>
        {[...new Set(midis)]
          .sort((a, b) => a - b)
          .map((midi) => (
            <Text key={midi} style={styles.legendItem}>
              {midiToName(midi)}
            </Text>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surfaceRaised,
    padding: 12,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.inkFaint,
    marginBottom: 10,
  },
  roll: {
    height: 140,
    backgroundColor: colors.rollLane,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    position: 'relative',
  },
  lane: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  note: {
    position: 'absolute',
    backgroundColor: colors.rollNote,
    borderRadius: 1,
    minWidth: 8,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  legendItem: {
    fontFamily: fonts.monoMed,
    fontSize: 11,
    color: colors.inkMuted,
  },
  empty: {
    height: 140,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
});
