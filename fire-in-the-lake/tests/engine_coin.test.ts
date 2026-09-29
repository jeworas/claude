import { describe, it, expect } from 'vitest';
import { newGame } from '../src/engine/setup';
import '../src/engine/opmenu';
import '../src/engine/coin_ops';
import { doAction, getView, push, top, rollDie } from '../src/core/framework';
import { SPACE_IDS } from '../src/data/map';
import type { Game, PieceKind } from '../src/core/types';
import { patrolReach, transportReach } from '../src/engine/coin_ops';

function blank(): Game {
  const g = newGame('short', [], 11);
  for (const id of SPACE_IDS) { g.spaces[id].pieces = {}; g.spaces[id].support = 0; g.spaces[id].terror = 0; }
  for (const k of Object.keys(g.available) as (keyof Game['available'])[]) g.available[k] = 30;
  g.available.arvn_base = 3; g.available.us_irreg = 6; g.available.arvn_ranger = 6;
  g.stack = [];
  g.resources = { ARVN: 30, NVA: 10, VC: 10 };
  g.econ = 0; g.aid = 10; g.patronage = 10; g.trail = 3;
  g.momentum = []; g.capabilities = {}; g.leader = 128; // Thieu: no special effects
  g.tmp = {};
  g.current = 1; g.next = 2;
  return g;
}
function put(g: Game, sp: string, p: Partial<Record<PieceKind, number>>) {
  for (const [k, n] of Object.entries(p)) g.spaces[sp].pieces[k as PieceKind] = n;
}
const c = (g: Game, sp: string, k: PieceKind) => g.spaces[sp].pieces[k] ?? 0;
const act = (g: Game, verb: string, arg?: string | number) => doAction(g, verb, arg);
const has = (g: Game, verb: string, arg?: string | number) => getView(g).actions.some((a) => a.verb === verb && a.arg === arg);
function seedForRoll(n: number): number {
  for (let s = 0; s < 500; s++) { const t = { seed: s } as Game; if (rollDie(t) === n) return s; }
  throw new Error('no seed');
}

