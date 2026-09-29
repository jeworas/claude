// Events 61-90. Same caveat: texts reconstructed from memory, numbers approximate.
// Capabilities: 61, 86 (marker only). Momentum: 72, 78 (unshaded).
import { COIN_KINDS, INS_KINDS, GUER_KINDS, defCard } from './helpers';
import { FACTION_PIECES, flip, count } from '../../core/pieces';
import { MAP, SPACE_IDS } from '../../data/map';
import { aid, cap, freeOp, insBase, insGuer, mom, patronage, pick, placeIn, poolMove, removeUp, resources, run, shift, trail } from './dsl';
import * as W from './wh';

const US_TROOPS = ['us_troops'] as const;
const IRREG = ['us_irreg_u', 'us_irreg_a'] as const;
const NVA_TROOPS = ['nva_troops'] as const;
const VC_K = FACTION_PIECES.VC;
const ids = (...x: string[]) => x;

defCard(61, 'Capability: Armored Cavalry - US/ARVN Sweep helps.', 'Capability: Armored Cavalry - COIN losses.', () => ({ u: [cap()], s: [cap()] }));

defCard(62, 'Remove up to 3 NVA Troops in South Vietnam.', 'Place up to 3 NVA Troops and 2 NVA Guerrillas in South Vietnam.', () => ({
  u: [removeUp([...NVA_TROOPS], 3, { where: W.sv })],
  s: [placeIn('nva_troops', 3, { where: W.and(W.sv, W.prov), by: 'NVA' }), placeIn('nva_guer', 2, { where: W.and(W.sv, W.prov), by: 'NVA' })],
}));

defCard(63, 'Patronage +5. Place up to 3 ARVN Troops in Cities.', 'Patronage -5.', () => ({
  u: [patronage(5), placeIn('arvn_troops', 3, { where: W.city })],
  s: [patronage(-5)],
}));

defCard(64, 'Shift up to 2 Cities one level toward Support.', 'Shift up to 2 Cities one level toward Opposition.', () => ({
  u: [shift(2, 1, { where: W.city })],
  s: [shift(2, -1, { where: W.city })],
}));

defCard(65, 'Aid +4. Up to 2 US Troops from Casualties to Available.', 'Up to 2 US Troops from Available to Out of Play.', () => ({
  u: [aid(4), poolMove('us_troops', 'casualties', 'available', 2)],
  s: [poolMove('us_troops', 'available', 'out_of_play', 2)],
}));

defCard(66, 'Free Air Strike. Trail -1.', 'Trail +1. NVA Resources +3.', () => ({
  u: [freeOp('sa_air_strike', { faction: 'US' }), trail(-1)],
  s: [trail(1), resources('NVA', 3)],
}));

defCard(67, 'Up to 3 US Troops from Out of Play to Available.', 'Remove up to 2 US Troops from the map to Casualties.', () => ({
  u: [poolMove('us_troops', 'out_of_play', 'available', 3)],
  s: [removeUp([...US_TROOPS], 2)],
}));

defCard(68, 'Aid +9.', 'Shift up to 2 spaces one level toward Opposition.', () => ({
  u: [aid(9)],
  s: [shift(2, -1, { where: W.sv })],
}));

defCard(69, 'Patronage -3. Place up to 3 ARVN Troops in Provinces.', 'Patronage +3. Remove up to 2 ARVN Troops.', () => ({
  u: [patronage(-3), placeIn('arvn_troops', 3, { where: W.and(W.sv, W.prov) })],
  s: [patronage(3), removeUp(['arvn_troops'], 2)],
}));

defCard(70, 'Place up to 2 ARVN Police in a Province and shift it one level toward Support.', 'Remove up to 2 Police; shift up to 2 spaces toward Opposition.', () => ({
  u: [placeIn('arvn_police', 2, { where: W.and(W.sv, W.prov) }), shift(1, 1, { where: W.prov })],
  s: [removeUp(['arvn_police'], 2), shift(2, -1, { where: W.sv })],
}));

defCard(71, 'Shift up to 1 space one level toward Support.', 'Shift up to 3 spaces one level toward Opposition. Aid -3.', () => ({
  u: [shift(1, 1, { where: W.sv })],
  s: [shift(3, -1, { where: W.sv }), aid(-3)],
}));

defCard(72, 'Momentum (until Coup): Assaults add Body Count bonuses.', 'Shift up to 2 spaces one level toward Opposition.', () => ({
  u: [mom()],
  s: [shift(2, -1, { where: W.sv })],
}));

defCard(73, 'Up to 2 US Troops from Casualties to Available.', 'Remove up to 3 US Troops from the map Out of Play.', () => ({
  u: [poolMove('us_troops', 'casualties', 'available', 2)],
  s: [removeUp([...US_TROOPS], 3, { dest: 'out_of_play' })],
}));

defCard(74, 'Aid +3.', 'Remove up to 3 US Troops from the map Out of Play. Aid -3.', () => ({
  u: [aid(3)],
  s: [removeUp([...US_TROOPS], 3, { dest: 'out_of_play' }), aid(-3)],
}));

defCard(75, 'Patronage +3. Shift up to 1 space one level toward Support.', 'Shift up to 2 spaces one level toward Opposition. Patronage -3.', () => ({
  u: [patronage(3), shift(1, 1, { where: W.sv })],
  s: [shift(2, -1, { where: W.sv }), patronage(-3)],
}));

