// Events 61-90, in the canonical Fire in the Lake deck order (titles in src/data/cards.ts).
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

defCard(61, 'Capability: Armored Cavalry - US/ARVN Sweep helps.', 'Capability: Armored Cavalry - COIN losses.', () => ({ u: [cap()], s: [cap()] }));

defCard(62, 'Remove up to 3 NVA/VC pieces in Cambodia.', 'Place up to 3 NVA Troops in Cambodia.', () => ({
  u: [removeUp(INS_KINDS, 3, { where: W.cambodia })],
  s: [placeIn('nva_troops', 3, { where: W.cambodia, by: 'NVA' })],
}));

defCard(63, 'Shift up to 2 spaces one level toward Support.', 'Patronage -4.', () => ({
  u: [shift(2, 1, { where: W.sv })],
  s: [patronage(-4)],
}));

defCard(64, 'Aid +6. Shift up to 2 spaces one level toward Support.', 'Aid -6.', () => ({
  u: [aid(6), shift(2, 1, { where: W.sv })],
  s: [aid(-6)],
}));

defCard(65, 'Place up to 3 ARVN Police in South Vietnam Cities/Provinces.', 'Remove up to 3 ARVN Police.', () => ({
  u: [placeIn('arvn_police', 3, { where: W.and(W.sv, W.notLoc) })],
  s: [removeUp(['arvn_police'], 3)],
}));

defCard(66, 'Aid +6. Shift up to 2 spaces one level toward Support.', 'Aid -6. Shift up to 2 spaces one level toward Opposition.', () => ({
  u: [aid(6), shift(2, 1, { where: W.sv })],
  s: [aid(-6), shift(1, -1, { where: W.sv })],
}));

defCard(67, 'Place up to 3 US Troops in coastal South Vietnam, then a free US Sweep in up to 2 spaces.', 'Remove up to 2 US Troops from coastal spaces.', () => ({
  u: [placeIn('us_troops', 3, { where: W.and(W.sv, W.coastal) }), freeOp('op_sweep', { faction: 'US', extra: { max: 2 } })],
  s: [removeUp([...US_TROOPS], 2, { where: W.coastal })],
}));

defCard(68, 'Place up to 3 Irregulars in Provinces.', 'Remove up to 3 Irregulars.', () => ({
  u: [placeIn('us_irreg', 3, { where: W.prov })],
  s: [removeUp([...IRREG], 3)],
}));

defCard(69, 'Free US Sweep then Assault in up to 2 spaces.', 'Remove up to 2 US Troops from the map.', () => ({
  u: [freeOp('op_sweep', { faction: 'US', extra: { max: 2 } }), freeOp('op_assault', { faction: 'US', extra: { max: 2 } })],
  s: [removeUp([...US_TROOPS], 2)],
}));

defCard(70, 'Place up to 4 ARVN Troops in South Vietnam, then a free ARVN Sweep in up to 2 spaces.', 'Remove up to 3 ARVN Troops.', () => ({
  u: [placeIn('arvn_troops', 4, { where: W.and(W.sv, W.notLoc) }), freeOp('op_sweep', { faction: 'ARVN', extra: { max: 2 } })],
  s: [removeUp(['arvn_troops'], 3)],
}));

defCard(71, 'Free ARVN Assault in An Loc, Tay Ninh and Phuoc Long.', 'Place up to 3 NVA Troops in An Loc / Tay Ninh / Phuoc Long; remove up to 2 ARVN Troops there.', () => ({
  u: [freeOp('op_assault', { faction: 'ARVN', extra: { spaces: ['an_loc', 'tay_ninh', 'phuoc_long'] } })],
  s: [placeIn('nva_troops', 3, { where: W.isId('an_loc', 'tay_ninh', 'phuoc_long'), by: 'NVA' }), removeUp(['arvn_troops'], 2, { where: W.isId('an_loc', 'tay_ninh', 'phuoc_long') })],
}));

defCard(72, 'Momentum (until Coup): Assaults add Body Count bonuses.', 'Shift up to 2 spaces one level toward Opposition.', () => ({
  u: [mom()],
  s: [shift(2, -1, { where: W.sv })],
}));

defCard(73, 'Aid +6. Up to 2 US Troops from Out of Play to Available.', 'Aid -6.', () => ({
  u: [aid(6), poolMove('us_troops', 'out_of_play', 'available', 2)],
  s: [aid(-6)],
}));

defCard(74, 'Free ARVN Sweep then Assault in Laos.', 'Place up to 3 NVA Troops in Laos; remove up to 3 ARVN Troops in Laos.', () => ({
  u: [freeOp('op_sweep', { faction: 'ARVN', extra: { spaces: laosIds } }), freeOp('op_assault', { faction: 'ARVN', extra: { spaces: laosIds } })],
  s: [placeIn('nva_troops', 3, { where: W.laos, by: 'NVA' }), removeUp(['arvn_troops'], 3, { where: W.laos })],
}));

