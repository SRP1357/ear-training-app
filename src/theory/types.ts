export type Timbre = 'sine' | 'triangle' | 'sawtooth' | 'square';

export type Pitch = {
  midi: number;
  name: string;
};

export type IntervalDef = {
  id: string;
  label: string;
  semitones: number;
};

export type ChordDef = {
  id: string;
  label: string;
  intervals: number[];
};

export type ScaleDef = {
  id: string;
  label: string;
  intervals: number[];
};

export type FunctionDef = {
  id: string;
  label: string;
  degree: number;
  quality: 'maj' | 'min' | 'dim';
};

export type DegreeDef = {
  id: string;
  label: string;
  semitone: number;
};

export type RollEvent = {
  midi: number;
  start: number;
  duration: number;
};
