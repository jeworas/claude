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
  {
    id: 'nkf-ckd-changepack-2023',
    societyId: 'nkf',
    conditionIds: ['chronic-kidney-disease'],
    title:
      'CKD Change Package: Population Health Strategies for Cardiovascular and Kidney Disease Risk Reduction (2023)',
    language: 'en',
    specialty: 'nephrology',
    year: 2023,
    status: 'current',
    sourceUrl: 'https://www.kidney.org/professionals/guidelines',
    citation:
      'National Kidney Foundation. CKD Change Package: Population Health Strategies for Cardiovascular and Kidney Disease Risk Reduction. 2023.',
    summary:
      'An NKF population-health resource that operationalizes evidence-based CKD detection and risk reduction in primary care. It defines CKD by the 2021 race-free CKD-EPI eGFR and urine albumin-to-creatinine ratio (uACR), stages risk on the GFR-albuminuria grid, and prioritizes blood-pressure control, renin-angiotensin blockade for albuminuria, and SGLT2 inhibitors for cardiorenal protection, with clear nephrology-referral criteria.',
    keyRecommendations: [
      {
        topic: 'Definition and testing',
        text: 'Define CKD as an eGFR below 60 mL/min/1.73m² and/or markers of kidney damage (such as albuminuria) persisting for at least 3 months; assess with the 2021 race-free CKD-EPI eGFR plus a spot urine albumin-to-creatinine ratio (uACR).',
        lineOfTherapy: 'diagnosis',
      },
      {
        topic: 'Who to screen',
        text: 'Screen those at highest risk — people with diabetes and/or hypertension — with both eGFR and uACR, and stage risk of progression using the GFR–albuminuria (CGA) grid.',
        lineOfTherapy: 'screening',
      },
      {
        topic: 'Blood pressure and RAAS blockade',
        text: 'Target standardized office systolic BP < 120 mmHg when tolerated (otherwise < 130). Use an ACE inhibitor or ARB first-line when diabetes or albuminuria (uACR > 30, A2/A3) is present, and a thiazide, calcium-channel blocker, or ACE-I/ARB when uACR < 30; avoid combining ACE-I, ARB and a direct renin inhibitor.',
        lineOfTherapy: 'first-line',
        drugs: ['ACE inhibitor', 'ARB', 'thiazide', 'calcium channel blocker'],
      },
      {
        topic: 'Cardiorenal protection',
        text: 'Prioritize SGLT2 inhibitors for their cardiovascular and kidney benefit in CKD, and consider GLP-1 receptor agonists and a non-steroidal mineralocorticoid receptor antagonist as evidence-based options; continue metformin where eGFR is within prescribing limits.',
        lineOfTherapy: 'first-line',
        drugs: ['SGLT2 inhibitor', 'GLP-1 receptor agonist', 'non-steroidal MRA', 'metformin'],
      },
      {
        topic: 'Medication safety',
        text: 'Review renally-cleared and nephrotoxic drugs: avoid NSAIDs, hold metformin around iodinated-contrast procedures and reduce its dose at low eGFR, and dose medications against the current eGFR.',
        lineOfTherapy: 'supportive',
        drugs: ['metformin'],
      },
      {
        topic: 'Nephrology referral',
        text: 'Refer to nephrology for an eGFR below 30 mL/min/1.73m², severe albuminuria, a sustained eGFR decline greater than 5 mL/min/1.73m²/year, or a fall in eGFR over 25%; refer for medical nutrition therapy as needed.',
        lineOfTherapy: 'supportive',
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
  {
    id: 'acr-aao-hcq-retinopathy-2020',
    societyId: 'acr',
    conditionIds: ['hydroxychloroquine-retinopathy'],
    title: 'ACR/AAD/RDS/AAO Joint Statement on Hydroxychloroquine Use With Respect to Retinal Toxicity (2020)',
    language: 'en',
    specialty: 'ophthalmology',
    year: 2020,
    status: 'current',
    sourceUrl: 'https://rheumatology.org/clinical-practice-guidelines',
    citation:
      'Rosenbaum JT, Costenbader KH, Desmarais J, et al. ACR/AAD/RDS/AAO 2020 Joint Statement on Hydroxychloroquine Use with Respect to Retinal Toxicity. Arthritis & Rheumatology, 2021.',
    summary:
      'A joint statement from the American College of Rheumatology, American Academy of Dermatology, Rheumatologic Dermatology Society and American Academy of Ophthalmology on minimizing retinal toxicity from long-term hydroxychloroquine (HCQ). It sets a dosing ceiling of ≤5 mg/kg/day of actual body weight (retinal-toxicity risk under 2% at 10 years) and calls for a baseline retinal exam followed by annual screening — beginning no later than 5 years — with optical coherence tomography and automated visual fields. Renal impairment and concurrent tamoxifen raise risk; HCQ should not be stopped for uncertain findings.',
    keyRecommendations: [
      {
        topic: 'Dosing ceiling',
        text: 'Keep hydroxychloroquine at ≤5 mg/kg/day of actual body weight; at this dose the risk of retinal toxicity is under 2% for up to 10 years and rises with higher daily dose and greater cumulative exposure.',
        evidenceGrade: 'Joint society consensus',
        lineOfTherapy: 'prevention',
        drugs: ['hydroxychloroquine'],
      },
      {
        topic: 'Baseline screening',
        text: 'Perform a baseline retinal examination within the first months of starting HCQ to exclude pre-existing retinal disease that could confound later monitoring.',
        lineOfTherapy: 'screening',
      },
      {
        topic: 'Ongoing screening',
        text: 'Without major risk factors, defer annual screening until 5 years of use, then screen yearly with optical coherence tomography and automated visual fields (central 10-2 fields; broader OCT/fields for East Asian patients, who may show pericentral involvement).',
        lineOfTherapy: 'screening',
      },
      {
        topic: 'Risk factors',
        text: 'Higher daily dose per body weight, larger cumulative dose, renal insufficiency (reduced clearance) and concurrent tamoxifen all increase risk; patients with renal impairment may need lower doses and closer monitoring.',
        lineOfTherapy: 'supportive',
        drugs: ['hydroxychloroquine', 'tamoxifen'],
      },
      {
        topic: 'Managing borderline findings',
        text: 'Do not stop HCQ for uncertain or borderline findings — retinopathy progresses slowly, so recheck; discontinuation should be a shared decision among patient, prescriber and eye-care provider, weighing rheumatic-disease control against the risk of visual loss.',
        lineOfTherapy: 'supportive',
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
];
