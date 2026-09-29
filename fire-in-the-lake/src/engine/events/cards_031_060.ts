// Events 31-60, in the canonical Fire in the Lake deck order (titles in src/data/cards.ts).
// Effects are reconstructed from memory of the printed cards; numbers/wording are approximations.
// Capabilities only record the marker. Momentum is recorded in g.momentum (side in g.tmp.momentum_side).
import { COIN_KINDS, INS_KINDS, GUER_KINDS, defCard } from './helpers';
import { FACTION_PIECES, count, flip } from '../../core/pieces';
import { MAP, SPACE_IDS } from '../../data/map';
import { aid, cap, freeOp, insBase, insGuer, mom, patronage, pick, placeIn, poolMove, removeUp, resources, run, shift, stayEligible, trail } from './dsl';
import * as W from './wh';

const US_TROOPS = ['us_troops'] as const;
const IRREG = ['us_irreg_u', 'us_irreg_a'] as const;
const RANGERS = ['arvn_ranger_u', 'arvn_ranger_a'] as const;
const VC_K = FACTION_PIECES.VC;
const VC_G = ['vc_guer_u', 'vc_guer_a'] as const;
const NVA_K = FACTION_PIECES.NVA;
const NVA_TROOPS = ['nva_troops'] as const;
const usDest = 'casualties' as const;
const ids = (...x: string[]) => x;
const laosIds = ['central_laos', 'southern_laos'];
const highlandProvs = () => SPACE_IDS.filter((id) => MAP[id].type === 'province' && MAP[id].terrain === 'highland' && MAP[id].country === 'south_vietnam');

defCard(31, 'Capability: Air Strike may degrade the Trail regardless of NVA defences (AAA neutralised).',
  'Capability: AAA - Air Strike may cost the US a Troop and removes fewer pieces.', () => ({ u: [cap()], s: [cap()] }));

defCard(32, 'Capability: NVA Bombard removes only 1 Troop.', 'Capability: NVA Bombard removes 2 more Troops.', () => ({ u: [cap()], s: [cap()] }));

defCard(33, 'Capability: Air Strike degrades the Trail on 4-6 only.', 'Capability: MiGs - Air Strike may cost a US Troop.', () => ({ u: [cap()], s: [cap()] }));

defCard(34, 'Capability: SA-2s neutralised.', 'Capability: SA-2s - Air Strike may lose a US Troop on roll 1-3.', () => ({ u: [cap()], s: [cap()] }));

defCard(35, 'Free Air Strike.', 'NVA Resources +6. Trail +1.', () => ({
  u: [freeOp('sa_air_strike', { faction: 'US' })],
  s: [resources('NVA', 6), trail(1)],
}));

defCard(36, 'Free US Assault in one Highland Province.', 'Remove up to 3 US Troops from one Highland Province.', () => ({
  u: [freeOp('op_assault', { faction: 'US', extra: () => ({ spaces: highlandProvs(), max: 1 }) })],
  s: [removeUp([...US_TROOPS], 3, { where: W.and(W.sv, W.highland), dest: 'casualties' })],
}));

defCard(37, 'Remove up to 3 NVA Troops in Quang Tri-Thua Thien / Laos.', 'NVA places 3 Troops in Quang Tri-Thua Thien; remove up to 2 US Troops there.', () => ({
  u: [removeUp([...NVA_TROOPS], 3, { where: W.isId('quang_tri_thua_thien', 'central_laos', 'north_vietnam') })],
  s: [placeIn('nva_troops', 3, { where: W.isId('quang_tri_thua_thien'), by: 'NVA' }), removeUp([...US_TROOPS], 2, { where: W.isId('quang_tri_thua_thien'), dest: 'casualties' })],
}));

defCard(38, 'Momentum (until Coup): NVA Marches into South Vietnam are costly.', 'NVA places 3 Troops in Laos/North Vietnam.', () => ({
  u: [mom()],
  s: [placeIn('nva_troops', 3, { where: (g, id) => W.lc(g, id) || W.nvn(g, id), by: 'NVA' })],
}));

defCard(39, 'Momentum (until Coup): US Air Strikes are strengthened.', 'Trail +1.', () => ({ u: [mom()], s: [trail(1)] }));

