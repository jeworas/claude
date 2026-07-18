import type { Condition, Country, DoseEntry, Guideline, LineOfTherapy } from './types';
import { guidelines, getCondition, getDosing, countryOf } from './data';
import { drugKey, LINE_ORDER } from './compare';

/**
 * Drug-centric cross-reference — the inverse of the condition view.
 *
 * The dataset attributes drugs to conditions (each guideline recommends drugs
 * for the condition it covers, and carries standard dosing). This module pivots
 * that: for every medicine, it collects every condition it is recommended for,
 * with the therapy line, evidence grade and standard dosing from each guideline.
 *
 * It introduces NO new clinical facts — it only re-groups curated data by drug.
 * Drug names are canonicalised with the same language-normalised key used by the
 * comparison view, so a Polish "infliksymab" and an English "infliximab" (and
 * the parenthetical "Infliximab (infliksymab)" spellings in the dosing tables)
 * all collapse to one medicine.
 */

export interface DrugGuidelineUse {
  guideline: Guideline;
  country: Country;
  /** Therapy lines on which this drug appears in this guideline. */
  lines: LineOfTherapy[];
  /** Distinct evidence grades from the recommendations naming this drug. */
  grades: string[];
  /** Recommendation snippets (topic + text) naming this drug. */
  recs: { topic: string; text: string }[];
  /** Standard dosing rows for this drug from this guideline. */
  doses: DoseEntry[];
}

export interface DrugConditionUse {
  condition: Condition;
  guidelines: DrugGuidelineUse[];
}

export interface DrugProfile {
  key: string;
  slug: string;
  /** Preferred display name (English INN where known). */
  name: string;
  /** Other surface forms seen (Polish INN, brand-agnostic variants). */
  aliases: string[];
  /** Conditions this drug is recommended for, most-documented first. */
  conditions: DrugConditionUse[];
  conditionCount: number;
  guidelineCount: number;
}

/** Strip parenthetical synonyms: "Infliximab (infliksymab)" → "Infliximab". */
function stripParens(raw: string): string {
  return raw.replace(/\s*\([^)]*\)/g, '').trim();
}

/** Parenthetical contents are cross-language synonyms of the primary name. */
function parentheticals(raw: string): string[] {
  return [...raw.matchAll(/\(([^)]*)\)/g)].map((m) => m[1].trim()).filter(Boolean);
}

/**
 * Split a raw drug string into its component medicines. Combination entries in
 * the dosing tables ("Vancomycin + metronidazole") become two components; the
 * parenthetical Polish synonym rides along as an alias of a single component.
 */
function componentize(raw: string): { key: string; surface: string; aliases: string[] }[] {
  const primary = stripParens(raw);
  const parts = primary
    .split('+')
    .map((p) => p.trim())
    .filter(Boolean);
  const parenAliases = parts.length === 1 ? parentheticals(raw) : [];
  return parts
    .map((surface) => {
      const key = drugKey(surface);
      // A parenthetical is a true synonym only if it canonicalises to the same
      // drug (e.g. "infliksymab" → infliximab). Route/form qualifiers like
      // "(oral)" or "(oral viscous)" do not, and are dropped.
      const aliases = parenAliases.filter((a) => drugKey(a) === key);
      return { key, surface, aliases };
    })
    .filter((c) => c.key.length >= 2);
}

