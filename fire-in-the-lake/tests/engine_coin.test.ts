import { describe, it, expect } from 'vitest';
import { newGame } from '../src/engine/setup';
import '../src/engine/opmenu';
import '../src/engine/coin_ops';
import { doAction, getView, push, top } from '../src/core/framework';
import { SPACE_IDS } from '../src/data/map';
import type { Game, PieceKind } from '../src/core/types';
import { CARD } from '../src/data/cards';

function blank(): Game {
  const g = newGame('short', [], 11);
  for (const id of SPACE_IDS) { g.spaces[id].pieces = {}; g.spaces[id].support = 0; g.spaces[id].terror = 0; }
  for (const k of Object.keys(g.available) as (keyof Game['available'])[]) g.available[k] = 30;
  g.available.us_troops = 30; g.available.arvn_base = 3; g.available.us_irreg = 6; g.available.arvn_ranger = 6;
  g.stack = [];
  g.resources = { ARVN: 30, NVA: 10, VC: 10 };
  g.econ = 0; g.aid = 10; g.patronage = 10; g.trail = 3;
  g.momentum = []; g.capabilities = {}; g.leader = 128; // Thieu: no special effects
  g.current = 1; g.next = 2;
  return g;
}
function put(g: Game, sp: string, p: Partial<Record<PieceKind, number>>) {
  for (const [k, n] of Object.entries(p)) g.spaces[sp].pieces[k as PieceKind] = n;
}
const c = (g: Game, sp: string, k: PieceKind) => g.spaces[sp].pieces[k] ?? 0;
const act = (g: Game, verb: string, arg?: string | number) => doAction(g, verb, arg);
const has = (g: Game, verb: string, arg?: string | number) => getView(g).actions.some((a) => a.verb === verb && a.arg === arg);

