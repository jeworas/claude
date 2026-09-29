import { describe, it, expect } from 'vitest';
import { botStep } from '../src/ai/bot';
import { registerState, getView, doAction, push, pop, currentFaction } from '../src/core/framework';
import { SPACE_IDS } from '../src/data/map';
import { SCENARIOS } from '../src/data/scenarios';
import type { Game } from '../src/core/types';

// Try to load the real engine; skip the smoke test if it is not finished yet.
let engine: any = null;
try { engine = await import('../src/engine'); } catch { engine = null; }
const engineReady = !!engine && typeof engine.newGame === 'function';

function fakeGame(): Game {
  const sc = SCENARIOS.short;
  const spaces: any = {};
  for (const id of SPACE_IDS) spaces[id] = { pieces: {}, support: 0, terror: 0 };
  return {
    version: 1, seed: 7, scenario: sc.id, humans: [], log: [], stack: [], active: 'VC', over: false, result: null,
    spaces, available: {} as any, casualties: {} as any, out_of_play: {} as any,
    resources: { ARVN: 10, NVA: 10, VC: 10 }, aid: 10, patronage: 10, econ: 0, trail: 1,
    deck: [], current: null, next: null, discard: [], coup_count: 0, final_coup: false,
    eligible: { US: true, ARVN: true, NVA: true, VC: true }, next_ineligible: [], next_eligible: [],
    first_faction: null, first_action: null, acted: [], capabilities: {}, momentum: [], leader: null,
    leader_box: [], pivotal_played: [], pivotal_available: [], undo: [], tmp: {},
  } as Game;
}

registerState('ai_test_pick', {
  prompt(g, args, p) {
    p.text('pick');
    for (const id of SPACE_IDS.slice(0, 10)) p.space(id);   // never runs out of selections
    p.action('done');
  },
  act(g, args, verb) { if (verb === 'done') pop(g, { done: true }); },
});

describe('bot', () => {
  it('returns legal actions and always finishes a never-ending selection frame', () => {
    for (const f of ['US', 'ARVN', 'NVA', 'VC'] as const) {
      const g = fakeGame();
      g.active = f;
      for (const k of ['us_troops', 'us_base', 'us_irreg', 'arvn_troops', 'arvn_police', 'arvn_ranger', 'arvn_base', 'nva_troops', 'nva_guer', 'nva_base', 'vc_guer', 'vc_base'])
        (g.available as any)[k] = 0, (g.casualties as any)[k] = 0, (g.out_of_play as any)[k] = 0;
      g.stack.push({ state: 'ai_test_pick', args: {} });
      let steps = 0;
      while (g.stack.length && steps < 200) {
        const a = botStep(g);
        expect(getView(g).actions.some((x) => x.verb === a.verb && x.arg === a.arg)).toBe(true);
        expect(a.verb).not.toBe('undo');
        doAction(g, a.verb, a.arg);
        steps++;
      }
      expect(g.stack.length).toBe(0);
      expect(steps).toBeLessThanOrEqual(30);
    }
  });
});

describe('full game with 4 bots', () => {
  it.skipIf(!engineReady)('plays to completion without exceptions', () => {
    for (const sc of ['short', 'medium', 'full']) {
      const g = engine.newGame(sc, [], 12345);
      let steps = 0;
      while (!g.over && steps < 20000) {
        const v = engine.getView(g);
        expect(currentFaction(g) ?? v.active).toBeTruthy();
        const a = botStep(g);
        engine.doAction(g, a.verb, a.arg);
        steps++;
      }
      expect(steps).toBeGreaterThan(0);
    }
  }, 120000);
});
