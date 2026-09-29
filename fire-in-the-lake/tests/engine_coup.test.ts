import { describe, expect, it } from 'vitest';
import type { Game, PoolKind } from '../src/core/types';
import { POOL_KINDS, PIECE_TOTALS } from '../src/core/types';
import { doAction, getView, push } from '../src/core/framework';
import { SPACE_IDS } from '../src/data/map';
import '../src/engine/coup';
import { margins } from '../src/engine/coup';

function mk(): Game {
  const zeros = () => Object.fromEntries(POOL_KINDS.map((k) => [k, 0])) as Record<PoolKind, number>;
  const g = {
    version: 1, seed: 1, scenario: 'test', humans: ['US', 'ARVN', 'NVA', 'VC'], log: [], stack: [], active: 'NVA', over: false, result: null,
    spaces: Object.fromEntries(SPACE_IDS.map((id) => [id, { pieces: {}, support: 0, terror: 0 }])),
    available: zeros(), casualties: zeros(), out_of_play: zeros(),
    resources: { ARVN: 30, NVA: 20, VC: 15 }, aid: 20, patronage: 15, econ: 10, trail: 2,
    deck: [], current: null, next: null, discard: [], coup_count: 0, final_coup: false,
    eligible: { US: true, ARVN: true, NVA: true, VC: true }, next_ineligible: [], next_eligible: [],
    first_faction: null, first_action: null, acted: [],
    capabilities: {}, momentum: [], leader: null, leader_box: [], pivotal_played: [], pivotal_available: [],
    undo: [], tmp: {},
  } as unknown as Game;
  for (const k of POOL_KINDS) g.available[k] = PIECE_TOTALS[k];
  return g;
}
const put = (g: Game, id: string, k: string, n = 1) => {
  (g.spaces[id].pieces as any)[k] = ((g.spaces[id].pieces as any)[k] ?? 0) + n;
  const pool = ({ us_troops: 'us_troops', us_base: 'us_base', arvn_troops: 'arvn_troops', arvn_police: 'arvn_police', arvn_base: 'arvn_base',
    nva_troops: 'nva_troops', nva_guer_u: 'nva_guer', nva_guer_a: 'nva_guer', nva_base: 'nva_base', vc_guer_u: 'vc_guer', vc_guer_a: 'vc_guer', vc_base: 'vc_base',
    us_irreg_u: 'us_irreg' } as any)[k] as PoolKind;
  g.available[pool] -= n;
};
const n = (g: Game, id: string, k: string) => (g.spaces[id].pieces as any)[k] ?? 0;
const do_ = (g: Game, v: string, a?: string | number) => doAction(g, v, a);
const has = (g: Game, v: string, a?: string | number) => getView(g).actions.some((x) => x.verb === v && x.arg === a);

function coupGame(card = 125): Game {
  const g = mk();
  g.humans = [];
  g.current = card;
  return g;
}
const run = (g: Game) => push(g, 'coup', {});

describe('Coup: victory', () => {
  it('ends the game when a faction exceeds its threshold', () => {
    const g = coupGame();
    g.spaces.saigon.support = 2; // US: 46 + 12
    run(g);
    expect(g.over).toBe(true);
    expect(g.result).toContain('US wins');
    expect(g.stack.length).toBe(0);
  });
  it('final Coup: highest margin wins even with nobody over the threshold', () => {
    const g = coupGame();
    g.final_coup = true;
    run(g);
    expect(g.over).toBe(true);
    const m = margins(g);
    const best = (['US', 'ARVN', 'NVA', 'VC'] as const).reduce((a, b) => (m[b] > m[a] ? b : a));
    expect(g.result).toContain(`${best} wins`);
    expect(g.result).toContain('NVA');
  });
  it('ties on margin resolve deterministically', () => {
    const g = coupGame();
    g.final_coup = true;
    g.available.us_troops = 0; g.available.us_base = 0; // US -50, everyone else < 0 too
    run(g);
    expect(g.over).toBe(true);
    expect(g.result).toMatch(/wins/);
  });
});

describe('Coup: resources', () => {
  it('sabotages contested LoCs, degrades the Trail, earns resources, and casualties cut Aid', () => {
    const g = coupGame();
    g.aid = 10; g.resources = { ARVN: 5, NVA: 5, VC: 5 };
    put(g, 'loc_saigon_can_tho', 'vc_guer_u', 2); // Econ 2, sabotaged
    put(g, 'loc_hue_da_nang', 'us_troops', 1);   // Econ 1, safe
    put(g, 'loc_hue_da_nang', 'vc_guer_u', 1);
    put(g, 'saigon', 'vc_base', 1);
    put(g, 'central_laos', 'nva_base', 1);
    put(g, 'central_laos', 'us_troops', 2);      // COIN controlled Laos -> Trail 2 -> 1 (then redeployed away)
    g.casualties.us_troops = 4;
    run(g);
    expect(g.spaces.loc_saigon_can_tho.terror).toBe(0); // reset removes markers at the end
    expect(g.trail).toBe(1);
    // Econ = sum of unsabotaged LoC Econ values = all econ minus 2
    expect(g.econ).toBeGreaterThan(0);
    expect(g.resources.ARVN).toBe(5 + 10 + g.econ);
    expect(g.resources.VC).toBe(5 + 1);
    expect(g.resources.NVA).toBe(5 + 1 + 2 * 1);
    expect(g.aid).toBe(6);
    expect(g.log.some((l) => l.includes('sabotage'))).toBe(true);
  });
});

