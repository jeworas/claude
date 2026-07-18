/**
 * GuidelineAtlas — guideline-source worklist + fetcher.
 *
 * The society registry (data/societies.ts) maps *where* guidelines are
 * published. This turns that map into an actionable ingestion worklist and,
 * where the network allows, discovers and downloads the actual documents.
 *
 * Three modes:
 *   (default)   Build the download worklist — every society with its
 *               guideline-index URL and how many guidelines we've already
 *               ingested. Writes data/guideline-sources.json and prints a
 *               summary grouped by specialty. Needs no network.
 *   --fetch     Additionally fetch each society's index and count/sample the
 *               candidate guideline documents linked from it. Degrades
 *               gracefully when outbound HTTPS is blocked (marks unreachable).
 *   --download  Implies --fetch; save discovered PDFs under downloads/<id>/
 *               (git-ignored). Only runs where the index is reachable.
 *
 * Filters: --specialty=<slug> --region=<US|EU|UK|PL|INT> --society=<id>
 *          --limit=<n> --json
 *
 * Usage:
 *   npm run sources                       # write + print the worklist
 *   npm run sources -- --specialty=cardiology
 *   npm run sources -- --region=PL --json
 *   npm run sources -- --fetch            # try to reach each index
 *   npm run sources -- --download --society=acg
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';
import { parse } from 'node-html-parser';
import { societies } from '../data/societies';
import { guidelines } from '../data/guidelines';
import type { Society } from '../src/lib/types';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(`--${name}`);
const opt = (name: string) =>
  (argv.find((a) => a.startsWith(`--${name}=`)) ?? '').split('=').slice(1).join('=') || null;

const flags = {
  fetch: flag('fetch') || flag('download'),
  download: flag('download'),
  json: flag('json'),
  specialty: opt('specialty'),
  region: opt('region'),
  society: opt('society'),
  limit: opt('limit') ? Number(opt('limit')) : null,
};

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept-Language': 'en,pl;q=0.9',
  Accept: 'text/html,application/xhtml+xml,application/pdf',
};

/** Ingested-guideline count per society (current editions only). */
const ingestedCount = new Map<string, number>();
for (const g of guidelines) {
  if (g.status !== 'current') continue;
  ingestedCount.set(g.societyId, (ingestedCount.get(g.societyId) ?? 0) + 1);
}

function selectSocieties(): Society[] {
  let list = societies;
  if (flags.society) list = list.filter((s) => s.id === flags.society);
  if (flags.region) list = list.filter((s) => s.country === flags.region);
  if (flags.specialty) list = list.filter((s) => s.specialties.includes(flags.specialty!));
  if (flags.limit && flags.limit > 0) list = list.slice(0, flags.limit);
  return list;
}

// ── Document discovery (only used with --fetch) ───────────────────────────────
const NAV_WORDS = new Set([
  'home', 'login', 'log in', 'register', 'contact', 'about', 'about us', 'search',
  'menu', 'news', 'events', 'membership', 'join', 'donate', 'privacy', 'cookies',
  'terms', 'sitemap', 'back', 'next', 'previous', 'read more', 'more', 'pdf',
  'download', 'share', 'print', 'subscribe', 'newsletter', 'careers', 'shop',
]);

function looksLikeDocument(href: string, text: string, indexUrl: string): boolean {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:'))
    return false;
  let u: URL;
  try {
    u = new URL(href, indexUrl);
  } catch {
    return false;
  }
  if (!/^https?:$/.test(u.protocol)) return false;
  if (extname(u.pathname).toLowerCase() === '.pdf') return true; // a document file
  // Otherwise: a same-site sub-page under the index path, with a title-like label.
  let base: URL;
  try {
    base = new URL(indexUrl);
  } catch {
    return false;
  }
  if (u.host !== base.host) return false;
  const basePath = base.pathname.replace(/\/+$/, '');
  if (!u.pathname.startsWith(basePath) || u.pathname.replace(/\/+$/, '') === basePath) return false;
  const label = text.replace(/\s+/g, ' ').trim();
  if (label.length < 15) return false;
  if (NAV_WORDS.has(label.toLowerCase())) return false;
  return true;
}

interface DiscoveredDoc {
  title: string;
  url: string;
  isPdf: boolean;
}

function discoverDocuments(html: string, indexUrl: string): DiscoveredDoc[] {
  const doc = parse(html);
  const seen = new Set<string>();
  const out: DiscoveredDoc[] = [];
  for (const a of doc.querySelectorAll('a')) {
    const href = (a.getAttribute('href') || '').trim();
    const text = a.text || '';
    if (!looksLikeDocument(href, text, indexUrl)) continue;
    const url = new URL(href, indexUrl).href;
    if (seen.has(url)) continue;
    seen.add(url);
    out.push({ title: text.replace(/\s+/g, ' ').trim() || url, url, isPdf: extname(url).toLowerCase() === '.pdf' });
  }
  return out;
}

interface FetchResult {
  reachable: boolean;
  status?: number;
  note: string;
  docs: DiscoveredDoc[];
  downloaded: number;
}

async function fetchIndex(society: Society): Promise<FetchResult> {
  try {
    const res = await fetch(society.guidelinesIndexUrl, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      return { reachable: false, status: res.status, note: `HTTP ${res.status}`, docs: [], downloaded: 0 };
    }
    const html = await res.text();
    const docs = discoverDocuments(html, society.guidelinesIndexUrl);
    let downloaded = 0;
    if (flags.download) downloaded = await downloadPdfs(society, docs);
    return { reachable: true, status: res.status, note: `HTTP ${res.status}`, docs, downloaded };
  } catch (err) {
    const e = err as { name?: string; message?: string };
    return {
      reachable: false,
      note: `${e.name || 'error'}: ${e.message || 'network unreachable'}`,
      docs: [],
      downloaded: 0,
    };
  }
}

