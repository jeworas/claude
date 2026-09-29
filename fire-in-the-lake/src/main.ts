import './ui/styles.css';
import type { Faction, Game, View } from './core/types';
import { SPACES } from './data/map';
import { SCENARIOS } from './data/scenarios';
import { Stage } from './ui/scene';
import { Board, worldPos } from './ui/board';
import { PieceLayer } from './ui/pieces';
import { Hud } from './ui/hud';
import { Input } from './ui/input';
import { StartScreen } from './ui/start';
import { HelpDrawer } from './ui/help';
import { mockApi, type EngineApi } from './ui/mock';
import type { BotAction } from './ai/bot';
import * as THREE from 'three';

const SAVE_KEY = 'fitl-save-v1';
let api: EngineApi = mockApi;
let botStep: (g: Game) => BotAction = () => ({ verb: 'pass' });

async function loadEngine() {
  const useMock = new URLSearchParams(location.search).has('mock');
  if (useMock) return;
  try {
    const eng: any = await import('./engine/index');
    api = {
      newGame: (scenario, humans, seed) => eng.newGame(scenario, humans, seed),
      getView: eng.getView, doAction: eng.doAction, currentFaction: eng.currentFaction, isLegal: eng.isLegal,
    };
  } catch (e) {
    console.error('Engine failed to load, using demo mode', e);
    toastLater('Rules engine not available: running in demo mode.');
  }
  try {
    const b: any = await import('./ai/bot');
    botStep = b.botStep;
  } catch (e) { console.error('Bot failed to load', e); }
}

let pendingToast: string | null = null;
function toastLater(m: string) { pendingToast = m; }

// ------------------------------------------------------------------ state
let g: Game | null = null;
let busy = false;
let thinking: Faction | null = null;
let botToken = 0;
let speed = 60;
let fast = false;

const stage = new Stage(document.getElementById('stage')!);
const board = new Board(stage, SPACES);
const pieces = new PieceLayer(stage, board);

const help = new HelpDrawer();
const hud = new Hud(document.getElementById('hud')!, {
  onAction: (v, a) => act(v, a),
  onUndo: () => undo(),
  onNewGame: () => { botToken++; busy = false; showStart(); },
  onSave: () => saveFile(),
  onLoad: () => loadFile(),
  onSpeed: (v) => { speed = v; stage.speed = fast ? 5 : 0.8 + v / 40; },
  onFF: (on) => { fast = on; stage.speed = on ? 5 : 0.8 + speed / 40; },
  onResetView: () => resetCamera(true),
  onHelp: () => help.toggle(),
});
hud.show(false);

function humanTurn(): boolean {
  if (!g || g.over || busy) return false;
  const f = api.currentFaction(g);
  return !!f && g.humans.includes(f);
}

const input = new Input(stage, board, pieces, {
  game: () => g,
  view: () => (g ? api.getView(g) : null),
  canAct: humanTurn,
  act: (v, a) => act(v, a),
});

function updateSafeArea() {
  const q = (sel: string) => document.querySelector(sel) as HTMLElement | null;
  const vis = (e: HTMLElement | null) => !!e && getComputedStyle(e).display !== 'none' && getComputedStyle(document.getElementById('hud')!).display !== 'none';
  const left = q('#hud .left'), right = q('#hud .right');
  const hudOn = getComputedStyle(document.getElementById('hud')!).display !== 'none';
  stage.safe = {
    l: hudOn && vis(left) ? left!.offsetWidth + 14 : 0,
    r: hudOn && vis(right) ? right!.offsetWidth + 14 : 0,
    t: hudOn ? 58 : 0,
    b: hudOn ? 100 : 0,
  };
  stage.applySafe();
}

function resetCamera(animate = false) {
  updateSafeArea();
  const b = board.bounds;
  const pts: THREE.Vector3[] = [];
  for (const x of [b.min.x, b.max.x]) for (const y of [0, 1]) for (const z of [b.min.z, b.max.z]) pts.push(new THREE.Vector3(x, y, z));
  stage.fit(pts, new THREE.Vector3(0, 0.84, 0.54).normalize(), animate);
}
window.addEventListener('resize', () => { updateSafeArea(); });

// ------------------------------------------------------------------ rendering
function render() {
  if (!g) return;
  let view: View;
  try { view = api.getView(g); } catch (e) { fail(e); return; }
  const canAct = humanTurn();
  const legal = new Set<string>();
  const pieceKeys = new Set<string>();
  if (canAct) {
    for (const a of view.actions) {
      if (a.verb === 'space' && a.space) legal.add(a.space);
      else if (a.verb === 'piece' && a.space) { legal.add(a.space); if (typeof a.arg === 'string') pieceKeys.add(a.arg); }
      else if (a.space && a.verb !== 'undo') legal.add(a.space);
    }
  }
  const selected = new Set(view.selected ?? []);
  board.update(g, legal, selected);
  if (g.log.length < lastLogLen) lastLogLen = g.log.length;
  if (busy && g.log.length > lastLogLen) board.flash(spacesMentioned(g.log.slice(Math.max(lastLogLen, g.log.length - 30))));
  lastLogLen = g.log.length;
  pieces.update(g, pieceKeys);
  hud.update(g, view, busy, thinking);
}

