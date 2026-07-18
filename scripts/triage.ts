/**
 * Local guideline triage — go over everything in downloads/ and rank each PDF
 * as a real clinical guideline vs. noise (donation forms, flyers, brochures,
 * newsletters…), so you can see at a glance which downloads are worth ingesting.
 *
 * For every PDF it extracts the text, scores it from the text + filename, writes
 * a ranked report to downloads/triage-report.md, and dumps the extracted text of
 * the strong candidates to downloads/_text/ — those .txt files can be handed
 * straight to ingestion (or pasted to me) without re-uploading big PDFs.
 *
 * pdf-parse is an optional dependency, imported lazily:
 *   npm install -D pdf-parse
 *
 * Usage:
 *   npm run triage                       # scan downloads/
 *   npm run triage -- --dir=downloads/nkf
 *   npm run triage -- --min=20 --json
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const flag = (n: string) => argv.includes(`--${n}`);
const opt = (n: string) => (argv.find((a) => a.startsWith(`--${n}=`)) ?? '').split('=').slice(1).join('=') || null;
const flags = {
  dir: opt('dir') || 'downloads',
  min: opt('min') ? Number(opt('min')) : 15,
  json: flag('json'),
};

// ── PDF text extraction (optional pdf-parse) ──────────────────────────────────
async function pdfText(path: string): Promise<{ text: string; pages: number }> {
  let PDFParse: new (o: { data: Buffer }) => { getText: () => Promise<{ text?: string; total?: number }> };
  try {
    const mod = 'pdf-parse'; // non-literal → resolved at runtime, not type-checked
    PDFParse = ((await import(mod)) as { PDFParse: typeof PDFParse }).PDFParse;
  } catch {
    throw new Error('triage needs pdf-parse. Install it once:\n      npm install -D pdf-parse');
  }
  const parser = new PDFParse({ data: readFileSync(path) });
  const r = await parser.getText();
  return { text: r.text ?? '', pages: r.total ?? 0 };
}

// ── Guideline-vs-noise scoring ────────────────────────────────────────────────
const POS: [RegExp, number][] = [
  [/\bwe (recommend|suggest)\b/gi, 4],
  [/\brecommend(ation|s|ed|ing)?\b/gi, 2],
  [/\b(clinical practice guideline|practice guideline|consensus statement|guidance)\b/gi, 3],
  [/\b(diagnosis|management|treatment) of\b/gi, 1.5],
  [/\b(evidence|GRADE|certainty|quality of evidence|level of evidence|strength of recommendation)\b/gi, 1.5],
  [/\b(first-line|second-line|maintenance therapy|induction|dosing|mg\/kg|mcg)\b/gi, 1],
  [/\b(doi|pubmed|et al|circulation|lancet|n engl j med)\b/gi, 0.5],
];
const NEG: [RegExp, number][] = [
  [/\b(donat(e|ion)|tax id|credit card|501\(c\)|enclosed is my check|payment information|\bcvc\b)\b/gi, 8],
  [/\b(membership|sponsor|exhibitor|registration form|save the date|webinar|newsletter|meeting minutes)\b/gi, 4],
  // Policy / governance / admin documents that mention "guideline" but aren't one.
  // Low per-hit weight so a single incidental mention in a real guideline (e.g. a
  // one-line COI statement) doesn't sink it; genuine policy docs repeat these.
  [/\b(privacy policy|code of conduct|by-?laws|prospectus|strategic priorit|development polic|endorsement polic|commercial support|disclosure statement|year in review|regulamin|polityka prywatno|statut\b)\b/gi, 2],
  [/\b(proposal|support request|specifications|requirement for website)\b/gi, 2],
  [/\b(flyer|brochure|poster|infographic|fact sheet)\b/gi, 3],
  [/\b(talk to your doctor|ask your doctor|educate your|patients about)\b/gi, 2],
];
const FILENAME_NOISE =
  /(form|flyer|card|brochure|donation|bulletin|poster|agenda|newsletter|invite|registration|flier|prospectus|by-?laws|proposal|policy|policies|endorsement|regulamin|polityka|prywatno|statut|disclosure|strategic|symposia|postcard)/i;

function count(re: RegExp, s: string): number {
  const m = s.match(re);
  return m ? m.length : 0;
}

function score(text: string, filename: string): { score: number; pos: number; neg: number; words: number } {
  const words = text.split(/\s+/).filter(Boolean).length;
  let pos = 0;
  let neg = 0;
  for (const [re, w] of POS) pos += count(re, text) * w;
  for (const [re, w] of NEG) neg += count(re, text) * w;
  const density = pos / Math.max(1, words / 1000); // positives per 1000 words
  const fnPenalty = FILENAME_NOISE.test(filename) ? 6 : 0;
  const lengthBonus = Math.min(words / 500, 10);
  return { score: Math.round(Math.min(density, 60) - neg - fnPenalty + lengthBonus), pos: Math.round(pos), neg: Math.round(neg), words };
}

function classOf(s: number): 'guideline' | 'maybe' | 'noise' {
  if (s >= flags.min) return 'guideline';
  if (s >= 5) return 'maybe';
  return 'noise';
}

// ── Walk downloads/ ───────────────────────────────────────────────────────────
function listPdfs(dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      if (name.startsWith('_')) continue; // skip our own _text/ output
      const p = join(d, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else if (extname(name).toLowerCase() === '.pdf') out.push(p);
    }
  };
  walk(dir);
  return out;
}

interface Row {
  path: string;
  society: string;
  file: string;
  words: number;
  pages: number;
  score: number;
  cls: 'guideline' | 'maybe' | 'noise';
  error?: string;
}

async function run() {
  const scanDir = join(root, flags.dir);
  if (!existsSync(scanDir)) {
    console.error(`No such folder: ${flags.dir}. Run the downloader first (npm run sources -- --download).`);
    process.exit(1);
  }
  const pdfs = listPdfs(scanDir);
  if (pdfs.length === 0) {
    console.error(`No PDFs under ${flags.dir}.`);
    process.exit(1);
  }

  const textDir = join(scanDir, '_text');
  const rows: Row[] = [];
  for (const path of pdfs) {
    const rel = relative(scanDir, path);
    const society = rel.includes('/') || rel.includes('\\') ? rel.split(/[/\\]/)[0] : '(root)';
    const file = basename(path);
    try {
      const { text, pages } = await pdfText(path);
      const s = score(text, file);
      const cls = classOf(s.score);
      rows.push({ path, society, file, words: s.words, pages, score: s.score, cls });
      // Dump text of strong candidates for straight-to-ingestion handoff.
      if (cls !== 'noise') {
        mkdirSync(textDir, { recursive: true });
        writeFileSync(join(textDir, rel.replace(/[/\\]/g, '__') + '.txt'), text);
      }
    } catch (e) {
      rows.push({ path, society, file, words: 0, pages: 0, score: -999, cls: 'noise', error: (e as Error).message });
    }
  }
  rows.sort((a, b) => b.score - a.score);

  if (flags.json) {
    const view = rows.map((r) => ({
      society: r.society,
      file: r.file,
      score: r.score,
      cls: r.cls,
      pages: r.pages,
      words: r.words,
      ...(r.error ? { error: r.error } : {}),
    }));
    console.log(JSON.stringify(view, null, 2));
    return;
  }
  writeReport(rows, scanDir);
  printSummary(rows);
}

function writeReport(rows: Row[], scanDir: string) {
  const g = rows.filter((r) => r.cls === 'guideline');
  const m = rows.filter((r) => r.cls === 'maybe');
  const n = rows.filter((r) => r.cls === 'noise');
  const table = (rs: Row[]) =>
    ['| score | society | file | pages | words |', '|--:|---|---|--:|--:|', ...rs.map((r) => `| ${r.score} | ${r.society} | ${r.file} | ${r.pages || '?'} | ${r.words} |`)].join('\n');
  const md = [
    `# Guideline triage — ${relative(root, scanDir) || '.'}`,
    '',
    `Scanned **${rows.length}** PDFs. **${g.length}** look like guidelines, **${m.length}** maybe, **${n.length}** noise.`,
    `Extracted text for the ${g.length + m.length} non-noise files is in \`_text/\` (hand those to ingestion).`,
    '',
    `## ✅ Likely guidelines (${g.length})`,
    g.length ? table(g) : '_none_',
    '',
    `## 🟡 Maybe (${m.length})`,
    m.length ? table(m) : '_none_',
    '',
    `## ⚪ Noise (${n.length}) — forms, flyers, brochures, admin`,
    n.length ? table(n) : '_none_',
    '',
  ].join('\n');
  writeFileSync(join(scanDir, 'triage-report.md'), md);
}

function printSummary(rows: Row[]) {
  const g = rows.filter((r) => r.cls === 'guideline');
  const m = rows.filter((r) => r.cls === 'maybe');
  const n = rows.filter((r) => r.cls === 'noise');
  console.log('\n  Guideline triage');
  console.log('  ' + '─'.repeat(56));
  console.log(`  ${rows.length} PDFs · ${g.length} guidelines · ${m.length} maybe · ${n.length} noise`);
  console.log('  report → triage-report.md · extracted text → _text/\n');
  console.log('  ✅ Likely guidelines:');
  for (const r of g) console.log(`     ${String(r.score).padStart(4)}  ${r.society.padEnd(14)} ${r.file.slice(0, 52)}`);
  if (m.length) {
    console.log('\n  🟡 Maybe (skim these):');
    for (const r of m.slice(0, 20)) console.log(`     ${String(r.score).padStart(4)}  ${r.society.padEnd(14)} ${r.file.slice(0, 52)}`);
  }
  console.log(`\n  (${n.length} noise files hidden — see the report for the full list.)\n`);
}

run().catch((err) => {
  console.error('triage failed:', err.message);
  process.exit(1);
});
