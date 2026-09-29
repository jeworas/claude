import { describe, expect, it } from 'vitest';
import type { Game, PieceKind, PoolKind } from '../src/core/types';
import { POOL_KINDS, PIECE_TOTALS, PIECE_KINDS } from '../src/core/types';
import { doAction, getView, log, push, random, top } from '../src/core/framework';
import { SPACE_IDS } from '../src/data/map';
import { POOL_OF } from '../src/core/pieces';
import { CARD } from '../src/data/cards';
import '../src/engine';
import { IMPL, TEXT, eventPlayable, pivotalPreconditionMet } from '../src/engine/events';

// A hand-built, well-populated game so that every event has something to act on.
function handGame(seed: number): Game {
  const zeros = () => Object.fromEntries(POOL_KINDS.map((k) => [k, 0])) as Record<PoolKind, number>;
  const g: Game = {
    version: 1, seed, scenario: 'test', humans: ['US', 'ARVN', 'NVA', 'VC'], log: [], stack: [], active: 'US', over: false, result: null,
    spaces: Object.fromEntries(SPACE_IDS.map((id) => [id, { pieces: {}, support: 0, terror: 0 }])),
    available: zeros(), casualties: zeros(), out_of_play: zeros(),
    resources: { ARVN: 30, NVA: 20, VC: 15 }, aid: 20, patronage: 15, econ: 10, trail: 2,
    deck: [], current: null, next: null, discard: [], coup_count: 0, final_coup: false,
    eligible: { US: true, ARVN: true, NVA: true, VC: true }, next_ineligible: [], next_eligible: [],
    first_faction: null, first_action: null, acted: [],
    capabilities: {}, momentum: [], leader: null, leader_box: [], pivotal_played: [], pivotal_available: ['US', 'ARVN', 'NVA', 'VC'],
    undo: [], tmp: {},
  } as Game;
  for (const k of POOL_KINDS) g.available[k] = PIECE_TOTALS[k];
  // scatter pieces deterministically
  const kinds = PIECE_KINDS;
  for (let i = 0; i < 160; i++) {
    const id = SPACE_IDS[random(g, SPACE_IDS.length)];
    const k = kinds[random(g, kinds.length)] as PieceKind;
    const pk = POOL_OF[k];
    if (g.available[pk] <= 0) continue;
    g.available[pk]--;
    g.spaces[id].pieces[k] = (g.spaces[id].pieces[k] ?? 0) + 1;
  }
  for (const id of SPACE_IDS) {
    const s = g.spaces[id];
    s.support = (random(g, 5) - 2) as any;
    if (id.startsWith('loc_') || ['north_vietnam', 'central_laos', 'southern_laos', 'northeast_cambodia', 'the_fishhook', 'the_parrots_beak', 'sihanoukville'].includes(id) || id === 'phuoc_long') s.support = 0;
    s.terror = random(g, 2);
  }
  g.casualties.us_troops = 4; g.casualties.arvn_troops = 3; g.casualties.us_base = 1;
  g.out_of_play.us_troops = 2; g.out_of_play.arvn_troops = 2; g.out_of_play.nva_troops = 2;
  return g;
}

function play(g: Game, card: number, shaded: boolean, pivotal = false): number {
  const depth = g.stack.length;
  const faction = (['US', 'ARVN', 'NVA', 'VC'] as const)[card % 4];
  g.active = faction;
  push(g, pivotal ? 'pivotal' : 'event', { card, shaded, faction });
  let steps = 0;
  while (g.stack.length > depth && steps < 500) {
    steps++;
    const acts = getView(g).actions.filter((a) => a.verb !== 'undo');
    if (acts.length === 0) throw new Error(`no actions at ${top(g)?.state}`);
    let pick = acts[0];
    if (steps > 250) pick = acts.find((a) => ['done', 'pass', 'skip', 'cancel'].includes(a.verb)) ?? acts[acts.length - 1];
    doAction(g, pick.verb, pick.arg);
    JSON.parse(JSON.stringify(g)); // state must stay serializable
  }
  return steps;
}