describe('Coup: support phase', () => {
  it('bots auto-pacify (max 4 spaces, 3 resources per step) and VC agitates', () => {
    const g = coupGame();
    g.resources = { ARVN: 40, NVA: 0, VC: 3 };
    g.aid = 0;
    for (const id of ['tay_ninh', 'kien_phong', 'kien_hoa_vinh_binh', 'ba_xuyen', 'kien_giang_an_xuyen']) {
      put(g, id, 'us_troops', 2);
      put(g, id, 'arvn_police', 2);
      g.spaces[id].support = -1;
    }
    put(g, 'binh_dinh', 'vc_guer_u', 2);
    g.spaces.binh_dinh.support = 0;
    run(g);
    const shifted = ['tay_ninh', 'kien_phong', 'kien_hoa_vinh_binh', 'ba_xuyen', 'kien_giang_an_xuyen'].filter((id) => g.spaces[id].support === 1);
    expect(shifted.length).toBe(4); // 2 steps each: -1 -> +1
    expect(g.spaces.binh_dinh.support).toBe(-2);
    expect(g.resources.VC).toBe(1);
    expect(g.resources.ARVN).toBe(Math.min(75, 40 + g.econ) - 4 * 6);
  });
  it('human US chooses pacification spaces', () => {
    const g = coupGame();
    g.humans = ['US'];
    g.resources.ARVN = 30;
    put(g, 'tay_ninh', 'us_troops', 2);
    put(g, 'tay_ninh', 'arvn_police', 2);
    g.spaces.tay_ninh.support = 0;
    run(g);
    expect(getView(g).active).toBe('US');
    doAction(g, 'space', 'tay_ninh');
    expect(g.spaces.tay_ninh.support).toBe(2);
    // no more candidates: the phase advanced to Commitment (human US)
    expect(getView(g).prompt).toContain('Commitment');
    doAction(g, 'done');
    expect(g.stack.length).toBe(0);
    expect(g.over).toBe(false);
  });
  it('Terror is removed before shifting', () => {
    const g = coupGame();
    g.leader = 127; // Ky: cost 4
    g.resources.ARVN = 8;
    g.aid = 0;
    put(g, 'tay_ninh', 'us_troops', 2);
    put(g, 'tay_ninh', 'arvn_police', 2);
    g.spaces.tay_ninh.terror = 1;
    g.spaces.tay_ninh.support = 0;
    run(g);
    expect(g.spaces.tay_ninh.support).toBe(1);
  });
});

describe('Coup: redeploy, commitment, reset', () => {
  it('removes COIN pieces from Laos/Cambodia', () => {
    const g = coupGame();
    put(g, 'central_laos', 'us_troops', 2);
    put(g, 'the_fishhook', 'arvn_troops', 3);
    run(g);
    expect(n(g, 'central_laos', 'us_troops')).toBe(0);
    expect(n(g, 'the_fishhook', 'arvn_troops')).toBe(0);
    expect(g.available.arvn_troops).toBe(PIECE_TOTALS.arvn_troops);
  });
  it('human ARVN redeploys troops', () => {
    const g = coupGame();
    g.humans = ['ARVN'];
    put(g, 'kien_phong', 'arvn_troops', 2);
    run(g);
    expect(getView(g).active).toBe('ARVN');
    doAction(g, 'piece', 'kien_phong:arvn_troops');
    doAction(g, 'space', 'saigon');
    expect(n(g, 'saigon', 'arvn_troops')).toBe(1);
    doAction(g, 'done');
    expect(g.stack.length).toBe(0);
  });
  it('Commitment moves casualties (half Out of Play) and human US can move pieces', () => {
    const g = coupGame();
    g.humans = ['US'];
    g.casualties.us_troops = 5;
    put(g, 'kien_phong', 'us_troops', 1);
    run(g);
    expect(g.out_of_play.us_troops).toBe(2);
    expect(g.casualties.us_troops).toBe(0);
    doAction(g, 'piece', 'kien_phong:us_troops');
    doAction(g, 'space', 'saigon');
    expect(n(g, 'saigon', 'us_troops')).toBe(1);
    doAction(g, 'done');
    expect(g.stack.length).toBe(0);
  });
  it('Reset: Trail 0->1 and 4->3, markers removed, guerrillas underground, momentum cleared, all eligible', () => {
    const g = coupGame();
    g.trail = 0;
    g.momentum = [17, 38];
    g.eligible = { US: false, ARVN: false, NVA: true, VC: false };
    g.spaces.kien_phong.terror = 1;
    put(g, 'kien_phong', 'vc_guer_a', 2);
    put(g, 'kien_phong', 'nva_guer_a', 1);
    run(g);
    expect(g.trail).toBe(1);
    expect(g.momentum).toEqual([]);
    expect(g.spaces.kien_phong.terror).toBe(0);
    expect(n(g, 'kien_phong', 'vc_guer_u')).toBe(2);
    expect(n(g, 'kien_phong', 'nva_guer_u')).toBe(1);
    expect(Object.values(g.eligible).every(Boolean)).toBe(true);
    expect(g.coup_count).toBe(1);
    const h = coupGame();
    h.trail = 4;
    run(h);
    expect(h.trail).toBe(3);
  });
});

describe('Coup: leaders', () => {
  it('a leader Coup card replaces the leader and pushes the old one to the box', () => {
    const g = coupGame(126);
    g.leader = 125;
    run(g);
    expect(g.leader).toBe(126);
    expect(g.leader_box).toEqual([125]);
  });
  it('Failed Attempt causes ARVN desertion', () => {
    const g = coupGame(129);
    put(g, 'saigon', 'arvn_troops', 10);
    put(g, 'kien_phong', 'arvn_police', 10);
    run(g);
    expect(g.available.arvn_troops + g.available.arvn_police).toBe(PIECE_TOTALS.arvn_troops + PIECE_TOTALS.arvn_police - 20 + 4);
    expect(g.patronage).toBe(13);
  });
});
