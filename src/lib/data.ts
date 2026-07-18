import type { Country, Condition, Guideline, Society } from './types';
import { societies } from '../../data/societies';
import { conditions } from '../../data/conditions';
import { guidelines } from '../../data/guidelines';

export { societies, conditions, guidelines };

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

export function guidelinesForSociety(societyId: string): Guideline[] {
  return guidelines.filter((g) => g.societyId === societyId);
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
