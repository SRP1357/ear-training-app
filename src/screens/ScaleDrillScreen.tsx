import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
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
import { SCALES } from '../theory/catalog';
import { scaleChoicesFor } from '../theory/drillPools';
import { pickRandom, randomRootMidi } from '../theory/pitch';
import type { RollEvent, ScaleDef } from '../theory/types';

type Phase = 'prompt' | 'answered';

type Prompt = {
  answer: ScaleDef;
  notes: number[];
  choices: ScaleDef[];
};

function makePrompt(): Prompt {
  const answer = pickRandom(SCALES);
  const root = randomRootMidi(48, 64);
  return {
    answer,
    notes: answer.intervals.map((interval) => root + interval),
    choices: scaleChoicesFor(answer),
  };
}

export function ScaleDrillScreen() {
  const { needsUnlock, unlock, canAutoplay } = useDrillAudio();
  const [prompt, setPrompt] = useState<Prompt>(() => makePrompt());
  const [phase, setPhase] = useState<Phase>('prompt');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roll, setRoll] = useState<RollEvent[]>([]);

  const playPrompt = useCallback(async (current: Prompt) => {
    await synth.playMelody(current.notes, 0.28, 0.03);
  }, []);

  useEffect(() => {
    if (!canAutoplay()) return;
    void playPrompt(prompt);
  }, [prompt, playPrompt, canAutoplay]);

  const onAnswer = (choice: ScaleDef) => {
    if (phase === 'answered') return;
    setSelectedId(choice.id);
    setPhase('answered');
    setRoll(melodyToRoll(prompt.notes, 0.28, 0.03));
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
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Panel>
          <View style={styles.row}>
            {status === 'correct' ? <StatusPill tone="success" label="Correct" /> : null}
            {status === 'wrong' ? <StatusPill tone="danger" label="Incorrect" /> : null}
            {phase === 'prompt' ? <StatusPill tone="neutral" label="Identify scale" /> : null}
          </View>
          <View style={styles.rollWrap}>
            <PianoRoll
              events={phase === 'answered' ? roll : []}
              label={phase === 'answered' ? prompt.answer.label : undefined}
            />
          </View>
          <View style={styles.actions}>
            {needsUnlock ? (
              <PrimaryButton
                label="Tap to enable audio"
                onPress={() => {
                  void unlock().then(() => playPrompt(prompt));
                }}
              />
            ) : (
              <GhostButton label="Replay" onPress={() => void playPrompt(prompt)} />
            )}
            {phase === 'answered' ? <PrimaryButton label="Next" onPress={next} /> : null}
          </View>
        </Panel>

        <View style={styles.grid}>
          {prompt.choices.map((item) => {
            let state: 'idle' | 'correct' | 'wrong' | 'muted' = 'idle';
            if (phase === 'answered') {
              if (item.id === prompt.answer.id) state = 'correct';
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
  row: { marginBottom: 12 },
  rollWrap: { marginBottom: 12 },
  actions: { gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { width: '48%', flexGrow: 1 },
});