defCard(40, 'Up to 3 US Troops from Casualties to Available. NVA Resources -3.', 'Up to 2 US Troops from Available to Out of Play. Aid -3.', () => ({
  u: [poolMove('us_troops', 'casualties', 'available', 3), resources('NVA', -3)],
  s: [poolMove('us_troops', 'available', 'out_of_play', 2), aid(-3)],
}));

defCard(41, 'Trail -1.', 'Momentum (until Coup): no Air Strikes. NVA Resources +3.', () => ({
  u: [trail(-1)],
  s: [mom(), resources('NVA', 3)],
}));

defCard(42, 'NVA Resources -6.', 'NVA Resources +6. Place up to 2 NVA Troops in Laos/Cambodia/North Vietnam.', () => ({
  u: [resources('NVA', -6)],
  s: [resources('NVA', 6), placeIn('nva_troops', 2, { where: (g, id) => W.lc(g, id) || W.nvn(g, id), by: 'NVA' })],
}));

defCard(43, 'Aid +9.', 'NVA and VC Resources +3 each. Aid -3.', () => ({
  u: [aid(6)],
  s: [resources('NVA', 3), resources('VC', 3), aid(-3)],
}));

defCard(44, 'Free US Sweep then Assault in Pleiku-Darlac.', 'NVA places 3 Troops in a Highland/Pleiku space; remove up to 2 US Troops there.', () => ({
  u: [freeOp('op_sweep', { faction: 'US', extra: { spaces: ['pleiku_darlac', 'kontum'] } }), freeOp('op_assault', { faction: 'US', extra: { spaces: ['pleiku_darlac', 'kontum'] } })],
  s: [placeIn('nva_troops', 3, { where: W.and(W.sv, W.highland), by: 'NVA' }), removeUp([...US_TROOPS], 2, { where: W.and(W.sv, W.highland), dest: 'casualties' })],
}));

defCard(45, 'Capability: NVA Attack removes fewer pieces (PT-76 neutralised).', 'Capability: PT-76 - NVA Troop Attack removes 2 more COIN pieces.', () => ({ u: [cap()], s: [cap()] }));

defCard(46, 'Remove up to 3 NVA Troops in Laos/Cambodia.', 'Momentum (until Coup): Trail improvement is free. Trail +1.', () => ({
  u: [mom(), removeUp([...NVA_TROOPS], 3, { where: W.lc })],
  s: [trail(1), resources('NVA', 3)],
}));

defCard(47, 'Remove up to 3 NVA Troops in South Vietnam.', 'Place up to 3 NVA Troops and 2 NVA Guerrillas in South Vietnam.', () => ({
  u: [removeUp([...NVA_TROOPS], 3, { where: W.sv })],
  s: [placeIn('nva_troops', 3, { where: W.and(W.sv, W.prov), by: 'NVA' }), placeIn('nva_guer', 2, { where: W.and(W.sv, W.prov), by: 'NVA' })],
}));

defCard(48, 'Place up to 2 Irregulars in a South Vietnam Highland space, then remove up to 2 insurgent pieces in Highlands.', 'Remove up to 3 Irregulars. Place up to 2 Guerrillas in Highland South Vietnam.', () => ({
  u: [placeIn('us_irreg', 2, { where: W.and(W.sv, W.highland) }), removeUp(INS_KINDS, 2, { where: W.and(W.sv, W.highland) })],
  s: [removeUp([...IRREG], 3), placeIn(insGuer, 2, { where: W.and(W.sv, W.highland) })],
}));

defCard(49, 'NVA Resources -6.', 'NVA Resources +6. Place up to 3 NVA Troops in Laos/North Vietnam/Cambodia.', () => ({
  u: [resources('NVA', -6)],
  s: [resources('NVA', 6), placeIn('nva_troops', 3, { where: (g, id) => W.lc(g, id) || W.nvn(g, id), by: 'NVA' })],
}));

defCard(50, 'Remove up to 2 NVA/VC Bases (only if no Guerrillas remain in the space).', 'NVA and VC Resources +4 each.', () => ({
  u: [removeUp([...FACTION_PIECES.NVA.filter((k) => k.includes('base') || k.includes('tunnel')), 'vc_base', 'vc_tunnel'], 2)],
  s: [resources('NVA', 3), resources('VC', 3)],
}));

