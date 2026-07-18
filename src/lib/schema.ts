import { z } from 'zod';

/**
 * Zod schemas mirroring src/lib/types.ts. Seed data is parsed against these
 * in scripts/validate.ts so a malformed record fails loudly before shipping.
 */

export const countrySchema = z.enum(['US', 'PL', 'EU']);
export const languageSchema = z.enum(['en', 'pl']);
export const guidelineStatusSchema = z.enum(['current', 'superseded']);

export const lineOfTherapySchema = z.enum([
  'diagnosis',
  'screening',
  'first-line',
  'second-line',
  'escalation',
  'maintenance',
  'refractory',
  'prevention',
  'supportive',
]);

const idSchema = z
  .string()
  .min(2)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'ids are lowercase-kebab-case');

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'ISO date (YYYY-MM-DD)');

export const societySchema = z.object({
  id: idSchema,
  name: z.string().min(3),
  nameLocal: z.string().min(3).optional(),
  abbreviation: z.string().min(2),
  country: countrySchema,
  specialties: z.array(z.string().min(2)).min(1),
  homepage: z.string().url(),
  guidelinesIndexUrl: z.string().url(),
  description: z.string().optional(),
});

export const conditionSchema = z.object({
  id: idSchema,
  nameEn: z.string().min(2),
  namePl: z.string().min(2),
  synonymsEn: z.array(z.string().min(1)),
  synonymsPl: z.array(z.string().min(1)),
  abbreviations: z.array(z.string().min(1)),
  icd10: z.array(z.string().min(2)),
  specialty: z.string().min(2),
});

export const recommendationSchema = z.object({
  topic: z.string().min(3),
  text: z.string().min(10),
  evidenceGrade: z.string().optional(),
  lineOfTherapy: lineOfTherapySchema.optional(),
  drugs: z.array(z.string().min(2)).optional(),
});

export const guidelineSchema = z.object({
  id: idSchema,
  societyId: idSchema,
  conditionIds: z.array(idSchema).min(1),
  title: z.string().min(10),
  titleLocal: z.string().min(10).optional(),
  language: languageSchema,
  specialty: z.string().min(2),
  year: z.number().int().gte(1990).lte(2100),
  status: guidelineStatusSchema,
  supersedesId: idSchema.optional(),
  sourceUrl: z.string().url(),
  pdfUrl: z.string().url().optional(),
  citation: z.string().optional(),
  summary: z.string().min(50),
  keyRecommendations: z.array(recommendationSchema).min(1),
  lastVerified: isoDateSchema,
  dataProvenance: z.literal('hand-curated-demo'),
});

export const societiesSchema = z.array(societySchema);
export const conditionsSchema = z.array(conditionSchema);
export const guidelinesSchema = z.array(guidelineSchema);
