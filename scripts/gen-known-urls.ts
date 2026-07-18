/**
 * Regenerates data/known-urls.json from the seed guideline data.
 * The update-checker (scripts/check-updates.mjs) reads that JSON so it can run
 * as plain Node without importing TypeScript. Run via `npm run gen:known-urls`.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { guidelines } from '../data/guidelines';
import { societies } from '../data/societies';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const byId = new Map(societies.map((s) => [s.id, s]));

// Only current guidelines are "expected on the site"; superseded prior editions
// would otherwise be reported as MISSING by the update-checker.
const known = guidelines
  .filter((g) => g.status === 'current')
  .map((g) => ({
    id: g.id,
    societyId: g.societyId,
    country: byId.get(g.societyId)?.country ?? null,
    title: g.title,
    titleLocal: g.titleLocal ?? null,
    url: g.sourceUrl,
    pdfUrl: g.pdfUrl ?? null,
  }));

const out = {
  note: 'Auto-generated from data/guidelines by `npm run gen:known-urls`. The update-checker (scripts/check-updates.mjs) diffs guideline links discovered on society index pages against this list. Do not edit by hand.',
  sources: societies
    .filter((s) => guidelines.some((g) => g.societyId === s.id))
    .map((s) => ({ societyId: s.id, abbreviation: s.abbreviation, indexUrl: s.guidelinesIndexUrl })),
  known,
};

writeFileSync(join(root, 'data/known-urls.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`wrote data/known-urls.json with ${known.length} entries`);
