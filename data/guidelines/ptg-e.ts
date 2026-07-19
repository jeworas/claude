import type { Guideline } from '../../src/lib/types';

/**
 * Polskie Towarzystwo Gastroenterologii (PTG-E) guidelines (wytyczne/rekomendacje).
 * Compiled from published PTG-E guidance; titles/years/links corroborated via web
 * search. Treatment summaries are short original paraphrases for reference only —
 * verify against the source before any clinical use.
 */
export const ptgeGuidelines: Guideline[] = [
  {
    "id": "ptge-wzjg-2023",
    "societyId": "ptg-e",
    "conditionIds": [
      "ulcerative-colitis"
    ],
    "title": "PTG-E Guidelines on the Management of Ulcerative Colitis",
    "titleLocal": "Wytyczne Polskiego Towarzystwa Gastroenterologii i Konsultanta Krajowego w dziedzinie Gastroenterologii dotyczące postępowania z pacjentem z wrzodziejącym zapaleniem jelita grubego",
    "language": "pl",
    "specialty": "gastroenterology",
    "year": 2023,
    "status": "current",
    "sourceUrl": "https://ptg-e.org.pl/wytyczne/wytyczne-polskiego-towarzystwa-gastroenterologii-i-konsultanta-krajowego-w-dziedzinie-gastroenterologii-dotyczace-postepowania-z-pacjentem-z-wrzodziejacym-zapaleniem-jelita-grubego/",
    "pdfUrl": "https://ptg-e.org.pl/wp-content/uploads/2023/09/wytyczne-PL-WZJG-2023-wersja-do-druku.pdf",
    "citation": "Eder P, Łodyga M, Dobrowolska A, et al. Guidelines for the management of ulcerative colitis. Recommendations of the Polish Society of Gastroenterology and the Polish National Consultant in Gastroenterology. Gastroenterology Review (Przegląd Gastroenterologiczny). 2023;18(1):1-42. DOI: 10.5114/pg.2023.125882 (verified via PubMed).",
    "summary": "Comprehensive update of the 2013 Polish recommendations, comprising 49 GRADE-based statements on the diagnosis and pharmacological and surgical treatment of ulcerative colitis in adults. Treatment is stratified by disease extent and severity, using 5-aminosalicylates for mild-to-moderate disease and escalating to corticosteroids, immunomodulators, biologics and small-molecule drugs, with a treat-to-target strategy aiming at clinical and endoscopic remission.",
    "keyRecommendations": [
      {
        "topic": "First-line therapy (mild-to-moderate)",
        "text": "Oral plus topical (rectal) 5-aminosalicylates (mesalazyna) are first-line for induction and maintenance of mild-to-moderate UC; combined oral and rectal dosing is more effective than either alone.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line",
        "drugs": [
          "mesalazyna",
          "sulfasalazyna"
        ]
      },
      {
        "topic": "Steroids for flares",
        "text": "Systemic corticosteroids (or oral budezonid MMX) are used to induce remission in moderate-to-severe flares but must not be used for maintenance; steroid dependence mandates escalation.",
        "lineOfTherapy": "escalation",
        "drugs": [
          "prednizon",
          "budezonid MMX",
          "hydrokortyzon"
        ]
      },
      {
        "topic": "Biologic and small-molecule therapy",
        "text": "Anti-TNF (infliksymab, adalimumab, golimumab), anti-integrin (wedolizumab), anti-IL-12/23 (ustekinumab) and JAK inhibitors (tofacytynib) are recommended for moderate-to-severe or steroid-refractory disease.",
        "lineOfTherapy": "refractory",
        "drugs": [
          "infliksymab",
          "wedolizumab",
          "ustekinumab",
          "tofacytynib"
        ]
      },
      {
        "topic": "Acute severe UC",
        "text": "Acute severe UC requires hospitalization, intravenous corticosteroids, and VTE prophylaxis; rescue therapy with infliksymab or cyclosporine is indicated if no response by day 3, with colectomy as an option.",
        "lineOfTherapy": "escalation",
        "drugs": [
          "metyloprednizolon",
          "infliksymab",
          "cyklosporyna"
        ]
      },
      {
        "topic": "Dysplasia surveillance",
        "text": "Surveillance colonoscopy (preferably with chromoendoscopy) is recommended starting 8 years after diagnosis to detect colorectal dysplasia/cancer, with interval individualized by risk.",
        "lineOfTherapy": "screening"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-crohn-2021",
    "societyId": "ptg-e",
    "conditionIds": [
      "crohns-disease"
    ],
    "title": "PTG-E Guidelines on the Management of Crohn's Disease",
    "titleLocal": "Wytyczne Polskiego Towarzystwa Gastroenterologii i Konsultanta Krajowego w dziedzinie Gastroenterologii dotyczące postępowania z pacjentem z chorobą Leśniowskiego-Crohna",
    "language": "pl",
    "specialty": "gastroenterology",
    "year": 2021,
    "status": "current",
    "sourceUrl": "https://ptg-e.org.pl/wytyczne/wytyczne-ptge-konsultanta-krajowego-w-dziedzinie-gastroenterologii-dotyczace-postepowania-z-pacjentem-z-choroba-lesniowskiego-crohna/",
    "pdfUrl": "https://ptg-e.org.pl/wp-content/uploads/2022/06/Wytyczne_chorba-Crohna_PL-1.pdf",
    "citation": "Łodyga M, Eder P, Gawron-Kiszka M, et al. Guidelines for the management of Crohn's disease. Recommendations of the Polish Society of Gastroenterology and the Polish National Consultant in Gastroenterology. Gastroenterology Review (Przegląd Gastroenterologiczny). 2021;16(4):257-296. DOI: 10.5114/pg.2021.110914 (verified via PubMed).",
    "summary": "Update of the 2012 Polish recommendations, comprising 46 GRADE-based statements on the diagnosis and pharmacological and surgical treatment of Crohn's disease in adults. Management is tailored to disease location, phenotype and prognosis, favouring early introduction of immunosuppression/biologics in high-risk patients and a treat-to-target approach targeting mucosal healing.",
    "keyRecommendations": [
      {
        "topic": "Induction of remission",
        "text": "Ileocaecal or systemic corticosteroids (budezonid for mild ileocaecal disease; conventional steroids for more extensive/severe disease) are used to induce remission; steroids are not suitable for maintenance.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "budezonid",
          "prednizon"
        ]
      },
      {
        "topic": "Biologic therapy",
        "text": "Anti-TNF agents (infliksymab, adalimumab), anti-integrin (wedolizumab) and anti-IL-12/23 (ustekinumab) are recommended for moderate-to-severe, steroid-refractory or steroid-dependent Crohn's disease, with early use in patients with poor prognostic factors.",
        "lineOfTherapy": "escalation",
        "drugs": [
          "infliksymab",
          "adalimumab",
          "wedolizumab",
          "ustekinumab"
        ]
      },
      {
        "topic": "Maintenance immunomodulation",
        "text": "Thiopurines (azatiopryna, merkaptopuryna) or methotrexate maintain remission and are used in combination with anti-TNF to reduce immunogenicity.",
        "lineOfTherapy": "maintenance",
        "drugs": [
          "azatiopryna",
          "merkaptopuryna",
          "metotreksat"
        ]
      },
      {
        "topic": "Perianal fistulizing disease",
        "text": "Complex perianal fistulas require combined medical (anti-TNF, antibiotics) and surgical management (seton drainage), ideally with MRI/EUS assessment.",
        "lineOfTherapy": "refractory",
        "drugs": [
          "infliksymab",
          "metronidazol",
          "cyprofloksacyna"
        ]
      },
      {
        "topic": "Smoking cessation and prophylaxis",
        "text": "Smoking cessation is strongly advised; post-operative recurrence prophylaxis and protective vaccinations before immunosuppression are recommended.",
        "lineOfTherapy": "prevention"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-h-pylori-2023",
    "societyId": "ptg-e",
    "conditionIds": [
      "h-pylori-infection"
    ],
    "title": "PTG-E Guidelines on the Diagnosis and Treatment of Helicobacter pylori Infection",
    "titleLocal": "Diagnostyka i leczenie zakażenia Helicobacter pylori – rekomendacje Grupy Roboczej Polskiego Towarzystwa Gastroenterologii",
    "language": "pl",
    "specialty": "gastroenterology",
    "year": 2023,
    "status": "current",
    "sourceUrl": "https://ptg-e.org.pl/wytyczne/",
    "citation": "Working Group of the Polish Society of Gastroenterology. Diagnostic and therapeutic recommendations on Helicobacter pylori infection (33 statements). Gastroenterology Review (Przegląd Gastroenterologiczny). 2023. Lay summary: Gąsiorowska A. Lekarz POZ. 2023;9(5):251-256. DOI: 10.5114/pg.2023.131998 (verified via PubMed).",
    "summary": "Update of the 2014 recommendations, comprising 33 statements on the routes of infection, clinical consequences, choice of diagnostic tests and pharmacotherapy of Helicobacter pylori, adapted to Polish epidemiology and rising antibiotic resistance. Because clarithromycin resistance in Poland exceeds acceptable thresholds, bismuth quadruple therapy is favoured as empirical first-line treatment.",
    "keyRecommendations": [
      {
        "topic": "First-line eradication",
        "text": "Bismuth quadruple therapy (PPI + bismuth + tetracycline + metronidazole) for 14 days is the preferred empirical first-line regimen given high local clarithromycin resistance.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line",
        "drugs": [
          "cytrynian bizmutu",
          "tetracyklina",
          "metronidazol",
          "inhibitor pompy protonowej"
        ]
      },
      {
        "topic": "Clarithromycin-based therapy",
        "text": "Clarithromycin-containing triple therapy should only be used where susceptibility is confirmed or local resistance is low; if used, it must be given for 14 days with a high-dose PPI.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "klarytromycyna",
          "amoksycylina",
          "inhibitor pompy protonowej"
        ]
      },
      {
        "topic": "Non-invasive diagnosis",
        "text": "Urea breath test or stool antigen test (monoclonal) are recommended for diagnosis and test-of-cure; PPIs should be stopped 2 weeks and antibiotics 4 weeks before testing.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Confirmation of eradication",
        "text": "Eradication success should be confirmed in every patient at least 4 weeks after completing therapy using a non-invasive test.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Treatment failure",
        "text": "After failure, avoid re-using clarithromycin; select a bismuth-based or levofloxacin-based regimen guided where possible by susceptibility testing.",
        "lineOfTherapy": "second-line",
        "drugs": [
          "lewofloksacyna",
          "cytrynian bizmutu",
          "amoksycylina"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-ibs-2018",
    "societyId": "ptg-e",
    "conditionIds": [
      "irritable-bowel-syndrome"
    ],
    "title": "PTG-E Diagnostic and Therapeutic Recommendations for Irritable Bowel Syndrome",
    "titleLocal": "Rekomendacje diagnostyczno-terapeutyczne w zespole jelita nadwrażliwego",
    "language": "pl",
    "specialty": "gastroenterology",
    "year": 2018,
    "status": "current",
    "sourceUrl": "https://ptg-e.org.pl/wytyczne/rekomendacje-diagnostyczno-terapeutyczne-w-zespole-jelita-nadwrazliwego/",
    "pdfUrl": "https://ptg-e.org.pl/wp-content/uploads/2022/03/Wytyczne-IBS-pol-2018.pdf",
    "citation": "Pietrzak A, Skrzydło-Radomańska B, Mulak A, et al. Guidelines on the management of irritable bowel syndrome. Recommendations of the Polish Society of Gastroenterology Working Group. Gastroenterology Review (Przegląd Gastroenterologiczny). 2018;13(4):167-196. DOI: 10.5114/pg.2018.78343 (verified via PubMed).",
    "summary": "Update of the 2008 recommendations, establishing a positive diagnosis of IBS based on Rome IV criteria with a limited set of alarm-directed investigations rather than exhaustive exclusion. Treatment is symptom- and subtype-based (IBS-D, IBS-C, IBS-M), combining dietary modification, gut-directed pharmacotherapy and neuromodulators.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis",
        "text": "IBS should be diagnosed positively using the Rome IV criteria; limited testing (blood count, CRP, coeliac serology, faecal calprotectin, colonoscopy if alarm features) is used to exclude organic disease.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Diet",
        "text": "A diet low in fermentable oligo-, di-, monosaccharides and polyols (low-FODMAP) and soluble fibre supplementation are recommended for symptom control.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "IBS with diarrhoea",
        "text": "Rifaximin and, for symptom relief, loperamide are recommended for IBS-D; eluxadoline may be considered.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "ryfaksymina",
          "loperamid"
        ]
      },
      {
        "topic": "IBS with constipation and pain",
        "text": "Osmotic laxatives, secretagogues (linaklotyd) and antispasmodics (drotaweryna, olejek z mięty pieprzowej) are used; low-dose tricyclic antidepressants or SSRIs act as neuromodulators for refractory pain.",
        "lineOfTherapy": "second-line",
        "drugs": [
          "makrogole",
          "linaklotyd",
          "amitryptylina",
          "olejek miętowy"
        ]
      },
      {
        "topic": "Probiotics and psychotherapy",
        "text": "Selected probiotic strains and psychological therapies (CBT, gut-directed hypnotherapy) may provide benefit in the multidisciplinary management of IBS.",
        "lineOfTherapy": "supportive"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-gerd-2022",
    "societyId": "ptg-e",
    "conditionIds": [
      "gerd",
      "barretts-esophagus"
    ],
    "title": "PTG-E Consensus on Diagnostic and Therapeutic Management of GERD",
    "titleLocal": "Postępowanie diagnostyczno-terapeutyczne w chorobie refluksowej przełyku – konsensus Polskiego Towarzystwa Gastroenterologii",
    "language": "pl",
    "specialty": "gastroenterology",
    "year": 2022,
    "status": "current",
    "sourceUrl": "https://ptg-e.org.pl/en/guidelines/diagnostic-and-therapeutic-management-in-gastroesophageal-reflux-disease-consensus-of-the-polish-society-of-gastroenterology-2022/",
    "pdfUrl": "https://ptg-e.org.pl/wp-content/uploads/2022/07/wytyczne_ptge2022_choroba_refluksowa_przelyku.pdf",
    "citation": "Consensus of the Polish Society of Gastroenterology (PTG-E). Diagnostic and therapeutic management in gastroesophageal reflux disease. Gastroenterology Review (Przegląd Gastroenterologiczny). 2022. (lead author to verify)",
    "summary": "National consensus defining GERD by typical symptoms (heartburn, regurgitation) and providing a structured diagnostic and therapeutic pathway. Proton pump inhibitors are the therapeutic mainstay with defined step-down/exit strategies; prokinetics are not recommended for routine use, and endoscopy/pH-impedance testing are reserved for alarm features or refractory disease.",
    "keyRecommendations": [
      {
        "topic": "Empirical PPI therapy",
        "text": "In patients with typical symptoms and no alarm features, an 8-week course of a standard-dose proton pump inhibitor is recommended as both diagnostic trial and treatment.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line",
        "drugs": [
          "inhibitor pompy protonowej",
          "omeprazol",
          "pantoprazol",
          "esomeprazol"
        ]
      },
      {
        "topic": "Step-down and on-demand therapy",
        "text": "After symptom control, PPIs should be tapered to the lowest effective dose or on-demand use; long-term continuous therapy is reserved for erosive esophagitis, Barrett's esophagus or symptom relapse.",
        "lineOfTherapy": "maintenance"
      },
      {
        "topic": "Endoscopy and alarm features",
        "text": "Upper endoscopy is indicated in patients with alarm symptoms (dysphagia, weight loss, anaemia, bleeding), refractory symptoms, or long-standing disease to screen for Barrett's esophagus.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Refractory GERD",
        "text": "In PPI-refractory symptoms, pH-impedance monitoring and manometry are recommended to confirm the diagnosis before considering add-on therapy or anti-reflux surgery.",
        "lineOfTherapy": "refractory"
      },
      {
        "topic": "Prokinetics and adjuncts",
        "text": "Routine use of prokinetics is not recommended; alginates and lifestyle/weight-reduction measures are useful complementary options.",
        "lineOfTherapy": "supportive",
        "drugs": [
          "alginiany"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-chronic-pancreatitis-2021",
    "societyId": "ptg-e",
    "conditionIds": [
      "chronic-pancreatitis"
    ],
    "title": "PTG-E / Polish Pancreatic Club Recommendations for Chronic Pancreatitis",
    "titleLocal": "Zalecenia diagnostyczne i terapeutyczne w przewlekłym zapaleniu trzustki. Rekomendacje Grupy Roboczej Konsultanta Krajowego w dziedzinie Gastroenterologii i Polskiego Klubu Trzustkowego",
    "language": "pl",
    "specialty": "gastroenterology",
    "year": 2018,
    "status": "current",
    "sourceUrl": "https://ptg-e.org.pl/wytyczne/zalecenia-diagnostyczne-i-terapeutyczne-w-przewleklym-zapaleniu-trzustki-rekomendacje-grupy-roboczej-ptg-e-oraz-pkt/",
    "pdfUrl": "https://ptg-e.org.pl/wp-content/uploads/2022/03/RPG_1_2018.pdf",
    "citation": "Working Group of the Polish National Consultant in Gastroenterology and the Polish Pancreatic Club. Diagnostic and therapeutic recommendations for chronic pancreatitis. Gastroenterology Review (Przegląd Gastroenterologiczny). 2018;13(3):167-181. DOI: 10.5114/pg.2018.78067 (verified via PubMed). (NB: catalog id retains '2021'; current published version is 2018, updating the 2011 recommendations)",
    "summary": "Thirty-four recommendations updating the 2011 Polish document, covering diagnosis of chronic and autoimmune pancreatitis, conservative treatment, management of pain and of exocrine and endocrine insufficiency, endoscopic and surgical therapy, and oncological surveillance. Management emphasizes alcohol and tobacco cessation, pancreatic enzyme replacement and a stepwise approach to pain.",
    "keyRecommendations": [
      {
        "topic": "Risk-factor modification",
        "text": "Complete cessation of alcohol and tobacco use is recommended in all patients to slow disease progression.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Exocrine insufficiency",
        "text": "Pancreatic exocrine insufficiency should be treated with pancreatic enzyme replacement therapy (lipase with meals) plus fat-soluble vitamin supplementation.",
        "lineOfTherapy": "supportive",
        "drugs": [
          "pankreatyna",
          "enzymy trzustkowe"
        ]
      },
      {
        "topic": "Pain management",
        "text": "Pain is managed stepwise from analgesics to endoscopic therapy (pancreatic duct decompression, stones/strictures) and surgery for refractory cases.",
        "lineOfTherapy": "escalation"
      },
      {
        "topic": "Diabetes (type 3c)",
        "text": "Pancreatogenic diabetes should be screened for and treated, often requiring insulin, with attention to hypoglycaemia risk.",
        "lineOfTherapy": "supportive",
        "drugs": [
          "insulina"
        ]
      },
      {
        "topic": "Oncological surveillance",
        "text": "Patients, especially those with hereditary chronic pancreatitis, warrant surveillance for pancreatic adenocarcinoma.",
        "lineOfTherapy": "screening"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-nafld-2019",
    "societyId": "ptg-e",
    "conditionIds": [
      "nafld-masld"
    ],
    "title": "Polish Expert Group Recommendations on Non-Alcoholic Fatty Liver Disease",
    "titleLocal": "Postępowanie z chorymi na niealkoholową stłuszczeniową chorobę wątroby – Zalecenia Polskiej Grupy Ekspertów NAFLD",
    "language": "pl",
    "specialty": "hepatology",
    "year": 2019,
    "status": "current",
    "sourceUrl": "https://ptg-e.org.pl/wytyczne/postepowanie-z-chorymi-na-niealkoholowa-stluszczeniowa-chorobe-watroby-zalecenia-polskiej-grupy-ekspertow-nafld-2019/",
    "citation": "Hartleb M, et al. (Polish Group of Experts on NAFLD, under the auspices of PTG-E). Recommendations for the management of patients with non-alcoholic fatty liver disease. 2019.",
    "summary": "Recommendations of the Polish NAFLD Expert Group defining NAFLD as imaging- or histology-confirmed hepatic steatosis with metabolic risk factors after exclusion of significant alcohol use and other causes. The document stresses the high prevalence and cardiovascular/hepatic mortality burden in Poland and centres management on lifestyle-driven weight loss and control of metabolic comorbidities.",
    "keyRecommendations": [
      {
        "topic": "Lifestyle intervention",
        "text": "Weight reduction of 7-10% through calorie restriction and physical activity is the cornerstone of therapy and can improve steatohepatitis and fibrosis.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Fibrosis risk stratification",
        "text": "Non-invasive fibrosis assessment (e.g. NAFLD Fibrosis Score, FIB-4, transient elastography) should be used to identify patients with advanced fibrosis needing specialist referral.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Metabolic comorbidities",
        "text": "Aggressive management of type 2 diabetes, dyslipidaemia and hypertension is required; statins are safe and indicated for cardiovascular risk reduction.",
        "lineOfTherapy": "supportive",
        "drugs": [
          "statyny"
        ]
      },
      {
        "topic": "Pharmacotherapy of NASH",
        "text": "In biopsy-proven NASH, pioglitazone or vitamin E may be considered in selected non-diabetic/diabetic patients respectively.",
        "lineOfTherapy": "second-line",
        "drugs": [
          "pioglitazon",
          "witamina E"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-cholestatic-2018",
    "societyId": "ptg-e",
    "conditionIds": [
      "cholestatic-liver-disease"
    ],
    "title": "PTG-E Hepatology Section Guidelines on Cholestatic Liver Diseases in Adults",
    "titleLocal": "Choroby cholestatyczne u dorosłych – wytyczne postępowania Sekcji Hepatologicznej Polskiego Towarzystwa Gastroenterologii",
    "language": "pl",
    "specialty": "hepatology",
    "year": 2018,
    "status": "current",
    "sourceUrl": "https://ptg-e.org.pl/wytyczne/hepatologia/",
    "pdfUrl": "https://ptg-e.org.pl/wp-content/uploads/2022/03/Cholestaza.pdf",
    "citation": "Hepatology Section of the Polish Society of Gastroenterology (Hartleb M, Milkiewicz P, et al.). Cholestatic diseases in adults - management guidelines. 2018 (update of the 2013 recommendations). (author list to verify)",
    "summary": "Guidelines of the PTG-E Hepatology Section on cholestatic liver diseases in adults (excluding neoplastic and non-neoplastic large-bile-duct disease), updating the 2013 European-adaptation document. They cover the diagnostic work-up of cholestasis and the management of primary biliary cholangitis, primary sclerosing cholangitis and overlap syndromes.",
    "keyRecommendations": [
      {
        "topic": "Diagnostic work-up",
        "text": "Persistent cholestasis should be evaluated with imaging (ultrasound/MRCP) and antimitochondrial antibodies (AMA); liver biopsy is reserved for uncertain cases or suspected overlap.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Primary biliary cholangitis",
        "text": "Ursodeoxycholic acid (13-15 mg/kg/day) is first-line therapy for PBC; obeticholic acid is second-line for inadequate response or intolerance.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line",
        "drugs": [
          "kwas ursodeoksycholowy",
          "kwas obetycholowy"
        ]
      },
      {
        "topic": "Primary sclerosing cholangitis",
        "text": "No drug clearly alters PSC natural history; management focuses on endoscopic treatment of dominant strictures and surveillance for cholangiocarcinoma and colorectal cancer.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Pruritus",
        "text": "Cholestatic pruritus is treated stepwise with cholestyramine, then rifampicin, naltrexone or sertraline.",
        "lineOfTherapy": "supportive",
        "drugs": [
          "cholestyramina",
          "ryfampicyna",
          "naltrekson"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-liver-biliary-poz-2017",
    "societyId": "ptg-e",
    "conditionIds": [
      "cholelithiasis",
      "nafld-masld"
    ],
    "title": "PTG-E Recommendations on Liver Function Disorders and Gallstone Disease for Primary Care",
    "titleLocal": "Rekomendacje postępowania u chorych z zaburzeniami czynności wątroby i kamicą dróg żółciowych dla lekarzy POZ",
    "language": "pl",
    "specialty": "hepatology",
    "year": 2017,
    "status": "current",
    "sourceUrl": "https://ptg-e.org.pl/wytyczne/hepatologia/",
    "pdfUrl": "http://ptg-e.org.pl/wp-content/uploads/2022/03/LPOZ_Art_30711-10-1.pdf",
    "citation": "Hartleb M, Simon K, Lipiński M, et al. Rekomendacje postępowania u chorych z zaburzeniami czynności wątroby i kamicą dróg żółciowych dla lekarzy POZ. Lekarz POZ. 2017;3(4):225-248.",
    "summary": "Practical recommendations for primary-care physicians on interpreting abnormal liver tests and managing common hepatobiliary problems, including metabolic-associated steatosis, alcoholic liver disease, viral and drug-induced injury, and gallstone disease. They provide a structured algorithm for evaluating elevated aminotransferases/cholestatic enzymes and criteria for specialist referral.",
    "keyRecommendations": [
      {
        "topic": "Abnormal liver tests",
        "text": "Elevated liver enzymes should be evaluated by pattern (hepatocellular vs cholestatic), degree and persistence, with a targeted history, metabolic assessment and abdominal ultrasound.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Asymptomatic gallstones",
        "text": "Asymptomatic gallbladder stones do not generally require cholecystectomy; surgery is indicated for symptomatic disease or complications.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Choledocholithiasis",
        "text": "Suspected common bile duct stones warrant biliary imaging and ERCP-based clearance; cholangitis requires urgent biliary drainage and antibiotics.",
        "lineOfTherapy": "escalation"
      },
      {
        "topic": "Referral criteria",
        "text": "Referral is recommended for jaundice, signs of cirrhosis/portal hypertension, markedly elevated enzymes, or unexplained persistent abnormalities.",
        "lineOfTherapy": "diagnosis"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-pancreatic-cancer-2019",
    "societyId": "ptg-e",
    "conditionIds": [
      "pancreatic-ductal-adenocarcinoma"
    ],
    "title": "Polish Pancreatic Club Recommendations for Pancreatic Ductal Adenocarcinoma",
    "titleLocal": "Zalecenia diagnostyczne i terapeutyczne w gruczolakoraku przewodowym trzustki – rekomendacje Grupy Roboczej Polskiego Klubu Trzustkowego",
    "language": "pl",
    "specialty": "gastroenterology",
    "year": 2019,
    "status": "current",
    "sourceUrl": "https://ptg-e.org.pl/wytyczne/diagnostic-and-therapeutic-recommendations-in-pancreatic-ductal-adenocarcinoma-recommendations-of-the-working-group-of-the-polish-pancreatic-club/",
    "citation": "Working Group of the Polish Pancreatic Club. Diagnostic and therapeutic recommendations in pancreatic ductal adenocarcinoma. Gastroenterology Review (Przegląd Gastroenterologiczny). 2019. DOI: 10.5114/pg.2019.83422 (verified via PubMed).",
    "summary": "Recommendations of the Polish Pancreatic Club on the diagnosis and multidisciplinary treatment of pancreatic ductal adenocarcinoma. Management requires a multidisciplinary team, with resectability-based stratification determining upfront surgery versus neoadjuvant chemotherapy, and defined roles for adjuvant chemotherapy and palliative care.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis and staging",
        "text": "Contrast-enhanced pancreatic-protocol CT (with EUS and biopsy where needed) is recommended for diagnosis and resectability assessment within a multidisciplinary team.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Resectable disease",
        "text": "Upfront surgical resection is the treatment of choice for resectable tumours; routine neoadjuvant therapy is not recommended but may be considered in selected cases.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Borderline resectable disease",
        "text": "Borderline resectable tumours should be considered for neoadjuvant chemotherapy (e.g. FOLFIRINOX or gemcitabine-based) before re-evaluation for surgery.",
        "lineOfTherapy": "escalation",
        "drugs": [
          "FOLFIRINOX",
          "gemcytabina",
          "nab-paklitaksel"
        ]
      },
      {
        "topic": "Adjuvant and palliative care",
        "text": "Adjuvant chemotherapy is recommended after resection; biliary/duodenal stenting, pain control and enzyme replacement are key in palliation.",
        "lineOfTherapy": "supportive",
        "drugs": [
          "gemcytabina",
          "kapecytabina"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-acute-pancreatitis-2016",
    "societyId": "ptg-e",
    "conditionIds": [
      "acute-pancreatitis"
    ],
    "title": "Polish Pancreatic Club Recommendations on the Management of Acute Pancreatitis",
    "titleLocal": "Postępowanie w ostrym zapaleniu trzustki – rekomendacje Polskiego Klubu Trzustkowego",
    "language": "pl",
    "specialty": "gastroenterology",
    "year": 2016,
    "status": "current",
    "sourceUrl": "https://ptg-e.org.pl/wytyczne/pankreatologia/",
    "pdfUrl": "https://www.termedia.pl/Management-of-acute-pancreatitis-AP-Polish-Pancreatic-Club-recommendations,41,27681,1,1.html",
    "citation": "Rosołowski M, Lipiński M, Dobosz M, et al. Management of acute pancreatitis (AP) - Polish Pancreatic Club recommendations. Gastroenterology Review (Przegląd Gastroenterologiczny). 2016;11(2):65-72. DOI: 10.5114/pg.2016.60251 (verified via PubMed).",
    "summary": "Recommendations of the Polish Pancreatic Club on the diagnosis and treatment of the early and late phases of acute pancreatitis and its complications, based on the revised Atlanta classification and largely concordant with IAP guidance. They emphasize early aggressive fluid resuscitation, severity assessment, and a step-up, delayed approach to intervention for necrosis.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis",
        "text": "Acute pancreatitis is diagnosed when at least two of three criteria are met: typical abdominal pain, amylase/lipase >3x upper limit of normal, and characteristic imaging findings.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Early fluid resuscitation",
        "text": "Early goal-directed intravenous fluid therapy (crystalloids) is recommended in the first 24 hours, with monitoring of severity and organ function.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Nutrition and antibiotics",
        "text": "Early enteral nutrition is preferred over parenteral; prophylactic antibiotics are not recommended in sterile necrosis.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Biliary and interventional management",
        "text": "Urgent ERCP is indicated in acute biliary pancreatitis with cholangitis; intervention for (peri)pancreatic necrosis should be delayed and use a minimally invasive step-up approach.",
        "lineOfTherapy": "escalation"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-pancreatic-cystic-tumors-2025",
    "societyId": "ptg-e",
    "conditionIds": [
      "pancreatic-cystic-lesions"
    ],
    "title": "Polish Pancreatic Club Guidelines on Pancreatic Cystic Tumors",
    "titleLocal": "Zalecenia diagnostyczno-terapeutyczne w torbielowatych guzach trzustki – rekomendacje ekspertów Polskiego Klubu Trzustkowego",
    "language": "pl",
    "specialty": "gastroenterology",
    "year": 2025,
    "status": "current",
    "sourceUrl": "https://www.termedia.pl/Diagnostic-and-therapeutic-guidelines-for-pancreatic-cystic-tumors-recommendations-of-Polish-Pancreatic-Club-experts,41,56822,1,1.html",
    "citation": "Durko Ł, Lipiński M, Adrych K, Daniluk J, Dąbrowski A, et al. Diagnostic and therapeutic guidelines for pancreatic cystic tumors: recommendations of Polish Pancreatic Club experts. Gastroenterology Review (Przegląd Gastroenterologiczny). 2025;20(3):223-240. DOI: 10.5114/pg.2025.154686 (verified via PubMed).",
    "summary": "Expert recommendations of the Polish Pancreatic Club on the diagnosis, treatment and surveillance of pancreatic cystic tumours, whose variable malignant potential requires careful risk stratification. The document guides differentiation of mucinous (IPMN, MCN) from non-mucinous cysts and defines high-risk stigmata and worrisome features indicating surgery versus surveillance.",
    "keyRecommendations": [
      {
        "topic": "Characterization",
        "text": "MRI/MRCP and EUS (with cyst-fluid analysis when indicated) are recommended to classify cyst type and detect features of malignancy.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Indications for surgery",
        "text": "Resection is recommended for cysts with high-risk stigmata (obstructive jaundice, enhancing mural nodule >=5 mm, main pancreatic duct >=10 mm) or main-duct IPMN.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "escalation"
      },
      {
        "topic": "Surveillance",
        "text": "Branch-duct IPMN and other low-risk cysts without worrisome features should undergo size- and feature-based imaging surveillance rather than resection.",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Multidisciplinary decision",
        "text": "Management decisions should be made within a multidisciplinary team, weighing malignancy risk against surgical morbidity and patient comorbidity/life expectancy.",
        "lineOfTherapy": "supportive"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-pancreatic-fluid-collections-2025",
    "societyId": "ptg-e",
    "conditionIds": [
      "pancreatic-fluid-collections",
      "acute-pancreatitis",
      "chronic-pancreatitis"
    ],
    "title": "Guidelines on Endoscopic Treatment of Postinflammatory Pancreatic and Peripancreatic Fluid Collections",
    "titleLocal": "Wytyczne leczenia endoskopowego pozapalnych zbiorników płynowych trzustki i okolicy trzustki",
    "language": "pl",
    "specialty": "gastroenterology",
    "year": 2025,
    "status": "current",
    "sourceUrl": "https://ptg-e.org.pl/wp-content/uploads/2026/03/Jagielski_guidelines.pdf",
    "pdfUrl": "https://ptg-e.org.pl/wp-content/uploads/2026/03/Jagielski_guidelines.pdf",
    "citation": "Jagielski M, et al. Guidelines for endoscopic treatment of postinflammatory pancreatic and peripancreatic fluid collections. Recommendations of the Endoscopy Section of the Polish Society of Gastroenterology, the Polish Pancreatic Club and Sections of the Association of Polish Surgeons. Videosurgery and Other Miniinvasive Techniques. Published online 29 Dec 2025.",
    "summary": "Multi-society guidelines (including the PTG-E Endoscopy Section and the Polish Pancreatic Club) on the endoscopic management of postinflammatory pancreatic and peripancreatic fluid collections. Intervention is limited to symptomatic collections and deferred until encapsulation (and liquefaction of necrosis, usually after ~4 weeks), with EUS-guided transmural drainage as the mainstay.",
    "keyRecommendations": [
      {
        "topic": "Indication for intervention",
        "text": "Treatment is indicated only in patients with collection-related clinical symptoms; asymptomatic collections should be observed.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Timing",
        "text": "Interventional treatment should be deferred until collection encapsulation, and for necrotizing pancreatitis until content liquefaction, typically about 4 weeks after onset.",
        "lineOfTherapy": "escalation"
      },
      {
        "topic": "Preferred technique",
        "text": "EUS-guided transmural drainage is the mainstay of endoscopic treatment, using plastic or lumen-apposing metal stents.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "stent LAMS",
          "stent plastikowy"
        ]
      },
      {
        "topic": "Walled-off necrosis",
        "text": "For walled-off necrosis, a step-up strategy with endoscopic necrosectomy may be required when transmural drainage alone is insufficient.",
        "lineOfTherapy": "escalation"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-clinical-nutrition-2025",
    "societyId": "ptg-e",
    "conditionIds": [
      "malnutrition",
      "crohns-disease",
      "ulcerative-colitis",
      "chronic-pancreatitis"
    ],
    "title": "PTG-E Guidelines on Clinical Nutrition in Gastrointestinal Diseases",
    "titleLocal": "Żywienie kliniczne w chorobach przewodu pokarmowego – aktualne wytyczne praktyki klinicznej. Zalecenia Sekcji Żywienia Klinicznego i Metabolizmu Polskiego Towarzystwa Gastroenterologii",
    "language": "pl",
    "specialty": "gastroenterology",
    "year": 2025,
    "status": "current",
    "sourceUrl": "https://ptg-e.org.pl/wytyczne/",
    "pdfUrl": "https://ptg-e.org.pl/wp-content/uploads/2025/06/Zalecenia_Sekcji_Zywienia_Klinicznego_i_Metabolizmu.pdf",
    "citation": "Section of Clinical Nutrition and Metabolism of the Polish Society of Gastroenterology. Clinical nutrition in gastrointestinal diseases: up-to-date clinical practice guidelines (67 statements). Gastroenterology Review (Przegląd Gastroenterologiczny). 2025.",
    "summary": "Sixty-seven consensus statements from the PTG-E Section of Clinical Nutrition and Metabolism providing evidence-based, practical guidance on nutritional assessment and intervention across gastrointestinal disease. They emphasize systematic screening for malnutrition and individualized enteral and parenteral nutrition in inflammatory bowel disease, pancreatitis and liver disease.",
    "keyRecommendations": [
      {
        "topic": "Nutritional screening",
        "text": "All patients with gastrointestinal disease should be systematically screened for malnutrition (e.g. NRS-2002) with formal nutritional assessment when at risk.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Route of nutrition",
        "text": "The enteral route is preferred whenever the gut is functional; parenteral nutrition is reserved for intestinal failure or when enteral intake is insufficient/unsafe.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "IBD",
        "text": "Exclusive enteral nutrition is recommended to induce remission in paediatric Crohn's disease and as nutritional support in adults; micronutrient deficiencies (iron, B12, vitamin D) should be corrected.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Pancreatic and liver disease",
        "text": "Early enteral nutrition is advised in acute pancreatitis, and adequate protein/energy intake with attention to sarcopenia is recommended in cirrhosis.",
        "lineOfTherapy": "supportive"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-microscopic-colitis-2025",
    "societyId": "ptg-e",
    "conditionIds": [
      "microscopic-colitis"
    ],
    "title": "PTG-E Expert Position on Diagnosis and Treatment of Microscopic Colitis",
    "titleLocal": "Diagnostyka i leczenie mikroskopowego zapalenia jelita grubego – stanowisko ekspertów Polskiego Towarzystwa Gastroenterologii",
    "language": "pl",
    "specialty": "gastroenterology",
    "year": 2025,
    "status": "current",
    "sourceUrl": "https://www.termedia.pl/Diagnostyka-i-leczenie-mikroskopowego-zapalenia-jelita-grubego-stanowisko-ekspertow-Polskiego-Towarzystwa-Gastroenterologii,98,57408,0,0.html",
    "citation": "Expert position of the Polish Society of Gastroenterology (lay summary: Bielski A, et al.). Diagnosis and treatment of microscopic colitis. Lekarz POZ. 2025;9(6):375ff. (primary publication venue to verify)",
    "summary": "Expert position statement of the Polish Society of Gastroenterology on microscopic colitis, a common cause of chronic non-bloody watery diarrhoea, especially in older women. It defines the three subtypes (collagenous, lymphocytic and incomplete), the requirement for histopathological diagnosis from a macroscopically normal colon, and a budesonide-centred treatment pathway.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis",
        "text": "Diagnosis requires colonoscopy with biopsies from multiple colonic segments (including the right colon) because the mucosa appears macroscopically normal; histology defines the subtype.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Trigger removal",
        "text": "Smoking cessation and withdrawal of associated drugs (PPIs, NSAIDs, SSRIs) are recommended as initial measures.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Induction therapy",
        "text": "Oral budesonide is the recommended first-line therapy to induce remission, with a defined tapering course.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "first-line",
        "drugs": [
          "budezonid"
        ]
      },
      {
        "topic": "Refractory disease",
        "text": "For budesonide-refractory or budesonide-dependent disease, thiopurines, anti-TNF agents or vedolizumab may be considered.",
        "lineOfTherapy": "refractory",
        "drugs": [
          "azatiopryna",
          "infliksymab",
          "wedolizumab"
        ]
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-gerd-primary-care-2019",
    "societyId": "ptg-e",
    "conditionIds": [
      "gerd"
    ],
    "title": "PTG-E Recommendations on GERD Symptoms for Family Physicians",
    "titleLocal": "Postępowanie u pacjentów z objawami choroby refluksowej przełyku – rekomendacje dla lekarzy rodzinnych",
    "language": "pl",
    "specialty": "gastroenterology",
    "year": 2019,
    "status": "current",
    "sourceUrl": "https://ptg-e.org.pl/wytyczne/postepowanie-u-pacjentow-z-objawami-choroby-refluksowej-przelyku-rekomendacje-dla-lekarzy-rodzinnych/",
    "pdfUrl": "https://ptg-e.org.pl/wp-content/uploads/2022/03/rekomendacje_GERD_2019_LPOZ.pdf",
    "citation": "Recommendations for family physicians on the management of patients with gastroesophageal reflux disease symptoms (under the auspices of PTG-E). Lekarz POZ. 2019;5(3-4):245ff.",
    "summary": "Primary-care-oriented PTG-E recommendations providing a simplified pathway for recognizing and treating GERD symptoms in family practice, complementary to the 2022 specialist consensus. They define when empirical PPI therapy is appropriate and which alarm features mandate referral for endoscopy.",
    "keyRecommendations": [
      {
        "topic": "Empirical treatment",
        "text": "In patients with typical reflux symptoms and no alarm features, a family physician may start an empirical proton pump inhibitor trial without initial endoscopy.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "inhibitor pompy protonowej"
        ]
      },
      {
        "topic": "Alarm features",
        "text": "Dysphagia, odynophagia, weight loss, anaemia, gastrointestinal bleeding or age with new symptoms require prompt referral for endoscopy.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Lifestyle measures",
        "text": "Weight reduction, head-of-bed elevation and avoidance of triggers are recommended alongside pharmacotherapy.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "Referral for refractory symptoms",
        "text": "Patients not responding to adequate PPI therapy should be referred to a gastroenterologist for further evaluation.",
        "lineOfTherapy": "refractory"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-ibd-primary-care-2017",
    "societyId": "ptg-e",
    "conditionIds": [
      "crohns-disease",
      "ulcerative-colitis"
    ],
    "title": "PTG-E Guidelines on IBD Management in Family Medicine Practice",
    "titleLocal": "Wytyczne postępowania z chorymi na nieswoiste choroby zapalne jelit w praktyce lekarza rodzinnego",
    "language": "pl",
    "specialty": "gastroenterology",
    "year": 2017,
    "status": "current",
    "sourceUrl": "https://ptg-e.org.pl/wytyczne/wytyczne-postepowania-z-chorymi-na-nieswoiste-choroby-zapalne-jelit-w-praktyce-lekarza-rodzinnego-2017/",
    "pdfUrl": "https://ptg-e.org.pl/wp-content/uploads/2022/03/LPOZ_Art_29565-10.pdf",
    "citation": "Guidelines for the management of patients with inflammatory bowel disease in family medicine practice (under the auspices of PTG-E). Lekarz POZ. 2017.",
    "summary": "Practical PTG-E guidance for family physicians co-managing patients with ulcerative colitis and Crohn's disease, covering recognition of symptoms and flares, monitoring during immunosuppression, and coordination with gastroenterology. It emphasizes early referral, infection/vaccination management and recognition of complications and extraintestinal manifestations.",
    "keyRecommendations": [
      {
        "topic": "Recognition and referral",
        "text": "Chronic diarrhoea, rectal bleeding, abdominal pain or weight loss should prompt evaluation (including faecal calprotectin) and referral to exclude or confirm IBD.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Monitoring on therapy",
        "text": "Patients on immunosuppressants or biologics require monitoring for infections, myelotoxicity and hepatotoxicity in cooperation with the specialist.",
        "lineOfTherapy": "maintenance"
      },
      {
        "topic": "Vaccination and infection prevention",
        "text": "Vaccination status should be reviewed and updated before/ during immunosuppression, avoiding live vaccines in immunosuppressed patients.",
        "lineOfTherapy": "prevention"
      },
      {
        "topic": "Flare and complication awareness",
        "text": "Family physicians should recognize acute severe flares and complications (obstruction, abscess, toxic megacolon) requiring urgent specialist/hospital care.",
        "lineOfTherapy": "escalation"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-diverticular-2015",
    "societyId": "ptg-e",
    "conditionIds": [
      "diverticular-disease"
    ],
    "title": "Polish Interdisciplinary Consensus on Diverticular Disease of the Colon",
    "titleLocal": "Polski konsensus interdyscyplinarny dotyczący diagnostyki i leczenia choroby uchyłkowej okrężnicy",
    "language": "pl",
    "specialty": "gastroenterology",
    "year": 2015,
    "status": "current",
    "sourceUrl": "https://ptg-e.org.pl/wytyczne/diagnostyka-i-leczenie-choroby-uchylkowej-okreznicy-2015/",
    "citation": "Pietrzak A, Bartnik W, Szczepkowski M, et al. Polish interdisciplinary consensus on the diagnosis and treatment of diverticular disease of the colon (Polish Society of Gastroenterology and Association of Polish Surgeons). Gastroenterologia Kliniczna. 2015;7(1):1-19. (author order to verify)",
    "summary": "Interdisciplinary consensus of the Polish Society of Gastroenterology and the Association of Polish Surgeons on the diagnosis and conservative and surgical treatment of colonic diverticular disease. It distinguishes asymptomatic diverticulosis, symptomatic uncomplicated disease and acute diverticulitis, and reserves surgery mainly for complicated or recurrent disease.",
    "keyRecommendations": [
      {
        "topic": "Diagnosis",
        "text": "CT is the imaging modality of choice in acute diverticulitis; colonoscopy is deferred until after resolution to exclude neoplasia.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Symptomatic uncomplicated disease",
        "text": "A high-fibre diet, and selectively rifaximin and/or mesalazine, may be used to reduce symptoms in symptomatic uncomplicated diverticular disease.",
        "lineOfTherapy": "first-line",
        "drugs": [
          "ryfaksymina",
          "mesalazyna",
          "błonnik"
        ]
      },
      {
        "topic": "Acute uncomplicated diverticulitis",
        "text": "Selected patients with uncomplicated acute diverticulitis can be managed conservatively, with antibiotics used according to severity rather than routinely.",
        "lineOfTherapy": "supportive",
        "drugs": [
          "antybiotyki"
        ]
      },
      {
        "topic": "Surgery",
        "text": "Surgical treatment should be limited to complicated diverticulitis (abscess, perforation, fistula, obstruction) or selected recurrent disease.",
        "lineOfTherapy": "escalation"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-colonoscopy-surveillance-2011",
    "societyId": "ptg-e",
    "conditionIds": [
      "colorectal-polyps",
      "colorectal-cancer"
    ],
    "title": "PTG-E Guidelines on Colonoscopic Surveillance After Polypectomy",
    "titleLocal": "Wytyczne Polskiego Towarzystwa Gastroenterologii dotyczące nadzoru kolonoskopowego po polipektomii – adaptacja wytycznych europejskich",
    "language": "pl",
    "specialty": "gastroenterology",
    "year": 2011,
    "status": "current",
    "sourceUrl": "https://ptg-e.org.pl/wytyczne/endoskopia/",
    "citation": "Kamiński MF, Regula J, Bartnik W, et al. Polish Society of Gastroenterology guidelines on colonoscopic surveillance after polypectomy - adaptation of European guidelines. Gastroenterologia Kliniczna. 2011. (URL to verify)",
    "summary": "Polish adaptation of European guidelines defining risk-stratified colonoscopic surveillance intervals after polypectomy. Surveillance is offered to patients with at least one adenoma completely removed at a high-quality baseline colonoscopy, with intervals based on adenoma number, size and histology.",
    "keyRecommendations": [
      {
        "topic": "Baseline quality",
        "text": "Surveillance recommendations apply only after a complete, high-quality baseline colonoscopy with complete polyp removal.",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Low-risk adenomas",
        "text": "Patients with 1-2 small (<10 mm) tubular adenomas with low-grade dysplasia are low-risk and generally do not need short-interval surveillance.",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "High-risk adenomas",
        "text": "Patients with >=3 adenomas, any adenoma >=10 mm, villous histology or high-grade dysplasia should undergo surveillance colonoscopy at a shorter interval (about 3 years).",
        "lineOfTherapy": "screening"
      },
      {
        "topic": "Return to screening",
        "text": "After normal surveillance findings, patients can return to standard population screening intervals.",
        "lineOfTherapy": "screening"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-ugib-2008",
    "societyId": "ptg-e",
    "conditionIds": [
      "upper-gi-bleeding"
    ],
    "title": "PTG-E Guidelines on Non-Variceal Upper Gastrointestinal Bleeding",
    "titleLocal": "Wytyczne postępowania w krwawieniu z górnego odcinka przewodu pokarmowego pochodzenia nieżylakowego",
    "language": "pl",
    "specialty": "gastroenterology",
    "year": 2008,
    "status": "current",
    "sourceUrl": "https://ptg-e.org.pl/wytyczne/choroby-gopp/",
    "pdfUrl": "https://ptg-e.org.pl/wp-content/uploads/2022/03/PG_Art_9988-1.pdf",
    "citation": "Marek T, et al. Guidelines for the management of non-variceal upper gastrointestinal bleeding. Przegląd Gastroenterologiczny. 2008;3(1). (oldest guideline in the catalog; endoscopic aspects later complemented by ESGE translations)",
    "summary": "Polish Society of Gastroenterology guidelines on the management of non-variceal upper gastrointestinal bleeding, emphasizing resuscitation, risk stratification, early endoscopy and acid suppression. They recommend treatment in centres with 24-hour endoscopic capability and endoscopic haemostasis for high-risk stigmata.",
    "keyRecommendations": [
      {
        "topic": "Resuscitation and risk scoring",
        "text": "Initial haemodynamic resuscitation and risk stratification (e.g. Rockall/Blatchford) should precede or accompany endoscopy.",
        "lineOfTherapy": "first-line"
      },
      {
        "topic": "Early endoscopy",
        "text": "Upper endoscopy within 24 hours is recommended for diagnosis and treatment; high-risk ulcers (active bleeding, visible vessel) warrant endoscopic haemostasis, ideally with combination therapy.",
        "evidenceGrade": "strong",
        "lineOfTherapy": "escalation"
      },
      {
        "topic": "Acid suppression",
        "text": "High-dose intravenous proton pump inhibitor therapy is recommended after endoscopic haemostasis of peptic ulcer bleeding.",
        "lineOfTherapy": "supportive",
        "drugs": [
          "inhibitor pompy protonowej",
          "omeprazol",
          "pantoprazol"
        ]
      },
      {
        "topic": "Rebleeding definition and management",
        "text": "Rebleeding (recurrent symptoms with haemodynamic instability and/or haemoglobin drop >=2 g/dl within 24 h) should prompt repeat endoscopy, with surgery/embolization if it fails.",
        "lineOfTherapy": "refractory"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  },
  {
    "id": "ptge-antithrombotic-endoscopy-2012",
    "societyId": "ptg-e",
    "conditionIds": [
      "upper-gi-bleeding"
    ],
    "title": "PTG-E Guidelines on GI Endoscopy in Patients on Antiplatelet and Anticoagulant Therapy",
    "titleLocal": "Endoskopia przewodu pokarmowego u chorych przyjmujących leki przeciwpłytkowe i przeciwzakrzepowe – wytyczne PTG-E i Konsultanta Krajowego",
    "language": "pl",
    "specialty": "gastroenterology",
    "year": 2012,
    "status": "current",
    "sourceUrl": "https://ptg-e.org.pl/wytyczne/endoskopia/",
    "citation": "Working Group of the Polish Society of Gastroenterology and the National Consultant in Gastroenterology. Gastrointestinal endoscopy in patients receiving antiplatelet and anticoagulant therapy. 2012. (URL to verify)",
    "summary": "PTG-E guidance, concordant with ESGE, on managing antiplatelet and anticoagulant drugs around gastrointestinal endoscopy, balancing procedural bleeding risk against thrombotic risk. It classifies procedures as low- or high-bleeding-risk and stratifies patients by thromboembolic risk to decide whether antithrombotics are continued, withheld or bridged.",
    "keyRecommendations": [
      {
        "topic": "Procedure bleeding risk",
        "text": "Diagnostic endoscopy with or without biopsy is low-risk, whereas polypectomy, EMR/ESD, sphincterotomy, ampullectomy, dilation, PEG and EUS-FNA are high-risk for bleeding.",
        "lineOfTherapy": "diagnosis"
      },
      {
        "topic": "Low-risk procedures",
        "text": "Antiplatelet and anticoagulant therapy can generally be continued for low-bleeding-risk procedures.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "High-risk procedures, low thrombotic risk",
        "text": "For high-bleeding-risk procedures in patients at low thrombotic risk, antithrombotic agents should be temporarily withheld before the procedure.",
        "lineOfTherapy": "supportive"
      },
      {
        "topic": "High-risk procedures, high thrombotic risk",
        "text": "In patients at high thrombotic risk undergoing high-bleeding-risk procedures, management should be individualized, potentially with bridging and multidisciplinary consultation.",
        "lineOfTherapy": "supportive"
      }
    ],
    "lastVerified": "2026-07-18",
    "dataProvenance": "hand-curated-demo"
  }
];
