import type { Guideline } from '../../src/lib/types';

/**
 * Prior (superseded) editions of guidelines, kept to show how guidance evolved.
 * These are excluded from search; they surface in the condition-page revision
 * timeline and remain individually viewable. Verify against the source.
 */
export const historicalGuidelines: Guideline[] = [
  {
    "id": "acg-ulcerative-colitis-2019",
    "societyId": "acg",
    "conditionIds": [
      "ulcerative-colitis"
    ],
    "title": "ACG Clinical Guideline: Ulcerative Colitis in Adults",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2019,
    "status": "superseded",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2019/03000/acg_clinical_guideline__ulcerative_colitis_in.10.aspx",
    "citation": "Rubin DT, Ananthakrishnan AN, Siegel CA, Sauer BG, Long MD. Am J Gastroenterol. 2019;114(3):384-413.",
    "summary": "First full ACG ulcerative colitis guideline of the biologic era: formalized risk stratification and positioned anti-TNF agents, vedolizumab and tofacitinib. Superseded by the 2025 update, which added anti-IL-23 agents, ozanimod and upadacitinib and refined treat-to-target.",
    "keyRecommendations": [
      {
        "topic": "First-line (mild-to-moderate)",
        "text": "Oral and rectal 5-aminosalicylates to induce and maintain remission.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "mesalamine",
          "sulfasalazine"
        ]
      },
      {
        "topic": "Moderate-to-severe",
        "text": "Anti-TNF agents, vedolizumab and tofacitinib recommended for moderate-to-severe disease.",
        "lineOfTherapy": "escalation",
        "drugs": [
          "infliximab",
          "adalimumab",
          "vedolizumab",
          "tofacitinib"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-ulcerative-colitis-2010",
    "societyId": "acg",
    "conditionIds": [
      "ulcerative-colitis"
    ],
    "title": "Ulcerative Colitis Practice Guidelines in Adults",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2010,
    "status": "superseded",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2010/03000/ulcerative_colitis_practice_guidelines_in_adults.5.aspx",
    "citation": "Kornbluth A, Sachar DB. Am J Gastroenterol. 2010;105(3):501-523.",
    "summary": "Pre-biologic-era practice guideline centred on aminosalicylates, corticosteroids and thiopurines, with infliximab as the principal biologic. Superseded by the 2019 guideline.",
    "keyRecommendations": [
      {
        "topic": "Induction and maintenance",
        "text": "Aminosalicylates first-line; corticosteroids for flares; thiopurines for steroid-sparing maintenance.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "mesalamine",
          "prednisone",
          "azathioprine"
        ]
      },
      {
        "topic": "Refractory disease",
        "text": "Infliximab for refractory or steroid-dependent disease.",
        "lineOfTherapy": "refractory",
        "drugs": [
          "infliximab"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-crohns-disease-2018",
    "societyId": "acg",
    "conditionIds": [
      "crohns-disease"
    ],
    "title": "ACG Clinical Guideline: Management of Crohn's Disease in Adults",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2018,
    "status": "superseded",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2018/04000/acg_clinical_guideline__management_of_crohn_s.10.aspx",
    "citation": "Lichtenstein GR, Loftus EV, Isaacs KL, Regueiro MD, Gerson LB, Sands BE. Am J Gastroenterol. 2018;113(4):481-517.",
    "summary": "Emphasized anti-TNF, anti-integrin and anti-IL-12/23 biologics with earlier use in high-risk disease. Superseded by the 2025 update, which incorporated risankizumab and upadacitinib and refined positioning.",
    "keyRecommendations": [
      {
        "topic": "Biologic therapy",
        "text": "Anti-TNF agents (± immunomodulator), vedolizumab and ustekinumab for moderate-to-severe disease.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "infliximab",
          "adalimumab",
          "vedolizumab",
          "ustekinumab"
        ]
      },
      {
        "topic": "Corticosteroids",
        "text": "Budesonide for mild ileocecal disease; systemic steroids for flares, not maintenance.",
        "lineOfTherapy": "second-line",
        "drugs": [
          "budesonide",
          "prednisone"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-crohns-disease-2009",
    "societyId": "acg",
    "conditionIds": [
      "crohns-disease"
    ],
    "title": "Management of Crohn's Disease in Adults",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2009,
    "status": "superseded",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2009/02000/management_of_crohn_s_disease_in_adults.21.aspx",
    "citation": "Lichtenstein GR, Hanauer SB, Sandborn WJ. Am J Gastroenterol. 2009;104(2):465-483.",
    "summary": "Step-up-era guideline with corticosteroids and immunomodulators, reserving anti-TNF agents (infliximab, adalimumab, certolizumab) for refractory disease. Superseded by the 2018 guideline.",
    "keyRecommendations": [
      {
        "topic": "Step-up therapy",
        "text": "Corticosteroids for flares and thiopurines/methotrexate for maintenance; anti-TNF for refractory disease.",
        "lineOfTherapy": "escalation",
        "drugs": [
          "prednisone",
          "azathioprine",
          "infliximab",
          "adalimumab"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-h-pylori-2017",
    "societyId": "acg",
    "conditionIds": [
      "h-pylori-infection"
    ],
    "title": "ACG Clinical Guideline: Treatment of Helicobacter pylori Infection",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2017,
    "status": "superseded",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2017/02000/acg_clinical_guideline__treatment_of_helicobacter.12.aspx",
    "citation": "Chey WD, Leontiadis GI, Howden CW, Moss SF. Am J Gastroenterol. 2017;112(2):212-239.",
    "summary": "Introduced bismuth quadruple therapy as a preferred option amid rising clarithromycin resistance while still listing clarithromycin triple therapy. Superseded by 2024, which further de-emphasized clarithromycin regimens and added vonoprazan-based therapy.",
    "keyRecommendations": [
      {
        "topic": "First-line",
        "text": "Bismuth quadruple or clarithromycin triple therapy (where resistance is low) for 14 days.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "bismuth",
          "tetracycline",
          "metronidazole",
          "clarithromycin"
        ]
      },
      {
        "topic": "Confirm eradication",
        "text": "Test for eradication after therapy in all treated patients.",
        "lineOfTherapy": "diagnosis"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-h-pylori-2007",
    "societyId": "acg",
    "conditionIds": [
      "h-pylori-infection"
    ],
    "title": "American College of Gastroenterology Guideline on the Management of Helicobacter pylori Infection",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2007,
    "status": "superseded",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2007/08000/american_college_of_gastroenterology_guideline_on.30.aspx",
    "citation": "Chey WD, Wong BCY. Am J Gastroenterol. 2007;102(8):1808-1825.",
    "summary": "Clarithromycin-based triple therapy as standard first-line treatment, with sequential and quadruple regimens as alternatives. Superseded by the 2017 guideline as resistance rose.",
    "keyRecommendations": [
      {
        "topic": "First-line",
        "text": "Clarithromycin triple therapy (PPI + clarithromycin + amoxicillin or metronidazole) for 10-14 days.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "clarithromycin",
          "amoxicillin",
          "metronidazole"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-gerd-2013",
    "societyId": "acg",
    "conditionIds": [
      "gerd"
    ],
    "title": "Guidelines for the Diagnosis and Management of Gastroesophageal Reflux Disease",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2013,
    "status": "superseded",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2013/03000/guidelines_for_the_diagnosis_and_management_of.6.aspx",
    "citation": "Katz PO, Gerson LB, Vela MF. Am J Gastroenterol. 2013;108(3):308-328.",
    "summary": "Established the 8-week PPI trial and PPIs as the most effective medical therapy for GERD. Superseded by the 2022 update, which expanded guidance on PPI safety, refractory GERD testing and newer therapies.",
    "keyRecommendations": [
      {
        "topic": "Empiric therapy",
        "text": "8-week PPI course for classic symptoms; step down to lowest effective dose.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "omeprazole",
          "esomeprazole"
        ]
      },
      {
        "topic": "Testing",
        "text": "Endoscopy and ambulatory pH testing for refractory or atypical presentations.",
        "lineOfTherapy": "diagnosis"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-gerd-2005",
    "societyId": "acg",
    "conditionIds": [
      "gerd"
    ],
    "title": "Updated Guidelines for the Diagnosis and Treatment of Gastroesophageal Reflux Disease",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2005,
    "status": "superseded",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2005/01000/updated_guidelines_for_the_diagnosis_and_treatment.31.aspx",
    "citation": "DeVault KR, Castell DO. Am J Gastroenterol. 2005;100(1):190-200.",
    "summary": "PPI-centered management of GERD before the modern empiric-trial and pH-impedance testing algorithms. Superseded by the 2013 guideline.",
    "keyRecommendations": [
      {
        "topic": "Acid suppression",
        "text": "PPIs are the most effective therapy; lifestyle measures as adjuncts.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "omeprazole"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-barretts-2016",
    "societyId": "acg",
    "conditionIds": [
      "barretts-esophagus",
      "gerd"
    ],
    "title": "ACG Clinical Guideline: Diagnosis and Management of Barrett's Esophagus",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2016,
    "status": "superseded",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2016/01000/acg_clinical_guideline__diagnosis_and_management.17.aspx",
    "citation": "Shaheen NJ, Falk GW, Iyer PG, Gerson LB. Am J Gastroenterol. 2016;111(1):30-50.",
    "summary": "Set screening criteria, surveillance intervals and endoscopic eradication therapy for dysplasia in Barrett's esophagus. Superseded by the 2022 update.",
    "keyRecommendations": [
      {
        "topic": "Surveillance",
        "text": "PPI therapy and endoscopic surveillance for non-dysplastic Barrett's.",
        "lineOfTherapy": "maintenance",
        "drugs": [
          "omeprazole"
        ]
      },
      {
        "topic": "Dysplasia",
        "text": "Endoscopic eradication therapy for confirmed dysplasia.",
        "lineOfTherapy": "escalation"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-barretts-2008",
    "societyId": "acg",
    "conditionIds": [
      "barretts-esophagus"
    ],
    "title": "Updated Guidelines 2008 for the Diagnosis, Surveillance and Therapy of Barrett's Esophagus",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2008,
    "status": "superseded",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2008/03000/updated_guidelines_2008_for_the_diagnosis,.32.aspx",
    "citation": "Wang KK, Sampliner RE. Am J Gastroenterol. 2008;103(3):788-797.",
    "summary": "Earlier surveillance-focused Barrett's guidance before endoscopic eradication became standard for dysplasia. Superseded by the 2016 guideline.",
    "keyRecommendations": [
      {
        "topic": "Surveillance",
        "text": "Periodic endoscopic surveillance stratified by dysplasia grade.",
        "lineOfTherapy": "maintenance"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-celiac-2013",
    "societyId": "acg",
    "conditionIds": [
      "celiac-disease"
    ],
    "title": "ACG Clinical Guidelines: Diagnosis and Management of Celiac Disease",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2013,
    "status": "superseded",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2013/05000/acg_clinical_guidelines__diagnosis_and_management.6.aspx",
    "citation": "Rubio-Tapia A, Hill ID, Kelly CP, Calderwood AH, Murray JA. Am J Gastroenterol. 2013;108(5):656-676.",
    "summary": "Established tissue transglutaminase IgA testing on a gluten-containing diet with duodenal biopsy confirmation, and a lifelong gluten-free diet. Superseded by the 2023 update.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis",
        "text": "tTG-IgA testing on a gluten-containing diet, confirmed by duodenal biopsy.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Treatment",
        "text": "Lifelong strict gluten-free diet with dietitian support.",
        "lineOfTherapy": "first-line"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-acute-pancreatitis-2013",
    "societyId": "acg",
    "conditionIds": [
      "acute-pancreatitis"
    ],
    "title": "American College of Gastroenterology Guideline: Management of Acute Pancreatitis",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2013,
    "status": "superseded",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2013/09000/american_college_of_gastroenterology_guideline_.6.aspx",
    "citation": "Tenner S, Baillie J, DeWitt J, Vege SS. Am J Gastroenterol. 2013;108(9):1400-1415.",
    "summary": "Emphasized early aggressive fluid resuscitation and early enteral feeding. Superseded by the 2024 update, which moderated fluid-resuscitation targets toward goal-directed therapy.",
    "keyRecommendations": [
      {
        "topic": "Fluids",
        "text": "Early aggressive isotonic crystalloid resuscitation in the first 24 hours.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Nutrition",
        "text": "Early enteral feeding as tolerated; enteral preferred over parenteral.",
        "lineOfTherapy": "supportive"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-crc-screening-2009",
    "societyId": "acg",
    "conditionIds": [
      "colorectal-cancer"
    ],
    "title": "American College of Gastroenterology Guidelines for Colorectal Cancer Screening 2009",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2009,
    "status": "superseded",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2009/03000/american_college_of_gastroenterology_guidelines_for.11.aspx",
    "citation": "Rex DK, Johnson DA, Anderson JC, Schoenfeld PS, Burke CA, Inadomi JM. Am J Gastroenterol. 2009;104(3):739-750.",
    "summary": "Recommended colonoscopy every 10 years starting at age 50 as the preferred strategy. Superseded by the 2021 guideline, which lowered the start age to 45.",
    "keyRecommendations": [
      {
        "topic": "When to start",
        "text": "Begin screening average-risk adults at age 50 (age 45 for Black patients).",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Preferred test",
        "text": "Colonoscopy every 10 years as the preferred modality.",
        "lineOfTherapy": "screening"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "aga-ulcerative-colitis-2020",
    "societyId": "aga",
    "conditionIds": [
      "ulcerative-colitis"
    ],
    "title": "AGA Clinical Practice Guidelines on the Management of Moderate to Severe Ulcerative Colitis",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2020,
    "status": "superseded",
    "sourceUrl": "https://www.gastrojournal.org/article/S0016-5085(20)30018-4/fulltext",
    "citation": "Feuerstein JD, Isaacs KL, Schneider Y, et al. Gastroenterology. 2020;158(5):1450-1461.",
    "summary": "First AGA drug-positioning guideline for moderate-to-severe UC, including acute severe UC. Superseded by the 2024 living guideline with newer agents and efficacy-based positioning.",
    "keyRecommendations": [
      {
        "topic": "Advanced therapy",
        "text": "Infliximab, vedolizumab or ustekinumab over no treatment; tofacitinib in appropriate patients.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "infliximab",
          "vedolizumab",
          "ustekinumab",
          "tofacitinib"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "aga-crohns-disease-2021",
    "societyId": "aga",
    "conditionIds": [
      "crohns-disease"
    ],
    "title": "AGA Clinical Practice Guidelines on the Medical Management of Moderate to Severe Luminal and Perianal Fistulizing Crohn's Disease",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2021,
    "status": "superseded",
    "sourceUrl": "https://www.gastrojournal.org/article/S0016-5085(21)00645-4/fulltext",
    "citation": "Feuerstein JD, Ho EY, Shmidt E, et al. Gastroenterology. 2021;160(7):2496-2508.",
    "summary": "AGA drug-management guideline for moderate-to-severe luminal and perianal fistulizing Crohn's disease. Superseded by the 2025 living guideline.",
    "keyRecommendations": [
      {
        "topic": "Early biologics",
        "text": "Early use of anti-TNF, ustekinumab or vedolizumab over step-up in high-risk patients.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "infliximab",
          "adalimumab",
          "ustekinumab",
          "vedolizumab"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-wzjg-2013",
    "societyId": "ptg-e",
    "conditionIds": [
      "ulcerative-colitis"
    ],
    "title": "PTG-E Guidelines on the Management of Ulcerative Colitis (2013)",
    "titleLocal": "Wytyczne postępowania w wrzodziejącym zapaleniu jelita grubego (2013)",
    "language": "pl",
    "specialty": "gastroenterology",
    "year": 2013,
    "status": "superseded",
    "sourceUrl": "https://ptg-e.org.pl/wytyczne/",
    "citation": "Eder P, et al. Przegląd Gastroenterologiczny. 2013. (to verify)",
    "summary": "The 2013 Polish ulcerative colitis recommendations, updated and expanded by the 2023 PTG-E guideline. (edition details to verify against source)",
    "keyRecommendations": [
      {
        "topic": "First-line",
        "text": "Aminosalicylates for mild-to-moderate disease; corticosteroids for flares; thiopurines and anti-TNF for refractory disease.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "mesalazyna",
          "prednizon",
          "infliksymab"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-crohn-2012",
    "societyId": "ptg-e",
    "conditionIds": [
      "crohns-disease"
    ],
    "title": "PTG-E Guidelines on the Management of Crohn's Disease (2012)",
    "titleLocal": "Wytyczne postępowania w chorobie Leśniowskiego-Crohna (2012)",
    "language": "pl",
    "specialty": "gastroenterology",
    "year": 2012,
    "status": "superseded",
    "sourceUrl": "https://ptg-e.org.pl/wytyczne/",
    "citation": "Łodyga M, et al. Przegląd Gastroenterologiczny. 2012. (to verify)",
    "summary": "The 2012 Polish Crohn's disease recommendations, updated by the 2021 PTG-E guideline. (edition details to verify against source)",
    "keyRecommendations": [
      {
        "topic": "Management",
        "text": "Corticosteroids and budesonide for induction; thiopurines and anti-TNF for maintenance in high-risk disease.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "budezonid",
          "azatiopryna",
          "infliksymab"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  }
];
