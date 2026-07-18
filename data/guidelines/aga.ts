import type { Guideline } from '../../src/lib/types';

/**
 * American Gastroenterological Association (AGA) Clinical Practice Guidelines,
 * including "living" guidelines that are periodically refreshed.
 * Hand-curated demo records — verify against source before clinical use.
 */
export const agaGuidelines: Guideline[] = [
  {
    id: 'aga-ulcerative-colitis-2024',
    societyId: 'aga',
    conditionIds: ['ulcerative-colitis'],
    title: 'AGA Living Clinical Practice Guideline on Pharmacological Management of Moderate-to-Severe Ulcerative Colitis',
    language: 'en',
    specialty: 'gastroenterology',
    year: 2024,
    status: 'current',
    sourceUrl: 'https://gastro.org/clinical-guidance/',
    citation: 'Gastroenterology. 2024 (AGA Living CPG).',
    summary:
      'A "living" guideline focused on drug therapy for moderate-to-severe ulcerative colitis. It positions advanced therapies by relative efficacy, favoring earlier use of higher-efficacy agents (e.g., infliximab, vedolizumab, ustekinumab, upadacitinib, ozanimod, risankizumab, mirikizumab) and advising against thiopurine monotherapy for induction.',
    keyRecommendations: [
      {
        topic: 'Higher-efficacy first',
        text: 'In moderate-to-severe UC, the AGA suggests using more effective agents (e.g., infliximab, vedolizumab, ustekinumab, upadacitinib, ozanimod, mirikizumab, risankizumab) rather than starting with lower-efficacy therapy, particularly in higher-risk patients.',
        evidenceGrade: 'Conditional recommendation, low-moderate certainty',
        lineOfTherapy: 'first-line',
        drugs: ['infliximab', 'vedolizumab', 'ustekinumab', 'upadacitinib', 'ozanimod', 'mirikizumab', 'risankizumab'],
      },
      {
        topic: 'Biologic-naive positioning',
        text: 'For biologic-naive patients, higher-efficacy options are preferred; when access is limited, choose the most effective available agent the patient can obtain.',
        lineOfTherapy: 'first-line',
      },
      {
        topic: 'Against thiopurine monotherapy for induction',
        text: 'The AGA advises against thiopurine monotherapy to induce remission, and against corticosteroids for maintenance.',
        lineOfTherapy: 'maintenance',
        drugs: ['azathioprine'],
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
  {
    id: 'aga-crohns-disease-2025',
    societyId: 'aga',
    conditionIds: ['crohns-disease'],
    title: 'AGA Living Clinical Practice Guideline on Pharmacological Management of Moderate-to-Severe Crohn’s Disease',
    language: 'en',
    specialty: 'gastroenterology',
    year: 2025,
    status: 'current',
    sourceUrl: 'https://gastro.org/clinical-guidance/',
    citation: 'Gastroenterology. 2025 (AGA Living CPG).',
    summary:
      "A living guideline on drug therapy for moderate-to-severe Crohn's disease. It recommends early use of advanced therapies over a slow step-up approach in patients at higher risk, and provides comparative positioning of biologics and small molecules, favoring higher-efficacy agents and combination strategies.",
    keyRecommendations: [
      {
        topic: 'Early advanced therapy',
        text: 'Recommend early introduction of advanced therapy (rather than step-up with 5-ASA or prolonged corticosteroids) in moderate-to-severe disease, especially with high-risk features.',
        evidenceGrade: 'Conditional recommendation',
        lineOfTherapy: 'first-line',
        drugs: ['infliximab', 'adalimumab', 'ustekinumab', 'risankizumab', 'vedolizumab', 'upadacitinib'],
      },
      {
        topic: 'Comparative positioning',
        text: 'Higher-efficacy agents (anti-TNF, anti-IL-23, upadacitinib) are suggested over lower-efficacy options; combination of an anti-TNF with an immunomodulator improves outcomes in selected patients.',
        lineOfTherapy: 'escalation',
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
  {
    id: 'aga-microscopic-colitis-2016',
    societyId: 'aga',
    conditionIds: ['microscopic-colitis'],
    title: 'AGA Institute Guideline on the Medical Management of Microscopic Colitis',
    language: 'en',
    specialty: 'gastroenterology',
    year: 2016,
    status: 'current',
    sourceUrl: 'https://gastro.org/clinical-guidance/',
    citation: 'Nguyen GC, et al. Gastroenterology. 2016;150(1):242-246.',
    summary:
      'Medical management of microscopic colitis (collagenous and lymphocytic subtypes) presenting with chronic watery diarrhea. Budesonide is recommended for induction of clinical remission and is favored for maintenance in patients who relapse after stopping therapy; offending drugs should be reviewed and stopped where possible.',
    keyRecommendations: [
      {
        topic: 'Induction of remission',
        text: 'Recommend oral budesonide to induce clinical remission in symptomatic microscopic colitis; it is preferred over other agents.',
        evidenceGrade: 'Strong recommendation, moderate-quality evidence',
        lineOfTherapy: 'first-line',
        drugs: ['budesonide'],
      },
      {
        topic: 'Maintenance',
        text: 'For patients who relapse after stopping, budesonide is recommended for maintenance of remission at the lowest effective dose.',
        lineOfTherapy: 'maintenance',
        drugs: ['budesonide'],
      },
      {
        topic: 'Contributing medications',
        text: 'Review and discontinue potentially causative drugs (e.g., NSAIDs, PPIs, SSRIs) where clinically appropriate.',
        lineOfTherapy: 'supportive',
      },
    ],
    lastVerified: '2026-07-18',
    dataProvenance: 'hand-curated-demo',
  },
];
