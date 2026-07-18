#!/usr/bin/env node
/**
 * GuidelineAtlas — demo update-checker.
 *
 * Demonstrates the "keep the database up to date" pipeline: fetch a society's
 * public guidelines index, extract guideline links, and diff them against what
 * we already have (data/known-urls.json) to surface guidelines we don't yet
 * track (NEW) or that we track but no longer see on the site (MISSING).
 *
 * This is a proof-of-concept sketch, not a production crawler. It parses by URL
 * pattern (resilient to WordPress theme changes) and matches titles fuzzily.
 *
 * Network note: general outbound HTTPS is blocked in some sandboxes. The script
 * attempts a live fetch and, on any failure, falls back to a committed HTML
 * fixture so it always produces output. It never writes to the dataset.
 *
 * Usage:
 *   npm run check-updates                # all sources (live, fixture fallback)
 *   npm run check-updates -- --offline   # skip network, use fixtures only
 *   npm run check-updates -- --source=ptg-e
 *   npm run check-updates -- --json
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parse } from 'node-html-parser';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const flags = {
  offline: argv.includes('--offline'),
  live: argv.includes('--live'),
  json: argv.includes('--json'),
  source: (argv.find((a) => a.startsWith('--source=')) ?? '').split('=')[1] || null,
};

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept-Language': 'en,pl;q=0.9',
  Accept: 'text/html,application/xhtml+xml',
};

/**
 * Source definitions. `match(href)` decides whether a link is a guideline page;
 * we key on stable URL patterns rather than fragile CSS selectors.
 */
const SOURCES = [
  {
    id: 'acg',
    label: 'ACG — gi.org/guidelines',
    societyIds: ['acg'],
    indexUrl: 'https://gi.org/guidelines/',
    fixture: 'scripts/fixtures/gi-org-guidelines.html',
    match: (href) => /\/guideline\/[^/]+\/?$/i.test(href), // singular /guideline/<slug>/
  },
  {
    id: 'ptg-e',
    label: 'PTG-E — ptg-e.org.pl/wytyczne',
    societyIds: ['ptg-e'],
    indexUrl: 'https://ptg-e.org.pl/wytyczne/',
    fixture: 'scripts/fixtures/ptg-e-wytyczne.html',
    // /wytyczne/<slug>/ but not the bare category pages, or an uploaded PDF.
    match: (href) => {
      if (/\/wp-content\/uploads\/.*\.pdf$/i.test(href)) return true;
      const m = href.match(/\/wytyczne\/([^/]+)\/?$/i);
      if (!m) return false;
      const CATEGORIES = new Set(['ibd', 'endoskopia', 'pankreatologia', 'onkologia', 'watroba']);
      return !CATEGORIES.has(m[1].toLowerCase());
    },
  },
];

const POLISH_MAP = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' };

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (ch) => POLISH_MAP[ch] ?? ch)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function tokens(text) {
  return new Set(normalize(text).split(' ').filter((t) => t.length > 2));
}

/**
 * Title matching uses IDF-weighted overlap so that boilerplate shared by most
 * titles ("ACG", "Clinical", "Guideline", "Management") counts for little and
 * the distinctive disease term drives the match. Without this, every new ACG
 * guideline would look like an existing one because of the shared prefix.
 */
function buildIdf(known) {
  const df = new Map();
  let docs = 0;
  for (const k of known) {
    for (const field of [k.title, k.titleLocal]) {
      if (!field) continue;
      docs += 1;
      for (const t of tokens(field)) df.set(t, (df.get(t) ?? 0) + 1);
    }
  }
  return { df, docs };
}

function idf(token, model) {
  return Math.log((model.docs + 1) / ((model.df.get(token) ?? 0) + 0.5));
}

/**
 * How much of the candidate title's meaningful content is explained by a known
 * title (0..1), weighting each token by its IDF. Candidate-relative, so a
 * candidate carrying a distinctive unseen term (e.g. "diverticulitis") scores
 * low against everything and is flagged NEW.
 */
function weightedSimilarity(candidate, knownField, model) {
  const cb = tokens(knownField);
  let shared = 0;
  let denom = 0;
  for (const t of tokens(candidate)) {
    const w = idf(t, model);
    denom += w;
    if (cb.has(t)) shared += w;
  }
  return denom > 0 ? shared / denom : 0;
}

const SIMILARITY_THRESHOLD = 0.5;

function loadKnown() {
  const data = JSON.parse(readFileSync(join(root, 'data/known-urls.json'), 'utf8'));
  return data.known;
}

