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
  {
    id: 'ptn-nephroprotection-nondiabetic-ckd-2023',
    societyId: 'ptn',
    conditionIds: ['chronic-kidney-disease'],
    title:
      'Pharmacological Nephroprotection in Non-Diabetic Chronic Kidney Disease — Clinical Practice Position Statement of the Polish Society of Nephrology',
    titleLocal:
      'Farmakologiczna nefroprotekcja w niecukrzycowej przewlekłej chorobie nerek — stanowisko Polskiego Towarzystwa Nefrologicznego w zakresie praktyki klinicznej',
    language: 'pl',
    specialty: 'nephrology',
    year: 2023,
    status: 'current',
    sourceUrl: 'https://www.mdpi.com/2077-0383/12/16/5184',
    citation:
      'Stompór T, Adamczak M, Kurnatowska I, et al. Pharmacological Nephroprotection in Non-Diabetic Chronic Kidney Disease — Clinical Practice Position Statement of the Polish Society of Nephrology. J Clin Med. 2023;12(16):5184. Polish translation: Forum Nefrologiczne — Edukacja 2023;3(3):65–103.',
    summary:
      'Position statement of the Polish Society of Nephrology on pharmacological nephroprotection in adults with non-diabetic chronic kidney disease. It lays out a stepwise strategy to slow progression: renin–angiotensin system inhibition (ACE inhibitors preferred, ARBs as an alternative) titrated to the maximum tolerated dose, addition of an SGLT2 inhibitor with proven benefit in non-diabetic CKD (dapagliflozin or empagliflozin), blood-pressure control with combination therapy, correction of metabolic acidosis with sodium bicarbonate, and disease-specific treatment for ADPKD (tolvaptan) and Fabry disease (enzyme replacement or migalastat). It also flags therapies that should not be used solely for nephroprotection.',
    keyRecommendations: [
      {
        topic: 'Blood-pressure targets (docelowe ciśnienie tętnicze)',
        text: 'Treat adults with CKD and hypertension to an office blood pressure of at least 130–139/70–79 mmHg, and possibly lower (120–129/70–79 mmHg) in many patients — especially younger patients or those with proteinuria.',
        evidenceGrade: 'Expert opinion',
        lineOfTherapy: 'first-line',
      },
      {
        topic: 'RAS inhibition (hamowanie układu renina–angiotensyna)',
        text: 'ACE inhibitors (preferred agents: benazepril, ramipril, lisinopril) — or ARBs if ACEi-intolerant — are first-line for both blood-pressure lowering and nephroprotection in non-diabetic CKD, particularly with albuminuria. Titrate to the maximum tolerated dose and check potassium and creatinine 7–14 days after starting or increasing the dose.',
        evidenceGrade: '1B',
        lineOfTherapy: 'first-line',
        drugs: ['ramipryl', 'benazepryl', 'lizynopryl'],
      },
      {
        topic: 'Continuing RAS inhibitors (kontynuacja leczenia RAS)',
        text: 'Do not routinely stop an ACEi/ARB in advanced CKD (G4–G5) to try to raise eGFR. Continue if serum creatinine rises less than 30% after initiation; if it rises more than 30%, withdraw and investigate for renal artery stenosis. Do not combine an ACEi with an ARB.',
        evidenceGrade: '1A',
        lineOfTherapy: 'maintenance',
      },
      {
        topic: 'SGLT2 inhibitors (inhibitory SGLT2)',
        text: 'Add an SGLT2 inhibitor with proven benefit in non-diabetic CKD — dapagliflozin or empagliflozin — for patients with eGFR below 60 mL/min/1.73 m² to slow progression, ideally alongside an ACEi/ARB and especially with albuminuria. Do not start below eGFR 25 (dapagliflozin) or 20 (empagliflozin), but continue until dialysis or transplantation if tolerated.',
        evidenceGrade: '1A',
        lineOfTherapy: 'first-line',
        drugs: ['dapagliflozyna', 'empagliflozyna'],
      },
      {
        topic: 'Combination and add-on therapy (leczenie skojarzone)',
        text: 'Most patients need combination therapy: add a dihydropyridine calcium-channel blocker (amlodipine) and/or a diuretic — thiazide/thiazide-like (indapamide, chlorthalidone) if eGFR is above 30, or chlorthalidone/loop diuretics (furosemide, torasemide) if eGFR is 30 or below. Add spironolactone for resistant hypertension or persistent albuminuria when potassium is 4.5 mmol/L or lower, with close potassium monitoring.',
        evidenceGrade: '1B',
        lineOfTherapy: 'escalation',
        drugs: ['amlodypina', 'indapamid', 'chlortalidon', 'furosemid', 'torasemid', 'spironolakton'],
      },
      {
        topic: 'Metabolic acidosis (kwasica metaboliczna)',
        text: 'Measure serum bicarbonate in all CKD patients and diagnose metabolic acidosis below 22 mmol/L. Give oral sodium bicarbonate to slow CKD progression, targeting serum bicarbonate of 24–28 mmol/L.',
        evidenceGrade: '2B',
        lineOfTherapy: 'supportive',
        drugs: ['wodorowęglan sodu'],
      },
      {
        topic: 'Disease-specific nephroprotection (leczenie swoiste)',
        text: 'For autosomal dominant polycystic kidney disease (ADPKD) at high risk of progression, use tolvaptan. For Fabry disease, use enzyme replacement therapy with agalsidase alfa or beta, or the oral chaperone migalastat.',
        evidenceGrade: '1A',
        lineOfTherapy: 'first-line',
        drugs: ['tolwaptan', 'agalzydaza alfa', 'agalzydaza beta', 'migalastat'],
      },
      {
        topic: 'Therapies not recommended for nephroprotection (leczenie niezalecane)',
        text: 'Do not use erythropoiesis-stimulating agents or HIF-PHIs, CKD–MBD drugs (calcimimetics, vitamin D analogues, phosphate binders), or antioxidant/anti-inflammatory agents specifically to slow CKD progression — although several remain indicated for their own complications.',
        evidenceGrade: '1B',
        lineOfTherapy: 'supportive',
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
  {
    id: 'ptn-ptw-rsv-vaccination-ckd-2025',
    societyId: 'ptn',
    conditionIds: ['rsv-infection', 'chronic-kidney-disease'],
    title:
      'Expert Recommendations of the Polish Society of Nephrology and the Polish Society of Vaccinology on RSV Vaccination in Patients with Chronic Kidney Disease',
    titleLocal:
      'Zalecenia Ekspertów Polskiego Towarzystwa Nefrologicznego i Polskiego Towarzystwa Wakcynologii dotyczące szczepień przeciwko RSV pacjentów z przewlekłą chorobą nerek',
    language: 'pl',
    specialty: 'nephrology',
    year: 2025,
    status: 'current',
    sourceUrl: 'https://doi.org/10.5603/rdatf.108124',
    citation:
      'Durlik M, Dębska-Ślizień A, Krajewska M, et al. Expert recommendations of the Polish Society of Nephrology and the Polish Society of Vaccinology on RSV vaccination in patients with chronic kidney disease. Renal Disease and Transplantation Forum. 2025;18:30–34. DOI: 10.5603/rdatf.108124.',
    summary:
      'Joint expert recommendations of the Polish Society of Nephrology and the Polish Society of Vaccinology on preventing respiratory syncytial virus (RSV) disease in patients with chronic kidney disease, who face a roughly 6–8-fold higher risk of RSV-related hospitalization. Vaccination is recommended for all adults aged 60 or older, and for CKD, dialysis, and transplant patients aged 50 or older, using one of the two recombinant protein vaccines available in Poland — Arexvy (GSK) or Abrysvo (Pfizer) — each given as a single intramuscular dose. Both are non-live and suitable for transplant recipients; household members and healthcare staff should also be vaccinated.',
    keyRecommendations: [
      {
        topic: 'Who to vaccinate (wskazania do szczepienia)',
        text: 'RSV vaccination is recommended for all adults aged 60 or older; for patients with CKD or on dialysis aged 50 or older; and for transplant recipients aged 50 or older. It is also advised for patients being worked up for kidney transplantation.',
        lineOfTherapy: 'prevention',
      },
      {
        topic: 'Available vaccines (dostępne szczepionki)',
        text: 'Two recombinant protein RSV vaccines are available in Poland, each given as a single intramuscular dose: Arexvy (GSK; adjuvanted RSVPreF3) and Abrysvo (Pfizer; bivalent prefusion-F, subgroups A and B).',
        lineOfTherapy: 'prevention',
        drugs: ['Arexvy', 'Abrysvo'],
      },
      {
        topic: 'Rationale (uzasadnienie)',
        text: 'Patients with CKD have roughly a 6–8-fold higher risk of RSV-related hospitalization. In trials of adults 60 or older, Arexvy reduced RSV lower-respiratory-tract disease by about 83% (up to ~95% in those with comorbidities) and Abrysvo by about 67% (over 85% for severe disease).',
        lineOfTherapy: 'prevention',
      },
      {
        topic: 'Immunocompromised and transplant patients (pacjenci z immunosupresją)',
        text: 'Both vaccines are non-live recombinant products and may be given to transplant recipients, in whom live vaccines remain contraindicated. Uremia and immunosuppression can blunt the response, but vaccination is still recommended; household members and healthcare staff should be vaccinated as well.',
        lineOfTherapy: 'prevention',
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
  {
    id: 'ptderm-atopic-dermatitis-2020',
    societyId: 'ptderm',
    conditionIds: ['atopic-dermatitis'],
    title:
      'Atopic Dermatitis — Interdisciplinary Diagnostic and Therapeutic Recommendations of the Polish Dermatological Society (with the Polish Societies of Allergology, Paediatrics and Family Medicine)',
    titleLocal:
      'Atopowe zapalenie skóry — interdyscyplinarne rekomendacje diagnostyczno-terapeutyczne Polskiego Towarzystwa Dermatologicznego, Polskiego Towarzystwa Alergologicznego, Polskiego Towarzystwa Pediatrycznego i Polskiego Towarzystwa Medycyny Rodzinnej',
    language: 'pl',
    specialty: 'dermatology',
    year: 2020,
    status: 'current',
    sourceUrl: 'https://doi.org/10.5114/ada.2020.93423',
    citation:
      'Nowicki RJ, Trzeciak M, Wilkowska A, et al. Atopic dermatitis: interdisciplinary diagnostic and therapeutic recommendations of the Polish Dermatological Society, Polish Society of Allergology, Polish Pediatric Society and Polish Society of Family Medicine. Adv Dermatol Allergol (Postępy Dermatologii i Alergologii). 2020 — Part I doi:10.5114/ada.2020.93423, Part II doi:10.5114/ada.2020.94829; biologics update doi:10.5114/ada.2020.100496. Identified via PubMed.',
    summary:
      'Interdisciplinary Polish recommendations on atopic dermatitis (AZS), a chronic relapsing pruritic dermatosis of children and adults. Management is stepwise: liberal, tailored emollients to restore the epidermal barrier as the foundation; topical corticosteroids and topical calcineurin inhibitors (tacrolimus, pimecrolimus) for inflammation, including proactive maintenance; phototherapy for moderate disease; and systemic therapy — cyclosporine first, and the biologic dupilumab for moderate-to-severe disease from age 12 — when topical treatment fails. Unproven modalities (acupuncture, bioresonance, homeopathy, Chinese herbs) are explicitly not recommended.',
    keyRecommendations: [
      {
        topic: 'Emollients / epidermal barrier (leczenie podstawowe)',
        text: 'Tailored emollients are the foundation of both treatment and prophylaxis, applied liberally and continuously to restore epidermal barrier function and reduce flares.',
        lineOfTherapy: 'first-line',
        drugs: ['emolienty'],
      },
      {
        topic: 'Topical anti-inflammatory therapy (leczenie miejscowe)',
        text: 'Topical corticosteroids treat flares; topical calcineurin inhibitors (tacrolimus, pimecrolimus) are preferred for sensitive sites and for proactive twice-weekly maintenance to prolong remission.',
        lineOfTherapy: 'first-line',
        drugs: ['glikokortykosteroidy', 'takrolimus', 'pimekrolimus'],
      },
      {
        topic: 'Phototherapy (fototerapia)',
        text: 'Phototherapy (narrowband UVB or UVA1) is an option for moderate atopic dermatitis inadequately controlled by topical therapy.',
        lineOfTherapy: 'second-line',
      },
      {
        topic: 'Systemic treatment (leczenie ogólne)',
        text: 'For severe atopic dermatitis unresponsive to topical therapy, cyclosporine is the main systemic immunosuppressant; systemic corticosteroids only for short-term control of acute exacerbations. Multi-specialist care is often required.',
        lineOfTherapy: 'escalation',
        drugs: ['cyklosporyna', 'glikokortykosteroidy'],
      },
      {
        topic: 'Biologic therapy (leczenie biologiczne)',
        text: 'Dupilumab is recommended for moderate-to-severe atopic dermatitis in patients aged 12 and older who do not respond to topical treatment.',
        lineOfTherapy: 'escalation',
        drugs: ['dupilumab'],
      },
      {
        topic: 'Not recommended (leczenie niezalecane)',
        text: 'Acupuncture, acupressure, bioresonance, homeopathy, and Chinese herbs are not recommended for atopic dermatitis.',
        lineOfTherapy: 'supportive',
      },
    ],
    lastVerified: '2026-07-19',
    dataProvenance: 'hand-curated-demo',
  },
];
