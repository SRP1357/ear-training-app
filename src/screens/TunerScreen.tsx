import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { tunerEngine, type TunerFrame } from '../audio/tunerEngine';
import {
  Body,
  ChoiceButton,
  Eyebrow,
  GhostButton,
  Panel,
  PrimaryButton,
  Screen,
  Title,
} from '../components/ui';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const A4_OPTIONS = [432, 440, 442] as const;

function centsColor(cents: number | null, inTune: boolean) {
  if (cents == null) return colors.inkFaint;
  if (inTune) return colors.accent;
  return Math.abs(cents) > 25 ? colors.danger : colors.ink;
}

export function TunerScreen() {
  const [frame, setFrame] = useState<TunerFrame>({
    listening: false,
    pitch: null,
    rawHz: null,
    error: null,
  });
  const [a4, setA4] = useState<(typeof A4_OPTIONS)[number]>(440);

  useEffect(() => {
    const unsub = tunerEngine.subscribe(setFrame);
    return () => {
      unsub();
      void tunerEngine.stop();
    };
  }, []);

  useEffect(() => {
    tunerEngine.setA4(a4);
  }, [a4]);

  const cents = frame.pitch?.cents ?? null;
  const inTune = cents != null && Math.abs(cents) <= 5;
  const needle = Math.max(-50, Math.min(50, cents ?? 0));
  const needlePct = ((needle + 50) / 100) * 100;

  const statusLabel = useMemo(() => {
    if (frame.error) return 'Error';
    if (!frame.listening) return 'Idle';
    if (!frame.pitch) return 'Listening';
    if (inTune) return 'In tune';
    return cents != null && cents < 0 ? 'Flat' : 'Sharp';
  }, [frame.error, frame.listening, frame.pitch, inTune, cents]);

  return (
    <Screen style={styles.screen}>
      <Eyebrow>Utility // Local Mic</Eyebrow>
      <Title>Tuner</Title>
      <Body>
        Chromatic tuner for voice or instrument. Microphone audio is processed on this device
        only — nothing is recorded or uploaded.
      </Body>

      <Panel>
        <View style={styles.statusRow}>
          <Text style={styles.status}>{statusLabel}</Text>
          <Text style={styles.a4meta}>A4 = {a4} Hz</Text>
        </View>

        <Text style={[styles.note, { color: centsColor(cents, inTune) }]}>
          {frame.pitch ? `${frame.pitch.note}${frame.pitch.octave}` : '—'}
        </Text>

        <Text style={styles.hz}>
          {frame.pitch ? `${frame.pitch.frequency.toFixed(1)} Hz` : 'Sing or play a steady tone'}
        </Text>

        <View style={styles.meter}>
          <View style={styles.meterTrack} />
          <View style={styles.centerMark} />
          <View style={[styles.needle, { left: `${needlePct}%` }]} />
          <View style={styles.meterLabels}>
            <Text style={styles.meterLabel}>-50</Text>
            <Text style={styles.meterLabel}>0</Text>
            <Text style={styles.meterLabel}>+50</Text>
          </View>
        </View>

        <Text style={styles.cents}>
          {cents == null ? 'cents —' : `${cents >= 0 ? '+' : ''}${cents.toFixed(1)} cents`}
        </Text>

        {frame.error ? <Text style={styles.error}>{frame.error}</Text> : null}

        <View style={styles.actions}>
          {frame.listening ? (
            <GhostButton label="Stop listening" onPress={() => void tunerEngine.stop()} />
          ) : (
            <PrimaryButton label="Start listening" onPress={() => void tunerEngine.start()} />
          )}
        </View>
      </Panel>

      <Panel>
        <Text style={styles.sectionLabel}>Reference pitch</Text>
        <View style={styles.a4row}>
          {A4_OPTIONS.map((value) => (
            <View key={value} style={styles.a4cell}>
              <ChoiceButton
                label={`${value} Hz`}
                state={a4 === value ? 'correct' : 'idle'}
                onPress={() => setA4(value)}
              />
            </View>
          ))}
        </View>
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 0,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  status: {
    fontFamily: fonts.monoMed,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  a4meta: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.inkFaint,
  },
  note: {
    fontFamily: fonts.sansBold,
    fontSize: 72,
    lineHeight: 78,
    letterSpacing: -2,
    textAlign: 'center',
    marginTop: 8,
  },
  hz: {
    fontFamily: fonts.mono,
    fontSize: 13,
    textAlign: 'center',
    color: colors.inkMuted,
    marginBottom: 22,
  },
  meter: {
    height: 54,
    marginBottom: 8,
    position: 'relative',
    justifyContent: 'center',
  },
  meterTrack: {
    height: 2,
    backgroundColor: colors.lineStrong,
  },
  centerMark: {
    position: 'absolute',
    left: '50%',
    marginLeft: -1,
    top: 10,
    bottom: 18,
    width: 2,
    backgroundColor: colors.accent,
  },
  needle: {
    position: 'absolute',
    top: 8,
    width: 2,
    height: 28,
    marginLeft: -1,
    backgroundColor: colors.ink,
  },
  meterLabels: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meterLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.inkFaint,
  },
  cents: {
    fontFamily: fonts.monoMed,
    fontSize: 12,
    textAlign: 'center',
    color: colors.inkMuted,
    marginBottom: 16,
  },
  error: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.danger,
    marginBottom: 12,
    textAlign: 'center',
  },
  actions: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: fonts.monoMed,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.ink,
    marginBottom: 12,
  },
  a4row: {
    flexDirection: 'row',
    gap: 8,
  },
  a4cell: {
    flex: 1,
  },
});
