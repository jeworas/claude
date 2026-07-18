# GuidelineAtlas

**A bilingual index of clinical practice guidelines from US and Polish medical societies — proof of concept.**

Find the current treatment guidelines for a condition in one search, in **English or Polish**, with a concise structured summary and a direct link to the source. Built because finding current clinical guidelines across dozens of society websites is slow and error-prone.

> ⚠️ **Demonstration project.** Guideline summaries are hand-curated sample data for a limited set of societies. This is a reference index for healthcare professionals, **not** medical advice and **not** a medical device. Always verify against the original guideline. See [`PRD.md`](./PRD.md) and the in-app `/about` page.

---

## What it does

- **Maps societies** in the US and Poland (ACG, AGA, PTG-E, NPOA, PTD, PTNT, ADA, AHA/ACC) — with ACG and PTG-E covered in full.
- **Indexes 65 real guidelines** with structured treatment summaries — the full current ACG and PTG-E gastroenterology/hepatology catalogs, plus AGA and diabetes/hypertension for breadth.
- **Bilingual search** — `colitis`, `UC`, `WZJG` and `wrzodziejące zapalenie jelita grubego` all resolve to ulcerative colitis; the UI shows *which* term matched.
- **Freshness tracking** — every guideline shows its year and a currency badge (current / aging / superseded).
- **Condition comparison** — see US vs Polish guidance side by side.
- **Update-checker** — a demo script that diffs a society's public guideline index against the database to find guidelines we don't yet track.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Then try searching `colitis`, `WZJG`, `H. pylori`, `refluks`, `budesonide`, or `cukrzyca`.

### Other commands

```bash
npm run build            # production build (fully static; runs offline)
npm run start            # serve the production build
npm run validate         # Zod data validation + flagship search assertions
npm run check-updates    # demo update-checker (live fetch, fixture fallback)
npm run gen:known-urls   # regenerate data/known-urls.json from the seed data
npm run lint
```

The web app is **fully offline after `npm install`** — all data is in the repo. Only `check-updates` touches the network.

## The bilingual update-checker

Demonstrates the "keep the database current" pipeline: fetch a society's guidelines index → extract guideline links by URL pattern → diff against `data/known-urls.json` → report **NEW** (on the site, not tracked) and **MISSING** (tracked, not found).

```bash
npm run check-updates                 # all sources
npm run check-updates -- --offline    # skip network, use committed fixtures
npm run check-updates -- --source=ptg-e
npm run check-updates -- --json
```

It attempts a real fetch of [gi.org](https://gi.org/guidelines/) and [ptg-e.org.pl](https://ptg-e.org.pl/wytyczne/) with a browser User-Agent. When outbound HTTPS is blocked (as in many sandboxes) it **falls back to committed HTML fixtures** under `scripts/fixtures/` so it always produces output.

> The fixtures in `scripts/fixtures/*.html` are **hand-authored representative mocks** of each site's WordPress structure (not live captures), including a couple of invented "new" guidelines so the diff has something to report.

## Project structure

```
data/
  societies.ts            Society registry (US + PL)
  conditions.ts           Bilingual condition thesaurus (EN/PL synonyms, ICD-10)
  guidelines/             Seed guidelines, one file per source (acg, aga, ptg-e, …)
  known-urls.json         Generated: what the update-checker diffs against
src/lib/
  types.ts                Data model
  schema.ts               Zod schemas (build-time validation)
  thesaurus.ts            Bilingual query → condition resolver
  search.ts               MiniSearch index + combined search
  data.ts                 Typed loaders / cross-reference helpers
src/components/            SearchBar, SearchExperience, GuidelineCard, badges, …
src/app/                   Routes: /, /search, /guideline/[id], /condition/[id],
                           /societies, /societies/[id], /about
scripts/
  validate.ts             npm run validate
  gen-known-urls.ts       npm run gen:known-urls
  check-updates.mjs        npm run check-updates
  fixtures/               Mock HTML for offline scraper demo
```

## How search works

Two layers (see `src/lib/thesaurus.ts` and `src/lib/search.ts`):

1. **Thesaurus resolver** — normalises the query (lowercase, strips Polish diacritics) and matches condition names, synonyms and abbreviations in either language. Guarantees `UC` ≡ `WZJG` ≡ `ulcerative colitis`, and makes `colitis` fan out to UC, Crohn's, *C. difficile* and microscopic colitis.
2. **MiniSearch full-text index** — fuzzy + prefix matching over titles, summaries, condition names, flattened synonyms, society names and drug names, so queries like `budesonide` also work.

Results merge both (thesaurus matches first), de-duplicate, and are filterable by country/society/specialty.

## Tech

Next.js (App Router) · TypeScript · Tailwind CSS · [MiniSearch](https://github.com/lucaong/minisearch) · [Zod](https://zod.dev) · [node-html-parser](https://github.com/taoqf/node-html-parser) (update-checker) · [tsx](https://github.com/privatenumber/tsx) (scripts).

## Adding a guideline

1. Add the record to the right file in `data/guidelines/` (reuse an existing `conditionId`, or add a `Condition` to `data/conditions.ts` first).
2. `npm run gen:known-urls` to refresh the update-checker's baseline.
3. `npm run validate` to check schema + references + search assertions.

## Status & data accuracy

Proof of concept. Guideline titles, years and links reflect published guidance verified via web search, but treatment summaries are **condensed original paraphrases for reference only** and each is marked with a `lastVerified` date. They omit criteria, dosing, contraindications and caveats. **Always read the original guideline before any clinical decision.**
