# Product Requirements Document — GuidelineAtlas

**A bilingual index of clinical practice guidelines from US and Polish medical societies.**

| | |
|---|---|
| Status | Proof of concept (v0) |
| Author | — |
| Last updated | 2026-07-18 |
| Related | `README.md` (how to run), `/about` page (user-facing disclaimers) |

---

## 1. Problem & context

Clinicians are expected to practise in line with current clinical practice guidelines, but **finding the current guideline for a given condition is slow and fragmented**:

- Guidelines are published by **many different professional societies**, each on its own website with its own structure (e.g. the American College of Gastroenterology at [gi.org/guidelines](https://gi.org/guidelines/), the Polish Society of Gastroenterology at [ptg-e.org.pl/wytyczne](https://ptg-e.org.pl/wytyczne/)).
- They are **updated on irregular schedules**. A guideline can be replaced by a new version with materially different recommendations (e.g. ulcerative colitis and *H. pylori* guidance have both changed substantially in recent years), and it is easy to read a superseded version without realising it.
- There is **no unified search**. A doctor who wants "the current recommendation for treating colitis" must know which societies are relevant, visit each site, and scan for the right document.
- In a country like **Poland, clinicians work across languages**: they may want the Polish national guideline *and* the US guideline for the same condition, and relevant terms exist in both Polish and English (plus abbreviations). Searching only in one language misses half the picture.

The result is time wasted and a real risk of relying on out-of-date guidance.

**This is the pain point described by the originating user**, whose partner is a practising physician: *"it is extremely difficult and time consuming to find current guidelines regarding treatment of diseases."*

## 2. Vision

A single place where a clinician can type a condition — in **English or Polish**, full name or abbreviation — and immediately see the **current treatment guidelines from every relevant society**, each with a concise structured summary and a direct link to the source, with **clear signals of how current each guideline is**.

Start narrow (gastroenterology; US + Poland), prove the model, then widen coverage across specialties and countries.

## 3. Goals & non-goals

### Goals (what the product must do)
1. **Map societies** — maintain a registry of guideline-issuing bodies with their guideline index pages, per country and specialty.
2. **Maintain a guideline database** — structured records (metadata + treatment summary + source link), with explicit **freshness** and **supersession** tracking.
3. **Bilingual search** — resolve a query in English or Polish (names, synonyms, abbreviations) to the right condition and its guidelines.
4. **Show a treatment summary** — condensed, attributed key recommendations per guideline, with a one-click path to the full text.
5. **Compare across countries** — for a condition, show how US and Polish societies approach it, side by side.
6. **Support currency** — surface out-of-date/superseded guidelines and demonstrate an automated pipeline for detecting new/updated guidelines.

### Non-goals (explicitly out of scope)
- **Not clinical decision support.** It does not diagnose, does not recommend treatment for an individual patient, and does not synthesise across guidelines into a single recommendation. It is a reference/bibliographic index. (See §8.)
- **Not a full-text host.** It stores metadata, short original summaries and links — it does not reproduce or mirror guideline full text or PDFs.
- **Not a translation tool.** Search and condition labels are bilingual; guideline *body text* is not translated (copyright + accuracy). (See §7.4.)
- **Not exhaustive at PoC.** The proof of concept covers a deliberately small, curated set.
- **Not a patient-facing product.** The audience is healthcare professionals.

## 4. Personas

- **Dr Anna — hospital gastroenterologist (Poland).** Sees IBD and reflux patients daily. Wants the current Polish *and* international recommendation quickly, in whichever language is faster to type. Primary persona.
- **Dr Mark — internal medicine resident (US).** Broad remit, less specialty depth. Needs a trustworthy, quickly scannable summary and the source link to read before rounds.
- **Editor (internal, future).** A qualified clinician who curates and verifies records and reviews the "new guideline" alerts before anything is published.

## 5. User stories

- As a clinician, I can **search "colitis"** and see UC, Crohn's, *C. difficile* and microscopic colitis guidelines from both US and Polish societies.
- As a Polish clinician, I can **search "WZJG"** (or "wrzodziejące zapalenie jelita grubego") and get the **same** results I'd get for "ulcerative colitis" — and see **which term matched**.
- As a clinician, I can open a guideline and see a **structured treatment summary** (first-line, escalation, etc.) and **jump to the source**.
- As a clinician, I can tell at a glance whether a guideline is **current or aging/superseded**.
- As a clinician, I can view a **condition page** comparing US vs Polish guidance.
- As a clinician, I can **filter** results by country, society, or specialty.
- As an editor (future), I get **alerts when a society publishes a guideline we don't yet track**.

## 6. Features

### F1 — Society registry
A directory of guideline-issuing bodies: name (English + local), abbreviation, region, specialties, homepage, and **guideline index URL** (the page monitored for updates, and the page a curator opens to download the source documents). Grouped by region (US / Europe / UK / Poland / International). *PoC: 82 societies across ~24 specialties — the major guideline issuers per discipline and region (e.g. ESC, KDIGO, NCCN, ASCO, ESMO, IDSA, ACR, EULAR, NICE, WHO, FIGO, GOLD, GINA, ACOG, AAP). The registry is the input to ingestion: full guideline text is loaded for the gastroenterology/IBD cluster first; every other society is mapped as a source with its guideline-index URL.*

### F2 — Guideline database with freshness & supersession
Structured guideline records (see §7.1). Each shows **publication year**, a **currency badge** (current / aging >5y / superseded), a **last-verified date**, and a link. A guideline may reference the record it `supersedes`. *Freshness is a first-class feature, not just a data field* — an out-of-date recommendation must be obvious before a clinician relies on it.

### F3 — Bilingual search
Two-layer retrieval (§7.2): a deterministic **bilingual thesaurus** (EN/PL names, synonyms, abbreviations) resolves clinical terms and abbreviations, backed by a fuzzy **full-text index** for drug names, partial titles and society names. The UI shows a **"matched via …"** hint so cross-language behaviour is transparent and trustworthy.

### F4 — Structured treatment summaries
Per guideline: a short plain-language overview plus **key recommendations**, each tagged with a **line of therapy** (first-line, escalation, maintenance, …), relevant **drugs**, and the guideline's own **evidence grade**. Always attributed to **one** guideline — never merged across guidelines.

### F5 — Condition comparison (US vs PL)
A per-condition page listing all guidelines for that condition grouped by country, side by side, with ICD-10 codes and the full synonym set. This is the "how do the US and Poland differ?" view.

### F6 — Update monitoring & notifications
A pipeline that reads each society's public guideline index, extracts guideline links, and **diffs against the known database** to surface:
- **NEW** — on the site, not yet tracked (candidate to add);
- **MISSING** — tracked, but not found this run (possibly moved/renamed/retired).

*PoC: a runnable script (`npm run check-updates`) demonstrating fetch → extract → diff → report against ACG and PTG-E.* *Future: scheduled runs feeding an editor review queue and notifications.*

## 7. Data & architecture

### 7.1 Data model
Plain, typed records (`src/lib/types.ts`), validated with Zod at build time (`npm run validate`):

- **Society** — `id, name, nameLocal?, abbreviation, country, specialties[], homepage, guidelinesIndexUrl`.
- **Condition** — `id, nameEn, namePl, synonymsEn[], synonymsPl[], abbreviations[], icd10[], specialty`. *This is the bilingual thesaurus.*
- **Guideline** — `id, societyId, conditionIds[], title, titleLocal?, language, specialty, year, status, supersedesId?, sourceUrl, pdfUrl?, citation?, summary, keyRecommendations[], lastVerified, dataProvenance`.
- **Recommendation** — `topic, text, evidenceGrade?, lineOfTherapy?, drugs[]?`.

A guideline's **country is derived from its society**, so it never contradicts the registry. Conditions and guidelines are many-to-many; the condition layer is the join that powers both search and comparison.

### 7.2 Search
1. **Thesaurus resolver** — normalises the query (lowercase, strips Polish diacritics: ż→z, ł→l, …) and matches against condition names/synonyms (substring, either direction) and abbreviations (exact token). Guarantees `UC` ≡ `WZJG` ≡ `ulcerative colitis`, and that `colitis` fans out to every condition whose terms contain it.
2. **Full-text index** ([MiniSearch](https://github.com/lucaong/minisearch)) over `title`, `titleLocal`, `summary`, condition names, flattened synonyms, society names and drugs, with field boosts, fuzzy and prefix matching. Terms are diacritic-normalised at index and query time so Polish matches regardless of accents.

Results are the union (thesaurus-resolved first, then full-text), de-duplicated, filterable client-side by country/society/specialty. Because the corpus is small and in-memory, search is instant and requires no server.

### 7.3 Architecture (PoC vs target)

| Concern | PoC (this repo) | Target (production) |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind | Same |
| Data store | Typed TS/JSON in-repo, validated with Zod | Database (Postgres) + admin/editor CMS |
| Search | Client-side MiniSearch + thesaurus | Server search (e.g. Postgres FTS / OpenSearch) with the same thesaurus layer |
| Update monitoring | `check-updates` script, run manually, fixture fallback | Scheduled crawlers per source → editor review queue → notifications |
| Auth | None | Accounts for editors; optional clinician accounts (saved searches, alerts) |
| Hosting | Static-friendly build (Vercel/Netlify/S3) | Managed hosting + DB |

The PoC runs **fully offline after `npm install`**; only the update-checker touches the network (and falls back to committed fixtures when egress is unavailable).

### 7.4 Data strategy, sourcing & copyright
- **Sources** are the societies' own published guidelines (journals / society sites), linked directly.
- **Editorial trust model.** PoC content is **hand-curated demo data** (`dataProvenance: 'hand-curated-demo'`), each record carrying a `lastVerified` date and a source link. Production requires a defined **editor role** (qualified clinician), a **documented review cadence**, and a verification step before publish.
- **Copyright.** Store only **metadata, links, and original short paraphrase summaries** — *not* verbatim abstracts, full text, or mirrored PDFs. Deep-link to the publisher for the full document. Publisher/journal terms (e.g. AJG/*Gastroenterology*, Termedia/Via Medica for Polish journals) must be reviewed per source before launch.
- **i18n boundary.** Bilingual **search, a full PL/EN interface toggle, and condition labels** are in scope; **translating guideline body text is not** (accuracy + copyright) — guideline content is shown in its source language.

## 8. Regulatory & safety

- **Positioning: a reference/bibliographic index, not a medical device.** It provides information about the existence and content of published guidelines. It does **not** interpret patient-specific data or output a patient-specific recommendation.
- **EU context.** Under the EU Medical Device Regulation (and MDCG 2019-11 guidance on software qualification), software that supports a clinical decision for an individual patient can be a medical device (potentially Class IIa). GuidelineAtlas deliberately stays on the **"provide information / signpost literature"** side of that line — analogous to the clinical-decision-support carve-out in the US 21st Century Cures Act (information the clinician can independently review, with the basis/source shown).
- **Guardrails in product:** a persistent professional-use disclaimer on every page; a **"verify against source"** notice and `lastVerified` date on every guideline; summaries explicitly labelled as condensed demo data; no patient data input; no single "do X for this patient" output.
- **Before any real clinical deployment:** formal regulatory and legal review is required. This is stated on the `/about` page.

## 9. Success metrics
- **Coverage/quality:** flagship queries (`colitis`, `WZJG`, `H. pylori`, `cukrzyca`) each return ≥3 guidelines spanning both countries (enforced in `npm run validate`).
- **Findability:** median time-to-source (query → opening the source guideline) under ~15 seconds in usability testing.
- **Cross-language use:** proportion of searches issued in Polish vs English; share of sessions using an abbreviation.
- **Engagement:** search → guideline-detail rate; guideline-detail → "read the full guideline" click-through.
- **Freshness/trust:** median guideline age at time of view; number of NEW guidelines detected by monitoring and time-to-ingest.

## 10. Roadmap

**PoC (this repo) — done**
Bilingual search over **85 current guidelines (102 including prior editions)** across **US, Europe and Poland** — the complete current ACG, PTG-E and ECCO/UEG gastroenterology/hepatology catalogs plus AGA and diabetes/hypertension for breadth, spanning 50 conditions; a **cross-discipline society registry of 82 bodies** across ~24 specialties and five regions (US / EU / UK / PL / INT), each with its guideline-index URL, mapping the sources to ingest next; structured summaries; a **full PL/EN interface toggle**; **quick answers** for specific queries (dosing / line-of-therapy / named drug) and a **dosing quick-reference** on flagship guidelines; a **US↔Europe↔Poland comparison matrix** (agree vs. diverge, drug names matched across languages); a **revision timeline** of successive guideline editions; freshness/supersession UI; societies directory; disclaimers; a demo update-checker with fixtures; build-time validation.

**MVP (next)**
Move data to a database with an editor CMS and verification workflow; expand GI coverage to near-complete for ACG/AGA/PTG-E; add 2–3 more Polish societies and specialties; scheduled update-monitoring feeding an editor queue; basic analytics; production hosting; per-source copyright sign-off.

**v1**
Broad multi-specialty, multi-country coverage; clinician accounts with saved searches and **update alerts** ("a guideline you follow was replaced"); explicit version history/diffs between guideline editions; UI language toggle (PL/EN) and accessibility (WCAG) baseline; possible mobile app.

## 11. Risks & open questions
- **Editorial scale & accuracy.** Hand-curated summaries don't scale and can be wrong. *Mitigations:* clear provenance, `lastVerified`, source links, editor workflow; explore assisted extraction with mandatory human verification.
- **Source volatility.** Society sites change structure/URLs. *Mitigation:* monitor by URL pattern (not fragile CSS) and by title similarity; `MISSING` detection flags moved/retired documents.
- **Copyright/licensing.** Summaries must stay original and link out. *Open question:* per-publisher terms and whether any partnerships are needed.
- **Regulatory drift.** If features ever edge toward patient-specific advice, device classification could apply. *Mitigation:* hold the "information index" line; legal review before launch.
- **Bilingual precision.** Thesaurus curation is manual and error-prone at scale. *Open question:* how to source/maintain synonym sets (e.g. map to a controlled vocabulary such as ICD/SNOMED/MeSH).
- **Trust & liability.** Clinicians must never treat a summary as the authority. *Mitigation:* summaries are secondary to the source everywhere in the UI; prominent disclaimers.

## 12. Open decisions for the originating user
- Confirm the **initial specialty focus** (PoC assumes gastroenterology, matching the examples).
- Confirm the **first societies** to cover exhaustively beyond the PoC sample.
- Decide the **editorial model** (who verifies content and how often) — the single biggest determinant of trustworthiness.
