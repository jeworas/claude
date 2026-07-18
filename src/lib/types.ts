/**
 * Core data model for the Guideline Atlas proof of concept.
 *
 * Everything is plain, JSON-serializable data: the PoC ships its dataset as
 * typed modules under /data and validates them with Zod at build time
 * (see src/lib/schema.ts and scripts/validate.ts).
 */

/** Region a society belongs to. 'EU' covers pan-European bodies (ECCO, UEG). */
export type Country = 'US' | 'PL' | 'EU';
export type Language = 'en' | 'pl';
export type GuidelineStatus = 'current' | 'superseded';

export type LineOfTherapy =
  | 'diagnosis'
  | 'screening'
  | 'first-line'
  | 'second-line'
  | 'escalation'
  | 'maintenance'
  | 'refractory'
  | 'prevention'
  | 'supportive';

/** A professional medical society / body that publishes guidelines. */
export interface Society {
  id: string;
  /** Official English name. */
  name: string;
  /** Native-language name, if different (e.g. Polish societies). */
  nameLocal?: string;
  abbreviation: string;
  country: Country;
  specialties: string[];
  homepage: string;
  /** The page where the society lists its guidelines — what the update-checker watches. */
  guidelinesIndexUrl: string;
  description?: string;
}

/**
 * A clinical condition/topic. This is the bilingual thesaurus that makes
 * search work in English and Polish: every name, synonym and abbreviation
 * resolves to the same condition.
 */
export interface Condition {
  id: string;
  nameEn: string;
  namePl: string;
  synonymsEn: string[];
  synonymsPl: string[];
  /** Short language-agnostic tokens (UC, WZJG, GERD…). Matched exactly, not by substring. */
  abbreviations: string[];
  icd10: string[];
  specialty: string;
}

/** One key recommendation extracted from a guideline, with attribution context. */
export interface Recommendation {
  /** e.g. "Induction of remission — mild-to-moderate disease" */
  topic: string;
  text: string;
  /** Free-form grade as stated by the guideline, e.g. "Strong recommendation, moderate-quality evidence". */
  evidenceGrade?: string;
  lineOfTherapy?: LineOfTherapy;
  drugs?: string[];
}

export interface Guideline {
  id: string;
  societyId: string;
  conditionIds: string[];
  /** Exact published title. */
  title: string;
  /** Native-language title for Polish guidelines. */
  titleLocal?: string;
  language: Language;
  specialty: string;
  /** Publication year of this version. */
  year: number;
  status: GuidelineStatus;
  /** If this guideline replaces an earlier one that is also in the dataset. */
  supersedesId?: string;
  /** Canonical link to read the full guideline. */
  sourceUrl: string;
  pdfUrl?: string;
  citation?: string;
  /** 2–4 sentence plain-language overview. */
  summary: string;
  keyRecommendations: Recommendation[];
  /** ISO date when a human last checked this record against the source. */
  lastVerified: string;
  /**
   * Provenance marker. In the PoC every record is hand-curated demo content
   * and the UI surfaces a "verify against source" disclaimer because of it.
   */
  dataProvenance: 'hand-curated-demo';
}
