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
import { countryOf } from '../src/lib/data';
import { search } from '../src/lib/search';

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
  check(
    'known-urls.json entry count matches guidelines',
    knownFile.known.length === guidelines.length,
    `${knownFile.known.length} vs ${guidelines.length} — run: npm run gen:known-urls`,
  );
} catch (e) {
  check('known-urls.json present', false, String(e));
}

console.log('\nCoverage');
check('at least 25 guidelines', guidelines.length >= 25, `have ${guidelines.length}`);
const countries = new Set(guidelines.map((g) => countryOf(g)));
check('covers US and PL', countries.has('US') && countries.has('PL'));

console.log('\nFlagship search queries');
function countriesFor(q: string) {
  return new Set(search(q).map((r) => countryOf(r.guideline)));
}
function idsFor(q: string) {
  return search(q).map((r) => r.guideline.id);
}

const colitis = search('colitis');
check('“colitis” returns ≥ 6 guidelines', colitis.length >= 6, `got ${colitis.length}`);
check('“colitis” spans US + PL', countriesFor('colitis').size === 2);

const wzjg = new Set(idsFor('WZJG'));
const uc = new Set(idsFor('ulcerative colitis'));
check(
  '“WZJG” ≡ “ulcerative colitis” result set',
  wzjg.size > 0 && wzjg.size === uc.size && [...wzjg].every((id) => uc.has(id)),
  `WZJG=${[...wzjg].join(',')} | UC=${[...uc].join(',')}`,
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
check('“H. pylori” spans US + PL', countriesFor('H. pylori').size === 2);
check('“refluks” (PL) finds GERD', idsFor('refluks').includes('ptge-gerd-2022'));

console.log('');
if (failures > 0) {
  console.error(`✗ ${failures} check(s) failed.\n`);
  process.exit(1);
}
console.log(`✓ All checks passed — ${guidelines.length} guidelines, ${societies.length} societies, ${conditions.length} conditions.\n`);
