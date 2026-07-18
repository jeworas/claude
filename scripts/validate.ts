/**
 * Build-time data validation + search smoke tests.
 *
 * Run via `npm run validate`. Exits non-zero if any seed record is malformed,
 * any cross-reference is dangling, known-urls.json is stale, or a flagship
 * search query stops returning what the demo promises. Keeping this in CI would
 * catch data regressions before they ship.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { societies } from '../data/societies';
import { conditions } from '../data/conditions';
import { guidelines } from '../data/guidelines';
import { societiesSchema, conditionsSchema, guidelinesSchema } from '../src/lib/schema';
import { countryOf, lineagesForCondition, getDosing } from '../src/lib/data';
import { search } from '../src/lib/search';
import { buildComparison } from '../src/lib/compare';
import { answerFor } from '../src/lib/answer';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

let failures = 0;
function check(name: string, ok: boolean, detail = '') {
  if (ok) {
    console.log(`  ✓ ${name}`);
  } else {
    failures += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

console.log('\nSchema validation');
try {
  societiesSchema.parse(societies);
  check('societies match schema', true);
} catch (e) {
  check('societies match schema', false, String(e));
}
try {
  conditionsSchema.parse(conditions);
  check('conditions match schema', true);
} catch (e) {
  check('conditions match schema', false, String(e));
}
try {
  guidelinesSchema.parse(guidelines);
  check('guidelines match schema', true);
} catch (e) {
  check('guidelines match schema', false, String(e));
}

console.log('\nReferential integrity');
const societyIds = new Set(societies.map((s) => s.id));
const conditionIds = new Set(conditions.map((c) => c.id));
const guidelineIds = new Set(guidelines.map((g) => g.id));

check('unique guideline ids', guidelineIds.size === guidelines.length);
check('unique society ids', societyIds.size === societies.length);
check('unique condition ids', conditionIds.size === conditions.length);

for (const g of guidelines) {
  check(`guideline ${g.id} → known society`, societyIds.has(g.societyId), g.societyId);
  for (const cid of g.conditionIds) {
    check(`guideline ${g.id} → known condition`, conditionIds.has(cid), cid);
  }
  if (g.supersedesId) {
    check(`guideline ${g.id} supersedes known id`, guidelineIds.has(g.supersedesId), g.supersedesId);
  }
}

console.log('\nknown-urls.json freshness');
try {
  const knownFile = JSON.parse(readFileSync(join(root, 'data/known-urls.json'), 'utf8'));
  const currentCount = guidelines.filter((g) => g.status === 'current').length;
  check(
    'known-urls.json matches current guidelines',
    knownFile.known.length === currentCount,
    `${knownFile.known.length} vs ${currentCount} current — run: npm run gen:known-urls`,
  );
} catch (e) {
  check('known-urls.json present', false, String(e));
}

console.log('\nCoverage');
check('at least 25 guidelines', guidelines.length >= 25, `have ${guidelines.length}`);
const countries = new Set(guidelines.map((g) => countryOf(g)));
check('covers US, PL and EU', countries.has('US') && countries.has('PL') && countries.has('EU'));

// Superseded editions must not leak into search.
const supersededIds = new Set(guidelines.filter((g) => g.status === 'superseded').map((g) => g.id));
check('has superseded editions for the timeline', supersededIds.size >= 10, `${supersededIds.size}`);
const ucResultIds = search('ulcerative colitis').map((r) => r.guideline.id);
check(
  'search excludes superseded editions',
  ucResultIds.every((id) => !supersededIds.has(id)),
  ucResultIds.filter((id) => supersededIds.has(id)).join(','),
);
check(
  'ulcerative colitis has a revision timeline',
  lineagesForCondition('ulcerative-colitis').some((l) => l.versions.length >= 2),
);
check(
  'colitis comparison spans ≥2 regions',
  buildComparison('ulcerative-colitis').regions.length >= 2,
);

console.log('\nFlagship search queries');
function countriesFor(q: string) {
  return new Set(search(q).map((r) => countryOf(r.guideline)));
}
function idsFor(q: string) {
  return search(q).map((r) => r.guideline.id);
}

const colitis = search('colitis');
check('“colitis” returns ≥ 6 guidelines', colitis.length >= 6, `got ${colitis.length}`);
const colitisCountries = countriesFor('colitis');
check(
  '“colitis” spans US, PL and EU',
  colitisCountries.has('US') && colitisCountries.has('PL') && colitisCountries.has('EU'),
  [...colitisCountries].join(','),
);

// WZJG (abbreviation → condition) resolves to the same core UC cluster as the
// English name; the English free-text query additionally matches broader ECCO
// IBD guidelines, so WZJG results are a subset of the "ulcerative colitis" set.
const wzjg = new Set(idsFor('WZJG'));
const uc = new Set(idsFor('ulcerative colitis'));
const coreUC = ['acg-ulcerative-colitis-2025', 'aga-ulcerative-colitis-2024', 'ptge-wzjg-2023'];
check(
  '“WZJG” resolves like “ulcerative colitis” (subset + shared core)',
  wzjg.size > 0 &&
    [...wzjg].every((id) => uc.has(id)) &&
    coreUC.every((id) => wzjg.has(id) && uc.has(id)),
  `WZJG=${wzjg.size} ⊆ UC=${uc.size}`,
);

const polishUC = search('wrzodziejące zapalenie jelita grubego').map((r) => r.guideline.id);
check('Polish full name finds UC guidelines', polishUC.length > 0 && [...wzjg].every((id) => polishUC.includes(id)));

check('“cukrzyca” and “diabetes” both find PTD + ADA', (() => {
  const pl = new Set(idsFor('cukrzyca'));
  const en = new Set(idsFor('diabetes'));
  return pl.has('ptd-diabetes-2026') && pl.has('ada-standards-2026') &&
         en.has('ptd-diabetes-2026') && en.has('ada-standards-2026');
})());

check('“budesonide” finds microscopic colitis (drug-field match)', idsFor('budesonide').includes('aga-microscopic-colitis-2016'));
const hp = countriesFor('H. pylori');
check('“H. pylori” spans US + PL', hp.has('US') && hp.has('PL'), [...hp].join(','));
check('“refluks” (PL) finds GERD', idsFor('refluks').includes('ptge-gerd-2022'));

console.log('\nDosing + quick-answer');
check('flagship guidelines carry dosing', getDosing('acg-h-pylori-2024').length >= 3);
check('bare condition query yields no answer panel', answerFor('colitis') === null);
check('“celiac dosage” answers via first-line (no drug)', (() => {
  const a = answerFor('celiac dosage');
  return !!a && a.conditionId === 'celiac-disease' && a.entries.some((e) => e.rec);
})());
check('“H. pylori dosing” answers with dose entries', (() => {
  const a = answerFor('H. pylori dosing');
  return !!a && a.entries.some((e) => (e.doses?.length ?? 0) > 0);
})());
check('“budesonide dose” answers via named drug', (() => {
  const a = answerFor('budesonide dose');
  return !!a && a.intent === 'drug' && a.entries.length > 0;
})());
check('Polish “…dawkowanie” triggers dosing intent', (() => {
  const a = answerFor('wrzodziejące zapalenie jelita grubego dawkowanie');
  return !!a && a.intent === 'dosing';
})());

console.log('');
if (failures > 0) {
  console.error(`✗ ${failures} check(s) failed.\n`);
  process.exit(1);
}
console.log(`✓ All checks passed — ${guidelines.length} guidelines, ${societies.length} societies, ${conditions.length} conditions.\n`);
