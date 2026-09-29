import { describe, it, expect } from 'vitest';
import { SPACES, MAP, SPACE_IDS } from '../src/data/map';
import { CARDS, CARD } from '../src/data/cards';
import { SCENARIOS } from '../src/data/scenarios';
import { PIECE_TOTALS } from '../src/core/types';
import type { PoolKind, PieceKind } from '../src/core/types';
import { POOL_OF, totalSupport, coinControlledPop, totalOpposition, countOnMap, nvaControlledPop } from '../src/core/pieces';
import { newGame } from '../src/engine';

describe('map', () => {
  it('has 8 cities and 17 LoCs, unique ids', () => {
    expect(SPACES.filter((s) => s.type === 'city').length).toBe(8);
    expect(SPACES.filter((s) => s.type === 'loc').length).toBe(17);
    expect(new Set(SPACE_IDS).size).toBe(SPACES.length);
  });
  it('adjacency is symmetric and resolves', () => {
    for (const s of SPACES) {
      for (const a of s.adjacent) {
        expect(MAP[a], `${s.id} -> ${a}`).toBeDefined();
        expect(MAP[a].adjacent, `${a} <-> ${s.id}`).toContain(s.id);
      }
      expect(s.adjacent.length, s.id).toBeGreaterThan(0);
    }
  });
  it('coordinates are in range', () => {
    for (const s of SPACES) {
      expect(s.x).toBeGreaterThanOrEqual(0); expect(s.x).toBeLessThanOrEqual(100);
      expect(s.y).toBeGreaterThanOrEqual(0); expect(s.y).toBeLessThanOrEqual(140);
    }
  });
});

describe('cards', () => {
  it('has 130 unique cards', () => {
    expect(CARDS.length).toBe(130);
    expect(new Set(CARDS.map((c) => c.id)).size).toBe(130);
    for (let i = 1; i <= 130; i++) expect(CARD[i]).toBeDefined();
    expect(CARDS.filter((c) => c.coup).map((c) => c.id)).toEqual([125, 126, 127, 128, 129, 130]);
    expect(CARDS.filter((c) => c.pivotal).map((c) => c.pivotal)).toEqual(['US', 'NVA', 'ARVN', 'VC']);
  });
  it('event cards have four-faction order', () => {
    for (const c of CARDS.filter((c) => !c.coup)) expect(new Set(c.order).size, String(c.id)).toBe(4);
  });
});

describe('scenarios', () => {
  it('exist', () => expect(Object.keys(SCENARIOS).sort()).toEqual(['full', 'medium', 'short']));
  for (const sc of Object.values(SCENARIOS)) {
    it(`${sc.id}: valid spaces and piece totals`, () => {
      const tot: Record<string, number> = {};
      for (const [sp, pcs] of Object.entries(sc.pieces)) {
        expect(MAP[sp], sp).toBeDefined();
        for (const [k, n] of Object.entries(pcs)) tot[POOL_OF[k as PieceKind]] = (tot[POOL_OF[k as PieceKind]] ?? 0) + (n ?? 0);
      }
      for (const sp of Object.keys(sc.support)) {
        expect(MAP[sp], sp).toBeDefined();
        expect(MAP[sp].pop, `${sp} support`).toBeGreaterThan(0);
      }
      for (const pool of Object.keys(PIECE_TOTALS) as PoolKind[]) {
        const used = (tot[pool] ?? 0) + (sc.casualties[pool] ?? 0) + (sc.out_of_play[pool] ?? 0);
        expect(used, pool).toBeLessThanOrEqual(PIECE_TOTALS[pool]);
      }
    });
    it(`${sc.id}: deck params`, () => {
      for (const id of sc.deck.exclude ?? []) expect(CARD[id]).toBeDefined();
      for (const id of sc.deck.coup_cards ?? []) expect(CARD[id].coup).toBe(true);
      expect((sc.deck.coup_cards ?? []).length).toBeGreaterThanOrEqual(sc.deck.piles);
      for (const id of Object.keys(sc.capabilities)) expect(CARD[Number(id)]).toBeDefined();
    });
  }
});

