import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { chordToRoll, synth } from '../audio/synth';
import { PianoRoll } from '../components/PianoRoll';
import {
  ChoiceButton,
  GhostButton,
  PageHeader,
  Panel,
  PrimaryButton,
  Screen,
  StatusPill,
} from '../components/ui';
import { useDrillAudio } from '../hooks/useDrillAudio';
import {
  HARMONIC_MINOR_FUNCTIONS,
  HARMONIC_MINOR_SCALE,
  MAJOR_FUNCTIONS,
  MAJOR_SCALE,
  MINOR_FUNCTIONS,
  NATURAL_MINOR_SCALE,
  TRIAD_INTERVALS,
} from '../theory/catalog';
import { keyLabel } from '../theory/keys';
import { pickRandom, randomInt } from '../theory/pitch';
import type { FunctionDef, KeyMode, RollEvent } from '../theory/types';

type Phase = 'prompt' | 'answered';

const CHAIN_LEN = 6;

type Session = {
  mode: KeyMode;
  tonic: number;
  functions: FunctionDef[];
  scale: readonly number[];
};

type Step = {
  fn: FunctionDef;
  notes: number[];
};

function functionsFor(mode: KeyMode): FunctionDef[] {
  if (mode === 'major') return MAJOR_FUNCTIONS;
  if (mode === 'harmonicMinor') return HARMONIC_MINOR_FUNCTIONS;
  return MINOR_FUNCTIONS;
}

function scaleFor(mode: KeyMode): readonly number[] {
  if (mode === 'major') return MAJOR_SCALE;
  if (mode === 'harmonicMinor') return HARMONIC_MINOR_SCALE;
  return NATURAL_MINOR_SCALE;
}

function buildSession(): Session {
  const mode: KeyMode = pickRandom(['major', 'minor', 'harmonicMinor'] as const);
  return {
    mode,
    tonic: randomInt(48, 58),
    functions: functionsFor(mode),
    scale: scaleFor(mode),
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

export function InKeyChordsPage() {
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
    <Screen>
      <PageHeader title="In Key / Chords" />
      <Panel>
        <p className="meta">
          {ready
            ? `${keyLabel(session.tonic, session.mode)} · chain ${CHAIN_LEN - chainLeft + 1}/${CHAIN_LEN}`
            : 'Waiting for audio'}
        </p>
        {status === 'correct' ? <StatusPill tone="success" label="Correct" /> : null}
        {status === 'wrong' ? <StatusPill tone="danger" label="Incorrect" /> : null}
        {phase === 'prompt' ? <StatusPill tone="neutral" label="Name the function" /> : null}
        <div className="roll-wrap">
          <PianoRoll
            events={phase === 'answered' ? roll : []}
            label={
              phase === 'answered' && target && current
                ? `${target.fn.label}  ·  from ${current.fn.label}`
                : undefined
            }
          />
        </div>
        <div className="actions">
          {needsUnlock ? (
            <PrimaryButton
              label="Tap to enable audio"
              onClick={() => {
                void unlock().then(() => startChain());
              }}
            />
          ) : (
            <>
              <GhostButton
                label="Replay target"
                onClick={() => void playTarget()}
                disabled={!target}
              />
              <GhostButton
                label="Current → target"
                onClick={() => void playCompare()}
                disabled={!current || !target}
              />
              <GhostButton label="Play home" onClick={() => void playHome()} disabled={!ready} />
            </>
          )}
          {phase === 'answered' ? (
            <PrimaryButton
              label={status === 'correct' && chainLeft > 1 ? 'Continue chain' : 'New chain'}
              onClick={continueChain}
            />
          ) : null}
        </div>
      </Panel>

      <div className="grid grid--compact">
        {session.functions.map((item) => {
          let state: 'idle' | 'correct' | 'wrong' | 'muted' = 'idle';
          if (phase === 'answered' && target) {
            if (item.id === target.fn.id) state = 'correct';
            else if (item.id === selectedId) state = 'wrong';
            else state = 'muted';
          }
          return (
            <ChoiceButton
              key={item.id}
              label={item.label}
              state={state}
              disabled={phase === 'answered' || needsUnlock || !target}
              onClick={() => onAnswer(item)}
            />
          );
        })}
      </div>
    </Screen>
  );
}