defCard(51, 'NVA Resources -6.', 'NVA Resources +6. Place up to 3 NVA Troops in Laos.', () => ({
  u: [resources('NVA', -6)],
  s: [resources('NVA', 6), placeIn('nva_troops', 3, { where: W.laos, by: 'NVA' })],
}));

defCard(52, 'Aid +4. Shift up to 2 spaces one level toward Support.', 'Shift up to 2 spaces one level toward Opposition. Aid -4.', () => ({
  u: [aid(4), shift(2, 1, { where: W.sv })],
  s: [shift(2, -1, { where: W.sv }), aid(-4)],
}));

defCard(53, 'Remove up to 2 Guerrillas from spaces with COIN pieces.', 'Remove up to 3 COIN pieces (Bases last) from spaces with insurgents.', () => ({
  u: [removeUp(GUER_KINDS, 2, { where: W.hasCOIN })],
  s: [removeUp(COIN_KINDS, 3, { where: W.hasIns, dest: 'std' })],
}));

defCard(54, 'Free Air Strike. Remove up to 2 NVA/VC pieces in North Vietnam.', 'Remove up to 2 US Troops from the map. NVA Resources +3.', () => ({
  u: [freeOp('sa_air_strike', { faction: 'US' }), removeUp(INS_KINDS, 2, { where: W.nvn })],
  s: [removeUp([...US_TROOPS], 2), resources('NVA', 3)],
}));

defCard(55, 'Trail -1. Remove up to 3 NVA Troops in Laos.', 'Trail +1. NVA Resources +3.', () => ({
  u: [trail(-1), removeUp([...NVA_TROOPS], 3, { where: W.laos })],
  s: [trail(1), resources('NVA', 3)],
}));

defCard(56, 'NVA Resources -6.', 'Free NVA March then free NVA Attack.', () => ({
  u: [resources('NVA', -6)],
  s: [freeOp('op_march', { faction: 'NVA' }), freeOp('op_attack', { faction: 'NVA' })],
}));

defCard(57, 'Up to 3 US Troops from Out of Play to Available.', 'Up to 3 US Troops from Available to Out of Play. Aid -3.', () => ({
  u: [poolMove('us_troops', 'out_of_play', 'available', 3)],
  s: [poolMove('us_troops', 'available', 'out_of_play', 3), aid(-3)],
}));

defCard(58, 'Remove up to 3 NVA pieces in Laos.', 'Place up to 3 NVA Troops in Laos and 1 NVA Base.', () => ({
  u: [removeUp(FACTION_PIECES.NVA, 3, { where: W.laos })],
  s: [placeIn('nva_troops', 3, { where: W.laos, by: 'NVA' }), placeIn('nva_base', 1, { where: W.laos, by: 'NVA' })],
}));

defCard(59, 'Free US Sweep then Assault in Pleiku-Darlac.', 'Place up to 3 NVA Troops in Pleiku-Darlac; remove up to 2 US Troops there.', () => ({
  u: [freeOp('op_sweep', { faction: 'US', extra: { spaces: ['pleiku_darlac'] } }), freeOp('op_assault', { faction: 'US', extra: { spaces: ['pleiku_darlac'] } })],
  s: [placeIn('nva_troops', 3, { where: W.isId('pleiku_darlac'), by: 'NVA' }), removeUp([...US_TROOPS], 2, { where: W.isId('pleiku_darlac') })],
}));

defCard(60, 'Shift 1 space one level toward Support.', 'Shift up to 3 spaces one level toward Opposition. Aid -3.', () => ({
  u: [shift(1, 1, { where: W.sv })],
  s: [shift(2, -1, { where: W.sv }), aid(-3)],
}));

void [COIN_KINDS, INS_KINDS, GUER_KINDS, count, flip, insBase, mom, patronage, pick, run, stayEligible, RANGERS, VC_K, VC_G, NVA_K, NVA_TROOPS, usDest, ids, laosIds, highlandProvs, IRREG, US_TROOPS, cap, poolMove, trail, resources, shift, aid];
