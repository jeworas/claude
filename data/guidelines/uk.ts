import type { Guideline } from '../../src/lib/types';

/**
 * UK guidelines (British Society of Gastroenterology and other UK bodies),
 * located and verified via PubMed — BSG publishes its guidelines in Gut, which
 * is fully indexed. Ingesting BSG's IBD guideline adds the UK as a fourth region
 * to the ulcerative colitis / Crohn's comparison alongside the US, EU and Poland.
 * Hand-curated demo records — verify against source before clinical use.
 */
export const ukGuidelines: Guideline[] = [
  {
    id: 'bsg-ibd-adults-2025',
    societyId: 'bsg',
    conditionIds: ['ulcerative-colitis', 'crohns-disease'],
    title: 'British Society of Gastroenterology Guidelines on Inflammatory Bowel Disease in Adults (2025)',
    language: 'en',
    specialty: 'gastroenterology',
    year: 2025,
    status: 'current',
    sourceUrl: 'https://doi.org/10.1136/gutjnl-2024-334395',
    citation:
      'Moran GW, Gordon M, Sinopolou V, et al. British Society of Gastroenterology guidelines on inflammatory bowel disease in adults: 2025. Gut. 2025;74(Suppl 2):s1-s101. doi:10.1136/gutjnl-2024-334395. Identified via PubMed.',
    summary:
      "The BSG's update (last revised 2019) of UK guidance on managing ulcerative colitis and Crohn's disease in adults. It integrates the national primary-care diagnostic pathway (faecal calprotectin to triage lower-GI symptoms), treat-to-target management aimed at clinical and endoscopic remission, and the modern therapeutic ladder of aminosalicylates, corticosteroids, immunomodulators, biologics and small molecules — developed through a systematic, transparent consensus of 89 experts and stakeholders.",
    keyRecommendations: [
      {
        topic: 'Diagnosis',
        text: 'Use faecal calprotectin within the national primary-care lower-GI pathway to triage suspected IBD, confirmed by ileocolonoscopy with biopsies and cross-sectional imaging, for a prompt and accurate diagnosis.',
        lineOfTherapy: 'diagnosis',
      },
      {
        topic: 'Treat-to-target',
        text: 'Manage to explicit targets — clinical and endoscopic remission — with structured monitoring, escalating therapy when targets are not met.',
        lineOfTherapy: 'maintenance',
      },
      {
        topic: 'Ulcerative colitis therapy',
        text: 'Aminosalicylates are first-line for mild-to-moderate ulcerative colitis; escalate to corticosteroids for flares and to advanced therapies for moderate-to-severe or refractory disease.',
        lineOfTherapy: 'first-line',
        drugs: ['mesalazine', 'corticosteroids'],
      },
      {
        topic: 'Advanced therapy',
        text: "For Crohn's disease and refractory ulcerative colitis, use immunomodulators and advanced therapies — anti-TNF agents, vedolizumab, ustekinumab and JAK inhibitors — matched to disease severity and phenotype.",
        lineOfTherapy: 'escalation',
        drugs: ['infliximab', 'adalimumab', 'vedolizumab', 'ustekinumab', 'upadacitinib'],
      },
    ],
    lastVerified: '2026-07-19',
    dataProvenance: 'hand-curated-demo',
  },
  {
    id: 'bsg-coeliac-2026',
    societyId: 'bsg',
    conditionIds: ['celiac-disease'],
    title: 'British Society of Gastroenterology Guidelines on the Diagnosis and Management of Adult Coeliac Disease (2026)',
    language: 'en',
    specialty: 'gastroenterology',
    year: 2026,
    status: 'current',
    sourceUrl: 'https://doi.org/10.1136/gutjnl-2025-337747',
    citation:
      'Penny HA, Shiha MG, Raju SA, et al. The 2026 British Society of Gastroenterology guidelines on the diagnosis and management of adult coeliac disease. Gut. 2026. doi:10.1136/gutjnl-2025-337747. Identified via PubMed.',
    summary:
      'Updated BSG guidance on adult coeliac disease, developed with an international multidisciplinary panel. It reaffirms serology-led diagnosis with confirmatory duodenal histology in most adults, a lifelong gluten-free diet as the cornerstone of treatment, and structured follow-up to confirm mucosal healing and manage complications.',
    keyRecommendations: [
      {
        topic: 'Diagnosis',
        text: 'Test at-risk and symptomatic adults with IgA anti-tissue transglutaminase (with total IgA) while on a gluten-containing diet; confirm with duodenal biopsies in most adults before committing to lifelong treatment.',
        lineOfTherapy: 'diagnosis',
      },
      {
        topic: 'Treatment',
        text: 'A strict, lifelong gluten-free diet with specialist dietitian support is the cornerstone of management.',
        lineOfTherapy: 'first-line',
      },
      {
        topic: 'Follow-up',
        text: 'Provide structured follow-up to confirm serological and mucosal response, address nutritional deficiencies and bone health, and investigate non-responsive or refractory disease.',
        lineOfTherapy: 'maintenance',
      },
    ],
    lastVerified: '2026-07-19',
    dataProvenance: 'hand-curated-demo',
  },
];
