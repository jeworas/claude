import type { Society } from '../src/lib/types';

/**
 * Registry of medical societies / guideline-issuing bodies (US + PL for the PoC).
 * `guidelinesIndexUrl` is the page the update-checker script watches.
 */
export const societies: Society[] = [
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
    id: 'ptnt',
    name: 'Polish Society of Hypertension',
    nameLocal: 'Polskie Towarzystwo Nadciśnienia Tętniczego',
    abbreviation: 'PTNT',
    country: 'PL',
    specialties: ['hypertensiology', 'cardiology'],
    homepage: 'https://nadcisnienietetnicze.pl',
    guidelinesIndexUrl: 'https://nadcisnienietetnicze.pl/ptnt/wytyczne_ptnt',
    description: 'Issues the national Polish guidelines on the management of arterial hypertension.',
  },
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
    id: 'ecco',
    name: "European Crohn's and Colitis Organisation",
    abbreviation: 'ECCO',
    country: 'EU',
    specialties: ['gastroenterology'],
    homepage: 'https://ecco-ibd.eu',
    guidelinesIndexUrl:
      'https://ecco-ibd.eu/publications/ecco-guidelines-science/published-ecco-guidelines.html',
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
    guidelinesIndexUrl: 'https://ueg.eu/guideline',
    description:
      'Umbrella organisation of European GI societies; develops and endorses pan-European evidence-based guidelines and standards.',
  },
];
