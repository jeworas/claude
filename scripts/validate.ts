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
import { countryOf, lineagesForCondition, getDosing, getCondition } from '../src/lib/data';
import { search } from '../src/lib/search';
import { buildComparison } from '../src/lib/compare';
import { answerFor } from '../src/lib/answer';
import { allDrugs, getDrugBySlug, drugsForQuery } from '../src/lib/drugs';

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

console.log('\nguideline-sources.json freshness');
try {
  const sources = JSON.parse(readFileSync(join(root, 'data/guideline-sources.json'), 'utf8'));
  check(
    'guideline-sources.json covers every society',
    sources.entries.length === societies.length && sources.societyCount === societies.length,
    `${sources.entries.length} vs ${societies.length} societies — run: npm run sources`,
  );
} catch (e) {
  check('guideline-sources.json present', false, String(e));
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

console.log('\nDrug cross-reference');
const drugs = allDrugs();
check('drug index is populated', drugs.length >= 50, `${drugs.length} drugs`);
check('drug slugs are unique', new Set(drugs.map((d) => d.slug)).size === drugs.length);
const infliximab = getDrugBySlug('infliximab');
check('infliximab is indexed', !!infliximab);
check(
  'infliximab cross-references UC and Crohn’s',
  !!infliximab &&
    infliximab.conditions.some((c) => c.condition.id === 'ulcerative-colitis') &&
    infliximab.conditions.some((c) => c.condition.id === 'crohns-disease'),
);
check(
  'infliximab spans multiple guidelines',
  (infliximab?.guidelineCount ?? 0) >= 5,
  `${infliximab?.guidelineCount}`,
);
check(
  'infliximab UC use carries dosing',
  !!infliximab &&
    (infliximab.conditions.find((c) => c.condition.id === 'ulcerative-colitis')?.guidelines ?? [])
      .some((u) => u.doses.length > 0),
);
check(
  'Polish “infliksymab” resolves to the same medicine',
  drugsForQuery('infliksymab')[0]?.slug === 'infliximab',
);
const empagliflozin = getDrugBySlug('empagliflozin');
check(
  'empagliflozin merges the Polish alias and treats diabetes',
  !!empagliflozin &&
    empagliflozin.aliases.some((a) => a.toLowerCase() === 'empagliflozyna') &&
    empagliflozin.conditions.some((c) => c.condition.specialty === 'diabetology' || c.condition.id.includes('diabet')),
);
check('“proton pump inhibitor” is found as a medicine', drugsForQuery('proton pump inhibitor').length > 0);

console.log('\nCross-specialty ingestion (GOLD COPD)');
check('COPD condition exists (pulmonology)', getCondition('copd')?.specialty === 'pulmonology');
check('“COPD” finds the GOLD guideline', search('COPD').some((r) => r.guideline.id === 'gold-copd-2025'));
check('Polish “POChP” finds the GOLD guideline', search('POChP').some((r) => r.guideline.id === 'gold-copd-2025'));
check('“emphysema” (synonym) finds COPD', search('emphysema').some((r) => r.guideline.id === 'gold-copd-2025'));
check(
  'a COPD drug class is cross-referenced to COPD',
  (drugsForQuery('LABA')[0]?.conditions ?? []).some((c) => c.condition.id === 'copd'),
);
check('CKD condition exists (nephrology)', getCondition('chronic-kidney-disease')?.specialty === 'nephrology');
check('“CKD” finds the NKF guideline', search('CKD').some((r) => r.guideline.id === 'nkf-ckd-changepack-2023'));
check('Polish “przewlekła choroba nerek” finds CKD', search('przewlekła choroba nerek').some((r) => r.guideline.id === 'nkf-ckd-changepack-2023'));
check(
  'metformin now spans diabetes and CKD (cross-specialty drug)',
  (() => {
    const specs = new Set((drugsForQuery('metformin')[0]?.conditions ?? []).map((c) => c.condition.specialty));
    return specs.has('nephrology') && (specs.has('diabetology') || specs.has('diabetes'));
  })(),
);
check('ophthalmology condition exists (HCQ retinopathy)', getCondition('hydroxychloroquine-retinopathy')?.specialty === 'ophthalmology');
check('“hydroxychloroquine” is indexed as a medicine with dosing', (() => {
  const d = drugsForQuery('hydroxychloroquine')[0];
  return !!d && d.conditions.some((c) => c.condition.id === 'hydroxychloroquine-retinopathy') &&
    d.conditions.some((c) => c.guidelines.some((u) => u.doses.length > 0));
})());
check('oncology condition exists (anaplastic thyroid cancer)', getCondition('anaplastic-thyroid-cancer')?.specialty === 'oncology');
check('“anaplastic thyroid cancer” finds the ATA guideline', search('anaplastic thyroid cancer').some((r) => r.guideline.id === 'ata-anaplastic-thyroid-cancer-2020'));
check('“dabrafenib” is cross-referenced to ATC', (drugsForQuery('dabrafenib')[0]?.conditions ?? []).some((c) => c.condition.id === 'anaplastic-thyroid-cancer'));
check('urology condition exists (prostate cancer)', getCondition('prostate-cancer')?.specialty === 'urology');
check('“prostate cancer” finds the AUA guideline', search('prostate cancer').some((r) => r.guideline.id === 'aua-suo-prostate-early-detection-2023'));
check('pembrolizumab cross-references ATC (enriched systemic therapy)', (drugsForQuery('pembrolizumab')[0]?.conditions ?? []).some((c) => c.condition.id === 'anaplastic-thyroid-cancer'));
check('CKD-associated pruritus condition exists (nephrology)', getCondition('ckd-associated-pruritus')?.specialty === 'nephrology');
check('Polish “świąd mocznicowy” finds CKD-aP', search('świąd mocznicowy').some((r) => r.guideline.id === 'era-ckd-associated-pruritus'));
check('“difelikefalin” indexed with dosing', (() => {
  const d = drugsForQuery('difelikefalin')[0];
  return !!d && d.conditions.some((c) => c.guidelines.some((u) => u.doses.length > 0));
})());

console.log('\nCross-specialty ingestion (PTN nephrology: nephroprotection + RSV)');
check(
  'English “nephroprotection” finds the PTN non-diabetic CKD statement',
  search('nephroprotection').some((r) => r.guideline.id === 'ptn-nephroprotection-nondiabetic-ckd-2023'),
);
check(
  'Polish “przewlekła choroba nerek” surfaces the PTN nephroprotection statement',
  search('przewlekła choroba nerek').some((r) => r.guideline.id === 'ptn-nephroprotection-nondiabetic-ckd-2023'),
);
check(
  'dapagliflozin now spans diabetology and nephrology (cross-specialty drug)',
  (() => {
    const specs = new Set((drugsForQuery('dapagliflozin')[0]?.conditions ?? []).map((c) => c.condition.specialty));
    return specs.has('diabetology') && specs.has('nephrology');
  })(),
);
check(
  '“tolvaptan” is cross-referenced to CKD (ADPKD nephroprotection)',
  (drugsForQuery('tolvaptan')[0]?.conditions ?? []).some((c) => c.condition.id === 'chronic-kidney-disease'),
);
check(
  'Polish “wodorowęglan sodu” collapses to the same drug as “sodium bicarbonate”',
  !!drugsForQuery('sodium bicarbonate')[0] &&
    drugsForQuery('wodorowęglan sodu')[0]?.slug === drugsForQuery('sodium bicarbonate')[0]?.slug,
);
check('RSV infection condition exists (infectious-disease)', getCondition('rsv-infection')?.specialty === 'infectious-disease');
check(
  '“RSV” finds the PTN/PTW vaccination guideline',
  search('RSV').some((r) => r.guideline.id === 'ptn-ptw-rsv-vaccination-ckd-2025'),
);
check(
  'Polish “szczepienie przeciw RSV” finds the vaccination guideline',
  search('szczepienie przeciw RSV').some((r) => r.guideline.id === 'ptn-ptw-rsv-vaccination-ckd-2025'),
);
check(
  'RSV vaccination guideline cross-links to CKD',
  guidelines.find((g) => g.id === 'ptn-ptw-rsv-vaccination-ckd-2025')?.conditionIds.includes('chronic-kidney-disease') === true,
);

console.log('\nCross-specialty ingestion (USPSTF preventive services)');
check('breast-cancer-screening condition exists (primary-care)', getCondition('breast-cancer-screening')?.specialty === 'primary-care');
check('childhood-obesity condition exists (primary-care)', getCondition('childhood-obesity')?.specialty === 'primary-care');
check('falls-prevention condition exists (primary-care)', getCondition('falls-prevention')?.specialty === 'primary-care');
check(
  'USPSTF now has ingested current guidelines',
  guidelines.filter((g) => g.societyId === 'uspstf' && g.status === 'current').length >= 3,
);
check(
  '“breast cancer screening” finds the USPSTF statement',
  search('breast cancer screening').some((r) => r.guideline.id === 'uspstf-breast-cancer-screening-2024'),
);
check(
  '“mammography” (synonym) finds the USPSTF breast screening statement',
  search('mammography').some((r) => r.guideline.id === 'uspstf-breast-cancer-screening-2024'),
);
check(
  'Polish “mammografia przesiewowa” finds the USPSTF breast screening statement',
  search('mammografia przesiewowa').some((r) => r.guideline.id === 'uspstf-breast-cancer-screening-2024'),
);
check(
  '“falls” finds the USPSTF falls-prevention statement',
  search('falls prevention').some((r) => r.guideline.id === 'uspstf-falls-prevention-2024'),
);

console.log('\nCross-specialty ingestion (PTDerm dermatology — PubMed-verified)');
check('atopic dermatitis condition exists (dermatology)', getCondition('atopic-dermatitis')?.specialty === 'dermatology');
check(
  'ptderm now has an ingested current guideline',
  guidelines.some((g) => g.societyId === 'ptderm' && g.status === 'current'),
);
check(
  'English “atopic dermatitis” finds the PTDerm guideline',
  search('atopic dermatitis').some((r) => r.guideline.id === 'ptderm-atopic-dermatitis-2020'),
);
check(
  'Polish “atopowe zapalenie skóry” finds the PTDerm guideline',
  search('atopowe zapalenie skóry').some((r) => r.guideline.id === 'ptderm-atopic-dermatitis-2020'),
);
check(
  'Polish abbreviation “AZS” resolves to atopic dermatitis',
  search('AZS').some((r) => r.guideline.id === 'ptderm-atopic-dermatitis-2020'),
);
check(
  '“dupilumab” is cross-referenced to atopic dermatitis with dosing',
  (() => {
    const d = drugsForQuery('dupilumab')[0];
    return !!d && d.conditions.some((c) => c.condition.id === 'atopic-dermatitis' && c.guidelines.some((u) => u.doses.length > 0));
  })(),
);
check(
  'Polish “takrolimus” collapses to the same medicine as “tacrolimus”',
  !!drugsForQuery('tacrolimus')[0] && drugsForQuery('takrolimus')[0]?.slug === drugsForQuery('tacrolimus')[0]?.slug,
);

console.log('');
if (failures > 0) {
  console.error(`✗ ${failures} check(s) failed.\n`);
  process.exit(1);
}
console.log(`✓ All checks passed — ${guidelines.length} guidelines, ${societies.length} societies, ${conditions.length} conditions.\n`);