async function getHtml(source) {
  if (!flags.offline) {
    try {
      const res = await fetch(source.indexUrl, {
        headers: BROWSER_HEADERS,
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const html = await res.text();
        return { html, origin: 'live', note: `fetched ${source.indexUrl} (HTTP ${res.status})` };
      }
      return {
        html: readFixture(source),
        origin: 'fixture',
        note: `live fetch returned HTTP ${res.status}; using committed fixture`,
      };
    } catch (err) {
      return {
        html: readFixture(source),
        origin: 'fixture',
        note: `live fetch failed (${err.name || 'error'}: ${err.message}); using committed fixture`,
      };
    }
  }
  return { html: readFixture(source), origin: 'fixture', note: 'offline mode; using committed fixture' };
}

function readFixture(source) {
  return readFileSync(join(root, source.fixture), 'utf8');
}

/** Extract distinct guideline candidates ({title, url}) from an index page. */
function extractGuidelines(html, source) {
  const doc = parse(html);
  const seen = new Set();
  const found = [];
  for (const a of doc.querySelectorAll('a')) {
    const href = (a.getAttribute('href') || '').trim();
    if (!href || !source.match(href)) continue;
    const url = absolutize(href, source.indexUrl);
    const title = a.text.replace(/\s+/g, ' ').trim();
    // PDF links often have text "PDF"; skip those as titles but keep the page links.
    if (!title || title.toLowerCase() === 'pdf') continue;
    const key = normalize(title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    found.push({ title, url });
  }
  return found;
}

function absolutize(href, base) {
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
}

function diffSource(found, known) {
  const results = { new: [], known: [] };
  const matchedKnownKeys = new Set();
  const idfModel = buildIdf(known);

  for (const g of found) {
    let best = null;
    for (const k of known) {
      const sim = Math.max(
        weightedSimilarity(g.title, k.title, idfModel),
        k.titleLocal ? weightedSimilarity(g.title, k.titleLocal, idfModel) : 0,
      );
      if (!best || sim > best.sim) best = { k, sim };
    }
    if (best && best.sim >= SIMILARITY_THRESHOLD) {
      results.known.push({ ...g, matchedId: best.k.id, similarity: Number(best.sim.toFixed(2)) });
      matchedKnownKeys.add(best.k.id);
    } else {
      results.new.push(g);
    }
  }

  const missing = known.filter((k) => !matchedKnownKeys.has(k.id));
  return { ...results, missing };
}

async function run() {
  const sources = SOURCES.filter((s) => !flags.source || s.id === flags.source);
  if (sources.length === 0) {
    console.error(`Unknown --source=${flags.source}. Known: ${SOURCES.map((s) => s.id).join(', ')}`);
    process.exit(1);
  }

  const allKnown = loadKnown();
  const report = [];

  for (const source of sources) {
    const known = allKnown.filter((k) => source.societyIds.includes(k.societyId));
    const { html, origin, note } = await getHtml(source);
    const found = extractGuidelines(html, source);
    const diff = diffSource(found, known);
    report.push({ source: source.id, label: source.label, origin, note, counts: {
      discovered: found.length, new: diff.new.length, known: diff.known.length, missing: diff.missing.length,
    }, ...diff });
  }

  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  printReport(report);
}

function printReport(report) {
  console.log('\n  GuidelineAtlas — guideline update check');
  console.log('  ' + '─'.repeat(52));
  for (const r of report) {
    console.log(`\n  ▸ ${r.label}`);
    console.log(`    source: ${r.origin.toUpperCase()} — ${r.note}`);
    console.log(
      `    discovered ${r.counts.discovered} · known ${r.counts.known} · NEW ${r.counts.new} · missing ${r.counts.missing}`,
    );

    if (r.new.length) {
      console.log(`\n    🟢 NEW — on the site, not in our dataset:`);
      for (const g of r.new) console.log(`       • ${g.title}\n         ${g.url}`);
    }
    if (r.missing.length) {
      console.log(`\n    🟠 MISSING — in our dataset, not found on the site this run:`);
      for (const g of r.missing) console.log(`       • ${g.title}`);
    }
    if (!r.new.length && !r.missing.length) {
      console.log(`\n    ✓ In sync — everything discovered is already tracked.`);
    }
  }
  const totalNew = report.reduce((n, r) => n + r.new.length, 0);
  console.log('\n  ' + '─'.repeat(52));
  console.log(
    `  ${totalNew} new guideline(s) to review. This is a demo — no data was written.\n`,
  );
}

run().catch((err) => {
  console.error('check-updates failed:', err);
  process.exit(1);
});
