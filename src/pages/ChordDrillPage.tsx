import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { CHORDS } from '../theory/catalog';
import { pickRandom, randomRootMidi } from '../theory/pitch';
import type { ChordDef, RollEvent } from '../theory/types';

type Phase = 'prompt' | 'answered';

type Prompt = {
  answer: ChordDef;
  notes: number[];
};

function makePrompt(): Prompt {
  const answer = pickRandom(CHORDS);
  // Leave headroom for ninths (root + 14).
  const root = randomRootMidi(48, 60);
  return {
    answer,
    notes: answer.intervals.map((interval) => root + interval),
  };
}

export function ChordDrillPage() {
  const { needsUnlock, unlock, canAutoplay } = useDrillAudio();
  const [prompt, setPrompt] = useState<Prompt>(() => makePrompt());
  const [phase, setPhase] = useState<Phase>('prompt');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roll, setRoll] = useState<RollEvent[]>([]);

  const playPrompt = useCallback(async (current: Prompt) => {
    await synth.playChord(current.notes, 1.15);
  }, []);

  useEffect(() => {
    if (!canAutoplay()) return;
    void playPrompt(prompt);
  }, [prompt, playPrompt, canAutoplay]);

  const onAnswer = (choice: ChordDef) => {
    if (phase === 'answered') return;
    setSelectedId(choice.id);
    setPhase('answered');
    setRoll(chordToRoll(prompt.notes, 1.15));
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
      <PageHeader title="Chords" />
      <Panel>
        {status === 'correct' ? <StatusPill tone="success" label="Correct" /> : null}
        {status === 'wrong' ? <StatusPill tone="danger" label="Incorrect" /> : null}
        {phase === 'prompt' ? <StatusPill tone="neutral" label="Identify chord" /> : null}
        <div className="roll-wrap">
          <PianoRoll
            events={phase === 'answered' ? roll : []}
            label={phase === 'answered' ? prompt.answer.label : undefined}
          />
        </div>
        <div className="actions">
          {needsUnlock ? (
            <PrimaryButton
              label="Tap to enable audio"
              onClick={() => {
                void unlock().then(() => playPrompt(prompt));
              }}
            />
          ) : (
            <>
              <GhostButton label="Replay chord" onClick={() => void playPrompt(prompt)} />
              <GhostButton
                label="Arpeggiate"
                onClick={() => void synth.playArpeggio(prompt.notes)}
                disabled={phase !== 'answered'}
              />
            </>
          )}
          {phase === 'answered' ? <PrimaryButton label="Next" onClick={next} /> : null}
        </div>
      </Panel>

      <div className="grid">
        {CHORDS.map((item) => {
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
