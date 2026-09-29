// 'op_menu' state: args {faction, limited, sa, free}.
// Offers the faction's four Operations and, when sa is true, its three Special Activities.
// The SA may be done before, during (between spaces is not modelled) or after the Operation, or
// declined (4.1). Special Activities that may only accompany certain Operations are enforced in
// both directions (4.1.1). Pops with {done: true, used_op, used_sa, spaces}.
// Verbs: 'op' arg <state name>, 'sa' arg <state name>, 'cav' arg <space>, 'done'.

import { registerState, push, pop, log, hasState } from '../core/framework';
import type { Faction, Game } from '../core/types';
import { isMonsoon } from './sequence';
import { space } from '../core/pieces';

export const OP_STATES: Record<Faction, string[]> = {
  US: ['op_train', 'op_patrol', 'op_sweep', 'op_assault'],
  ARVN: ['op_train', 'op_patrol', 'op_sweep', 'op_assault'],
  NVA: ['op_rally', 'op_march', 'op_attack', 'op_terror'],
  VC: ['op_rally', 'op_march', 'op_attack', 'op_terror'],
};

export const SA_STATES: Record<Faction, string[]> = {
  US: ['sa_advise', 'sa_air_lift', 'sa_air_strike'],
  ARVN: ['sa_govern', 'sa_transport', 'sa_raid'],
  NVA: ['sa_infiltrate', 'sa_bombard', 'sa_ambush'],
  VC: ['sa_tax', 'sa_subvert', 'sa_ambush'],
};

export const STATE_LABEL: Record<string, string> = {
  op_train: 'Train', op_patrol: 'Patrol', op_sweep: 'Sweep', op_assault: 'Assault',
  op_rally: 'Rally', op_march: 'March', op_attack: 'Attack', op_terror: 'Terror',
  sa_advise: 'Advise', sa_air_lift: 'Air Lift', sa_air_strike: 'Air Strike',
  sa_govern: 'Govern', sa_transport: 'Transport', sa_raid: 'Raid',
  sa_infiltrate: 'Infiltrate', sa_bombard: 'Bombard', sa_ambush: 'Ambush',
  sa_tax: 'Tax', sa_subvert: 'Subvert',
};

// Which Operations each restricted Special Activity may accompany (4.1.1, 4.2-4.5).
const ACCOMPANY: Record<string, string[]> = {
  sa_advise: ['op_train', 'op_patrol'],
  sa_govern: ['op_train', 'op_patrol'],
  sa_raid: ['op_patrol', 'op_sweep', 'op_assault'],
  sa_infiltrate: ['op_rally', 'op_march'],
  sa_subvert: ['op_rally', 'op_march', 'op_terror'],
  sa_ambush: ['op_march', 'op_attack'],
};

// Resource cost per selected space for an Operation (0 for US, whose costs are per action
// inside the op). ARVN Patrol costs 3 in total, not per space.
export function opCost(faction: Faction, state: string): number {
  if (faction === 'US') return 0;
  if (faction === 'ARVN') return 3;
  return state === 'op_march' || state === 'op_rally' || state === 'op_attack' || state === 'op_terror' ? 1 : 0;
}

function opAllowed(g: Game, a: any, state: string): boolean {
  const f: Faction = a.faction;
  if (!hasState(state)) return false;
  if (isMonsoon(g) && (state === 'op_sweep' || state === 'op_march')) return false;
  if (state === 'op_assault' && f === 'US' && g.momentum.includes(78)) return false; // Lansdale (shaded)
  if (a.saState && ACCOMPANY[a.saState] && !ACCOMPANY[a.saState].includes(state)) return false;
  return true;
}

function saAllowed(g: Game, a: any, state: string): boolean {
  if (!hasState(state)) return false;
  if (a.opState && ACCOMPANY[state] && !ACCOMPANY[state].includes(a.opState)) return false;
  if (state === 'sa_air_strike' && (g.momentum.includes(41) || g.momentum.includes(10) || g.momentum.includes(22))) return false; // Bombing Pause / Rolling Thunder / Da Nang
  if (state === 'sa_air_lift' && (g.momentum.includes(115) || (g.momentum.includes(15) && g.tmp?.momentum_side?.[15] === 'shaded'))) return false; // Typhoon Kate / Medevac
  if ((state === 'sa_transport' || state === 'sa_bombard') && g.momentum.includes(115)) return false;
  return true;
}

