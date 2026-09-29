// Tiny state-machine framework (Rally-the-Troops style, but with an explicit stack).
//
//   - Every decision point is a State registered with registerState(name, def).
//   - game.stack holds frames {state, args}; the top frame is the current decision.
//   - push() enters a sub-state; pop() returns to the parent and calls parent.resume().
//   - A state with an `enter` hook runs it once when pushed (use it for automatic steps;
//     it may push/pop further). Never loop forever: an automatic state must pop or push.
//   - UI / AI call getView(game) and doAction(game, verb, arg).
//
// All state must be JSON-serializable (it is cloned for undo and save games).

import type { ActionOption, Faction, Frame, Game, PieceKind, View } from './types';

export interface Prompt {
  text(s: string): void;
  action(verb: string, arg?: string | number, label?: string, extra?: { space?: string; piece?: PieceKind }): void;
  space(id: string, label?: string): void;                 // shorthand: verb 'space'
  piece(space: string, kind: PieceKind, label?: string): void; // verb 'piece', arg `${space}:${kind}`
  select(ids: string[]): void;
}

export interface StateDef {
  // Which faction acts in this frame. Defaults to game.active.
  faction?(g: Game, args: any): Faction | null;
  // Called once right after the frame is pushed. May push/pop (automatic steps).
  enter?(g: Game, args: any): void;
  // Build the prompt/legal actions.
  prompt(g: Game, args: any, p: Prompt): void;
  // Handle a chosen action. verb/arg are exactly what prompt() offered.
  act(g: Game, args: any, verb: string, arg: string | number | undefined): void;
  // Called when a child frame pops back to this frame. `result` is what the child passed to pop().
  resume?(g: Game, args: any, result: any): void;
}

const STATES: Record<string, StateDef> = {};

export function registerState(name: string, def: StateDef): void {
  if (STATES[name]) throw new Error(`State already registered: ${name}`);
  STATES[name] = def;
}

export function hasState(name: string): boolean {
  return !!STATES[name];
}

export function getState(name: string): StateDef {
  const s = STATES[name];
  if (!s) throw new Error(`Unknown state: ${name}`);
  return s;
}

export function top(g: Game): Frame | undefined {
  return g.stack[g.stack.length - 1];
}

export function push(g: Game, state: string, args: any = {}): void {
  const def = getState(state);
  const frame: Frame = { state, args };
  g.stack.push(frame);
  if (def.enter) def.enter(g, args);
}

// Replace the top frame (no resume on parent).
export function goto(g: Game, state: string, args: any = {}): void {
  g.stack.pop();
  push(g, state, args);
}

export function pop(g: Game, result?: any): void {
  g.stack.pop();
  const parent = top(g);
  if (parent) {
    const def = getState(parent.state);
    if (def.resume) def.resume(g, parent.args, result);
  }
}

// ---------------------------------------------------------------- RNG

export function random(g: Game, n: number): number {
  // mulberry32
  let t = (g.seed = (g.seed + 0x6d2b79f5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return Math.floor(r * n);
}

export function rollDie(g: Game): number {
  return random(g, 6) + 1;
}

export function shuffle<T>(g: Game, list: T[]): void {
  for (let i = list.length - 1; i > 0; --i) {
    const j = random(g, i + 1);
    [list[i], list[j]] = [list[j], list[i]];
  }
}

// ---------------------------------------------------------------- log

export function log(g: Game, msg: string): void {
  g.log.push(msg);
}

// ---------------------------------------------------------------- undo

export function clearUndo(g: Game): void {
  g.undo = [];
}

function snapshot(g: Game): string {
  const { undo: _u, ...rest } = g;
  return JSON.stringify(rest);
}

// ---------------------------------------------------------------- view / action

export function currentFaction(g: Game): Faction | null {
  const f = top(g);
  if (!f) return null;
  const def = getState(f.state);
  return def.faction ? def.faction(g, f.args) : g.active;
}

export function getView(g: Game): View {
  const view: View = { active: null, prompt: '', actions: [] };
  if (g.over) {
    view.prompt = g.result ?? 'Game over.';
    return view;
  }
  const f = top(g);
  if (!f) {
    view.prompt = 'No active state.';
    return view;
  }
  const def = getState(f.state);
  view.active = currentFaction(g);
  const actions: ActionOption[] = [];
  const p: Prompt = {
    text: (s) => { view.prompt = s; },
    action: (verb, arg, label, extra) => {
      actions.push({ verb, arg, label: label ?? (arg !== undefined ? `${verb} ${arg}` : verb), ...extra });
    },
    space: (id, label) => { actions.push({ verb: 'space', arg: id, label: label ?? id, space: id }); },
    piece: (space, kind, label) => {
      actions.push({ verb: 'piece', arg: `${space}:${kind}`, label: label ?? `${kind} in ${space}`, space, piece: kind });
    },
    select: (ids) => { view.selected = ids; },
  };
  def.prompt(g, f.args, p);
  if (g.undo.length > 0) actions.push({ verb: 'undo', label: 'Undo' });
  view.actions = actions;
  return view;
}

export function isLegal(g: Game, verb: string, arg?: string | number): boolean {
  return getView(g).actions.some((a) => a.verb === verb && a.arg === arg);
}

// Apply an action in place. Throws on illegal actions.
export function doAction(g: Game, verb: string, arg?: string | number): void {
  if (g.over) throw new Error('Game is over');
  if (verb === 'undo') {
    const s = g.undo.pop();
    if (!s) throw new Error('Nothing to undo');
    const undo = g.undo;
    Object.assign(g, JSON.parse(s));
    g.undo = undo;
    return;
  }
  if (!isLegal(g, verb, arg)) throw new Error(`Illegal action: ${verb} ${arg ?? ''}`);
  const snap = snapshot(g);
  const f = top(g)!;
  const def = getState(f.state);
  g.undo.push(snap);
  if (g.undo.length > 60) g.undo.shift();
  def.act(g, f.args, verb, arg);
}

export function cloneGame(g: Game): Game {
  return JSON.parse(JSON.stringify(g));
}
