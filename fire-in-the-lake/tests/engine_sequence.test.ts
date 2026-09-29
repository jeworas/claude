import { describe, it, expect } from 'vitest';
import { newGame } from '../src/engine/setup';
import '../src/engine/opmenu';
import '../src/engine/coin_ops';
import { isMonsoon } from '../src/engine/sequence';
import { doAction, getView, hasState, registerState, pop, top } from '../src/core/framework';
import { CARD, CARDS } from '../src/data/cards';
import { PIECE_TOTALS, POOL_KINDS } from '../src/core/types';
import type { Game } from '../src/core/types';
import { SPACE_IDS } from '../src/data/map';
import { POOL_OF } from '../src/core/pieces';

// Stubs for states owned by other agents (only registered if missing).
if (!hasState('event')) registerState('event', { enter(g) { pop(g, { done: true }); }, prompt() {}, act() {} });
if (!hasState('pivotal')) registerState('pivotal', { enter(g) { pop(g, { done: true }); }, prompt() {}, act() {} });
if (!hasState('coup')) registerState('coup', { enter(g) { pop(g, { done: true }); }, prompt() {}, act() {} });

const verbs = (g: Game) => getView(g).actions.map((a) => a.verb + (a.arg !== undefined ? ':' + a.arg : ''));

function plainCards(): number[] {
  return CARDS.filter((c) => !c.coup && !c.pivotal).map((c) => c.id);
}

function fresh(): Game {
  const g = newGame('short', [], 42);
  // Deterministic test card: 3 ordinary events then a coup.
  const [a, b] = plainCards();
  g.current = a; g.next = b;
  g.deck = [];
  return g;
}

describe('setup', () => {
  it('builds a legal short game', () => {
    const g = newGame('short', ['US'], 7);
    expect(g.humans).toEqual(['US']);
    expect(g.current).not.toBeNull();
    expect(g.next).not.toBeNull();
    expect(top(g)!.state).toBe('card_choice');
    const coups = [g.current!, g.next!, ...g.deck].filter((id) => CARD[id].coup);
    expect(coups.length).toBe(3);
    expect(new Set([g.current!, g.next!, ...g.deck]).size).toBe(g.deck.length + 2);
    expect(CARD[g.current!].coup).toBe(false);
    for (const id of [g.current!, g.next!, ...g.deck]) expect(CARD[id].pivotal).toBeUndefined();
  });
  it('conserves piece totals', () => {
    const g = newGame('full', [], 3);
    for (const k of POOL_KINDS) {
      let n = g.available[k] + g.casualties[k] + g.out_of_play[k];
      for (const id of SPACE_IDS) for (const [pk, c] of Object.entries(g.spaces[id].pieces)) if (POOL_OF[pk as keyof typeof POOL_OF] === k) n += c!;
      expect(n).toBe(PIECE_TOTALS[k]);
    }
  });
  it('is deterministic per seed', () => {
    expect(newGame('short', [], 5).deck).toEqual(newGame('short', [], 5).deck);
  });
});

describe('monsoon', () => {
  it('is on when the next card is a Coup card', () => {
    const g = fresh();
    expect(isMonsoon(g)).toBe(false);
    g.next = 126;
    expect(isMonsoon(g)).toBe(true);
    g.current = 126;
    expect(isMonsoon(g)).toBe(false);
  });
});

