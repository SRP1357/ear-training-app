/** Canonical public origin for GitHub Pages. */
export const SITE_URL = 'https://srp1357.github.io/ear-training-app';

export const DEFAULT_DESCRIPTION =
  'Free ear training in your browser — intervals, chords, scales, and in-key drills. No accounts, no tracking. Audio stays on your device.';

export type PageSeo = {
  title: string;
  description: string;
  path: string;
};

export const PAGE_SEO = {
  home: {
    title: 'Ear Training — Free Interval, Chord & Scale Practice',
    description: DEFAULT_DESCRIPTION,
    path: '/',
  },
  intervals: {
    title: 'Interval Ear Training — Ascending & Descending',
    description:
      'Practice identifying musical intervals from unison to octave. Ascending and descending prompts with every interval available as an answer choice.',
    path: '/intervals',
  },
  chords: {
    title: 'Chord Ear Training — Triads & Sevenths',
    description:
      'Hear root-position triads and seventh chords, then identify them. Replay as a block chord or arpeggio at any time.',
    path: '/chords',
  },
  scales: {
    title: 'Scale Ear Training — Modes, Minors, Pentatonics & Blues',
    description:
      'Identify scales and modes by ear. Each prompt plays ascending then descending through the full scale catalog.',
    path: '/scales',
  },
  inKeyChords: {
    title: 'Chords in Key — Functional Ear Training',
    description:
      'Train diatonic chord functions in major and natural minor. Hear a home or current chord, then identify the mystery chord.',
    path: '/in-key/chords',
  },
  inKeyNotes: {
    title: 'Notes in Key — Scale Degree Ear Training',
    description:
      'Practice hearing scale degrees in major and natural minor. Hear the tonic or current note, then identify the mystery degree.',
    path: '/in-key/notes',
  },
  settings: {
    title: 'Settings — Ear Training',
    description: 'Choose synth timbre for ear training drills. Preferences stay in this browser only.',
    path: '/settings',
  },
} as const satisfies Record<string, PageSeo>;