function finishMenu(g: Game, a: any): void {
  pop(g, { done: true, used_op: a.used_op, used_sa: a.used_sa, spaces: a.spaces });
}

function ready(a: any): boolean {
  return a.used_op && (!a.sa || a.used_sa);
}

// Armored Cavalry (unshaded): after Ops, ARVN may Assault free in 1 Transport destination.
function cavPending(a: any): boolean {
  return !!(a.cav && a.cav.length && !a.cavDone);
}

registerState('op_menu', {
  faction: (_g, a) => a.faction,
  enter(g, a) {
    g.active = a.faction;
    a.used_op = false;
    a.used_sa = false;
    a.attempts = 0;
    a.spaces = [];
    a.opState = null;
    a.saState = null;
    a.opSpaces = [];
    a.saSpaces = [];
  },
  prompt(g, a, p) {
    const f: Faction = a.faction;
    if (a.phase === 'cav') {
      p.text('Armored Cavalry: ARVN may Assault free in 1 Transport destination.');
      for (const d of a.cav) p.space(d, space(d).name);
      p.action('done', undefined, 'No free Assault; finish');
      return;
    }
    const lim = a.limited ? 'Limited ' : '';
    p.text(`${f}: ${a.used_op ? 'Operation done. ' : `choose a ${lim}Operation. `}${a.sa ? (a.used_sa ? 'Special Activity done.' : 'You may also perform a Special Activity (before or after the Operation).') : ''}`);
    if (!a.used_op) {
      for (const s of OP_STATES[f]) if (opAllowed(g, a, s)) p.action('op', s, `${lim}${STATE_LABEL[s]}`);
    }
    if (a.sa && !a.used_sa) {
      for (const s of SA_STATES[f]) if (saAllowed(g, a, s)) p.action('sa', s, `Special Activity: ${STATE_LABEL[s]}`);
    }
    if (a.used_op || a.attempts > 0) p.action('done', undefined, 'Finish (end this action)');
    else if (!OP_STATES[f].some((s) => opAllowed(g, a, s))) p.action('done', undefined, 'Finish (no Operation is available)');
  },
  act(g, a, verb, arg) {
    if (a.phase === 'cav') {
      if (verb === 'space') {
        a.cavDone = true;
        a.phase = 'cav_done';
        push(g, 'op_assault', { faction: 'ARVN', free: true, spaces: [String(arg)], max: 1, noFollow: true });
      } else { a.cavDone = true; finishMenu(g, a); }
      return;
    }
    if (verb === 'done') {
      if (cavPending(a)) { a.phase = 'cav'; return; }
      finishMenu(g, a);
      return;
    }
    const state = String(arg);
    const args: any = { faction: a.faction, free: !!a.free };
    if (verb === 'op') {
      a.cur = 'op';
      a.curState = state;
      if (a.limited) { args.limited = true; args.max = 1; }
      if (a.saState && (a.saState === 'sa_advise' || a.saState === 'sa_govern') && state === 'op_train') args.exclude = [...a.saSpaces];
    } else {
      a.cur = 'sa';
      a.curState = state;
      if (g.momentum.includes(115)) args.max = 1; // Typhoon Kate: other SAs max 1 space
      if ((state === 'sa_advise' || state === 'sa_govern') && a.opState === 'op_train') args.exclude = [...a.opSpaces];
    }
    log(g, `${a.faction} ${verb === 'op' ? 'Operation' : 'Special Activity'}: ${STATE_LABEL[state]}.`);
    push(g, state, args);
  },
  resume(g, a, result) {
    if (a.phase === 'cav_done') { finishMenu(g, a); return; }
    const spaces: string[] = result && Array.isArray(result.spaces) ? result.spaces : [];
    const did = spaces.length > 0 || !!(result && result.used);
    if (did) {
      if (a.cur === 'op') { a.used_op = true; a.opState = a.curState; a.opSpaces = spaces; }
      else { a.used_sa = true; a.saState = a.curState; a.saSpaces = spaces; }
      for (const s of spaces) if (!a.spaces.includes(s)) a.spaces.push(s);
      if (result && result.cav) a.cav = result.cav;
    } else {
      a.attempts++;
    }
    g.active = a.faction;
    a.cur = undefined;
    if (ready(a)) {
      if (cavPending(a)) { a.phase = 'cav'; return; }
      finishMenu(g, a);
    }
  },
});
