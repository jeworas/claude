import { describe, it, expect } from 'vitest';
import { SPACES, MAP, SPACE_IDS } from '../src/data/map';
import { CARDS, CARD } from '../src/data/cards';
import { SCENARIOS } from '../src/data/scenarios';
import { PIECE_TOTALS } from '../src/core/types';
import type { PoolKind, PieceKind } from '../src/core/types';
import { POOL_OF } from '../src/core/pieces';

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
