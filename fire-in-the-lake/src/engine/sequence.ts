// Sequence of play (rule 2.0): the bottom 'game' frame, card flow, eligibility, 'card_choice'.
//
// Action verbs offered by 'card_choice' (for UI / bots):
//   'event'      arg 'unshaded' | 'shaded'   execute the Event (pushes 'event' {card, shaded, faction})
//   'op'         Operation only (full)       pushes 'op_menu' {faction, limited:false, sa:false, free:false}
//   'op_sa'      Operation + Special Activity  pushes 'op_menu' {..., sa:true}
//   'limited_op' Limited Operation           pushes 'op_menu' {..., limited:true}
//   'pass'       Pass (resources per 2.3.3)
//   'pivotal'    (never offered directly; see the 'pivotal_offer' state: verbs 'play' / 'decline')
//
// Notes / simplifications:
//  * Pivotal events are offered before the 1st Eligible acts, to Eligible factions listed in
//    g.pivotal_available (the owner of the pivotal state maintains that list, including card
//    specific preconditions). Never during Monsoon. Trump order: VC, ARVN, NVA, US.
//  * A Coup card that immediately follows another Coup card has no Coup Round, except the last one.

import { registerState, push, pop, log, hasState } from '../core/framework';
import type { ActionKind, Faction, Game } from '../core/types';
import { FACTIONS } from '../core/types';
import { CARD, CARDS } from '../data/cards';
import { addResources, victoryMargin, count, remove } from '../core/pieces';
import { SPACE_IDS } from '../data/map';
import { pivotalPreconditionMet } from './events';

// ------------------------------------------------------------------ helpers

export function isCoupCard(id: number | null): boolean {
  if (id == null) return false;
  const c = CARD[id];
  return c ? !!c.coup : id >= 125 && id <= 130;
}

// Monsoon (2.3.9): the next card is a Coup card. No Sweep/March, Air Lift/Strike max 2 spaces,
// no Pivotal Events.
export function isMonsoon(g: Game): boolean {
  return g.next != null && isCoupCard(g.next) && g.current != null && !isCoupCard(g.current);
}

function cardTitle(id: number | null): string {
  if (id == null) return 'none';
  return CARD[id]?.title ?? `#${id}`;
}

function cardOrder(id: number | null): Faction[] {
  const o = id != null ? CARD[id]?.order : undefined;
  return o && o.length ? o : FACTIONS;
}

// Trumping (2.3.8): VC over anyone, ARVN over US/NVA, NVA over US, US over none.
const TRUMP: Faction[] = ['VC', 'ARVN', 'NVA', 'US'];

function pivotalCardOf(f: Faction): number | null {
  const c = CARDS.find((x) => x.pivotal === f);
  return c ? c.id : null;
}

function pivotalCandidates(g: Game): Faction[] {
  if (isMonsoon(g)) return [];
  return TRUMP.filter((f) => {
    const id = pivotalCardOf(f);
    if (id == null || !g.eligible[f] || g.pivotal_played.includes(f)) return false;
    let ok = false;
    try { ok = pivotalPreconditionMet(g, id); } catch { ok = false; }
    return ok;
  });
}

function fallbackEnd(g: Game): void {
  let best: Faction = 'US';
  let bm = -Infinity;
  for (const f of FACTIONS) {
    const m = victoryMargin(g, f);
    if (m > bm) { bm = m; best = f; }
  }
  g.over = true;
  g.result = `Game over (deck exhausted). Highest victory margin: ${best} (${bm}).`;
  log(g, g.result);
}

// ------------------------------------------------------------------ card flow

function deckHasCoup(g: Game): boolean {
  return g.deck.some((id) => isCoupCard(id)) || isCoupCard(g.next);
}

function applyCoupCardOnly(g: Game, id: number): void {
  const card = CARD[id];
  if (card?.leader) {
    if (g.leader !== null && g.leader !== id) g.leader_box.push(g.leader);
    g.leader = id;
    log(g, `New RVN leader: ${card.title}.`);
  } else if (card && card.title === 'Failed Attempt') {
    let removed = 0;
    for (const sp of SPACE_IDS) {
      let n = Math.floor(count(g, sp, 'arvn_troops', 'arvn_police') / 3);
      for (const k of ['arvn_troops', 'arvn_police'] as const) {
        const r = remove(g, sp, k, n);
        n -= r; removed += r;
      }
    }
    log(g, `Failed Attempt: ARVN desertion (${removed} cubes).`);
  }
}

