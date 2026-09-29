import { describe, expect, it } from 'vitest';
import type { Game, PieceKind, PoolKind } from '../src/core/types';
import { POOL_KINDS, PIECE_TOTALS, PIECE_KINDS } from '../src/core/types';
import { doAction, getView, log, push, random, top } from '../src/core/framework';
import { SPACE_IDS } from '../src/data/map';
import { POOL_OF } from '../src/core/pieces';
import '../src/engine';
import { IMPL, eventPlayable, pivotalPreconditionMet } from '../src/engine/events';

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
    for (const card of [4, 8, 11, 13, 14, 18, 19, 20, 28, 31, 32, 33, 34, 45]) {
      for (const shaded of [false, true]) {
        const g = handGame(5);
        play(g, card, shaded);
        expect(g.capabilities[card]).toBe(shaded ? 'shaded' : 'unshaded');
      }
    }
  });
  it('momentum cards record momentum on the printed side(s)', () => {
    const sides: Record<number, boolean[]> = { 5: [true], 7: [false], 10: [true], 15: [false, true], 16: [false], 17: [false], 22: [true], 38: [false], 39: [true], 41: [false], 46: [false] };
    for (const [c, expected] of Object.entries(sides)) {
      const card = Number(c);
      const on = [false, true].filter((shaded) => { const g = handGame(6); play(g, card, shaded); return g.momentum.includes(card); });
      expect(on, `card ${card}`).toEqual(expected);
    }
  });
  it('most events are playable on a populated board', () => {
    const g = handGame(7);
    let n = 0;
    for (let c = 1; c <= 120; c++) for (const s of [false, true]) if (eventPlayable(g, c, s)) n++;
    expect(n).toBeGreaterThan(200);
  });
});

describe('pivotal events', () => {
  it('pivotal preconditions need 2 leader cards', () => {
    const g = handGame(9);
    g.leader = null;
    g.leader_box = [];
    for (const c of [121, 122, 123, 124]) expect(pivotalPreconditionMet(g, c)).toBe(false);
  });
});