function slugify(key: string): string {
  return key.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Sentence-case a canonical key for display ("infliximab" → "Infliximab"). */
function titleize(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

interface Bucket {
  aliases: Set<string>;
  // conditionId → guidelineId → accumulated use
  byCondition: Map<string, Map<string, { lines: Set<LineOfTherapy>; grades: Set<string>; recs: { topic: string; text: string }[]; doses: DoseEntry[] }>>;
}

function ensureGuideline(bucket: Bucket, conditionId: string, guidelineId: string) {
  let byGuideline = bucket.byCondition.get(conditionId);
  if (!byGuideline) {
    byGuideline = new Map();
    bucket.byCondition.set(conditionId, byGuideline);
  }
  let use = byGuideline.get(guidelineId);
  if (!use) {
    use = { lines: new Set(), grades: new Set(), recs: [], doses: [] };
    byGuideline.set(guidelineId, use);
  }
  return use;
}

function buildIndex(): { byKey: Map<string, DrugProfile>; bySlug: Map<string, DrugProfile> } {
  const buckets = new Map<string, Bucket>();

  const bucketFor = (key: string): Bucket => {
    let b = buckets.get(key);
    if (!b) {
      b = { aliases: new Set(), byCondition: new Map() };
      buckets.set(key, b);
    }
    return b;
  };

  for (const g of guidelines) {
    if (g.status !== 'current') continue;
    const conditionIds = g.conditionIds.filter((cid) => getCondition(cid));
    if (conditionIds.length === 0) continue;

    // Recommendations → (drug, condition) with line + grade context.
    for (const rec of g.keyRecommendations) {
      for (const raw of rec.drugs ?? []) {
        for (const comp of componentize(raw)) {
          const bucket = bucketFor(comp.key);
          bucket.aliases.add(comp.surface);
          for (const a of comp.aliases) bucket.aliases.add(a);
          for (const cid of conditionIds) {
            const use = ensureGuideline(bucket, cid, g.id);
            if (rec.lineOfTherapy) use.lines.add(rec.lineOfTherapy);
            if (rec.evidenceGrade) use.grades.add(rec.evidenceGrade);
            use.recs.push({ topic: rec.topic, text: rec.text });
          }
        }
      }
    }

    // Dosing rows → attach regimens to the matching (drug, condition).
    for (const dose of getDosing(g.id)) {
      for (const comp of componentize(dose.drug)) {
        const bucket = bucketFor(comp.key);
        bucket.aliases.add(comp.surface);
        for (const a of comp.aliases) bucket.aliases.add(a);
        for (const cid of conditionIds) {
          const use = ensureGuideline(bucket, cid, g.id);
          use.doses.push(dose);
        }
      }
    }
  }

  const lineRank = new Map(LINE_ORDER.map((l, i) => [l, i]));
  const byKey = new Map<string, DrugProfile>();

  for (const [key, bucket] of buckets) {
    const conditions: DrugConditionUse[] = [];
    for (const [cid, byGuideline] of bucket.byCondition) {
      const condition = getCondition(cid);
      if (!condition) continue;
      const uses: DrugGuidelineUse[] = [];
      for (const [gid, u] of byGuideline) {
        const guideline = guidelines.find((g) => g.id === gid)!;
        uses.push({
          guideline,
          country: countryOf(guideline),
          lines: [...u.lines].sort((a, b) => (lineRank.get(a) ?? 99) - (lineRank.get(b) ?? 99)),
          grades: [...u.grades],
          recs: dedupeRecs(u.recs),
          doses: u.doses,
        });
      }
      // Newest guideline first within a condition.
      uses.sort((a, b) => b.guideline.year - a.guideline.year);
      conditions.push({ condition, guidelines: uses });
    }
    // Most-documented condition first, then alphabetical.
    conditions.sort(
      (a, b) => b.guidelines.length - a.guidelines.length || a.condition.nameEn.localeCompare(b.condition.nameEn),
    );

    const name = pickDisplayName(key, bucket.aliases);
    const aliases = [...bucket.aliases]
      .filter((a) => a.toLowerCase() !== name.toLowerCase())
      .sort((a, b) => a.localeCompare(b));

    byKey.set(key, {
      key,
      slug: slugify(key),
      name,
      aliases,
      conditions,
      conditionCount: conditions.length,
      guidelineCount: new Set(conditions.flatMap((c) => c.guidelines.map((u) => u.guideline.id))).size,
    });
  }

  const bySlug = new Map<string, DrugProfile>();
  for (const p of byKey.values()) bySlug.set(p.slug, p);
  return { byKey, bySlug };
}

function dedupeRecs(recs: { topic: string; text: string }[]): { topic: string; text: string }[] {
  const seen = new Set<string>();
  const out: { topic: string; text: string }[] = [];
  for (const r of recs) {
    if (seen.has(r.text)) continue;
    seen.add(r.text);
    out.push(r);
  }
  return out;
}

/** Prefer the English INN (the surface form equal to the canonical key). */
function pickDisplayName(key: string, aliases: Set<string>): string {
  let best: string | null = null;
  for (const a of aliases) {
    const clean = stripParens(a);
    if (clean.toLowerCase() === key) return titleize(clean.toLowerCase()); // exact English INN
    if (!best || clean.length < best.length) best = clean;
  }
  return best ? titleize(best) : titleize(key);
}

const INDEX = buildIndex();

/** All medicines, sorted by name. */
export function allDrugs(): DrugProfile[] {
  return [...INDEX.byKey.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getDrugBySlug(slug: string): DrugProfile | undefined {
  return INDEX.bySlug.get(slug);
}

/**
 * Medicines matching a search query. Matches whole-query and per-token drug
 * keys against the canonical index, so "infliximab", "infliksymab" and
 * "proton pump inhibitor" all resolve. Precise by design (exact key match) to
 * keep the search banner free of noise.
 */
export function drugsForQuery(query: string): DrugProfile[] {
  const candidates = new Set<string>();
  const whole = drugKey(query);
  if (whole) candidates.add(whole);
  for (const token of query.split(/\s+/)) {
    const k = drugKey(token);
    if (k.length >= 4) candidates.add(k);
  }
  const out: DrugProfile[] = [];
  for (const k of candidates) {
    const p = INDEX.byKey.get(k);
    if (p) out.push(p);
  }
  return out.sort((a, b) => b.guidelineCount - a.guidelineCount);
}
