/** Offline theory integrity checks. Run: node scripts/check-theory.mjs */

const TRIAD = { maj: [0, 4, 7], min: [0, 3, 7], dim: [0, 3, 6], aug: [0, 4, 8] };
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const NATURAL_MINOR = [0, 2, 3, 5, 7, 8, 10];
const HARMONIC_MINOR = [0, 2, 3, 5, 7, 8, 11];

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
const HARMONIC_MINOR_FUNCTIONS = [
  { id: 'i', degree: 0, quality: 'min' },
  { id: 'ii', degree: 1, quality: 'dim' },
  { id: 'III', degree: 2, quality: 'aug' },
  { id: 'iv', degree: 3, quality: 'min' },
  { id: 'V', degree: 4, quality: 'maj' },
  { id: 'VI', degree: 5, quality: 'maj' },
  { id: 'vii', degree: 6, quality: 'dim' },
];

const CHROMATIC_DEGREES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

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
checkFunctions('harmonicMinor', HARMONIC_MINOR_FUNCTIONS, HARMONIC_MINOR);

assert(CHROMATIC_DEGREES.length === 12, 'chromatic degrees must cover all 12 pcs');
assert(
  new Set(CHROMATIC_DEGREES).size === 12,
  'chromatic degrees must be unique',
);

if (failed) {
  console.error(`${failed} failure(s)`);
  process.exit(1);
}
console.log('theory checks passed');