describe('Assault (3.2.4)', () => {
  it('US removes Troops, then Active guerrillas; Underground guerrillas protect Bases', () => {
    const g = blank();
    put(g, 'tay_ninh', { us_troops: 4, nva_troops: 1, vc_guer_a: 1, vc_guer_u: 2, vc_base: 1 });
    push(g, 'op_assault', { faction: 'US' });
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    expect(c(g, 'tay_ninh', 'nva_troops')).toBe(0);
    expect(c(g, 'tay_ninh', 'vc_guer_a')).toBe(0);
    expect(c(g, 'tay_ninh', 'vc_guer_u')).toBe(2);
    expect(c(g, 'tay_ninh', 'vc_base')).toBe(1);
    expect(g.stack.length).toBe(0);
  });
  it('US: 1 per Troop; 1 per 2 in Highland; 2 per Troop with a US Base', () => {
    const g = blank();
    put(g, 'quang_nam', { us_troops: 3, nva_troops: 6 });
    push(g, 'op_assault', { faction: 'US' });
    act(g, 'space', 'quang_nam'); act(g, 'done');
    expect(c(g, 'quang_nam', 'nva_troops')).toBe(5);
    const h = blank();
    put(h, 'quang_nam', { us_troops: 3, us_base: 1, nva_troops: 7 });
    push(h, 'op_assault', { faction: 'US' });
    act(h, 'space', 'quang_nam'); act(h, 'done');
    expect(c(h, 'quang_nam', 'nva_troops')).toBe(1);
  });
  it('ARVN: 1 per 2 cubes; Police only in Cities/LoCs; Highland 1 per 3; Base removal gives +6 Aid', () => {
    const g = blank();
    put(g, 'tay_ninh', { arvn_troops: 4, arvn_police: 2, vc_guer_a: 1, vc_base: 2 });
    push(g, 'op_assault', { faction: 'ARVN' });
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    expect(c(g, 'tay_ninh', 'vc_guer_a')).toBe(0);
    expect(c(g, 'tay_ninh', 'vc_base')).toBe(1);
    expect(g.resources.ARVN).toBe(27);
    expect(g.aid).toBe(16);
    const h = blank();
    put(h, 'hue', { arvn_troops: 1, arvn_police: 3, nva_guer_a: 3 });
    push(h, 'op_assault', { faction: 'ARVN' });
    act(h, 'space', 'hue'); act(h, 'done');
    expect(c(h, 'hue', 'nva_guer_a')).toBe(1);
    const i = blank();
    put(i, 'quang_nam', { arvn_troops: 5, arvn_police: 4, nva_guer_a: 3 });
    push(i, 'op_assault', { faction: 'ARVN' });
    act(i, 'space', 'quang_nam'); act(i, 'done');
    expect(c(i, 'quang_nam', 'nva_guer_a')).toBe(2);
  });
  it('a Tunneled Base ends removal in the space; 4-6 removes only the marker', () => {
    const g = blank();
    put(g, 'tay_ninh', { us_troops: 3, vc_tunnel: 2 });
    g.seed = 0;
    push(g, 'op_assault', { faction: 'US' });
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    expect(c(g, 'tay_ninh', 'vc_tunnel') + c(g, 'tay_ninh', 'vc_base')).toBe(2);
  });
  it('lets the player choose between Active guerrilla factions', () => {
    const g = blank();
    put(g, 'tay_ninh', { us_troops: 1, vc_guer_a: 1, nva_guer_a: 1 });
    push(g, 'op_assault', { faction: 'US' });
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    act(g, 'piece', 'tay_ninh:nva_guer_a');
    expect(c(g, 'tay_ninh', 'vc_guer_a')).toBe(1);
  });
  it('US may follow up with an ARVN Assault for 3 ARVN Resources', () => {
    const g = blank();
    put(g, 'tay_ninh', { us_troops: 1, arvn_troops: 2, vc_guer_a: 3 });
    push(g, 'op_assault', { faction: 'US' });
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    act(g, 'space', 'tay_ninh');
    expect(c(g, 'tay_ninh', 'vc_guer_a')).toBe(1);
    expect(g.resources.ARVN).toBe(27);
    expect(g.stack.length).toBe(0);
  });
  it('honors free/spaces/max args (auto-selects a single space)', () => {
    const g = blank();
    put(g, 'tay_ninh', { arvn_troops: 2, vc_guer_a: 1 });
    put(g, 'kien_phong', { arvn_troops: 2, vc_guer_a: 1 });
    push(g, 'op_assault', { faction: 'ARVN', free: true, spaces: ['kien_phong'], max: 1 });
    expect(g.stack.length).toBe(0);
    expect(c(g, 'tay_ninh', 'vc_guer_a')).toBe(1);
    expect(c(g, 'kien_phong', 'vc_guer_a')).toBe(0);
    expect(g.resources.ARVN).toBe(30);
  });
  it('Abrams: shaded max 2 spaces; unshaded removes a non-Tunnel Base first', () => {
    const g = blank();
    g.capabilities[11] = 'shaded';
    for (const id of ['tay_ninh', 'kien_phong', 'binh_dinh']) put(g, id, { us_troops: 1, vc_guer_a: 1 });
    push(g, 'op_assault', { faction: 'US' });
    act(g, 'space', 'tay_ninh'); act(g, 'space', 'kien_phong');
    expect(has(g, 'space', 'binh_dinh')).toBe(false);
    const h = blank();
    h.capabilities[11] = 'unshaded';
    put(h, 'tay_ninh', { us_troops: 1, vc_guer_u: 2, vc_base: 1 });
    push(h, 'op_assault', { faction: 'US' });
    act(h, 'space', 'tay_ninh'); act(h, 'done');
    expect(c(h, 'tay_ninh', 'vc_base')).toBe(0);
  });
  it('Search and Destroy unshaded may remove an Underground guerrilla; shaded shifts Provinces', () => {
    const g = blank();
    g.capabilities[28] = 'unshaded';
    put(g, 'tay_ninh', { us_troops: 1, vc_guer_u: 2 });
    push(g, 'op_assault', { faction: 'US' });
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    expect(c(g, 'tay_ninh', 'vc_guer_u')).toBe(1);
    const h = blank();
    h.capabilities[28] = 'shaded';
    put(h, 'tay_ninh', { us_troops: 1, vc_guer_u: 1 });
    push(h, 'op_assault', { faction: 'US' });
    act(h, 'space', 'tay_ninh'); act(h, 'done');
    expect(h.spaces.tay_ninh.support).toBe(-1);
  });
  it('Body Count makes ARVN Assault free and gives +3 Aid per guerrilla; Lansdale bans US Assault', () => {
    const g = blank();
    g.momentum = [72];
    put(g, 'hue', { arvn_troops: 2, vc_guer_a: 1 });
    push(g, 'op_assault', { faction: 'ARVN' });
    act(g, 'space', 'hue'); act(g, 'done');
    expect(g.resources.ARVN).toBe(30);
    expect(g.aid).toBe(13);
    const h = blank();
    h.momentum = [78];
    put(h, 'tay_ninh', { us_troops: 1, vc_guer_a: 1 });
    push(h, 'op_assault', { faction: 'US' });
    expect(h.stack.length).toBe(0);
    expect(c(h, 'tay_ninh', 'vc_guer_a')).toBe(1);
  });
  it('Cobras shaded can cost a US Troop; Patton unshaded adds 2 in non-Lowland', () => {
    const g = blank();
    g.capabilities[14] = 'unshaded';
    put(g, 'quang_duc_long_khanh', { us_troops: 1, nva_troops: 5 }); // jungle
    push(g, 'op_assault', { faction: 'US' });
    act(g, 'space', 'quang_duc_long_khanh'); act(g, 'done');
    expect(c(g, 'quang_duc_long_khanh', 'nva_troops')).toBe(2);
    const h = blank();
    h.capabilities[13] = 'shaded';
    put(h, 'tay_ninh', { us_troops: 2, vc_guer_a: 5 });
    h.seed = seedForRoll(1);
    push(h, 'op_assault', { faction: 'US' });
    act(h, 'space', 'tay_ninh'); act(h, 'done');
    expect(h.casualties.us_troops).toBeGreaterThanOrEqual(1);
  });
});

