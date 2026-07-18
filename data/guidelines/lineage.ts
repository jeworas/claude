/**
 * Guideline revision lineage: maps a superseded edition to the edition that
 * replaced it (older id → newer id). Generated from the historical dataset;
 * powers the revision timeline and the "current version" link. 
 */
export const SUPERSEDED_BY: Record<string, string> = {
  "acg-ulcerative-colitis-2019": "acg-ulcerative-colitis-2025",
  "acg-ulcerative-colitis-2010": "acg-ulcerative-colitis-2019",
  "acg-crohns-disease-2018": "acg-crohns-disease-2025",
  "acg-crohns-disease-2009": "acg-crohns-disease-2018",
  "acg-h-pylori-2017": "acg-h-pylori-2024",
  "acg-h-pylori-2007": "acg-h-pylori-2017",
  "acg-gerd-2013": "acg-gerd-2022",
  "acg-gerd-2005": "acg-gerd-2013",
  "acg-barretts-2016": "acg-barretts-2022",
  "acg-barretts-2008": "acg-barretts-2016",
  "acg-celiac-2013": "acg-celiac-2023",
  "acg-acute-pancreatitis-2013": "acg-acute-pancreatitis-2024",
  "acg-crc-screening-2009": "acg-crc-screening-2021",
  "aga-ulcerative-colitis-2020": "aga-ulcerative-colitis-2024",
  "aga-crohns-disease-2021": "aga-crohns-disease-2025",
  "ptge-wzjg-2013": "ptge-wzjg-2023",
  "ptge-crohn-2012": "ptge-crohn-2021",
};
