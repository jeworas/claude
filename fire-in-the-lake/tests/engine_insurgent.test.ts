import { describe, expect, it } from 'vitest';
import type { Game, PoolKind } from '../src/core/types';
import { POOL_KINDS, PIECE_TOTALS } from '../src/core/types';
import { doAction, getView, push, rollDie, top, cloneGame } from '../src/core/framework';
import { SPACE_IDS } from '../src/data/map';
import '../src/engine/insurgent_ops';

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
function seedFor(pred: (r: number) => boolean): number {
  for (let s = 1; s < 500; s++) { const g = mk(); g.seed = s; if (pred(rollDie(g))) return s; }
  throw new Error('no seed');
}

describe('Rally', () => {
  it('places a guerrilla, costs 1, and skips Support spaces', () => {
    const g = mk();
    g.spaces.tay_ninh.support = 1;
    push(g, 'op_rally', { faction: 'VC' });
    expect(has(g, 'space', 'tay_ninh')).toBe(false);
    expect(has(g, 'space', 'kien_phong')).toBe(true);
    do_(g, 'space', 'kien_phong');
    do_(g, 'opt', 'guer');
    expect(n(g, 'kien_phong', 'vc_guer_u')).toBe(1);
    expect(g.resources.VC).toBe(14);
    do_(g, 'done');
    expect(g.stack.length).toBe(0);
  });
  it('limited Rally ends after one space', () => {
    const g = mk();
    push(g, 'op_rally', { faction: 'VC', limited: true });
    do_(g, 'space', 'kien_phong');
    do_(g, 'opt', 'guer');
    expect(g.stack.length).toBe(0);
  });
  it('replaces 2 guerrillas with a base and rallies many at a base', () => {
    const g = mk();
    put(g, 'kien_phong', 'vc_guer_u', 2);
    push(g, 'op_rally', { faction: 'VC' });
    do_(g, 'space', 'kien_phong');
    do_(g, 'opt', 'base');
    expect(n(g, 'kien_phong', 'vc_base')).toBe(1);
    expect(n(g, 'kien_phong', 'vc_guer_u')).toBe(0);
  });
  it('VC base rally places pop + bases guerrillas', () => {
    const g = mk();
    put(g, 'tay_ninh', 'vc_base', 1); // pop 2
    push(g, 'op_rally', { faction: 'VC' });
    do_(g, 'space', 'tay_ninh');
    do_(g, 'opt', 'many');
    expect(n(g, 'tay_ninh', 'vc_guer_u')).toBe(3);
  });
  it('NVA improves the Trail for 2 Resources (even in a free Rally); Rally is never free in Laos at Trail 4', () => {
    const g = mk();
    push(g, 'op_rally', { faction: 'NVA' });
    do_(g, 'trail');
    expect(g.trail).toBe(3);
    expect(g.resources.NVA).toBe(18);
    const f = mk();
    push(f, 'op_rally', { faction: 'NVA', free: true });
    do_(f, 'trail');
    expect(f.resources.NVA).toBe(18);
    const h = mk();
    h.trail = 4;
    push(h, 'op_rally', { faction: 'NVA' });
    expect(has(h, 'trail')).toBe(false);
    do_(h, 'space', 'central_laos');
    do_(h, 'opt', 'guer');
    expect(h.resources.NVA).toBe(19);
  });
  it('SA-2s (shaded) improves the Trail 2 boxes; ADSID costs 6; AAA limits the Rally to 1 space', () => {
    const g = mk();
    g.capabilities[34] = 'shaded';
    push(g, 'op_rally', { faction: 'NVA' });
    do_(g, 'trail');
    expect(g.trail).toBe(4);
    const h = mk();
    h.momentum = [7]; h.tmp.momentum_side = { 7: 'unshaded' };
    push(h, 'op_rally', { faction: 'NVA' });
    do_(h, 'trail');
    expect(h.resources.NVA).toBe(20 - 2 - 6);
    const k = mk();
    k.capabilities[31] = 'unshaded';
    push(k, 'op_rally', { faction: 'NVA' });
    do_(k, 'trail');
    do_(k, 'space', 'central_laos');
    do_(k, 'opt', 'guer');
    expect(k.stack.length).toBe(0);
  });
  it('McNamara Line momentum blocks Trail improvement and Infiltrate', () => {
    const g = mk();
    g.momentum = [38];
    push(g, 'op_rally', { faction: 'NVA' });
    expect(has(g, 'trail')).toBe(false);
    g.stack = [];
    put(g, 'tay_ninh', 'nva_base', 1);
    push(g, 'sa_infiltrate', {});
    expect(g.stack.length).toBe(0);
  });
});

