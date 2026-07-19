import type { DoseEntry } from '../src/lib/types';

/**
 * Standard dosing reference, kept deliberately separate from the guideline
 * prose because it is the most safety-sensitive content. Keyed by guideline id.
 * These are widely-published, standard adult regimens for quick reference ONLY —
 * they omit contraindications, renal/hepatic adjustment, monitoring and
 * interactions, and MUST be verified against the source guideline and local
 * formulary before prescribing.
 */
export const dosingByGuideline: Record<string, DoseEntry[]> = {
  'ptn-nephroprotection-nondiabetic-ckd-2023': [
    { drug: 'Ramipril', indication: 'RAS inhibition / nephroprotection', regimen: 'Start 2.5–5 mg orally once daily; titrate to the maximum tolerated dose (up to 10 mg/day), monitoring potassium and creatinine' },
    { drug: 'Dapagliflozin', indication: 'Non-diabetic CKD, eGFR ≥25', regimen: '10 mg orally once daily' },
    { drug: 'Empagliflozin', indication: 'Non-diabetic CKD, eGFR ≥20', regimen: '10 mg orally once daily' },
    { drug: 'Spironolactone', indication: 'Resistant hypertension / persistent albuminuria', regimen: '25 mg orally once daily, with potassium and creatinine monitoring' },
    { drug: 'Sodium bicarbonate', indication: 'Metabolic acidosis', regimen: 'Oral, titrated to a serum bicarbonate target of 24–28 mmol/L' },
    { drug: 'Tolvaptan', indication: 'ADPKD at high risk of progression', regimen: 'Split daily dose titrated from 45 mg + 15 mg toward 90 mg + 30 mg (morning + ~8 h later) as tolerated' },
    { drug: 'Agalsidase beta', indication: 'Fabry disease (enzyme replacement)', regimen: '1 mg/kg IV every 2 weeks' },
    { drug: 'Migalastat', indication: 'Fabry disease with amenable GLA variant', regimen: '123 mg orally once every other day' },
  ],
  'ptn-ptw-rsv-vaccination-ckd-2025': [
    { drug: 'Arexvy (RSVPreF3, GSK)', indication: 'RSV prevention in adults', regimen: 'Single 0.5 mL intramuscular dose' },
    { drug: 'Abrysvo (bivalent prefusion-F, Pfizer)', indication: 'RSV prevention in adults', regimen: 'Single 0.5 mL intramuscular dose' },
  ],
  'ptderm-atopic-dermatitis-2020': [
    { drug: 'Tacrolimus (topical)', indication: 'Topical anti-inflammatory / proactive maintenance', regimen: '0.03% (children) or 0.1% (adults) ointment twice daily to affected skin; step down to twice-weekly maintenance' },
    { drug: 'Pimecrolimus (topical)', indication: 'Mild-to-moderate AD, sensitive sites', regimen: '1% cream twice daily' },
    { drug: 'Cyclosporine', indication: 'Severe AD, systemic therapy', regimen: '2.5–5 mg/kg/day orally in two divided doses, with blood-pressure and renal monitoring' },
    { drug: 'Dupilumab', indication: 'Moderate-to-severe AD, age ≥12, topical-refractory', regimen: 'Adults: 600 mg SC loading dose, then 300 mg SC every 2 weeks' },
  ],
  'eadv-euroguiderm-atopic-eczema': [
    { drug: 'Dupilumab', indication: 'Moderate-to-severe AD, biologic', regimen: 'Adults: 600 mg SC loading dose, then 300 mg SC every 2 weeks' },
    { drug: 'Tralokinumab', indication: 'Moderate-to-severe AD, biologic', regimen: 'Adults: 600 mg SC loading dose, then 300 mg SC every 2 weeks' },
    { drug: 'Upadacitinib', indication: 'Moderate-to-severe AD, JAK inhibitor', regimen: '15 mg orally once daily, increased to 30 mg once daily if needed' },
    { drug: 'Abrocitinib', indication: 'Moderate-to-severe AD, JAK inhibitor', regimen: '100–200 mg orally once daily' },
    { drug: 'Baricitinib', indication: 'Moderate-to-severe AD, JAK inhibitor', regimen: '4 mg orally once daily, stepped down to 2 mg on control' },
    { drug: 'Ciclosporin', indication: 'Conventional systemic immunosuppressant', regimen: '2.5–5 mg/kg/day orally in two divided doses, with blood-pressure and renal monitoring' },
  ],
  'aasld-masld-mash-2025': [
    { drug: 'Semaglutide', indication: 'MASH with F2–F3 fibrosis', regimen: '2.4 mg subcutaneously once weekly (dose-escalated over ~16–20 weeks)' },
    { drug: 'Resmetirom', indication: 'Non-cirrhotic MASH with significant fibrosis', regimen: '80 mg (<100 kg) or 100 mg (≥100 kg) orally once daily' },
  ],
  'aasld-hepatitis-b-2025': [
    { drug: 'Tenofovir', indication: 'Chronic hepatitis B, first-line', regimen: 'Tenofovir disoproxil 300 mg, or tenofovir alafenamide 25 mg, orally once daily' },
    { drug: 'Entecavir', indication: 'Chronic hepatitis B, first-line', regimen: '0.5 mg orally once daily (1 mg if lamivudine-experienced)' },
  ],
  'easl-hbv-2025': [
    { drug: 'Entecavir', indication: 'Chronic hepatitis B, first-line NA', regimen: '0.5 mg orally once daily (1 mg if lamivudine-experienced)' },
    { drug: 'Tenofovir', indication: 'Chronic hepatitis B, first-line NA', regimen: 'Tenofovir disoproxil 245 mg, or tenofovir alafenamide 25 mg, orally once daily' },
    { drug: 'Peginterferon alfa', indication: 'Selected patients, finite course', regimen: '180 µg subcutaneously once weekly for 48 weeks' },
  ],
  'easl-hcc-2024': [
    { drug: 'Atezolizumab + bevacizumab', indication: 'First-line systemic therapy, advanced HCC', regimen: 'Atezolizumab 1200 mg + bevacizumab 15 mg/kg IV every 3 weeks' },
  ],
  'esc-hypertension-2024': [
    { drug: 'Perindopril + amlodipine', indication: 'Single-pill combination, initial therapy', regimen: 'e.g. perindopril 4–8 mg + amlodipine 5–10 mg orally once daily' },
    { drug: 'Indapamide', indication: 'Thiazide-like diuretic component', regimen: '1.5 mg (modified-release) orally once daily' },
    { drug: 'Spironolactone', indication: 'Resistant hypertension add-on', regimen: '25–50 mg orally once daily, with potassium monitoring' },
  ],
  'esc-atrial-fibrillation-2024': [
    { drug: 'Apixaban', indication: 'Stroke prevention (DOAC)', regimen: '5 mg orally twice daily (2.5 mg twice daily if dose-reduction criteria met)' },
    { drug: 'Rivaroxaban', indication: 'Stroke prevention (DOAC)', regimen: '20 mg orally once daily (15 mg if CrCl 15–49 mL/min)' },
    { drug: 'Edoxaban', indication: 'Stroke prevention (DOAC)', regimen: '60 mg orally once daily (30 mg if dose-reduction criteria met)' },
    { drug: 'Dabigatran', indication: 'Stroke prevention (DOAC)', regimen: '150 mg orally twice daily (110 mg twice daily if higher bleeding risk)' },
  ],
  'acg-h-pylori-2024': [
    { drug: 'Proton pump inhibitor', indication: 'Bismuth quadruple therapy', regimen: 'Standard dose orally twice daily (e.g. omeprazole 20 mg BID) for 14 days' },
    { drug: 'Bismuth subsalicylate', indication: 'Bismuth quadruple therapy', regimen: '300–524 mg orally four times daily for 14 days' },
    { drug: 'Tetracycline', indication: 'Bismuth quadruple therapy', regimen: '500 mg orally four times daily for 14 days' },
    { drug: 'Metronidazole', indication: 'Bismuth quadruple therapy', regimen: '250–500 mg orally three to four times daily for 14 days' },
  ],
  'acg-c-difficile-2021': [
    { drug: 'Fidaxomicin', indication: 'Initial episode (preferred)', regimen: '200 mg orally twice daily for 10 days' },
    { drug: 'Vancomycin', indication: 'Initial episode', regimen: '125 mg orally four times daily for 10 days' },
    { drug: 'Vancomycin + metronidazole', indication: 'Fulminant CDI', regimen: 'Vancomycin 500 mg PO/NG four times daily (+ 500 mg per rectum if ileus) plus metronidazole 500 mg IV every 8 hours' },
    { drug: 'Metronidazole', indication: 'Non-severe, if preferred agents unavailable', regimen: '500 mg orally three times daily for 10 days' },
  ],
  'aga-microscopic-colitis-2016': [
    { drug: 'Budesonide', indication: 'Induction of remission', regimen: '9 mg orally once daily for 6–8 weeks; taper to lowest effective dose for maintenance' },
  ],
  'acg-gerd-2022': [
    { drug: 'Proton pump inhibitor', indication: 'Empiric therapy', regimen: '20–40 mg orally once daily, 30–60 minutes before breakfast, for 8 weeks; step down to lowest effective dose' },
  ],
  'acg-ulcerative-colitis-2025': [
    { drug: 'Mesalamine (oral)', indication: 'Mild-to-moderate, induction & maintenance', regimen: '≥2–3 g/day orally' },
    { drug: 'Mesalamine (rectal)', indication: 'Proctitis / left-sided disease', regimen: '1 g suppository daily (proctitis) or 4 g enema daily (left-sided)' },
    { drug: 'Budesonide MMX', indication: 'Mild-to-moderate, induction', regimen: '9 mg orally once daily for up to 8 weeks' },
    { drug: 'Infliximab', indication: 'Moderate-to-severe', regimen: '5 mg/kg IV at weeks 0, 2, 6, then every 8 weeks' },
    { drug: 'Vedolizumab', indication: 'Moderate-to-severe', regimen: '300 mg IV at weeks 0, 2, 6, then every 8 weeks' },
    { drug: 'Tofacitinib', indication: 'Moderate-to-severe', regimen: '10 mg orally twice daily for induction, then 5 mg twice daily for maintenance' },
    { drug: 'Upadacitinib', indication: 'Moderate-to-severe', regimen: '45 mg orally once daily for 8 weeks, then 15–30 mg once daily' },
  ],
  'acg-crohns-disease-2025': [
    { drug: 'Budesonide', indication: 'Mild-to-moderate ileocecal, induction', regimen: '9 mg orally once daily for up to 8 weeks' },
    { drug: 'Azathioprine', indication: 'Maintenance immunomodulation', regimen: '2–2.5 mg/kg/day orally' },
    { drug: 'Methotrexate', indication: 'Maintenance immunomodulation', regimen: '25 mg SC/IM weekly (induction), 15 mg weekly (maintenance)' },
    { drug: 'Infliximab', indication: 'Moderate-to-severe', regimen: '5 mg/kg IV at weeks 0, 2, 6, then every 8 weeks' },
    { drug: 'Adalimumab', indication: 'Moderate-to-severe', regimen: '160 mg SC week 0, 80 mg week 2, then 40 mg every other week' },
    { drug: 'Ustekinumab', indication: 'Moderate-to-severe', regimen: '~6 mg/kg IV induction, then 90 mg SC every 8 weeks' },
  ],
  'acg-eoe-2025': [
    { drug: 'Fluticasone (swallowed)', indication: 'Topical steroid therapy', regimen: '880–1760 mcg/day divided twice daily, swallowed (not inhaled)' },
    { drug: 'Budesonide (oral viscous)', indication: 'Topical steroid therapy', regimen: '1–2 mg twice daily as an oral viscous slurry' },
    { drug: 'Proton pump inhibitor', indication: 'First-line option', regimen: 'Standard-dose PPI twice daily' },
    { drug: 'Dupilumab', indication: 'Refractory / eligible patients', regimen: '300 mg SC weekly' },
  ],
  'acg-ibs-2021': [
    { drug: 'Linaclotide', indication: 'IBS with constipation', regimen: '290 mcg orally once daily' },
    { drug: 'Rifaximin', indication: 'IBS with diarrhea', regimen: '550 mg orally three times daily for 14 days' },
    { drug: 'Eluxadoline', indication: 'IBS with diarrhea', regimen: '100 mg orally twice daily (75 mg if not tolerated)' },
  ],

  // European (ECCO) and Polish (PTG-E, NPOA) flagship guidelines. Regimens are
  // the same standard agents; drug names given as English generics.
  'ecco-uc-medical-2022': [
    { drug: 'Mesalamine (oral)', indication: 'Mild-to-moderate UC, induction & maintenance', regimen: '≥2.4 g/day orally (once-daily dosing acceptable)' },
    { drug: 'Mesalamine (rectal)', indication: 'Proctitis / left-sided disease', regimen: '1 g suppository or enema daily; combine with oral for left-sided disease' },
    { drug: 'Infliximab', indication: 'Moderate-to-severe', regimen: '5 mg/kg IV at weeks 0, 2, 6, then every 8 weeks' },
    { drug: 'Vedolizumab', indication: 'Moderate-to-severe', regimen: '300 mg IV at weeks 0, 2, 6, then every 8 weeks' },
    { drug: 'Tofacitinib', indication: 'Moderate-to-severe', regimen: '10 mg orally twice daily induction, then 5 mg twice daily maintenance' },
  ],
  'ecco-cd-medical-2024': [
    { drug: 'Budesonide', indication: 'Mild ileocecal Crohn’s, induction', regimen: '9 mg orally once daily for up to 8 weeks' },
    { drug: 'Infliximab', indication: 'Moderate-to-severe', regimen: '5 mg/kg IV at weeks 0, 2, 6, then every 8 weeks' },
    { drug: 'Adalimumab', indication: 'Moderate-to-severe', regimen: '160 mg SC week 0, 80 mg week 2, then 40 mg every other week' },
    { drug: 'Ustekinumab', indication: 'Moderate-to-severe', regimen: '~6 mg/kg IV induction, then 90 mg SC every 8 weeks' },
  ],
  'ptge-wzjg-2023': [
    { drug: 'Mesalamine (mesalazyna)', indication: 'Mild-to-moderate UC', regimen: 'Oral ≥2–3 g/day plus rectal 1 g/day; combined dosing preferred' },
    { drug: 'Budesonide MMX (budezonid MMX)', indication: 'Mild-to-moderate, induction', regimen: '9 mg orally once daily for up to 8 weeks' },
    { drug: 'Infliximab (infliksymab)', indication: 'Moderate-to-severe / refractory', regimen: '5 mg/kg IV at weeks 0, 2, 6, then every 8 weeks' },
  ],
  'ptge-crohn-2021': [
    { drug: 'Budesonide (budezonid)', indication: 'Mild ileocecal, induction', regimen: '9 mg orally once daily for up to 8 weeks' },
    { drug: 'Azathioprine (azatiopryna)', indication: 'Maintenance', regimen: '2–2.5 mg/kg/day orally' },
    { drug: 'Infliximab (infliksymab)', indication: 'Moderate-to-severe / fistulizing', regimen: '5 mg/kg IV at weeks 0, 2, 6, then every 8 weeks' },
  ],
  'ptge-h-pylori-2023': [
    { drug: 'Proton pump inhibitor', indication: 'Bismuth quadruple therapy (first-line in PL)', regimen: 'Standard dose orally twice daily for 14 days' },
    { drug: 'Bismuth (bizmut)', indication: 'Bismuth quadruple therapy', regimen: 'Standard bismuth salt four times daily for 14 days' },
    { drug: 'Tetracycline (tetracyklina)', indication: 'Bismuth quadruple therapy', regimen: '500 mg orally four times daily for 14 days' },
    { drug: 'Metronidazole (metronidazol)', indication: 'Bismuth quadruple therapy', regimen: '500 mg orally three times daily for 14 days' },
  ],
  'npoa-c-difficile-2018': [
    { drug: 'Vancomycin (wankomycyna)', indication: 'First-line', regimen: '125 mg orally four times daily for 10 days' },
    { drug: 'Fidaxomicin (fidaksomycyna)', indication: 'First-line (lower recurrence)', regimen: '200 mg orally twice daily for 10 days' },
    { drug: 'Metronidazole (metronidazol)', indication: 'Mild disease if preferred agents unavailable', regimen: '500 mg orally three times daily for 10 days' },
  ],
  'acr-aao-hcq-retinopathy-2020': [
    { drug: 'Hydroxychloroquine', indication: 'Ceiling to limit retinal toxicity', regimen: '≤5 mg/kg/day of actual body weight' },
  ],
  'era-ckd-associated-pruritus': [
    { drug: 'Difelikefalin', indication: 'Moderate-to-severe CKD-aP in haemodialysis', regimen: '0.5 mcg/kg IV three times weekly, into the dialysis circuit at end of session' },
  ],
};
