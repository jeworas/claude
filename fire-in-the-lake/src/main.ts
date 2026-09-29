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

const hud = new Hud(document.getElementById('hud')!, {
  onAction: (v, a) => act(v, a),
  onUndo: () => undo(),
  onNewGame: () => { botToken++; busy = false; showStart(); },
  onSave: () => saveFile(),
  onLoad: () => loadFile(),
  onSpeed: (v) => { speed = v; stage.speed = fast ? 5 : 0.8 + v / 40; },
  onFF: (on) => { fast = on; stage.speed = on ? 5 : 0.8 + speed / 40; },
  onResetView: () => resetCamera(true),
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

function resetCamera(animate = false) {
  const b = board.bounds;
  const c = b.getCenter(new THREE.Vector3());
  const size = b.getSize(new THREE.Vector3());
  const aspect = stage.camera.aspect;
  const vfov = (stage.camera.fov * Math.PI) / 180;
  const fitH = size.z * 0.5 / Math.tan(vfov / 2);
  const fitW = (size.x * 0.55) / (Math.tan(vfov / 2) * aspect);
  const dist = Math.max(fitH, fitW) * 1.16;
  const target = new THREE.Vector3(c.x - 3, 0, c.z + 6);
  const pos = new THREE.Vector3(target.x, dist * 0.86, target.z + dist * 0.52);
  if (animate) {
    const p0 = stage.camera.position.clone(), t0 = stage.controls.target.clone();
    stage.tween(0.8, (k) => {
      const e = k * k * (3 - 2 * k);
      stage.camera.position.lerpVectors(p0, pos, e);
      stage.controls.target.lerpVectors(t0, target, e);
    });
  } else { stage.camera.position.copy(pos); stage.controls.target.copy(target); }
}

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
  pieces.update(g, pieceKeys);
  hud.update(g, view, busy, thinking);
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
  pieces.reset();
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
    render();
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
  (window as any).__fitl = { get g() { return g; }, stage, board, begin, api: () => api };
  const q = new URLSearchParams(location.search);
  if (q.has('auto')) {
    const sc = q.get('auto') || 'short';
    const humans = (q.get('humans') ?? 'US').split(',').filter(Boolean) as Faction[];
    begin(api.newGame(sc, humans, parseInt(q.get('seed') ?? '42', 10)));
  }
})();