describe('March', () => {
  it('moves guerrillas; LoC destinations are free and activate when group + non-Base COIN > 3', () => {
    const g = mk();
    put(g, 'kien_phong', 'vc_guer_u', 2);
    put(g, 'loc_can_tho_chau_doc', 'arvn_police', 2);
    push(g, 'op_march', { faction: 'VC' });
    do_(g, 'space', 'loc_can_tho_chau_doc');
    do_(g, 'all', 'kien_phong');
    do_(g, 'done');
    expect(n(g, 'loc_can_tho_chau_doc', 'vc_guer_a')).toBe(2);
    expect(g.resources.VC).toBe(15);
  });
  it('a Province destination costs 1; COIN Bases do not count toward activation', () => {
    const g = mk();
    put(g, 'kien_phong', 'vc_guer_u', 2);
    put(g, 'tay_ninh', 'arvn_base', 2);
    g.spaces.tay_ninh.support = 1;
    push(g, 'op_march', { faction: 'VC' });
    do_(g, 'space', 'tay_ninh');
    do_(g, 'all', 'kien_phong');
    do_(g, 'done');
    expect(n(g, 'tay_ninh', 'vc_guer_u')).toBe(2);
    expect(g.resources.VC).toBe(14);
  });
  it('stays underground when the total is 3 or less', () => {
    const g = mk();
    put(g, 'kien_phong', 'vc_guer_u', 1);
    put(g, 'loc_can_tho_chau_doc', 'arvn_police', 2);
    push(g, 'op_march', { faction: 'VC' });
    do_(g, 'space', 'loc_can_tho_chau_doc');
    do_(g, 'all', 'kien_phong');
    do_(g, 'done');
    expect(n(g, 'loc_can_tho_chau_doc', 'vc_guer_u')).toBe(1);
  });
  it('is blocked in Monsoon', () => {
    const g = mk();
    g.current = 1; g.next = 125;
    put(g, 'kien_phong', 'vc_guer_u', 2);
    push(g, 'op_march', { faction: 'VC' });
    expect(g.stack.length).toBe(0);
  });
  it('NVA continues through Laos with a Trail, paying for each added destination; not with Trail 0 or a LimOp', () => {
    const g = mk();
    put(g, 'north_vietnam', 'nva_troops', 2);
    push(g, 'op_march', { faction: 'NVA' });
    do_(g, 'space', 'central_laos');
    do_(g, 'all', 'north_vietnam');
    do_(g, 'done');
    expect(has(g, 'space', 'southern_laos')).toBe(true);
    do_(g, 'space', 'southern_laos');
    do_(g, 'all', 'central_laos');
    do_(g, 'done');
    expect(n(g, 'southern_laos', 'nva_troops')).toBe(2);
    expect(g.resources.NVA).toBe(18);
    const h = mk();
    h.trail = 0;
    put(h, 'north_vietnam', 'nva_troops', 2);
    push(h, 'op_march', { faction: 'NVA' });
    do_(h, 'space', 'central_laos');
    do_(h, 'all', 'north_vietnam');
    do_(h, 'done');
    expect(has(h, 'space', 'southern_laos')).toBe(false);
    const k = mk();
    put(k, 'north_vietnam', 'nva_troops', 2);
    push(k, 'op_march', { faction: 'NVA', limited: true });
    do_(k, 'space', 'central_laos');
    do_(k, 'all', 'north_vietnam');
    do_(k, 'done');
    expect(k.stack.length).toBe(0);
  });
  it('Trail 4: NVA March into or out of Laos/Cambodia is free; pieces that stop in South Vietnam cannot move twice', () => {
    const g = mk();
    g.trail = 4;
    put(g, 'north_vietnam', 'nva_troops', 2);
    push(g, 'op_march', { faction: 'NVA' });
    do_(g, 'space', 'central_laos');
    do_(g, 'all', 'north_vietnam');
    do_(g, 'done');
    expect(g.resources.NVA).toBe(20);
    do_(g, 'space', 'quang_nam');
    do_(g, 'all', 'central_laos');
    do_(g, 'done'); // out of Laos: free
    expect(g.resources.NVA).toBe(20);
    expect(n(g, 'quang_nam', 'nva_troops')).toBe(2);
    expect(has(g, 'space', 'quang_tin_quang_ngai')).toBe(false); // the troops are locked in the South
  });
});

