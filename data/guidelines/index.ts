import type { Guideline } from '../../src/lib/types';
import { acgGuidelines } from './acg';
import { agaGuidelines } from './aga';
import { ptgeGuidelines } from './ptg-e';
import { polishOtherGuidelines } from './polish-other';
import { usNonGiGuidelines } from './us-non-gi';
import { euGuidelines } from './eu';
import { historicalGuidelines } from './historical';

/**
 * The full seed corpus of guidelines (US + PL + EU), including prior
 * (superseded) editions used by the revision timeline. Superseded editions are
 * excluded from search; see src/lib/search.ts and src/lib/data.ts.
 */
export const guidelines: Guideline[] = [
  ...acgGuidelines,
  ...agaGuidelines,
  ...ptgeGuidelines,
  ...polishOtherGuidelines,
  ...usNonGiGuidelines,
  ...euGuidelines,
  ...historicalGuidelines,
];