function startCard(g: Game): void {
  if (g.over) return;
  if (g.current == null) { fallbackEnd(g); return; }
  const id = g.current;
  g.first_faction = null;
  g.first_action = null;
  g.acted = [];
  if (isCoupCard(id)) {
    g.final_coup = !deckHasCoup(g);
    const prev = g.discard.length ? g.discard[g.discard.length - 1] : null;
    log(g, `--- Coup card: ${cardTitle(id)} ---`);
    if (isCoupCard(prev)) {
      // 6.0: never more than 1 Coup Round in a row; additional Coup cards only apply their leader /
      // immediate effect. If it is the final Coup card the game ends (7.3).
      log(g, 'Consecutive Coup card: no Coup Round.');
      applyCoupCardOnly(g, id);
      if (g.final_coup) { fallbackEnd(g); return; }
      endCard(g);
      return;
    }
    if (hasState('coup')) { push(g, 'coup', { card: id }); return; }
    log(g, 'Coup Round not available.');
    endCard(g);
    return;
  }
  log(g, `--- Card ${id}: ${cardTitle(id)}${isMonsoon(g) ? ' (Monsoon: next card is Coup)' : ''} ---`);
  if (!FACTIONS.some((f) => g.eligible[f])) {
    for (const f of FACTIONS) g.eligible[f] = true;
  }
  push(g, 'card_choice', {});
}

function endCard(g: Game): void {
  if (g.over) return;
  const cur = g.current;
  if (cur != null && !isCoupCard(cur)) {
    for (const f of FACTIONS) g.eligible[f] = !g.acted.includes(f);
    for (const f of g.next_ineligible) g.eligible[f] = false;
    for (const f of g.next_eligible) g.eligible[f] = true;
    g.next_ineligible = [];
    g.next_eligible = [];
  } else {
    g.next_ineligible = [];
    g.next_eligible = [];
  }
  if (cur != null) g.discard.push(cur);
  g.current = g.next;
  g.next = g.deck.length ? g.deck.shift()! : null;
  g.acted = [];
  g.first_faction = null;
  g.first_action = null;
  // Hidden information (the deck) moved: undo is no longer possible.
  g.undo = [];
  if (g.current == null) { fallbackEnd(g); return; }
  startCard(g);
}

registerState('game', {
  faction: () => null,
  enter(g) { startCard(g); },
  prompt(_g, _a, p) { p.text('Continue to the next card.'); p.action('continue', undefined, 'Continue'); },
  act(g) { g.undo = []; startCard(g); },
  resume(g) {
    if (g.over) return;
    const cur = g.current;
    if (cur != null && isCoupCard(cur) && g.final_coup && !g.over) {
      // The final Coup Round is complete; the coup state should have set g.over.
      fallbackEnd(g);
      return;
    }
    endCard(g);
  },
});

// ------------------------------------------------------------------ card_choice

function nextActor(g: Game, args: any): Faction | null {
  if (g.current == null) return null;
  // After a Pivotal Event the new Eligibility sequence follows the Pivotal card's order (2.3.8).
  for (const f of cardOrder(args.orderCard ?? g.current)) {
    if (g.eligible[f] && !args.decided.includes(f)) return f;
  }
  return null;
}

function advance(g: Game, args: any): void {
  if (g.acted.length >= 2) { pop(g, { done: true }); return; }
  if (!args.pivotChecked && g.acted.length === 0) {
    args.pivotChecked = true;
    const c = pivotalCandidates(g);
    g.pivotal_available = c;
    if (c.length && hasState('pivotal')) { push(g, 'pivotal_offer', { candidates: c, idx: 0 }); return; }
  }
  const f = nextActor(g, args);
  if (!f) { pop(g, { done: true }); return; }
  g.active = f;
}

function canOp(g: Game, f: Faction): boolean {
  if (f === 'US') return true;
  if (f === 'ARVN') return g.resources.ARVN >= 3;
  return g.resources[f] >= 1;
}

function record(g: Game, args: any, f: Faction, kind: ActionKind): void {
  if (g.first_action == null) { g.first_faction = f; g.first_action = kind; }
  g.acted.push(f);
  args.decided.push(f);
}

export function passResources(g: Game, f: Faction): void {
  if (f === 'NVA' || f === 'VC') addResources(g, f, 1);
  else addResources(g, 'ARVN', 3); // ARVN passes: +3; US passes: ARVN +3 (2.3.3)
}

