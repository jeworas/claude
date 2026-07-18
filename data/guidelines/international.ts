import type { Guideline } from '../../src/lib/types';

/**
 * Guidelines from international / global bodies (GOLD, and future KDIGO, WHO…).
 *
 * Hand-curated from the published source: key recommendations are paraphrased
 * and attributed, never reproduced verbatim (the GOLD Pocket Guide is marked
 * copyright — do not distribute). Verify against the source before clinical use.
 */
export const internationalGuidelines: Guideline[] = [
  {
    id: 'gold-copd-2025',
    societyId: 'gold',
    conditionIds: ['copd'],
    title:
      'Global Strategy for the Diagnosis, Management, and Prevention of Chronic Obstructive Pulmonary Disease (2025 Report)',
    language: 'en',
    specialty: 'pulmonology',
    year: 2025,
    status: 'current',
    sourceUrl: 'https://goldcopd.org/2025-gold-report/',
    citation:
      'Global Initiative for Chronic Obstructive Lung Disease (GOLD). Global Strategy for the Diagnosis, Management, and Prevention of COPD: 2025 Report. goldcopd.org.',
    summary:
      'The GOLD 2025 report is the global reference for diagnosing and managing chronic obstructive pulmonary disease. Diagnosis requires spirometry showing a post-bronchodilator FEV1/FVC below 0.7. Patients are sorted into groups A, B and E from symptom burden and exacerbation history to guide therapy, which centres on long-acting inhaled bronchodilators — usually dual LABA+LAMA — with an inhaled corticosteroid added for frequent exacerbations and high blood eosinophils. Smoking cessation, vaccination and pulmonary rehabilitation are core; exacerbations are treated with short-acting bronchodilators, short courses of systemic corticosteroids, and antibiotics when indicated.',
    keyRecommendations: [
      {
        topic: 'Diagnosis — spirometry',
        text: 'Consider COPD in anyone with dyspnea, chronic cough or sputum, or risk-factor exposure, but a post-bronchodilator FEV1/FVC below 0.7 on spirometry is mandatory to confirm the diagnosis.',
        lineOfTherapy: 'diagnosis',
      },
      {
        topic: 'Assessment — GOLD ABE groups',
        text: 'After confirming airflow obstruction, grade its severity by post-bronchodilator FEV1 (GOLD 1–4) and combine symptom scores (mMRC or CAT) with the prior year’s exacerbation history into groups A, B or E to direct initial therapy.',
        lineOfTherapy: 'diagnosis',
      },
      {
        topic: 'Smoking cessation',
        text: 'Strongly support every patient who smokes to quit; nicotine replacement and pharmacotherapy reliably raise long-term abstinence, and counselling plus legislative bans improve quit rates.',
        lineOfTherapy: 'prevention',
        drugs: ['nicotine replacement therapy'],
      },
      {
        topic: 'Vaccination',
        text: 'Offer influenza, pneumococcal and COVID-19 vaccination — and, per CDC, Tdap, zoster and RSV vaccines — to reduce lower-respiratory infections and exacerbations.',
        lineOfTherapy: 'prevention',
      },
      {
        topic: 'Initial maintenance pharmacotherapy',
        text: 'Long-acting bronchodilators are the foundation of maintenance therapy: most symptomatic patients (groups B and E) start on a dual LABA+LAMA inhaler, while low-symptom, low-risk group A patients start on a single bronchodilator.',
        lineOfTherapy: 'first-line',
        drugs: ['LABA', 'LAMA'],
      },
      {
        topic: 'Adding inhaled corticosteroids',
        text: 'In patients with continued exacerbations on dual bronchodilators — especially with elevated blood eosinophils — escalate to triple therapy by adding an inhaled corticosteroid.',
        lineOfTherapy: 'escalation',
        drugs: ['LABA', 'LAMA', 'inhaled corticosteroid'],
      },
      {
        topic: 'Pulmonary rehabilitation',
        text: 'Pulmonary rehabilitation — exercise training with disease-specific education — improves exercise capacity, symptoms and quality of life across all severities of COPD.',
        lineOfTherapy: 'supportive',
      },
      {
        topic: 'Oxygen and ventilatory support',
        text: 'Long-term oxygen therapy improves survival in severe resting hypoxemia (PaO2 ≤ 55 mmHg, or < 60 mmHg with cor pulmonale/polycythemia); long-term non-invasive ventilation may help selected patients with severe chronic hypercapnia and prior hospitalization for respiratory failure.',
        lineOfTherapy: 'supportive',
      },
      {
        topic: 'Exacerbation management',
        text: 'Treat exacerbations with short-acting inhaled beta2-agonists (with or without a short-acting anticholinergic); add a systemic corticosteroid for no more than 5 days, antibiotics for 5 days when indicated, and use non-invasive ventilation first-line for acute hypercapnic respiratory failure.',
        lineOfTherapy: 'supportive',
        drugs: ['SABA', 'systemic corticosteroid', 'antibiotic'],
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
];
