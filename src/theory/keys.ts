import type { KeyMode } from './types';

/** Conventional key spellings (mixed sharps/flats). */
const MAJOR_KEY_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'] as const;
const MINOR_KEY_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'B♭', 'B'] as const;

export function keyLabel(tonicMidi: number, mode: KeyMode): string {
  const pc = ((tonicMidi % 12) + 12) % 12;
  if (mode === 'major') {
    return `${MAJOR_KEY_NAMES[pc]} major`;
  }
  if (mode === 'harmonicMinor') {
    return `${MINOR_KEY_NAMES[pc]} harmonic minor`;
  }
  return `${MINOR_KEY_NAMES[pc]} minor`;
}
