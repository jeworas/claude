import MiniSearch from 'minisearch';
import type { Guideline } from './types';
import { guidelines, getGuideline, getSociety, conditionsForGuideline } from './data';
import { normalize, resolveConditions, type ThesaurusMatch } from './thesaurus';

/**
 * Two-layer retrieval:
 *  1. A deterministic bilingual thesaurus resolves clinical terms/abbreviations
 *     to conditions (EN or PL) and pulls their guidelines — these rank first
 *     and carry a "matched via" explanation.
 *  2. A MiniSearch free-text index catches everything else (drug names,
 *     partial titles, society names) with fuzzy + prefix matching.
 */

export interface SearchResult {
  guideline: Guideline;
  /** Set when the result was reached through the condition thesaurus. */
  matchedVia: ThesaurusMatch | null;
  score: number;
}

interface IndexDoc {
  id: string;
  title: string;
  titleLocal: string;
  summary: string;
  conditionNames: string;
  synonymsFlat: string;
  societyName: string;
  drugs: string;
}

function buildDoc(g: Guideline): IndexDoc {
  const conditions = conditionsForGuideline(g);
  const society = getSociety(g.societyId);
  const conditionNames = conditions.flatMap((c) => [c.nameEn, c.namePl]).join(' ');
  const synonymsFlat = conditions
    .flatMap((c) => [...c.synonymsEn, ...c.synonymsPl, ...c.abbreviations])
    .join(' ');
  const drugs = g.keyRecommendations.flatMap((r) => r.drugs ?? []).join(' ');
  return {
    id: g.id,
    title: g.title,
    titleLocal: g.titleLocal ?? '',
    summary: g.summary,
    conditionNames,
    synonymsFlat,
    societyName: society ? `${society.name} ${society.abbreviation} ${society.nameLocal ?? ''}` : '',
    drugs,
  };
}

let indexSingleton: MiniSearch<IndexDoc> | null = null;

function getIndex(): MiniSearch<IndexDoc> {
  if (indexSingleton) return indexSingleton;
  const index = new MiniSearch<IndexDoc>({
    fields: ['title', 'titleLocal', 'summary', 'conditionNames', 'synonymsFlat', 'societyName', 'drugs'],
    storeFields: ['id'],
    // Normalize each term (lowercase + strip Polish diacritics) at index and query time.
    processTerm: (term) => {
      const n = normalize(term);
      return n.length > 0 ? n : null;
    },
    searchOptions: {
      boost: { title: 4, conditionNames: 3, synonymsFlat: 3, drugs: 2, societyName: 2, summary: 1 },
      fuzzy: 0.2,
      prefix: true,
      combineWith: 'AND',
    },
  });
  index.addAll(guidelines.map(buildDoc));
  indexSingleton = index;
  return index;
}

/**
 * Run a bilingual search. Returns de-duplicated guidelines ranked with
 * thesaurus-resolved matches first, then free-text matches.
 */
export function search(query: string): SearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const byId = new Map<string, SearchResult>();

  // Layer 1 — thesaurus → conditions → guidelines.
  const conditionMatches = resolveConditions(trimmed);
  const bestConditionMatch = new Map<string, ThesaurusMatch>();
  for (const m of conditionMatches) bestConditionMatch.set(m.condition.id, m);

  for (const g of guidelines) {
    let best: ThesaurusMatch | null = null;
    for (const cid of g.conditionIds) {
      const m = bestConditionMatch.get(cid);
      if (m && (!best || m.score > best.score)) best = m;
    }
    if (best) {
      byId.set(g.id, { guideline: g, matchedVia: best, score: best.score * 10 });
    }
  }

  // Layer 2 — free-text index.
  const hits = getIndex().search(trimmed);
  for (const hit of hits) {
    const g = getGuideline(hit.id);
    if (!g) continue;
    const existing = byId.get(g.id);
    if (existing) {
      existing.score += hit.score;
    } else {
      byId.set(g.id, { guideline: g, matchedVia: null, score: hit.score });
    }
  }

  return Array.from(byId.values()).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Tie-break: newer guidelines first.
    return b.guideline.year - a.guideline.year;
  });
}

/** Autocomplete suggestions from the free-text index. */
export function suggest(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  return getIndex()
    .autoSuggest(trimmed, { fuzzy: 0.2 })
    .slice(0, 6)
    .map((s) => s.suggestion);
}
