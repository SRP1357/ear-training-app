import { CHORDS, SCALES } from './catalog';
import type { ChordDef, ScaleDef } from './types';

/** Avoid counting leaks: only offer chords with the same tone count as the answer. */
export function chordChoicesFor(answer: ChordDef): ChordDef[] {
  const count = answer.intervals.length;
  return CHORDS.filter((chord) => chord.intervals.length === count);
}

/** Avoid counting leaks: only offer scales with the same step count as the answer. */
export function scaleChoicesFor(answer: ScaleDef): ScaleDef[] {
  const count = answer.intervals.length;
  return SCALES.filter((scale) => scale.intervals.length === count);
}