describe('playbook spot checks', () => {
  it('total econ 15, all LoC ids', () => {
    expect(SPACES.reduce((n, x) => n + x.econ, 0)).toBe(15);
  });
  it('titles, order, period', () => {
    const t = (id: number) => [CARD[id].title, CARD[id].order.map((f) => f[0]).join(''), CARD[id].period];
    expect(t(1)).toEqual(['Gulf of Tonkin', 'UNAV', '1964']);
    expect(t(4)).toEqual(['Top Gun', 'UNAV', '1968']);
    expect(t(31)).toEqual(['AAA', 'NUAV', '1964']);
    expect(t(72)).toEqual(['Body Count', 'ANUV', '1965']);
    expect(t(86)).toEqual(['Mandate of Heaven', 'AVNU', '1965']);
    expect(t(104)).toEqual(['Main Force Bns', 'VNUA', '1965']);
    expect(t(116)).toEqual(['Cadres', 'VANU', '1964']);
    expect(t(120)).toEqual(['US Press Corps', 'VANU', '1968']);
    expect(CARD[122].title).toBe('Easter Offensive');
    expect(CARD[129].title).toBe('Failed Attempt');
  });
  it('verbatim text', () => {
    expect(CARD[1].unshaded).toBe('Incident and resolution: US free Air Strikes, then moves 6 US pieces from out-of-play to any Cities.');
    expect(CARD[1].shaded).toBe('Congressional regrets: Aid –1 per Casualty. All Casualties out of play.');
    expect(CARD[35].unshaded).toBe('Bridge busters: Degrade the Trail by 3 boxes.');
    expect(CARD[55].shaded).toContain('Convoys: Add twice Trail value');
    expect(CARD[5].shaded).toContain('Complex strike packages');
    expect(CARD[9].shaded).toContain('Worn out formation');
    expect(CARD[110].shaded).toContain('Flip all VC and NVA Guerrillas Underground');
    expect(CARD[121].unshaded).toContain('Support+Available >40');
    expect(CARD[124].unshaded).toContain('General uprising');
    expect(CARD[127].unshaded).toContain('Pacification costs 4 Resources');
    expect(CARD[126].unshaded).toContain('+2 Patronage');
    expect(CARD[125].unshaded).toContain('Transport uses max 1 LoC space');
    expect(CARD[128].unshaded).toContain('No effect');
  });
  it('capability / momentum flags match the playbook markers', () => {
    const caps = CARDS.filter((c) => c.capability).map((c) => c.id);
    expect(caps).toEqual([4, 8, 11, 13, 14, 18, 19, 20, 28, 31, 32, 33, 34, 45, 61, 86, 101, 104, 116]);
    const mom = CARDS.filter((c) => c.momentum).map((c) => c.id);
    expect(mom).toEqual([5, 7, 10, 15, 16, 17, 22, 38, 39, 41, 46, 72, 78, 115]);
    expect(CARD[5].momentum_shaded).toBe(true);
    expect(CARD[7].momentum_unshaded).toBe(true);
  });
  it('no PDF artefacts in card text', () => {
    for (const c of CARDS) for (const t of [c.unshaded, c.shaded, c.tips ?? '']) {
      expect(t, String(c.id)).not.toMatch(/[a-z]- [a-z]|MOMENTUM|CAPABILITY|GMT Games/);
    }
  });
});

describe('scenario starting scores (rulebook checkpoints)', () => {
  const want: Record<string, [number, number, number, number]> = {
    short: [38, 41, 23, 10], medium: [37, 44, 23, 8], full: [38, 35, 27, 4],
  };
  for (const [id, w] of Object.entries(want)) {
    it(id, () => {
      const g = newGame(id, [], 1);
      const sa = totalSupport(g) + g.available.us_troops + g.available.us_base;
      const cp = coinControlledPop(g) + g.patronage;
      const ob = totalOpposition(g) + countOnMap(g, 'vc_base', 'vc_tunnel');
      const nb = nvaControlledPop(g) + countOnMap(g, 'nva_base', 'nva_tunnel');
      expect([sa, cp, ob, nb]).toEqual(w);
    });
  }
  it('resources/aid/trail per book', () => {
    expect(SCENARIOS.short).toMatchObject({ aid: 15, patronage: 18, trail: 2, resources: { VC: 10, NVA: 15, ARVN: 30 } });
    expect(SCENARIOS.medium).toMatchObject({ aid: 30, patronage: 15, trail: 3, resources: { VC: 15, NVA: 20, ARVN: 30 } });
    expect(SCENARIOS.full).toMatchObject({ aid: 15, patronage: 15, trail: 1, resources: { VC: 5, NVA: 10, ARVN: 30 } });
  });
});