describe('events (hand-built game)', () => {
  const stuck: string[] = [];
  for (let card = 1; card <= 120; card++) {
    for (const shaded of [false, true]) {
      it(`card ${card} ${shaded ? 'shaded' : 'unshaded'}`, () => {
        expect(IMPL[card], `card ${card} implemented`).toBeDefined();
        for (const seed of [1, 2]) {
          const g = handGame(seed);
          const steps = play(g, card, shaded);
          if (steps >= 500) stuck.push(`${card}${shaded ? 's' : 'u'}`);
          expect(typeof eventPlayable(g, card, shaded)).toBe('boolean');
        }
      });
    }
  }
  it('no event got stuck', () => { expect(stuck).toEqual([]); });
});

describe('pivotal events', () => {
  for (const card of [121, 122, 123, 124]) {
    it(`pivotal ${card}`, () => {
      const g = handGame(3);
      expect(typeof pivotalPreconditionMet(g, card)).toBe('boolean');
      play(g, card, false, true);
    });
  }
});

describe('events (newGame, real op/SA states)', () => {
  for (const scen of ['full', 'medium', 'short']) {
    it(`plays every event in ${scen}`, async () => {
      const { newGame } = await import('../src/engine');
      const bad: string[] = [];
      for (let card = 1; card <= 124; card++) {
        for (const shaded of card > 120 ? [false] : [false, true]) {
          const g: Game = newGame(scen, [], card * 2 + (shaded ? 1 : 0));
          const base = g.stack.length;
          try {
            const steps = play(g, card, shaded, card > 120);
            if (steps >= 500 && g.stack.length > base) bad.push(`${card}${shaded ? 's' : 'u'} stuck`);
          } catch (e: any) {
            bad.push(`${card}${shaded ? 's' : 'u'}: ${e.message}`);
          }
        }
      }
      expect(bad).toEqual([]);
    });
  }
});

describe('markers and playability', () => {
  it('capability cards set their marker', () => {
    for (const card of [4, 8, 11, 13, 14, 18, 19, 20, 28, 31, 32, 33, 34, 45, 61, 86, 101, 104, 116]) {
      for (const shaded of [false, true]) {
        const g = handGame(5);
        play(g, card, shaded);
        expect(g.capabilities[card]).toBe(shaded ? 'shaded' : 'unshaded');
      }
    }
  });
  it('momentum cards record momentum on one side', () => {
    for (const card of [5, 7, 10, 15, 16, 17, 22, 38, 39, 41, 46, 72, 78, 115]) {
      const on = [false, true].filter((shaded) => { const g = handGame(6); play(g, card, shaded); return g.momentum.includes(card); });
      expect(on.length, `card ${card}`).toBe(1);
    }
  });
  it('most events are playable on a populated board', () => {
    const g = handGame(7);
    let n = 0;
    for (let c = 1; c <= 120; c++) for (const s of [false, true]) if (eventPlayable(g, c, s)) n++;
    expect(n).toBeGreaterThan(200);
  });
});

describe('card data matches events', () => {
  it('cards.ts text equals event TEXT and first faction follows the deck group', () => {
    const first = ['US', 'NVA', 'ARVN', 'VC'];
    for (let n = 1; n <= 124; n++) {
      expect(CARD[n], `card ${n}`).toBeDefined();
      expect(CARD[n].unshaded).toBe(TEXT[n].u);
      if (n <= 120) {
        expect(CARD[n].shaded).toBe(TEXT[n].s);
        expect(CARD[n].order[0]).toBe(first[Math.floor((n - 1) / 30)]);
      }
    }
  });
  it('pivotal preconditions need 2 leader cards', () => {
    const g = handGame(9);
    g.leader_box = [];
    for (const c of [121, 122, 123, 124]) expect(pivotalPreconditionMet(g, c)).toBe(false);
  });
});
