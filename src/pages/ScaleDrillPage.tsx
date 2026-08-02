import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { SCALES } from '../theory/catalog';
import { pickRandom, randomRootMidi } from '../theory/pitch';
import type { RollEvent, ScaleDef } from '../theory/types';

type Phase = 'prompt' | 'answered';

type Prompt = {
  answer: ScaleDef;
  notes: number[];
};

/** Ascend to the top degree, then descend without repeating the peak. */
function scaleUpDown(root: number, intervals: number[]): number[] {
  const ascending = intervals.map((interval) => root + interval);
  const descending = ascending.slice(0, -1).reverse();
  return [...ascending, ...descending];
}

function makePrompt(): Prompt {
  const answer = pickRandom(SCALES);
  const root = randomRootMidi(48, 64);
  return {
    answer,
    notes: scaleUpDown(root, answer.intervals),
  };
}

export function ScaleDrillPage() {
  const { needsUnlock, unlock, canAutoplay } = useDrillAudio();
  const [prompt, setPrompt] = useState<Prompt>(() => makePrompt());
  const [phase, setPhase] = useState<Phase>('prompt');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roll, setRoll] = useState<RollEvent[]>([]);

  const playPrompt = useCallback(async (current: Prompt) => {
    await synth.playMelody(current.notes, 0.24, 0.02);
  }, []);

  useEffect(() => {
    if (!canAutoplay()) return;
    void playPrompt(prompt);
  }, [prompt, playPrompt, canAutoplay]);

  const onAnswer = (choice: ScaleDef) => {
    if (phase === 'answered') return;
    setSelectedId(choice.id);
    setPhase('answered');
    setRoll(melodyToRoll(prompt.notes, 0.24, 0.02));
  };

  const next = () => {
    setSelectedId(null);
    setPhase('prompt');
    setRoll([]);
    setPrompt(makePrompt());
  };

  const status = useMemo(() => {
    if (phase !== 'answered' || !selectedId) return null;
    return selectedId === prompt.answer.id ? 'correct' : 'wrong';
  }, [phase, selectedId, prompt.answer.id]);

  return (
    <Screen>
      <PageHeader title="Scales" />
      <Panel>
        {status === 'correct' ? <StatusPill tone="success" label="Correct" /> : null}
        {status === 'wrong' ? <StatusPill tone="danger" label="Incorrect" /> : null}
        {phase === 'prompt' ? (
          <StatusPill tone="neutral" label="Identify scale (up then down)" />
        ) : null}
        <div className="roll-wrap">
          <PianoRoll
            events={phase === 'answered' ? roll : []}
            label={phase === 'answered' ? prompt.answer.label : undefined}
          />
        </div>
        <div className="actions">
          {needsUnlock ? (
            <PrimaryButton
              label="Enable audio"
              onClick={() => {
                void unlock().then(() => playPrompt(prompt));
              }}
            />
          ) : (
            <GhostButton label="Replay" onClick={() => void playPrompt(prompt)} />
          )}
          {phase === 'answered' ? <PrimaryButton label="Next" onClick={next} /> : null}
        </div>
      </Panel>

      <div className="grid">
        {SCALES.map((item) => {
          let state: 'idle' | 'correct' | 'wrong' | 'muted' = 'idle';
          if (phase === 'answered') {
            if (item.id === prompt.answer.id) state = 'correct';
            else if (item.id === selectedId) state = 'wrong';
            else state = 'muted';
          }
          return (
            <ChoiceButton
              key={item.id}
              label={item.label}
              state={state}
              disabled={phase === 'answered' || needsUnlock}
              onClick={() => onAnswer(item)}
            />
          );
        })}
      </div>
    </Screen>
  );
}
