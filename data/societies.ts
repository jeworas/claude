import type { Society } from '../src/lib/types';

/**
 * Registry of medical societies / guideline-issuing bodies.
 *
 * This is the map of *where guidelines come from* — the input to the ingestion
 * pipeline. `guidelinesIndexUrl` is the page the update-checker watches (and the
 * page a curator opens to download the source documents). Societies are grouped
 * by discipline; within each discipline we list the major bodies per region
 * (US · EU pan-European · UK · PL · INT global).
 *
 * Not every society here has guidelines loaded into the PoC dataset yet — the
 * gastroenterology / IBD cluster is deep, the rest of the registry is the
 * breadth we expand into next. Records with no attached guidelines are valid:
 * they mark a source we intend to ingest.
 */
export const societies: Society[] = [
  // ─────────────────────────────── Gastroenterology & hepatology ───────────
  {
    id: 'acg',
    name: 'American College of Gastroenterology',
    abbreviation: 'ACG',
    country: 'US',
    specialties: ['gastroenterology'],
    homepage: 'https://gi.org',
    guidelinesIndexUrl: 'https://gi.org/guidelines/',
    description:
      'Publishes ACG Clinical Guidelines in the American Journal of Gastroenterology; one of the two leading US gastroenterology societies.',
  },
  {
    id: 'aga',
    name: 'American Gastroenterological Association',
    abbreviation: 'AGA',
    country: 'US',
    specialties: ['gastroenterology'],
    homepage: 'https://gastro.org',
    guidelinesIndexUrl: 'https://gastro.org/clinical-guidance/',
    description:
      'Publishes AGA Clinical Practice Guidelines (including "living" guidelines updated on evidence changes) in Gastroenterology.',
  },
  {
    id: 'aasld',
    name: 'American Association for the Study of Liver Diseases',
    abbreviation: 'AASLD',
    country: 'US',
    specialties: ['hepatology', 'gastroenterology'],
    homepage: 'https://www.aasld.org',
    guidelinesIndexUrl: 'https://www.aasld.org/practice-guidelines',
    description:
      'Leading US liver society; publishes AASLD Practice Guidelines and Guidance on hepatitis, cirrhosis, NAFLD/MASLD and liver cancer.',
  },
  {
    id: 'ptg-e',
    name: 'Polish Society of Gastroenterology',
    nameLocal: 'Polskie Towarzystwo Gastroenterologii',
    abbreviation: 'PTG-E',
    country: 'PL',
    specialties: ['gastroenterology'],
    homepage: 'https://ptg-e.org.pl',
    guidelinesIndexUrl: 'https://ptg-e.org.pl/wytyczne/',
    description:
      'National Polish gastroenterology society; publishes wytyczne/rekomendacje, frequently together with the national consultant in gastroenterology.',
  },
  {
    id: 'bsg',
    name: 'British Society of Gastroenterology',
    abbreviation: 'BSG',
    country: 'UK',
    specialties: ['gastroenterology', 'hepatology'],
    homepage: 'https://www.bsg.org.uk',
    guidelinesIndexUrl: 'https://www.bsg.org.uk/clinical-resources/',
    description:
      'The UK professional body for gastroenterology and hepatology; publishes BSG guidelines in Gut across luminal GI, IBD and liver disease.',
  },
  {
    id: 'ecco',
    name: "European Crohn's and Colitis Organisation",
    abbreviation: 'ECCO',
    country: 'EU',
    specialties: ['gastroenterology'],
    homepage: 'https://ecco-ibd.eu',
    guidelinesIndexUrl:
      'https://ecco-ibd.eu/publications/guidelines',
    description:
      "Pan-European organisation focused on inflammatory bowel disease; publishes topical, regularly updated ECCO guidelines in the Journal of Crohn's and Colitis.",
  },
  {
    id: 'ueg',
    name: 'United European Gastroenterology',
    abbreviation: 'UEG',
    country: 'EU',
    specialties: ['gastroenterology', 'hepatology'],
    homepage: 'https://ueg.eu',
    guidelinesIndexUrl: 'https://ueg.eu/quality-of-care',
    description:
      'Umbrella organisation of European GI societies; develops and endorses pan-European evidence-based guidelines and standards.',
  },
  {
    id: 'easl',
    name: 'European Association for the Study of the Liver',
    abbreviation: 'EASL',
    country: 'EU',
    specialties: ['hepatology'],
    homepage: 'https://easl.eu',
    guidelinesIndexUrl: 'https://easl.eu/publication-category/clinical-practice-guidelines/',
    description:
      'Pan-European liver society; publishes EASL Clinical Practice Guidelines in the Journal of Hepatology.',
  },

  // ─────────────────────────────── Cardiology & vascular ───────────────────
  {
    id: 'aha-acc',
    name: 'American Heart Association / American College of Cardiology',
    abbreviation: 'AHA/ACC',
    country: 'US',
    specialties: ['cardiology'],
    homepage: 'https://professional.heart.org',
    guidelinesIndexUrl: 'https://professional.heart.org/en/guidelines-and-statements',
    description:
      'Joint AHA/ACC clinical practice guidelines covering cardiovascular prevention and disease management.',
  },
  {
    id: 'esc',
    name: 'European Society of Cardiology',
    abbreviation: 'ESC',
    country: 'EU',
    specialties: ['cardiology'],
    homepage: 'https://www.escardio.org',
    guidelinesIndexUrl: 'https://www.escardio.org/Guidelines',
    description:
      'Publishes the widely adopted ESC Clinical Practice Guidelines across the full range of cardiovascular disease.',
  },
  {
    id: 'ptk',
    name: 'Polish Cardiac Society',
    nameLocal: 'Polskie Towarzystwo Kardiologiczne',
    abbreviation: 'PTK',
    country: 'PL',
    specialties: ['cardiology'],
    homepage: 'https://ptkardio.pl',
    guidelinesIndexUrl: 'https://ptkardio.pl/wytyczne',
    description:
      'National Polish cardiology society; publishes Polish adaptations of ESC guidelines and its own expert consensus statements.',
  },

  // ─────────────────────────────── Lipidology / atherosclerosis ────────────
  {
    id: 'nla',
    name: 'National Lipid Association',
    abbreviation: 'NLA',
    country: 'US',
    specialties: ['lipidology', 'cardiology'],
    homepage: 'https://www.lipid.org',
    guidelinesIndexUrl: 'https://www.lipid.org/practicetools/guidelines',
    description:
      'US society dedicated to lipid management; publishes recommendations on dyslipidaemia and ASCVD risk reduction.',
  },
  {
    id: 'eas',
    name: 'European Atherosclerosis Society',
    abbreviation: 'EAS',
    country: 'EU',
    specialties: ['lipidology', 'cardiology'],
    homepage: 'https://eas-society.org',
    guidelinesIndexUrl: 'https://eas-society.org/guidelines/',
    description:
      'Co-publishes the ESC/EAS dyslipidaemia guidelines and consensus statements on Lp(a), familial hypercholesterolaemia and more.',
  },
  {
    id: 'ptl',
    name: 'Polish Lipid Association',
    nameLocal: 'Polskie Towarzystwo Lipidologiczne',
    abbreviation: 'PTL',
    country: 'PL',
    specialties: ['lipidology'],
    homepage: 'https://ptlipid.pl',
    guidelinesIndexUrl: 'https://ptlipid.pl/wytyczne-w-codziennej-praktyce-lekarskiej/',
    description:
      'Issues the multi-society Polish guidelines on the diagnosis and treatment of lipid disorders (PTL/KLRwP/PTK/PTDL/PTD/PTNT).',
  },

  // ─────────────────────────────── Endocrinology & diabetology ─────────────
  {
    id: 'ada',
    name: 'American Diabetes Association',
    abbreviation: 'ADA',
    country: 'US',
    specialties: ['diabetology'],
    homepage: 'https://diabetes.org',
    guidelinesIndexUrl: 'https://professional.diabetes.org/standards-of-care',
    description:
      'Publishes the annually updated "Standards of Care in Diabetes" in Diabetes Care, with living amendments during the year.',
  },
  {
    id: 'endocrine-society',
    name: 'The Endocrine Society',
    abbreviation: 'ENDO',
    country: 'US',
    specialties: ['endocrinology'],
    homepage: 'https://www.endocrine.org',
    guidelinesIndexUrl: 'https://www.endocrine.org/clinical-practice-guidelines',
    description:
      'Publishes Clinical Practice Guidelines across endocrine disorders (thyroid, adrenal, pituitary, bone, gonadal, obesity).',
  },
  {
    id: 'aace',
    name: 'American Association of Clinical Endocrinology',
    abbreviation: 'AACE',
    country: 'US',
    specialties: ['endocrinology', 'diabetology'],
    homepage: 'https://pro.aace.com',
    guidelinesIndexUrl: 'https://pro.aace.com/clinical-guidance',
    description:
      'Publishes clinical practice guidelines and algorithms for diabetes, obesity, thyroid disease and osteoporosis.',
  },
  {
    id: 'ata',
    name: 'American Thyroid Association',
    abbreviation: 'ATA',
    country: 'US',
    specialties: ['endocrinology'],
    homepage: 'https://www.thyroid.org',
    guidelinesIndexUrl: 'https://www.thyroid.org/professionals/ata-professional-guidelines/',
    description:
      'Reference guidelines for thyroid nodules, differentiated thyroid cancer, hyper- and hypothyroidism, and thyroid disease in pregnancy.',
  },
  {
    id: 'ese',
    name: 'European Society of Endocrinology',
    abbreviation: 'ESE',
    country: 'EU',
    specialties: ['endocrinology'],
    homepage: 'https://www.ese-hormones.org',
    guidelinesIndexUrl: 'https://www.ese-hormones.org/publications/guidelines/',
    description:
      'Pan-European endocrinology body; publishes clinical practice guidelines, often jointly with disease-specific networks.',
  },
  {
    id: 'easd',
    name: 'European Association for the Study of Diabetes',
    abbreviation: 'EASD',
    country: 'EU',
    specialties: ['diabetology'],
    homepage: 'https://www.easd.org',
    guidelinesIndexUrl: 'https://www.easd.org/guidelines.html',
    description:
      'Co-develops the ADA/EASD consensus report on management of hyperglycaemia in type 2 diabetes.',
  },
  {
    id: 'ptd',
    name: 'Diabetes Poland (Polish Diabetes Association)',
    nameLocal: 'Polskie Towarzystwo Diabetologiczne',
    abbreviation: 'PTD',
    country: 'PL',
    specialties: ['diabetology'],
    homepage: 'https://ptdiab.pl',
    guidelinesIndexUrl: 'https://ptdiab.pl/zalecenia-ptd',
    description:
      'Publishes annual clinical recommendations for diabetes care ("Zalecenia kliniczne") — a model of yearly-refreshed national guidance.',
  },
  {
    id: 'pte',
    name: 'Polish Society of Endocrinology',
    nameLocal: 'Polskie Towarzystwo Endokrynologiczne',
    abbreviation: 'PTE',
    country: 'PL',
    specialties: ['endocrinology'],
    homepage: 'https://ptendo.org.pl',
    guidelinesIndexUrl: 'https://ptendo.org.pl/',
    description:
      'National Polish endocrinology society; issues recommendations and position statements on endocrine disease management.',
  },

  // ─────────────────────────────── Nephrology & hypertension ───────────────
  {
    id: 'kdigo',
    name: 'Kidney Disease: Improving Global Outcomes',
    abbreviation: 'KDIGO',
    country: 'INT',
    specialties: ['nephrology'],
    homepage: 'https://kdigo.org',
    guidelinesIndexUrl: 'https://kdigo.org/guidelines/',
    description:
      'Global body producing the reference guidelines for CKD, glomerular disease, transplantation, diabetes in CKD and mineral-bone disorder.',
  },
  {
    id: 'nkf',
    name: 'National Kidney Foundation',
    abbreviation: 'NKF',
    country: 'US',
    specialties: ['nephrology'],
    homepage: 'https://www.kidney.org',
    guidelinesIndexUrl: 'https://www.kidney.org/professionals/guidelines',
    description:
      'Publishes the KDOQI clinical practice guidelines (dialysis adequacy, vascular access, nutrition, CKD evaluation).',
  },
  {
    id: 'era',
    name: 'European Renal Association',
    abbreviation: 'ERA',
    country: 'EU',
    specialties: ['nephrology'],
    homepage: 'https://www.era-online.org',
    guidelinesIndexUrl: 'https://www.era-online.org/guidelines/',
    description:
      'Pan-European nephrology society; its ERBP working group produces European renal best-practice guidelines.',
  },
  {
    id: 'ptn',
    name: 'Polish Society of Nephrology',
    nameLocal: 'Polskie Towarzystwo Nefrologiczne',
    abbreviation: 'PTNef',
    country: 'PL',
    specialties: ['nephrology'],
    homepage: 'https://ptnefro.pl',
    guidelinesIndexUrl: 'https://ptnefro.com.pl/zalecenia-i-stanowiska-ptn',
    description:
      'National Polish nephrology society; issues recommendations on renal replacement therapy and CKD management.',
  },
  {
    id: 'ptnt',
    name: 'Polish Society of Hypertension',
    nameLocal: 'Polskie Towarzystwo Nadciśnienia Tętniczego',
    abbreviation: 'PTNT',
    country: 'PL',
    specialties: ['hypertensiology', 'cardiology'],
    homepage: 'https://nadcisnienietetnicze.pl',
    guidelinesIndexUrl: 'https://www.nadcisnienietetnicze.pl/',
    description: 'Issues the national Polish guidelines on the management of arterial hypertension.',
  },

  // ─────────────────────────────── Pulmonology & respiratory ───────────────
  {
    id: 'gold',
    name: 'Global Initiative for Chronic Obstructive Lung Disease',
    abbreviation: 'GOLD',
    country: 'INT',
    specialties: ['pulmonology'],
    homepage: 'https://goldcopd.org',
    guidelinesIndexUrl: 'https://goldcopd.org/2025-gold-report/',
    description:
      'Global reference report for COPD diagnosis, management and prevention, updated annually.',
  },
  {
    id: 'gina',
    name: 'Global Initiative for Asthma',
    abbreviation: 'GINA',
    country: 'INT',
    specialties: ['pulmonology', 'allergy-immunology'],
    homepage: 'https://ginasthma.org',
    guidelinesIndexUrl: 'https://ginasthma.org/reports/',
    description:
      'Global strategy report for asthma management and prevention, updated annually.',
  },
  {
    id: 'ats',
    name: 'American Thoracic Society',
    abbreviation: 'ATS',
    country: 'US',
    specialties: ['pulmonology'],
    homepage: 'https://www.thoracic.org',
    guidelinesIndexUrl: 'https://www.thoracic.org/statements/',
    description:
      'Publishes clinical practice guidelines and official statements on respiratory and critical-care disease.',
  },
  {
    id: 'ers',
    name: 'European Respiratory Society',
    abbreviation: 'ERS',
    country: 'EU',
    specialties: ['pulmonology'],
    homepage: 'https://www.ersnet.org',
    guidelinesIndexUrl: 'https://www.ersnet.org/science-and-research/development-programme/ers-clinical-practice-guidelines-statements-and-technical-standards/',
    description:
      'Pan-European respiratory society; publishes ERS and joint ERS/ATS clinical practice guidelines.',
  },
  {
    id: 'ptchp',
    name: 'Polish Respiratory Society',
    nameLocal: 'Polskie Towarzystwo Chorób Płuc',
    abbreviation: 'PTChP',
    country: 'PL',
    specialties: ['pulmonology'],
    homepage: 'https://ptchp.org',
    guidelinesIndexUrl: 'https://ptchp.org/zalecenia-ptchp/',
    description:
      'National Polish respiratory society; issues recommendations on asthma, COPD and other lung diseases.',
  },

  // ─────────────────────────────── Infectious disease & microbiology ───────
  {
    id: 'idsa',
    name: 'Infectious Diseases Society of America',
    abbreviation: 'IDSA',
    country: 'US',
    specialties: ['infectious-disease'],
    homepage: 'https://www.idsociety.org',
    guidelinesIndexUrl: 'https://www.idsociety.org/practice-guideline/practice-guidelines/',
    description:
      'Publishes the reference US guidelines across infectious diseases (antimicrobial therapy, HIV, sepsis, endocarditis, C. difficile).',
  },
  {
    id: 'escmid',
    name: 'European Society of Clinical Microbiology and Infectious Diseases',
    abbreviation: 'ESCMID',
    country: 'EU',
    specialties: ['infectious-disease'],
    homepage: 'https://www.escmid.org',
    guidelinesIndexUrl: 'https://www.escmid.org/guidelines-journals/guidelines/published-guidelines/',
    description:
      'Pan-European ID/microbiology society; publishes guidelines on resistant infections, antifungal therapy and diagnostics.',
  },
  {
    id: 'who',
    name: 'World Health Organization',
    abbreviation: 'WHO',
    country: 'INT',
    specialties: ['infectious-disease', 'primary-care'],
    homepage: 'https://www.who.int',
    guidelinesIndexUrl: 'https://www.who.int/publications/who-guidelines',
    description:
      'Global normative guidelines spanning infectious disease, maternal/child health, NCDs and essential medicines.',
  },
  {
    id: 'npoa',
    name: 'National Programme for Protection of Antibiotics (Poland)',
    nameLocal: 'Narodowy Program Ochrony Antybiotyków',
    abbreviation: 'NPOA',
    country: 'PL',
    specialties: ['infectious-disease'],
    homepage: 'https://antybiotyki.edu.pl',
    guidelinesIndexUrl: 'https://antybiotyki.edu.pl/rekomendacje/',
    description:
      'Polish Ministry of Health programme issuing national recommendations on antimicrobial therapy and healthcare-associated infections.',
  },

  // ─────────────────────────────── Oncology & haematology ──────────────────
  {
    id: 'nccn',
    name: 'National Comprehensive Cancer Network',
    abbreviation: 'NCCN',
    country: 'US',
    specialties: ['oncology'],
    homepage: 'https://www.nccn.org',
    guidelinesIndexUrl: 'https://www.nccn.org/guidelines/category_1',
    description:
      'Publishes the NCCN Clinical Practice Guidelines in Oncology — the most frequently updated cancer treatment guidelines.',
  },
  {
    id: 'asco',
    name: 'American Society of Clinical Oncology',
    abbreviation: 'ASCO',
    country: 'US',
    specialties: ['oncology'],
    homepage: 'https://www.asco.org',
    guidelinesIndexUrl: 'https://www.asco.org/guidelines',
    description:
      'Publishes evidence-based clinical practice guidelines on cancer treatment, supportive care and survivorship.',
  },
  {
    id: 'esmo',
    name: 'European Society for Medical Oncology',
    abbreviation: 'ESMO',
    country: 'EU',
    specialties: ['oncology'],
    homepage: 'https://www.esmo.org',
    guidelinesIndexUrl: 'https://www.esmo.org/guidelines',
    description:
      'Publishes ESMO Clinical Practice Guidelines across tumour types, plus living guidelines for fast-moving areas.',
  },
  {
    id: 'ptok',
    name: 'Polish Society of Clinical Oncology',
    nameLocal: 'Polskie Towarzystwo Onkologii Klinicznej',
    abbreviation: 'PTOK',
    country: 'PL',
    specialties: ['oncology'],
    homepage: 'https://ptok.pl',
    guidelinesIndexUrl: 'https://ptok.pl/',
    description:
      'Issues the Polish diagnostic-therapeutic recommendations for malignant tumours ("Zalecenia postępowania").',
  },
  {
    id: 'ash',
    name: 'American Society of Hematology',
    abbreviation: 'ASH',
    country: 'US',
    specialties: ['hematology'],
    homepage: 'https://www.hematology.org',
    guidelinesIndexUrl: 'https://www.hematology.org/education/clinicians/guidelines-and-quality-care/clinical-practice-guidelines',
    description:
      'Publishes ASH Clinical Practice Guidelines (VTE, ITP, sickle cell disease, MDS and more).',
  },
  {
    id: 'eha',
    name: 'European Hematology Association',
    abbreviation: 'EHA',
    country: 'EU',
    specialties: ['hematology'],
    homepage: 'https://ehaweb.org',
    guidelinesIndexUrl: 'https://ehaweb.org/guidelines/',
    description:
      'Pan-European haematology society; publishes and endorses guidelines on malignant and non-malignant blood disorders.',
  },
  {
    id: 'pthit',
    name: 'Polish Society of Haematology and Transfusion Medicine',
    nameLocal: 'Polskie Towarzystwo Hematologów i Transfuzjologów',
    abbreviation: 'PTHiT',
    country: 'PL',
    specialties: ['hematology'],
    homepage: 'https://pthit.pl',
    guidelinesIndexUrl: 'https://pthit.pl/',
    description:
      'National Polish haematology/transfusion society; issues recommendations on blood disorders and transfusion medicine.',
  },

  // ─────────────────────────────── Rheumatology ────────────────────────────
  {
    id: 'acr',
    name: 'American College of Rheumatology',
    abbreviation: 'ACR',
    country: 'US',
    specialties: ['rheumatology'],
    homepage: 'https://rheumatology.org',
    guidelinesIndexUrl: 'https://rheumatology.org/clinical-practice-guidelines',
    description:
      'Publishes ACR clinical practice guidelines for RA, gout, osteoarthritis, lupus, vasculitis and more.',
  },
  {
    id: 'eular',
    name: 'European Alliance of Associations for Rheumatology',
    abbreviation: 'EULAR',
    country: 'EU',
    specialties: ['rheumatology'],
    homepage: 'https://www.eular.org',
    guidelinesIndexUrl: 'https://www.eular.org/recommendations-home',
    description:
      'Publishes EULAR recommendations for the management of rheumatic and musculoskeletal diseases.',
  },
  {
    id: 'ptr',
    name: 'Polish Society for Rheumatology',
    nameLocal: 'Polskie Towarzystwo Reumatologiczne',
    abbreviation: 'PTR',
    country: 'PL',
    specialties: ['rheumatology'],
    homepage: 'https://ptr.info.pl',
    guidelinesIndexUrl: 'https://ptr.info.pl/',
    description:
      'National Polish rheumatology society; issues recommendations published in the journal Reumatologia.',
  },

  // ─────────────────────────────── Neurology & psychiatry ──────────────────
  {
    id: 'aan',
    name: 'American Academy of Neurology',
    abbreviation: 'AAN',
    country: 'US',
    specialties: ['neurology'],
    homepage: 'https://www.aan.com',
    guidelinesIndexUrl: 'https://www.aan.com/practice/guidelines',
    description:
      'Publishes evidence-based practice guidelines across neurological disease (stroke, epilepsy, MS, headache, dementia).',
  },
  {
    id: 'ean',
    name: 'European Academy of Neurology',
    abbreviation: 'EAN',
    country: 'EU',
    specialties: ['neurology'],
    homepage: 'https://www.ean.org',
    guidelinesIndexUrl: 'https://www.ean.org/research/ean-guidelines',
    description:
      'Pan-European neurology body; publishes EAN clinical practice guidelines, often jointly with subspecialty societies.',
  },
  {
    id: 'ptneuro',
    name: 'Polish Neurological Society',
    nameLocal: 'Polskie Towarzystwo Neurologiczne',
    abbreviation: 'PTNeuro',
    country: 'PL',
    specialties: ['neurology'],
    homepage: 'https://ptneuro.pl',
    guidelinesIndexUrl: 'https://ptneuro.pl/',
    description:
      'National Polish neurology society; issues recommendations on stroke, epilepsy, multiple sclerosis and more.',
  },
  {
    id: 'apa-psych',
    name: 'American Psychiatric Association',
    abbreviation: 'APA',
    country: 'US',
    specialties: ['psychiatry'],
    homepage: 'https://www.psychiatry.org',
    guidelinesIndexUrl: 'https://www.psychiatry.org/psychiatrists/practice/clinical-practice-guidelines',
    description:
      'Publishes clinical practice guidelines for psychiatric disorders (depression, schizophrenia, eating disorders, substance use).',
  },
  {
    id: 'ptp-psych',
    name: 'Polish Psychiatric Association',
    nameLocal: 'Polskie Towarzystwo Psychiatryczne',
    abbreviation: 'PTP',
    country: 'PL',
    specialties: ['psychiatry'],
    homepage: 'https://psychiatria.org.pl',
    guidelinesIndexUrl: 'https://psychiatria.org.pl/rekomendacje',
    description:
      'National Polish psychiatric society; issues treatment recommendations and standards for mental-health care.',
  },

  // ─────────────────────────────── Allergy & immunology ────────────────────
  {
    id: 'aaaai',
    name: 'American Academy of Allergy, Asthma & Immunology',
    abbreviation: 'AAAAI',
    country: 'US',
    specialties: ['allergy-immunology'],
    homepage: 'https://www.aaaai.org',
    guidelinesIndexUrl: 'https://www.aaaai.org/practice-resources/statements-and-practice-parameters',
    description:
      'Publishes Joint Task Force practice parameters on allergic disease, asthma and immunology.',
  },
  {
    id: 'eaaci',
    name: 'European Academy of Allergy and Clinical Immunology',
    abbreviation: 'EAACI',
    country: 'EU',
    specialties: ['allergy-immunology'],
    homepage: 'https://www.eaaci.org',
    guidelinesIndexUrl: 'https://www.eaaci.org/resources/guidelines/',
    description:
      'Pan-European allergy society; publishes guidelines on anaphylaxis, food allergy, rhinitis and immunotherapy.',
  },
  {
    id: 'pta',
    name: 'Polish Society of Allergology',
    nameLocal: 'Polskie Towarzystwo Alergologiczne',
    abbreviation: 'PTA',
    country: 'PL',
    specialties: ['allergy-immunology'],
    homepage: 'https://pta.med.pl',
    guidelinesIndexUrl: 'https://pta.med.pl/',
    description:
      'National Polish allergology society; issues standards and recommendations on allergic disease management.',
  },

  // ─────────────────────────────── Dermatology ─────────────────────────────
  {
    id: 'aad',
    name: 'American Academy of Dermatology',
    abbreviation: 'AAD',
    country: 'US',
    specialties: ['dermatology'],
    homepage: 'https://www.aad.org',
    guidelinesIndexUrl: 'https://www.aad.org/member/clinical-quality/guidelines',
    description:
      'Publishes clinical practice guidelines for psoriasis, atopic dermatitis, acne, melanoma and skin cancer.',
  },
  {
    id: 'eadv',
    name: 'European Academy of Dermatology and Venereology',
    abbreviation: 'EADV',
    country: 'EU',
    specialties: ['dermatology'],
    homepage: 'https://www.eadv.org',
    guidelinesIndexUrl: 'https://www.eadv.org/guidelines/',
    description:
      'Pan-European dermatology society; develops and endorses guidelines on skin disease and venereology.',
  },
  {
    id: 'ptderm',
    name: 'Polish Dermatological Society',
    nameLocal: 'Polskie Towarzystwo Dermatologiczne',
    abbreviation: 'PTD (derm.)',
    country: 'PL',
    specialties: ['dermatology'],
    homepage: 'https://ptderm.pl',
    guidelinesIndexUrl: 'https://ptderm.pl/',
    description:
      'National Polish dermatology society; issues diagnostic-therapeutic recommendations for skin disease.',
  },

  // ─────────────────────────────── Urology & nephro-urology ────────────────
  {
    id: 'aua',
    name: 'American Urological Association',
    abbreviation: 'AUA',
    country: 'US',
    specialties: ['urology'],
    homepage: 'https://www.auanet.org',
    guidelinesIndexUrl: 'https://www.auanet.org/guidelines-and-quality/guidelines',
    description:
      'Publishes AUA clinical guidelines for prostate disease, stones, incontinence and urologic oncology.',
  },
  {
    id: 'eau',
    name: 'European Association of Urology',
    abbreviation: 'EAU',
    country: 'EU',
    specialties: ['urology'],
    homepage: 'https://uroweb.org',
    guidelinesIndexUrl: 'https://uroweb.org/guidelines',
    description:
      'Publishes the comprehensive, annually updated EAU Guidelines across the full range of urology.',
  },
  {
    id: 'ptu',
    name: 'Polish Urological Association',
    nameLocal: 'Polskie Towarzystwo Urologiczne',
    abbreviation: 'PTU',
    country: 'PL',
    specialties: ['urology'],
    homepage: 'https://pturol.org.pl',
    guidelinesIndexUrl: 'https://pturol.org.pl/',
    description:
      'National Polish urology society; issues recommendations and Polish adaptations of EAU guidelines.',
  },

  // ─────────────────────────────── Obstetrics & gynaecology ────────────────
  {
    id: 'acog',
    name: 'American College of Obstetricians and Gynecologists',
    abbreviation: 'ACOG',
    country: 'US',
    specialties: ['obstetrics-gynecology'],
    homepage: 'https://www.acog.org',
    guidelinesIndexUrl: 'https://www.acog.org/clinical/clinical-guidance',
    description:
      'Publishes Practice Bulletins, Committee Opinions and Clinical Practice Guidelines across obstetrics and gynaecology.',
  },
  {
    id: 'rcog',
    name: 'Royal College of Obstetricians and Gynaecologists',
    abbreviation: 'RCOG',
    country: 'UK',
    specialties: ['obstetrics-gynecology'],
    homepage: 'https://www.rcog.org.uk',
    guidelinesIndexUrl: 'https://www.rcog.org.uk/guidance/browse-all-guidance/',
    description:
      'Publishes Green-top Guidelines and other guidance widely used across the UK and internationally.',
  },
  {
    id: 'figo',
    name: 'International Federation of Gynecology and Obstetrics',
    abbreviation: 'FIGO',
    country: 'INT',
    specialties: ['obstetrics-gynecology'],
    homepage: 'https://www.figo.org',
    guidelinesIndexUrl: 'https://www.figo.org/',
    description:
      'Global OB/GYN federation; publishes international guidelines (e.g. FIGO staging, postpartum haemorrhage, GDM).',
  },
  {
    id: 'ptgip',
    name: 'Polish Society of Gynecologists and Obstetricians',
    nameLocal: 'Polskie Towarzystwo Ginekologów i Położników',
    abbreviation: 'PTGiP',
    country: 'PL',
    specialties: ['obstetrics-gynecology'],
    homepage: 'https://www.ptgin.pl',
    guidelinesIndexUrl: 'https://www.ptgin.pl/rekomendacje',
    description:
      'National Polish OB/GYN society; issues the reference Polish recommendations in obstetrics and gynaecology.',
  },

  // ─────────────────────────────── Paediatrics ─────────────────────────────
  {
    id: 'aap',
    name: 'American Academy of Pediatrics',
    abbreviation: 'AAP',
    country: 'US',
    specialties: ['pediatrics'],
    homepage: 'https://www.aap.org',
    guidelinesIndexUrl: 'https://publications.aap.org/collection/523/Clinical-Practice-Guidelines',
    description:
      'Publishes clinical practice guidelines across paediatrics (bronchiolitis, otitis media, obesity, ADHD, hyperbilirubinaemia).',
  },
  {
    id: 'espghan',
    name: 'European Society for Paediatric Gastroenterology Hepatology and Nutrition',
    abbreviation: 'ESPGHAN',
    country: 'EU',
    specialties: ['pediatrics', 'gastroenterology'],
    homepage: 'https://www.espghan.org',
    guidelinesIndexUrl: 'https://espghan.info/published-guidelines/',
    description:
      'Publishes paediatric GI/hepatology/nutrition guidelines (coeliac disease, paediatric IBD, infant feeding).',
  },
  {
    id: 'ptped',
    name: 'Polish Paediatric Society',
    nameLocal: 'Polskie Towarzystwo Pediatryczne',
    abbreviation: 'PTPed',
    country: 'PL',
    specialties: ['pediatrics'],
    homepage: 'https://ptp.edu.pl',
    guidelinesIndexUrl: 'https://ptp.edu.pl/rekomendacje',
    description:
      'National Polish paediatric society; issues recommendations and standards for child health.',
  },

  // ─────────────────────────────── Surgery & orthopaedics ──────────────────
  {
    id: 'acs',
    name: 'American College of Surgeons',
    abbreviation: 'ACS',
    country: 'US',
    specialties: ['surgery'],
    homepage: 'https://www.facs.org',
    guidelinesIndexUrl: 'https://www.facs.org/for-medical-professionals/clinical-practice/',
    description:
      'Publishes surgical clinical guidance and best-practice guidelines (trauma, cancer, bariatric, quality programmes).',
  },
  {
    id: 'sages',
    name: 'Society of American Gastrointestinal and Endoscopic Surgeons',
    abbreviation: 'SAGES',
    country: 'US',
    specialties: ['surgery', 'gastroenterology'],
    homepage: 'https://www.sages.org',
    guidelinesIndexUrl: 'https://www.sages.org/publications/guidelines/',
    description:
      'Publishes guidelines for minimally invasive and GI surgery (cholecystectomy, hernia, bariatric, endoscopy).',
  },
  {
    id: 'tchp',
    name: 'Association of Polish Surgeons',
    nameLocal: 'Towarzystwo Chirurgów Polskich',
    abbreviation: 'TChP',
    country: 'PL',
    specialties: ['surgery'],
    homepage: 'https://tchp.pl',
    guidelinesIndexUrl: 'https://tchp.pl/edukacja/wytyczne',
    description:
      'National Polish surgical society; issues recommendations and standards for general and GI surgery.',
  },
  {
    id: 'aaos',
    name: 'American Academy of Orthopaedic Surgeons',
    abbreviation: 'AAOS',
    country: 'US',
    specialties: ['orthopedics'],
    homepage: 'https://www.aaos.org',
    guidelinesIndexUrl: 'https://www.aaos.org/quality/quality-programs/clinical-practice-guidelines/',
    description:
      'Publishes evidence-based clinical practice guidelines for musculoskeletal conditions and orthopaedic trauma.',
  },
  {
    id: 'boa',
    name: 'British Orthopaedic Association',
    abbreviation: 'BOA',
    country: 'UK',
    specialties: ['orthopedics'],
    homepage: 'https://www.boa.ac.uk',
    guidelinesIndexUrl: 'https://www.boa.ac.uk/standards-guidance/boasts.html',
    description:
      'Publishes BOA Standards for Trauma & Orthopaedics (BOASt) — single-page auditable standards embedded in UK practice.',
  },

  // ─────────────────────────────── Emergency, anaesthesia & critical care ──
  {
    id: 'acep',
    name: 'American College of Emergency Physicians',
    abbreviation: 'ACEP',
    country: 'US',
    specialties: ['emergency-medicine'],
    homepage: 'https://www.acep.org',
    guidelinesIndexUrl: 'https://www.acep.org/patient-care/clinical-policies/',
    description:
      'Publishes ACEP Clinical Policies — evidence-based guidance on high-stakes emergency presentations.',
  },
  {
    id: 'sccm',
    name: 'Society of Critical Care Medicine',
    abbreviation: 'SCCM',
    country: 'US',
    specialties: ['critical-care'],
    homepage: 'https://www.sccm.org',
    guidelinesIndexUrl: 'https://www.sccm.org/clinical-resources/guidelines',
    description:
      'Publishes critical-care guidelines including the Surviving Sepsis Campaign, pain/agitation/delirium and nutrition.',
  },
  {
    id: 'asa-anes',
    name: 'American Society of Anesthesiologists',
    abbreviation: 'ASA',
    country: 'US',
    specialties: ['anesthesiology'],
    homepage: 'https://www.asahq.org',
    guidelinesIndexUrl: 'https://www.asahq.org/standards-and-practice-parameters',
    description:
      'Publishes practice guidelines, standards and parameters for anaesthesia and perioperative care.',
  },
  {
    id: 'esaic',
    name: 'European Society of Anaesthesiology and Intensive Care',
    abbreviation: 'ESAIC',
    country: 'EU',
    specialties: ['anesthesiology', 'critical-care'],
    homepage: 'https://www.esaic.org',
    guidelinesIndexUrl: 'https://www.esaic.org/guidelines/',
    description:
      'Pan-European anaesthesiology society; publishes guidelines on perioperative bleeding, PONV and preoperative evaluation.',
  },

  // ─────────────────────────────── Ophthalmology & ENT ─────────────────────
  {
    id: 'aao',
    name: 'American Academy of Ophthalmology',
    abbreviation: 'AAO',
    country: 'US',
    specialties: ['ophthalmology'],
    homepage: 'https://www.aao.org',
    guidelinesIndexUrl: 'https://www.aao.org/guidelines-browse',
    description:
      'Publishes the Preferred Practice Pattern (PPP) guidelines across eye disease (glaucoma, AMD, diabetic retinopathy).',
  },
  {
    id: 'aao-hns',
    name: 'American Academy of Otolaryngology–Head and Neck Surgery',
    abbreviation: 'AAO-HNS',
    country: 'US',
    specialties: ['otolaryngology'],
    homepage: 'https://www.entnet.org',
    guidelinesIndexUrl: 'https://www.entnet.org/quality-practice/quality-products/clinical-practice-guidelines/',
    description:
      'Publishes clinical practice guidelines for ENT conditions (sinusitis, otitis media with effusion, tinnitus, vertigo).',
  },

  // ─────────────────────────────── Primary care, prevention & cross-cutting ─
  {
    id: 'aafp',
    name: 'American Academy of Family Physicians',
    abbreviation: 'AAFP',
    country: 'US',
    specialties: ['primary-care'],
    homepage: 'https://www.aafp.org',
    guidelinesIndexUrl: 'https://www.aafp.org/family-physician/patient-care/clinical-recommendations.html',
    description:
      'Develops and endorses clinical recommendations for primary care, spanning prevention and chronic disease.',
  },
  {
    id: 'uspstf',
    name: 'US Preventive Services Task Force',
    abbreviation: 'USPSTF',
    country: 'US',
    specialties: ['primary-care'],
    homepage: 'https://www.uspreventiveservicestaskforce.org',
    guidelinesIndexUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation-topics',
    description:
      'Independent panel issuing the reference US preventive-services recommendations (screening, counselling, preventive medication).',
  },
  {
    id: 'nice',
    name: 'National Institute for Health and Care Excellence',
    abbreviation: 'NICE',
    country: 'UK',
    specialties: ['primary-care'],
    homepage: 'https://www.nice.org.uk',
    guidelinesIndexUrl: 'https://www.nice.org.uk/guidance',
    description:
      'UK body publishing comprehensive, cross-specialty evidence-based guidance and technology appraisals.',
  },
  {
    id: 'sign',
    name: 'Scottish Intercollegiate Guidelines Network',
    abbreviation: 'SIGN',
    country: 'UK',
    specialties: ['primary-care'],
    homepage: 'https://www.sign.ac.uk',
    guidelinesIndexUrl: 'https://www.sign.ac.uk/our-guidelines/',
    description:
      'Develops evidence-based clinical guidelines for NHS Scotland across a wide range of conditions.',
  },
  {
    id: 'klrwp',
    name: 'College of Family Physicians in Poland',
    nameLocal: 'Kolegium Lekarzy Rodzinnych w Polsce',
    abbreviation: 'KLRwP',
    country: 'PL',
    specialties: ['primary-care'],
    homepage: 'https://klrwp.pl',
    guidelinesIndexUrl: 'https://klrwp.pl/',
    description:
      'National Polish college of family physicians; co-authors multi-society primary-care recommendations.',
  },
];
