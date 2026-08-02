import { CHORDS, SCALES } from './catalog';
import type { ChordDef, ScaleDef } from './types';

function sameLengthPool<T extends { intervals: number[] }>(
  answer: T,
  all: readonly T[],
): T[] {
  const count = answer.intervals.length;
  const pool = all.filter((item) => item.intervals.length === count);
  // Singleton pools (e.g. blues) would make the answer free — fall back to all.
  return pool.length >= 2 ? pool : [...all];
}

/** Avoid counting leaks: only offer chords with the same tone count as the answer. */
export function chordChoicesFor(answer: ChordDef): ChordDef[] {
  return sameLengthPool(answer, CHORDS);
}

/** Avoid counting leaks: only offer scales with the same step count as the answer. */
export function scaleChoicesFor(answer: ScaleDef): ScaleDef[] {
  return sameLengthPool(answer, SCALES);
}