describe('specific card effects (cards 1-60)', () => {
  const g0 = (seed = 11) => { const g = handGame(seed); g.trail = 2; g.resources.NVA = 30; g.resources.ARVN = 30; g.aid = 30; return g; };
  it('1 shaded: Aid -1 per Casualty, Casualties out of play', () => {
    const g = g0(); g.casualties.us_troops = 4; g.casualties.us_base = 1; g.casualties.us_irreg = 0;
    const oop = g.out_of_play.us_troops;
    play(g, 1, true);
    expect(g.aid).toBe(25);
    expect(g.casualties.us_troops + g.casualties.us_base + g.casualties.us_irreg).toBe(0);
    expect(g.out_of_play.us_troops).toBe(oop + 4);
  });
  it('3: Peace Talks resources, marker and Trail', () => {
    const g = g0(); play(g, 3, false);
    expect(g.resources.NVA).toBe(21); expect(g.tmp.peace_talks).toBe(true);
    const h = g0(); play(h, 3, true);
    expect(h.resources.NVA).toBe(39); expect(h.trail).toBe(3);
  });
  it('4 unshaded cancels shaded MiGs; 33 shaded blocked by Top Gun', () => {
    const g = g0(); g.capabilities[33] = 'shaded'; play(g, 4, false);
    expect(g.capabilities[33]).toBeUndefined(); expect(g.capabilities[4]).toBe('unshaded');
    play(g, 33, true);
    expect(g.capabilities[33]).toBeUndefined();
  });
  it('5 unshaded removes shaded SA-2s, else degrades Trail and costs NVA 9', () => {
    const g = g0(); g.capabilities[34] = 'shaded'; play(g, 5, false);
    expect(g.capabilities[34]).toBeUndefined(); expect(g.trail).toBe(2);
    const h = g0(); play(h, 5, false);
    expect(h.trail).toBe(0); expect(h.resources.NVA).toBe(21);
  });
  it('7: ADSID costs 6 NVA Resources at Trail changes; shaded improves to at least 2', () => {
    const g = g0(); play(g, 7, false); play(g, 35, true); // Improve 1 box under ADSID, then +3*trail
    expect(g.trail).toBe(3); expect(g.resources.NVA).toBe(30 - 6 + 9);
    const h = g0(); h.trail = 0; play(h, 7, true);
    expect(h.trail).toBe(2); expect(h.resources.ARVN).toBe(21);
  });
  it('10 unshaded: Trail -2, NVA -9, NVA Ineligible', () => {
    const g = g0(); play(g, 10, false);
    expect(g.trail).toBe(0); expect(g.resources.NVA).toBe(21); expect(g.next_ineligible).toContain('NVA');
  });
  it('12 unshaded flips outside guerrillas Active and removes an NVA Base', () => {
    const g = g0(); g.spaces['central_laos'].pieces = { nva_guer_u: 2, vc_guer_u: 1, nva_base: 1 };
    play(g, 12, false);
    expect(g.spaces['central_laos'].pieces.nva_guer_a).toBe(2);
    expect(g.spaces['central_laos'].pieces.nva_guer_u).toBeUndefined();
    expect(g.spaces['central_laos'].pieces.nva_base ?? 0).toBe(0);
  });
  it('22 unshaded: up to 6 Troops in Da Nang, at most 3 from Out of Play', () => {
    const g = g0(); const before = g.spaces['da_nang'].pieces.us_troops ?? 0;
    g.available.us_troops = 2; g.out_of_play.us_troops = 5;
    play(g, 22, false);
    expect((g.spaces['da_nang'].pieces.us_troops ?? 0) - before).toBe(5);
    expect(g.out_of_play.us_troops).toBe(2);
  });
  it('29 shaded replaces Irregulars with VC Guerrillas and costs Patronage', () => {
    const g = g0(); g.spaces['kontum'].pieces = { us_irreg_u: 2 }; g.available.vc_guer = 10; const pat = g.patronage;
    play(g, 29, true);
    expect(g.spaces['kontum'].pieces.us_irreg_u).toBeUndefined();
    expect(g.spaces['kontum'].pieces.vc_guer_u).toBe(2);
    expect(g.patronage).toBe(pat - 3);
  });
  it('35: Thanh Hoa', () => {
    const g = g0(); g.trail = 4; play(g, 35, false); expect(g.trail).toBe(1);
    const h = g0(); play(h, 35, true); expect(h.trail).toBe(3); expect(h.resources.NVA).toBe(39);
  });
  it('41: Bombing Pause sets 2 spaces to Passive Support, Patronage +2, momentum', () => {
    const g = g0(); const pat = g.patronage; play(g, 41, false);
    expect(g.patronage).toBe(pat + 2); expect(g.momentum).toContain(41);
  });
  it('42, 46, 55, 57: Resources from Trail and dice', () => {
    const g = g0(); play(g, 42, true); expect(g.resources.NVA).toBe(40); expect(g.resources.VC).toBe(15 + 2);
    const h = g0(); play(h, 55, true); expect(h.resources.NVA).toBe(34); expect(h.resources.VC).toBe(19);
  });
  it('52 RAND flips a US capability', () => {
    const g = g0(); g.capabilities[4] = 'shaded'; play(g, 52, false); expect(g.capabilities[4]).toBe('unshaded');
    play(g, 52, true); expect(g.capabilities[4]).toBe('shaded');
  });
  it('60 shaded: NVA +6 Resources and stays Eligible when executing', () => {
    const g = g0(); g.resources.NVA = 30; g.active = 'NVA';
    push(g, 'event', { card: 60, shaded: true, faction: 'NVA' });
    let n = 0; while (g.stack.length > 0 && n++ < 200) { const a = getView(g).actions.filter((x) => x.verb !== 'undo'); doAction(g, a[0].verb, a[0].arg); }
    expect(g.resources.NVA).toBe(36); expect(g.next_eligible).toContain('NVA');
  });
});