registerState('card_choice', {
  faction: (g) => g.active,
  enter(g, args) {
    args.decided = [];
    args.pivotChecked = false;
    advance(g, args);
  },
  prompt(g, args, p) {
    const f = g.active;
    if (!f) return;
    const card = g.current != null ? CARD[g.current] : undefined;
    const fa = g.first_action;
    const second = fa != null;
    const title = cardTitle(g.current);
    p.text(`${f}: card ${g.current} (${title}). ${second ? `1st Eligible (${g.first_faction}) chose ${fa}. ` : ''}Choose an action.`);
    const opOk = canOp(g, f);
    let event = false, op = false, opsa = false, lim = false;
    if (!second) { event = true; op = opOk; opsa = opOk; }
    else if (fa === 'op') { lim = opOk; }
    else if (fa === 'op_sa') { lim = opOk; event = true; }
    else if (fa === 'event') { op = opOk; opsa = opOk; }
    else if (fa === 'limited_op') { lim = opOk; }
    if (event) {
      const single = !card || card.dual || !card.shaded;
      p.action('event', 'unshaded', `Event${single ? '' : ' (unshaded)'}: ${card?.unshaded ?? ''}`.slice(0, 200));
      if (card && card.shaded && !card.dual) p.action('event', 'shaded', `Event (shaded): ${card.shaded}`.slice(0, 200));
    }
    if (op) p.action('op', undefined, 'Operation only');
    if (opsa) p.action('op_sa', undefined, 'Operation + Special Activity');
    if (lim) p.action('limited_op', undefined, 'Limited Operation');
    const gain = f === 'NVA' || f === 'VC' ? 1 : 3;
    p.action('pass', undefined, `Pass (+${gain} ${f === 'NVA' || f === 'VC' ? f : 'ARVN'} Resources)`);
  },
  act(g, args, verb, arg) {
    const f = g.active!;
    args.pending = f;
    if (verb === 'pass') {
      passResources(g, f);
      log(g, `${f} passes.`);
      args.decided.push(f);
      advance(g, args);
      return;
    }
    if (verb === 'event') {
      record(g, args, f, 'event');
      const shaded = arg === 'shaded';
      log(g, `${f} plays the ${shaded ? 'shaded' : 'unshaded'} Event: ${cardTitle(g.current)}.`);
      if (hasState('event')) { push(g, 'event', { card: g.current, shaded, faction: f }); return; }
      log(g, '(Event engine not available.)');
      advance(g, args);
      return;
    }
    const limited = verb === 'limited_op';
    record(g, args, f, limited ? 'limited_op' : 'op');
    log(g, `${f} chooses ${limited ? 'a Limited Operation' : verb === 'op_sa' ? 'an Operation with a Special Activity' : 'an Operation'}.`);
    push(g, 'op_menu', { faction: f, limited, sa: verb === 'op_sa', free: false });
  },
  resume(g, args, result) {
    const f: Faction | undefined = args.pending;
    if (f && g.first_faction === f && g.first_action === 'op' && result && result.used_sa) g.first_action = 'op_sa';
    args.pending = undefined;
    advance(g, args);
  },
});

// ------------------------------------------------------------------ pivotal_offer

registerState('pivotal_offer', {
  faction: (_g, a) => a.candidates[a.idx] ?? null,
  prompt(g, a, p) {
    const f: Faction = a.candidates[a.idx];
    const id = pivotalCardOf(f);
    p.text(`${f}: play your Pivotal Event ${id != null ? cardTitle(id) : ''} now?`);
    p.action('play', undefined, `Play Pivotal Event: ${id != null ? cardTitle(id) : ''}`);
    p.action('decline', undefined, 'Decline');
  },
  act(g, a, verb) {
    const f: Faction = a.candidates[a.idx];
    if (verb === 'play') {
      const id = pivotalCardOf(f)!;
      log(g, `${f} plays Pivotal Event ${cardTitle(id)}!`);
      g.pivotal_played.push(f);
      g.pivotal_available = g.pivotal_available.filter((x) => x !== f);
      g.first_faction = f;
      g.first_action = 'event';
      g.acted.push(f);
      const parent = g.stack[g.stack.length - 2];
      if (parent && parent.args.decided) { parent.args.decided.push(f); parent.args.orderCard = id; }
      push(g, 'pivotal', { card: id, faction: f });
      return;
    }
    a.idx++;
    if (a.idx >= a.candidates.length) pop(g, { played: false });
  },
  resume(g) { pop(g, { played: true }); },
});