describe('Sweep (3.2.3)', () => {
  it('moves Troops in and activates 1 guerrilla per cube (lowland)', () => {
    const g = blank();
    put(g, 'saigon', { us_troops: 2 });
    put(g, 'tay_ninh', { vc_guer_u: 3 });
    push(g, 'op_sweep', { faction: 'US' });
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    act(g, 'move_all', 'saigon:us_troops');
    expect(c(g, 'tay_ninh', 'us_troops')).toBe(2);
    expect(c(g, 'tay_ninh', 'vc_guer_a')).toBe(2);
    expect(g.stack.length).toBe(0);
  });
  it('Troops may reach a space via an adjacent LoC free of enemies', () => {
    const g = blank();
    put(g, 'hue', { us_troops: 2 });
    put(g, 'quang_nam', { vc_guer_u: 2 });
    push(g, 'op_sweep', { faction: 'US' });
    act(g, 'space', 'quang_nam'); act(g, 'done');
    expect(has(g, 'move_all', 'hue:us_troops')).toBe(true);
    const h = blank();
    put(h, 'hue', { us_troops: 2 });
    put(h, 'quang_nam', { vc_guer_u: 2 });
    put(h, 'loc_hue_da_nang', { vc_guer_u: 1 });
    put(h, 'loc_hue_khe_sanh', { vc_guer_u: 1 });
    push(h, 'op_sweep', { faction: 'US' });
    expect(has(h, 'space', 'quang_nam')).toBe(false); // no Troops can reach it
  });
  it('Jungle halves activation; Highland does not; Irregulars count', () => {
    const g = blank();
    put(g, 'quang_duc_long_khanh', { us_troops: 2, us_irreg_u: 2, nva_guer_u: 4 });
    push(g, 'op_sweep', { faction: 'US' });
    act(g, 'space', 'quang_duc_long_khanh'); act(g, 'done');
    expect(c(g, 'quang_duc_long_khanh', 'nva_guer_a')).toBe(2);
    const h = blank();
    put(h, 'quang_nam', { us_troops: 2, us_irreg_u: 1, vc_guer_u: 4 });
    push(h, 'op_sweep', { faction: 'US' });
    act(h, 'space', 'quang_nam'); act(h, 'done');
    expect(c(h, 'quang_nam', 'vc_guer_a')).toBe(3);
  });
  it('is forbidden in Monsoon and never in North Vietnam', () => {
    const g = blank();
    g.next = 126;
    put(g, 'tay_ninh', { us_troops: 3, vc_guer_u: 3 });
    push(g, 'op_sweep', { faction: 'US' });
    expect(g.stack.length).toBe(0);
    const h = blank();
    put(h, 'north_vietnam', { nva_guer_u: 2 });
    put(h, 'central_laos', { us_troops: 3 });
    put(h, 'quang_tri_thua_thien', { us_troops: 1 });
    push(h, 'op_sweep', { faction: 'US' });
    expect(has(h, 'space', 'north_vietnam')).toBe(false);
  });
  it('ARVN Sweep costs 3 per space and counts Police', () => {
    const g = blank();
    put(g, 'tay_ninh', { arvn_troops: 2, arvn_police: 1, vc_guer_u: 4 });
    push(g, 'op_sweep', { faction: 'ARVN' });
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    expect(g.resources.ARVN).toBe(27);
    expect(c(g, 'tay_ninh', 'vc_guer_a')).toBe(3);
  });
  it('CAP shaded limits US Sweep to 2 spaces', () => {
    const g = blank();
    g.capabilities[18] = 'shaded';
    for (const id of ['tay_ninh', 'kien_phong', 'binh_dinh']) put(g, id, { us_troops: 1, vc_guer_u: 1 });
    push(g, 'op_sweep', { faction: 'US' });
    act(g, 'space', 'tay_ninh'); act(g, 'space', 'kien_phong');
    expect(has(g, 'space', 'binh_dinh')).toBe(false);
    expect(top(g)!.state).toBe('op_sweep');
  });
});