describe('Attack', () => {
  it('removes 2 enemy on success, activating guerrillas; US goes to Casualties with attrition', () => {
    const g = mk();
    g.seed = seedFor((r) => r <= 2);
    put(g, 'kien_phong', 'vc_guer_u', 2);
    put(g, 'kien_phong', 'us_troops', 3);
    push(g, 'op_attack', { faction: 'VC', ambush: false });
    do_(g, 'space', 'kien_phong');
    do_(g, 'opt', 'attack');
    expect(n(g, 'kien_phong', 'us_troops')).toBe(1);
    expect(g.casualties.us_troops).toBe(2);
    expect(n(g, 'kien_phong', 'vc_guer_a')).toBe(0); // attrition removed both
    expect(g.resources.VC).toBe(14);
  });
  it('fails on a high roll but still activates', () => {
    const g = mk();
    g.seed = seedFor((r) => r >= 5);
    put(g, 'kien_phong', 'vc_guer_u', 1);
    put(g, 'kien_phong', 'arvn_troops', 3);
    push(g, 'op_attack', { faction: 'VC', ambush: false });
    do_(g, 'space', 'kien_phong');
    do_(g, 'opt', 'attack');
    expect(n(g, 'kien_phong', 'arvn_troops')).toBe(3);
    expect(n(g, 'kien_phong', 'vc_guer_a')).toBe(1);
  });
  it('bases are removed only after other pieces; player chooses among kinds', () => {
    const g = mk();
    g.seed = seedFor((r) => r <= 1);
    put(g, 'kien_phong', 'vc_guer_u', 1);
    put(g, 'kien_phong', 'arvn_base', 1);
    put(g, 'kien_phong', 'arvn_police', 1);
    put(g, 'kien_phong', 'arvn_troops', 1);
    push(g, 'op_attack', { faction: 'VC', ambush: false });
    do_(g, 'space', 'kien_phong');
    do_(g, 'opt', 'attack');
    expect(top(g)!.state).toBe('ins_remove');
    expect(has(g, 'piece', 'kien_phong:arvn_base')).toBe(false);
    do_(g, 'piece', 'kien_phong:arvn_police');
    expect(n(g, 'kien_phong', 'arvn_base')).toBe(1);
  });
  it('NVA Troops attack removes 1 per 2 troops without a roll', () => {
    const g = mk();
    put(g, 'kien_phong', 'nva_troops', 5);
    put(g, 'kien_phong', 'arvn_troops', 4);
    push(g, 'op_attack', { faction: 'NVA', ambush: false });
    do_(g, 'space', 'kien_phong');
    do_(g, 'opt', 'troops');
    expect(n(g, 'kien_phong', 'arvn_troops')).toBe(2);
  });
  it('Ambush (inside op_attack, standalone) removes 1 enemy, activates 1, no roll and no attrition', () => {
    const g = mk();
    put(g, 'kien_phong', 'vc_guer_u', 2);
    put(g, 'kien_phong', 'us_troops', 3);
    push(g, 'op_attack', { faction: 'VC' });
    do_(g, 'space', 'kien_phong');
    do_(g, 'opt', 'ambush');
    expect(n(g, 'kien_phong', 'us_troops')).toBe(2);
    expect(g.casualties.us_troops).toBe(1);
    expect(n(g, 'kien_phong', 'vc_guer_a')).toBe(1);
    expect(n(g, 'kien_phong', 'vc_guer_u')).toBe(1); // no Attrition
    expect(g.resources.VC).toBe(14);
    const h = mk();
    put(h, 'kien_phong', 'vc_guer_u', 1);
    put(h, 'kien_phong', 'arvn_troops', 3);
    push(h, 'sa_ambush', { faction: 'VC' });
    do_(h, 'space', 'kien_phong');
    do_(h, 'opt', 'ambush');
    expect(n(h, 'kien_phong', 'arvn_troops')).toBe(2);
    expect(h.resources.VC).toBe(15);
  });
  it('an Ambush on a LoC may remove an enemy from an adjacent space; Main Force Bns shaded removes 2', () => {
    const g = mk();
    put(g, 'loc_can_tho_chau_doc', 'vc_guer_u', 1);
    put(g, 'kien_phong', 'arvn_troops', 3);
    g.capabilities[104] = 'shaded';
    push(g, 'sa_ambush', { faction: 'VC' });
    do_(g, 'space', 'loc_can_tho_chau_doc');
    do_(g, 'opt', 'ambush'); // the only enemy is in adjacent Kien Phong
    expect(n(g, 'kien_phong', 'arvn_troops')).toBe(1);
  });
  it('Booby Traps (unshaded) limits Ambush to 1 space', () => {
    const g = mk();
    g.capabilities[101] = 'unshaded';
    put(g, 'kien_phong', 'vc_guer_u', 1);
    put(g, 'tay_ninh', 'vc_guer_u', 1);
    put(g, 'kien_phong', 'arvn_troops', 2);
    put(g, 'tay_ninh', 'arvn_troops', 2);
    push(g, 'sa_ambush', { faction: 'VC' });
    do_(g, 'space', 'kien_phong');
    do_(g, 'opt', 'ambush');
    expect(g.stack.length).toBe(0);
  });
  it('Claymores (unshaded momentum) forbids Ambush', () => {
    const g = mk();
    g.momentum = [17]; g.tmp.momentum_side = { 17: 'unshaded' };
    put(g, 'kien_phong', 'vc_guer_u', 2);
    put(g, 'kien_phong', 'arvn_troops', 3);
    push(g, 'sa_ambush', { faction: 'VC' });
    expect(g.stack.length).toBe(0);
  });
});

