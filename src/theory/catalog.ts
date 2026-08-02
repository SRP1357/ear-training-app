import type {
  ChordDef,
  DegreeDef,
  FunctionDef,
  IntervalDef,
  ScaleDef,
} from './types';

/** Unison through octave. */
export const INTERVALS: IntervalDef[] = [
  { id: 'unison', label: 'Unison', semitones: 0 },
  { id: 'm2', label: 'Minor 2nd', semitones: 1 },
  { id: 'M2', label: 'Major 2nd', semitones: 2 },
  { id: 'm3', label: 'Minor 3rd', semitones: 3 },
  { id: 'M3', label: 'Major 3rd', semitones: 4 },
  { id: 'P4', label: 'Perfect 4th', semitones: 5 },
  { id: 'TT', label: 'Tritone / Augmented 4th / Diminished 5th', semitones: 6 },
  { id: 'P5', label: 'Perfect 5th', semitones: 7 },
  { id: 'm6', label: 'Minor 6th', semitones: 8 },
  { id: 'M6', label: 'Major 6th', semitones: 9 },
  { id: 'm7', label: 'Minor 7th', semitones: 10 },
  { id: 'M7', label: 'Major 7th', semitones: 11 },
  { id: 'P8', label: 'Octave', semitones: 12 },
];

/** Root-position triads and sevenths. */
export const CHORDS: ChordDef[] = [
  { id: 'maj', label: 'Major', intervals: [0, 4, 7] },
  { id: 'min', label: 'Minor', intervals: [0, 3, 7] },
  { id: 'dim', label: 'Diminished', intervals: [0, 3, 6] },
  { id: 'aug', label: 'Augmented', intervals: [0, 4, 8] },
  { id: 'maj7', label: 'Major 7', intervals: [0, 4, 7, 11] },
  { id: '7', label: 'Dominant 7', intervals: [0, 4, 7, 10] },
  { id: 'm7', label: 'Minor 7', intervals: [0, 3, 7, 10] },
  { id: 'm7b5', label: 'Half-diminished 7 / Minor 7♭5', intervals: [0, 3, 6, 10] },
  { id: 'dim7', label: 'Diminished 7', intervals: [0, 3, 6, 9] },
  { id: 'mMaj7', label: 'Minor-major 7', intervals: [0, 3, 7, 11] },
];

/** Church modes, common minors, pentatonics, blues. */
export const SCALES: ScaleDef[] = [
  { id: 'major', label: 'Major / Ionian', intervals: [0, 2, 4, 5, 7, 9, 11, 12] },
  { id: 'natMinor', label: 'Natural minor / Aeolian', intervals: [0, 2, 3, 5, 7, 8, 10, 12] },
  { id: 'harmMinor', label: 'Harmonic minor', intervals: [0, 2, 3, 5, 7, 8, 11, 12] },
  { id: 'melMinor', label: 'Melodic minor (ascending)', intervals: [0, 2, 3, 5, 7, 9, 11, 12] },
  { id: 'dorian', label: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10, 12] },
  { id: 'phrygian', label: 'Phrygian', intervals: [0, 1, 3, 5, 7, 8, 10, 12] },
  { id: 'lydian', label: 'Lydian', intervals: [0, 2, 4, 6, 7, 9, 11, 12] },
  { id: 'mixolydian', label: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10, 12] },
  { id: 'locrian', label: 'Locrian', intervals: [0, 1, 3, 5, 6, 8, 10, 12] },
  { id: 'majPent', label: 'Major pentatonic', intervals: [0, 2, 4, 7, 9, 12] },
  { id: 'minPent', label: 'Minor pentatonic', intervals: [0, 3, 5, 7, 10, 12] },
  { id: 'blues', label: 'Blues scale', intervals: [0, 3, 5, 6, 7, 10, 12] },
];

export const MAJOR_FUNCTIONS: FunctionDef[] = [
  { id: 'I', label: 'I', degree: 0, quality: 'maj' },
  { id: 'ii', label: 'ii', degree: 1, quality: 'min' },
  { id: 'iii', label: 'iii', degree: 2, quality: 'min' },
  { id: 'IV', label: 'IV', degree: 3, quality: 'maj' },
  { id: 'V', label: 'V', degree: 4, quality: 'maj' },
  { id: 'vi', label: 'vi', degree: 5, quality: 'min' },
  { id: 'vii', label: 'vii°', degree: 6, quality: 'dim' },
];

export const MINOR_FUNCTIONS: FunctionDef[] = [
  { id: 'i', label: 'i', degree: 0, quality: 'min' },
  { id: 'ii', label: 'ii°', degree: 1, quality: 'dim' },
  { id: 'III', label: 'III', degree: 2, quality: 'maj' },
  { id: 'iv', label: 'iv', degree: 3, quality: 'min' },
  { id: 'v', label: 'v', degree: 4, quality: 'min' },
  { id: 'VI', label: 'VI', degree: 5, quality: 'maj' },
  { id: 'VII', label: 'VII', degree: 6, quality: 'maj' },
];

export const MAJOR_DEGREES: DegreeDef[] = [
  { id: '1', label: '1', semitone: 0 },
  { id: '2', label: '2', semitone: 2 },
  { id: '3', label: '3', semitone: 4 },
  { id: '4', label: '4', semitone: 5 },
  { id: '5', label: '5', semitone: 7 },
  { id: '6', label: '6', semitone: 9 },
  { id: '7', label: '7', semitone: 11 },
];

export const MINOR_DEGREES: DegreeDef[] = [
  { id: '1', label: '1', semitone: 0 },
  { id: '2', label: '2', semitone: 2 },
  { id: 'b3', label: '♭3', semitone: 3 },
  { id: '4', label: '4', semitone: 5 },
  { id: '5', label: '5', semitone: 7 },
  { id: 'b6', label: '♭6', semitone: 8 },
  { id: 'b7', label: '♭7', semitone: 10 },
];

export const TRIAD_INTERVALS = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
} as const;

export const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11] as const;
export const NATURAL_MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10] as const;

export const TIMBRES = [
  { id: 'sine' as const, label: 'Sine' },
  { id: 'triangle' as const, label: 'Triangle' },
  { id: 'sawtooth' as const, label: 'Sawtooth' },
  { id: 'square' as const, label: 'Square' },
];
