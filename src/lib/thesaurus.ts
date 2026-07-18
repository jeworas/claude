import type { Condition } from './types';
import { conditions } from '../../data/conditions';

/**
 * Deterministic bilingual condition resolver.
 *
 * It runs *before* the fuzzy free-text index so that exact clinical terms and
 * abbreviations — in English or Polish — always resolve to the right
 * condition. "colitis", "UC", "WZJG" and "wrzodziejące zapalenie jelita
 * grubego" all map to Ulcerative colitis; "colitis" additionally fans out to
 * every condition whose terms contain the word (C. difficile, microscopic,
 * Crohn's colitis).
 */

export type MatchSource =
  | 'name-en'
  | 'name-pl'
  | 'synonym-en'
  | 'synonym-pl'
  | 'abbreviation';

export interface ThesaurusMatch {
  condition: Condition;
  /** Original (pre-normalization) term that matched, for display. */
  matchedTerm: string;
  matchSource: MatchSource;
  /** Higher is a better/closer match. */
  score: number;
}

/** Minimum query length before we allow loose substring matching (avoids noise from 2–3 letter fragments). */
const MIN_SUBSTRING_LEN = 4;

const POLISH_MAP: Record<string, string> = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
};

/**
 * Normalize text for matching: lowercase, map Polish letters, strip remaining
 * diacritics, replace punctuation with spaces, collapse whitespace.
 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (ch) => POLISH_MAP[ch] ?? ch)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

interface Term {
  original: string;
  normalized: string;
  source: MatchSource;
}

function termsFor(condition: Condition): Term[] {
  const terms: Term[] = [
    { original: condition.nameEn, normalized: normalize(condition.nameEn), source: 'name-en' },
    { original: condition.namePl, normalized: normalize(condition.namePl), source: 'name-pl' },
    ...condition.synonymsEn.map((s) => ({ original: s, normalized: normalize(s), source: 'synonym-en' as const })),
    ...condition.synonymsPl.map((s) => ({ original: s, normalized: normalize(s), source: 'synonym-pl' as const })),
  ];
  return terms.filter((t) => t.normalized.length > 0);
}

// Precompute term/abbreviation indexes once at module load.
const conditionTerms = new Map<string, Term[]>(
  conditions.map((c) => [c.id, termsFor(c)]),
);
const conditionAbbrevs = new Map<string, { original: string; normalized: string }[]>(
  conditions.map((c) => [
    c.id,
    c.abbreviations.map((a) => ({ original: a, normalized: normalize(a) })),
  ]),
);

/**
 * Resolve a raw query to matching conditions, ranked by match quality.
 * Returns at most one match per condition (the best one found).
 */
export function resolveConditions(query: string): ThesaurusMatch[] {
  const q = normalize(query);
  if (!q) return [];

  const best = new Map<string, ThesaurusMatch>();
  const consider = (m: ThesaurusMatch) => {
    const prev = best.get(m.condition.id);
    if (!prev || m.score > prev.score) best.set(m.condition.id, m);
  };

  for (const condition of conditions) {
    // 1) Abbreviations: exact token match only (e.g. "UC", "WZJG", "GERD").
    for (const abbr of conditionAbbrevs.get(condition.id) ?? []) {
      if (abbr.normalized && abbr.normalized === q) {
        consider({ condition, matchedTerm: abbr.original, matchSource: 'abbreviation', score: 100 });
      }
    }

    // 2) Names & synonyms: exact, prefix, or substring (either direction).
    for (const term of conditionTerms.get(condition.id) ?? []) {
      const t = term.normalized;
      let score = 0;
      if (t === q) {
        score = 90;
      } else if (q.length >= MIN_SUBSTRING_LEN && t.startsWith(q)) {
        score = 70;
      } else if (q.length >= MIN_SUBSTRING_LEN && t.includes(q)) {
        score = 55;
      } else if (t.length >= MIN_SUBSTRING_LEN && q.includes(t)) {
        // Query is longer and contains a known term (e.g. "acute ulcerative colitis" → "ulcerative colitis").
        score = 60;
      }
      if (score > 0) {
        consider({ condition, matchedTerm: term.original, matchSource: term.source, score });
      }
    }
  }

  return Array.from(best.values()).sort((a, b) => b.score - a.score);
}

/** Human-readable label for how a match was made (for the "matched via" hint). */
export function matchSourceLabel(source: MatchSource): string {
  switch (source) {
    case 'name-en': return 'English name';
    case 'name-pl': return 'Polish name';
    case 'synonym-en': return 'English synonym';
    case 'synonym-pl': return 'Polish synonym';
    case 'abbreviation': return 'abbreviation';
  }
}