describe('Terror', () => {
  it('VC Terror places a marker, activates a guerrilla, shifts toward Opposition and costs 1', () => {
    const g = mk();
    g.spaces.kien_phong.support = 1;
    put(g, 'kien_phong', 'vc_guer_u', 2);
    push(g, 'op_terror', { faction: 'VC' });
    do_(g, 'space', 'kien_phong');
    expect(g.spaces.kien_phong.terror).toBe(1);
    expect(g.spaces.kien_phong.support).toBe(0);
    expect(n(g, 'kien_phong', 'vc_guer_a')).toBe(1);
    expect(g.resources.VC).toBe(14);
  });
  it('NVA Terror only shifts Support toward Neutral; LoC gets Sabotage', () => {
    const g = mk();
    g.spaces.kien_phong.support = -1;
    put(g, 'kien_phong', 'nva_guer_u', 1);
    put(g, 'loc_can_tho_chau_doc', 'nva_guer_u', 1);
    push(g, 'op_terror', { faction: 'NVA' });
    do_(g, 'space', 'kien_phong');
    expect(g.spaces.kien_phong.support).toBe(-1);
    do_(g, 'space', 'loc_can_tho_chau_doc');
    expect(g.spaces.loc_can_tho_chau_doc.terror).toBe(1);
  });
});