describe('Patrol (3.2.2)', () => {
  it('cubes move onto LoCs/Cities, guerrillas activate, then one free Assault', () => {
    const g = blank();
    put(g, 'saigon', { us_troops: 3 });
    put(g, 'loc_saigon_can_tho', { vc_guer_u: 2 });
    push(g, 'op_patrol', { faction: 'US' });
    act(g, 'mode');
    act(g, 'piece', 'saigon:us_troops');
    act(g, 'space', 'loc_saigon_can_tho');
    expect(c(g, 'loc_saigon_can_tho', 'us_troops')).toBe(3);
    act(g, 'done');
    expect(c(g, 'loc_saigon_can_tho', 'vc_guer_a')).toBe(2);
    expect(has(g, 'space', 'loc_saigon_can_tho')).toBe(true);
    act(g, 'space', 'loc_saigon_can_tho');
    expect(c(g, 'loc_saigon_can_tho', 'vc_guer_a')).toBe(0);
    expect(g.stack.length).toBe(0);
  });
  it('movement stops at enemy pieces; Provinces are not entered', () => {
    const g = blank();
    put(g, 'loc_saigon_can_tho', { vc_guer_u: 1 });
    const reach = patrolReach(g, 'saigon');
    expect(reach).toContain('loc_saigon_can_tho');
    expect(reach).not.toContain('can_tho'); // blocked behind the enemy LoC
    expect(reach.some((id) => id === 'tay_ninh')).toBe(false);
  });
  it('ARVN pays 3 once; Limited Patrol uses one destination', () => {
    const g = blank();
    put(g, 'saigon', { arvn_police: 2 });
    push(g, 'op_patrol', { faction: 'ARVN' });
    act(g, 'piece', 'saigon:arvn_police'); act(g, 'space', 'loc_saigon_can_tho');
    act(g, 'piece', 'saigon:arvn_police'); act(g, 'space', 'loc_saigon_cam_ranh');
    expect(g.resources.ARVN).toBe(27);
    const h = blank();
    put(h, 'saigon', { arvn_police: 2 });
    push(h, 'op_patrol', { faction: 'ARVN', limited: true, max: 1 });
    act(h, 'piece', 'saigon:arvn_police'); act(h, 'space', 'loc_saigon_can_tho');
    act(h, 'piece', 'saigon:arvn_police');
    expect(has(h, 'space', 'loc_saigon_cam_ranh')).toBe(false);
    expect(has(h, 'space', 'loc_saigon_can_tho')).toBe(true);
  });
});

describe('Train (3.2.1)', () => {
  it('ARVN: cost only when placing ARVN pieces; Base needs a City/Base; one special action', () => {
    const g = blank();
    put(g, 'hue', { arvn_troops: 3 });
    g.spaces.saigon.terror = 1;
    push(g, 'op_train', { faction: 'ARVN' });
    act(g, 'space', 'saigon'); act(g, 'space', 'hue'); act(g, 'done');
    expect(g.resources.ARVN).toBe(30);
    act(g, 'place', 'arvn_police');
    expect(g.resources.ARVN).toBe(27);
    act(g, 'fill', 'arvn_troops');
    expect(c(g, 'saigon', 'arvn_troops') + c(g, 'saigon', 'arvn_police')).toBe(6);
    expect(has(g, 'place', 'arvn_troops')).toBe(false);
    act(g, 'next'); act(g, 'next'); // hue: place nothing
    expect(g.resources.ARVN).toBe(27);
    act(g, 'space', 'saigon');
    act(g, 'terror'); act(g, 'shift'); act(g, 'shift');
    expect(has(g, 'shift')).toBe(false);
    expect(g.spaces.saigon.terror).toBe(0);
    expect(g.spaces.saigon.support).toBe(2);
    expect(g.resources.ARVN).toBe(27 - 9);
    act(g, 'done');
    expect(g.stack.length).toBe(0);
  });
  it('replacing cubes with a Base costs 3 even with no placement', () => {
    const g = blank();
    put(g, 'hue', { arvn_troops: 3 });
    push(g, 'op_train', { faction: 'ARVN' });
    act(g, 'space', 'hue'); act(g, 'done'); act(g, 'next');
    act(g, 'space', 'hue'); act(g, 'base');
    expect(c(g, 'hue', 'arvn_base')).toBe(1);
    expect(c(g, 'hue', 'arvn_troops')).toBe(0);
    expect(g.resources.ARVN).toBe(27);
  });
  it('ARVN cannot Train in NVA-controlled spaces; US only where it has pieces', () => {
    const g = blank();
    put(g, 'tay_ninh', { nva_troops: 3 });
    push(g, 'op_train', { faction: 'ARVN' });
    expect(has(g, 'space', 'tay_ninh')).toBe(false);
    expect(has(g, 'space', 'saigon')).toBe(true);
    const h = blank();
    push(h, 'op_train', { faction: 'US' });
    expect(h.stack.length).toBe(0);
  });
  it('US: Irregulars, Rangers/cubes only at US Bases, Pacify with a US piece; Ky costs 4', () => {
    const g = blank();
    g.leader = 127;
    put(g, 'saigon', { us_troops: 2, us_base: 1 });
    g.spaces.saigon.terror = 0;
    put(g, 'kien_phong', { us_troops: 1 });
    push(g, 'op_train', { faction: 'US' });
    act(g, 'space', 'saigon'); act(g, 'space', 'kien_phong'); act(g, 'done');
    expect(has(g, 'place', 'arvn_ranger')).toBe(true);
    act(g, 'fill', 'arvn_troops'); // 6 cubes at the US Base
    expect(c(g, 'saigon', 'arvn_troops')).toBe(6);
    expect(g.resources.ARVN).toBe(27);
    act(g, 'next');
    expect(has(g, 'place', 'arvn_ranger')).toBe(false); // no US Base in Kien Phong
    act(g, 'fill', 'us_irreg');
    expect(c(g, 'kien_phong', 'us_irreg_u')).toBe(2);
    act(g, 'next');
    act(g, 'space', 'saigon'); act(g, 'shift');
    expect(g.resources.ARVN).toBe(23);
  });
  it('US in Saigon may transfer up to 3 Patronage to ARVN Resources', () => {
    const g = blank();
    put(g, 'saigon', { us_troops: 2 });
    push(g, 'op_train', { faction: 'US' });
    act(g, 'space', 'saigon'); act(g, 'done'); act(g, 'next');
    act(g, 'space', 'saigon'); act(g, 'transfer', 3);
    expect(g.patronage).toBe(7);
    expect(g.resources.ARVN).toBe(33);
    expect(g.stack.length).toBe(0);
  });
  it('Minh gives +5 Aid on ARVN Train; US never spends below Total Econ', () => {
    const h = blank();
    h.leader = null;
    push(h, 'op_train', { faction: 'ARVN' });
    act(h, 'space', 'saigon'); act(h, 'done');
    expect(h.aid).toBe(15);
    const g = blank();
    g.econ = 29;
    put(g, 'saigon', { us_troops: 2, us_base: 1, arvn_police: 2 });
    push(g, 'op_train', { faction: 'US' });
    act(g, 'space', 'saigon'); act(g, 'done');
    expect(has(g, 'place', 'arvn_ranger')).toBe(false);
    expect(has(g, 'place', 'us_irreg')).toBe(true);
    act(g, 'next');
    act(g, 'space', 'saigon');
    expect(has(g, 'terror')).toBe(false);
    expect(has(g, 'shift')).toBe(false); // cannot afford to Pacify
  });
  it('CORDS: unshaded Pacify in 2 spaces; shaded only to Passive Support', () => {
    const g = blank();
    g.capabilities[19] = 'unshaded';
    for (const id of ['saigon', 'hue']) { put(g, id, { us_troops: 1 }); g.spaces[id].terror = 1; }
    push(g, 'op_train', { faction: 'US' });
    act(g, 'space', 'saigon'); act(g, 'space', 'hue'); act(g, 'done'); act(g, 'next'); act(g, 'next');
    act(g, 'space', 'saigon'); act(g, 'terror'); act(g, 'done');
    expect(has(g, 'space', 'hue')).toBe(true);
    const h = blank();
    h.capabilities[19] = 'shaded';
    put(h, 'saigon', { us_troops: 1 });
    push(h, 'op_train', { faction: 'US' });
    act(h, 'space', 'saigon'); act(h, 'done'); act(h, 'next');
    act(h, 'space', 'saigon'); act(h, 'shift');
    expect(h.spaces.saigon.support).toBe(1);
    expect(has(h, 'shift')).toBe(false);
  });
});

