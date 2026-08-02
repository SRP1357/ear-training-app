import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { chordToRoll, synth } from '../audio/synth';
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
import {
  MAJOR_FUNCTIONS,
  MAJOR_SCALE,
  MINOR_FUNCTIONS,
  NATURAL_MINOR_SCALE,
  TRIAD_INTERVALS,
} from '../theory/catalog';
import { keyLabel } from '../theory/keys';
import { pickRandom, randomInt } from '../theory/pitch';
import type { FunctionDef, RollEvent } from '../theory/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Mode = 'major' | 'minor';
type Phase = 'prompt' | 'answered';

const CHAIN_LEN = 6;

type Session = {
  mode: Mode;
  tonic: number;
  functions: FunctionDef[];
  scale: readonly number[];
};

type Step = {
  fn: FunctionDef;
  notes: number[];
};

function buildSession(): Session {
  const mode: Mode = pickRandom(['major', 'minor'] as const);
  return {
    mode,
    tonic: randomInt(48, 58),
    functions: mode === 'major' ? MAJOR_FUNCTIONS : MINOR_FUNCTIONS,
    scale: mode === 'major' ? MAJOR_SCALE : NATURAL_MINOR_SCALE,
  };
}

function chordFor(session: Session, fn: FunctionDef): number[] {
  const root = session.tonic + session.scale[fn.degree];
  return TRIAD_INTERVALS[fn.quality].map((interval) => root + interval);
}

function nextFunction(session: Session, currentId: string): FunctionDef {
  const options = session.functions.filter((item) => item.id !== currentId);
  return pickRandom(options);
}

export function InKeyChordsScreen() {
  const { needsUnlock, unlock, canAutoplay } = useDrillAudio();
  const genRef = useRef(0);
  const [session, setSession] = useState<Session>(() => buildSession());
  const [current, setCurrent] = useState<Step | null>(null);
  const [target, setTarget] = useState<Step | null>(null);
  const [phase, setPhase] = useState<Phase>('prompt');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roll, setRoll] = useState<RollEvent[]>([]);
  const [chainLeft, setChainLeft] = useState(CHAIN_LEN);
  const [ready, setReady] = useState(false);

  const homeNotes = useMemo(
    () => chordFor(session, session.functions[0]),
    [session],
  );

  const startChain = useCallback(async () => {
    const gen = ++genRef.current;
    const active = buildSession();
    const homeFn = active.functions[0];
    const home: Step = { fn: homeFn, notes: chordFor(active, homeFn) };
    const targetFn = nextFunction(active, homeFn.id);
    const nextTarget: Step = { fn: targetFn, notes: chordFor(active, targetFn) };

    setSession(active);
    setCurrent(home);
    setTarget(nextTarget);
    setPhase('prompt');
    setSelectedId(null);
    setRoll([]);
    setChainLeft(CHAIN_LEN);
    setReady(true);

    if (!canAutoplay()) return;

    await synth.playChord(home.notes, 0.9);
    if (gen !== genRef.current) return;
    await synth.playChord(nextTarget.notes, 1.05);
  }, [canAutoplay]);

  useEffect(() => {
    if (!ready && canAutoplay()) {
      void startChain();
    }
  }, [ready, startChain, canAutoplay]);

  const playTarget = async () => {
    if (!target) return;
    await synth.playChord(target.notes, 1.05);
  };

  const playCompare = async () => {
    if (!current || !target) return;
    const gen = genRef.current;
    await synth.playChord(current.notes, 0.75);
    if (gen !== genRef.current) return;
    await synth.playChord(target.notes, 1.0);
  };

  const playHome = async () => {
    await synth.playChord(homeNotes, 0.9);
  };

  const onAnswer = (choice: FunctionDef) => {
    if (!target || phase === 'answered') return;
    setSelectedId(choice.id);
    setPhase('answered');
    setRoll(chordToRoll(target.notes, 1.05));
  };

  const continueChain = () => {
    if (!target || !current) return;
    const correct = selectedId === target.fn.id;

    if (!correct || chainLeft <= 1) {
      void startChain();
      return;
    }

    const gen = ++genRef.current;
    const nextTargetFn = nextFunction(session, target.fn.id);
    const nextTarget: Step = {
      fn: nextTargetFn,
      notes: chordFor(session, nextTargetFn),
    };

    setCurrent(target);
    setTarget(nextTarget);
    setPhase('prompt');
    setSelectedId(null);
    setRoll([]);
    setChainLeft((n) => n - 1);
    void (async () => {
      await synth.playChord(nextTarget.notes, 1.05);
      if (gen !== genRef.current) return;
    })();
  };

  const status = useMemo(() => {
    if (phase !== 'answered' || !selectedId || !target) return null;
    return selectedId === target.fn.id ? 'correct' : 'wrong';
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
            {phase === 'prompt' ? <StatusPill tone="neutral" label="Name the function" /> : null}
          </View>
          <View style={styles.rollWrap}>
            <PianoRoll
              events={phase === 'answered' ? roll : []}
              label={
                phase === 'answered' && target && current
                  ? `${target.fn.label}  ·  from ${current.fn.label}`
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
                <GhostButton label="Play home" onPress={() => void playHome()} />
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
          {session.functions.map((item) => {
            let state: 'idle' | 'correct' | 'wrong' | 'muted' = 'idle';
            if (phase === 'answered' && target) {
              if (item.id === target.fn.id) state = 'correct';
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
