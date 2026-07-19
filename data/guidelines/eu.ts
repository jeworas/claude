import type { Guideline } from '../../src/lib/types';

/**
 * European guideline bodies: ECCO (European Crohn’s and Colitis Organisation)
 * and UEG (United European Gastroenterology). Compiled from published guidance;
 * titles/years/links corroborated via web search. Treatment summaries are short
 * original paraphrases for reference only — verify against the source.
 */
export const euGuidelines: Guideline[] = [
  {
    "id": "ecco-uc-medical-2022",
    "societyId": "ecco",
    "conditionIds": [
      "ulcerative-colitis"
    ],
    "title": "ECCO Guidelines on Therapeutics in Ulcerative Colitis: Medical Treatment",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2022,
    "status": "current",
    "sourceUrl": "https://academic.oup.com/ecco-jcc/article/16/1/2/6390052",
    "citation": "European Crohn's and Colitis Organisation (ECCO). ECCO Guidelines on Therapeutics in Ulcerative Colitis: Medical Treatment. J Crohns Colitis. 2022;16(1):2-17. doi:10.1093/ecco-jcc/jjab178",
    "summary": "GRADE-based evidence recommendations for medical management of adults with ulcerative colitis across induction and maintenance, stratified by disease extent and severity. 5-aminosalicylates are first-line for mild-to-moderate disease, while advanced therapies (biologics and small molecules) are recommended for moderate-to-severe or refractory disease, and corticosteroids are limited to induction only.",
    "keyRecommendations": [
      {
        "topic": "Mild-to-moderate UC",
        "text": "Optimised oral plus topical 5-aminosalicylates (at least 2 g/day) are first-line to induce and maintain remission; topical (rectal) therapy is preferred for proctitis.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "mesalazine (5-ASA)"
        ]
      },
      {
        "topic": "Moderate-to-severe UC",
        "text": "Advanced therapies are recommended for patients failing or intolerant to conventional therapy, including anti-TNF agents, vedolizumab, ustekinumab, tofacitinib and ozanimod.",
        "lineOfTherapy": "escalation",
        "drugs": [
          "infliximab",
          "adalimumab",
          "golimumab",
          "vedolizumab",
          "ustekinumab",
          "tofacitinib",
          "ozanimod"
        ]
      },
      {
        "topic": "Corticosteroids",
        "text": "Systemic corticosteroids induce but do not maintain remission and must be time-limited; steroid dependence or refractoriness mandates escalation to a steroid-sparing advanced therapy.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Acute severe UC",
        "text": "Hospitalised acute severe UC requires intravenous corticosteroids with rescue therapy (infliximab or ciclosporin) for non-responders assessed by around day 3, alongside venous thromboembolism prophylaxis.",
        "lineOfTherapy": "refractory",
        "drugs": [
          "infliximab",
          "ciclosporin"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ecco-uc-surgical-2022",
    "societyId": "ecco",
    "conditionIds": [
      "ulcerative-colitis"
    ],
    "title": "ECCO Guidelines on Therapeutics in Ulcerative Colitis: Surgical Treatment",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2022,
    "status": "current",
    "sourceUrl": "https://academic.oup.com/ecco-jcc/article/16/2/179/6390023",
    "citation": "European Crohn's and Colitis Organisation (ECCO). ECCO Guidelines on Therapeutics in Ulcerative Colitis: Surgical Treatment. J Crohns Colitis. 2022;16(2):179-189. doi:10.1093/ecco-jcc/jjab177 (to verify)",
    "summary": "Companion guideline addressing surgical strategy in ulcerative colitis and the management of acute severe UC. Covers indications and timing of colectomy, reconstructive options and staged ileal pouch-anal anastomosis, and peri-operative optimisation.",
    "keyRecommendations": [
      {
        "topic": "Indications for surgery",
        "text": "Colectomy is indicated for medically refractory disease, dysplasia or cancer, or complications; elective restorative proctocolectomy with ileal pouch-anal anastomosis (IPAA) is the reconstructive procedure of choice.",
        "lineOfTherapy": "refractory"
      },
      {
        "topic": "Acute severe UC failing rescue",
        "text": "Subtotal colectomy with end ileostomy is recommended for acute severe UC not responding to medical rescue therapy.",
        "lineOfTherapy": "refractory"
      },
      {
        "topic": "Staged pouch surgery",
        "text": "Where risk factors are present (e.g., corticosteroids, malnutrition, emergency setting), a staged (modified two- or three-stage) IPAA approach is recommended to reduce septic complications.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "VTE prophylaxis",
        "text": "Pharmacological venous thromboembolism prophylaxis is recommended peri-operatively and during hospitalisation for acute severe colitis.",
        "lineOfTherapy": "prevention"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ecco-cd-medical-2024",
    "societyId": "ecco",
    "conditionIds": [
      "crohns-disease"
    ],
    "title": "ECCO Guidelines on Therapeutics in Crohn's Disease: Medical Treatment",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2024,
    "status": "current",
    "sourceUrl": "https://academic.oup.com/ecco-jcc/article/18/10/1531/7693895",
    "citation": "European Crohn's and Colitis Organisation (ECCO). ECCO Guidelines on Therapeutics in Crohn's Disease: Medical Treatment. J Crohns Colitis. 2024;18(10):1531-1555. doi:10.1093/ecco-jcc/jjae091 (updates 2020 version)",
    "summary": "Updated GRADE-based recommendations for the medical treatment of Crohn's disease across induction and maintenance, reflecting an expanded advanced-therapy landscape and a treat-to-target philosophy. Advanced therapies are prioritised in moderate-to-severe disease, corticosteroids are restricted to induction, and objective monitoring guides escalation.",
    "keyRecommendations": [
      {
        "topic": "Moderate-to-severe CD induction",
        "text": "Advanced therapies are recommended to induce remission in moderate-to-severe Crohn's disease, including anti-TNF agents, ustekinumab, vedolizumab, risankizumab and the JAK inhibitor upadacitinib.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "infliximab",
          "adalimumab",
          "ustekinumab",
          "vedolizumab",
          "risankizumab",
          "upadacitinib"
        ]
      },
      {
        "topic": "Maintenance",
        "text": "The advanced therapy used to induce remission should generally be continued for maintenance; thiopurine monotherapy has a limited role and is not recommended to induce remission.",
        "lineOfTherapy": "maintenance"
      },
      {
        "topic": "Treat-to-target",
        "text": "Treatment should target clinical and endoscopic remission using objective monitoring (CRP, faecal calprotectin, endoscopy) rather than symptom control alone.",
        "lineOfTherapy": "maintenance"
      },
      {
        "topic": "Corticosteroids",
        "text": "Systemic or ileal-release budesonide corticosteroids may induce remission but must not be used for maintenance; steroid dependence warrants an advanced therapy.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "budesonide",
          "prednisolone"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ecco-cd-surgical-2024",
    "societyId": "ecco",
    "conditionIds": [
      "crohns-disease"
    ],
    "title": "ECCO Guidelines on Therapeutics in Crohn's Disease: Surgical Treatment",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2024,
    "status": "current",
    "sourceUrl": "https://academic.oup.com/ecco-jcc/article/18/10/1556/7693896",
    "citation": "European Crohn's and Colitis Organisation (ECCO). ECCO Guidelines on Therapeutics in Crohn's Disease: Surgical Treatment. J Crohns Colitis. 2024;18(10):1556-1582. doi:10.1093/ecco-jcc/jjae089 (to verify; updates 2020 version)",
    "summary": "Updated recommendations on the surgical management of Crohn's disease, covering ileocaecal resection as an alternative to medical therapy, stricturing and penetrating disease, perianal fistulising disease and prevention of post-operative recurrence.",
    "keyRecommendations": [
      {
        "topic": "Limited ileocaecal CD",
        "text": "Ileocaecal resection is an appropriate first-line alternative to medical therapy in limited, non-stricturing ileocaecal Crohn's disease.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Perianal fistulising CD",
        "text": "Perianal fistulising Crohn's disease requires combined medical and surgical management, with seton drainage of sepsis before immunosuppression and MRI/examination under anaesthesia to guide classification.",
        "drugs": [
          "infliximab",
          "adalimumab"
        ]
      },
      {
        "topic": "Post-operative recurrence",
        "text": "Prophylaxis against post-operative recurrence is recommended for patients with risk factors, with endoscopic assessment around 6-12 months guiding step-up of therapy.",
        "lineOfTherapy": "prevention"
      },
      {
        "topic": "Stricturing disease",
        "text": "Short fibrotic small-bowel strictures may be managed by strictureplasty or endoscopic balloon dilation to preserve bowel length.",
        "lineOfTherapy": "supportive"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ecco-diagnostics-monitoring-part1-2025",
    "societyId": "ecco",
    "conditionIds": [
      "inflammatory-bowel-disease"
    ],
    "title": "ECCO-ESGAR-ESP-IBUS Guideline on Diagnostics and Monitoring of Patients with Inflammatory Bowel Disease: Part 1",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2025,
    "status": "current",
    "sourceUrl": "https://academic.oup.com/ecco-jcc/article/19/7/jjaf106/8219802",
    "citation": "ECCO, ESGAR, ESP, IBUS. ECCO-ESGAR-ESP-IBUS Guideline on Diagnostics and Monitoring of Patients with Inflammatory Bowel Disease: Part 1 - initial diagnosis, monitoring of known IBD, detection of complications. J Crohns Colitis. 2025;19(7):jjaf106. doi:10.1093/ecco-jcc/jjaf106 (updates 2018 ECCO-ESGAR)",
    "summary": "First of two multi-society guidelines (ECCO, ESGAR, ESP, IBUS) updating the 2018 ECCO-ESGAR diagnostic guidance. Part 1 covers requirements for initial diagnosis, monitoring of established IBD and detection of complications using ileocolonoscopy, cross-sectional imaging, intestinal ultrasound, histopathology and biomarkers, emphasising that no single test is diagnostic.",
    "keyRecommendations": [
      {
        "topic": "Initial diagnosis",
        "text": "Diagnosis of IBD requires a combination of ileocolonoscopy with segmental biopsies, small-bowel and cross-sectional imaging, and laboratory markers; no single test is diagnostic.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Biomarkers",
        "text": "Faecal calprotectin and CRP are recommended to detect and monitor intestinal inflammation and to guide the need for endoscopic or radiological reassessment.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Intestinal ultrasound",
        "text": "Intestinal ultrasound is recommended as a non-invasive tool for diagnosis, monitoring of disease activity and detection of complications.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Detecting complications",
        "text": "MR enterography, CT in acute settings, and intestinal ultrasound are recommended to detect strictures, penetrating complications and abscesses.",
        "lineOfTherapy": "diagnosis"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ecco-diagnostics-monitoring-part2-2025",
    "societyId": "ecco",
    "conditionIds": [
      "inflammatory-bowel-disease"
    ],
    "title": "ECCO-ESGAR-ESP-IBUS Guideline on Diagnostics and Monitoring of Patients with Inflammatory Bowel Disease: Part 2",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2025,
    "status": "current",
    "sourceUrl": "https://academic.oup.com/ecco-jcc/article/19/7/jjaf107/8220327",
    "citation": "ECCO, ESGAR, ESP, IBUS. ECCO-ESGAR-ESP-IBUS Guideline on Diagnostics and Monitoring of Patients with Inflammatory Bowel Disease: Part 2 - scoring systems, general considerations and diagnostics in specific situations. J Crohns Colitis. 2025;19(7):jjaf107. doi:10.1093/ecco-jcc/jjaf107",
    "summary": "Second multi-society ECCO-ESGAR-ESP-IBUS paper addressing scoring systems and indices, general considerations for each diagnostic modality (endoscopy, imaging, histopathology, ultrasound), training and quality, and diagnostics in special situations such as pregnancy, the post-operative setting and cancer surveillance.",
    "keyRecommendations": [
      {
        "topic": "Scoring systems",
        "text": "Validated endoscopic, histological and radiological scoring indices should be used to standardise assessment of disease activity and treatment response.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Dysplasia surveillance",
        "text": "Surveillance colonoscopy, preferably with chromoendoscopy and/or high-definition white light, is recommended for colorectal neoplasia surveillance in long-standing colonic IBD.",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Histopathology",
        "text": "Adequate segmental biopsy sampling and standardised histopathological reporting are recommended to confirm diagnosis, assess activity and detect dysplasia.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Special situations",
        "text": "Non-ionising modalities (intestinal ultrasound and MRI, avoiding gadolinium where possible) are preferred for monitoring during pregnancy.",
        "lineOfTherapy": "diagnosis"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ecco-malignancies-2023",
    "societyId": "ecco",
    "conditionIds": [
      "inflammatory-bowel-disease",
      "colorectal-cancer"
    ],
    "title": "ECCO Guidelines on Inflammatory Bowel Disease and Malignancies",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2023,
    "status": "current",
    "sourceUrl": "https://academic.oup.com/ecco-jcc/article/17/6/827/6931718",
    "citation": "European Crohn's and Colitis Organisation (ECCO). ECCO Guidelines on Inflammatory Bowel Disease and Malignancies. J Crohns Colitis. 2023;17(6):827-854. doi:10.1093/ecco-jcc/jjac187 (updates 2015 version)",
    "summary": "Second ECCO evidence-based consensus on IBD and malignancy. Addresses cancer risk conferred by IBD and its therapies, colorectal dysplasia/cancer surveillance and management, and how to treat IBD in patients with recent or active cancer.",
    "keyRecommendations": [
      {
        "topic": "Colorectal cancer surveillance",
        "text": "Colonoscopic surveillance for colorectal dysplasia/cancer is recommended in colonic IBD, stratified by risk (extent, PSC, family history, prior dysplasia), generally starting about 8 years after symptom onset.",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Thiopurines and cancer",
        "text": "Thiopurines increase the risk of lymphoma and non-melanoma skin cancer; photoprotection and dermatological surveillance are advised.",
        "lineOfTherapy": "supportive",
        "drugs": [
          "azathioprine",
          "mercaptopurine"
        ]
      },
      {
        "topic": "IBD with prior/active cancer",
        "text": "In patients with recent cancer, treatment should be individualised with oncology input; vedolizumab and ustekinumab are regarded as having a favourable safety profile.",
        "drugs": [
          "vedolizumab",
          "ustekinumab"
        ]
      },
      {
        "topic": "HPV prevention",
        "text": "HPV vaccination and cervical screening are recommended in immunosuppressed women with IBD.",
        "lineOfTherapy": "prevention"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ecco-eim-2024",
    "societyId": "ecco",
    "conditionIds": [
      "inflammatory-bowel-disease"
    ],
    "title": "ECCO Guidelines on Extraintestinal Manifestations in Inflammatory Bowel Disease",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2024,
    "status": "current",
    "sourceUrl": "https://academic.oup.com/ecco-jcc/article/18/1/1/7205776",
    "citation": "European Crohn's and Colitis Organisation (ECCO). ECCO Guidelines on Extraintestinal Manifestations in Inflammatory Bowel Disease. J Crohns Colitis. 2024;18(1):1-37. doi:10.1093/ecco-jcc/jjad108 (to verify; updates 2016 version)",
    "summary": "Second ECCO consensus on extraintestinal manifestations (EIMs) of IBD and anaemia, with recommendations spanning musculoskeletal, cutaneous, ocular, hepatobiliary, haematological, cardiovascular and other systems. Up to half of IBD patients develop at least one EIM.",
    "keyRecommendations": [
      {
        "topic": "Peripheral arthritis",
        "text": "Type 1 (pauciarticular) peripheral arthritis usually parallels intestinal activity and improves with treatment of the underlying IBD; anti-TNF agents are effective for axial and refractory peripheral disease.",
        "drugs": [
          "infliximab",
          "adalimumab"
        ]
      },
      {
        "topic": "Primary sclerosing cholangitis",
        "text": "PSC should be considered in IBD with cholestasis; it increases colorectal and cholangiocarcinoma risk and warrants annual colonoscopic surveillance.",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Anaemia",
        "text": "Iron-deficiency anaemia should be actively screened for and treated, with intravenous iron preferred during active IBD or when oral iron is not tolerated.",
        "lineOfTherapy": "supportive",
        "drugs": [
          "ferric carboxymaltose"
        ]
      },
      {
        "topic": "Skin manifestations",
        "text": "Erythema nodosum usually responds to control of intestinal disease, whereas pyoderma gangrenosum requires systemic corticosteroids and/or anti-TNF therapy.",
        "drugs": [
          "infliximab"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ecco-pregnancy-2023",
    "societyId": "ecco",
    "conditionIds": [
      "inflammatory-bowel-disease"
    ],
    "title": "European Crohn's and Colitis Guidelines on Sexuality, Fertility, Pregnancy, and Lactation",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2023,
    "status": "current",
    "sourceUrl": "https://academic.oup.com/ecco-jcc/article/17/1/1/6675338",
    "citation": "European Crohn's and Colitis Organisation (ECCO). European Crohn's and Colitis Guidelines on Sexuality, Fertility, Pregnancy, and Lactation. J Crohns Colitis. 2023;17(1):1-27. doi:10.1093/ecco-jcc/jjac115 (third European consensus on reproduction in IBD)",
    "summary": "Third European (ECCO) consensus on reproduction in IBD, covering sexuality, fertility, pregnancy and lactation. Emphasises achieving and maintaining remission before and during pregnancy and continuing most IBD therapies, since active disease rather than medication drives adverse outcomes.",
    "keyRecommendations": [
      {
        "topic": "Preconception remission",
        "text": "Conception should ideally occur during stable remission; active disease, not medication, is the principal driver of adverse pregnancy outcomes.",
        "lineOfTherapy": "prevention"
      },
      {
        "topic": "Biologics in pregnancy",
        "text": "Anti-TNF agents, vedolizumab and ustekinumab may be continued during pregnancy; timing of the last dose should balance disease activity against placental transfer.",
        "drugs": [
          "infliximab",
          "adalimumab",
          "vedolizumab",
          "ustekinumab"
        ]
      },
      {
        "topic": "Methotrexate",
        "text": "Methotrexate is teratogenic and must be stopped, with effective contraception, before conception in women planning pregnancy.",
        "drugs": [
          "methotrexate"
        ]
      },
      {
        "topic": "Lactation",
        "text": "Thiopurines and anti-TNF agents are considered compatible with breastfeeding.",
        "lineOfTherapy": "maintenance",
        "drugs": [
          "azathioprine",
          "infliximab"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ecco-infections-2026",
    "societyId": "ecco",
    "conditionIds": [
      "inflammatory-bowel-disease"
    ],
    "title": "ECCO Guidelines on the Prevention, Diagnosis, and Management of Infections in Inflammatory Bowel Disease",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2026,
    "status": "current",
    "sourceUrl": "https://academic.oup.com/ecco-jcc/article/20/7/jjag071/8728072",
    "citation": "European Crohn's and Colitis Organisation (ECCO). ECCO Guidelines on the Prevention, Diagnosis, and Management of Infections in Inflammatory Bowel Disease. J Crohns Colitis. 2026;20(7):jjag071. doi:10.1093/ecco-jcc/jjag071 (updates prior opportunistic-infections guidance)",
    "summary": "Updated ECCO guideline on the prevention, diagnosis and management of infections in IBD, superseding earlier opportunistic-infection guidance. Covers pre-treatment screening, vaccination, and management of opportunistic and other infections in the context of modern immunosuppressive and biologic therapy.",
    "keyRecommendations": [
      {
        "topic": "Pre-treatment screening",
        "text": "Before immunosuppression, screen for latent tuberculosis, hepatitis B and C, HIV and varicella immunity; latent TB should be treated before starting biologic therapy.",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Vaccination",
        "text": "Deliver age-appropriate and IBD-specific vaccinations early, including inactivated influenza, pneumococcal, hepatitis B, HPV and SARS-CoV-2; live vaccines are contraindicated under significant immunosuppression.",
        "lineOfTherapy": "prevention"
      },
      {
        "topic": "Clostridioides difficile",
        "text": "Test for and treat C. difficile infection in IBD flares, with vancomycin or fidaxomicin preferred over metronidazole.",
        "drugs": [
          "vancomycin",
          "fidaxomicin"
        ]
      },
      {
        "topic": "Opportunistic infection prophylaxis",
        "text": "Combination immunosuppression increases opportunistic infection risk; prophylaxis against Pneumocystis jirovecii is advised for patients on triple immunosuppression.",
        "lineOfTherapy": "prevention"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ecco-pouchitis-2025",
    "societyId": "ecco",
    "conditionIds": [
      "pouchitis",
      "ulcerative-colitis"
    ],
    "title": "ECCO Topical Review on Pouch Disorders",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2025,
    "status": "current",
    "sourceUrl": "https://academic.oup.com/ecco-jcc/article/19/7/jjaf103/8165474",
    "citation": "European Crohn's and Colitis Organisation (ECCO). ECCO Topical Review on Pouch Disorders. J Crohns Colitis. 2025;19(7):jjaf103. doi:10.1093/ecco-jcc/jjaf103",
    "summary": "ECCO Topical Review giving consensus guidance on the classification, diagnosis and management of disorders of the ileal pouch-anal anastomosis, including acute and chronic (antibiotic-dependent and antibiotic-refractory) pouchitis, Crohn's-like disease of the pouch and cuffitis.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis",
        "text": "Pouchoscopy with biopsies is required to confirm pouchitis and to distinguish it from cuffitis, Crohn's-like disease of the pouch and structural or functional pouch disorders.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Acute pouchitis",
        "text": "Acute pouchitis is treated first-line with antibiotics (ciprofloxacin or metronidazole), with most cases responding within two weeks.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "ciprofloxacin",
          "metronidazole"
        ]
      },
      {
        "topic": "Chronic refractory pouchitis",
        "text": "Chronic antibiotic-refractory pouchitis may require combination antibiotics or advanced therapy such as vedolizumab, ustekinumab or anti-TNF agents.",
        "lineOfTherapy": "refractory",
        "drugs": [
          "vedolizumab",
          "ustekinumab",
          "infliximab"
        ]
      },
      {
        "topic": "Maintenance",
        "text": "High-dose combination probiotics may help maintain remission in relapsing pouchitis.",
        "lineOfTherapy": "maintenance"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ecco-elderly-2017",
    "societyId": "ecco",
    "conditionIds": [
      "inflammatory-bowel-disease"
    ],
    "title": "European Crohn's and Colitis Organisation Topical Review on IBD in the Elderly",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2017,
    "status": "current",
    "sourceUrl": "https://academic.oup.com/ecco-jcc/article/11/3/263/2527542",
    "citation": "European Crohn's and Colitis Organisation (ECCO). ECCO Topical Review on IBD in the Elderly. J Crohns Colitis. 2017;11(3):263-273. doi:10.1093/ecco-jcc/jjw188 (to verify)",
    "summary": "ECCO Topical Review reaching expert consensus on the epidemiology, diagnosis, management and outcomes of Crohn's disease and ulcerative colitis in elderly (elderly-onset and ageing) patients, emphasising comorbidity, polypharmacy, and heightened infection and malignancy risk.",
    "keyRecommendations": [
      {
        "topic": "Individualised therapy",
        "text": "Treatment should account for comorbidity, polypharmacy and frailty; corticosteroids should be minimised given higher infection and metabolic risk in older patients.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Infection and malignancy risk",
        "text": "Older patients on immunosuppression face increased infection and malignancy risk; vaccination and vigilance are recommended, and vedolizumab is noted for a favourable safety profile.",
        "lineOfTherapy": "prevention",
        "drugs": [
          "vedolizumab"
        ]
      },
      {
        "topic": "Differential diagnosis",
        "text": "In the elderly, ischaemic, diverticular, drug-induced and infectious colitis must be excluded before attributing symptoms to IBD.",
        "lineOfTherapy": "diagnosis"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ecco-uc-definitions-2017",
    "societyId": "ecco",
    "conditionIds": [
      "ulcerative-colitis"
    ],
    "title": "Third European Evidence-based Consensus on Diagnosis and Management of Ulcerative Colitis. Part 1: Definitions, Diagnosis, Extra-intestinal Manifestations, Pregnancy, Cancer Surveillance, Surgery, and Ileo-anal Pouch Disorders",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2017,
    "status": "current",
    "sourceUrl": "https://academic.oup.com/ecco-jcc/article/11/6/649/2966917",
    "citation": "European Crohn's and Colitis Organisation (ECCO). Third European Evidence-based Consensus on Diagnosis and Management of Ulcerative Colitis. Part 1: Definitions, Diagnosis... J Crohns Colitis. 2017;11(6):649-670. doi:10.1093/ecco-jcc/jjx008 (to verify). Note: therapeutics superseded by 2022 UC guidelines and diagnostics by the 2025 ECCO-ESGAR-ESP-IBUS guideline; remains the ECCO reference for UC definitions/classification.",
    "summary": "Part 1 of the Third ECCO consensus on ulcerative colitis, establishing definitions, diagnostic criteria and disease classification (extent and severity). It remains the standing ECCO reference for UC definitions and severity, although management has been updated by the 2022 UC therapeutics guidelines and diagnostics by the 2025 multi-society guideline.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis",
        "text": "There is no single gold-standard test; the diagnosis of UC rests on clinical features with endoscopic and histological confirmation and exclusion of infective causes.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Disease extent (Montreal)",
        "text": "UC extent should be classified using the Montreal classification (E1 proctitis, E2 left-sided, E3 extensive) to guide treatment and surveillance.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Severity assessment",
        "text": "Disease severity should be graded with validated clinical and endoscopic indices, including the Truelove and Witts criteria to define acute severe colitis.",
        "lineOfTherapy": "diagnosis"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ueg-chronic-pancreatitis-2017",
    "societyId": "ueg",
    "conditionIds": [
      "chronic-pancreatitis"
    ],
    "title": "United European Gastroenterology evidence-based guidelines for the diagnosis and therapy of chronic pancreatitis (HaPanEU)",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2017,
    "status": "current",
    "sourceUrl": "https://onlinelibrary.wiley.com/doi/10.1177/2050640616684695",
    "citation": "Lohr JM, Dominguez-Munoz E, Rosendahl J, et al; HaPanEU/UEG Working Group. United European Gastroenterology evidence-based guidelines for the diagnosis and therapy of chronic pancreatitis (HaPanEU). United European Gastroenterol J. 2017;5(2):153-199. doi:10.1177/2050640616684695",
    "summary": "UEG evidence-based (HaPanEU) guidelines answering 101 clinical questions across 12 domains of chronic pancreatitis, from aetiology and imaging diagnosis to exocrine and endocrine insufficiency, pain management, endoscopic and surgical therapy, nutrition and quality of life. Graded with GRADE and a Delphi consensus process.",
    "keyRecommendations": [
      {
        "topic": "Exocrine insufficiency",
        "text": "Pancreatic exocrine insufficiency should be assessed (e.g., faecal elastase-1) and treated with pancreatic enzyme replacement therapy, with monitoring of nutritional and fat-soluble vitamin status.",
        "lineOfTherapy": "diagnosis",
        "drugs": [
          "pancreatin"
        ]
      },
      {
        "topic": "Pain management",
        "text": "A step-up strategy is recommended for pain: medical therapy, then endoscopic therapy, with surgery considered for painful disease with a dilated duct or inflammatory mass.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Surgery versus endoscopy",
        "text": "Surgery provides superior long-term pain relief compared with endoscopy in obstructive chronic pancreatitis and should not be delayed unduly.",
        "lineOfTherapy": "escalation"
      },
      {
        "topic": "Nutrition",
        "text": "Malnutrition should be screened for and managed with enzyme replacement and dietetic support, using enteral nutrition where supplementation is required.",
        "lineOfTherapy": "supportive"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ueg-eosinophilic-esophagitis-2017",
    "societyId": "ueg",
    "conditionIds": [
      "eosinophilic-esophagitis"
    ],
    "title": "Guidelines on eosinophilic esophagitis: evidence-based statements and recommendations for diagnosis and management in children and adults",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2017,
    "status": "current",
    "sourceUrl": "https://onlinelibrary.wiley.com/doi/10.1177/2050640616689525",
    "citation": "Lucendo AJ, Molina-Infante J, Arias A, et al. Guidelines on eosinophilic esophagitis: evidence-based statements and recommendations for diagnosis and management in children and adults. United European Gastroenterol J. 2017;5(3):335-358. doi:10.1177/2050640616689525 (UEG with ESPGHAN, EAACI, EUREOS)",
    "summary": "UEG-commissioned evidence-based guideline, developed with ESPGHAN, EAACI and EUREOS, on the diagnosis and management of eosinophilic oesophagitis in children and adults. Provides diagnostic criteria and first-line and maintenance treatment options.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis",
        "text": "EoE is diagnosed by symptoms of oesophageal dysfunction plus at least 15 eosinophils per high-power field on biopsy after excluding other causes of oesophageal eosinophilia; PPI-responsive oesophageal eosinophilia is regarded as part of the EoE spectrum.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "First-line therapy",
        "text": "Proton pump inhibitors, swallowed topical corticosteroids and dietary elimination are effective first-line treatments to induce remission.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "proton pump inhibitor",
          "swallowed budesonide",
          "swallowed fluticasone"
        ]
      },
      {
        "topic": "Dilation",
        "text": "Endoscopic dilation is effective for symptomatic strictures and rings in fibrostenotic disease.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Maintenance",
        "text": "Maintenance therapy (topical steroids or dietary) is recommended, particularly in severe or fibrostenotic disease and after dilation, to prevent relapse.",
        "lineOfTherapy": "maintenance"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ueg-igg4-digestive-2020",
    "societyId": "ueg",
    "conditionIds": [
      "igg4-related-digestive-disease"
    ],
    "title": "European Guideline on IgG4-related digestive disease - UEG and SGF evidence-based recommendations",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2020,
    "status": "current",
    "sourceUrl": "https://onlinelibrary.wiley.com/doi/10.1177/2050640620934911",
    "citation": "Lohr JM, Beuers U, Vujasinovic M, et al. European Guideline on IgG4-related digestive disease - UEG and SGF evidence-based recommendations. United European Gastroenterol J. 2020;8(6):637-666. doi:10.1177/2050640620934911 (pages to verify)",
    "summary": "UEG and Swedish Society of Gastroenterology (SGF) evidence-based European guideline on the diagnosis and management of IgG4-related digestive disease, including type 1 autoimmune pancreatitis and IgG4-related cholangitis. Emphasises a comprehensive multi-domain work-up and glucocorticoid-based induction.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis",
        "text": "Diagnosis requires a comprehensive work-up combining histology, organ imaging, serum IgG4, evidence of other-organ involvement and response to glucocorticoids; no single criterion is sufficient.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Induction",
        "text": "Glucocorticoids are first-line to induce remission, typically 0.6-0.8 mg/kg/day prednisolone-equivalent for about one month, then tapered over roughly two further months.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "prednisolone"
        ]
      },
      {
        "topic": "Maintenance and relapse",
        "text": "Maintenance therapy or steroid-sparing immunosuppression (e.g., azathioprine) or rituximab should be considered in multi-organ disease or relapse.",
        "lineOfTherapy": "maintenance",
        "drugs": [
          "azathioprine",
          "rituximab"
        ]
      },
      {
        "topic": "Response assessment",
        "text": "Response should be assessed at 2-4 weeks using clinical, biochemical and morphological (imaging) markers.",
        "lineOfTherapy": "diagnosis"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ueg-chronic-mesenteric-ischaemia-2020",
    "societyId": "ueg",
    "conditionIds": [
      "chronic-mesenteric-ischaemia"
    ],
    "title": "European guidelines on chronic mesenteric ischaemia - joint UEG, EAGEN, ESGAR, CIRSE and partner-society clinical guidelines",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2020,
    "status": "current",
    "sourceUrl": "https://onlinelibrary.wiley.com/doi/10.1177/2050640620916681",
    "citation": "Terlouw LG, Moelker A, Abrahamsen J, et al. European guidelines on chronic mesenteric ischaemia - joint United European Gastroenterology, EAGEN, ESGAR, CIRSE and partner societies clinical guidelines. United European Gastroenterol J. 2020;8(4):371-395. doi:10.1177/2050640620916681",
    "summary": "Multi-society guideline led by UEG (with EAGEN, ESGAR, CIRSE and other partners) on the diagnosis and treatment of chronic mesenteric ischaemia. Promotes multidisciplinary assessment because no single gold-standard diagnostic test exists, and favours revascularisation for symptomatic significant stenosis.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis",
        "text": "Diagnosis relies on the combination of typical symptoms (postprandial pain, weight loss, food fear) and significant mesenteric artery stenosis on CT or MR angiography, ideally confirmed by a multidisciplinary team.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Revascularisation",
        "text": "Symptomatic chronic mesenteric ischaemia with significant stenosis should be revascularised; endovascular therapy (stenting) is generally first-line over open surgery.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Single-vessel disease",
        "text": "Revascularisation may be considered for symptomatic single-vessel (especially superior mesenteric artery) disease within a multidisciplinary decision.",
        "lineOfTherapy": "escalation"
      },
      {
        "topic": "Multidisciplinary care",
        "text": "A dedicated multidisciplinary team is recommended for diagnosis and treatment to reduce progression to acute mesenteric ischaemia.",
        "lineOfTherapy": "supportive"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ueg-functional-dyspepsia-2021",
    "societyId": "ueg",
    "conditionIds": [
      "dyspepsia"
    ],
    "title": "United European Gastroenterology (UEG) and European Society for Neurogastroenterology and Motility (ESNM) consensus on functional dyspepsia",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2021,
    "status": "current",
    "sourceUrl": "https://onlinelibrary.wiley.com/doi/10.1002/ueg2.12061",
    "citation": "Wauters L, Dickman R, Drug V, et al. United European Gastroenterology (UEG) and European Society for Neurogastroenterology and Motility (ESNM) consensus on functional dyspepsia. United European Gastroenterol J. 2021;9(3):307-331. doi:10.1002/ueg2.12061",
    "summary": "UEG and ESNM Delphi consensus on functional dyspepsia, standardising definitions (postprandial distress and epigastric pain syndromes) and setting out a stepwise diagnostic and treatment pathway, including a central role for H. pylori testing and acid suppression.",
    "keyRecommendations": [
      {
        "topic": "Definition and diagnosis",
        "text": "Functional dyspepsia is defined by cardinal symptoms of postprandial fullness, early satiation, and epigastric pain or burning without a structural explanation; Helicobacter pylori testing is recommended.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "H. pylori eradication",
        "text": "A test-and-treat strategy for Helicobacter pylori is recommended, as eradication provides durable symptom relief in a subset of patients.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "H. pylori eradication therapy"
        ]
      },
      {
        "topic": "Acid suppression",
        "text": "Proton pump inhibitors are first-line pharmacotherapy, particularly for epigastric pain syndrome.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "proton pump inhibitor"
        ]
      },
      {
        "topic": "Neuromodulators and prokinetics",
        "text": "Prokinetics and central neuromodulators (e.g., tricyclic antidepressants) are recommended for symptoms refractory to acid suppression.",
        "lineOfTherapy": "second-line",
        "drugs": [
          "tricyclic antidepressant",
          "prokinetic"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ueg-gastroparesis-2021",
    "societyId": "ueg",
    "conditionIds": [
      "gastroparesis"
    ],
    "title": "United European Gastroenterology (UEG) and European Society for Neurogastroenterology and Motility (ESNM) consensus on gastroparesis",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2021,
    "status": "current",
    "sourceUrl": "https://onlinelibrary.wiley.com/doi/10.1002/ueg2.12060",
    "citation": "Schol J, Wauters L, Dickman R, et al. United European Gastroenterology (UEG) and European Society for Neurogastroenterology and Motility (ESNM) consensus on gastroparesis. United European Gastroenterol J. 2021;9(3):287-306. doi:10.1002/ueg2.12060",
    "summary": "UEG and ESNM Delphi consensus on gastroparesis, defining the condition by objectively delayed gastric emptying with compatible symptoms and no mechanical obstruction, and setting out a graded management approach from dietary and glycaemic measures to prokinetics and refractory interventions.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis",
        "text": "Gastroparesis requires objective demonstration of delayed gastric emptying (scintigraphy is the reference standard) with compatible symptoms and exclusion of mechanical obstruction.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "First-line management",
        "text": "Dietary modification (small, low-fat, low-fibre meals) and optimisation of glycaemic control in diabetes are first-line.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Prokinetics and antiemetics",
        "text": "Prokinetic agents are recommended to accelerate gastric emptying and relieve symptoms, with antiemetics for nausea and vomiting.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "metoclopramide",
          "domperidone"
        ]
      },
      {
        "topic": "Refractory disease",
        "text": "Refractory gastroparesis may be considered for gastric electrical stimulation, pyloric-directed therapies (e.g., G-POEM) or enteral nutrition.",
        "lineOfTherapy": "refractory"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ueg-chronic-nausea-vomiting-2025",
    "societyId": "ueg",
    "conditionIds": [
      "chronic-nausea-vomiting"
    ],
    "title": "European Guideline on Chronic Nausea and Vomiting - A UEG and ESNM Consensus for Clinical Management",
    "language": "en",
    "specialty": "gastroenterology",
    "year": 2025,
    "status": "current",
    "sourceUrl": "https://onlinelibrary.wiley.com/doi/full/10.1002/ueg2.12711",
    "citation": "Malagelada C, Keller J, Sifrim D, et al. European Guideline on Chronic Nausea and Vomiting - A UEG and ESNM Consensus for Clinical Management. United European Gastroenterol J. 2025. doi:10.1002/ueg2.12711 (volume/pages to verify)",
    "summary": "UEG and ESNM consensus guideline on the clinical management of chronic nausea and vomiting, providing a structured diagnostic pathway and management recommendations for entities including chronic nausea and vomiting syndrome, cyclic vomiting syndrome and rumination syndrome.",
    "keyRecommendations": [
      {
        "topic": "Diagnostic approach",
        "text": "A systematic work-up should first exclude structural, toxic/drug-induced and metabolic causes; if negative, disorders of gut-brain interaction and gastrointestinal motility should be assessed.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Cyclic vomiting syndrome",
        "text": "Cyclic vomiting syndrome is managed with trigger avoidance and prophylaxis (e.g., tricyclic antidepressants or anti-migraine agents) plus abortive therapy during episodes.",
        "drugs": [
          "amitriptyline"
        ]
      },
      {
        "topic": "Neuromodulation",
        "text": "Central neuromodulators such as tricyclic antidepressants are recommended for chronic nausea and vomiting syndrome refractory to first-line measures.",
        "lineOfTherapy": "second-line",
        "drugs": [
          "tricyclic antidepressant"
        ]
      },
      {
        "topic": "Rumination syndrome",
        "text": "Rumination syndrome is treated primarily with diaphragmatic breathing and behavioural therapy rather than pharmacotherapy.",
        "lineOfTherapy": "first-line"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "era-ckd-associated-pruritus",
    "societyId": "era",
    "conditionIds": ["ckd-associated-pruritus"],
    "title": "ERA Educational Review: Chronic Kidney Disease-Associated Pruritus (CKD-aP)",
    "language": "en",
    "specialty": "nephrology",
    "year": 2025,
    "status": "current",
    "sourceUrl": "https://www.era-online.org/guidelines/",
    "citation": "European Renal Association (ERA) educational review: Chronic kidney disease-associated pruritus (CKD-aP). era-online.org.",
    "summary": "An ERA educational review of chronic kidney disease-associated pruritus (CKD-aP, formerly uraemic pruritus) — a common, under-recognised and undertreated symptom in advanced CKD and haemodialysis that impairs quality of life. It sets out a multimodal, severity-guided approach: routine symptom screening, skin-directed therapy first, gabapentin or pregabalin as the systemic treatment of choice, and selective κ-opioid receptor agonists (difelikefalin, anrikefon) for moderate-to-severe disease.",
    "keyRecommendations": [
      {
        "topic": "Recognition and screening",
        "text": "CKD-aP is highly prevalent in advanced CKD and haemodialysis (moderate-to-severe in roughly a third of HD patients) yet frequently unreported and untreated; screen routinely with a validated itch scale such as the Worst Itching Intensity Numerical Rating Scale.",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "First-line skin-directed therapy",
        "text": "Begin with skin-directed treatment, especially where xerosis coexists: regular emollients to restore the skin barrier, with topical pramoxine or capsaicin for additional relief.",
        "lineOfTherapy": "first-line",
        "drugs": ["emollient", "capsaicin", "pramoxine"]
      },
      {
        "topic": "Systemic pharmacotherapy",
        "text": "Gabapentin or pregabalin are the systemic pharmacological treatments of choice, with dose reduction for renal function and monitoring for neurological effects; conventional antihistamines are not routinely recommended.",
        "lineOfTherapy": "first-line",
        "drugs": ["gabapentin", "pregabalin"]
      },
      {
        "topic": "κ-opioid receptor agonists",
        "text": "For moderate-to-severe CKD-aP, selective κ-opioid receptor agonists — difelikefalin (given intravenously three times weekly with dialysis) and the newer anrikefon — significantly reduce itch intensity and improve itch-related quality of life.",
        "evidenceGrade": "Phase III RCT evidence (KALM-1/KALM-2)",
        "lineOfTherapy": "escalation",
        "drugs": ["difelikefalin", "anrikefon"]
      },
      {
        "topic": "Dialysis and mineral metabolism",
        "text": "Optimise dialysis adequacy and correct calcium-phosphate and mineral disturbances, which may further reduce symptom burden.",
        "lineOfTherapy": "supportive"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "eadv-euroguiderm-atopic-eczema",
    "societyId": "eadv",
    "conditionIds": ["atopic-dermatitis"],
    "title": "EuroGuiDerm Guideline on Atopic Eczema (living guideline)",
    "language": "en",
    "specialty": "dermatology",
    "year": 2025,
    "status": "current",
    "sourceUrl": "https://doi.org/10.1111/jdv.20639",
    "citation": "Wollenberg A, Kinberger M, Arents B, et al. European Guideline (EuroGuiDerm) on atopic eczema — base guideline 2022, living systemic-therapy update 2025. J Eur Acad Dermatol Venereol. doi:10.1111/jdv.20639. EADV / European Dermatology Forum EuroGuiDerm programme. Identified via PubMed.",
    "summary": "The EADV EuroGuiDerm living guideline on atopic eczema (atopic dermatitis), developed with the European Dermatology Forum. Beyond emollients and topical anti-inflammatory therapy, it guides escalation to systemic treatment for moderate-to-severe disease inadequately controlled by topicals, with drug-by-drug recommendations: biologics (dupilumab, tralokinumab, lebrikizumab, nemolizumab), JAK inhibitors (abrocitinib, baricitinib, upadacitinib) and conventional immunosuppressants (ciclosporin, azathioprine, methotrexate, mycophenolate mofetil), plus tailored guidance for paediatric, adolescent, pregnant and breastfeeding patients. The systemic-therapy chapter is living, last updated in 2025.",
    "keyRecommendations": [
      {
        "topic": "Basic and topical therapy",
        "text": "Emollients underpin every stage; topical corticosteroids and topical calcineurin inhibitors control inflammation, including proactive maintenance, with phototherapy an option for more extensive disease.",
        "lineOfTherapy": "first-line",
        "drugs": ["emollients", "corticosteroids", "tacrolimus", "pimecrolimus"]
      },
      {
        "topic": "When to start systemic therapy",
        "text": "Patients with moderate-to-severe atopic eczema not adequately controlled by, or unsuitable for, topical therapy qualify for systemic treatment.",
        "lineOfTherapy": "escalation"
      },
      {
        "topic": "Biologics",
        "text": "Dupilumab and tralokinumab — and the newer lebrikizumab and nemolizumab — are recommended biologic options for moderate-to-severe atopic eczema, with favourable long-term safety.",
        "lineOfTherapy": "escalation",
        "drugs": ["dupilumab", "tralokinumab", "lebrikizumab", "nemolizumab"]
      },
      {
        "topic": "JAK inhibitors",
        "text": "Oral Janus kinase inhibitors — abrocitinib, baricitinib and upadacitinib — are recommended for moderate-to-severe disease, with pre-treatment screening and risk-based monitoring (age, cardiovascular and thrombotic risk).",
        "lineOfTherapy": "escalation",
        "drugs": ["abrocitinib", "baricitinib", "upadacitinib"]
      },
      {
        "topic": "Conventional immunosuppressants",
        "text": "Ciclosporin is the preferred conventional systemic agent; azathioprine, methotrexate and mycophenolate mofetil are alternatives. Systemic glucocorticoids should be limited to short-term crisis control.",
        "lineOfTherapy": "escalation",
        "drugs": ["ciclosporin", "azathioprine", "methotrexate", "mycophenolate mofetil", "glucocorticoids"]
      },
      {
        "topic": "Special populations",
        "text": "Specific recommendations are given for children, adolescents, and pregnant or breastfeeding patients, in whom drug choice and monitoring differ.",
        "lineOfTherapy": "supportive"
      }
    ],
    "lastVerified": "2026-07-19",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "easl-hbv-2025",
    "societyId": "easl",
    "conditionIds": ["chronic-hepatitis-b"],
    "title": "EASL Clinical Practice Guidelines on the Management of Hepatitis B Virus Infection",
    "language": "en",
    "specialty": "hepatology",
    "year": 2025,
    "status": "current",
    "sourceUrl": "https://doi.org/10.1016/j.jhep.2025.03.018",
    "citation": "European Association for the Study of the Liver. EASL Clinical Practice Guidelines on the management of hepatitis B virus infection. J Hepatol. 2025;83(2):502-583. doi:10.1016/j.jhep.2025.03.018. Identified via PubMed.",
    "summary": "Updated EASL guidance on chronic hepatitis B across ten themes — diagnostics, treatment goals and indications, therapeutic options, HCC surveillance, special populations, reactivation prophylaxis, post-transplant care and prevention. It emphasises early diagnosis, viral and host risk stratification, tailored antiviral therapy, and simplified algorithms and vaccination to support global HBV elimination, while discussing emerging biomarkers and evolving definitions of functional cure.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis and risk stratification",
        "text": "Diagnose and stage chronic HBV using HBV DNA, HBeAg status, ALT and fibrosis assessment; stratify risk by viral and host factors to guide treatment and surveillance.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Antiviral therapy",
        "text": "First-line treatment is a high-barrier nucleos(t)ide analogue — entecavir, tenofovir disoproxil or tenofovir alafenamide; pegylated interferon is an option in selected patients.",
        "lineOfTherapy": "first-line",
        "drugs": ["entecavir", "tenofovir", "peginterferon alfa"]
      },
      {
        "topic": "Surveillance and reactivation",
        "text": "Offer hepatocellular carcinoma surveillance to at-risk patients, and give antiviral prophylaxis to prevent HBV reactivation during immunosuppression or chemotherapy.",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Prevention",
        "text": "Vaccination, screening and prevention of mother-to-infant transmission are central to HBV control and elimination targets.",
        "lineOfTherapy": "prevention"
      }
    ],
    "lastVerified": "2026-07-19",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "easl-hcc-2024",
    "societyId": "easl",
    "conditionIds": ["hepatocellular-carcinoma"],
    "title": "EASL Clinical Practice Guidelines on the Management of Hepatocellular Carcinoma",
    "language": "en",
    "specialty": "hepatology",
    "year": 2024,
    "status": "current",
    "sourceUrl": "https://doi.org/10.1016/j.jhep.2024.08.028",
    "citation": "European Association for the Study of the Liver. EASL Clinical Practice Guidelines on the management of hepatocellular carcinoma. J Hepatol. 2025;82(2):315-374. doi:10.1016/j.jhep.2024.08.028. Identified via PubMed.",
    "summary": "Updated EASL guidance on hepatocellular carcinoma — the commonest primary liver cancer — covering risk-based surveillance, standardised imaging diagnosis, and stage-guided treatment spanning surgery, liver transplantation, locoregional and systemic therapy, with expanded roles for minimally invasive surgery, radiation and combination immunotherapy. It stresses multidisciplinary, individualised risk-benefit assessment.",
    "keyRecommendations": [
      {
        "topic": "Surveillance",
        "text": "Provide personalised, risk-based surveillance (typically 6-monthly ultrasound, with or without alpha-fetoprotein) for patients at risk, especially those with cirrhosis.",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Diagnosis",
        "text": "Diagnose HCC using standardised contrast-enhanced imaging criteria (CT or MRI), with biopsy when imaging is inconclusive.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Curative treatment",
        "text": "For early-stage disease, offer resection, ablation or liver transplantation according to tumour burden, liver function and portal pressure.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Advanced disease",
        "text": "For intermediate or advanced HCC, use locoregional therapy (e.g. transarterial chemoembolisation) and systemic therapy, with combination immunotherapy (e.g. atezolizumab plus bevacizumab) a first-line systemic option.",
        "lineOfTherapy": "escalation",
        "drugs": ["atezolizumab", "bevacizumab"]
      }
    ],
    "lastVerified": "2026-07-19",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "esc-hypertension-2024",
    "societyId": "esc",
    "conditionIds": ["hypertension"],
    "title": "2024 ESC Guidelines for the Management of Elevated Blood Pressure and Hypertension",
    "language": "en",
    "specialty": "cardiology",
    "year": 2024,
    "status": "current",
    "sourceUrl": "https://doi.org/10.1093/eurheartj/ehae178",
    "citation": "McEvoy JW, McCarthy CP, Bruno RM, et al. 2024 ESC Guidelines for the management of elevated blood pressure and hypertension. Eur Heart J. 2024;45(38):3912-4018. doi:10.1093/eurheartj/ehae178. Identified via PubMed.",
    "summary": "The 2024 ESC guidelines introduce an 'elevated blood pressure' category (120-139/70-89 mmHg) alongside hypertension (≥140/90 mmHg), and set a general office target of 120-129/70-79 mmHg where tolerated. They emphasise out-of-office confirmation, cardiovascular-risk-based treatment, and prompt combination therapy — typically a renin-angiotensin system blocker with a calcium-channel blocker and/or a thiazide/thiazide-like diuretic — with spironolactone for resistant hypertension.",
    "keyRecommendations": [
      {
        "topic": "Classification and targets",
        "text": "Adopt a new 'elevated blood pressure' category (120-139/70-89 mmHg) and treat to an office systolic target of 120-129 mmHg in most adults when tolerated, with individualised targets in older or frail patients.",
        "evidenceGrade": "Class I",
        "lineOfTherapy": "maintenance"
      },
      {
        "topic": "Diagnosis",
        "text": "Confirm hypertension with out-of-office measurement (home or ambulatory monitoring) wherever possible, and assess overall cardiovascular risk.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Initial therapy",
        "text": "Start most patients on combination therapy — a RAS blocker (ACE inhibitor or ARB) with a calcium-channel blocker and/or a thiazide/thiazide-like diuretic — ideally as a single pill.",
        "lineOfTherapy": "first-line",
        "drugs": ["perindopril", "amlodipine", "indapamide"]
      },
      {
        "topic": "Resistant hypertension",
        "text": "Add spironolactone for resistant hypertension after confirming adherence and excluding secondary causes.",
        "lineOfTherapy": "escalation",
        "drugs": ["spironolactone"]
      }
    ],
    "lastVerified": "2026-07-19",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "esc-atrial-fibrillation-2024",
    "societyId": "esc",
    "conditionIds": ["atrial-fibrillation"],
    "title": "2024 ESC Guidelines for the Management of Atrial Fibrillation (developed with EACTS)",
    "language": "en",
    "specialty": "cardiology",
    "year": 2024,
    "status": "current",
    "sourceUrl": "https://doi.org/10.1093/eurheartj/ehae176",
    "citation": "Van Gelder IC, Rienstra M, Bunting KV, et al. 2024 ESC Guidelines for the management of atrial fibrillation developed in collaboration with the European Association for Cardio-Thoracic Surgery (EACTS). Eur Heart J. 2024;45(36):3314-3414. doi:10.1093/eurheartj/ehae176. Identified via PubMed.",
    "summary": "The 2024 ESC atrial fibrillation guidelines organise care around the AF-CARE pathway: [C] comorbidity and risk-factor management, [A] avoiding stroke and thromboembolism, [R] reducing symptoms with rate and rhythm control, and [E] evaluation and dynamic reassessment. Oral anticoagulation is guided by thromboembolic risk, and catheter ablation has an expanded first-line role for rhythm control in appropriate patients.",
    "keyRecommendations": [
      {
        "topic": "AF-CARE: comorbidity management",
        "text": "Systematically manage comorbidities and risk factors — hypertension, obesity, sleep apnoea, alcohol and diabetes — as a foundation of atrial fibrillation care.",
        "lineOfTherapy": "maintenance"
      },
      {
        "topic": "Stroke prevention",
        "text": "Offer oral anticoagulation — preferably a direct oral anticoagulant — to patients at elevated thromboembolic risk; antiplatelet monotherapy is not recommended for stroke prevention.",
        "lineOfTherapy": "first-line",
        "drugs": ["apixaban", "rivaroxaban", "dabigatran", "edoxaban"]
      },
      {
        "topic": "Rate and rhythm control",
        "text": "Control rate (e.g. with beta-blockers) and offer rhythm control with antiarrhythmic drugs or catheter ablation; ablation is a first-line option for rhythm control in selected patients, especially paroxysmal AF.",
        "lineOfTherapy": "first-line",
        "drugs": ["beta-blocker", "amiodarone"]
      }
    ],
    "lastVerified": "2026-07-19",
    "dataProvenance": "hand-curated-demo"
  }
];
