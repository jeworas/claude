import type { Condition } from '../src/lib/types';

/**
 * The bilingual condition thesaurus — the heart of cross-language search.
 * Names and synonyms match by normalized substring in either language;
 * abbreviations match as exact tokens. Covers the full ACG, PTG-E, ECCO and UEG
 * catalogs (US + PL + EU).
 */
export const conditions: Condition[] = [
  {
    "id": "ulcerative-colitis",
    "nameEn": "Ulcerative colitis",
    "namePl": "Wrzodziejące zapalenie jelita grubego",
    "synonymsEn": [
      "colitis ulcerosa",
      "ulcerative proctitis",
      "inflammatory bowel disease"
    ],
    "synonymsPl": [
      "nieswoiste zapalenia jelit",
      "zapalenie wrzodziejące jelita"
    ],
    "abbreviations": [
      "UC",
      "WZJG",
      "IBD",
      "NZJ"
    ],
    "icd10": [
      "K51"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "crohns-disease",
    "nameEn": "Crohn's disease",
    "namePl": "Choroba Leśniowskiego-Crohna",
    "synonymsEn": [
      "Crohn's colitis",
      "Crohn disease",
      "regional enteritis",
      "terminal ileitis",
      "inflammatory bowel disease"
    ],
    "synonymsPl": [
      "choroba Crohna",
      "nieswoiste zapalenia jelit"
    ],
    "abbreviations": [
      "CD",
      "ChLC",
      "IBD",
      "NZJ"
    ],
    "icd10": [
      "K50"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "c-difficile-infection",
    "nameEn": "Clostridioides difficile infection",
    "namePl": "Zakażenie Clostridioides difficile",
    "synonymsEn": [
      "C. diff",
      "Clostridium difficile",
      "pseudomembranous colitis",
      "C. difficile colitis",
      "antibiotic-associated diarrhea"
    ],
    "synonymsPl": [
      "rzekomobłoniaste zapalenie jelita grubego",
      "biegunka poantybiotykowa",
      "zakażenie Clostridium difficile"
    ],
    "abbreviations": [
      "CDI"
    ],
    "icd10": [
      "A04.7"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "microscopic-colitis",
    "nameEn": "Microscopic colitis",
    "namePl": "Mikroskopowe zapalenie jelita grubego",
    "synonymsEn": [
      "collagenous colitis",
      "lymphocytic colitis"
    ],
    "synonymsPl": [
      "kolagenowe zapalenie jelita grubego",
      "limfocytarne zapalenie jelita grubego"
    ],
    "abbreviations": [
      "MC"
    ],
    "icd10": [
      "K52.8"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "gerd",
    "nameEn": "Gastroesophageal reflux disease",
    "namePl": "Choroba refluksowa przełyku",
    "synonymsEn": [
      "acid reflux",
      "reflux disease",
      "heartburn",
      "reflux esophagitis"
    ],
    "synonymsPl": [
      "refluks żołądkowo-przełykowy",
      "zgaga",
      "refluksowe zapalenie przełyku",
      "refluks"
    ],
    "abbreviations": [
      "GERD",
      "GORD",
      "ChRP"
    ],
    "icd10": [
      "K21"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "h-pylori-infection",
    "nameEn": "Helicobacter pylori infection",
    "namePl": "Zakażenie Helicobacter pylori",
    "synonymsEn": [
      "H. pylori",
      "Helicobacter infection"
    ],
    "synonymsPl": [
      "eradykacja Helicobacter pylori",
      "infekcja Helicobacter"
    ],
    "abbreviations": [
      "HP"
    ],
    "icd10": [
      "B98.0"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "eosinophilic-esophagitis",
    "nameEn": "Eosinophilic esophagitis",
    "namePl": "Eozynofilowe zapalenie przełyku",
    "synonymsEn": [
      "allergic esophagitis"
    ],
    "synonymsPl": [
      "eozynofilowe zapalenie przelyku"
    ],
    "abbreviations": [
      "EoE",
      "EZP"
    ],
    "icd10": [
      "K20.0"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "celiac-disease",
    "nameEn": "Celiac disease",
    "namePl": "Celiakia",
    "synonymsEn": [
      "coeliac disease",
      "gluten-sensitive enteropathy",
      "celiac sprue"
    ],
    "synonymsPl": [
      "choroba trzewna",
      "enteropatia glutenozależna",
      "nietolerancja glutenu"
    ],
    "abbreviations": [],
    "icd10": [
      "K90.0"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "acute-pancreatitis",
    "nameEn": "Acute pancreatitis",
    "namePl": "Ostre zapalenie trzustki",
    "synonymsEn": [],
    "synonymsPl": [],
    "abbreviations": [
      "AP",
      "OZT"
    ],
    "icd10": [
      "K85"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "chronic-pancreatitis",
    "nameEn": "Chronic pancreatitis",
    "namePl": "Przewlekłe zapalenie trzustki",
    "synonymsEn": [
      "pancreatic exocrine insufficiency"
    ],
    "synonymsPl": [
      "niewydolność zewnątrzwydzielnicza trzustki"
    ],
    "abbreviations": [
      "CP",
      "PZT"
    ],
    "icd10": [
      "K86.1"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "irritable-bowel-syndrome",
    "nameEn": "Irritable bowel syndrome",
    "namePl": "Zespół jelita nadwrażliwego",
    "synonymsEn": [
      "spastic colon",
      "functional bowel disorder"
    ],
    "synonymsPl": [
      "zespół jelita drażliwego",
      "jelito drażliwe"
    ],
    "abbreviations": [
      "IBS",
      "ZJN",
      "ZJD"
    ],
    "icd10": [
      "K58"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "dyspepsia",
    "nameEn": "Dyspepsia",
    "namePl": "Dyspepsja",
    "synonymsEn": [
      "functional dyspepsia",
      "indigestion"
    ],
    "synonymsPl": [
      "dyspepsja czynnościowa",
      "niestrawność"
    ],
    "abbreviations": [
      "FD"
    ],
    "icd10": [
      "K30"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "barretts-esophagus",
    "nameEn": "Barrett's esophagus",
    "namePl": "Przełyk Barretta",
    "synonymsEn": [
      "Barrett esophagus",
      "Barrett's oesophagus"
    ],
    "synonymsPl": [
      "metaplazja Barretta"
    ],
    "abbreviations": [
      "BE"
    ],
    "icd10": [
      "K22.7"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "colorectal-cancer",
    "nameEn": "Colorectal cancer",
    "namePl": "Rak jelita grubego",
    "synonymsEn": [
      "colon cancer",
      "rectal cancer",
      "bowel cancer",
      "colorectal cancer screening"
    ],
    "synonymsPl": [
      "rak okrężnicy",
      "rak odbytnicy",
      "badania przesiewowe raka jelita grubego",
      "profilaktyka raka jelita grubego"
    ],
    "abbreviations": [
      "CRC",
      "RJG"
    ],
    "icd10": [
      "C18",
      "C19",
      "C20",
      "Z12.11"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "diabetes-mellitus",
    "nameEn": "Diabetes mellitus",
    "namePl": "Cukrzyca",
    "synonymsEn": [
      "type 2 diabetes",
      "type 1 diabetes",
      "diabetes"
    ],
    "synonymsPl": [
      "cukrzyca typu 2",
      "cukrzyca typu 1"
    ],
    "abbreviations": [
      "DM",
      "T2DM",
      "T1DM"
    ],
    "icd10": [
      "E10",
      "E11"
    ],
    "specialty": "diabetology"
  },
  {
    "id": "hypertension",
    "nameEn": "Arterial hypertension",
    "namePl": "Nadciśnienie tętnicze",
    "synonymsEn": [
      "high blood pressure",
      "hypertension"
    ],
    "synonymsPl": [
      "wysokie ciśnienie tętnicze",
      "nadciśnienie"
    ],
    "abbreviations": [
      "HTN",
      "NT"
    ],
    "icd10": [
      "I10"
    ],
    "specialty": "cardiology"
  },
  {
    "id": "nafld-masld",
    "nameEn": "Non-alcoholic / metabolic dysfunction-associated fatty liver disease",
    "namePl": "Niealkoholowa (metaboliczna) stłuszczeniowa choroba wątroby",
    "synonymsEn": [
      "non-alcoholic fatty liver disease",
      "metabolic dysfunction-associated steatotic liver disease",
      "non-alcoholic steatohepatitis",
      "metabolic dysfunction-associated steatohepatitis",
      "fatty liver",
      "hepatic steatosis"
    ],
    "synonymsPl": [
      "stłuszczenie wątroby",
      "stłuszczeniowa choroba wątroby związana z dysfunkcją metaboliczną",
      "niealkoholowe stłuszczeniowe zapalenie wątroby",
      "metaboliczna stłuszczeniowa choroba wątroby",
      "stłuszczeniowe zapalenie wątroby"
    ],
    "abbreviations": [
      "NAFLD",
      "MASLD",
      "NASH",
      "MAFLD",
      "MASH"
    ],
    "icd10": [
      "K76.0",
      "K75.8"
    ],
    "specialty": "hepatology"
  },
  {
    "id": "cholestatic-liver-disease",
    "nameEn": "Cholestatic liver diseases (PBC / PSC)",
    "namePl": "Cholestatyczne choroby wątroby",
    "synonymsEn": [
      "primary biliary cholangitis",
      "primary sclerosing cholangitis",
      "cholestasis",
      "chronic cholestatic liver disease",
      "overlap syndrome"
    ],
    "synonymsPl": [
      "pierwotne zapalenie dróg żółciowych",
      "pierwotna marskość żółciowa",
      "pierwotne stwardniające zapalenie dróg żółciowych",
      "cholestaza",
      "zespoły cholestatyczne",
      "zespół nakładania"
    ],
    "abbreviations": [
      "PBC",
      "PSC",
      "AMA"
    ],
    "icd10": [
      "K74.3",
      "K83.0",
      "K71.0"
    ],
    "specialty": "hepatology"
  },
  {
    "id": "cholelithiasis",
    "nameEn": "Cholelithiasis (gallstone disease)",
    "namePl": "Kamica żółciowa",
    "synonymsEn": [
      "gallstones",
      "gallstone disease",
      "bile duct stones",
      "choledocholithiasis",
      "cholecystolithiasis"
    ],
    "synonymsPl": [
      "kamica pęcherzyka żółciowego",
      "kamica przewodowa",
      "kamica dróg żółciowych",
      "złogi w drogach żółciowych",
      "kamienie żółciowe"
    ],
    "abbreviations": [],
    "icd10": [
      "K80"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "diverticular-disease",
    "nameEn": "Diverticular disease of the colon",
    "namePl": "Choroba uchyłkowa okrężnicy",
    "synonymsEn": [
      "diverticulosis",
      "diverticulitis",
      "colonic diverticula",
      "symptomatic uncomplicated diverticular disease",
      "Colonic Diverticulitis",
      "colonic diverticulitis",
      "diverticular disease",
      "acute diverticulitis"
    ],
    "synonymsPl": [
      "uchyłkowatość okrężnicy",
      "zapalenie uchyłków",
      "uchyłki jelita grubego",
      "objawowa niepowikłana choroba uchyłkowa",
      "uchyłki okrężnicy",
      "Zapalenie uchylkow okreznicy",
      "zapalenie uchylkow okreznicy",
      "zapalenie uchylkow jelita grubego",
      "choroba uchylkowa"
    ],
    "abbreviations": [
      "SUDD"
    ],
    "icd10": [
      "K57",
      "K57.30",
      "K57.32",
      "K57.92"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "pancreatic-ductal-adenocarcinoma",
    "nameEn": "Pancreatic ductal adenocarcinoma",
    "namePl": "Gruczolakorak przewodowy trzustki",
    "synonymsEn": [
      "pancreatic cancer",
      "pancreatic carcinoma",
      "pancreatic adenocarcinoma",
      "cancer of the pancreas"
    ],
    "synonymsPl": [
      "rak trzustki",
      "rak przewodowy trzustki",
      "nowotwór złośliwy trzustki",
      "gruczolakorak trzustki"
    ],
    "abbreviations": [
      "PDAC"
    ],
    "icd10": [
      "C25"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "pancreatic-cystic-lesions",
    "nameEn": "Pancreatic cystic lesions / tumors",
    "namePl": "Torbielowate zmiany (guzy) trzustki",
    "synonymsEn": [
      "pancreatic cysts",
      "intraductal papillary mucinous neoplasm",
      "mucinous cystic neoplasm",
      "serous cystadenoma",
      "pancreatic cystic neoplasm",
      "Pancreatic Cysts",
      "pancreatic cystic lesions"
    ],
    "synonymsPl": [
      "torbiele trzustki",
      "torbielowate guzy trzustki",
      "wewnątrzprzewodowy brodawkowaty nowotwór śluzowy",
      "śluzowy nowotwór torbielowaty",
      "surowiczy gruczolak torbielowaty",
      "Torbiele trzustki",
      "torbielowate zmiany trzustki",
      "srodprzewodowy brodawkowaty nowotwor sluzowy",
      "torbielakogruczolak surowiczy"
    ],
    "abbreviations": [
      "IPMN",
      "MCN",
      "SCN",
      "PCN"
    ],
    "icd10": [
      "K86.2",
      "D13.6",
      "D13.7",
      "K86.3"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "pancreatic-fluid-collections",
    "nameEn": "Pancreatic and peripancreatic fluid collections",
    "namePl": "Zbiorniki płynowe trzustki i okolicy trzustki",
    "synonymsEn": [
      "pancreatic pseudocyst",
      "walled-off necrosis",
      "acute necrotic collection",
      "acute peripancreatic fluid collection",
      "postinflammatory fluid collection"
    ],
    "synonymsPl": [
      "torbiel rzekoma trzustki",
      "otorbiona martwica trzustki",
      "pozapalne zbiorniki płynowe",
      "ostry zbiornik płynu okołotrzustkowego",
      "martwica otorbiona"
    ],
    "abbreviations": [
      "WON",
      "WOPN",
      "PFC",
      "APFC"
    ],
    "icd10": [
      "K86.3",
      "K85"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "malnutrition",
    "nameEn": "Malnutrition and clinical nutrition in gastrointestinal disease",
    "namePl": "Niedożywienie i żywienie kliniczne w chorobach przewodu pokarmowego",
    "synonymsEn": [
      "undernutrition",
      "nutritional deficiency",
      "clinical nutrition",
      "enteral nutrition",
      "parenteral nutrition",
      "nutritional support"
    ],
    "synonymsPl": [
      "niedożywienie",
      "leczenie żywieniowe",
      "żywienie dojelitowe",
      "żywienie pozajelitowe",
      "niedobory żywieniowe",
      "żywienie kliniczne"
    ],
    "abbreviations": [
      "NRS-2002"
    ],
    "icd10": [
      "E43",
      "E44",
      "E46"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "upper-gi-bleeding",
    "nameEn": "Upper gastrointestinal bleeding (non-variceal)",
    "namePl": "Krwawienie z górnego odcinka przewodu pokarmowego",
    "synonymsEn": [
      "non-variceal upper GI bleeding",
      "peptic ulcer bleeding",
      "hematemesis",
      "melena",
      "upper GI haemorrhage",
      "upper GI bleeding",
      "upper gastrointestinal hemorrhage"
    ],
    "synonymsPl": [
      "krwawienie z górnego odcinka przewodu pokarmowego pochodzenia nieżylakowego",
      "krwawienie z wrzodu",
      "fusowate wymioty",
      "smoliste stolce",
      "krwotok z przewodu pokarmowego",
      "krwawienie z gornego odcinka przewodu pokarmowego",
      "krwotok z gornego odcinka przewodu pokarmowego",
      "krwawe wymioty"
    ],
    "abbreviations": [
      "UGIB",
      "NVUGIB"
    ],
    "icd10": [
      "K92.0",
      "K92.1",
      "K92.2",
      "K25.0"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "colorectal-polyps",
    "nameEn": "Colorectal polyps and post-polypectomy surveillance",
    "namePl": "Polipy jelita grubego i nadzór po polipektomii",
    "synonymsEn": [
      "colorectal adenoma",
      "colon polyp",
      "adenomatous polyp",
      "serrated polyp",
      "colonoscopic surveillance",
      "polypectomy"
    ],
    "synonymsPl": [
      "gruczolak jelita grubego",
      "polip gruczolakowy",
      "polip ząbkowany",
      "nadzór kolonoskopowy po polipektomii",
      "polipektomia",
      "polipy okrężnicy"
    ],
    "abbreviations": [],
    "icd10": [
      "K63.5",
      "D12"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "gastroparesis",
    "nameEn": "Gastroparesis",
    "namePl": "Gastropareza",
    "synonymsEn": [
      "gastroparesis",
      "delayed gastric emptying",
      "gastric paresis",
      "diabetic gastroparesis"
    ],
    "synonymsPl": [
      "gastropareza",
      "opoznione oproznianie zoladka",
      "porazenie zoladka",
      "opóźnione opróżnianie żołądka",
      "porażenie żołądka"
    ],
    "abbreviations": [],
    "icd10": [
      "K31.84"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "lower-gi-bleeding",
    "nameEn": "Lower Gastrointestinal Bleeding",
    "namePl": "Krwawienie z dolnego odcinka przewodu pokarmowego",
    "synonymsEn": [
      "lower GI bleeding",
      "acute lower gastrointestinal bleeding",
      "hematochezia",
      "rectal bleeding",
      "diverticular bleeding"
    ],
    "synonymsPl": [
      "krwawienie z dolnego odcinka przewodu pokarmowego",
      "krwotok z dolnego odcinka przewodu pokarmowego",
      "krwawienie z odbytnicy",
      "krwiste stolce"
    ],
    "abbreviations": [
      "LGIB"
    ],
    "icd10": [
      "K92.2",
      "K62.5"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "small-bowel-bleeding",
    "nameEn": "Small Bowel Bleeding",
    "namePl": "Krwawienie z jelita cienkiego",
    "synonymsEn": [
      "small bowel bleeding",
      "small intestinal bleeding",
      "obscure gastrointestinal bleeding",
      "mid-GI bleeding"
    ],
    "synonymsPl": [
      "krwawienie z jelita cienkiego",
      "utajone krwawienie z przewodu pokarmowego",
      "krwawienie o nieustalonym zrodle"
    ],
    "abbreviations": [
      "OGIB"
    ],
    "icd10": [
      "K92.2"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "abnormal-liver-chemistries",
    "nameEn": "Abnormal Liver Chemistries",
    "namePl": "Nieprawidlowe proby watrobowe",
    "synonymsEn": [
      "abnormal liver chemistries",
      "abnormal liver blood tests",
      "elevated liver enzymes",
      "elevated transaminases",
      "abnormal liver function tests"
    ],
    "synonymsPl": [
      "nieprawidlowe proby watrobowe",
      "podwyzszone enzymy watrobowe",
      "podwyzszone aminotransferazy",
      "nieprawidlowe testy czynnosciowe watroby"
    ],
    "abbreviations": [
      "LFT"
    ],
    "icd10": [
      "R74.8",
      "R94.5"
    ],
    "specialty": "hepatology"
  },
  {
    "id": "drug-induced-liver-injury",
    "nameEn": "Drug-Induced Liver Injury",
    "namePl": "Polekowe uszkodzenie watroby",
    "synonymsEn": [
      "drug-induced liver injury",
      "idiosyncratic drug-induced liver injury",
      "hepatotoxicity",
      "drug hepatotoxicity"
    ],
    "synonymsPl": [
      "polekowe uszkodzenie watroby",
      "toksyczne uszkodzenie watroby",
      "hepatotoksycznosc polekowa"
    ],
    "abbreviations": [
      "DILI"
    ],
    "icd10": [
      "K71.9",
      "K71.6"
    ],
    "specialty": "hepatology"
  },
  {
    "id": "alcohol-associated-liver-disease",
    "nameEn": "Alcohol-Associated Liver Disease",
    "namePl": "Alkoholowa choroba watroby",
    "synonymsEn": [
      "alcohol-associated liver disease",
      "alcoholic liver disease",
      "alcoholic hepatitis",
      "alcohol-related liver disease",
      "alcoholic cirrhosis"
    ],
    "synonymsPl": [
      "alkoholowa choroba watroby",
      "alkoholowe zapalenie watroby",
      "marskosc alkoholowa watroby"
    ],
    "abbreviations": [
      "ALD",
      "AH"
    ],
    "icd10": [
      "K70.0",
      "K70.1",
      "K70.3",
      "K70.9"
    ],
    "specialty": "hepatology"
  },
  {
    "id": "primary-sclerosing-cholangitis",
    "nameEn": "Primary Sclerosing Cholangitis",
    "namePl": "Pierwotne stwardniajace zapalenie drog zolciowych",
    "synonymsEn": [
      "primary sclerosing cholangitis",
      "sclerosing cholangitis"
    ],
    "synonymsPl": [
      "pierwotne stwardniajace zapalenie drog zolciowych",
      "stwardniajace zapalenie drog zolciowych"
    ],
    "abbreviations": [
      "PSC"
    ],
    "icd10": [
      "K83.01"
    ],
    "specialty": "hepatology"
  },
  {
    "id": "focal-liver-lesions",
    "nameEn": "Focal Liver Lesions",
    "namePl": "Ogniskowe zmiany w watrobie",
    "synonymsEn": [
      "focal liver lesions",
      "liver mass",
      "hepatic hemangioma",
      "focal nodular hyperplasia",
      "hepatocellular adenoma",
      "liver cyst"
    ],
    "synonymsPl": [
      "ogniskowe zmiany w watrobie",
      "guz watroby",
      "naczyniak watroby",
      "ogniskowy rozrost guzkowy",
      "gruczolak watroby",
      "torbiel watroby"
    ],
    "abbreviations": [
      "FLL",
      "FNH"
    ],
    "icd10": [
      "D13.4",
      "D18.03",
      "K76.89"
    ],
    "specialty": "hepatology"
  },
  {
    "id": "acute-liver-failure",
    "nameEn": "Acute Liver Failure",
    "namePl": "Ostra niewydolnosc watroby",
    "synonymsEn": [
      "acute liver failure",
      "fulminant hepatic failure",
      "fulminant liver failure"
    ],
    "synonymsPl": [
      "ostra niewydolnosc watroby",
      "piorunujaca niewydolnosc watroby"
    ],
    "abbreviations": [
      "ALF"
    ],
    "icd10": [
      "K72.00",
      "K72.01"
    ],
    "specialty": "hepatology"
  },
  {
    "id": "inflammatory-bowel-disease",
    "nameEn": "Inflammatory Bowel Disease",
    "namePl": "Nieswoiste zapalenie jelit",
    "synonymsEn": [
      "inflammatory bowel disease",
      "IBD",
      "Crohn's disease",
      "ulcerative colitis"
    ],
    "synonymsPl": [
      "nieswoiste zapalenie jelit",
      "choroba zapalna jelit",
      "choroba Lesniowskiego-Crohna",
      "wrzodziejace zapalenie jelita grubego"
    ],
    "abbreviations": [
      "IBD"
    ],
    "icd10": [
      "K50",
      "K51",
      "K52.9"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "hereditary-gi-cancer-syndromes",
    "nameEn": "Hereditary Gastrointestinal Cancer Syndromes",
    "namePl": "Dziedziczne zespoly nowotworowe przewodu pokarmowego",
    "synonymsEn": [
      "hereditary gastrointestinal cancer syndromes",
      "Lynch syndrome",
      "hereditary nonpolyposis colorectal cancer",
      "familial adenomatous polyposis",
      "MUTYH-associated polyposis",
      "Peutz-Jeghers syndrome",
      "juvenile polyposis syndrome"
    ],
    "synonymsPl": [
      "dziedziczne zespoly nowotworowe przewodu pokarmowego",
      "zespol Lyncha",
      "dziedziczny rak jelita grubego niezwiazany z polipowatoscia",
      "rodzinna polipowatosc gruczolakowata",
      "zespol Peutza-Jeghersa"
    ],
    "abbreviations": [
      "HNPCC",
      "FAP",
      "MAP"
    ],
    "icd10": [
      "Z15.09",
      "D12.6",
      "Z84.81"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "colon-ischemia",
    "nameEn": "Colon Ischemia",
    "namePl": "Niedokrwienie okreznicy",
    "synonymsEn": [
      "colon ischemia",
      "ischemic colitis",
      "colonic ischemia",
      "intestinal ischemia"
    ],
    "synonymsPl": [
      "niedokrwienie okreznicy",
      "niedokrwienne zapalenie jelita grubego",
      "niedokrwienie jelita grubego"
    ],
    "abbreviations": [
      "CI"
    ],
    "icd10": [
      "K55.0",
      "K55.1",
      "K55.9"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "achalasia",
    "nameEn": "Achalasia",
    "namePl": "Achalazja przelyku",
    "synonymsEn": [
      "achalasia",
      "esophageal achalasia",
      "cardiospasm",
      "esophageal motility disorder"
    ],
    "synonymsPl": [
      "achalazja przelyku",
      "achalazja wpustu",
      "kurcz wpustu",
      "zaburzenia motoryki przelyku"
    ],
    "abbreviations": [],
    "icd10": [
      "K22.0"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "gi-bleeding-antithrombotic",
    "nameEn": "Gastrointestinal Bleeding on Antithrombotic Therapy",
    "namePl": "Krwawienie z przewodu pokarmowego podczas leczenia przeciwzakrzepowego",
    "synonymsEn": [
      "GI bleeding on anticoagulation",
      "anticoagulant-associated GI bleeding",
      "antiplatelet-associated bleeding",
      "periendoscopic anticoagulation management"
    ],
    "synonymsPl": [
      "krwawienie z przewodu pokarmowego podczas leczenia przeciwzakrzepowego",
      "krwawienie zwiazane z lekami przeciwplytkowymi"
    ],
    "abbreviations": [
      "DOAC"
    ],
    "icd10": [
      "K92.2",
      "D68.32"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "sibo",
    "nameEn": "Small Intestinal Bacterial Overgrowth",
    "namePl": "Zespol rozrostu bakteryjnego jelita cienkiego",
    "synonymsEn": [
      "small intestinal bacterial overgrowth",
      "small bowel bacterial overgrowth",
      "bacterial overgrowth"
    ],
    "synonymsPl": [
      "zespol rozrostu bakteryjnego jelita cienkiego",
      "przerost bakteryjny jelita cienkiego"
    ],
    "abbreviations": [
      "SIBO"
    ],
    "icd10": [
      "K90.4",
      "K63.8"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "chronic-idiopathic-constipation",
    "nameEn": "Chronic Idiopathic Constipation",
    "namePl": "Przewlekle idiopatyczne zaparcie",
    "synonymsEn": [
      "chronic idiopathic constipation",
      "chronic constipation",
      "functional constipation"
    ],
    "synonymsPl": [
      "przewlekle idiopatyczne zaparcie",
      "przewlekle zaparcie",
      "zaparcie czynnosciowe"
    ],
    "abbreviations": [
      "CIC"
    ],
    "icd10": [
      "K59.00",
      "K59.09"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "benign-anorectal-disorders",
    "nameEn": "Benign Anorectal Disorders",
    "namePl": "Lagodne choroby odbytu i odbytnicy",
    "synonymsEn": [
      "benign anorectal disorders",
      "hemorrhoids",
      "anal fissure",
      "fecal incontinence",
      "dyssynergic defecation",
      "proctalgia"
    ],
    "synonymsPl": [
      "lagodne choroby odbytu i odbytnicy",
      "hemoroidy",
      "guzki krwawnicze",
      "szczelina odbytu",
      "nietrzymanie stolca",
      "dyssynergia defekacji"
    ],
    "abbreviations": [],
    "icd10": [
      "K64.9",
      "K60.2",
      "R15.9",
      "K59.4"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "gastric-premalignant-conditions",
    "nameEn": "Gastric Premalignant Conditions",
    "namePl": "Stany przedrakowe zoladka",
    "synonymsEn": [
      "gastric premalignant conditions",
      "gastric intestinal metaplasia",
      "atrophic gastritis",
      "gastric dysplasia",
      "autoimmune gastritis"
    ],
    "synonymsPl": [
      "stany przedrakowe zoladka",
      "metaplazja jelitowa zoladka",
      "zanikowe zapalenie zoladka",
      "dysplazja zoladka",
      "autoimmunologiczne zapalenie zoladka"
    ],
    "abbreviations": [
      "GIM",
      "GPMC"
    ],
    "icd10": [
      "K29.4",
      "K31.A",
      "D13.1"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "hepatic-encephalopathy",
    "nameEn": "Hepatic Encephalopathy",
    "namePl": "Encefalopatia watrobowa",
    "synonymsEn": [
      "hepatic encephalopathy",
      "portosystemic encephalopathy",
      "overt hepatic encephalopathy",
      "minimal hepatic encephalopathy"
    ],
    "synonymsPl": [
      "encefalopatia watrobowa",
      "encefalopatia wrotno-ukladowa",
      "spiaczka watrobowa"
    ],
    "abbreviations": [
      "HE",
      "OHE"
    ],
    "icd10": [
      "K76.82",
      "K72.90"
    ],
    "specialty": "hepatology"
  },
  {
    "id": "liver-disease-pregnancy",
    "nameEn": "Liver Disease in Pregnancy",
    "namePl": "Choroby watroby w ciazy",
    "synonymsEn": [
      "liver disease in pregnancy",
      "intrahepatic cholestasis of pregnancy",
      "acute fatty liver of pregnancy",
      "HELLP syndrome"
    ],
    "synonymsPl": [
      "choroby watroby w ciazy",
      "wewnatrzwatrobowa cholestaza ciezarnych",
      "ostre stluszczenie watroby ciezarnych",
      "zespol HELLP"
    ],
    "abbreviations": [
      "ICP",
      "AFLP",
      "HELLP"
    ],
    "icd10": [
      "O26.6",
      "O26.61",
      "O14.2"
    ],
    "specialty": "hepatology"
  },
  {
    "id": "igg4-related-digestive-disease",
    "nameEn": "IgG4-related digestive disease",
    "namePl": "Choroba przewodu pokarmowego zależna od IgG4",
    "synonymsEn": [
      "IgG4-related disease of the digestive system",
      "type 1 autoimmune pancreatitis",
      "IgG4-related cholangitis"
    ],
    "synonymsPl": [
      "choroba IgG4-zależna przewodu pokarmowego",
      "autoimmunologiczne zapalenie trzustki typu 1"
    ],
    "abbreviations": [
      "IgG4-RD",
      "AIP"
    ],
    "icd10": [
      "K86.1"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "chronic-mesenteric-ischaemia",
    "nameEn": "Chronic mesenteric ischaemia",
    "namePl": "Przewlekłe niedokrwienie jelit",
    "synonymsEn": [
      "chronic mesenteric ischemia",
      "intestinal angina",
      "abdominal angina"
    ],
    "synonymsPl": [
      "przewlekłe niedokrwienie krezkowe",
      "dławica brzuszna"
    ],
    "abbreviations": [
      "CMI"
    ],
    "icd10": [
      "K55.1"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "chronic-nausea-vomiting",
    "nameEn": "Chronic nausea and vomiting",
    "namePl": "Przewlekłe nudności i wymioty",
    "synonymsEn": [
      "chronic nausea and vomiting syndrome",
      "cyclic vomiting syndrome",
      "rumination syndrome"
    ],
    "synonymsPl": [
      "zespół przewlekłych nudności i wymiotów",
      "zespół cyklicznych wymiotów"
    ],
    "abbreviations": [
      "CNVS",
      "CVS"
    ],
    "icd10": [
      "R11"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "pouchitis",
    "nameEn": "Pouchitis",
    "namePl": "Zapalenie zbiornika jelitowego",
    "synonymsEn": [
      "pouch disorders",
      "inflammation of the ileal pouch",
      "ileoanal pouch inflammation"
    ],
    "synonymsPl": [
      "zapalenie zbiornika krętniczo-odbytowego",
      "zapalenie zbiornika jelita krętego"
    ],
    "abbreviations": [],
    "icd10": [
      "K91.850"
    ],
    "specialty": "gastroenterology"
  },
  {
    "id": "copd",
    "nameEn": "Chronic obstructive pulmonary disease",
    "namePl": "Przewlekła obturacyjna choroba płuc",
    "synonymsEn": [
      "chronic obstructive lung disease",
      "emphysema",
      "chronic bronchitis"
    ],
    "synonymsPl": [
      "rozedma płuc",
      "przewlekłe zapalenie oskrzeli"
    ],
    "abbreviations": [
      "COPD",
      "POChP"
    ],
    "icd10": [
      "J44"
    ],
    "specialty": "pulmonology"
  },
  {
    "id": "chronic-kidney-disease",
    "nameEn": "Chronic kidney disease",
    "namePl": "Przewlekła choroba nerek",
    "synonymsEn": [
      "chronic renal failure",
      "chronic renal insufficiency",
      "chronic kidney failure"
    ],
    "synonymsPl": [
      "przewlekła niewydolność nerek",
      "przewlekła choroba nerek"
    ],
    "abbreviations": [
      "CKD",
      "PChN"
    ],
    "icd10": [
      "N18"
    ],
    "specialty": "nephrology"
  },
  {
    "id": "rsv-infection",
    "nameEn": "Respiratory syncytial virus infection",
    "namePl": "Zakażenie syncytialnym wirusem oddechowym (RSV)",
    "synonymsEn": [
      "RSV infection",
      "respiratory syncytial virus disease",
      "RSV vaccination"
    ],
    "synonymsPl": [
      "zakażenie RSV",
      "syncytialny wirus oddechowy",
      "szczepienie przeciw RSV"
    ],
    "abbreviations": [
      "RSV"
    ],
    "icd10": [
      "J12.1",
      "J20.5",
      "J21.0",
      "B97.4"
    ],
    "specialty": "infectious-disease"
  },
  {
    "id": "hydroxychloroquine-retinopathy",
    "nameEn": "Hydroxychloroquine retinopathy",
    "namePl": "Retinopatia po hydroksychlorochinie",
    "synonymsEn": [
      "hydroxychloroquine retinal toxicity",
      "antimalarial retinopathy",
      "chloroquine retinopathy",
      "toxic maculopathy"
    ],
    "synonymsPl": [
      "toksyczność siatkówkowa hydroksychlorochiny",
      "makulopatia toksyczna"
    ],
    "abbreviations": [
      "HCQ"
    ],
    "icd10": [
      "H35.389"
    ],
    "specialty": "ophthalmology"
  },
  {
    "id": "anaplastic-thyroid-cancer",
    "nameEn": "Anaplastic thyroid cancer",
    "namePl": "Rak anaplastyczny tarczycy",
    "synonymsEn": [
      "anaplastic thyroid carcinoma",
      "undifferentiated thyroid carcinoma",
      "thyroid cancer"
    ],
    "synonymsPl": [
      "rak niezróżnicowany tarczycy",
      "rak tarczycy"
    ],
    "abbreviations": [
      "ATC"
    ],
    "icd10": [
      "C73"
    ],
    "specialty": "oncology"
  },
  {
    "id": "prostate-cancer",
    "nameEn": "Prostate cancer",
    "namePl": "Rak prostaty",
    "synonymsEn": [
      "prostate carcinoma",
      "prostate cancer screening",
      "PSA screening"
    ],
    "synonymsPl": [
      "rak gruczołu krokowego",
      "rak stercza"
    ],
    "abbreviations": [
      "PCa"
    ],
    "icd10": [
      "C61"
    ],
    "specialty": "urology"
  },
  {
    "id": "ckd-associated-pruritus",
    "nameEn": "Chronic kidney disease-associated pruritus",
    "namePl": "Świąd związany z przewlekłą chorobą nerek",
    "synonymsEn": [
      "uraemic pruritus",
      "uremic pruritus",
      "dialysis itch",
      "renal pruritus"
    ],
    "synonymsPl": [
      "świąd mocznicowy"
    ],
    "abbreviations": [
      "CKD-aP"
    ],
    "icd10": [
      "L29.8"
    ],
    "specialty": "nephrology"
  },
  {
    "id": "breast-cancer-screening",
    "nameEn": "Breast cancer screening",
    "namePl": "Badania przesiewowe w kierunku raka piersi",
    "synonymsEn": [
      "mammography screening",
      "screening mammogram",
      "breast cancer early detection"
    ],
    "synonymsPl": [
      "mammografia przesiewowa",
      "przesiew raka piersi",
      "wczesne wykrywanie raka piersi"
    ],
    "abbreviations": [],
    "icd10": [
      "Z12.31"
    ],
    "specialty": "primary-care"
  },
  {
    "id": "childhood-obesity",
    "nameEn": "Childhood obesity (high BMI)",
    "namePl": "Otyłość u dzieci (wysokie BMI)",
    "synonymsEn": [
      "high body mass index in children",
      "high BMI in children and adolescents",
      "paediatric obesity",
      "childhood overweight"
    ],
    "synonymsPl": [
      "otyłość dziecięca",
      "wysokie BMI u dzieci",
      "nadwaga u dzieci"
    ],
    "abbreviations": [],
    "icd10": [
      "E66",
      "Z68.54"
    ],
    "specialty": "primary-care"
  },
  {
    "id": "falls-prevention",
    "nameEn": "Falls prevention in older adults",
    "namePl": "Zapobieganie upadkom u osób starszych",
    "synonymsEn": [
      "fall prevention",
      "falls in the elderly",
      "preventing falls"
    ],
    "synonymsPl": [
      "profilaktyka upadków",
      "upadki osób starszych",
      "zapobieganie upadkom"
    ],
    "abbreviations": [],
    "icd10": [
      "Z91.81"
    ],
    "specialty": "primary-care"
  },
  {
    "id": "atopic-dermatitis",
    "nameEn": "Atopic dermatitis",
    "namePl": "Atopowe zapalenie skóry",
    "synonymsEn": [
      "atopic eczema",
      "eczema",
      "atopic dermatitis"
    ],
    "synonymsPl": [
      "wyprysk atopowy",
      "egzema atopowa"
    ],
    "abbreviations": [
      "AD",
      "AZS"
    ],
    "icd10": [
      "L20"
    ],
    "specialty": "dermatology"
  }
];
