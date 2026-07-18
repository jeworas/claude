import type { Country, Condition, DoseEntry, Guideline, Society } from './types';
import { societies } from '../../data/societies';
import { conditions } from '../../data/conditions';
import { guidelines } from '../../data/guidelines';
import { SUPERSEDED_BY } from '../../data/guidelines/lineage';
import { dosingByGuideline } from '../../data/dosing';

export { societies, conditions, guidelines };

/** Standard dosing reference for a guideline (empty if none curated yet). */
export function getDosing(guidelineId: string): DoseEntry[] {
  return dosingByGuideline[guidelineId] ?? [];
}

/** Follow the supersession chain (older → newer) to the terminal current edition. */
function headOf(id: string): string {
  let cur = id;
  const seen = new Set<string>();
  while (SUPERSEDED_BY[cur] && !seen.has(cur)) {
    seen.add(cur);
    cur = SUPERSEDED_BY[cur];
  }
  return cur;
}

const societyById = new Map(societies.map((s) => [s.id, s]));
const conditionById = new Map(conditions.map((c) => [c.id, c]));
const guidelineById = new Map(guidelines.map((g) => [g.id, g]));

export function getSociety(id: string): Society | undefined {
  return societyById.get(id);
}

export function getCondition(id: string): Condition | undefined {
  return conditionById.get(id);
}

export function getGuideline(id: string): Guideline | undefined {
  return guidelineById.get(id);
}

/** A guideline's country is derived from its issuing society. */
export function countryOf(guideline: Guideline): Country {
  return societyById.get(guideline.societyId)?.country ?? 'US';
}

export function guidelinesForCondition(conditionId: string): Guideline[] {
  return guidelines.filter((g) => g.conditionIds.includes(conditionId));
}

/** Only the current (non-superseded) guidelines for a condition. */
export function currentGuidelinesForCondition(conditionId: string): Guideline[] {
  return guidelinesForCondition(conditionId).filter((g) => g.status === 'current');
}

export interface Lineage {
  society: Society;
  /** All versions of this society's guidance for a condition, oldest → newest. */
  versions: Guideline[];
}

/**
 * True revision lineages for a condition, ordered oldest → newest. A lineage is
 * a chain of successive *editions* of the same guideline (linked by the
 * supersession map), not merely different documents from one society that touch
 * the condition. Only chains with more than one edition are returned.
 */
export function lineagesForCondition(conditionId: string): Lineage[] {
  const groups = new Map<string, Guideline[]>();
  for (const g of guidelinesForCondition(conditionId)) {
    const head = headOf(g.id);
    const list = groups.get(head) ?? [];
    list.push(g);
    groups.set(head, list);
  }
  const lineages: Lineage[] = [];
  for (const versions of groups.values()) {
    if (versions.length < 2) continue;
    versions.sort((a, b) => a.year - b.year);
    const society = societyById.get(versions[versions.length - 1].societyId);
    if (society) lineages.push({ society, versions });
  }
  return lineages.sort((a, b) => b.versions.length - a.versions.length);
}

export function guidelinesForSociety(societyId: string): Guideline[] {
  return guidelines.filter((g) => g.societyId === societyId);
}

/** Only current (non-superseded) guidelines from a society. */
export function currentGuidelinesForSociety(societyId: string): Guideline[] {
  return guidelinesForSociety(societyId).filter((g) => g.status === 'current');
}

/** For a superseded guideline, the current edition that replaced it (via the lineage map). */
export function currentReplacementFor(guideline: Guideline): Guideline | undefined {
  if (guideline.status === 'current') return undefined;
  const head = guidelineById.get(headOf(guideline.id));
  return head && head.id !== guideline.id && head.status === 'current' ? head : undefined;
}

export function conditionsForGuideline(guideline: Guideline): Condition[] {
  return guideline.conditionIds
    .map((id) => conditionById.get(id))
    .filter((c): c is Condition => Boolean(c));
}

/** Distinct specialties present in the dataset, sorted. */
export function allSpecialties(): string[] {
  return Array.from(new Set(guidelines.map((g) => g.specialty))).sort();
}

/** A guideline is considered aging when older than this many years. */
export const AGING_THRESHOLD_YEARS = 5;

export function isAging(guideline: Guideline, now = 2026): boolean {
  return now - guideline.year > AGING_THRESHOLD_YEARS;
}