describe('Assault', () => {
  it('US removes Troops, then Active guerrillas; Underground guerrillas protect Bases', () => {
    const g = blank();
    put(g, 'tay_ninh', { us_troops: 4, nva_troops: 1, vc_guer_a: 1, vc_guer_u: 2, vc_base: 1 });
    push(g, 'op_assault', { faction: 'US' });
    act(g, 'space', 'tay_ninh');
    act(g, 'done');
    expect(c(g, 'tay_ninh', 'nva_troops')).toBe(0);
    expect(c(g, 'tay_ninh', 'vc_guer_a')).toBe(0);
    expect(c(g, 'tay_ninh', 'vc_guer_u')).toBe(2);
    expect(c(g, 'tay_ninh', 'vc_base')).toBe(1);
    expect(g.stack.length).toBe(0);
  });
  it('removes the Base once no guerrillas remain, costs ARVN 3 per space', () => {
    const g = blank();
    put(g, 'tay_ninh', { arvn_troops: 4, arvn_police: 2, vc_guer_a: 1, vc_base: 2 });
    push(g, 'op_assault', { faction: 'ARVN' });
    act(g, 'space', 'tay_ninh');
    act(g, 'done');
    // province: Police do not count, 4 Troops / 2 = 2 hits: guerrilla, then one base
    expect(c(g, 'tay_ninh', 'vc_base')).toBe(1);
    expect(g.resources.ARVN).toBe(27);
  });
  it('Highland halves US damage unless there is a US Base', () => {
    const g = blank();
    put(g, 'quang_nam', { us_troops: 3, nva_troops: 3 });
    push(g, 'op_assault', { faction: 'US' });
    act(g, 'space', 'quang_nam'); act(g, 'done');
    expect(c(g, 'quang_nam', 'nva_troops')).toBe(2);
    const h = blank();
    put(h, 'quang_nam', { us_troops: 3, us_base: 1, nva_troops: 3 });
    push(h, 'op_assault', { faction: 'US' });
    act(h, 'space', 'quang_nam'); act(h, 'done');
    expect(c(h, 'quang_nam', 'nva_troops')).toBe(1); // floor(3/2)=1, doubled by the Base
  });
  it('ARVN: Police count in Cities only; Highland is 1 per 3', () => {
    const g = blank();
    put(g, 'hue', { arvn_troops: 1, arvn_police: 3, nva_guer_a: 3 });
    push(g, 'op_assault', { faction: 'ARVN' });
    act(g, 'space', 'hue'); act(g, 'done');
    expect(c(g, 'hue', 'nva_guer_a')).toBe(1); // 4 cubes / 2
    const h = blank();
    put(h, 'quang_nam', { arvn_troops: 5, nva_guer_a: 3 });
    push(h, 'op_assault', { faction: 'ARVN' });
    act(h, 'space', 'quang_nam'); act(h, 'done');
    expect(c(h, 'quang_nam', 'nva_guer_a')).toBe(2); // floor(5/3)=1
  });
  it('US Assault may add an ARVN Assault for 3 ARVN Resources', () => {
    const g = blank();
    put(g, 'tay_ninh', { us_troops: 1, arvn_troops: 2, vc_guer_a: 3 });
    push(g, 'op_assault', { faction: 'US' });
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    act(g, 'space', 'tay_ninh');
    expect(c(g, 'tay_ninh', 'vc_guer_a')).toBe(1);
    expect(g.resources.ARVN).toBe(27);
    expect(g.stack.length).toBe(0);
  });
  it('Abrams shaded limits US Assault to 2 spaces; Abrams unshaded lets a Base go first', () => {
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
  it('Search and Destroy (unshaded) removes an Underground guerrilla', () => {
    const g = blank();
    g.capabilities[28] = 'unshaded';
    put(g, 'tay_ninh', { us_troops: 1, vc_guer_u: 2 });
    push(g, 'op_assault', { faction: 'US' });
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    expect(c(g, 'tay_ninh', 'vc_guer_u')).toBe(1);
  });
  it('Tunneled Base needs a die roll and never disappears in one hit', () => {
    const g = blank();
    put(g, 'tay_ninh', { us_troops: 1, vc_tunnel: 1 });
    push(g, 'op_assault', { faction: 'US' });
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    expect(c(g, 'tay_ninh', 'vc_tunnel') + c(g, 'tay_ninh', 'vc_base')).toBe(1);
  });
  it('lets the player choose between Active guerrilla factions', () => {
    const g = blank();
    put(g, 'tay_ninh', { us_troops: 1, vc_guer_a: 1, nva_guer_a: 1 });
    push(g, 'op_assault', { faction: 'US' });
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    expect(has(g, 'piece', 'tay_ninh:nva_guer_a')).toBe(true);
    act(g, 'piece', 'tay_ninh:nva_guer_a');
    expect(c(g, 'tay_ninh', 'nva_guer_a')).toBe(0);
    expect(c(g, 'tay_ninh', 'vc_guer_a')).toBe(1);
  });
  it('honors free and spaces args', () => {
    const g = blank();
    put(g, 'tay_ninh', { arvn_troops: 2, vc_guer_a: 1 });
    put(g, 'kien_phong', { arvn_troops: 2, vc_guer_a: 1 });
    push(g, 'op_assault', { faction: 'ARVN', free: true, spaces: ['kien_phong'], max: 1 });
    expect(g.stack.length).toBe(0);
    expect(c(g, 'tay_ninh', 'vc_guer_a')).toBe(1);
    expect(g.resources.ARVN).toBe(30);
    expect(c(g, 'kien_phong', 'vc_guer_a')).toBe(0);
  });
});

describe('Sweep', () => {
  it('moves Troops in and activates 1 guerrilla per piece (lowland)', () => {
    const g = blank();
    put(g, 'saigon', { us_troops: 2 });
    put(g, 'tay_ninh', { vc_guer_u: 3 });
    push(g, 'op_sweep', { faction: 'US' });
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    act(g, 'move_all', 'saigon:us_troops');
    expect(c(g, 'tay_ninh', 'us_troops')).toBe(2);
    expect(c(g, 'tay_ninh', 'vc_guer_a')).toBe(2);
    expect(c(g, 'tay_ninh', 'vc_guer_u')).toBe(1);
    expect(g.stack.length).toBe(0);
  });
  it('halves activation in Jungle and counts Irregulars', () => {
    const g = blank();
    put(g, 'quang_duc_long_khanh', { us_troops: 2, us_irreg_u: 2, nva_guer_u: 4 });
    push(g, 'op_sweep', { faction: 'US' });
    act(g, 'space', 'quang_duc_long_khanh'); act(g, 'done');
    expect(c(g, 'quang_duc_long_khanh', 'nva_guer_a')).toBe(2);
  });
  it('is forbidden in Monsoon', () => {
    const g = blank();
    g.next = 126;
    put(g, 'tay_ninh', { us_troops: 3, vc_guer_u: 3 });
    push(g, 'op_sweep', { faction: 'US' });
    expect(g.stack.length).toBe(0);
    expect(c(g, 'tay_ninh', 'vc_guer_u')).toBe(3);
  });
  it('ARVN Sweep costs 3 per space', () => {
    const g = blank();
    put(g, 'tay_ninh', { arvn_troops: 2, vc_guer_u: 3 });
    push(g, 'op_sweep', { faction: 'ARVN' });
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    expect(g.resources.ARVN).toBe(27);
    expect(c(g, 'tay_ninh', 'vc_guer_a')).toBe(2);
  });
});

describe('Patrol', () => {
  it('moves cubes along LoCs, activates guerrillas, then offers a free Assault', () => {
    const g = blank();
    put(g, 'saigon', { us_troops: 3 });
    put(g, 'loc_saigon_can_tho', { vc_guer_u: 2 });
    push(g, 'op_patrol', { faction: 'US' });
    act(g, 'space', 'loc_saigon_can_tho'); act(g, 'done');
    act(g, 'move_all', 'saigon:us_troops');
    expect(c(g, 'loc_saigon_can_tho', 'vc_guer_a')).toBe(2);
    expect(has(g, 'space', 'loc_saigon_can_tho')).toBe(true);
    act(g, 'space', 'loc_saigon_can_tho');
    expect(c(g, 'loc_saigon_can_tho', 'vc_guer_a')).toBe(0);
    expect(g.stack.length).toBe(0);
  });
  it('ARVN pays 3 once', () => {
    const g = blank();
    put(g, 'saigon', { arvn_police: 2 });
    push(g, 'op_patrol', { faction: 'ARVN' });
    act(g, 'space', 'loc_saigon_can_tho'); act(g, 'space', 'loc_saigon_cam_ranh'); act(g, 'done');
    expect(g.resources.ARVN).toBe(27);
  });
});

describe('Train', () => {
  it('ARVN places cubes (max 6), builds a Base, pacifies and pays', () => {
    const g = blank();
    put(g, 'hue', { arvn_troops: 3 });
    g.spaces.saigon.terror = 1;
    push(g, 'op_train', { faction: 'ARVN' });
    act(g, 'space', 'saigon'); act(g, 'space', 'hue'); act(g, 'done');
    expect(g.resources.ARVN).toBe(24);
    // saigon first
    act(g, 'place', 'arvn_police');
    act(g, 'fill', 'arvn_troops');
    expect(c(g, 'saigon', 'arvn_troops') + c(g, 'saigon', 'arvn_police')).toBe(6);
    expect(has(g, 'place', 'arvn_troops')).toBe(false);
    act(g, 'next');
    // hue: replace 3 cubes with a Base
    act(g, 'base', 'arvn_base');
    expect(c(g, 'hue', 'arvn_base')).toBe(1);
    expect(c(g, 'hue', 'arvn_troops')).toBe(0);
    act(g, 'next');
    // pacification
    act(g, 'space', 'saigon');
    act(g, 'terror');
    act(g, 'shift');
    expect(g.spaces.saigon.terror).toBe(0);
    expect(g.spaces.saigon.support).toBe(1);
    expect(g.resources.ARVN).toBe(18);
    expect(g.stack.length).toBe(0);
  });
  it('Ky makes Pacification cost 4; Minh gives +5 Aid on ARVN Train', () => {
    const g = blank();
    g.leader = 127;
    put(g, 'saigon', { us_troops: 2, arvn_police: 2 });
    push(g, 'op_train', { faction: 'US' });
    act(g, 'space', 'saigon'); act(g, 'done');
    act(g, 'next');
    act(g, 'space', 'saigon'); act(g, 'shift');
    expect(g.resources.ARVN).toBe(26);
    const h = blank();
    h.leader = null;
    push(h, 'op_train', { faction: 'ARVN' });
    act(h, 'space', 'saigon'); act(h, 'done');
    expect(h.aid).toBe(15);
  });
  it('US Train places Irregulars and never spends below Total Econ', () => {
    const g = blank();
    g.econ = 29;
    put(g, 'saigon', { us_troops: 2, arvn_police: 2 });
    push(g, 'op_train', { faction: 'US' });
    act(g, 'space', 'saigon'); act(g, 'done');
    act(g, 'fill', 'us_irreg');
    expect(c(g, 'saigon', 'us_irreg_u')).toBe(2);
    expect(has(g, 'place', 'arvn_ranger')).toBe(false); // would cost 3, 30-3 < econ 29
    act(g, 'next');
    act(g, 'space', 'saigon');
    expect(has(g, 'shift')).toBe(false);
  });
});

describe('Momentum', () => {
  it('Blowtorch Komer makes Pacification cost 1 per step', () => {
    const g = blank();
    g.momentum = [16];
    put(g, 'saigon', { us_troops: 2, arvn_police: 2 });
    push(g, 'op_train', { faction: 'US' });
    act(g, 'space', 'saigon'); act(g, 'done'); act(g, 'next');
    act(g, 'space', 'saigon'); act(g, 'shift');
    expect(g.resources.ARVN).toBe(29);
  });
});

describe('Special Activities', () => {
  it('Govern: Aid +3xPop; Young Turks adds Patronage; Saigon and non-Support spaces excluded', () => {
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
  it('Govern: transfers Pop from Aid to Patronage', () => {
    const g = blank();
    put(g, 'hue', { arvn_police: 2, arvn_troops: 1 });
    g.spaces.hue.support = 2;
    push(g, 'sa_govern', { faction: 'ARVN' });
    act(g, 'space', 'hue'); act(g, 'patronage');
    expect(g.aid).toBe(8);
    expect(g.patronage).toBe(12);
  });
  it('Air Strike hits selected spaces and can degrade the Trail', () => {
    const g = blank();
    put(g, 'central_laos', { us_troops: 1, nva_troops: 3 });
    put(g, 'tay_ninh', { arvn_troops: 1, vc_guer_a: 2 });
    push(g, 'sa_air_strike', { faction: 'US' });
    act(g, 'space', 'central_laos'); act(g, 'space', 'tay_ninh'); act(g, 'done');
    for (let i = 0; i < 3; i++) act(g, 'piece', 'central_laos:nva_troops');
    act(g, 'piece', 'tay_ninh:vc_guer_a');
    act(g, 'piece', 'tay_ninh:vc_guer_a');
    expect(g.spaces.tay_ninh.support).toBe(-1); // shifted toward Opposition
    act(g, 'degrade');
    expect(g.trail).toBe(2);
  });
  it('Air Strike removes at most 6 pieces in total', () => {
    const g = blank();
    put(g, 'tay_ninh', { us_troops: 1, vc_guer_a: 8 });
    push(g, 'sa_air_strike', { faction: 'US' });
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    for (let i = 0; i < 6; i++) act(g, 'piece', 'tay_ninh:vc_guer_a');
    expect(c(g, 'tay_ninh', 'vc_guer_a')).toBe(2);
  });
  it('Air Strike needs COIN pieces (unless Arc Light) and never takes Bases before other insurgents', () => {
    const g = blank();
    put(g, 'tay_ninh', { vc_guer_a: 1 });
    put(g, 'kien_phong', { us_troops: 1, vc_guer_u: 1, vc_base: 1 });
    push(g, 'sa_air_strike', { faction: 'US' });
    expect(g.stack.length).toBe(0);
    const h = blank();
    h.capabilities[8] = 'unshaded';
    put(h, 'tay_ninh', { vc_guer_a: 1 });
    push(h, 'sa_air_strike', { faction: 'US' });
    expect(has(h, 'space', 'tay_ninh')).toBe(true);
  });
  it('Air Strike: Monsoon limits to 2 spaces; Bombing Pause forbids', () => {
    const g = blank();
    g.next = 126;
    for (const id of ['tay_ninh', 'kien_phong', 'binh_dinh']) put(g, id, { us_troops: 1, vc_guer_a: 1 });
    push(g, 'sa_air_strike', { faction: 'US' });
    act(g, 'space', 'tay_ninh'); act(g, 'space', 'kien_phong');
    expect(has(g, 'space', 'binh_dinh')).toBe(false);
    const h = blank();
    h.momentum = [41];
    put(h, 'tay_ninh', { us_troops: 1, vc_guer_a: 1 });
    push(h, 'sa_air_strike', { faction: 'US' });
    expect(h.stack.length).toBe(0);
  });
  it('Air Strike does not degrade the Trail under Rolling Thunder', () => {
    const g = blank();
    g.momentum = [10];
    put(g, 'central_laos', { us_troops: 1, nva_troops: 1 });
    push(g, 'sa_air_strike', { faction: 'US' });
    act(g, 'space', 'central_laos'); act(g, 'done'); act(g, 'piece', 'central_laos:nva_troops');
    expect(g.stack.length).toBe(0);
    expect(g.trail).toBe(3);
  });
  it('Air Lift moves pieces between selected spaces', () => {
    const g = blank();
    put(g, 'saigon', { us_troops: 3 });
    push(g, 'sa_air_lift', { faction: 'US' });
    act(g, 'space', 'saigon'); act(g, 'space', 'hue'); act(g, 'done');
    act(g, 'piece', 'saigon:us_troops'); act(g, 'space', 'hue');
    act(g, 'piece', 'saigon:us_troops'); act(g, 'space', 'hue');
    act(g, 'done');
    expect(c(g, 'hue', 'us_troops')).toBe(2);
    expect(c(g, 'saigon', 'us_troops')).toBe(1);
  });
  it('Advise orders a free ARVN Assault', () => {
    const g = blank();
    put(g, 'tay_ninh', { arvn_troops: 2, vc_guer_a: 1 });
    push(g, 'sa_advise', { faction: 'US' });
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    act(g, 'assault');
    expect(c(g, 'tay_ninh', 'vc_guer_a')).toBe(0);
    expect(g.resources.ARVN).toBe(30);
    expect(g.stack.length).toBe(0);
  });
  it('Transport moves up to 6 ARVN Troops along a LoC; Khanh limits routes', () => {
    const g = blank();
    put(g, 'saigon', { arvn_troops: 3 });
    push(g, 'sa_transport', { faction: 'ARVN' });
    act(g, 'space', 'saigon');
    act(g, 'piece', 'saigon:arvn_troops');
    expect(has(g, 'space', 'can_tho')).toBe(true);
    act(g, 'space', 'can_tho');
    expect(c(g, 'can_tho', 'arvn_troops')).toBe(1);
    act(g, 'done');
    expect(g.stack.length).toBe(0);
  });
  it('Raid removes up to 2 enemy pieces and flips Rangers', () => {
    const g = blank();
    put(g, 'tay_ninh', { arvn_ranger_u: 2, vc_guer_u: 2 });
    push(g, 'sa_raid', { faction: 'ARVN' });
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    expect(c(g, 'tay_ninh', 'vc_guer_u')).toBe(0);
    expect(c(g, 'tay_ninh', 'arvn_ranger_a')).toBe(2);
  });
});

describe('op_menu', () => {
  it('offers ops and SAs, hides Sweep in Monsoon, and pops when both are used', () => {
    const g = blank();
    g.next = 126;
    put(g, 'tay_ninh', { us_troops: 3, vc_guer_a: 3, nva_troops: 1 });
    push(g, 'op_menu', { faction: 'US', limited: false, sa: true, free: false });
    expect(has(g, 'op', 'op_sweep')).toBe(false);
    expect(has(g, 'op', 'op_assault')).toBe(true);
    expect(has(g, 'sa', 'sa_air_strike')).toBe(true);
    expect(has(g, 'done')).toBe(false);
    act(g, 'sa', 'sa_air_strike');
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    act(g, 'piece', 'tay_ninh:nva_troops'); act(g, 'piece', 'tay_ninh:vc_guer_a');
    act(g, 'done'); // stop removing
    act(g, 'done'); // decline Trail degrade
    expect(top(g)!.state).toBe('op_menu');
    act(g, 'op', 'op_assault');
    act(g, 'space', 'tay_ninh'); act(g, 'done');
    expect(g.stack.length).toBe(0);
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
});

void CARD;
