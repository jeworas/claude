import type { Guideline } from '../../src/lib/types';

/**
 * Polskie Towarzystwo Gastroenterologii (PTG-E) — Polish Society of
 * Gastroenterology guidelines (wytyczne / rekomendacje).
 * Hand-curated demo records with Polish titles + English working titles.
 * Verify against source before clinical use.
 */
export const ptgeGuidelines: Guideline[] = [
  {
    id: 'ptge-wzjg-2023',
    societyId: 'ptg-e',
    conditionIds: ['ulcerative-colitis'],
    title: 'PTG-E Guidelines on the Management of Ulcerative Colitis',
    titleLocal: 'Wytyczne Polskiego Towarzystwa Gastroenterologii postępowania w wrzodziejącym zapaleniu jelita grubego',
    language: 'pl',
    specialty: 'gastroenterology',
    year: 2023,
    status: 'current',
    sourceUrl: 'https://ptg-e.org.pl/wytyczne/ibd/',
    pdfUrl: 'https://ptg-e.org.pl/wp-content/uploads/2023/09/wytyczne-PL-WZJG-2023-wersja-do-druku.pdf',
    citation: 'Eder P, et al. Przegląd Gastroenterologiczny / Gastroenterology Review. 2023.',
    summary:
      'Polish national guidelines for ulcerative colitis (wrzodziejące zapalenie jelita grubego, WZJG). Aminosalicylates remain first-line for mild-to-moderate disease (oral plus rectal), with corticosteroids for flares and biologics/small molecules for moderate-to-severe or steroid-refractory disease. Treatment targets combine clinical and endoscopic remission.',
    keyRecommendations: [
      {
        topic: 'Mild-to-moderate disease (choroba łagodna do umiarkowanej)',
        text: 'Aminosalicylates (mesalazyna) orally and rectally are first-line to induce and maintain remission; combined oral + topical therapy is more effective in left-sided disease.',
        evidenceGrade: 'Silne zalecenie',
        lineOfTherapy: 'first-line',
        drugs: ['mesalazyna', 'sulfasalazyna', '5-ASA'],
      },
      {
        topic: 'Flare (zaostrzenie)',
        text: 'Systemic corticosteroids (glikokortykosteroidy) are used for moderate-to-severe flares that do not respond to aminosalicylates; not for maintenance.',
        lineOfTherapy: 'second-line',
        drugs: ['prednizon', 'hydrokortyzon', 'budezonid'],
      },
      {
        topic: 'Moderate-to-severe / refractory disease',
        text: 'Biologics and small molecules (anty-TNF, wedolizumab, ustekinumab, inhibitory JAK) are recommended in moderate-to-severe or steroid-dependent/refractory disease.',
        lineOfTherapy: 'escalation',
        drugs: ['infliksymab', 'adalimumab', 'wedolizumab', 'ustekinumab', 'tofacytynib'],
      },
      {
        topic: 'Acute severe colitis (ostre ciężkie zapalenie)',
        text: 'Hospitalize for IV steroids; rescue therapy (infliksymab or cyclosporine) if inadequate response, with surgical consultation.',
        lineOfTherapy: 'refractory',
        drugs: ['infliksymab', 'cyklosporyna'],
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
  {
    id: 'ptge-crohn-2021',
    societyId: 'ptg-e',
    conditionIds: ['crohns-disease'],
    title: "PTG-E Guidelines on the Management of Crohn's Disease",
    titleLocal: 'Wytyczne Polskiego Towarzystwa Gastroenterologii postępowania w chorobie Leśniowskiego-Crohna',
    language: 'pl',
    specialty: 'gastroenterology',
    year: 2021,
    status: 'current',
    sourceUrl: 'https://ptg-e.org.pl/wytyczne/ibd/',
    pdfUrl: 'https://ptg-e.org.pl/wp-content/uploads/2022/06/Wytyczne_chorba-Crohna_PL-1.pdf',
    citation: 'Łodyga M, et al. Przegląd Gastroenterologiczny / Gastroenterology Review. 2021.',
    summary:
      "Polish national guidelines for Crohn's disease (choroba Leśniowskiego-Crohna). Management is risk-stratified: early biologic therapy in high-risk patients, budesonide/systemic steroids for flares, immunomodulators and biologics for maintenance, with attention to perianal and fistulizing disease and post-operative recurrence prevention.",
    keyRecommendations: [
      {
        topic: 'Induction (indukcja remisji)',
        text: 'Ileocecal mild-to-moderate disease may be treated with budesonide; systemic corticosteroids for more severe flares. Early anti-TNF therapy is recommended in high-risk patients.',
        lineOfTherapy: 'first-line',
        drugs: ['budezonid', 'prednizon', 'infliksymab', 'adalimumab'],
      },
      {
        topic: 'Maintenance (leczenie podtrzymujące)',
        text: 'Immunomodulators (azatiopryna, metotreksat) and biologics (anty-TNF, wedolizumab, ustekinumab) maintain remission; corticosteroids are not for maintenance.',
        lineOfTherapy: 'maintenance',
        drugs: ['azatiopryna', 'metotreksat', 'wedolizumab', 'ustekinumab'],
      },
      {
        topic: 'Perianal / fistulizing disease',
        text: 'Combine anti-TNF therapy with surgical management (seton drainage) and antibiotics for perianal fistulizing disease.',
        lineOfTherapy: 'escalation',
        drugs: ['infliksymab', 'metronidazol', 'cyprofloksacyna'],
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
  {
    id: 'ptge-h-pylori-2023',
    societyId: 'ptg-e',
    conditionIds: ['h-pylori-infection'],
    title: 'Diagnosis and Treatment of Helicobacter pylori Infection — Recommendations of the PTG-E Working Group',
    titleLocal: 'Rozpoznawanie i leczenie zakażenia Helicobacter pylori — rekomendacje Grupy Roboczej PTG-E',
    language: 'pl',
    specialty: 'gastroenterology',
    year: 2023,
    status: 'current',
    sourceUrl: 'https://ptg-e.org.pl/wytyczne/',
    citation: 'Przegląd Gastroenterologiczny / Gastroenterology Review. 2023;18(3):225-248.',
    summary:
      'Polish recommendations for the diagnosis and treatment of Helicobacter pylori infection. Given high clarithromycin resistance in Poland, bismuth quadruple therapy is recommended as empiric first-line treatment for 14 days, with eradication confirmed non-invasively after therapy.',
    keyRecommendations: [
      {
        topic: 'First-line eradication (leczenie pierwszego rzutu)',
        text: '14-day bismuth quadruple therapy (IPP + bizmut + tetracyklina + metronidazol) is recommended empirically due to high clarithromycin resistance in Poland.',
        evidenceGrade: 'Silne zalecenie',
        lineOfTherapy: 'first-line',
        drugs: ['bizmut', 'tetracyklina', 'metronidazol', 'inhibitor pompy protonowej'],
      },
      {
        topic: 'Alternatives (leczenie kolejnego rzutu)',
        text: 'Non-bismuth concomitant therapy or levofloxacin/rifabutin-based regimens are alternatives; avoid empiric clarithromycin triple therapy.',
        lineOfTherapy: 'second-line',
        drugs: ['lewofloksacyna', 'ryfabutyna', 'amoksycylina'],
      },
      {
        topic: 'Confirm eradication (potwierdzenie eradykacji)',
        text: 'Confirm with urea breath test or stool antigen ≥4 weeks after treatment, off PPIs for 2 weeks.',
        lineOfTherapy: 'diagnosis',
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
  {
    id: 'ptge-gerd-2022',
    societyId: 'ptg-e',
    conditionIds: ['gerd'],
    title: 'Diagnostic and Therapeutic Management of Gastroesophageal Reflux Disease — Consensus of the PTG-E',
    titleLocal: 'Postępowanie diagnostyczno-terapeutyczne w chorobie refluksowej przełyku — konsensus PTG-E',
    language: 'pl',
    specialty: 'gastroenterology',
    year: 2022,
    status: 'current',
    sourceUrl: 'https://ptg-e.org.pl/en/guidelines/',
    citation: 'Przegląd Gastroenterologiczny / Gastroenterology Review. 2022.',
    summary:
      'Polish consensus on diagnosis and treatment of gastroesophageal reflux disease (choroba refluksowa przełyku). PPIs are the mainstay of therapy after an empiric trial in typical symptoms; lifestyle modification is advised, and objective testing (endoscopy, pH-impedance) is used for atypical, refractory, or alarm presentations.',
    keyRecommendations: [
      {
        topic: 'Empiric PPI therapy (empiryczne leczenie IPP)',
        text: 'An empiric PPI trial is recommended for typical reflux symptoms without alarm features, at the lowest effective dose after response.',
        lineOfTherapy: 'first-line',
        drugs: ['omeprazol', 'pantoprazol', 'inhibitor pompy protonowej'],
      },
      {
        topic: 'Lifestyle (modyfikacja stylu życia)',
        text: 'Weight reduction, avoiding late meals, and head-of-bed elevation are recommended supportive measures.',
        lineOfTherapy: 'supportive',
      },
      {
        topic: 'Diagnostic testing (diagnostyka)',
        text: 'Endoscopy and pH-impedance monitoring are indicated for alarm symptoms, atypical presentations, or before anti-reflux surgery.',
        lineOfTherapy: 'diagnosis',
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
  {
    id: 'ptge-ibs-2018',
    societyId: 'ptg-e',
    conditionIds: ['irritable-bowel-syndrome'],
    title: 'Diagnostic and Therapeutic Recommendations for Irritable Bowel Syndrome',
    titleLocal: 'Rekomendacje diagnostyczno-terapeutyczne w zespole jelita nadwrażliwego',
    language: 'pl',
    specialty: 'gastroenterology',
    year: 2018,
    status: 'current',
    sourceUrl: 'https://ptg-e.org.pl/wytyczne/',
    citation: 'Pietrzak A, et al. Gastroenterology Review. 2018.',
    summary:
      'Polish recommendations for irritable bowel syndrome (zespół jelita nadwrażliwego, ZJN). Diagnosis is symptom-based (Rome criteria) with limited testing; management is subtype-directed with dietary intervention (including low-FODMAP), antispasmodics, and agents targeting constipation or diarrhea, plus neuromodulators for refractory symptoms.',
    keyRecommendations: [
      {
        topic: 'Diagnosis (rozpoznanie)',
        text: 'Diagnose using symptom-based (Rome) criteria with limited investigations; perform alarm-feature and celiac screening as appropriate.',
        lineOfTherapy: 'diagnosis',
      },
      {
        topic: 'Diet (leczenie dietetyczne)',
        text: 'Dietary modification including a trial low-FODMAP diet and soluble fiber is recommended.',
        lineOfTherapy: 'first-line',
      },
      {
        topic: 'Pharmacotherapy (farmakoterapia)',
        text: 'Antispasmodics, rifaximin for IBS-D, and secretagogues/laxatives for IBS-C; add neuromodulators (TCAs) for refractory pain.',
        lineOfTherapy: 'second-line',
        drugs: ['ryfaksymina', 'drotaweryna', 'amitryptylina'],
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
  {
    id: 'ptge-chronic-pancreatitis-2021',
    societyId: 'ptg-e',
    conditionIds: ['chronic-pancreatitis'],
    title: 'Recommendations for the Diagnosis and Treatment of Chronic Pancreatitis (PTG-E and Pancreatic Club)',
    titleLocal: 'Zalecenia diagnostyczne i terapeutyczne w przewlekłym zapaleniu trzustki',
    language: 'pl',
    specialty: 'gastroenterology',
    year: 2021,
    status: 'current',
    sourceUrl: 'https://ptg-e.org.pl/wytyczne/',
    citation: 'Rekomendacje PTG-E i Polskiego Klubu Trzustkowego. Gastroenterology Review. 2021.',
    summary:
      'Polish recommendations for chronic pancreatitis (przewlekłe zapalenie trzustki, PZT). Management focuses on pain control, pancreatic enzyme replacement therapy for exocrine insufficiency, management of diabetes (endocrine insufficiency), nutrition, and alcohol/smoking cessation, with endoscopic or surgical intervention for selected complications.',
    keyRecommendations: [
      {
        topic: 'Exocrine insufficiency (niewydolność zewnątrzwydzielnicza)',
        text: 'Pancreatic enzyme replacement therapy (pankreatyna) is recommended for maldigestion/steatorrhea, with adequate lipase dosing and PPI co-therapy if needed.',
        evidenceGrade: 'Silne zalecenie',
        lineOfTherapy: 'first-line',
        drugs: ['pankreatyna', 'lipaza'],
      },
      {
        topic: 'Pain and lifestyle (ból i styl życia)',
        text: 'Stepwise analgesia and strict alcohol and tobacco cessation are recommended; endoscopic or surgical therapy for obstructive pain.',
        lineOfTherapy: 'supportive',
      },
      {
        topic: 'Nutrition and diabetes (odżywianie i cukrzyca)',
        text: 'Screen and treat pancreatogenic diabetes and malnutrition, including fat-soluble vitamin supplementation.',
        lineOfTherapy: 'supportive',
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
];
