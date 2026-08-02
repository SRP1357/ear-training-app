import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { melodyToRoll, synth } from '../audio/synth';
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
import { CHROMATIC_DEGREES } from '../theory/catalog';
import { keyLabel } from '../theory/keys';
import { pickRandom, randomInt } from '../theory/pitch';
import type { DegreeDef, KeyMode, RollEvent } from '../theory/types';

type Phase = 'prompt' | 'answered';

const CHAIN_LEN = 8;

type Session = {
  mode: KeyMode;
  tonic: number;
};

function buildSession(): Session {
  const mode: KeyMode = pickRandom(['major', 'minor', 'harmonicMinor'] as const);
  return {
    mode,
    tonic: randomInt(55, 67),
  };
}

function midiFor(session: Session, degree: DegreeDef) {
  return session.tonic + degree.semitone;
}

function nextDegree(currentId: string): DegreeDef {
  const options = CHROMATIC_DEGREES.filter((item) => item.id !== currentId);
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

  const startChain = useCallback(async () => {
    const gen = ++genRef.current;
    const active = buildSession();
    const home = CHROMATIC_DEGREES[0];
    const next = nextDegree(home.id);

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
    const next = nextDegree(target.id);
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
    <Screen>
      <PageHeader title="In Key / Notes" />
      <Panel>
        <p className="meta">
          {ready
            ? `${keyLabel(session.tonic, session.mode)} · chain ${CHAIN_LEN - chainLeft + 1}/${CHAIN_LEN}`
            : 'Waiting for audio'}
        </p>
        {status === 'correct' ? <StatusPill tone="success" label="Correct" /> : null}
        {status === 'wrong' ? <StatusPill tone="danger" label="Incorrect" /> : null}
        {phase === 'prompt' ? <StatusPill tone="neutral" label="Name the degree" /> : null}
        <div className="roll-wrap">
          <PianoRoll
            events={phase === 'answered' ? roll : []}
            label={
              phase === 'answered' && target && current
                ? `${target.label}  ·  from ${current.label}`
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
              <GhostButton label="Play tonic" onClick={() => void playHome()} disabled={!ready} />
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
        {CHROMATIC_DEGREES.map((item) => {
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