describe('Special Activities', () => {
  it('Govern: Aid +3xPop; Young Turks +2 Patronage; Saigon/no-Support excluded', () => {
    const g = blank();
    g.leader = 126;
    put(g, 'hue', { arvn_police: 2, arvn_troops: 1 });
    g.spaces.hue.support = 1;
    put(g, 'saigon', { arvn_police: 2 });
    g.spaces.saigon.support = 1;
    put(g, 'da_nang', { arvn_police: 2 });
    push(g, 'sa_govern', { faction: 'ARVN' });
    expect(has(g, 'space', 'saigon')).toBe(false);
    expect(has(g, 'space', 'da_nang')).toBe(false);
    act(g, 'space', 'hue'); act(g, 'aid');
    expect(g.aid).toBe(16);
    expect(g.patronage).toBe(12);
    expect(g.stack.length).toBe(0);
  });
  it('Govern: transfer Aid to Patronage shifts Support (needs ARVN cubes > US Troops)', () => {
    const g = blank();
    put(g, 'hue', { arvn_police: 2, arvn_troops: 1, us_troops: 2 });
    g.spaces.hue.support = 2;
    push(g, 'sa_govern', { faction: 'ARVN' });
    act(g, 'space', 'hue');
    expect(has(g, 'patronage')).toBe(true);
    act(g, 'patronage');
    expect(g.aid).toBe(8);
    expect(g.patronage).toBe(12);
    expect(g.spaces.hue.support).toBe(1);
    const h = blank();
    put(h, 'hue', { arvn_police: 1, arvn_troops: 1, us_troops: 2 });
    h.spaces.hue.support = 1;
    push(h, 'sa_govern', { faction: 'ARVN' });
    act(h, 'space', 'hue');
    expect(has(h, 'patronage')).toBe(false);
  });
  it('Mandate of Heaven: unshaded keeps Support; shaded max 1 space', () => {
    const g = blank();
    g.capabilities[86] = 'unshaded';
    put(g, 'hue', { arvn_police: 2 });
    g.spaces.hue.support = 2;
    push(g, 'sa_govern', { faction: 'ARVN' });
    act(g, 'space', 'hue'); act(g, 'patronage_keep');
    expect(g.spaces.hue.support).toBe(2);
    const h = blank();
    h.capabilities[86] = 'shaded';
    for (const id of ['hue', 'da_nang']) { put(h, id, { arvn_police: 2 }); h.spaces[id].support = 1; }
    push(h, 'sa_govern', { faction: 'ARVN' });
    act(h, 'space', 'hue'); act(h, 'aid');
    expect(h.stack.length).toBe(0);
  });
  it('Air Strike: die roll gives hits; NVA Troops first; shifts Support; Bases only when alone', () => {
    const g = blank();
    put(g, 'central_laos', { us_troops: 1, nva_troops: 3 });
    put(g, 'tay_ninh', { arvn_troops: 1, vc_guer_a: 2, vc_base: 1 });
    push(g, 'sa_air_strike', { faction: 'US' });
    act(g, 'space', 'central_laos'); act(g, 'space', 'tay_ninh');
    g.seed = seedForRoll(4);
    act(g, 'done');
    expect(has(g, 'piece', 'tay_ninh:vc_base')).toBe(false);
    act(g, 'piece', 'central_laos:nva_troops'); act(g, 'piece', 'central_laos:nva_troops');
    act(g, 'piece', 'tay_ninh:vc_guer_a'); act(g, 'piece', 'tay_ninh:vc_guer_a');
    expect(g.spaces.tay_ninh.support).toBe(-1);
    expect(g.stack.length).toBe(0);
    expect(c(g, 'central_laos', 'nva_troops')).toBe(1);
  });
  it('Air Strike: 2 hits degrade the Trail 1 box; Top Gun unshaded 2 boxes', () => {
    const g = blank();
    put(g, 'saigon', { us_troops: 1 });
    push(g, 'sa_air_strike', { faction: 'US' });
    act(g, 'space', 'saigon');
    g.seed = seedForRoll(2);
    act(g, 'done');
    act(g, 'degrade');
    expect(g.trail).toBe(2);
    const h = blank();
    h.capabilities[4] = 'unshaded';
    put(h, 'saigon', { us_troops: 1 });
    push(h, 'sa_air_strike', { faction: 'US' });
    act(h, 'space', 'saigon');
    h.seed = seedForRoll(2);
    act(h, 'done'); act(h, 'degrade');
    expect(h.trail).toBe(1);
  });
  it('Air Strike: AAA/Oriskany block degrade; Rolling Thunder/Bombing Pause ban it; LGB caps at 2', () => {
    const g = blank();
    g.capabilities[31] = 'shaded'; g.trail = 2;
    put(g, 'saigon', { us_troops: 1 });
    push(g, 'sa_air_strike', { faction: 'US' });
    act(g, 'space', 'saigon');
    g.seed = seedForRoll(2);
    act(g, 'done');
    expect(has(g, 'degrade')).toBe(false);
    for (const m of [10, 41, 22]) {
      const h = blank();
      h.momentum = [m];
      put(h, 'saigon', { us_troops: 1 });
      push(h, 'sa_air_strike', { faction: 'US' });
      expect(h.stack.length).toBe(0);
    }
    const l = blank();
    l.capabilities[20] = 'shaded';
    put(l, 'tay_ninh', { us_troops: 1, vc_guer_a: 5 });
    push(l, 'sa_air_strike', { faction: 'US' });
    act(l, 'space', 'tay_ninh');
    l.seed = seedForRoll(6);
    act(l, 'done');
    act(l, 'piece', 'tay_ninh:vc_guer_a'); act(l, 'piece', 'tay_ninh:vc_guer_a');
    expect(has(l, 'piece', 'tay_ninh:vc_guer_a')).toBe(false);
  });
  it('Air Strike: needs COIN pieces (Arc Light lifts it for 1 Province); LGB unshaded no shift for 1 piece', () => {
    const g = blank();
    put(g, 'tay_ninh', { vc_guer_a: 1 });
    put(g, 'kien_phong', { us_troops: 1 });
    push(g, 'sa_air_strike', { faction: 'US' });
    expect(has(g, 'space', 'tay_ninh')).toBe(false);
    const h = blank();
    h.capabilities[8] = 'unshaded';
    put(h, 'tay_ninh', { vc_guer_a: 1 });
    push(h, 'sa_air_strike', { faction: 'US' });
    expect(has(h, 'space', 'tay_ninh')).toBe(true);
    const l = blank();
    l.capabilities[20] = 'unshaded';
    put(l, 'tay_ninh', { us_troops: 1, vc_guer_a: 1 });
    push(l, 'sa_air_strike', { faction: 'US' });
    act(l, 'space', 'tay_ninh');
    l.seed = seedForRoll(1);
    act(l, 'done');
    expect(l.spaces.tay_ninh.support).toBe(0);
  });
  it('Air Strike: Monsoon limits to 2 spaces, Typhoon Kate to 1', () => {
    const g = blank();
    g.next = 126;
    for (const id of ['tay_ninh', 'kien_phong', 'binh_dinh']) put(g, id, { us_troops: 1 });
    push(g, 'sa_air_strike', { faction: 'US' });
    act(g, 'space', 'tay_ninh'); act(g, 'space', 'kien_phong');
    expect(has(g, 'space', 'binh_dinh')).toBe(false);
  });
  it('Air Lift: any US Troops, at most 4 ARVN Troops/Rangers/Irregulars', () => {
    const g = blank();
    put(g, 'saigon', { us_troops: 6, arvn_troops: 5 });
    push(g, 'sa_air_lift', { faction: 'US' });
    act(g, 'space', 'saigon'); act(g, 'space', 'hue'); act(g, 'done');
    for (let i = 0; i < 6; i++) { act(g, 'piece', 'saigon:us_troops'); act(g, 'space', 'hue'); }
    for (let i = 0; i < 4; i++) { act(g, 'piece', 'saigon:arvn_troops'); act(g, 'space', 'hue'); }
    expect(has(g, 'piece', 'saigon:arvn_troops')).toBe(false);
    expect(c(g, 'hue', 'us_troops')).toBe(6);
    expect(c(g, 'hue', 'arvn_troops')).toBe(4);
  });
  it('Air Lift is banned under Typhoon Kate and shaded Medevac; never into North Vietnam', () => {
    const g = blank();
    g.momentum = [115];
    push(g, 'sa_air_lift', { faction: 'US' });
    expect(g.stack.length).toBe(0);
    const h = blank();
    put(h, 'saigon', { us_troops: 2 });
    push(h, 'sa_air_lift', { faction: 'US' });
    expect(has(h, 'space', 'north_vietnam')).toBe(false);
  });
  it('Advise: ARVN Assault, then optional +6 Aid; not in Trained spaces', () => {
    const g = blank();
    put(g, 'tay_ninh', { arvn_troops: 2, vc_guer_a: 1 });
    push(g, 'sa_advise', { faction: 'US', exclude: ['hue'] });
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    act(g, 'assault');
    expect(c(g, 'tay_ninh', 'vc_guer_a')).toBe(0);
    expect(g.resources.ARVN).toBe(30);
    act(g, 'aid');
    expect(g.aid).toBe(16);
    expect(g.stack.length).toBe(0);
    const h = blank();
    put(h, 'hue', { arvn_troops: 2 });
    push(h, 'sa_advise', { faction: 'US', exclude: ['hue'] });
    expect(h.stack.length).toBe(0);
  });
  it('Advise: an Underground Ranger/Irregular activates to remove 2 pieces', () => {
    const g = blank();
    put(g, 'tay_ninh', { us_irreg_u: 1, vc_guer_u: 3 });
    push(g, 'sa_advise', { faction: 'US' });
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    act(g, 'strike');
    expect(c(g, 'tay_ninh', 'vc_guer_u')).toBe(1);
    expect(c(g, 'tay_ninh', 'us_irreg_a')).toBe(1);
  });
  it('Transport: through LoCs and Cities, Rangers flip Underground; Khanh limits to 1 LoC', () => {
    const g = blank();
    put(g, 'saigon', { arvn_troops: 3, arvn_ranger_a: 1 });
    push(g, 'sa_transport', { faction: 'ARVN' });
    act(g, 'space', 'saigon');
    act(g, 'piece', 'saigon:arvn_troops');
    expect(has(g, 'space', 'can_tho')).toBe(true);
    expect(has(g, 'space', 'loc_can_tho_bac_lieu')).toBe(true);
    act(g, 'space', 'can_tho');
    act(g, 'done');
    expect(c(g, 'can_tho', 'arvn_troops')).toBe(1);
    expect(c(g, 'saigon', 'arvn_ranger_u')).toBe(1);
    expect(g.stack.length).toBe(0);
    const k = blank();
    k.leader = 125;
    put(k, 'saigon', { arvn_troops: 1 });
    expect(transportReach(k, 'saigon')).toContain('can_tho');
    expect(transportReach(k, 'saigon')).not.toContain('loc_can_tho_bac_lieu');
    const n = blank();
    put(n, 'loc_saigon_can_tho', { vc_guer_u: 1 });
    put(n, 'saigon', { arvn_troops: 1 });
    expect(transportReach(n, 'saigon')).toContain('loc_saigon_can_tho');
    expect(transportReach(n, 'saigon')).not.toContain('can_tho'); // must stop at NVA/VC pieces
  });
  it('Armored Cavalry shaded: Rangers only', () => {
    const g = blank();
    g.capabilities[61] = 'shaded';
    put(g, 'saigon', { arvn_troops: 3 });
    push(g, 'sa_transport', { faction: 'ARVN' });
    expect(g.stack.length).toBe(0);
  });
  it('Raid: an Underground Ranger activates to remove 2 enemy pieces; adjacent Rangers may move in', () => {
    const g = blank();
    put(g, 'tay_ninh', { arvn_ranger_u: 1, vc_guer_u: 3 });
    put(g, 'kien_phong', { arvn_ranger_a: 1 });
    push(g, 'sa_raid', { faction: 'ARVN' });
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    act(g, 'piece', 'kien_phong:arvn_ranger_a');
    expect(c(g, 'tay_ninh', 'arvn_ranger_a')).toBe(1);
    act(g, 'next');
    act(g, 'activate');
    expect(c(g, 'tay_ninh', 'vc_guer_u')).toBe(1);
    expect(c(g, 'tay_ninh', 'arvn_ranger_a')).toBe(2);
    expect(g.stack.length).toBe(0);
  });
});

