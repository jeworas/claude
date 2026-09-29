// 'op_menu' state: args {faction, limited, sa, free}.
// Offers the faction's four Operations and, when sa is true, its three Special Activities.
// The SA may be done before or after the Operation, or declined. Pops with
// {done: true, used_op, used_sa, spaces}.
// Verbs: 'op' arg <state name>, 'sa' arg <state name>, 'done'.

import { registerState, push, pop, log, hasState } from '../core/framework';
import type { Faction, Game } from '../core/types';
import { isMonsoon } from './sequence';

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

// Resource cost per selected space for an Operation (0 for US, whose costs are per action
// inside the op). ARVN Patrol costs 3 in total, not per space.
export function opCost(faction: Faction, state: string): number {
  if (faction === 'US') return 0;
  if (faction === 'ARVN') return 3;
  return state === 'op_march' || state === 'op_rally' || state === 'op_attack' || state === 'op_terror' ? 1 : 0;
}

function opAllowed(g: Game, faction: Faction, state: string): boolean {
  if (!hasState(state)) return false;
  if (isMonsoon(g) && (state === 'op_sweep' || state === 'op_march')) return false;
  if (state === 'op_sweep' && faction !== 'US' && faction !== 'ARVN') return false;
  return true;
}

function saAllowed(g: Game, state: string): boolean {
  if (!hasState(state)) return false;
  if (state === 'sa_air_strike' && g.momentum.includes(41)) return false; // Bombing Pause
  if (state === 'sa_air_lift' && g.momentum.includes(115)) return false;  // Typhoon Kate
  return true;
}

registerState('op_menu', {
  faction: (_g, a) => a.faction,
  enter(g, a) {
    g.active = a.faction;
    a.used_op = false;
    a.used_sa = false;
    a.attempts = 0;
    a.spaces = [];
  },
  prompt(g, a, p) {
    const f: Faction = a.faction;
    const lim = a.limited ? 'Limited ' : '';
    p.text(`${f}: ${a.used_op ? 'Operation done. ' : `choose a ${lim}Operation. `}${a.sa ? (a.used_sa ? 'Special Activity done.' : 'You may also perform a Special Activity (before or after).') : ''}`);
    if (!a.used_op) {
      for (const s of OP_STATES[f]) if (opAllowed(g, f, s)) p.action('op', s, `${lim}${STATE_LABEL[s]}`);
    }
    if (a.sa && !a.used_sa) {
      for (const s of SA_STATES[f]) if (saAllowed(g, s)) p.action('sa', s, `Special Activity: ${STATE_LABEL[s]}`);
    }
    if (a.used_op || a.attempts > 0) p.action('done', undefined, 'Finish (end this action)');
    else if (!OP_STATES[f].some((s) => opAllowed(g, f, s))) p.action('done', undefined, 'Finish (no Operation is available)');
  },
  act(g, a, verb, arg) {
    if (verb === 'done') {
      pop(g, { done: true, used_op: a.used_op, used_sa: a.used_sa, spaces: a.spaces });
      return;
    }
    const state = String(arg);
    const args: any = { faction: a.faction, free: !!a.free };
    if (verb === 'op') {
      a.cur = 'op';
      if (a.limited) { args.limited = true; args.max = 1; }
    } else {
      a.cur = 'sa';
    }
    log(g, `${a.faction} ${verb === 'op' ? 'Operation' : 'Special Activity'}: ${STATE_LABEL[state]}.`);
    push(g, state, args);
  },
  resume(g, a, result) {
    const spaces: string[] = result && Array.isArray(result.spaces) ? result.spaces : [];
    const did = spaces.length > 0 || !!(result && result.used);
    if (did) {
      if (a.cur === 'op') a.used_op = true; else a.used_sa = true;
      for (const s of spaces) if (!a.spaces.includes(s)) a.spaces.push(s);
    } else {
      a.attempts++;
    }
    g.active = a.faction;
    a.cur = undefined;
    if (a.used_op && (!a.sa || a.used_sa)) {
      pop(g, { done: true, used_op: a.used_op, used_sa: a.used_sa, spaces: a.spaces });
    }
  },
});
