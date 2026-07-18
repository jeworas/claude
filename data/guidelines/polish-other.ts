import type { Guideline } from '../../src/lib/types';

/**
 * Polish guidelines from non-gastroenterology societies (infectious disease,
 * diabetology, hypertension) — adds breadth and completes the bilingual
 * "colitis" cluster with the Polish C. difficile recommendations.
 * Hand-curated demo records — verify against source before clinical use.
 */
export const polishOtherGuidelines: Guideline[] = [
  {
    id: 'npoa-c-difficile-2018',
    societyId: 'npoa',
    conditionIds: ['c-difficile-infection'],
    title: 'Clostridioides difficile Infection — Epidemiology, Diagnosis, Therapy and Prevention (Polish National Recommendations)',
    titleLocal: 'Zakażenia Clostridioides difficile — epidemiologia, diagnostyka, terapia i profilaktyka',
    language: 'pl',
    specialty: 'infectious-disease',
    year: 2018,
    status: 'current',
    sourceUrl: 'https://antybiotyki.edu.pl/rekomendacje/',
    citation: 'Narodowy Program Ochrony Antybiotyków (NPOA). Rekomendacje. 2018.',
    summary:
      'Polish national recommendations on Clostridioides difficile infection (zakażenie C. difficile), covering diagnosis, treatment, and infection control. Oral vancomycin or fidaxomicin are first-line; metronidazole is limited to mild cases when preferred agents are unavailable. Fecal microbiota transplantation is recommended for recurrent infection, alongside antibiotic stewardship and contact precautions.',
    keyRecommendations: [
      {
        topic: 'First episode (pierwszy epizod)',
        text: 'Oral vancomycin or fidaxomicin (wankomycyna doustnie lub fidaksomycyna) are first-line; metronidazole only in mild disease when preferred agents are unavailable.',
        lineOfTherapy: 'first-line',
        drugs: ['wankomycyna', 'fidaksomycyna', 'metronidazol'],
      },
      {
        topic: 'Recurrence (nawrót)',
        text: 'For recurrent infection, fecal microbiota transplantation (przeszczep mikrobioty jelitowej) is recommended after appropriate antibiotic therapy; tapered vancomycin or fidaxomicin are alternatives.',
        lineOfTherapy: 'escalation',
        drugs: ['przeszczep mikrobioty jelitowej', 'wankomycyna', 'fidaksomycyna'],
      },
      {
        topic: 'Prevention (profilaktyka)',
        text: 'Antibiotic stewardship, contact isolation, and hand hygiene with soap and water are recommended to limit transmission.',
        lineOfTherapy: 'prevention',
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
  {
    id: 'ptd-diabetes-2026',
    societyId: 'ptd',
    conditionIds: ['diabetes-mellitus'],
    title: 'Clinical Recommendations for the Management of Diabetes 2026 — Diabetes Poland',
    titleLocal: 'Zalecenia kliniczne dotyczące postępowania u osób z cukrzycą 2026',
    language: 'pl',
    specialty: 'diabetology',
    year: 2026,
    status: 'current',
    supersedesId: undefined,
    sourceUrl: 'https://ptdiab.pl/zalecenia-ptd',
    citation: 'Polskie Towarzystwo Diabetologiczne. Current Topics in Diabetes. 2026.',
    summary:
      'The annually updated Polish diabetes recommendations (Zalecenia PTD). Metformin remains first-line for type 2 diabetes, with early use of SGLT2 inhibitors and GLP-1 receptor agonists in patients with cardiovascular or renal disease. Individualized glycemic targets, cardiovascular risk reduction, and screening for complications are emphasized.',
    keyRecommendations: [
      {
        topic: 'First-line therapy (leczenie pierwszego rzutu)',
        text: 'Metformin (metformina) is first-line for type 2 diabetes alongside lifestyle therapy unless contraindicated.',
        evidenceGrade: 'Silne zalecenie',
        lineOfTherapy: 'first-line',
        drugs: ['metformina'],
      },
      {
        topic: 'Organ-protective therapy (terapia kardio-nerkowa)',
        text: 'SGLT2 inhibitors (flozyny) and GLP-1 receptor agonists are recommended early in patients with established cardiovascular disease, heart failure, or chronic kidney disease, independent of HbA1c.',
        lineOfTherapy: 'first-line',
        drugs: ['empagliflozyna', 'dapagliflozyna', 'semaglutyd', 'dulaglutyd'],
      },
      {
        topic: 'Targets (cele leczenia)',
        text: 'Individualize glycemic targets (generally HbA1c ≤7%, stricter or looser by patient), with blood pressure and lipid control for cardiovascular risk reduction.',
        lineOfTherapy: 'maintenance',
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
  {
    id: 'ptnt-hypertension-2024',
    societyId: 'ptnt',
    conditionIds: ['hypertension'],
    title: 'Guidelines for the Management of Arterial Hypertension 2024 — Polish Society of Hypertension',
    titleLocal: 'Wytyczne postępowania w nadciśnieniu tętniczym 2024',
    language: 'pl',
    specialty: 'cardiology',
    year: 2024,
    status: 'current',
    sourceUrl: 'https://nadcisnienietetnicze.pl/ptnt/wytyczne_ptnt',
    citation: 'Polskie Towarzystwo Nadciśnienia Tętniczego (PTNT). Nadciśnienie Tętnicze w Praktyce. 2024.',
    summary:
      'Polish national guidelines on arterial hypertension (nadciśnienie tętnicze). Diagnosis is confirmed with out-of-office measurement where possible. Most patients start on single-pill combination therapy (typically an ACE inhibitor or ARB with a calcium channel blocker and/or thiazide-like diuretic), targeting office blood pressure generally below 130/80 mmHg when tolerated.',
    keyRecommendations: [
      {
        topic: 'Initial therapy (leczenie początkowe)',
        text: 'Start most patients on a single-pill combination of a RAS blocker (ACEI/ARB) with a calcium channel blocker and/or thiazide-like diuretic.',
        evidenceGrade: 'Silne zalecenie',
        lineOfTherapy: 'first-line',
        drugs: ['peryndopryl', 'ramipryl', 'amlodypina', 'indapamid'],
      },
      {
        topic: 'Targets (cele leczenia)',
        text: 'Aim for office blood pressure generally <130/80 mmHg if tolerated, with individualized targets in older or frail patients.',
        lineOfTherapy: 'maintenance',
      },
      {
        topic: 'Resistant hypertension (nadciśnienie oporne)',
        text: 'Add a mineralocorticoid receptor antagonist (spironolakton) for resistant hypertension after confirming adherence.',
        lineOfTherapy: 'escalation',
        drugs: ['spironolakton'],
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
];