describe('Special Activities', () => {
  it('Infiltrate places Troops up to Trail + Bases, replaces Guerrillas with Troops, or takes over 1 VC piece', () => {
    const g = mk();
    put(g, 'tay_ninh', 'nva_base', 1);
    put(g, 'tay_ninh', 'nva_guer_u', 2);
    push(g, 'sa_infiltrate', {});
    do_(g, 'space', 'tay_ninh');
    do_(g, 'mode', 'build');
    do_(g, 'place', 'troop');
    do_(g, 'place', 'troop');
    do_(g, 'place', 'troop');
    expect(has(g, 'place', 'troop')).toBe(false); // Trail 2 + 1 Base
    do_(g, 'piece', 'tay_ninh:nva_guer_u');
    expect(n(g, 'tay_ninh', 'nva_troops')).toBe(4);
    expect(n(g, 'tay_ninh', 'nva_guer_u')).toBe(1);
    do_(g, 'finish');
    expect(g.stack.length).toBe(0);
    const h = mk();
    put(h, 'tay_ninh', 'nva_base', 1);
    put(h, 'tay_ninh', 'nva_troops', 3);
    put(h, 'tay_ninh', 'vc_guer_u', 2);
    h.spaces.tay_ninh.support = -2;
    push(h, 'sa_infiltrate', {});
    do_(h, 'space', 'tay_ninh');
    do_(h, 'mode', 'takeover');
    expect(h.spaces.tay_ninh.support).toBe(-1);
    do_(h, 'piece', 'tay_ninh:vc_guer_u');
    expect(n(h, 'tay_ninh', 'nva_guer_u')).toBe(1);
    expect(n(h, 'tay_ninh', 'vc_guer_u')).toBe(1);
  });
  it('Bombard removes one COIN Troop with 3+ NVA Troops in range', () => {
    const g = mk();
    put(g, 'central_laos', 'nva_troops', 3);
    put(g, 'quang_tri_thua_thien', 'us_troops', 3);
    put(g, 'quang_tri_thua_thien', 'arvn_troops', 1);
    push(g, 'sa_bombard', {});
    do_(g, 'space', 'quang_tri_thua_thien');
    do_(g, 'piece', 'quang_tri_thua_thien:us_troops');
    expect(g.casualties.us_troops).toBe(1);
    expect(g.stack.length).toBe(0);
  });
  it('Bombard can target a lone COIN Base but not 2 troops', () => {
    const g = mk();
    put(g, 'central_laos', 'nva_troops', 3);
    put(g, 'quang_tri_thua_thien', 'us_troops', 2);
    push(g, 'sa_bombard', {});
    expect(has(g, 'space', 'quang_tri_thua_thien')).toBe(false);
    g.stack = [];
    put(g, 'quang_tri_thua_thien', 'us_base', 1);
    push(g, 'sa_bombard', {});
    do_(g, 'space', 'quang_tri_thua_thien');
    expect(g.casualties.us_troops).toBe(1); // troops go before the Base
  });
  it('Tax is not allowed under COIN Control', () => {
    const g = mk();
    put(g, 'kien_phong', 'vc_guer_u', 1);
    put(g, 'kien_phong', 'us_troops', 2);
    push(g, 'sa_tax', {});
    expect(g.stack.length).toBe(0);
  });
  it('LoC Terror is free', () => {
    const g = mk();
    put(g, 'loc_can_tho_chau_doc', 'vc_guer_u', 1);
    push(g, 'op_terror', { faction: 'VC' });
    do_(g, 'space', 'loc_can_tho_chau_doc');
    expect(g.resources.VC).toBe(15);
  });
  it('March can Ambush from the space it entered (1 enemy piece)', () => {
    const g = mk();
    put(g, 'kien_phong', 'vc_guer_u', 2);
    put(g, 'tay_ninh', 'arvn_troops', 3);
    push(g, 'op_march', { faction: 'VC', max: 1 });
    do_(g, 'space', 'tay_ninh');
    do_(g, 'all', 'kien_phong');
    do_(g, 'done');
    do_(g, 'opt', 'ambush');
    expect(n(g, 'tay_ninh', 'arvn_troops')).toBe(2);
    expect(g.stack.length).toBe(0);
  });
  it('Tax flips a guerrilla and earns Econ on LoCs, 2 x Pop elsewhere', () => {
    const g = mk();
    put(g, 'loc_saigon_can_tho', 'vc_guer_u', 1);
    put(g, 'kien_phong', 'vc_guer_u', 1);
    push(g, 'sa_tax', {});
    do_(g, 'space', 'loc_saigon_can_tho');
    do_(g, 'space', 'kien_phong');
    expect(g.resources.VC).toBe(15 + 2 + 4);
    expect(g.spaces.kien_phong.support).toBe(1);
    expect(n(g, 'kien_phong', 'vc_guer_a')).toBe(1);
  });
  it('Subvert: remove 2 cubes or replace 1; Patronage -1 per 2 pieces in total (rounded down); no Activation', () => {
    const g = mk();
    put(g, 'kien_phong', 'vc_guer_u', 1);
    put(g, 'kien_phong', 'arvn_troops', 1);
    put(g, 'kien_phong', 'arvn_police', 2);
    push(g, 'sa_subvert', {});
    do_(g, 'space', 'kien_phong');
    do_(g, 'mode', 'replace');
    do_(g, 'piece', 'kien_phong:arvn_police');
    expect(n(g, 'kien_phong', 'vc_guer_u')).toBe(2);
    expect(g.patronage).toBe(15); // 1 piece: rounds down to 0 (done ends the SA below)
    const h = mk();
    put(h, 'kien_phong', 'vc_guer_u', 1);
    put(h, 'kien_phong', 'arvn_troops', 1);
    put(h, 'kien_phong', 'arvn_police', 2);
    push(h, 'sa_subvert', {});
    do_(h, 'space', 'kien_phong');
    do_(h, 'mode', 'remove');
    do_(h, 'piece', 'kien_phong:arvn_troops'); // the remaining cube is removed automatically
    expect(n(h, 'kien_phong', 'arvn_police')).toBe(1);
    expect(n(h, 'kien_phong', 'arvn_troops')).toBe(0);
    expect(n(h, 'kien_phong', 'vc_guer_u')).toBe(1);
    expect(h.patronage).toBe(14);
  });
  it('args.spaces restricts selection', () => {
    const g = mk();
    put(g, 'kien_phong', 'vc_guer_u', 1);
    put(g, 'tay_ninh', 'vc_guer_u', 1);
    push(g, 'sa_tax', { spaces: ['tay_ninh'] });
    expect(has(g, 'space', 'kien_phong')).toBe(false);
    expect(has(g, 'space', 'tay_ninh')).toBe(true);
  });
});

