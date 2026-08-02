/** Offline theory integrity checks. Run: node scripts/check-theory.mjs */

const CHORDS = [
  { id: 'maj', intervals: [0, 4, 7] },
  { id: 'min', intervals: [0, 3, 7] },
  { id: 'dim', intervals: [0, 3, 6] },
  { id: 'aug', intervals: [0, 4, 8] },
  { id: 'maj7', intervals: [0, 4, 7, 11] },
  { id: '7', intervals: [0, 4, 7, 10] },
  { id: 'm7', intervals: [0, 3, 7, 10] },
  { id: 'm7b5', intervals: [0, 3, 6, 10] },
  { id: 'dim7', intervals: [0, 3, 6, 9] },
  { id: 'mMaj7', intervals: [0, 3, 7, 11] },
];

const SCALES = [
  { id: 'major', intervals: [0, 2, 4, 5, 7, 9, 11, 12] },
  { id: 'natMinor', intervals: [0, 2, 3, 5, 7, 8, 10, 12] },
  { id: 'harmMinor', intervals: [0, 2, 3, 5, 7, 8, 11, 12] },
  { id: 'melMinor', intervals: [0, 2, 3, 5, 7, 9, 11, 12] },
  { id: 'majPent', intervals: [0, 2, 4, 7, 9, 12] },
  { id: 'minPent', intervals: [0, 3, 5, 7, 10, 12] },
  { id: 'blues', intervals: [0, 3, 5, 6, 7, 10, 12] },
  { id: 'dorian', intervals: [0, 2, 3, 5, 7, 9, 10, 12] },
  { id: 'phrygian', intervals: [0, 1, 3, 5, 7, 8, 10, 12] },
  { id: 'lydian', intervals: [0, 2, 4, 6, 7, 9, 11, 12] },
  { id: 'mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10, 12] },
  { id: 'locrian', intervals: [0, 1, 3, 5, 6, 8, 10, 12] },
];

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

function poolFor(answer, all) {
  const count = answer.intervals.length;
  const pool = all.filter((item) => item.intervals.length === count);
  return pool.length >= 2 ? pool : all;
}

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    failed += 1;
  }
}

for (const s of SCALES) {
  const pool = poolFor(s, SCALES);
  assert(pool.length >= 2, `scale ${s.id} pool size ${pool.length}`);
  assert(
    pool.some((p) => p.id === s.id),
    `scale ${s.id} missing from its pool`,
  );
}

for (const c of CHORDS) {
  const pool = poolFor(c, CHORDS);
  assert(pool.length >= 2, `chord ${c.id} pool size ${pool.length}`);
}

function pc(n) {
  return ((n % 12) + 12) % 12;
}

function checkFunctions(label, fns, scale) {
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

const ids = (arr) => new Set(arr.map((x) => x.id));
assert(ids(CHORDS).size === CHORDS.length, 'duplicate chord ids');
assert(ids(SCALES).size === SCALES.length, 'duplicate scale ids');

if (failed) {
  console.error(`${failed} failure(s)`);
  process.exit(1);
}
console.log('theory checks passed');