async function downloadPdfs(society: Society, docs: DiscoveredDoc[]): Promise<number> {
  const pdfs = docs.filter((d) => d.isPdf);
  if (pdfs.length === 0) return 0;
  const dir = join(root, 'downloads', society.id);
  mkdirSync(dir, { recursive: true });
  let n = 0;
  for (const d of pdfs) {
    try {
      const res = await fetch(d.url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(30000) });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const name = (d.url.split('/').pop() || `doc-${n}.pdf`).replace(/[^\w.-]+/g, '_');
      writeFileSync(join(dir, name), buf);
      n += 1;
    } catch {
      /* skip unreachable file */
    }
  }
  return n;
}

// ── Worklist ──────────────────────────────────────────────────────────────────
async function run() {
  const selected = selectSocieties();
  if (selected.length === 0) {
    console.error('No societies match the given filters.');
    process.exit(1);
  }

  const entries = [];
  for (const s of selected) {
    const base = {
      id: s.id,
      abbreviation: s.abbreviation,
      name: s.name,
      region: s.country,
      specialties: s.specialties,
      homepage: s.homepage,
      guidelinesIndexUrl: s.guidelinesIndexUrl,
      ingested: ingestedCount.get(s.id) ?? 0,
    };
    if (flags.fetch) {
      const r = await fetchIndex(s);
      entries.push({
        ...base,
        reachable: r.reachable,
        fetchNote: r.note,
        documentsDiscovered: r.docs.length,
        pdfsDiscovered: r.docs.filter((d) => d.isPdf).length,
        downloaded: r.downloaded,
        sample: r.docs.slice(0, 5),
      });
    } else {
      entries.push(base);
    }
  }

  // The worklist is always written (source of truth for the ingestion pipeline).
  const manifest = {
    note: 'Auto-generated by `npm run sources` from data/societies.ts. The download worklist: every mapped society and the guideline-index URL to ingest from. Regenerate after editing the registry.',
    generatedFrom: 'data/societies.ts',
    societyCount: societies.length,
    entries: societies.map((s) => ({
      id: s.id,
      abbreviation: s.abbreviation,
      name: s.name,
      region: s.country,
      specialties: s.specialties,
      guidelinesIndexUrl: s.guidelinesIndexUrl,
      ingested: ingestedCount.get(s.id) ?? 0,
    })),
  };
  writeFileSync(join(root, 'data/guideline-sources.json'), JSON.stringify(manifest, null, 2) + '\n');

  if (flags.json) {
    console.log(JSON.stringify(entries, null, 2));
    return;
  }
  printReport(entries);
}

function printReport(entries: Array<Record<string, unknown>>) {
  const total = societies.length;
  const shown = entries.length;
  const ingestedSocieties = societies.filter((s) => (ingestedCount.get(s.id) ?? 0) > 0).length;

  console.log('\n  GuidelineAtlas — guideline-source worklist');
  console.log('  ' + '─'.repeat(56));
  console.log(
    `  ${total} societies mapped · ${ingestedSocieties} with guidelines ingested · ${total - ingestedSocieties} awaiting ingestion`,
  );
  if (shown !== total) console.log(`  (showing ${shown} matching the filter)`);
  console.log('  worklist written → data/guideline-sources.json');

  // Group the shown entries by specialty for a scannable overview.
  const bySpecialty = new Map<string, Array<Record<string, unknown>>>();
  for (const e of entries) {
    for (const sp of e.specialties as string[]) {
      const list = bySpecialty.get(sp) ?? [];
      list.push(e);
      bySpecialty.set(sp, list);
    }
  }
  for (const sp of [...bySpecialty.keys()].sort()) {
    console.log(`\n  ▸ ${sp.replace(/-/g, ' ')}`);
    for (const e of bySpecialty.get(sp)!) {
      const tags: string[] = [`${e.region}`];
      const ing = e.ingested as number;
      tags.push(ing > 0 ? `${ing} ingested` : 'not yet ingested');
      if (flags.fetch) {
        tags.push(
          e.reachable
            ? `reachable · ${e.documentsDiscovered} docs (${e.pdfsDiscovered} PDF)` +
                (flags.download ? ` · ${e.downloaded} downloaded` : '')
            : `unreachable (${e.fetchNote})`,
        );
      }
      console.log(`     • ${e.abbreviation} — ${e.name}`);
      console.log(`       ${e.guidelinesIndexUrl}`);
      console.log(`       [${tags.join(' · ')}]`);
    }
  }

  console.log('\n  ' + '─'.repeat(56));
  if (!flags.fetch) {
    console.log('  Run with --fetch to reach each index (needs outbound HTTPS),');
    console.log('  or --download to save discovered PDFs under downloads/.\n');
  } else {
    const unreachable = entries.filter((e) => !e.reachable).length;
    if (unreachable === entries.length) {
      console.log('  All indexes unreachable — outbound HTTPS is blocked in this');
      console.log('  environment. Run --fetch where the network is open.\n');
    } else {
      console.log(`  ${entries.length - unreachable}/${entries.length} indexes reached.\n`);
    }
  }
}

run().catch((err) => {
  console.error('fetch-guidelines failed:', err);
  process.exit(1);
});
