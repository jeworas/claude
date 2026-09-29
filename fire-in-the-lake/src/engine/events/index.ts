// Event engine entry point: the 'event' and 'pivotal' states plus playability checks.
// Importing this module registers every event helper state and every card implementation.
import type { Faction, Game } from '../../core/types';
import { cloneGame, doAction, getView, log, pop, push, registerState, top } from '../../core/framework';
import { IMPL } from './helpers';
import './cards_001_030';
import './cards_031_060';
import './cards_061_090';
import './cards_091_120';
import { PIVOTAL, pivotalPrecondition } from './pivotal';

export { IMPL, TEXT } from './helpers';

function signature(g: Game): string {
  return JSON.stringify([
    g.spaces, g.available, g.casualties, g.out_of_play, g.resources, g.aid, g.patronage, g.trail,
    g.capabilities, g.momentum, g.next_eligible, g.next_ineligible,
  ]);
}

// Does this side of the card do anything right now? Cards may provide a cheap uOk/sOk override; otherwise the
// event is dry-run on a clone (taking the first substantive action offered each time) and compared.
export function eventPlayable(g: Game, card: number, shaded: boolean): boolean {
  const impl = IMPL[card];
  if (!impl) return false;
  const steps = shaded ? impl.s : impl.u;
  if (steps.length === 0) return false;
  const ok = shaded ? impl.sOk : impl.uOk;
  if (ok) return ok(g);
  try {
    const c = cloneGame(g);
    c.undo = [];
    c.stack = [];
    c.over = false;
    const before = signature(c);
    push(c, 'event', { card, shaded, faction: (g.active ?? 'US') as Faction });
    for (let i = 0; i < 250 && c.stack.length > 0; i++) {
      const t = top(c)!;
      if (t.state !== 'event' && !t.state.startsWith('ev_')) return true; // a free Op / SA was granted
      const acts = getView(c).actions.filter((a) => a.verb !== 'undo');
      if (acts.length === 0) break;
      const pick = acts.find((a) => a.verb !== 'done' && a.verb !== 'cancel') ?? acts[0];
      doAction(c, pick.verb, pick.arg);
      if (signature(c) !== before) return true;
    }
    return signature(c) !== before;
  } catch {
    return true;
  }
}

registerState('pivotal', {
  faction: (g, a) => a.faction,
  enter(g, a) {
    a.i = 0;
    a.d = {};
    a.last = null;
    log(g, `${a.faction} plays pivotal event ${a.card}.`);
    if (!g.pivotal_played.includes(a.faction)) g.pivotal_played.push(a.faction);
    g.pivotal_available = g.pivotal_available.filter((f) => f !== a.faction);
    const steps = PIVOTAL[a.card] ?? [];
    runPivotal(g, a, steps);
  },
  prompt(g, a, p) {
    p.text('Pivotal event in progress');
    p.action('done', undefined, 'Continue');
  },
  act(g, a) {
    runPivotal(g, a, PIVOTAL[a.card] ?? []);
  },
  resume(g, a, result) {
    a.last = result ?? null;
    if (!a.busy) runPivotal(g, a, PIVOTAL[a.card] ?? []);
  },
});

function runPivotal(g: Game, a: any, steps: ((g: Game, c: any) => void)[]): void {
  a.busy = true;
  try {
    for (;;) {
      if (top(g)?.args !== a) return;
      if (a.i >= steps.length) { a.busy = false; pop(g, { done: true }); return; }
      const step = steps[a.i++];
      step(g, { card: a.card, shaded: false, faction: a.faction, last: a.last, d: a.d });
    }
  } finally {
    a.busy = false;
  }
}

export function pivotalPreconditionMet(g: Game, card: number): boolean {
  return pivotalPrecondition(g, card);
}
