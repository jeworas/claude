// Pivotal events 121-124. Every one requires 2+ cards in the RVN Leader box plus:
//  121 Linebacker II (US): Support + Available US pieces > 40. Trail to 0, NVA Resources halved, the US may
//      Air Strike anywhere (arg `anywhere: true`, no range/Trail limits).
//  122 Easter Offensive (NVA): more NVA Troops than US Troops on the map. Free NVA March, then free NVA Attack
//      with a +1 bonus (arg `bonus: 1`).
//  123 Vietnamization (ARVN): fewer than 20 US Troops on the map. US Troops on the map go Available (all),
//      then free ARVN Train and Govern.
//  124 Tet Offensive (VC): more than 20 VC Guerrillas in South Vietnam. Free VC Terror in every space with VC
//      Guerrillas, then free VC Attack.
// Details of the printed effects are approximated.
import type { Game } from '../../core/types';
import { count, countOnMap, removeTo, victoryScore } from '../../core/pieces';
import { SPACE_IDS, MAP } from '../../data/map';
import { freeOp, run } from './dsl';
import { CUR, TEXT } from './helpers';
import type { Step } from './helpers';

export const PIVOTAL: Record<number, Step[]> = {};

function def(n: number, text: string, steps: Step[]): void {
  TEXT[n] = { u: text, s: '' };
  PIVOTAL[n] = steps;
}
CUR.card = 121; CUR.n = 0;

def(121, 'Trail to 0. NVA Resources -50%. The US may Air Strike anywhere.', [
  run((g) => { g.trail = 0; g.resources.NVA -= Math.floor(g.resources.NVA / 2); }),
  freeOp('sa_air_strike', { faction: 'US', extra: { anywhere: true } }),
]);

def(122, 'NVA free March, then free Attack with +1 bonus.', [
  freeOp('op_march', { faction: 'NVA' }),
  freeOp('op_attack', { faction: 'NVA', extra: { bonus: 1 } }),
]);

def(123, 'US Troops on the map to Available. Free ARVN Train and Govern.', [
  run((g) => { for (const id of SPACE_IDS) removeTo(g, id, 'us_troops', 99, 'available'); }),
  freeOp('op_train', { faction: 'ARVN' }),
  freeOp('sa_govern', { faction: 'ARVN' }),
]);

def(124, 'Free VC Terror in every space with VC Guerrillas, then free VC Attack.', [
  freeOp('op_terror', { faction: 'VC', extra: (g: Game) => ({ spaces: SPACE_IDS.filter((id) => count(g, id, 'vc_guer_u', 'vc_guer_a') > 0), noFlip: true }) }),
  freeOp('op_attack', { faction: 'VC' }),
]);

export function pivotalPrecondition(g: Game, card: number): boolean {
  if (g.leader_box.length < 2) return false;
  switch (card) {
    case 121: return victoryScore(g, 'US') > 40;
    case 122: return countOnMap(g, 'nva_troops') > countOnMap(g, 'us_troops');
    case 123: return countOnMap(g, 'us_troops') < 20;
    case 124: return SPACE_IDS.filter((id) => MAP[id].country === 'south_vietnam').reduce((n, id) => n + count(g, id, 'vc_guer_u', 'vc_guer_a'), 0) > 20;
    default: return false;
  }
}