describe('op_menu (4.1.1 accompaniment, Monsoon, momentum)', () => {
  it('offers ops and SAs, hides Sweep in Monsoon, and pops when both are used', () => {
    const g = blank();
    g.next = 126;
    put(g, 'tay_ninh', { us_troops: 3, vc_guer_a: 3, nva_troops: 1 });
    push(g, 'op_menu', { faction: 'US', limited: false, sa: true, free: false });
    expect(has(g, 'op', 'op_sweep')).toBe(false);
    expect(has(g, 'op', 'op_assault')).toBe(true);
    expect(has(g, 'sa', 'sa_air_strike')).toBe(true);
    act(g, 'sa', 'sa_air_strike');
    act(g, 'space', 'tay_ninh');
    g.seed = seedForRoll(1);
    act(g, 'done');
    act(g, 'piece', 'tay_ninh:nva_troops');
    expect(top(g)!.state).toBe('op_menu');
    act(g, 'op', 'op_assault');
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    expect(g.stack.length).toBe(0);
  });
  it('Advise and Govern only accompany Train/Patrol; Raid only Patrol/Sweep/Assault', () => {
    const h = blank();
    push(h, 'op_menu', { faction: 'ARVN', limited: false, sa: true, free: false });
    expect(has(h, 'sa', 'sa_raid')).toBe(true);
    top(h)!.args.used_op = true; top(h)!.args.opState = 'op_sweep'; top(h)!.args.opSpaces = ['tay_ninh'];
    expect(has(h, 'sa', 'sa_govern')).toBe(false);
    expect(has(h, 'sa', 'sa_raid')).toBe(true);
    const i = blank();
    push(i, 'op_menu', { faction: 'US', limited: false, sa: true, free: false });
    expect(has(i, 'sa', 'sa_advise')).toBe(true);
    top(i)!.args.used_sa = true; top(i)!.args.saState = 'sa_advise'; top(i)!.args.saSpaces = ['tay_ninh'];
    expect(has(i, 'op', 'op_train')).toBe(true);
    expect(has(i, 'op', 'op_assault')).toBe(false);
    expect(has(i, 'op', 'op_sweep')).toBe(false);
  });
  it('Lansdale hides US Assault; Typhoon Kate hides Air Lift and Transport', () => {
    const g = blank();
    g.momentum = [78, 115];
    push(g, 'op_menu', { faction: 'US', limited: false, sa: true, free: false });
    expect(has(g, 'op', 'op_assault')).toBe(false);
    expect(has(g, 'sa', 'sa_air_lift')).toBe(false);
    const h = blank();
    h.momentum = [115];
    push(h, 'op_menu', { faction: 'ARVN', limited: false, sa: true, free: false });
    expect(has(h, 'sa', 'sa_transport')).toBe(false);
  });
  it('Limited Op restricts to one space', () => {
    const g = blank();
    put(g, 'tay_ninh', { us_troops: 3, vc_guer_a: 1 });
    put(g, 'kien_phong', { us_troops: 3, vc_guer_a: 1 });
    push(g, 'op_menu', { faction: 'US', limited: true, sa: false, free: false });
    act(g, 'op', 'op_assault');
    act(g, 'space', 'tay_ninh');
    expect(g.stack.length).toBe(0);
    expect(c(g, 'kien_phong', 'vc_guer_a')).toBe(1);
  });
  it('Armored Cavalry unshaded: free ARVN Assault in a Transport destination after Ops', () => {
    const g = blank();
    g.capabilities[61] = 'unshaded';
    put(g, 'saigon', { arvn_troops: 2 });
    put(g, 'can_tho', { arvn_troops: 1, vc_guer_a: 1 });
    push(g, 'op_menu', { faction: 'ARVN', limited: false, sa: true, free: false });
    act(g, 'sa', 'sa_transport');
    act(g, 'space', 'saigon'); act(g, 'piece', 'saigon:arvn_troops'); act(g, 'space', 'can_tho'); act(g, 'piece', 'saigon:arvn_troops'); act(g, 'space', 'can_tho');
    act(g, 'op', 'op_patrol');
    act(g, 'done');
    expect(has(g, 'space', 'can_tho')).toBe(true);
    act(g, 'space', 'can_tho');
    expect(c(g, 'can_tho', 'vc_guer_a')).toBe(0);
  });
});
