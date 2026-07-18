import type { Guideline } from '../../src/lib/types';

/**
 * US guidelines outside gastroenterology (diabetology, cardiology) — added for
 * breadth and to demonstrate cross-specialty, cross-country comparison
 * (e.g., ADA vs PTD for diabetes, AHA/ACC vs PTNT for hypertension).
 * Hand-curated demo records — verify against source before clinical use.
 */
export const usNonGiGuidelines: Guideline[] = [
  {
    id: 'ada-standards-2026',
    societyId: 'ada',
    conditionIds: ['diabetes-mellitus'],
    title: 'Standards of Care in Diabetes — 2026',
    language: 'en',
    specialty: 'diabetology',
    year: 2026,
    status: 'current',
    sourceUrl: 'https://professional.diabetes.org/standards-of-care',
    citation: 'American Diabetes Association. Diabetes Care. 2026;49(Suppl 1).',
    summary:
      'The ADA\'s annually updated comprehensive standards for diabetes care. Management is patient-centered: metformin and lifestyle for most type 2 diabetes, with GLP-1 receptor agonists and SGLT2 inhibitors prioritized for cardiovascular and kidney benefit independent of HbA1c, plus individualized glycemic targets and systematic complication screening.',
    keyRecommendations: [
      {
        topic: 'Pharmacologic first-line',
        text: 'Choose therapy based on comorbidities: metformin plus lifestyle for many, but GLP-1 RAs and/or SGLT2 inhibitors are first-line in atherosclerotic cardiovascular disease, heart failure, or chronic kidney disease.',
        evidenceGrade: 'Grade A',
        lineOfTherapy: 'first-line',
        drugs: ['metformin', 'semaglutide', 'tirzepatide', 'empagliflozin', 'dapagliflozin'],
      },
      {
        topic: 'Glycemic targets',
        text: 'A general HbA1c goal of <7% for many nonpregnant adults, individualized (stricter or looser) by risk of hypoglycemia, comorbidity, and life expectancy.',
        lineOfTherapy: 'maintenance',
      },
      {
        topic: 'Cardiovascular and kidney protection',
        text: 'Blood pressure and lipid management (statins), plus SGLT2 inhibitors for cardiorenal protection, are recommended to reduce complications.',
        lineOfTherapy: 'supportive',
        drugs: ['statin', 'empagliflozin'],
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
  {
    id: 'aha-acc-hypertension-2025',
    societyId: 'aha-acc',
    conditionIds: ['hypertension'],
    title: '2025 Guideline for the Prevention, Detection, Evaluation and Management of High Blood Pressure in Adults',
    language: 'en',
    specialty: 'cardiology',
    year: 2025,
    status: 'current',
    supersedesId: undefined,
    sourceUrl: 'https://professional.heart.org/en/guidelines-and-statements',
    citation: 'AHA/ACC/multisociety. Circulation / JACC. 2025.',
    summary:
      'Joint US guideline on high blood pressure in adults. Hypertension is defined as ≥130/80 mmHg. Lifestyle modification is foundational for all; pharmacologic therapy is recommended based on blood pressure and cardiovascular risk, typically starting with two agents from thiazide diuretics, ACE inhibitors/ARBs, or calcium channel blockers, targeting <130/80 mmHg.',
    keyRecommendations: [
      {
        topic: 'Definition and diagnosis',
        text: 'Diagnose hypertension at ≥130/80 mmHg using proper technique and out-of-office confirmation; assess overall cardiovascular risk.',
        lineOfTherapy: 'diagnosis',
      },
      {
        topic: 'Lifestyle',
        text: 'Recommend weight loss, the DASH dietary pattern, sodium reduction, physical activity, and moderation of alcohol for all patients.',
        lineOfTherapy: 'first-line',
      },
      {
        topic: 'Pharmacologic therapy',
        text: 'Initiate therapy (often two first-line agents) from thiazide-type diuretics, ACE inhibitors or ARBs, and calcium channel blockers; target <130/80 mmHg for most adults.',
        evidenceGrade: 'Class I recommendation',
        lineOfTherapy: 'first-line',
        drugs: ['chlorthalidone', 'lisinopril', 'losartan', 'amlodipine'],
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
];
