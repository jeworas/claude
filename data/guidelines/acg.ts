import type { Guideline } from '../../src/lib/types';

/**
 * American College of Gastroenterology (ACG) Clinical Guidelines.
 * Compiled from published ACG guidance; titles/years/links corroborated via web
 * search. Treatment summaries are short original paraphrases for reference only —
 * verify against the source before any clinical use.
 */
export const acgGuidelines: Guideline[] = [
  {
    "id": "acg-ulcerative-colitis-2025",
    "societyId": "acg",
    "conditionIds": [
      "ulcerative-colitis"
    ],
    "title": "ACG Clinical Guideline: Ulcerative Colitis in Adults",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2025,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2025/06000/acg_clinical_guideline_update__ulcerative_colitis.13.aspx",
    "citation": "Rubin DT, Ananthakrishnan AN, Siegel CA, Barnes EL, Long MD. Am J Gastroenterol. 2025;120(6):1187-1224. doi:10.14309/ajg.0000000000003463 (verified via PubMed).",
    "summary": "The 2025 ACG update guides diagnosis, monitoring and treatment of adult ulcerative colitis using a treat-to-target approach aiming for symptomatic and endoscopic remission. Oral and rectal 5-aminosalicylates remain first-line for mild-to-moderate disease, while moderate-to-severe disease is treated with advanced therapies (biologics and small molecules), and the guideline suggests advanced therapy need not wait for failure of conventional therapy. It also addresses acute severe UC and surgical considerations.",
    "keyRecommendations": [
      {
        "topic": "Mild-moderate induction/maintenance",
        "text": "Optimized oral plus rectal mesalamine (5-ASA) is first-line for mild-to-moderate UC; combine routes and adequate dosing before escalating.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line",
        "drugs": [
          "mesalamine",
          "sulfasalazine"
        ]
      },
      {
        "topic": "Proctitis",
        "text": "Rectal mesalamine (suppository for proctitis, enema for left-sided disease) is preferred topical therapy.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "mesalamine suppository",
          "mesalamine enema"
        ]
      },
      {
        "topic": "Moderate-severe disease",
        "text": "Use advanced therapies: anti-TNF (infliximab, adalimumab, golimumab), vedolizumab, ustekinumab, mirikizumab, risankizumab, guselkumab, JAK inhibitors (tofacitinib, upadacitinib) or ozanimod/etrasimod; do not require failure of conventional therapy first.",
        "lineOfTherapy": "escalation",
        "drugs": [
          "infliximab",
          "vedolizumab",
          "ustekinumab",
          "upadacitinib",
          "mirikizumab",
          "ozanimod"
        ]
      },
      {
        "topic": "Acute severe UC",
        "text": "Hospitalize; give IV corticosteroids first-line with VTE prophylaxis; if steroid-refractory by day 3-5, use rescue infliximab or cyclosporine, and involve surgery early.",
        "lineOfTherapy": "refractory",
        "drugs": [
          "methylprednisolone",
          "infliximab",
          "cyclosporine"
        ]
      },
      {
        "topic": "Corticosteroid stewardship",
        "text": "Avoid long-term systemic corticosteroids; use steroid-sparing maintenance and treat to a target of endoscopic healing.",
        "lineOfTherapy": "maintenance"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-crohns-disease-2025",
    "societyId": "acg",
    "conditionIds": [
      "crohns-disease"
    ],
    "title": "ACG Clinical Guideline: Management of Crohn's Disease in Adults",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2025,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2025/06000/acg_clinical_guideline__management_of_crohn_s.14.aspx",
    "citation": "Lichtenstein GR, Loftus EV, Afzali A, et al. Am J Gastroenterol. 2025;120(6):1225-1264. doi:10.14309/ajg.0000000000003465 (verified via PubMed).",
    "summary": "The 2025 ACG Crohn's disease update expands the advanced-therapy armamentarium and endorses early effective therapy with a treat-to-target strategy (clinical plus endoscopic remission). Anti-TNF agents, vedolizumab, ustekinumab, IL-23 inhibitors (risankizumab, guselkumab, mirikizumab) and the JAK inhibitor upadacitinib are options for moderate-to-severe disease. Thiopurines are suggested for maintenance but not induction, and combination anti-TNF plus immunomodulator is favored over monotherapy.",
    "keyRecommendations": [
      {
        "topic": "Moderate-severe induction",
        "text": "Use advanced therapy (anti-TNF, vedolizumab, ustekinumab, risankizumab, guselkumab, mirikizumab, or upadacitinib); the guideline suggests against requiring failure of conventional therapy before advanced therapy.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "infliximab",
          "adalimumab",
          "ustekinumab",
          "risankizumab",
          "upadacitinib"
        ]
      },
      {
        "topic": "Combination therapy",
        "text": "Combining an anti-TNF (infliximab) with an immunomodulator is more effective than either as monotherapy.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "escalation",
        "drugs": [
          "infliximab",
          "azathioprine",
          "methotrexate"
        ]
      },
      {
        "topic": "Immunomodulators",
        "text": "Recommend against azathioprine/6-mercaptopurine for induction of moderate-severe CD, but suggest thiopurines for maintenance after corticosteroid-induced remission.",
        "lineOfTherapy": "maintenance",
        "drugs": [
          "azathioprine",
          "6-mercaptopurine"
        ]
      },
      {
        "topic": "Perianal fistulizing disease",
        "text": "Anti-TNF therapy (infliximab), often with antibiotics, plus surgical drainage/seton for abscess and fistula management.",
        "lineOfTherapy": "escalation",
        "drugs": [
          "infliximab",
          "ciprofloxacin",
          "metronidazole"
        ]
      },
      {
        "topic": "Postoperative prophylaxis",
        "text": "After ileocolic resection, risk-stratify and start prophylaxis (anti-TNF for high risk) with endoscopy at 6-12 months to guide therapy.",
        "lineOfTherapy": "prevention"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-c-difficile-2021",
    "societyId": "acg",
    "conditionIds": [
      "c-difficile-infection"
    ],
    "title": "ACG Clinical Guidelines: Prevention, Diagnosis, and Treatment of Clostridioides difficile Infections",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2021,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2021/06000/acg_clinical_guidelines__prevention,_diagnosis,.12.aspx",
    "citation": "Kelly CR, Fischer M, Allegretti JR, et al. Am J Gastroenterol. 2021;116(6):1124-1147.",
    "summary": "These ACG guidelines cover prevention, diagnosis and treatment of Clostridioides difficile infection (CDI). Oral vancomycin or fidaxomicin are preferred over metronidazole for initial non-severe and severe CDI, fulminant disease needs high-dose vancomycin plus IV metronidazole, and fecal microbiota transplantation is recommended for multiply recurrent CDI.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis",
        "text": "Use a two-step testing algorithm (e.g., GDH plus toxin EIA, or NAAT with toxin) and test only patients with clinically significant diarrhea.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Initial episode",
        "text": "Treat non-severe and severe CDI with oral vancomycin or fidaxomicin; reserve metronidazole for low-risk patients when preferred agents are unavailable.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line",
        "drugs": [
          "vancomycin",
          "fidaxomicin"
        ]
      },
      {
        "topic": "Fulminant CDI",
        "text": "Give high-dose oral/rectal vancomycin plus IV metronidazole and obtain urgent surgical consultation.",
        "lineOfTherapy": "escalation",
        "drugs": [
          "vancomycin",
          "metronidazole"
        ]
      },
      {
        "topic": "First recurrence",
        "text": "Use fidaxomicin or a tapered/pulsed vancomycin regimen; consider bezlotoxumab to reduce recurrence in high-risk patients.",
        "lineOfTherapy": "second-line",
        "drugs": [
          "fidaxomicin",
          "vancomycin",
          "bezlotoxumab"
        ]
      },
      {
        "topic": "Multiply recurrent CDI",
        "text": "Fecal microbiota transplantation is recommended after appropriate antibiotic therapy for patients with two or more recurrences.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "refractory",
        "drugs": [
          "fecal microbiota transplantation"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-h-pylori-2024",
    "societyId": "acg",
    "conditionIds": [
      "h-pylori-infection"
    ],
    "title": "ACG Clinical Guideline: Treatment of Helicobacter pylori Infection",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2024,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2024/09000/acg_clinical_guideline__treatment_of_helicobacter.13.aspx",
    "citation": "Chey WD, Howden CW, Moss SF, Morgan DR, Greer KB, Grover S, Shah SC. Am J Gastroenterol. 2024;119(9):1730-1753. doi:10.14309/ajg.0000000000002968 (verified via PubMed).",
    "summary": "The 2024 ACG guideline overhauls H. pylori treatment, making optimized bismuth quadruple therapy the preferred first-line regimen and advising against empiric clarithromycin- or levofloxacin-based regimens because of rising resistance. Rifabutin triple therapy and vonoprazan-based regimens are alternatives, and every treated patient should have a test of cure.",
    "keyRecommendations": [
      {
        "topic": "First-line therapy",
        "text": "Optimized bismuth quadruple therapy (PPI + bismuth + tetracycline + metronidazole) for 14 days is preferred first-line, especially with prior macrolide exposure or penicillin allergy.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line",
        "drugs": [
          "bismuth",
          "tetracycline",
          "metronidazole",
          "proton pump inhibitor"
        ]
      },
      {
        "topic": "Avoid resistant regimens",
        "text": "Avoid clarithromycin- and levofloxacin-containing regimens unless susceptibility testing confirms sensitivity.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Alternative regimens",
        "text": "Rifabutin triple therapy and vonoprazan-amoxicillin dual (or vonoprazan-based triple) therapy are suggested alternatives.",
        "lineOfTherapy": "second-line",
        "drugs": [
          "rifabutin",
          "vonoprazan",
          "amoxicillin"
        ]
      },
      {
        "topic": "Test of cure",
        "text": "Confirm eradication in all treated patients at least 4 weeks after therapy with urea breath test, fecal antigen test, or biopsy-based testing.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Penicillin allergy",
        "text": "Bismuth quadruple therapy is preferred with reported penicillin allergy; consider formal allergy evaluation to expand options.",
        "lineOfTherapy": "first-line"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-gerd-2022",
    "societyId": "acg",
    "conditionIds": [
      "gerd"
    ],
    "title": "ACG Clinical Guideline for the Diagnosis and Management of Gastroesophageal Reflux Disease",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2022,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2022/01000/acg_clinical_guideline_for_the_diagnosis_and.14.aspx",
    "citation": "Katz PO, Dunbar KB, Schnoll-Sussman FH, Greer KB, Yadlapati R, Spechler SJ. Am J Gastroenterol. 2022;117(1):27-56.",
    "summary": "The 2022 ACG GERD guideline recommends an 8-week empiric once-daily PPI trial for classic symptoms without alarm features, reserving endoscopy and reflux testing for alarm features or PPI non-response. It emphasizes weight loss and lifestyle measures and reserves anti-reflux surgery or endoscopic therapy for selected patients with objectively documented GERD.",
    "keyRecommendations": [
      {
        "topic": "Empiric therapy",
        "text": "For classic heartburn/regurgitation without alarm features, an 8-week trial of once-daily PPI taken 30-60 minutes before a meal is first-line.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line",
        "drugs": [
          "omeprazole",
          "esomeprazole",
          "pantoprazole"
        ]
      },
      {
        "topic": "Alarm features",
        "text": "Perform endoscopy for dysphagia, weight loss, GI bleeding or anemia, and for Barrett's esophagus screening in at-risk patients.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "PPI-refractory symptoms",
        "text": "Optimize PPI timing/dosing; if still refractory, perform ambulatory pH-impedance testing (off or on therapy) and manometry to confirm GERD and exclude other diagnoses.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Lifestyle",
        "text": "Recommend weight loss for overweight/obese patients, avoidance of late-evening meals, and head-of-bed elevation.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Anti-reflux procedures",
        "text": "Anti-reflux surgery or endoscopic therapy is an option for objectively confirmed GERD; it is not recommended for PPI non-responders without documented reflux.",
        "lineOfTherapy": "escalation"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-eoe-2025",
    "societyId": "acg",
    "conditionIds": [
      "eosinophilic-esophagitis"
    ],
    "title": "ACG Clinical Guideline: Diagnosis and Management of Eosinophilic Esophagitis",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2025,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2025/01000/acg_clinical_guideline__diagnosis_and_management.16.aspx",
    "citation": "Dellon ES, et al. Am J Gastroenterol. 2025;120(1):31-59. doi:10.14309/ajg.0000000000003194 (verified via PubMed).",
    "summary": "The updated ACG guideline diagnoses eosinophilic esophagitis by symptoms of esophageal dysfunction plus at least 15 eosinophils/hpf after excluding other causes, no longer requiring a PPI trial to exclude the diagnosis. First-line treatments include PPIs, swallowed topical corticosteroids, dietary elimination, and the biologic dupilumab, with dilation for strictures and maintenance therapy to prevent relapse and fibrostenotic remodeling.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis",
        "text": "Diagnose EoE with symptoms of esophageal dysfunction and >=15 eos/hpf on biopsy after evaluating for non-EoE causes; a PPI trial is a treatment, not a diagnostic exclusion.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Pharmacologic first-line",
        "text": "Recommend swallowed topical corticosteroids (budesonide, fluticasone) and suggest PPIs for treatment of EoE.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "budesonide",
          "fluticasone",
          "proton pump inhibitor"
        ]
      },
      {
        "topic": "Biologic therapy",
        "text": "Dupilumab is recommended for EoE, particularly in patients refractory to or intolerant of other therapies.",
        "lineOfTherapy": "escalation",
        "drugs": [
          "dupilumab"
        ]
      },
      {
        "topic": "Dietary therapy",
        "text": "Empiric food elimination diets are an effective non-pharmacologic option.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Dilation and monitoring",
        "text": "Perform esophageal dilation for strictures/fibrostenosis and assess response with symptom, endoscopic (EREFS), and histologic outcomes; continue maintenance therapy.",
        "lineOfTherapy": "maintenance"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-celiac-2023",
    "societyId": "acg",
    "conditionIds": [
      "celiac-disease"
    ],
    "title": "American College of Gastroenterology Guidelines Update: Diagnosis and Management of Celiac Disease",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2023,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2023/01000/american_college_of_gastroenterology_guidelines.17.aspx",
    "citation": "Rubio-Tapia A, Hill ID, Semrad C, Kelly CP, Lebwohl B. Am J Gastroenterol. 2023;118(1):59-76. doi:10.14309/ajg.0000000000002111 (verified via PubMed).",
    "summary": "The 2023 ACG update recommends tissue transglutaminase IgA (with total IgA) as first-line serology while on a gluten-containing diet, with confirmatory duodenal biopsy in adults. A biopsy-free diagnosis may be considered in children with very high tTG-IgA plus positive endomysial antibody. Lifelong strict gluten-free diet is the treatment, with mucosal healing as the therapeutic goal.",
    "keyRecommendations": [
      {
        "topic": "Serologic testing",
        "text": "Use tTG-IgA with total IgA as the preferred initial test for celiac disease in patients on a gluten-containing diet.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Confirmatory biopsy",
        "text": "In adults, confirm diagnosis with EGD and multiple duodenal biopsies (including duodenal bulb).",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Pediatric no-biopsy pathway",
        "text": "In children, high tTG-IgA (>10x ULN) with a positive endomysial antibody on a second sample can support diagnosis without biopsy.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Treatment",
        "text": "Lifelong strict gluten-free diet with dietitian support is the cornerstone of therapy.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Monitoring",
        "text": "Aim for mucosal healing; monitor adherence and symptoms, screen for nutritional deficiencies and bone health, and consider follow-up biopsy in adults.",
        "lineOfTherapy": "maintenance"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-acute-pancreatitis-2024",
    "societyId": "acg",
    "conditionIds": [
      "acute-pancreatitis"
    ],
    "title": "American College of Gastroenterology Guidelines: Management of Acute Pancreatitis",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2024,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2024/03000/american_college_of_gastroenterology_guidelines_.10.aspx",
    "citation": "Tenner S, Vege SS, Sheth SG, Sauer B, Yang A, Conwell DL, Yadlapati RH, Gardner TB. Am J Gastroenterol. 2024;119(3):419-437. doi:10.14309/ajg.0000000000002645 (verified via PubMed).",
    "summary": "The 2024 ACG acute pancreatitis guideline emphasizes moderately aggressive fluid resuscitation with lactated Ringer's, early oral or enteral feeding, and antibiotic stewardship. ERCP is reserved for biliary pancreatitis with cholangitis or persistent obstruction, same-admission cholecystectomy is advised for mild biliary disease, and infected necrosis is managed with a delayed, minimally invasive step-up approach.",
    "keyRecommendations": [
      {
        "topic": "Fluid resuscitation",
        "text": "Provide moderately (goal-directed) aggressive fluid resuscitation using lactated Ringer's solution rather than normal saline.",
        "lineOfTherapy": "supportive",
        "drugs": [
          "lactated Ringer's"
        ]
      },
      {
        "topic": "Nutrition",
        "text": "Begin early oral low-fat solid feeding in mild acute pancreatitis; use enteral nutrition over parenteral in severe disease.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Biliary pancreatitis and ERCP",
        "text": "Perform urgent ERCP only for concurrent cholangitis or persistent biliary obstruction, and perform same-admission cholecystectomy for mild biliary pancreatitis.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Post-ERCP prophylaxis",
        "text": "Give rectal indomethacin to high-risk patients to prevent post-ERCP pancreatitis.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "prevention",
        "drugs": [
          "indomethacin"
        ]
      },
      {
        "topic": "Necrosis management",
        "text": "Avoid prophylactic antibiotics for sterile necrosis; treat infected necrosis with a delayed, minimally invasive step-up (drainage then necrosectomy).",
        "lineOfTherapy": "escalation"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-ibs-2021",
    "societyId": "acg",
    "conditionIds": [
      "irritable-bowel-syndrome"
    ],
    "title": "ACG Clinical Guideline: Management of Irritable Bowel Syndrome",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2021,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2021/01000/acg_clinical_guideline__management_of_irritable.11.aspx",
    "citation": "Lacy BE, Pimentel M, Brenner DM, Chey WD, Keefer LA, Long MD, Moshiree B. Am J Gastroenterol. 2021;116(1):17-44.",
    "summary": "The first ACG IBS guideline endorses a positive symptom-based (Rome IV) diagnosis with limited testing, checking celiac serology in IBS-D and fecal calprotectin to exclude IBD. Management is subtype-directed: a low-FODMAP diet trial and gut-directed psychotherapy for global symptoms, secretagogues for IBS-C, and rifaximin or eluxadoline for IBS-D.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis",
        "text": "Make a positive diagnosis using Rome IV criteria rather than a diagnosis of exclusion; check celiac serology in IBS-D and use fecal calprotectin/CRP to exclude IBD.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Diet",
        "text": "A limited trial of a low-FODMAP diet and soluble fiber can improve global IBS symptoms.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "IBS-C pharmacotherapy",
        "text": "Use secretagogues and prokinetics (linaclotide, plecanatide, tenapanor, lubiprostone) for constipation-predominant IBS.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "linaclotide",
          "plecanatide",
          "tenapanor",
          "lubiprostone"
        ]
      },
      {
        "topic": "IBS-D pharmacotherapy",
        "text": "Use rifaximin, and eluxadoline or alosetron, for diarrhea-predominant IBS.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "rifaximin",
          "eluxadoline",
          "alosetron"
        ]
      },
      {
        "topic": "Neuromodulation/behavioral",
        "text": "Tricyclic antidepressants and gut-directed psychotherapy (CBT, gut-directed hypnotherapy) improve global symptoms.",
        "lineOfTherapy": "second-line",
        "drugs": [
          "amitriptyline",
          "nortriptyline"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-crc-screening-2021",
    "societyId": "acg",
    "conditionIds": [
      "colorectal-cancer"
    ],
    "title": "ACG Clinical Guidelines: Colorectal Cancer Screening 2021",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2021,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2021/03000/acg_clinical_guidelines__colorectal_cancer.14.aspx",
    "citation": "Shaukat A, Kahi CJ, Burke CA, Rabeneck L, Sauer BG, Rex DK. Am J Gastroenterol. 2021;116(3):458-479.",
    "summary": "The 2021 ACG colorectal cancer screening guideline strongly recommends screening average-risk adults aged 50-75 and suggests beginning at 45. Colonoscopy every 10 years and annual FIT are the preferred (tier 1) modalities, with several alternatives available, and screening decisions after 75 should be individualized.",
    "keyRecommendations": [
      {
        "topic": "Start age",
        "text": "Screen average-risk adults 50-75 (strong) and begin screening at age 45 (conditional).",
        "evidenceGrade": "strong",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Preferred modalities",
        "text": "Colonoscopy every 10 years or annual fecal immunochemical test (FIT) are the preferred screening tests.",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Alternative modalities",
        "text": "FIT-fecal DNA, CT colonography, flexible sigmoidoscopy and colon capsule are acceptable alternatives when preferred tests are declined.",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Older adults",
        "text": "Individualize screening decisions for ages 76-85 based on health, prior screening, and preferences.",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Quality",
        "text": "A positive non-colonoscopy test must be followed by colonoscopy; ensure high-quality colonoscopy (adequate ADR, cecal intubation, bowel prep).",
        "lineOfTherapy": "screening"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-dyspepsia-2017",
    "societyId": "acg",
    "conditionIds": [
      "dyspepsia",
      "h-pylori-infection"
    ],
    "title": "ACG and CAG Clinical Guideline: Management of Dyspepsia",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2017,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2017/07000/acg_and_cag_clinical_guideline__management_of.18.aspx",
    "citation": "Moayyedi P, Lacy BE, Andrews CN, Enns RA, Howden CW, Vakil N. Am J Gastroenterol. 2017;112(7):988-1013.",
    "summary": "This joint ACG/CAG guideline recommends a test-and-treat approach for H. pylori in dyspeptic patients under 60 without alarm features, with empiric PPI therapy if symptoms persist. Patients 60 and older should undergo endoscopy to exclude malignancy, and functional dyspepsia is treated with PPIs, tricyclic antidepressants, and prokinetics.",
    "keyRecommendations": [
      {
        "topic": "Younger patients",
        "text": "In patients <60 without alarm features, test for H. pylori and treat if positive; use empiric PPI therapy if symptoms persist.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line",
        "drugs": [
          "proton pump inhibitor"
        ]
      },
      {
        "topic": "Older patients",
        "text": "Patients >=60 with dyspepsia should undergo upper endoscopy to exclude organic pathology including malignancy.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Functional dyspepsia first-line",
        "text": "Treat functional dyspepsia with a PPI first-line.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "proton pump inhibitor"
        ]
      },
      {
        "topic": "Refractory functional dyspepsia",
        "text": "Add a tricyclic antidepressant if PPI and H. pylori therapy fail; prokinetics are an option.",
        "lineOfTherapy": "second-line",
        "drugs": [
          "amitriptyline"
        ]
      },
      {
        "topic": "Eradication and confirmation",
        "text": "Confirm H. pylori eradication with test of cure in dyspeptic patients treated for infection.",
        "lineOfTherapy": "diagnosis"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-barretts-2022",
    "societyId": "acg",
    "conditionIds": [
      "barretts-esophagus",
      "gerd"
    ],
    "title": "Diagnosis and Management of Barrett's Esophagus: An Updated ACG Guideline",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2022,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2022/04000/diagnosis_and_management_of_barrett_s_esophagus_.17.aspx",
    "citation": "Shaheen NJ, Falk GW, Iyer PG, Souza RF, Yadlapati RH, Sauer BG, Wani S. Am J Gastroenterol. 2022;117(4):559-587.",
    "summary": "The updated ACG Barrett's guideline recommends one-time screening (including nonendoscopic capsule-sponge methods) for patients with chronic GERD plus additional risk factors. Surveillance intervals depend on dysplasia grade and segment length, dysplasia should be confirmed by an expert GI pathologist, and endoscopic eradication therapy is recommended for dysplasia and intramucosal cancer.",
    "keyRecommendations": [
      {
        "topic": "Screening",
        "text": "Offer one-time Barrett's screening to patients with chronic GERD and >=3 additional risk factors (male sex, age >50, white race, smoking, obesity, family history); nonendoscopic swallowable devices are acceptable.",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Diagnosis",
        "text": "Diagnose Barrett's with >=1 cm of salmon-colored columnar mucosa plus intestinal metaplasia on biopsy using the Seattle protocol.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Nondysplastic surveillance",
        "text": "For nondysplastic Barrett's, perform surveillance endoscopy every 3-5 years and treat with once-daily PPI.",
        "lineOfTherapy": "maintenance",
        "drugs": [
          "proton pump inhibitor"
        ]
      },
      {
        "topic": "Dysplasia confirmation",
        "text": "Confirm any grade of dysplasia with a second expert gastrointestinal pathologist.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Endoscopic eradication",
        "text": "Treat low- and high-grade dysplasia and intramucosal adenocarcinoma with endoscopic eradication therapy (EMR of visible lesions plus radiofrequency ablation).",
        "evidenceGrade": "strong",
        "lineOfTherapy": "escalation"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-chronic-pancreatitis-2020",
    "societyId": "acg",
    "conditionIds": [
      "chronic-pancreatitis"
    ],
    "title": "ACG Clinical Guideline: Chronic Pancreatitis",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2020,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2020/03000/acg_clinical_guideline__chronic_pancreatitis.9.aspx",
    "citation": "Gardner TB, Adler DG, Forsmark CE, Sauer BG, Taylor JR, Whitcomb DC. Am J Gastroenterol. 2020;115(3):322-339.",
    "summary": "The first ACG chronic pancreatitis guideline recommends CT or MRI/MRCP as first-line diagnostic imaging, with EUS or secretin-MRCP when inconclusive. Management focuses on pancreatic enzyme replacement for exocrine insufficiency, multimodal pain control with cessation of alcohol and tobacco, and screening for pancreatogenic (type 3c) diabetes and nutritional deficiencies.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis",
        "text": "Use CT or MRI/MRCP as first-line imaging; reserve EUS or secretin-enhanced MRCP for indeterminate cases.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Exocrine insufficiency",
        "text": "Prescribe pancreatic enzyme replacement therapy (PERT) for exocrine pancreatic insufficiency and steatorrhea to prevent malnutrition.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line",
        "drugs": [
          "pancrelipase"
        ]
      },
      {
        "topic": "Pain management",
        "text": "Advise alcohol and tobacco cessation; use non-opioid analgesics first, with endoscopic therapy or celiac plexus block for selected patients.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Diabetes and nutrition",
        "text": "Screen for and manage type 3c diabetes, and monitor fat-soluble vitamins and bone density.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Endoscopic/surgical therapy",
        "text": "Consider endoscopic or surgical decompression for obstructive pain and duct stones; total pancreatectomy with islet autotransplantation for selected refractory patients.",
        "lineOfTherapy": "refractory"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-gastroparesis-2022",
    "societyId": "acg",
    "conditionIds": [
      "gastroparesis",
      "diabetes-mellitus"
    ],
    "title": "ACG Clinical Guideline: Gastroparesis",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2022,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2022/08000/acg_clinical_guideline__gastroparesis.15.aspx",
    "citation": "Camilleri M, Kuo B, Nguyen L, et al. Am J Gastroenterol. 2022;117(8):1197-1220.",
    "summary": "The ACG gastroparesis guideline requires a 4-hour scintigraphic gastric emptying study (off medications that slow emptying) after excluding obstruction. Management combines dietary modification and glycemic control with prokinetics such as metoclopramide, antiemetics for symptom relief, and pyloric-directed or device therapies for refractory disease while avoiding opioids.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis",
        "text": "Confirm gastroparesis with a 4-hour solid-phase gastric emptying scintigraphy after stopping opioids, GLP-1 agonists and anticholinergics, and after excluding mechanical obstruction.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Diet and glycemia",
        "text": "Recommend small, frequent low-fat/low-insoluble-fiber meals, hydration, and optimized glycemic control in diabetic gastroparesis.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Prokinetics",
        "text": "Use metoclopramide at the lowest effective dose for the shortest duration; domperidone or prucalopride are alternatives.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "metoclopramide",
          "domperidone",
          "prucalopride"
        ]
      },
      {
        "topic": "Symptom control",
        "text": "Use antiemetics for nausea and vomiting and avoid opioids, which worsen gastric emptying.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Refractory disease",
        "text": "Consider pyloric therapies (gastric per-oral endoscopic myotomy/pyloromyotomy), gastric electrical stimulation, or enteral feeding for refractory, malnourished patients.",
        "lineOfTherapy": "refractory"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-upper-gi-bleeding-2021",
    "societyId": "acg",
    "conditionIds": [
      "upper-gi-bleeding"
    ],
    "title": "ACG Clinical Guideline: Upper Gastrointestinal and Ulcer Bleeding",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2021,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2021/05000/acg_clinical_guideline__upper_gastrointestinal_and.14.aspx",
    "citation": "Laine L, Barkun AN, Saltzman JR, Martel M, Leontiadis GI. Am J Gastroenterol. 2021;116(5):899-917.",
    "summary": "This ACG guideline recommends a restrictive red-cell transfusion threshold of 7 g/dL, emergency-department risk stratification to identify very-low-risk patients for outpatient management, and endoscopy within 24 hours. Endoscopic hemostasis is applied to high-risk stigmata, followed by high-dose PPI therapy, with repeat endoscopy, embolization, or surgery for rebleeding.",
    "keyRecommendations": [
      {
        "topic": "Transfusion",
        "text": "Use a restrictive red-cell transfusion threshold of hemoglobin 7 g/dL in hemodynamically stable patients.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Risk stratification",
        "text": "Risk-stratify in the emergency department; patients with a Glasgow-Blatchford score of 0-1 may be managed as outpatients.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Pre-endoscopy",
        "text": "Give an erythromycin infusion before endoscopy to improve visualization; timing of endoscopy within 24 hours of presentation.",
        "lineOfTherapy": "supportive",
        "drugs": [
          "erythromycin"
        ]
      },
      {
        "topic": "Endoscopic hemostasis",
        "text": "Treat high-risk stigmata (active bleeding, non-bleeding visible vessel) with thermal therapy, clips or injection; hemostatic powder/over-the-scope clips are adjuncts.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Acid suppression and rebleeding",
        "text": "Give high-dose PPI after endoscopic hemostasis; manage rebleeding with repeat endoscopy, then transcatheter embolization or surgery.",
        "lineOfTherapy": "maintenance",
        "drugs": [
          "proton pump inhibitor"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-lower-gi-bleeding-2016",
    "societyId": "acg",
    "conditionIds": [
      "lower-gi-bleeding"
    ],
    "title": "ACG Clinical Guideline: Management of Patients With Acute Lower Gastrointestinal Bleeding",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2016,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2016/04000/acg_clinical_guideline__management_of_patients.14.aspx",
    "citation": "Strate LL, Gralnek IM. Am J Gastroenterol. 2016;111(4):459-474.",
    "summary": "The ACG acute lower GI bleeding guideline stresses hemodynamic resuscitation and risk stratification, with colonoscopy after rapid bowel preparation as the first-line diagnostic and therapeutic test. Endoscopic hemostasis is used for high-risk stigmata, CT angiography and embolization for ongoing bleeding, and surgery is a last resort.",
    "keyRecommendations": [
      {
        "topic": "Resuscitation and risk",
        "text": "Assess hemodynamic status, resuscitate as needed, and risk-stratify to distinguish high- from low-risk patients.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Colonoscopy",
        "text": "Colonoscopy is the initial diagnostic and therapeutic procedure; perform within 24 hours in high-risk patients after adequate colon preparation.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Endoscopic hemostasis",
        "text": "Provide endoscopic hemostasis (clips, thermal contact, or banding) for high-risk stigmata such as active diverticular bleeding or angioectasia.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Persistent/severe bleeding",
        "text": "For ongoing bleeding not controlled endoscopically, use CT angiography followed by transcatheter embolization; reserve surgery for refractory cases.",
        "lineOfTherapy": "escalation"
      },
      {
        "topic": "Secondary prevention",
        "text": "Avoid non-aspirin NSAIDs after lower GI bleeding, particularly from diverticulosis or angioectasia.",
        "lineOfTherapy": "prevention"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-small-bowel-bleeding-2015",
    "societyId": "acg",
    "conditionIds": [
      "small-bowel-bleeding"
    ],
    "title": "ACG Clinical Guideline: Diagnosis and Management of Small Bowel Bleeding",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2015,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2015/09000/acg_clinical_guideline__diagnosis_and_management.10.aspx",
    "citation": "Gerson LB, Fidler JL, Cave DR, Leighton JA. Am J Gastroenterol. 2015;110(9):1265-1287.",
    "summary": "This ACG guideline reframes obscure GI bleeding as small bowel bleeding and recommends video capsule endoscopy as the first test after negative upper and lower endoscopy. Device-assisted deep enteroscopy provides targeted therapy, cross-sectional imaging or angiography helps in capsule-negative or brisk bleeding, and angioectasias are treated endoscopically with medical options for refractory cases.",
    "keyRecommendations": [
      {
        "topic": "Terminology",
        "text": "Use 'small bowel bleeding' for mid-GI sources; reserve 'obscure GI bleeding' for cases with no source found anywhere in the GI tract.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "First-line testing",
        "text": "After negative EGD and colonoscopy, perform video capsule endoscopy as the initial small bowel study.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Deep enteroscopy",
        "text": "Use device-assisted (balloon or spiral) deep enteroscopy to treat lesions identified on capsule or imaging.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Imaging",
        "text": "Use CT or MR enterography, or angiography, in capsule-negative patients or with brisk/active bleeding.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Angioectasia therapy",
        "text": "Treat angioectasias endoscopically; consider somatostatin analogs or hormonal therapy for refractory recurrent bleeding.",
        "lineOfTherapy": "refractory",
        "drugs": [
          "octreotide"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-abnormal-liver-chemistries-2017",
    "societyId": "acg",
    "conditionIds": [
      "abnormal-liver-chemistries"
    ],
    "title": "ACG Clinical Guideline: Evaluation of Abnormal Liver Chemistries",
    "language": "en",
    "specialty": "hepatology",
    "year": 2017,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2017/01000/acg_clinical_guideline__evaluation_of_abnormal.13.aspx",
    "citation": "Kwo PY, Cohen SM, Lim JK. Am J Gastroenterol. 2017;112(1):18-35.",
    "summary": "This ACG guideline provides a framework for evaluating abnormal liver chemistries, defining a true normal ALT range and classifying injury as hepatocellular, cholestatic, or mixed by the R-ratio. It directs a stepwise workup for common causes (viral hepatitis, NAFLD, alcohol, hemochromatosis, autoimmune and metabolic diseases) and guides when to image, refer, or biopsy.",
    "keyRecommendations": [
      {
        "topic": "Normal ALT range",
        "text": "Use a true upper limit of normal for ALT of about 29-33 U/L for males and 19-25 U/L for females.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Pattern classification",
        "text": "Classify the abnormality as hepatocellular, cholestatic, or mixed using the R-ratio to guide the differential.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Etiologic workup",
        "text": "For persistent elevations, evaluate for viral hepatitis, NAFLD, alcohol, hemochromatosis, autoimmune hepatitis, Wilson disease, alpha-1-antitrypsin deficiency, and celiac disease.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Cholestatic evaluation",
        "text": "For a cholestatic pattern, obtain right upper quadrant ultrasound and antimitochondrial antibody testing.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Referral/biopsy",
        "text": "Refer or consider liver biopsy when the workup is unrevealing or there is evidence of hepatic synthetic dysfunction.",
        "lineOfTherapy": "escalation"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-dili-2021",
    "societyId": "acg",
    "conditionIds": [
      "drug-induced-liver-injury"
    ],
    "title": "ACG Clinical Guideline: Diagnosis and Management of Idiosyncratic Drug-Induced Liver Injury",
    "language": "en",
    "specialty": "hepatology",
    "year": 2021,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2021/05000/acg_clinical_guideline__diagnosis_and_management.13.aspx",
    "citation": "Chalasani NP, Maddur H, Russo MW, Wong RJ, Reddy KR. Am J Gastroenterol. 2021;116(5):878-898.",
    "summary": "This ACG guideline frames idiosyncratic drug-induced liver injury as a diagnosis of exclusion requiring a careful history of drugs, herbal and dietary supplements. Prompt discontinuation of the offending agent is central, corticosteroids are used for immune-mediated forms including checkpoint-inhibitor hepatitis, and patients with jaundice plus coagulopathy should be referred for transplant evaluation.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis",
        "text": "Diagnose DILI by exclusion of other liver diseases with a thorough history of medications, herbal and dietary supplements; causality tools such as RUCAM may help.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Withdraw agent",
        "text": "Promptly discontinue the suspected causative agent.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Common causes",
        "text": "Consider antimicrobials, herbal/dietary supplements, and anticancer agents (immune checkpoint inhibitors, tyrosine kinase inhibitors) as frequent causes.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Immunosuppression",
        "text": "Use corticosteroids for immune-mediated DILI, including immune checkpoint inhibitor hepatitis and autoimmune-like injury.",
        "lineOfTherapy": "second-line",
        "drugs": [
          "prednisone",
          "corticosteroids"
        ]
      },
      {
        "topic": "Acetaminophen and referral",
        "text": "Give N-acetylcysteine for acetaminophen toxicity/early acute liver failure and refer patients with jaundice plus coagulopathy (Hy's law) for transplant evaluation.",
        "lineOfTherapy": "escalation",
        "drugs": [
          "N-acetylcysteine"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-alcohol-associated-liver-disease-2024",
    "societyId": "acg",
    "conditionIds": [
      "alcohol-associated-liver-disease"
    ],
    "title": "ACG Clinical Guideline: Alcohol-Associated Liver Disease",
    "language": "en",
    "specialty": "hepatology",
    "year": 2024,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2024/01000/acg_clinical_guideline__alcohol_associated_liver.13.aspx",
    "citation": "Jophlin LL, Singal AK, Bataller R, Wong RJ, Sauer BG, Terrault NA, Shah VH. Am J Gastroenterol. 2024;119(1):30-54. doi:10.14309/ajg.0000000000002572 (verified via PubMed).",
    "summary": "The 2024 ACG guideline addresses the full spectrum of alcohol-associated liver disease, stressing screening for alcohol use disorder at every encounter and abstinence as the most effective treatment. Severe alcohol-associated hepatitis is treated with corticosteroids guided by the Lille response, alongside aggressive nutrition, and early liver transplantation is an option for selected non-responders.",
    "keyRecommendations": [
      {
        "topic": "Screening and abstinence",
        "text": "Screen for alcohol use disorder at every medical encounter; abstinence combined with behavioral and pharmacologic AUD treatment is the cornerstone of management.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line",
        "drugs": [
          "baclofen",
          "acamprosate",
          "naltrexone"
        ]
      },
      {
        "topic": "Fibrosis assessment",
        "text": "Use noninvasive tests to stage fibrosis and identify advanced disease across the ALD spectrum.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Severe alcohol-associated hepatitis",
        "text": "For severe disease (Maddrey discriminant function >=32 or high MELD), give corticosteroids (prednisolone) and assess response with the Lille score at day 7.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "prednisolone"
        ]
      },
      {
        "topic": "Nutrition",
        "text": "Provide adequate protein and calories and correct micronutrient deficiencies (including thiamine) in patients with alcohol-associated hepatitis.",
        "lineOfTherapy": "supportive",
        "drugs": [
          "thiamine"
        ]
      },
      {
        "topic": "Transplantation",
        "text": "Consider early liver transplantation in carefully selected patients with severe alcohol-associated hepatitis not responding to medical therapy.",
        "lineOfTherapy": "escalation"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-primary-sclerosing-cholangitis-2015",
    "societyId": "acg",
    "conditionIds": [
      "primary-sclerosing-cholangitis"
    ],
    "title": "ACG Clinical Guideline: Primary Sclerosing Cholangitis",
    "language": "en",
    "specialty": "hepatology",
    "year": 2015,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2015/05000/acg_clinical_guideline__primary_sclerosing.10.aspx",
    "citation": "Lindor KD, Kowdley KV, Harrison ME. Am J Gastroenterol. 2015;110(5):646-659.",
    "summary": "This ACG guideline diagnoses primary sclerosing cholangitis by cholangiography (MRCP preferred), reserving liver biopsy for suspected small-duct disease or autoimmune overlap. No medical therapy alters disease progression (high-dose ursodeoxycholic acid is harmful), dominant strictures are managed endoscopically with malignancy surveillance, and colon and hepatobiliary cancer surveillance is emphasized.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis",
        "text": "Diagnose PSC by characteristic cholangiographic findings (MRCP preferred); reserve liver biopsy for suspected small-duct PSC or overlap with autoimmune hepatitis.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "IgG4 testing",
        "text": "Measure serum IgG4 at least once to identify IgG4-related disease, which may respond to corticosteroids.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Medical therapy",
        "text": "Do not use high-dose ursodeoxycholic acid (>=28 mg/kg/day) because of harm; no medical therapy is proven to alter progression.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Dominant strictures",
        "text": "Manage symptomatic dominant strictures with ERCP and dilation (with or without short-term stenting) and obtain brush cytology/FISH to exclude cholangiocarcinoma.",
        "lineOfTherapy": "escalation"
      },
      {
        "topic": "Cancer surveillance",
        "text": "Perform colonoscopic surveillance for colitis-associated neoplasia and periodic imaging with CA 19-9 for hepatobiliary cancer.",
        "lineOfTherapy": "screening"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-focal-liver-lesions-2024",
    "societyId": "acg",
    "conditionIds": [
      "focal-liver-lesions"
    ],
    "title": "ACG Clinical Guideline: Focal Liver Lesions",
    "language": "en",
    "specialty": "hepatology",
    "year": 2024,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2024/07000/acg_clinical_guideline__focal_liver_lesions.13.aspx",
    "citation": "Frenette C, Mendiratta-Lala M, Salgia R, Wong RJ, Sauer BG, Pillai A. Am J Gastroenterol. 2024;119(7):1235-1271. doi:10.14309/ajg.0000000000002857 (verified via PubMed).",
    "summary": "The 2024 ACG focal liver lesions guideline recommends multiphasic contrast-enhanced MRI (or CT) to characterize incidental liver lesions. Hemangioma and focal nodular hyperplasia generally need no treatment, hepatocellular adenomas are risk-stratified for resection, and at-risk patients should undergo HCC surveillance with LI-RADS characterization and multidisciplinary evaluation of indeterminate lesions.",
    "keyRecommendations": [
      {
        "topic": "Characterization imaging",
        "text": "Characterize indeterminate focal liver lesions with multiphasic contrast-enhanced MRI (preferred) or CT with late arterial, portal venous, and delayed phases.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Hemangioma and FNH",
        "text": "Hemangioma and focal nodular hyperplasia are benign, have no malignant potential, and generally require no treatment or surveillance.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Hepatocellular adenoma",
        "text": "Risk-stratify hepatocellular adenoma by size, subtype and sex; stop estrogens and resect lesions >5 cm, in men, or beta-catenin-activated subtype.",
        "lineOfTherapy": "escalation"
      },
      {
        "topic": "HCC surveillance",
        "text": "Screen at-risk patients (cirrhosis) with ultrasound with or without AFP, and characterize lesions using LI-RADS.",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Multidisciplinary review",
        "text": "Evaluate indeterminate or suspicious lesions with a multidisciplinary team before biopsy or resection.",
        "lineOfTherapy": "diagnosis"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-acute-liver-failure-2023",
    "societyId": "acg",
    "conditionIds": [
      "acute-liver-failure"
    ],
    "title": "Acute Liver Failure Guidelines",
    "language": "en",
    "specialty": "hepatology",
    "year": 2023,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2023/07000/acute_liver_failure_guidelines.14.aspx",
    "citation": "Shingina A, Mukhtar N, Wakim-Fleming J, Alqahtani S, Wong RJ, Limketkai BN, Larson AM, Grant L. Am J Gastroenterol. 2023;118(7):1128-1153.",
    "summary": "This ACG guideline defines acute liver failure as coagulopathy and encephalopathy without preexisting cirrhosis and directs urgent, etiology-specific care. N-acetylcysteine is used for acetaminophen toxicity and early non-acetaminophen ALF, intensive-care management targets cerebral edema and other complications, and patients should be transferred early to a transplant center using King's College criteria.",
    "keyRecommendations": [
      {
        "topic": "Definition and workup",
        "text": "Diagnose ALF with INR >=1.5 and any encephalopathy in a patient without cirrhosis and illness <26 weeks; rapidly determine etiology.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "N-acetylcysteine",
        "text": "Give N-acetylcysteine for acetaminophen-induced ALF and consider it early in non-acetaminophen ALF.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "N-acetylcysteine"
        ]
      },
      {
        "topic": "Neurologic and ICU care",
        "text": "Manage in the ICU with monitoring for cerebral edema/intracranial hypertension (grade III-IV encephalopathy), infection, and renal failure.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Etiology-specific therapy",
        "text": "Use etiology-directed treatment: antivirals for HBV, penicillin G for Amanita, and delivery for pregnancy-related ALF.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Transplant referral",
        "text": "Transfer to a transplant center early and apply King's College criteria to guide listing for liver transplantation.",
        "lineOfTherapy": "escalation"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-preventive-care-ibd-2025",
    "societyId": "acg",
    "conditionIds": [
      "inflammatory-bowel-disease",
      "ulcerative-colitis",
      "crohns-disease"
    ],
    "title": "ACG Clinical Guideline: Preventive Care in Inflammatory Bowel Disease",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2025,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2025/07000/acg_clinical_guideline_update__preventive_care_in.15.aspx",
    "citation": "Farraye FA, Melmed GY, Lichtenstein GR, Barnes EL, Limketkai BN, Caldera F, Kane S. Am J Gastroenterol. 2025;120(7):1435-1461 (pages approximate; verify against source). doi:10.14309/ajg.0000000000003541 (verified via PubMed).",
    "summary": "The 2025 ACG update on preventive care in IBD emphasizes vaccinating patients (ideally before starting immunosuppression), screening for skin and cervical cancer, and monitoring bone health and mental health. Inactivated vaccines including recombinant zoster vaccine are encouraged, live vaccines are avoided during significant immunosuppression, and health maintenance is coordinated across gastroenterology and primary care.",
    "keyRecommendations": [
      {
        "topic": "Inactivated vaccines",
        "text": "Administer recommended inactivated vaccines (annual influenza, pneumococcal, hepatitis B, HPV, Tdap, COVID-19) ideally before starting immunosuppressive therapy.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "prevention"
      },
      {
        "topic": "Herpes zoster",
        "text": "Give recombinant zoster vaccine (RZV) to adults on or starting immunosuppression, including those under age 50.",
        "lineOfTherapy": "prevention"
      },
      {
        "topic": "Live vaccines",
        "text": "Avoid live vaccines in patients on significant immunosuppression.",
        "lineOfTherapy": "prevention"
      },
      {
        "topic": "Cancer screening",
        "text": "Perform annual skin cancer surveillance (thiopurine and anti-TNF-associated risk) and routine cervical cancer screening.",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Bone and mental health",
        "text": "Screen for osteoporosis in corticosteroid users, and screen for depression, anxiety, and smoking with cessation counseling (especially in Crohn's disease).",
        "lineOfTherapy": "screening"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-hereditary-gi-cancer-2015",
    "societyId": "acg",
    "conditionIds": [
      "hereditary-gi-cancer-syndromes",
      "colorectal-cancer"
    ],
    "title": "ACG Clinical Guideline: Genetic Testing and Management of Hereditary Gastrointestinal Cancer Syndromes",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2015,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2015/02000/acg_clinical_guideline__genetic_testing_and.8.aspx",
    "citation": "Syngal S, Brand RE, Church JM, Giardiello FM, Hampel HL, Burt RW. Am J Gastroenterol. 2015;110(2):223-262.",
    "summary": "This ACG guideline directs the recognition, genetic testing and management of hereditary GI cancer syndromes including Lynch syndrome and the polyposis syndromes. It recommends detailed family-history assessment, universal tumor testing of colorectal cancers for Lynch syndrome, genetic testing with counseling, and intensive, syndrome-specific surveillance and risk-reduction.",
    "keyRecommendations": [
      {
        "topic": "Family history",
        "text": "Collect a detailed family history of cancers and premalignant GI conditions with ages at diagnosis to identify at-risk individuals.",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Tumor testing",
        "text": "Perform universal mismatch-repair (MSI/IHC) testing on colorectal cancers to identify Lynch syndrome.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Genetic testing",
        "text": "Conduct germline genetic testing on the most informative relative within pre- and post-test genetic counseling.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Lynch surveillance",
        "text": "In Lynch syndrome, perform colonoscopy every 1-2 years starting at age 20-25 and consider aspirin chemoprevention and risk-reducing gynecologic surgery.",
        "lineOfTherapy": "prevention",
        "drugs": [
          "aspirin"
        ]
      },
      {
        "topic": "Polyposis syndromes",
        "text": "Manage FAP and MUTYH-associated polyposis with colectomy timing decisions and upper GI (duodenal) surveillance.",
        "lineOfTherapy": "prevention"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-colon-ischemia-2015",
    "societyId": "acg",
    "conditionIds": [
      "colon-ischemia"
    ],
    "title": "ACG Clinical Guideline: Epidemiology, Risk Factors, Patterns of Presentation, Diagnosis, and Management of Colon Ischemia (CI)",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2015,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2015/01000/acg_clinical_guideline__epidemiology,_risk_factors.8.aspx",
    "citation": "Brandt LJ, Feuerstadt P, Longstreth GF, Boley SJ. Am J Gastroenterol. 2015;110(1):18-44.",
    "summary": "This ACG guideline covers colon ischemia, which typically presents in older adults with sudden cramping abdominal pain, urgency and mild hematochezia. CT is the initial imaging test, colonoscopy within 48 hours confirms the diagnosis and severity, most non-gangrenous cases resolve with supportive care and selective antibiotics, and surgery is reserved for gangrene or fulminant disease.",
    "keyRecommendations": [
      {
        "topic": "Clinical suspicion",
        "text": "Suspect colon ischemia in older patients with sudden cramping abdominal pain, an urge to defecate, and mild hematochezia.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Imaging",
        "text": "Obtain CT of the abdomen/pelvis with contrast as the initial imaging to assess distribution and severity.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Colonoscopy",
        "text": "Perform colonoscopy within 48 hours to confirm the diagnosis and assess severity; avoid it with gangrene or peritonitis.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Supportive management",
        "text": "Manage most non-gangrenous colon ischemia with IV fluids and bowel rest, adding antibiotics for moderate-to-severe disease.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Surgery and workup",
        "text": "Operate for gangrene, perforation, or fulminant colitis; evaluate for thrombophilia in young or recurrent cases.",
        "lineOfTherapy": "escalation"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-achalasia-2020",
    "societyId": "acg",
    "conditionIds": [
      "achalasia"
    ],
    "title": "ACG Clinical Guidelines: Diagnosis and Management of Achalasia",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2020,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2020/09000/acg_clinical_guidelines__diagnosis_and_management.18.aspx",
    "citation": "Vaezi MF, Pandolfino JE, Yadlapati RH, Greer KB, Kavitt RT. Am J Gastroenterol. 2020;115(9):1393-1411.",
    "summary": "The ACG achalasia guideline recommends high-resolution manometry to diagnose and subtype achalasia, with barium esophagram and endoscopy to exclude pseudoachalasia. Definitive treatment options include pneumatic dilation, laparoscopic Heller myotomy, and per-oral endoscopic myotomy chosen by subtype and expertise, with botulinum toxin or pharmacotherapy reserved for poor procedural candidates.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis",
        "text": "Diagnose achalasia with high-resolution manometry (Chicago classification, 3 subtypes) after barium esophagram and endoscopy exclude pseudoachalasia.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Definitive therapy",
        "text": "Offer pneumatic dilation, laparoscopic Heller myotomy, or per-oral endoscopic myotomy (POEM) based on subtype and local expertise.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Type III achalasia",
        "text": "POEM is particularly effective for type III achalasia because myotomy length can be tailored.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Poor procedural candidates",
        "text": "Use endoscopic botulinum toxin injection or nitrates/calcium channel blockers for patients who are not candidates for definitive therapy.",
        "lineOfTherapy": "second-line",
        "drugs": [
          "botulinum toxin",
          "nifedipine",
          "isosorbide dinitrate"
        ]
      },
      {
        "topic": "Follow-up",
        "text": "Assess treatment response with a timed barium esophagram and monitor for reflux, especially after POEM.",
        "lineOfTherapy": "maintenance"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-pancreatic-cysts-2018",
    "societyId": "acg",
    "conditionIds": [
      "pancreatic-cystic-lesions"
    ],
    "title": "ACG Clinical Guideline: Diagnosis and Management of Pancreatic Cysts",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2018,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2018/04000/acg_clinical_guideline__diagnosis_and_management.18.aspx",
    "citation": "Elta GH, Enestvedt BK, Sauer BG, Lennon AM. Am J Gastroenterol. 2018;113(4):464-479.",
    "summary": "This ACG guideline provides a practical approach to incidentally detected pancreatic cysts, using MRI/MRCP or EUS to characterize lesions and EUS-guided fine-needle aspiration when uncertain. Mucinous cysts (IPMN, MCN) carry malignant potential and worrisome features prompt EUS or surgery, while serous cystadenomas are benign; surveillance intervals are size-based and continue while the patient is a surgical candidate.",
    "keyRecommendations": [
      {
        "topic": "Characterization",
        "text": "Characterize pancreatic cysts with MRI/MRCP (preferred) or EUS; add EUS-FNA with cytology, CEA, glucose and molecular analysis when the diagnosis is uncertain.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "High-risk features",
        "text": "Refer cysts with worrisome/high-risk features (mural nodule, main pancreatic duct >=5 mm, size >=3 cm, obstructive jaundice) for EUS-FNA and/or surgical evaluation.",
        "lineOfTherapy": "escalation"
      },
      {
        "topic": "Cyst types",
        "text": "Recognize that mucinous cysts (IPMN, MCN) have malignant potential whereas serous cystadenomas are benign.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Surveillance",
        "text": "Follow presumed mucinous cysts with size-based MRI surveillance intervals, continuing while the patient remains a surgical candidate.",
        "lineOfTherapy": "maintenance"
      },
      {
        "topic": "Surgery",
        "text": "Refer to a multidisciplinary team and consider surgery for main-duct IPMN and high-risk lesions.",
        "lineOfTherapy": "escalation"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-antithrombotic-gi-bleeding-2022",
    "societyId": "acg",
    "conditionIds": [
      "gi-bleeding-antithrombotic",
      "upper-gi-bleeding",
      "lower-gi-bleeding"
    ],
    "title": "American College of Gastroenterology-Canadian Association of Gastroenterology Clinical Practice Guideline: Management of Anticoagulants and Antiplatelets During Acute Gastrointestinal Bleeding and the Periendoscopic Period",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2022,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2022/04000/american_college_of_gastroenterology_canadian.16.aspx",
    "citation": "Abraham NS, Barkun AN, Sauer BG, et al. Am J Gastroenterol. 2022;117(4):542-558.",
    "summary": "This joint ACG-CAG guideline advises how to manage anticoagulants and antiplatelets during acute GI bleeding and around endoscopy. It suggests against fresh frozen plasma, vitamin K and platelet transfusions in most cases, favors prothrombin complex concentrate over FFP when warfarin reversal is needed, and recommends resuming secondary-prevention aspirin and anticoagulation once hemostasis is achieved.",
    "keyRecommendations": [
      {
        "topic": "Warfarin during bleeding",
        "text": "Do not routinely give fresh frozen plasma or vitamin K; use prothrombin complex concentrate rather than FFP if reversal is required.",
        "lineOfTherapy": "supportive",
        "drugs": [
          "prothrombin complex concentrate"
        ]
      },
      {
        "topic": "DOAC during bleeding",
        "text": "Hold the DOAC and do not routinely give PCC; reserve reversal agents (idarucizumab, andexanet) for life-threatening bleeding.",
        "lineOfTherapy": "supportive",
        "drugs": [
          "idarucizumab",
          "andexanet alfa"
        ]
      },
      {
        "topic": "Antiplatelet therapy",
        "text": "Do not give platelet transfusions solely to counteract antiplatelet agents.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Aspirin resumption",
        "text": "Resume cardiac aspirin for secondary prevention on the day hemostasis is endoscopically confirmed rather than discontinuing it.",
        "evidenceGrade": "conditional",
        "lineOfTherapy": "prevention",
        "drugs": [
          "aspirin"
        ]
      },
      {
        "topic": "Elective endoscopy",
        "text": "For most elective procedures continue warfarin without bridging, and resume anticoagulation after the procedure based on thrombotic risk.",
        "lineOfTherapy": "prevention"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-sibo-2020",
    "societyId": "acg",
    "conditionIds": [
      "sibo",
      "irritable-bowel-syndrome"
    ],
    "title": "ACG Clinical Guideline: Small Intestinal Bacterial Overgrowth",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2020,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2020/02000/acg_clinical_guideline__small_intestinal_bacterial.9.aspx",
    "citation": "Pimentel M, Saad RJ, Long MD, Rao SSC. Am J Gastroenterol. 2020;115(2):165-178.",
    "summary": "This ACG guideline defines small intestinal bacterial overgrowth as excess small-bowel bacteria causing GI symptoms and recommends breath testing (glucose or lactulose hydrogen) for diagnosis, with small-bowel aspirate/culture as an alternative. Symptomatic SIBO is treated with antibiotics such as rifaximin, and underlying predisposing conditions should be addressed.",
    "keyRecommendations": [
      {
        "topic": "When to suspect",
        "text": "Consider SIBO in patients with bloating, distension and diarrhea, particularly with predisposing factors such as dysmotility, prior surgery, or chronic PPI use.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Diagnosis",
        "text": "Use glucose or lactulose hydrogen breath testing to diagnose SIBO; small-bowel aspirate and culture is an alternative.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Antibiotic therapy",
        "text": "Treat symptomatic SIBO with antibiotics (for example, rifaximin) to eradicate overgrowth and improve symptoms.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "rifaximin"
        ]
      },
      {
        "topic": "Address underlying cause",
        "text": "Identify and manage predisposing conditions to reduce recurrence.",
        "lineOfTherapy": "maintenance"
      },
      {
        "topic": "Adjuncts",
        "text": "Evidence for probiotics and specific diets is limited; avoid unnecessary long-term acid suppression.",
        "lineOfTherapy": "supportive"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-chronic-idiopathic-constipation-2023",
    "societyId": "acg",
    "conditionIds": [
      "chronic-idiopathic-constipation"
    ],
    "title": "American Gastroenterological Association-American College of Gastroenterology Clinical Practice Guideline: Pharmacological Management of Chronic Idiopathic Constipation",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2023,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2023/06000/american_gastroenterological_association_american.13.aspx",
    "citation": "Chang L, Chey WD, Imdad A, et al. Am J Gastroenterol. 2023;118(6):936-954. doi:10.14309/ajg.0000000000002227 (verified via PubMed).",
    "summary": "This joint AGA-ACG guideline addresses pharmacologic management of chronic idiopathic constipation with a stepwise approach. It makes strong recommendations for polyethylene glycol, senna, and (newly) magnesium oxide as inexpensive first options, reserving secretagogues and prokinetics such as linaclotide, plecanatide and prucalopride for patients with inadequate response.",
    "keyRecommendations": [
      {
        "topic": "First options",
        "text": "Recommend polyethylene glycol, senna, and magnesium oxide as effective, low-cost initial pharmacologic therapies for CIC.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line",
        "drugs": [
          "polyethylene glycol",
          "senna",
          "magnesium oxide"
        ]
      },
      {
        "topic": "Fiber and osmotics",
        "text": "Use soluble fiber with or without osmotic laxatives as part of the initial stepwise approach.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Secretagogues",
        "text": "For inadequate response, use secretagogues linaclotide, plecanatide, or lubiprostone.",
        "lineOfTherapy": "second-line",
        "drugs": [
          "linaclotide",
          "plecanatide",
          "lubiprostone"
        ]
      },
      {
        "topic": "Prokinetic",
        "text": "Prucalopride and sodium picosulfate are recommended options for patients not responding to over-the-counter agents.",
        "lineOfTherapy": "second-line",
        "drugs": [
          "prucalopride",
          "sodium picosulfate"
        ]
      },
      {
        "topic": "Refractory evaluation",
        "text": "Evaluate for a defecatory/pelvic floor disorder in patients refractory to pharmacotherapy.",
        "lineOfTherapy": "refractory"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-benign-anorectal-disorders-2021",
    "societyId": "acg",
    "conditionIds": [
      "benign-anorectal-disorders"
    ],
    "title": "ACG Clinical Guidelines: Management of Benign Anorectal Disorders",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2021,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2021/10000/acg_clinical_guidelines__management_of_benign.13.aspx",
    "citation": "Wald A, Bharucha AE, Limketkai BN, Malcolm A, Remes-Troche JM, Whitehead WE, Zutshi M. Am J Gastroenterol. 2021;116(10):1987-2008.",
    "summary": "This ACG guideline covers evaluation and management of benign anorectal disorders including hemorrhoids, anal fissure, fecal incontinence, dyssynergic defecation and proctalgia. First-line therapy for hemorrhoids and fissures is conservative (fiber, topical agents), with office procedures or surgery for refractory disease, while dyssynergic defecation and fecal incontinence are managed with anorectal testing and pelvic floor biofeedback.",
    "keyRecommendations": [
      {
        "topic": "Hemorrhoids",
        "text": "Manage symptomatic hemorrhoids first with dietary fiber and fluids; use office procedures (e.g., rubber band ligation) for internal hemorrhoids and early excision for acutely thrombosed external hemorrhoids.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Anal fissure",
        "text": "Use topical calcium channel blockers (diltiazem or nifedipine) first-line, botulinum toxin second-line, and lateral internal sphincterotomy for refractory chronic fissures.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "diltiazem",
          "nifedipine",
          "botulinum toxin"
        ]
      },
      {
        "topic": "Fecal incontinence",
        "text": "Treat fecal incontinence with fiber, antidiarrheals and pelvic floor biofeedback; consider sacral neuromodulation for refractory cases.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "loperamide"
        ]
      },
      {
        "topic": "Dyssynergic defecation",
        "text": "Diagnose with anorectal manometry and balloon expulsion testing and treat with biofeedback (pelvic floor) therapy as first-line.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Proctalgia",
        "text": "Manage proctalgia syndromes with reassurance, biofeedback, and, for levator ani syndrome, options such as electrogalvanic stimulation or botulinum toxin.",
        "lineOfTherapy": "supportive"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-gastric-premalignant-conditions-2025",
    "societyId": "acg",
    "conditionIds": [
      "gastric-premalignant-conditions",
      "h-pylori-infection"
    ],
    "title": "ACG Clinical Guideline: Diagnosis and Management of Gastric Premalignant Conditions",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2025,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2025/04000/acg_clinical_guideline__diagnosis_and_management.13.aspx",
    "citation": "Morgan DR, Corral JE, Li D, Montgomery EA, Riquelme A, Kim JJ, Sauer B, Shah SC. Am J Gastroenterol. 2025;120(4):709-737. doi:10.14309/ajg.0000000000003350 (verified via PubMed).",
    "summary": "This first ACG guideline on gastric premalignant conditions addresses atrophic gastritis, gastric intestinal metaplasia, dysplasia and certain gastric polyps that raise gastric cancer risk. It calls for high-quality, image-enhanced endoscopy with systematic biopsy mapping, risk-stratified surveillance (generally every 3 years for high-risk patients), H. pylori eradication, and endoscopic resection of dysplasia or early cancer at expert centers.",
    "keyRecommendations": [
      {
        "topic": "High-quality endoscopy",
        "text": "Perform high-quality endoscopy with mucosal cleansing, insufflation, image-enhanced endoscopy (e.g., narrow-band imaging) and systematic biopsy mapping to diagnose and stage gastric intestinal metaplasia and atrophic gastritis.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Surveillance",
        "text": "Offer endoscopic surveillance (typically every 3 years) to patients at high risk for progression based on histologic (incomplete/extensive metaplasia), demographic and family-history factors.",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "H. pylori eradication",
        "text": "Test for and eradicate H. pylori in patients with gastric premalignant conditions and confirm cure.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Endoscopic treatment",
        "text": "Treat visible dysplasia and early gastric cancer with endoscopic resection (EMR/ESD) at expert centers.",
        "lineOfTherapy": "escalation"
      },
      {
        "topic": "Special conditions",
        "text": "Provide tailored evaluation and surveillance for autoimmune gastritis and gastric epithelial polyps.",
        "lineOfTherapy": "supportive"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-colonic-diverticulitis-2026",
    "societyId": "acg",
    "conditionIds": [
      "diverticular-disease"
    ],
    "title": "ACG Clinical Guideline: Colonic Diverticulitis",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2026,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2026/07000/acg_clinical_guideline__colonic_diverticulitis.13.aspx",
    "citation": "Peery AF, et al. Am J Gastroenterol. 2026;121(7):1549-1561. doi:10.14309/ajg.0000000000004047 (verified via PubMed).",
    "summary": "This ACG guideline gives evidence-based, largely outpatient recommendations for colonic diverticulitis. CT confirms the diagnosis, antibiotics are used selectively (not routinely) in mild uncomplicated disease in immunocompetent patients, colonoscopy is performed after resolution in defined circumstances, and elective surgery decisions are individualized rather than based solely on the number of episodes.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis",
        "text": "Use CT imaging to confirm the diagnosis of diverticulitis, particularly at first presentation and in severe cases.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Selective antibiotics",
        "text": "Manage uncomplicated diverticulitis in immunocompetent patients with selective (not routine) antibiotic use; give antibiotics for complicated, immunocompromised, or high-risk patients.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Follow-up colonoscopy",
        "text": "Perform colonoscopy after resolution for complicated diverticulitis, and for uncomplicated disease if there are alarm features or the patient is not up to date with colorectal cancer screening.",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Prevention",
        "text": "Recommend a high-fiber diet and advise against rifaximin or mesalamine for prevention of recurrence.",
        "lineOfTherapy": "prevention"
      },
      {
        "topic": "Elective surgery",
        "text": "Individualize elective surgery decisions based on patient factors rather than the number of prior episodes.",
        "lineOfTherapy": "escalation"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-hepatic-encephalopathy-2026",
    "societyId": "acg",
    "conditionIds": [
      "hepatic-encephalopathy"
    ],
    "title": "ACG Clinical Guideline: Hepatic Encephalopathy",
    "language": "en",
    "specialty": "hepatology",
    "year": 2026,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2026/03000/acg_clinical_guideline__hepatic_encephalopathy.12.aspx",
    "citation": "Bajaj JS, Jakab SS, Jesudian AB, et al. Am J Gastroenterol. 2026;121(3):588-618. doi:10.14309/ajg.0000000000003899 (verified via PubMed).",
    "summary": "This ACG guideline provides recommendations for diagnosing, treating and preventing hepatic encephalopathy in cirrhosis. Lactulose titrated to 2-3 soft stools per day is first-line, rifaximin is added for acute overt HE and for secondary prophylaxis, precipitants are identified and treated, and adequate protein intake plus peri-TIPS rifaximin prophylaxis are emphasized.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis and precipitants",
        "text": "Diagnose overt HE clinically after excluding other causes of altered mentation, and identify and treat precipitants (infection, GI bleeding, dehydration, electrolyte disturbance).",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Acute overt HE",
        "text": "Treat acute overt HE with lactulose titrated to 2-3 soft bowel movements daily and add rifaximin to lactulose.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line",
        "drugs": [
          "lactulose",
          "rifaximin"
        ]
      },
      {
        "topic": "Secondary prophylaxis",
        "text": "After a first episode of overt HE use lactulose for prevention, adding rifaximin after a second episode to reduce recurrence.",
        "lineOfTherapy": "maintenance",
        "drugs": [
          "lactulose",
          "rifaximin"
        ]
      },
      {
        "topic": "Peri-TIPS prophylaxis",
        "text": "Start rifaximin 14 days before elective TIPS and continue at least 6 months in decompensated cirrhosis to reduce post-TIPS HE.",
        "lineOfTherapy": "prevention",
        "drugs": [
          "rifaximin"
        ]
      },
      {
        "topic": "Nutrition and alternatives",
        "text": "Maintain adequate protein intake without restriction, and consider high-volume polyethylene glycol as an alternative to lactulose for acute HE.",
        "lineOfTherapy": "supportive",
        "drugs": [
          "polyethylene glycol"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-liver-disease-pregnancy-2016",
    "societyId": "acg",
    "conditionIds": [
      "liver-disease-pregnancy"
    ],
    "title": "ACG Clinical Guideline: Liver Disease and Pregnancy",
    "language": "en",
    "specialty": "hepatology",
    "year": 2016,
    "status": "current",
    "sourceUrl": "https://journals.lww.com/ajg/fulltext/2016/02000/acg_clinical_guideline__liver_disease_and.15.aspx",
    "citation": "Tran TT, Ahn J, Reau NS. Am J Gastroenterol. 2016;111(2):176-194.",
    "summary": "This ACG guideline addresses liver diseases unique to and coincident with pregnancy. Intrahepatic cholestasis of pregnancy is diagnosed by elevated bile acids with pruritus and treated with ursodeoxycholic acid and timed delivery, HELLP syndrome and acute fatty liver of pregnancy require prompt delivery, and chronic liver disease including hepatitis B is managed to protect mother and fetus.",
    "keyRecommendations": [
      {
        "topic": "Intrahepatic cholestasis of pregnancy",
        "text": "Diagnose ICP with serum bile acids >10 micromol/L and pruritus; treat with ursodeoxycholic acid 10-15 mg/kg and deliver around 37 weeks (earlier if bile acids are markedly elevated).",
        "lineOfTherapy": "first-line",
        "drugs": [
          "ursodeoxycholic acid"
        ]
      },
      {
        "topic": "HELLP and AFLP",
        "text": "Manage HELLP syndrome and acute fatty liver of pregnancy with prompt delivery and supportive care.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Hyperemesis gravidarum",
        "text": "Provide supportive care and antiemetics for the mild liver enzyme elevations of hyperemesis gravidarum.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Hepatitis B in pregnancy",
        "text": "Treat pregnant patients with high hepatitis B viral load with antiviral therapy (tenofovir) to reduce perinatal transmission.",
        "lineOfTherapy": "prevention",
        "drugs": [
          "tenofovir"
        ]
      },
      {
        "topic": "Cirrhosis in pregnancy",
        "text": "Screen for and manage esophageal varices in pregnant patients with cirrhosis and provide preconception counseling.",
        "lineOfTherapy": "screening"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-perioperative-cirrhosis-2025",
    "societyId": "acg",
    "conditionIds": ["cirrhosis"],
    "title": "ACG Clinical Guideline: Perioperative Risk Assessment and Management in Patients With Cirrhosis",
    "language": "en",
    "specialty": "hepatology",
    "year": 2025,
    "status": "current",
    "sourceUrl": "https://doi.org/10.14309/ajg.0000000000003616",
    "citation": "American College of Gastroenterology. ACG Clinical Guideline: Perioperative Risk Assessment and Management in Patients With Cirrhosis. Am J Gastroenterol. 2025. doi:10.14309/ajg.0000000000003616. Identified via PubMed.",
    "summary": "ACG guidance on assessing and managing surgical risk in patients with cirrhosis, who face substantially higher perioperative morbidity and mortality. It recommends individualized risk stratification with cirrhosis-specific calculators, structured preoperative optimization, and a multidisciplinary approach across the pre-, intra- and postoperative period, with special caution in decompensated disease.",
    "keyRecommendations": [
      {
        "topic": "Risk stratification",
        "text": "Estimate perioperative risk with validated cirrhosis-specific tools (e.g. the VOCAL-Penn score) rather than generic calculators, integrating liver-disease severity, non-hepatic comorbidities and the specific surgery.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Preoperative optimization",
        "text": "Before elective surgery, optimize nutrition, manage portal hypertension, correct clinically significant haemostatic abnormalities, and address frailty and sarcopenia.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Decompensated disease",
        "text": "In decompensated cirrhosis, defer elective surgery where possible and involve a multidisciplinary team; transjugular intrahepatic portosystemic shunt (TIPS) may be considered before selected operations.",
        "lineOfTherapy": "escalation"
      }
    ],
    "lastVerified": "2026-07-19",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-malnutrition-liver-disease-2025",
    "societyId": "acg",
    "conditionIds": ["cirrhosis"],
    "title": "ACG Clinical Guideline: Malnutrition and Nutritional Recommendations in Liver Disease",
    "language": "en",
    "specialty": "hepatology",
    "year": 2025,
    "status": "current",
    "sourceUrl": "https://doi.org/10.14309/ajg.0000000000003379",
    "citation": "American College of Gastroenterology. ACG Clinical Guideline: Malnutrition and Nutritional Recommendations in Liver Disease. Am J Gastroenterol. 2025. doi:10.14309/ajg.0000000000003379. Identified via PubMed.",
    "summary": "ACG guidance on recognizing and treating malnutrition in liver disease — a common driver of frailty and sarcopenia that worsens mortality and pre- and post-transplant outcomes. It recommends routine nutritional assessment in cirrhosis and alcohol-associated hepatitis, a specific meal pattern, adequate protein, and correction of micronutrient deficiencies.",
    "keyRecommendations": [
      {
        "topic": "Assessment",
        "text": "Assess all patients with cirrhosis or alcohol-associated hepatitis for malnutrition, frailty and sarcopenia, which independently worsen mortality and transplant outcomes.",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Dietary pattern and protein",
        "text": "Advise small frequent meals with a late-evening (bedtime) snack to shorten overnight fasting, and adequate protein intake — protein restriction is not recommended.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Micronutrients",
        "text": "Evaluate for and replace micronutrient deficiencies (for example zinc), which are common in advanced liver disease.",
        "lineOfTherapy": "supportive"
      }
    ],
    "lastVerified": "2026-07-19",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-biliary-strictures-2023",
    "societyId": "acg",
    "conditionIds": ["biliary-strictures"],
    "title": "ACG Clinical Guideline: Diagnosis and Management of Biliary Strictures",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2023,
    "status": "current",
    "sourceUrl": "https://doi.org/10.14309/ajg.0000000000002190",
    "citation": "American College of Gastroenterology. ACG Clinical Guideline: Diagnosis and Management of Biliary Strictures. Am J Gastroenterol. 2023. doi:10.14309/ajg.0000000000002190. Identified via PubMed.",
    "summary": "ACG guidance on biliary strictures, where the central tasks are confirming or excluding malignancy and re-establishing bile flow. The diagnostic and drainage approach differs by anatomic location (extrahepatic vs perihilar), with endoscopic ultrasound-guided tissue acquisition central to extrahepatic disease and perihilar strictures remaining diagnostically challenging.",
    "keyRecommendations": [
      {
        "topic": "Malignancy suspicion",
        "text": "Maintain a high index of suspicion for malignancy in any biliary stricture; the goals of care are a tissue diagnosis and restoration of bile flow to the duodenum.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Tissue diagnosis",
        "text": "For extrahepatic strictures, endoscopic ultrasound-guided tissue acquisition is the accurate diagnostic mainstay; perihilar strictures often require ERCP with brush cytology, biopsy or cholangioscopy.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Drainage",
        "text": "Re-establish biliary drainage endoscopically (ERCP with stenting); the approach and safety differ between extrahepatic and perihilar locations.",
        "lineOfTherapy": "first-line"
      }
    ],
    "lastVerified": "2026-07-19",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "acg-gi-subepithelial-lesions-2022",
    "societyId": "acg",
    "conditionIds": ["gi-subepithelial-lesions"],
    "title": "ACG Clinical Guideline: Diagnosis and Management of Gastrointestinal Subepithelial Lesions",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2022,
    "status": "current",
    "sourceUrl": "https://doi.org/10.14309/ajg.0000000000002100",
    "citation": "American College of Gastroenterology. ACG Clinical Guideline: Diagnosis and Management of Gastrointestinal Subepithelial Lesions. Am J Gastroenterol. 2022. doi:10.14309/ajg.0000000000002100. Identified via PubMed.",
    "summary": "ACG guidance on gastrointestinal subepithelial lesions (SEL) — a mix of benign and potentially malignant tumours, cysts and extrinsic compressions, usually found incidentally at endoscopy or imaging. Endoscopic ultrasound with tissue acquisition is central to characterizing solid lesions and separating benign entities from gastrointestinal stromal tumours that need resection.",
    "keyRecommendations": [
      {
        "topic": "Characterization",
        "text": "Use endoscopic ultrasound with tissue acquisition (EUS fine-needle biopsy, or fine-needle aspiration with rapid on-site evaluation) to characterize solid, non-lipomatous subepithelial lesions.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Risk stratification",
        "text": "Many subepithelial lesions are benign incidental findings; stratify risk by EUS features (size, layer of origin, echotexture) to decide between surveillance and intervention.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Gastrointestinal stromal tumours",
        "text": "Resect gastrointestinal stromal tumours according to size and risk; imatinib is used for high-risk, unresectable or metastatic disease under specialist oncology care.",
        "lineOfTherapy": "first-line",
        "drugs": ["imatinib"]
      }
    ],
    "lastVerified": "2026-07-19",
    "dataProvenance": "hand-curated-demo"
  }
];