describe('Terror rules (3.3.4)', () => {
  it('VC shifts toward Active Opposition only where it places a fresh marker', () => {
    const g = mk();
    g.spaces.kien_phong.support = 0;
    put(g, 'kien_phong', 'vc_guer_u', 2);
    push(g, 'op_terror', { faction: 'VC' });
    do_(g, 'space', 'kien_phong');
    expect(g.spaces.kien_phong.support).toBe(-1);
    const h = mk();
    h.spaces.kien_phong.support = 2;
    h.spaces.kien_phong.terror = 1;
    put(h, 'kien_phong', 'vc_guer_u', 2);
    push(h, 'op_terror', { faction: 'VC' });
    do_(h, 'space', 'kien_phong');
    expect(h.spaces.kien_phong.support).toBe(2);
    expect(n(h, 'kien_phong', 'vc_guer_a')).toBe(1); // still Activates
  });
  it('Cadres (unshaded) makes Terror remove 2 VC Guerrillas per space', () => {
    const g = mk();
    g.capabilities[116] = 'unshaded';
    put(g, 'kien_phong', 'vc_guer_u', 1);
    push(g, 'op_terror', { faction: 'VC' });
    expect(g.stack.length).toBe(0);
    const h = mk();
    h.capabilities[116] = 'unshaded';
    put(h, 'kien_phong', 'vc_guer_u', 3);
    push(h, 'op_terror', { faction: 'VC' });
    do_(h, 'space', 'kien_phong');
    expect(n(h, 'kien_phong', 'vc_guer_u') + n(h, 'kien_phong', 'vc_guer_a')).toBe(1);
  });
});