defCard(75, 'Free ARVN Sweep in Cambodia.', 'Place up to 3 Guerrillas in Cambodia.', () => ({
  u: [freeOp('op_sweep', { faction: 'ARVN', extra: { spaces: ids('northeast_cambodia', 'the_fishhook', 'the_parrots_beak', 'sihanoukville') } })],
  s: [placeIn(insGuer, 3, { where: W.cambodia })],
}));

defCard(76, 'Remove up to 2 NVA/VC pieces in South Vietnam.', 'Place up to 3 NVA Troops in South Vietnam Provinces.', () => ({
  u: [removeUp(INS_KINDS, 2, { where: W.sv })],
  s: [placeIn('nva_troops', 3, { where: W.and(W.sv, W.prov), by: 'NVA' })],
}));

defCard(77, 'NVA Resources -6. Trail -1.', 'Trail +1. VC Resources +3.', () => ({
  u: [resources('NVA', -6), trail(-1)],
  s: [trail(1), resources('VC', 3)],
}));

defCard(78, 'Momentum (until Coup): Patronage cannot be lost through Transport.', 'Aid -3.', () => ({
  u: [mom()],
  s: [aid(-3)],
}));

defCard(79, 'Aid +6. Patronage -3.', 'Patronage +6. Aid -3.', () => ({ u: [aid(6), patronage(-3)], s: [patronage(6), aid(-3)] }));

defCard(80, 'Aid +6. Shift up to 2 spaces one level toward Support.', 'Aid -6. Shift up to 2 spaces one level toward Opposition.', () => ({
  u: [aid(6), shift(2, 1, { where: W.sv })],
  s: [aid(-6), shift(1, -1, { where: W.sv })],
}));

defCard(81, 'Place up to 3 Irregulars in Highland spaces.', 'Remove up to 3 Irregulars from the map.', () => ({
  u: [placeIn('us_irreg', 3, { where: W.highland, per: 1 })],
  s: [removeUp([...IRREG], 3)],
}));

defCard(82, 'Aid +9.', 'Shift up to 2 spaces one level toward Opposition.', () => ({
  u: [aid(6)],
  s: [shift(2, -1, { where: W.sv })],
}));

defCard(83, 'Shift up to 3 spaces one level toward Support.', 'Shift up to 3 spaces one level toward Opposition.', () => ({
  u: [shift(2, 1, { where: W.sv })],
  s: [shift(2, -1, { where: W.sv })],
}));

defCard(84, 'Patronage +5. Place up to 3 ARVN Troops in Cities.', 'Patronage -5.', () => ({
  u: [patronage(5), placeIn('arvn_troops', 3, { where: W.city })],
  s: [patronage(-5)],
}));

defCard(85, 'Aid +6. ARVN Resources +6.', 'Aid -6. Patronage -3.', () => ({
  u: [aid(6), resources('ARVN', 6)],
  s: [aid(-6), patronage(-3)],
}));

defCard(86, 'Capability: Mandate of Heaven - Govern strengthened.', 'Capability: Mandate of Heaven - Govern weakened.', () => ({ u: [cap()], s: [cap()] }));

defCard(87, 'Place up to 3 ARVN Rangers in Provinces.', 'Patronage -5. Remove up to 2 ARVN Troops.', () => ({
  u: [placeIn('arvn_ranger', 3, { where: W.and(W.sv, W.prov) })],
  s: [patronage(-5), removeUp(['arvn_troops'], 2)],
}));

defCard(88, 'Patronage -3. Shift 1 space one level toward Support.', 'Patronage +3. Shift 1 space one level toward Opposition.', () => ({
  u: [patronage(-3), shift(1, 1, { where: W.sv })],
  s: [patronage(3), shift(1, -1, { where: W.sv })],
}));

defCard(89, 'Shift up to 2 Cities one level toward Support.', 'Shift up to 2 Cities one level toward Opposition.', () => ({
  u: [shift(2, 1, { where: W.city })],
  s: [shift(2, -1, { where: W.city })],
}));

defCard(90, 'Free Air Strike. Trail -1.', 'Trail +1. NVA Resources +3.', () => ({
  u: [freeOp('sa_air_strike', { faction: 'US' }), trail(-1)],
  s: [trail(1), resources('NVA', 3)],
}));

void [COIN_KINDS, INS_KINDS, GUER_KINDS, count, flip, insBase, mom, patronage, pick, run, stayEligible, RANGERS, VC_K, VC_G, NVA_K, NVA_TROOPS, usDest, ids, laosIds, highlandProvs, IRREG, US_TROOPS, cap, poolMove, trail, resources, shift, aid];
