import type { Guideline } from '../../src/lib/types';
import { acgGuidelines } from './acg';
import { agaGuidelines } from './aga';
import { ptgeGuidelines } from './ptg-e';
import { polishOtherGuidelines } from './polish-other';
import { usNonGiGuidelines } from './us-non-gi';

/** The full seed corpus of guidelines (US + PL). */
export const guidelines: Guideline[] = [
  ...acgGuidelines,
  ...agaGuidelines,
  ...ptgeGuidelines,
  ...polishOtherGuidelines,
  ...usNonGiGuidelines,
];
