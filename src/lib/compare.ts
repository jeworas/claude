import type { Country, Guideline, LineOfTherapy, Recommendation } from './types';
import { countryOf, currentGuidelinesForCondition } from './data';

/**
 * Cross-region comparison for a condition. Aligns each society's current
 * recommendations onto a shared grid of therapy lines (rows) × regions
 * (columns), and flags where regions converge on the same drug vs. diverge.
 *
 * The convergence signal is computed from a *language-normalized* drug key, so
 * a Polish "infliksymab" and an English "infliximab" count as agreement.
 */

export const LINE_ORDER: LineOfTherapy[] = [
  'diagnosis',
  'screening',
  'first-line',
  'second-line',
  'escalation',
  'maintenance',
  'refractory',
  'prevention',
  'supportive',
];

export const LINE_LABEL: Record<LineOfTherapy, string> = {
  diagnosis: 'Diagnosis',
  screening: 'Screening',
  'first-line': 'First-line',
  'second-line': 'Second-line',
  escalation: 'Escalation',
  maintenance: 'Maintenance',
  refractory: 'Refractory',
  prevention: 'Prevention',
  supportive: 'Supportive',
};

/** Column order for the comparison. */
export const REGION_ORDER: Country[] = ['US', 'EU', 'UK', 'PL', 'INT'];

const POLISH_MAP: Record<string, string> = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
};

/**
 * Map a drug name (English or Polish INN spelling, brand-agnostic) to a
 * canonical key so cross-language matches collapse. Covers the drug classes
 * that actually appear in the dataset (IBD biologics/small molecules, steroids,
 * 5-ASA, H. pylori and C. diff antibiotics, PPIs, diabetes agents).
 */
const DRUG_SYNONYMS: Record<string, string> = {
  infliksymab: 'infliximab',
  wedolizumab: 'vedolizumab',
  ryzankizumab: 'risankizumab',
  tofacytynib: 'tofacitinib',
  upadacytynib: 'upadacitinib',
  budezonid: 'budesonide',
  mesalazyna: 'mesalamine',
  mesalazine: 'mesalamine',
  sulfasalazyna: 'sulfasalazine',
  prednizon: 'prednisone',
  prednizolon: 'prednisolone',
  metyloprednizolon: 'methylprednisolone',
  hydrokortyzon: 'hydrocortisone',
  azatiopryna: 'azathioprine',
  merkaptopuryna: 'mercaptopurine',
  metotreksat: 'methotrexate',
  cyklosporyna: 'cyclosporine',
  ciclosporin: 'cyclosporine',
  metronidazol: 'metronidazole',
  cyprofloksacyna: 'ciprofloxacin',
  wankomycyna: 'vancomycin',
  fidaksomycyna: 'fidaxomicin',
  ryfaksymina: 'rifaximin',
  omeprazol: 'omeprazole',
  pantoprazol: 'pantoprazole',
  ezomeprazol: 'esomeprazole',
  amoksycylina: 'amoxicillin',
  tetracyklina: 'tetracycline',
  bizmut: 'bismuth',
  lewofloksacyna: 'levofloxacin',
  klarytromycyna: 'clarithromycin',
  '5-asa': '5-aminosalicylate',
  '5-aminosalicylates': '5-aminosalicylate',
  // Diabetes / cardiometabolic agents that appear in the ADA/PTD and
  // hypertension/lipid guidelines, so Polish and English spellings collapse.
  metformina: 'metformin',
  empagliflozyna: 'empagliflozin',
  dapagliflozyna: 'dapagliflozin',
  kanagliflozyna: 'canagliflozin',
  semaglutyd: 'semaglutide',
  dulaglutyd: 'dulaglutide',
  liraglutyd: 'liraglutide',
  tyrzepatyd: 'tirzepatide',
  peryndopryl: 'perindopril',
  ramipryl: 'ramipril',
  lizynopryl: 'lisinopril',
  amlodypina: 'amlodipine',
  indapamid: 'indapamide',
  spironolakton: 'spironolactone',
  chlortalidon: 'chlorthalidone',
  // Nephroprotection agents from the PTN non-diabetic CKD statement.
  benazepryl: 'benazepril',
  furosemid: 'furosemide',
  torasemid: 'torasemide',
  hydrochlorotiazyd: 'hydrochlorothiazide',
  tolwaptan: 'tolvaptan',
  'agalzydaza alfa': 'agalsidase alfa',
  'agalzydaza beta': 'agalsidase beta',
  'wodoroweglan sodu': 'sodium bicarbonate',
  // Dermatology agents from the PTDerm atopic dermatitis recommendations.
  takrolimus: 'tacrolimus',
  pimekrolimus: 'pimecrolimus',
  emolient: 'emollient',
  emolienty: 'emollient',
  glikokortykosteroidy: 'corticosteroid',
  glikokortykosteroid: 'corticosteroid',
  statyna: 'statin',
  statyny: 'statin',
  statins: 'statin',
};

export function drugKey(name: string): string {
  const n = name
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => POLISH_MAP[c] ?? c)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bmmx\b/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
  return DRUG_SYNONYMS[n] ?? n;
}

export interface CellEntry {
  guideline: Guideline;
  rec: Recommendation;
}

export interface CompareRow {
  line: LineOfTherapy;
  label: string;
  /** Recommendations per region for this therapy line. */
  byRegion: Map<Country, CellEntry[]>;
  /** Normalized drug keys that appear in ≥2 regions on this line (consensus). */
  consensusKeys: Set<string>;
}

export interface ComparisonMatrix {
  regions: Country[];
  rows: CompareRow[];
  /** True when at least two regions have guidance to compare. */
  hasComparison: boolean;
}

/** Is this drug (by normalized key) part of the cross-region consensus on its row? */
export function isConsensus(row: CompareRow, drug: string): boolean {
  return row.consensusKeys.has(drugKey(drug));
}

export function buildComparison(conditionId: string): ComparisonMatrix {
  const guidelines = currentGuidelinesForCondition(conditionId);

  const presentRegions = REGION_ORDER.filter((r) =>
    guidelines.some((g) => countryOf(g) === r),
  );

  const rows: CompareRow[] = [];
  for (const line of LINE_ORDER) {
    const byRegion = new Map<Country, CellEntry[]>();
    for (const region of presentRegions) {
      const entries: CellEntry[] = [];
      for (const g of guidelines) {
        if (countryOf(g) !== region) continue;
        for (const rec of g.keyRecommendations) {
          if (rec.lineOfTherapy === line) entries.push({ guideline: g, rec });
        }
      }
      if (entries.length) byRegion.set(region, entries);
    }
    if (byRegion.size === 0) continue;

    // Consensus: drug keys appearing in ≥2 regions on this line.
    const regionsForKey = new Map<string, Set<Country>>();
    for (const [region, entries] of byRegion) {
      for (const e of entries) {
        for (const d of e.rec.drugs ?? []) {
          const k = drugKey(d);
          if (!regionsForKey.has(k)) regionsForKey.set(k, new Set());
          regionsForKey.get(k)!.add(region);
        }
      }
    }
    const consensusKeys = new Set<string>();
    for (const [k, regions] of regionsForKey) if (regions.size >= 2) consensusKeys.add(k);

    rows.push({ line, label: LINE_LABEL[line], byRegion, consensusKeys });
  }

  return { regions: presentRegions, rows, hasComparison: presentRegions.length >= 2 };
}
