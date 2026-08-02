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
import { INTERVALS } from '../theory/catalog';
import { pickRandom, randomRootMidi } from '../theory/pitch';
import type { IntervalDef, RollEvent } from '../theory/types';

type Phase = 'prompt' | 'answered';

type Prompt = {
  answer: IntervalDef;
  first: number;
  second: number;
};

function makePrompt(): Prompt {
  const answer = pickRandom(INTERVALS);
  const low = randomRootMidi(48, 67);
  const high = low + answer.semitones;
  const ascending = answer.semitones === 0 || Math.random() < 0.5;
  return {
    answer,
    first: ascending ? low : high,
    second: ascending ? high : low,
  };
}

export function IntervalDrillPage() {
  const { needsUnlock, unlock, canAutoplay } = useDrillAudio();
  const [prompt, setPrompt] = useState<Prompt>(() => makePrompt());
  const [phase, setPhase] = useState<Phase>('prompt');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roll, setRoll] = useState<RollEvent[]>([]);

  const playPrompt = useCallback(async (current: Prompt) => {
    await synth.playNotes([current.first, current.second], 0.55, 0.12);
  }, []);

  useEffect(() => {
    if (!canAutoplay()) return;
    void playPrompt(prompt);
  }, [prompt, playPrompt, canAutoplay]);

  const onAnswer = (choice: IntervalDef) => {
    if (phase === 'answered') return;
    setSelectedId(choice.id);
    setPhase('answered');
    setRoll(melodyToRoll([prompt.first, prompt.second], 0.55, 0.12));
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
      <PageHeader title="Intervals" />
      <Panel>
        {status === 'correct' ? <StatusPill tone="success" label="Correct" /> : null}
        {status === 'wrong' ? <StatusPill tone="danger" label="Incorrect" /> : null}
        {phase === 'prompt' ? <StatusPill tone="neutral" label="Identify interval" /> : null}
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
        {INTERVALS.map((item) => {
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
