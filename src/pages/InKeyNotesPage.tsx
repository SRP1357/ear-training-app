import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { melodyToRoll, synth } from '../audio/synth';
import { ChainCompare } from '../components/ChainCompare';
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
import { MAJOR_DEGREES, MINOR_DEGREES } from '../theory/catalog';
import { keyLabel } from '../theory/keys';
import { pickRandom, randomInt } from '../theory/pitch';
import type { DegreeDef, KeyMode, RollEvent } from '../theory/types';

type Phase = 'prompt' | 'answered';

const CHAIN_LEN = 8;

type Session = {
  mode: KeyMode;
  tonic: number;
  degrees: DegreeDef[];
};

function buildSession(): Session {
  const mode: KeyMode = pickRandom(['major', 'minor'] as const);
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

export function InKeyNotesPage() {
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

  const stepNumber = CHAIN_LEN - chainLeft + 1;
  const isFirstStep = chainLeft === CHAIN_LEN;
  const knownRole = isFirstStep ? 'Home note (tonic)' : 'Current note';
  const knownLabel = current?.label ?? '—';

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

  const playKnown = async () => {
    if (!current) return;
    await synth.playNotes([midiFor(session, current)], 0.65, 0);
  };

  const playMystery = async () => {
    if (!target) return;
    await synth.playNotes([midiFor(session, target)], 0.7, 0);
  };

  const playBoth = async () => {
    if (!current || !target) return;
    await synth.playNotes(
      [midiFor(session, current), midiFor(session, target)],
      0.55,
      0.12,
    );
  };

  const playTonic = async () => {
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
    const becomingCurrent = target;
    const next = nextDegree(session, target.id);
    setCurrent(becomingCurrent);
    setTarget(next);
    setPhase('prompt');
    setSelectedId(null);
    setRoll([]);
    setChainLeft((n) => n - 1);
    void (async () => {
      await synth.playNotes([midiFor(session, becomingCurrent)], 0.55, 0);
      if (gen !== genRef.current) return;
      await synth.playNotes([midiFor(session, next)], 0.7, 0);
    })();
  };

  const status = useMemo(() => {
    if (phase !== 'answered' || !selectedId || !target) return null;
    return selectedId === target.id ? 'correct' : 'wrong';
  }, [phase, selectedId, target]);

  const promptText = !ready
    ? 'Enable audio to begin a chain in a random key.'
    : phase === 'answered' && target
      ? `That note was ${target.label}.`
      : isFirstStep
        ? 'You hear the tonic (1), then a mystery note. What degree is the mystery note?'
        : `You hear the current note (${knownLabel}), then a new mystery note. What degree is the mystery note?`;

  return (
    <Screen>
      <PageHeader title="Notes in key" />
      <Panel>
        <p className="meta">
          {ready
            ? `${keyLabel(session.tonic, session.mode)} · step ${stepNumber} of ${CHAIN_LEN}`
            : 'Enable audio to begin'}
        </p>

        {ready && current && target ? (
          <ChainCompare
            knownRole={knownRole}
            knownLabel={knownLabel}
            mysteryRole="Mystery note"
            mysteryLabel={target.label}
            revealed={phase === 'answered'}
            onPlayKnown={() => void playKnown()}
            onPlayMystery={() => void playMystery()}
            disabled={needsUnlock}
          />
        ) : null}

        <p className="prompt-line">{promptText}</p>

        {status === 'correct' ? <StatusPill tone="success" label="Correct" /> : null}
        {status === 'wrong' ? <StatusPill tone="danger" label="Incorrect" /> : null}

        <div className="roll-wrap">
          <PianoRoll
            events={phase === 'answered' ? roll : []}
            label={
              phase === 'answered' && target ? `Mystery note · ${target.label}` : undefined
            }
          />
        </div>

        <div className="actions">
          {needsUnlock ? (
            <PrimaryButton
              label="Enable audio"
              onClick={() => {
                void unlock().then(() => startChain());
              }}
            />
          ) : (
            <>
              <GhostButton
                label="Play both in order"
                onClick={() => void playBoth()}
                disabled={!current || !target}
              />
              <GhostButton
                label="Play tonic (1)"
                onClick={() => void playTonic()}
                disabled={!ready}
              />
            </>
          )}
          {phase === 'answered' ? (
            <PrimaryButton
              label={status === 'correct' && chainLeft > 1 ? 'Next in chain' : 'New key'}
              onClick={continueChain}
            />
          ) : null}
        </div>
      </Panel>

      <p className="section">Choose the mystery note’s degree</p>
      <div className="grid grid--compact">
        {session.degrees.map((item) => {
          let state: 'idle' | 'correct' | 'wrong' | 'muted' = 'idle';
          if (phase === 'answered' && target) {
            if (item.id === target.id) state = 'correct';
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
