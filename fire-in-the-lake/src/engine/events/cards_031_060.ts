// Events 31-60. Same caveat as cards_001_030.ts: texts reconstructed from memory, numbers approximate.
// Capabilities (31-34, 45, 61 in the next file) only record the marker. Momentum: 38, 39 unshaded; 41, 46 shaded.
import { COIN_KINDS, INS_KINDS, GUER_KINDS, defCard } from './helpers';
import { FACTION_PIECES, count } from '../../core/pieces';
import { MAP, SPACE_IDS } from '../../data/map';
import { aid, cap, freeOp, insBase, insGuer, mom, patronage, pick, placeIn, poolMove, removeUp, resources, shift, trail } from './dsl';
import * as W from './wh';

const US_TROOPS = ['us_troops'] as const;
const IRREG = ['us_irreg_u', 'us_irreg_a'] as const;
const RANGERS = ['arvn_ranger_u', 'arvn_ranger_a'] as const;
const VC_K = FACTION_PIECES.VC;
const NVA_TROOPS = ['nva_troops'] as const;
const ids = (...x: string[]) => x;
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

defCard(36, 'Free US Sweep then Assault in Pleiku-Darlac.', 'NVA places 3 Troops in a Highland/Pleiku space; remove up to 2 US Troops there.', () => ({
  u: [freeOp('op_sweep', { faction: 'US', extra: { spaces: ['pleiku_darlac', 'kontum'] } }), freeOp('op_assault', { faction: 'US', extra: { spaces: ['pleiku_darlac', 'kontum'] } })],
  s: [placeIn('nva_troops', 3, { where: W.and(W.sv, W.highland), by: 'NVA' }), removeUp([...US_TROOPS], 2, { where: W.and(W.sv, W.highland), dest: 'casualties' })],
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

defCard(40, 'Free US Assault in one Highland Province.', 'Remove up to 3 US Troops from one Highland Province.', () => ({
  u: [freeOp('op_assault', { faction: 'US', extra: () => ({ spaces: highlandProvs(), max: 1 }) })],
  s: [removeUp([...US_TROOPS], 3, { where: W.and(W.sv, W.highland), dest: 'casualties' })],
}));

defCard(41, 'Trail -1.', 'Momentum (until Coup): no Air Strikes. NVA Resources +3.', () => ({
  u: [trail(-1)],
  s: [mom(), resources('NVA', 3)],
}));

defCard(42, 'Remove up to 2 Guerrillas from spaces with COIN pieces.', 'Remove up to 3 COIN pieces (Bases last) from spaces with insurgents.', () => ({
  u: [removeUp(GUER_KINDS, 2, { where: W.hasCOIN })],
  s: [removeUp(COIN_KINDS, 3, { where: W.hasIns, dest: 'std' })],
}));

defCard(43, 'Remove up to 3 NVA Troops/Guerrillas in Cambodia/Laos.', 'Remove up to 3 COIN pieces in or adjacent to Cambodia.', () => ({
  u: [removeUp([...NVA_TROOPS, 'nva_guer_u', 'nva_guer_a'], 3, { where: W.lc })],
  s: [removeUp(COIN_KINDS, 3, { where: (g, id) => W.cambodia(g, id) || MAP[id].adjacent.some((a) => W.cambodia(g, a)) })],
}));

defCard(44, 'Trail -1. NVA Resources -3.', 'Trail +2.', () => ({ u: [trail(-1), resources('NVA', -3)], s: [trail(2)] }));

defCard(45, 'Capability: NVA Attack removes fewer pieces (PT-76 neutralised).', 'Capability: PT-76 - NVA Troop Attack removes 2 more COIN pieces.', () => ({ u: [cap()], s: [cap()] }));

defCard(46, 'Remove up to 3 NVA Troops in Laos/Cambodia.', 'Momentum (until Coup): Trail improvement is free. Trail +1.', () => ({
  u: [removeUp([...NVA_TROOPS], 3, { where: W.lc })],
  s: [mom(), trail(1)],
}));

defCard(47, 'NVA Resources -6.', 'NVA Resources +6. Place up to 3 NVA Troops in Laos/North Vietnam/Cambodia.', () => ({
  u: [resources('NVA', -6)],
  s: [resources('NVA', 6), placeIn('nva_troops', 3, { where: (g, id) => W.lc(g, id) || W.nvn(g, id), by: 'NVA' })],
}));

defCard(48, 'Remove up to 3 VC Guerrillas in one South Vietnam Province.', 'Remove up to 2 US Troops from South Vietnam.', () => ({
  u: [removeUp(['vc_guer_u', 'vc_guer_a'], 3, { where: W.and(W.sv, W.prov) })],
  s: [removeUp([...US_TROOPS], 2, { where: W.sv, dest: 'casualties' })],
}));

defCard(49, 'Free US Sweep then Assault in Binh Dinh.', 'Place 2 Guerrillas in Binh Dinh; remove up to 2 US Troops there.', () => ({
  u: [freeOp('op_sweep', { faction: 'US', extra: { spaces: ['binh_dinh'] } }), freeOp('op_assault', { faction: 'US', extra: { spaces: ['binh_dinh'] } })],
  s: [placeIn(insGuer, 2, { where: W.isId('binh_dinh') }), removeUp([...US_TROOPS], 2, { where: W.isId('binh_dinh'), dest: 'casualties' })],
}));

defCard(50, 'Free ARVN Sweep then Assault in the Mekong Delta.', 'Place up to 3 VC Guerrillas in the Delta; Terror there.', () => {
  const delta = ids('kien_hoa_vinh_binh', 'kien_phong', 'ba_xuyen', 'kien_giang_an_xuyen', 'can_tho');
  return {
    u: [freeOp('op_sweep', { faction: 'ARVN', extra: { spaces: delta } }), freeOp('op_assault', { faction: 'ARVN', extra: { spaces: delta } })],
    s: [placeIn('vc_guer', 3, { where: W.isId(...delta) })],
  };
});

defCard(51, 'Aid +6. Patronage -3.', 'Patronage +6. Aid -3.', () => ({ u: [aid(6), patronage(-3)], s: [patronage(6), aid(-3)] }));

defCard(52, 'Place up to 3 ARVN Rangers in Provinces.', 'Patronage -5. Remove up to 2 ARVN Troops.', () => ({
  u: [placeIn('arvn_ranger', 3, { where: W.and(W.sv, W.prov) })],
  s: [patronage(-5), removeUp(['arvn_troops'], 2)],
}));

defCard(53, 'Place up to 4 ARVN Police in South Vietnam Cities/Provinces.', 'Remove up to 4 ARVN Police.', () => ({
  u: [placeIn('arvn_police', 4, { where: W.and(W.sv, W.notLoc) })],
  s: [removeUp(['arvn_police'], 4)],
}));

defCard(54, 'Place up to 3 Irregulars in Provinces.', 'Remove up to 3 Irregulars.', () => ({
  u: [placeIn('us_irreg', 3, { where: W.prov })],
  s: [removeUp([...IRREG], 3)],
}));

defCard(55, 'Place up to 3 ARVN Rangers in Provinces; then a free ARVN Sweep in one of them.', 'Remove up to 3 ARVN Rangers.', () => ({
  u: [placeIn('arvn_ranger', 3, { where: W.and(W.sv, W.prov) }), freeOp('op_sweep', { faction: 'ARVN', extra: { max: 1 } })],
  s: [removeUp([...RANGERS], 3)],
}));

defCard(56, 'Aid +6. Shift up to 2 spaces one level toward Support.', 'Aid -6. Shift up to 2 spaces one level toward Opposition.', () => ({
  u: [aid(6), shift(2, 1, { where: W.sv })],
  s: [aid(-6), shift(2, -1, { where: W.sv })],
}));

defCard(57, 'Remove up to 3 NVA/VC pieces in Cambodia.', 'Place up to 3 NVA Troops in Cambodia.', () => ({
  u: [removeUp(INS_KINDS, 3, { where: W.cambodia })],
  s: [placeIn('nva_troops', 3, { where: W.cambodia, by: 'NVA' })],
}));

defCard(58, 'Free ARVN Sweep in Cambodia.', 'Place up to 3 Guerrillas in Cambodia.', () => ({
  u: [freeOp('op_sweep', { faction: 'ARVN', extra: { spaces: ids('northeast_cambodia', 'the_fishhook', 'the_parrots_beak', 'sihanoukville') } })],
  s: [placeIn(insGuer, 3, { where: W.cambodia })],
}));

defCard(59, 'Aid +6. Shift up to 2 spaces one level toward Support.', 'Aid -6.', () => ({
  u: [aid(6), shift(2, 1, { where: W.sv })],
  s: [aid(-6)],
}));

defCard(60, 'Shift up to 3 spaces one level toward Support.', 'Shift up to 3 spaces one level toward Opposition.', () => ({
  u: [shift(3, 1, { where: W.sv })],
  s: [shift(3, -1, { where: W.sv })],
}));

void VC_K; void insBase; void pick; void poolMove; void count;