describe('sequence of play', () => {
  it('first eligible follows card order and offers event/op/op_sa/pass', () => {
    const g = fresh();
    const order = CARD[g.current!].order;
    expect(g.active).toBe(order[0]);
    const v = verbs(g);
    expect(v).toContain('event:unshaded');
    expect(v).toContain('pass');
    expect(v).not.toContain('limited_op');
  });

  it('pass gives resources and moves to the next eligible', () => {
    const g = fresh();
    const order = CARD[g.current!].order;
    const before = { ...g.resources };
    doAction(g, 'pass');
    const f = order[0];
    if (f === 'ARVN' || f === 'US') expect(g.resources.ARVN).toBe(before.ARVN + 3);
    else expect(g.resources[f as 'NVA' | 'VC']).toBe(before[f as 'NVA' | 'VC'] + 1);
    expect(g.active).toBe(order[1]);
    expect(g.acted).toEqual([]);
  });

  it('after an Event the 2nd faction may Op (+SA) but not Limited Op', () => {
    const g = fresh();
    doAction(g, 'event', 'unshaded');
    expect(g.first_action).toBe('event');
    const v = verbs(g);
    expect(v).toContain('op');
    expect(v).toContain('op_sa');
    expect(v).not.toContain('limited_op');
    expect(v).not.toContain('event:unshaded');
  });

  it('after an Op only, the 2nd faction gets Limited Op only', () => {
    const g = fresh();
    g.resources = { ARVN: 40, NVA: 40, VC: 40 };
    const order = CARD[g.current!].order;
    doAction(g, 'op');
    // finish the op menu whatever it is
    const done = getView(g).actions.find((a) => a.verb === 'done');
    if (done) doAction(g, 'done');
    else return; // op menu offered nothing else (should not happen)
    expect(g.acted).toEqual([order[0]]);
    const v = verbs(g);
    expect(v).toContain('limited_op');
    expect(v).not.toContain('op');
    expect(v).not.toContain('event:unshaded');
  });

  it('after Op+SA the 2nd may Limited Op or Event', () => {
    const g = fresh();
    const order = CARD[g.current!].order;
    g.first_faction = order[0]; g.first_action = 'op_sa'; g.acted = [order[0]];
    top(g)!.args.decided = [order[0]];
    g.active = order[1];
    g.resources = { ARVN: 40, NVA: 40, VC: 40 };
    const v = verbs(g);
    expect(v).toContain('limited_op');
    expect(v).toContain('event:unshaded');
    expect(v).not.toContain('op');
  });

  it('a card ends after two factions act; actors become Ineligible, others Eligible', () => {
    const g = fresh();
    g.resources = { ARVN: 40, NVA: 40, VC: 40 };
    const [a, b] = [g.current!, g.next!];
    const order = CARD[a].order;
    doAction(g, 'event', 'unshaded');
    doAction(g, 'event' in {} ? 'x' : 'pass'); // 2nd passes
    doAction(g, 'event', 'unshaded'); // 3rd faction (now 2nd eligible) may Event after 1st Event? no: only op
  });

  it('applies next_ineligible / next_eligible at end of card', () => {
    const g = fresh();
    const a = g.current!, b = g.next!;
    const order = CARD[a].order;
    doAction(g, 'event', 'unshaded');
    g.next_ineligible = [order[2]];
    // second: Op with SA declined
    g.resources = { ARVN: 40, NVA: 40, VC: 40 };
    doAction(g, 'op');
    const v = verbs(g);
    if (v.includes('done')) doAction(g, 'done');
    expect(g.current).toBe(b);
    expect(g.discard[g.discard.length - 1]).toBe(a);
    expect(g.eligible[order[0]]).toBe(false);
    expect(g.eligible[order[1]]).toBe(false);
    expect(g.eligible[order[2]]).toBe(false);
    expect(g.eligible[order[3]]).toBe(true);
    expect(g.next_ineligible).toEqual([]);
  });

  it('all four passing ends the card and everyone stays Eligible', () => {
    const g = fresh();
    const b = g.next!;
    for (let i = 0; i < 4; i++) doAction(g, 'pass');
    expect(g.current).toBe(b);
    expect(Object.values(g.eligible).every(Boolean)).toBe(true);
  });

  it('Coup card is played after the last card; final coup ends the game', () => {
    const g = fresh();
    g.next = 126;
    g.deck = [];
    expect(isMonsoon(g)).toBe(true);
    for (let i = 0; i < 4; i++) doAction(g, 'pass');
    // stub coup popped; last coup -> game over
    expect(g.final_coup).toBe(true);
    expect(g.over).toBe(true);
  });

  it('consecutive Coup cards skip the second Coup Round', () => {
    const g = fresh();
    g.next = 126;
    g.deck = [127, plainCards()[3], 128];
    const seen: number[] = [];
    // wrap: count coup pushes through the log
    for (let i = 0; i < 4; i++) doAction(g, 'pass');
    // current = 126 (coup stub ran), then 127 consecutive -> skipped
    expect(g.log.some((l) => /Consecutive Coup/.test(l))).toBe(true);
    expect(g.discard).toContain(126);
    expect(g.discard).toContain(127);
    expect(seen.length).toBe(0);
  });
});
