import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { melodyToRoll, synth } from '../audio/synth';
import { PianoRoll } from '../components/PianoRoll';
import {
  ChoiceButton,
  GhostButton,
  Panel,
  PrimaryButton,
  Screen,
  StatusPill,
} from '../components/ui';
import { useDrillAudio } from '../hooks/useDrillAudio';
import { MAJOR_DEGREES, MINOR_DEGREES } from '../theory/catalog';
import { keyLabel } from '../theory/keys';
import { pickRandom, randomInt } from '../theory/pitch';
import type { DegreeDef, RollEvent } from '../theory/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Mode = 'major' | 'minor';
type Phase = 'prompt' | 'answered';

const CHAIN_LEN = 8;

type Session = {
  mode: Mode;
  tonic: number;
  degrees: DegreeDef[];
};

function buildSession(): Session {
  const mode: Mode = pickRandom(['major', 'minor'] as const);
  return {
    mode,
    tonic: randomInt(55, 67),
    degrees: mode === 'major' ? MAJOR_DEGREES : MINOR_DEGREES,
  };
}

function midiFor(session: Session, degree: DegreeDef) {
  return session.tonic + degree.semitone;
}

function nextDegree(session: Session, currentId: string): DegreeDef {
  const options = session.degrees.filter((item) => item.id !== currentId);
  return pickRandom(options);
}

export function InKeyNotesScreen() {
  const { needsUnlock, unlock, canAutoplay } = useDrillAudio();
  const genRef = useRef(0);
  const [session, setSession] = useState<Session>(() => buildSession());
  const [current, setCurrent] = useState<DegreeDef | null>(null);
  const [target, setTarget] = useState<DegreeDef | null>(null);
  const [phase, setPhase] = useState<Phase>('prompt');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roll, setRoll] = useState<RollEvent[]>([]);
  const [chainLeft, setChainLeft] = useState(CHAIN_LEN);
  const [ready, setReady] = useState(false);

  const startChain = useCallback(async () => {
    const gen = ++genRef.current;
    const active = buildSession();
    const home = active.degrees[0];
    const next = nextDegree(active, home.id);

    setSession(active);
    setCurrent(home);
    setTarget(next);
    setPhase('prompt');
    setSelectedId(null);
    setRoll([]);
    setChainLeft(CHAIN_LEN);
    setReady(true);

    if (!canAutoplay()) return;

    await synth.playNotes([midiFor(active, home)], 0.55, 0);
    if (gen !== genRef.current) return;
    await synth.playNotes([midiFor(active, next)], 0.7, 0);
  }, [canAutoplay]);

  useEffect(() => {
    if (!ready && canAutoplay()) {
      void startChain();
    }
  }, [ready, startChain, canAutoplay]);

  const playTarget = async () => {
    if (!target) return;
    await synth.playNotes([midiFor(session, target)], 0.7, 0);
  };

  const playCompare = async () => {
    if (!current || !target) return;
    await synth.playNotes(
      [midiFor(session, current), midiFor(session, target)],
      0.55,
      0.12,
    );
  };

  const playHome = async () => {
    await synth.playNotes([session.tonic], 0.65, 0);
  };

  const onAnswer = (choice: DegreeDef) => {
    if (!target || phase === 'answered') return;
    setSelectedId(choice.id);
    setPhase('answered');
    setRoll(melodyToRoll([midiFor(session, target)], 0.7, 0));
  };

  const continueChain = () => {
    if (!target || !current) return;
    const correct = selectedId === target.id;

    if (!correct || chainLeft <= 1) {
      void startChain();
      return;
    }

    const gen = ++genRef.current;
    const next = nextDegree(session, target.id);
    setCurrent(target);
    setTarget(next);
    setPhase('prompt');
    setSelectedId(null);
    setRoll([]);
    setChainLeft((n) => n - 1);
    void (async () => {
      await synth.playNotes([midiFor(session, next)], 0.7, 0);
      if (gen !== genRef.current) return;
    })();
  };

  const status = useMemo(() => {
    if (phase !== 'answered' || !selectedId || !target) return null;
    return selectedId === target.id ? 'correct' : 'wrong';
  }, [phase, selectedId, target]);

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Panel>
          <Text style={styles.meta}>
            {keyLabel(session.tonic, session.mode)}  ·  chain {CHAIN_LEN - chainLeft + 1}/
            {CHAIN_LEN}
          </Text>
          <View style={styles.row}>
            {status === 'correct' ? <StatusPill tone="success" label="Correct" /> : null}
            {status === 'wrong' ? <StatusPill tone="danger" label="Incorrect" /> : null}
            {phase === 'prompt' ? <StatusPill tone="neutral" label="Name the degree" /> : null}
          </View>
          <View style={styles.rollWrap}>
            <PianoRoll
              events={phase === 'answered' ? roll : []}
              label={
                phase === 'answered' && target && current
                  ? `${target.label}  ·  from ${current.label}`
                  : undefined
              }
            />
          </View>
          <View style={styles.actions}>
            {needsUnlock ? (
              <PrimaryButton
                label="Tap to enable audio"
                onPress={() => {
                  void unlock().then(() => startChain());
                }}
              />
            ) : (
              <>
                <GhostButton label="Replay target" onPress={() => void playTarget()} />
                <GhostButton label="Current → target" onPress={() => void playCompare()} />
                <GhostButton label="Play tonic" onPress={() => void playHome()} />
              </>
            )}
            {phase === 'answered' ? (
              <PrimaryButton
                label={status === 'correct' && chainLeft > 1 ? 'Continue chain' : 'New chain'}
                onPress={continueChain}
              />
            ) : null}
          </View>
        </Panel>

        <View style={styles.grid}>
          {session.degrees.map((item) => {
            let state: 'idle' | 'correct' | 'wrong' | 'muted' = 'idle';
            if (phase === 'answered' && target) {
              if (item.id === target.id) state = 'correct';
              else if (item.id === selectedId) state = 'wrong';
              else state = 'muted';
            }
            return (
              <View key={item.id} style={styles.cell}>
                <ChoiceButton
                  label={item.label}
                  state={state}
                  disabled={phase === 'answered' || needsUnlock}
                  onPress={() => onAnswer(item)}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 0 },
  content: { paddingBottom: 28 },
  meta: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.inkFaint,
    marginBottom: 10,
  },
  row: { marginBottom: 12 },
  rollWrap: { marginBottom: 12 },
  actions: { gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { width: '22%', flexGrow: 1, minWidth: 64 },
});
