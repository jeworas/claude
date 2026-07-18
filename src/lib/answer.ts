import type { DoseEntry, Guideline, LineOfTherapy, Recommendation } from './types';
import { guidelines, currentGuidelinesForCondition, getDosing, countryOf } from './data';
import { resolveConditions, normalize } from './thesaurus';
import { drugKey } from './compare';

/**
 * "Quick answer" for a *specific* query (e.g. "celiac dosage", "ulcerative
 * colitis first line", "budesonide dose"). Resolves the condition and the
 * intent, then surfaces the single most relevant recommendation and/or dosing —
 * an offline stand-in for true source-passage retrieval, which needs the full
 * guideline text (unavailable until live ingestion). Only fires when the query
 * carries a specific intent; a bare condition returns null and falls back to
 * normal search results.
 */

export type Intent =
  | 'dosing'
  | 'first-line'
  | 'diagnosis'
  | 'screening'
  | 'maintenance'
  | 'drug';

// Intent keyword sets (English + Polish).
const INTENT_KEYWORDS: Record<Intent, string[]> = {
  dosing: ['dose', 'dosing', 'dosage', 'doses', 'dawka', 'dawkowanie', 'dawke', 'mg'],
  'first-line': ['first line', 'firstline', 'first-line', 'induction', 'pierwszego rzutu', 'indukcja'],
  diagnosis: ['diagnosis', 'diagnose', 'diagnostic', 'rozpoznanie', 'diagnostyka'],
  screening: ['screening', 'screen', 'surveillance', 'przesiew', 'nadzor'],
  maintenance: ['maintenance', 'maintain', 'podtrzymuj', 'podtrzymanie'],
  drug: [],
};

// Known drug keys present anywhere in the dataset (from recommendations + dosing).
const KNOWN_DRUG_KEYS: Set<string> = new Set();
for (const g of guidelines) {
  for (const r of g.keyRecommendations) for (const d of r.drugs ?? []) KNOWN_DRUG_KEYS.add(drugKey(d));
  for (const d of getDosing(g.id)) KNOWN_DRUG_KEYS.add(drugKey(d.drug));
}

export interface AnswerEntry {
  guideline: Guideline;
  rec?: Recommendation;
  doses?: DoseEntry[];
}

export interface Answer {
  conditionId: string;
  conditionName: string;
  intent: Intent;
  /** The specific drug the user asked about, if any (original query token). */
  drug?: string;
  entries: AnswerEntry[];
}

const LINE_FOR_INTENT: Partial<Record<Intent, LineOfTherapy>> = {
  'first-line': 'first-line',
  diagnosis: 'diagnosis',
  screening: 'screening',
  maintenance: 'maintenance',
};

function detectIntent(q: string): { intent: Intent | null; drug?: string; drugK?: string } {
  // Drug match: any query token whose normalized key is a known drug.
  for (const token of q.split(' ')) {
    const k = drugKey(token);
    if (k.length >= 4 && KNOWN_DRUG_KEYS.has(k)) {
      return { intent: 'drug', drug: token, drugK: k };
    }
  }
  for (const intent of ['dosing', 'first-line', 'diagnosis', 'screening', 'maintenance'] as Intent[]) {
    if (INTENT_KEYWORDS[intent].some((kw) => q.includes(normalize(kw)))) return { intent };
  }
  return { intent: null };
}

/** Remove intent/drug words so the remainder resolves cleanly to a condition. */
function conditionRemainder(q: string): string {
  const stop = new Set<string>();
  for (const kws of Object.values(INTENT_KEYWORDS)) for (const kw of kws) {
    for (const t of normalize(kw).split(' ')) stop.add(t);
  }
  return q
    .split(' ')
    .filter((t) => !stop.has(t) && !KNOWN_DRUG_KEYS.has(drugKey(t)))
    .join(' ')
    .trim();
}

export function answerFor(query: string): Answer | null {
  const q = normalize(query);
  if (!q) return null;

  const { intent, drug, drugK } = detectIntent(q);
  if (!intent) return null; // not a specific query — use normal results

  // Resolve the condition from the query minus intent/drug words (fall back to full query).
  const remainder = conditionRemainder(q);
  const matches = resolveConditions(remainder || q);
  const condition = matches[0]?.condition;

  // Drug-only query with no condition → answer by drug across the dataset.
  if (!condition && intent === 'drug' && drugK) {
    const entries = collectDrugDoses(drugK).slice(0, 3);
    if (entries.length === 0) return null;
    return {
      conditionId: '',
      conditionName: drug ?? '',
      intent,
      drug,
      entries,
    };
  }
  if (!condition) return null;

  const guidelines = currentGuidelinesForCondition(condition.id).sort(
    (a, b) => rank(b) - rank(a),
  );
  const entries: AnswerEntry[] = [];

  // 1) dosing / named-drug → dose tables
  if (intent === 'dosing' || intent === 'drug') {
    for (const g of guidelines) {
      let doses = getDosing(g.id);
      if (drugK) doses = doses.filter((d) => drugKey(d.drug) === drugK);
      if (doses.length) {
        entries.push({ guideline: g, doses });
        if (entries.length >= 2) break;
      }
    }
  }

  // 2) line-of-therapy intents — and a fallback for dosing queries where the
  //    treatment isn't a drug (e.g. celiac → gluten-free diet as first-line).
  let line = LINE_FOR_INTENT[intent];
  if (!line && intent === 'dosing' && entries.length === 0) line = 'first-line';
  if (line) {
    for (const g of guidelines) {
      const rec = g.keyRecommendations.find((r) => r.lineOfTherapy === line);
      if (rec) {
        entries.push({ guideline: g, rec, doses: getDosing(g.id).slice(0, 3) });
        if (entries.length >= 2) break;
      }
    }
  }

  // 3) named-drug fallback: a recommendation that mentions the drug
  if (intent === 'drug' && drugK && entries.length === 0) {
    for (const g of guidelines) {
      const rec = g.keyRecommendations.find((r) => (r.drugs ?? []).some((d) => drugKey(d) === drugK));
      if (rec) {
        entries.push({ guideline: g, rec });
        if (entries.length >= 2) break;
      }
    }
  }

  if (entries.length === 0) return null;
  return {
    conditionId: condition.id,
    conditionName: condition.nameEn,
    intent,
    drug,
    entries,
  };
}

/** Prefer newer guidelines and those that carry dosing. */
function rank(g: Guideline): number {
  let s = g.year;
  if (getDosing(g.id).length) s += 1000;
  if (countryOf(g) === 'US') s += 5; // ACG/AGA tend to carry the most dosing detail
  return s;
}

function collectDrugDoses(drugK: string): AnswerEntry[] {
  const out: AnswerEntry[] = [];
  for (const g of guidelines) {
    if (g.status !== 'current') continue;
    const doses = getDosing(g.id).filter((d) => drugKey(d.drug) === drugK);
    if (doses.length) out.push({ guideline: g, doses });
  }
  return out;
}
