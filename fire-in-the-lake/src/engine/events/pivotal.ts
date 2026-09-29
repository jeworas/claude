// Pivotal events 121-124. Preconditions and effects are reconstructed from memory / approximated:
//  121 Linebacker II (US): needs Trail >= 3. Trail to 1, NVA Resources -9, free Air Strike, up to 4 US Troops
//      Casualties -> Available.
//  122 Easter Offensive (NVA): needs >= 10 NVA Troops on the map. Up to 6 NVA Troops placed in Laos/Cambodia/NVN,
//      then a free NVA March and a free NVA Attack.
//  123 Vietnamization (ARVN): needs >= 5 US Troops on the map. Up to 6 US Troops to Available, up to 6 ARVN
//      Troops placed in South Vietnam, ARVN Resources +9.
//  124 Tet Offensive (VC): needs >= 12 VC Guerrillas on the map. Free VC Terror, then free VC Attack; VC Resources +6.
import type { Game } from '../../core/types';
import { countOnMap } from '../../core/pieces';
import { freeOp, placeIn, poolMove, removeUp, resources, trail, run } from './dsl';
import { CUR, TEXT } from './helpers';
import type { Step } from './helpers';
import * as W from './wh';

export const PIVOTAL: Record<number, Step[]> = {};

function def(n: number, text: string, steps: Step[]): void {
  CUR.card = n;
  CUR.n = 0;
  TEXT[n] = { u: text, s: '' };
  PIVOTAL[n] = steps;
}

def(121, 'Trail to 1. NVA Resources -9. Free Air Strike. Up to 4 US Troops Casualties to Available.', (() => {
  CUR.card = 121; CUR.n = 0;
  return [run((g) => { g.trail = 1; }), resources('NVA', -9), freeOp('sa_air_strike', { faction: 'US' }), poolMove('us_troops', 'casualties', 'available', 4)];
})());

def(122, 'Place up to 6 NVA Troops in Laos/Cambodia/North Vietnam; free NVA March; free NVA Attack.', (() => {
  CUR.card = 122; CUR.n = 0;
  return [
    placeIn('nva_troops', 6, { where: (g, id) => W.lc(g, id) || W.nvn(g, id), by: 'NVA' }),
    freeOp('op_march', { faction: 'NVA' }),
    freeOp('op_attack', { faction: 'NVA' }),
  ];
})());

def(123, 'Up to 6 US Troops from the map to Available; place up to 6 ARVN Troops; ARVN Resources +9.', (() => {
  CUR.card = 123; CUR.n = 0;
  return [
    removeUp(['us_troops'], 6, { dest: 'available', where: W.sv }),
    placeIn('arvn_troops', 6, { where: W.and(W.sv, W.notLoc), by: 'ARVN' }),
    resources('ARVN', 9),
  ];
})());

def(124, 'Free VC Terror, then free VC Attack. VC Resources +6.', (() => {
  CUR.card = 124; CUR.n = 0;
  return [freeOp('op_terror', { faction: 'VC' }), freeOp('op_attack', { faction: 'VC' }), resources('VC', 6)];
})());

void trail;

export function pivotalPrecondition(g: Game, card: number): boolean {
  switch (card) {
    case 121: return g.trail >= 3;
    case 122: return countOnMap(g, 'nva_troops') >= 10;
    case 123: return countOnMap(g, 'us_troops') >= 5;
    case 124: return countOnMap(g, 'vc_guer_u', 'vc_guer_a') >= 12;
    default: return false;
  }
}