defCard(76, 'Shift up to 2 spaces one level toward Support.', 'Patronage -4.', () => ({
  u: [shift(2, 1, { where: W.sv })],
  s: [patronage(-4)],
}));

defCard(77, 'Remove up to 2 insurgent non-Base pieces; Patronage +3.', 'Patronage -3. Remove up to 2 COIN pieces.', () => ({
  u: [removeUp([...FACTION_PIECES.NVA.filter((k) => !k.includes('base') && !k.includes('tunnel')), 'vc_guer_u', 'vc_guer_a'], 2), patronage(3)],
  s: [patronage(-3), removeUp(COIN_KINDS, 2)],
}));

defCard(78, 'Momentum (until Coup): Patronage cannot be lost through Transport.', 'Aid -3.', () => ({
  u: [mom()],
  s: [aid(-3)],
}));

defCard(79, 'Patronage +5. Place up to 2 ARVN Rangers.', 'Patronage -5.', () => ({
  u: [patronage(5), placeIn('arvn_ranger', 2, { where: W.sv })],
  s: [patronage(-5)],
}));

defCard(80, 'Place up to 4 US Troops in South Vietnam, then a free US Assault.', 'Remove up to 3 US Troops from the map to Casualties.', () => ({
  u: [placeIn('us_troops', 4, { where: W.sv }), freeOp('op_assault', { faction: 'US' })],
  s: [removeUp([...US_TROOPS], 3)],
}));

defCard(81, 'Remove up to 2 Guerrillas from spaces with COIN pieces.', 'Remove up to 3 COIN pieces (Bases last) from spaces with insurgents.', () => ({
  u: [removeUp(GUER_KINDS, 2, { where: W.hasCOIN })],
  s: [removeUp(COIN_KINDS, 3, { where: W.hasIns })],
}));

defCard(82, 'Free US Sweep then Assault in Pleiku-Darlac.', 'Place up to 3 NVA Troops in Pleiku-Darlac; remove up to 2 US Troops there.', () => ({
  u: [freeOp('op_sweep', { faction: 'US', extra: { spaces: ['pleiku_darlac'] } }), freeOp('op_assault', { faction: 'US', extra: { spaces: ['pleiku_darlac'] } })],
  s: [placeIn('nva_troops', 3, { where: W.isId('pleiku_darlac'), by: 'NVA' }), removeUp([...US_TROOPS], 2, { where: W.isId('pleiku_darlac') })],
}));

defCard(83, 'Free ARVN Assault in Tay Ninh / Saigon.', 'Place a Tunneled VC Base and 2 Guerrillas in Tay Ninh.', () => ({
  u: [freeOp('op_assault', { faction: 'ARVN', extra: { spaces: ['tay_ninh', 'saigon'] } })],
  s: [placeIn('vc_base', 1, { where: W.isId('tay_ninh'), as: 'vc_tunnel', by: 'VC' }), placeIn('vc_guer', 2, { where: W.isId('tay_ninh'), by: 'VC' })],
}));

defCard(84, 'Remove up to 3 VC Guerrillas in the Mekong Delta.', 'Remove up to 3 ARVN Troops from Provinces.', () => ({
  u: [removeUp(['vc_guer_u', 'vc_guer_a'], 3, { where: W.isId('kien_hoa_vinh_binh', 'kien_phong', 'ba_xuyen', 'kien_giang_an_xuyen') })],
  s: [removeUp(['arvn_troops'], 3, { where: W.prov })],
}));

defCard(85, 'Shift 1 City one level toward Support.', 'Shift up to 2 Cities one level toward Opposition; Terror in Saigon. Aid -3.', () => ({
  u: [shift(1, 1, { where: W.city })],
  s: [shift(2, -1, { where: W.city }), run((g) => { g.spaces['saigon'].terror += 1; }), aid(-3)],
}));

defCard(86, 'Capability: Mandate of Heaven - Govern strengthened.', 'Capability: Mandate of Heaven - Govern weakened.', () => ({ u: [cap()], s: [cap()] }));

defCard(87, 'Shift up to 2 spaces one level toward Support. Aid +3.', 'Shift up to 3 spaces one level toward Opposition.', () => ({
  u: [shift(2, 1, { where: W.sv }), aid(3)],
  s: [shift(3, -1, { where: W.sv })],
}));

defCard(88, 'Up to 3 US Troops from Out of Play to Available.', 'Up to 3 US Troops from Available to Out of Play.', () => ({
  u: [poolMove('us_troops', 'out_of_play', 'available', 3)],
  s: [poolMove('us_troops', 'available', 'out_of_play', 3)],
}));

defCard(89, 'Remove up to 2 NVA/VC Bases (only if no Guerrillas remain in the space).', 'NVA and VC Resources +4 each.', () => ({
  u: [removeUp([...FACTION_PIECES.NVA.filter((k) => k.includes('base') || k.includes('tunnel')), 'vc_base', 'vc_tunnel'], 2)],
  s: [resources('NVA', 4), resources('VC', 4)],
}));

defCard(90, 'NVA Resources -6.', 'Free NVA March then free NVA Attack.', () => ({
  u: [resources('NVA', -6)],
  s: [freeOp('op_march', { faction: 'NVA' }), freeOp('op_attack', { faction: 'NVA' })],
}));

void INS_KINDS; void IRREG; void VC_K; void insBase; void insGuer; void pick; void flip; void count; void MAP; void SPACE_IDS; void ids; void mom;
