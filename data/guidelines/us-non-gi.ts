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
  {
    id: 'ata-anaplastic-thyroid-cancer-2020',
    societyId: 'ata',
    conditionIds: ['anaplastic-thyroid-cancer'],
    title: '2021 ATA Guidelines for Management of Patients with Anaplastic Thyroid Cancer',
    language: 'en',
    specialty: 'oncology',
    year: 2021,
    status: 'current',
    sourceUrl: 'https://www.thyroid.org/professionals/ata-professional-guidelines/',
    citation:
      'Bible KC, Kebebew E, Brierley J, et al. 2021 American Thyroid Association Guidelines for Management of Patients with Anaplastic Thyroid Cancer. Thyroid 2021;31(3):337–386.',
    summary:
      'The ATA guideline for anaplastic thyroid cancer (ATC), a rare and highly aggressive malignancy requiring urgent multidisciplinary care. It calls for biopsy-confirmed diagnosis with expedited BRAF V600E and molecular profiling, rapid preoperative staging and airway assessment, surgical resection for confined resectable disease, IMRT with systemic chemotherapy for locoregional control, mutation-directed systemic therapy for advanced disease (BRAF/MEK, NTRK, RET and immune-checkpoint targets), and early goals-of-care, palliative and hospice involvement.',
    keyRecommendations: [
      {
        topic: 'Diagnosis',
        text: 'Suspect ATC in any rapidly enlarging thyroid mass and confirm it by biopsy — FNA cytology, with core biopsy when the cytological yield is insufficient — before surgery, since resection may be inappropriate.',
        lineOfTherapy: 'diagnosis',
      },
      {
        topic: 'Molecular testing',
        text: 'At diagnosis, expedite BRAF V600E assessment by immunohistochemistry with molecular confirmation and profile for NTRK/RET fusions and PD-L1 to guide targeted therapy; loss of p53 (TP53) and TERT-promoter alterations are characteristic.',
        lineOfTherapy: 'diagnosis',
      },
      {
        topic: 'Preoperative evaluation',
        text: 'Complete laboratory testing (CBC, CMP, TSH/FT4) and cross-sectional staging — CT of neck, chest, abdomen and pelvis with contrast (or MRI), FDG-PET/CT where available, and brain MRI if indicated — plus vocal-cord evaluation, without delaying primary treatment.',
        lineOfTherapy: 'diagnosis',
      },
      {
        topic: 'Airway and surgery',
        text: 'Assess the airway immediately (reserve tracheostomy for impending obstruction rather than pre-emptive placement); for confined, resectable stage IVA/IVB disease aim for an R0/R1 resection, avoiding radical resection given the poor prognosis.',
        lineOfTherapy: 'first-line',
      },
      {
        topic: 'Radiotherapy and chemotherapy',
        text: 'After R0/R1 resection, or for unresectable non-metastatic disease in good performance status, offer intensity-modulated radiotherapy (starting within 6 weeks of surgery) with concurrent systemic therapy — a taxane (paclitaxel or docetaxel), with or without an anthracycline (doxorubicin) or platinum (cisplatin or carboplatin).',
        lineOfTherapy: 'first-line',
        drugs: ['paclitaxel', 'docetaxel', 'doxorubicin', 'cisplatin', 'carboplatin'],
      },
      {
        topic: 'BRAF-targeted therapy',
        text: 'For BRAF V600E-mutated ATC, start BRAF/MEK-inhibitor therapy (dabrafenib plus trametinib), which can achieve rapid tumour control and be used neoadjuvantly to enable subsequent surgery.',
        evidenceGrade: 'Strong recommendation',
        lineOfTherapy: 'first-line',
        drugs: ['dabrafenib', 'trametinib'],
      },
      {
        topic: 'Advanced disease by molecular target',
        text: 'For unresectable stage IVB/IVC, bridge with cytotoxic chemotherapy while awaiting molecular results; treat NTRK fusions with larotrectinib or entrectinib, RET fusions with selpercatinib or pralsetinib, and high PD-L1 tumours with an immune-checkpoint inhibitor (pembrolizumab) — preferably within a clinical trial.',
        lineOfTherapy: 'escalation',
        drugs: ['larotrectinib', 'entrectinib', 'selpercatinib', 'pralsetinib', 'pembrolizumab'],
      },
      {
        topic: 'Metastases, palliative and goals of care',
        text: 'Treat brain metastases with dexamethasone for compressive symptoms plus surgery, stereotactic or whole-brain radiotherapy, and bone metastases with palliative radiotherapy, orthopedic fixation and antiresorptive therapy (a bisphosphonate or denosumab with calcium/vitamin D); integrate palliative care and hospice, and hold early goals-of-care and advance-directive discussions.',
        lineOfTherapy: 'supportive',
        drugs: ['dexamethasone', 'denosumab'],
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
  {
    id: 'aua-suo-prostate-early-detection-2023',
    societyId: 'aua',
    conditionIds: ['prostate-cancer'],
    title: 'AUA/SUO Guideline: Early Detection of Prostate Cancer (2023)',
    language: 'en',
    specialty: 'urology',
    year: 2023,
    status: 'current',
    sourceUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines',
    citation:
      'Wei JT, Barocas D, Carlsson S, et al. Early Detection of Prostate Cancer: AUA/SUO Guideline. J Urol 2023;210:45.',
    summary:
      'The AUA/SUO guideline on early detection of prostate cancer through PSA-based screening within a shared-decision-making framework. It sets age- and risk-based screening (earlier for Black men, germline carriers and strong family history), requires a confirmatory PSA before further workup, uses MRI and risk calculators to inform the biopsy decision, and favours active surveillance for low-risk disease to curb overtreatment.',
    keyRecommendations: [
      {
        topic: 'Shared decision-making',
        text: 'Offer PSA-based screening within a shared-decision-making conversation that weighs earlier detection against the harms of overdiagnosis and overtreatment.',
        lineOfTherapy: 'screening',
      },
      {
        topic: 'Who and when to screen',
        text: 'Begin routine screening around age 45–50 for average-risk men and offer it earlier (from 40–45, biennially) to higher-risk men — Black ancestry, a germline mutation, or a strong family history; individualise screening for men over 70 or with under 10 years’ life expectancy.',
        lineOfTherapy: 'screening',
      },
      {
        topic: 'Confirmatory testing',
        text: 'Repeat an initially elevated PSA before further workup; do not use the digital rectal exam as an initial screening test, and do not give empiric antibiotics for an asymptomatic elevated PSA.',
        lineOfTherapy: 'diagnosis',
      },
      {
        topic: 'Deciding on biopsy',
        text: 'Use prostate MRI, validated risk calculators and serum/urine markers within shared decision-making to decide on biopsy, aiming to detect clinically significant cancer while limiting unnecessary biopsies.',
        lineOfTherapy: 'diagnosis',
      },
      {
        topic: 'Low-risk management',
        text: 'Active surveillance is the preferred management for low-risk prostate cancer; watchful waiting suits men with an asymptomatic cancer and limited life expectancy.',
        lineOfTherapy: 'supportive',
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
];