let lastLogLen = 0;
let lastRender = 0;
const NAMES = SPACES.map((d) => [d.name, d.id] as const).sort((a, b) => b[0].length - a[0].length);
function spacesMentioned(lines: string[]): string[] {
  const out = new Set<string>();
  for (let l of lines) {
    for (const [name, id] of NAMES) if (l.includes(name)) { out.add(id); l = l.split(name).join('#'); }
  }
  return [...out];
}
/** In Fast mode, rendering is throttled so the engine can run flat out. */
function renderThrottled() {
  const now = performance.now();
  if (!fast || now - lastRender > 110) { lastRender = now; render(); }
}

function fail(e: unknown) {
  console.error(e);
  hud.toast(e instanceof Error ? e.message : String(e));
}

// ------------------------------------------------------------------ persistence
function trimmed(gm: Game, keep: number): Game {
  return { ...gm, undo: gm.undo.slice(-keep) };
}
function saveLocal() {
  if (!g) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(trimmed(g, 6))); } catch { /* quota or blocked */ }
}
function readLocal(): Game | null {
  try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}
function saveFile() {
  if (!g) return;
  const blob = new Blob([JSON.stringify(trimmed(g, 20))], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `fire-in-the-lake-${g.scenario}-${g.coup_count}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function loadFile() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'application/json,.json';
  inp.onchange = async () => {
    const f = inp.files?.[0];
    if (!f) return;
    try {
      const o = JSON.parse(await f.text());
      if (!o || !o.spaces || !o.stack) throw new Error('Not a valid Fire in the Lake save file');
      begin(o as Game);
    } catch (e) { fail(e); }
  };
  inp.click();
}

// ------------------------------------------------------------------ game flow
const startScreen = new StartScreen(document.getElementById('start')!, {
  onStart: (cfg) => {
    try { begin(api.newGame(cfg.scenario, cfg.humans, cfg.seed)); } catch (e) { fail(e); }
  },
  onContinue: () => { const s = readLocal(); if (s) begin(s); else hud.toast('No saved game found'); },
  onLoadFile: () => loadFile(),
  hasSave: () => !!readLocal(),
});

function showStart() {
  hud.show(false);
  startScreen.show();
}

function begin(gm: Game) {
  g = gm;
  botToken++;
  busy = false; thinking = null;
  startScreen.hide();
  hud.show(true);
  updateSafeArea();
  pieces.reset();
  lastLogLen = gm.log.length;
  render();
  resetCamera(false);
  saveLocal();
  void runBots();
}

function act(verb: string, arg?: string | number) {
  if (!g || !humanTurn()) return;
  try { api.doAction(g, verb, arg); } catch (e) { fail(e); render(); return; }
  input.hideMenu();
  afterAction();
}

function afterAction() {
  render();
  saveLocal();
  void runBots();
}

function undo() {
  if (!g) return;
  botToken++; busy = false; thinking = null;
  try {
    api.doAction(g, 'undo');
    // skip back over bot moves until it is a human's decision again
    let guard = 400;
    while (g.undo.length > 0 && guard-- > 0) {
      const f = api.currentFaction(g);
      if (f && g.humans.includes(f)) break;
      api.doAction(g, 'undo');
    }
  } catch (e) { fail(e); }
  input.hideMenu();
  afterAction();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const delayMs = () => (fast ? 0 : Math.round(900 * Math.pow(1 - speed / 100, 1.4)) + 30);

function pickBotAction(gm: Game): { verb: string; arg?: string | number } | null {
  try {
    const a = botStep(gm);
    if (a && api.isLegal(gm, a.verb, a.arg)) return a;
    console.warn('Bot returned an illegal action', a);
  } catch (e) { console.warn('Bot error', e); }
  const v = api.getView(gm);
  const first = v.actions.find((x) => x.verb !== 'undo');
  return first ? { verb: first.verb, arg: first.arg } : null;
}

async function runBots() {
  if (!g) return;
  const token = ++botToken;
  const gm = g;
  const isBot = () => !gm.over && (() => { const f = api.currentFaction(gm); return !!f && !gm.humans.includes(f); })();
  if (!isBot()) { busy = false; thinking = null; render(); return; }
  busy = true;
  while (token === botToken && isBot()) {
    thinking = api.currentFaction(gm);
    renderThrottled();
    await sleep(delayMs() + (fast ? 0 : 60));
    if (token !== botToken) return;
    const a = pickBotAction(gm);
    if (!a) { hud.toast('Bot has no legal action'); break; }
    try { api.doAction(gm, a.verb, a.arg); }
    catch (e) {
      fail(e);
      const v = api.getView(gm);
      const alt = v.actions.find((x) => x.verb !== 'undo' && !(x.verb === a.verb && x.arg === a.arg));
      if (!alt) break;
      try { api.doAction(gm, alt.verb, alt.arg); } catch (e2) { fail(e2); break; }
    }
    saveLocal();
    if (fast && Math.random() < 0.7) continue; // let the browser breathe now and then
    await sleep(fast ? 0 : 20);
  }
  if (token === botToken) { busy = false; thinking = null; render(); saveLocal(); }
}

// ------------------------------------------------------------------ boot
(async () => {
  await loadEngine();
  if (pendingToast) hud.toast(pendingToast, 'info');
  resetCamera(false);
  if (Object.keys(SCENARIOS).length === 0) console.warn('No scenarios');
  startScreen.show();
  // debug hooks
  (window as any).__fitl = { get g() { return g; }, stage, board, begin, render, api: () => api };
  const q = new URLSearchParams(location.search);
  if (q.has('auto')) {
    const sc = q.get('auto') || 'short';
    const humans = (q.get('humans') ?? 'US').split(',').filter(Boolean) as Faction[];
    begin(api.newGame(sc, humans, parseInt(q.get('seed') ?? '42', 10)));
  }
})();
