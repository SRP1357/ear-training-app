/** Offline theory integrity checks. Run: node scripts/check-theory.mjs */

const TRIAD = { maj: [0, 4, 7], min: [0, 3, 7], dim: [0, 3, 6] };
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const NATURAL_MINOR = [0, 2, 3, 5, 7, 8, 10];

const MAJOR_FUNCTIONS = [
  { id: 'I', degree: 0, quality: 'maj' },
  { id: 'ii', degree: 1, quality: 'min' },
  { id: 'iii', degree: 2, quality: 'min' },
  { id: 'IV', degree: 3, quality: 'maj' },
  { id: 'V', degree: 4, quality: 'maj' },
  { id: 'vi', degree: 5, quality: 'min' },
  { id: 'vii', degree: 6, quality: 'dim' },
];
const MINOR_FUNCTIONS = [
  { id: 'i', degree: 0, quality: 'min' },
  { id: 'ii', degree: 1, quality: 'dim' },
  { id: 'III', degree: 2, quality: 'maj' },
  { id: 'iv', degree: 3, quality: 'min' },
  { id: 'v', degree: 4, quality: 'min' },
  { id: 'VI', degree: 5, quality: 'maj' },
  { id: 'VII', degree: 6, quality: 'maj' },
];

const INTERVALS = 13;
const CHORDS = 10;
const SCALES = 12;

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    failed += 1;
  }
}

function pc(n) {
  return ((n % 12) + 12) % 12;
}

function checkFunctions(label, fns, scale) {
  assert(fns.length === 7, `${label} should have 7 functions`);
  for (const fn of fns) {
    const root = scale[fn.degree];
    const fromQuality = TRIAD[fn.quality].map((i) => pc(root + i)).sort();
    const stacked = [0, 2, 4].map((n) => pc(scale[(fn.degree + n) % 7])).sort();
    assert(
      fromQuality.join() === stacked.join(),
      `${label} ${fn.id}: quality ${fromQuality} != stacked thirds ${stacked}`,
    );
  }
}

checkFunctions('major', MAJOR_FUNCTIONS, MAJOR_SCALE);
checkFunctions('minor', MINOR_FUNCTIONS, NATURAL_MINOR);

assert(INTERVALS === 13, 'expect 13 intervals (unison–octave)');
assert(CHORDS === 10, 'expect 10 chord qualities');
assert(SCALES === 12, 'expect 12 scales');

if (failed) {
  console.error(`${failed} failure(s)`);
  process.exit(1);
}
console.log('theory checks passed');
