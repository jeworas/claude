// Events 91-120, in the canonical Fire in the Lake deck order (titles in src/data/cards.ts).
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

defCard(91, 'Aid +4. Move up to 2 US Troops from Casualties to Available.', 'Move up to 2 US Troops from Available to Out of Play.', () => ({
  u: [aid(4), poolMove('us_troops', 'casualties', 'available', 2)],
  s: [poolMove('us_troops', 'available', 'out_of_play', 2)],
}));

defCard(92, 'Remove up to 3 NVA/VC pieces from coastal spaces (Bases last).', 'Place up to 3 of your Guerrillas in coastal spaces, at most 1 per space.', () => ({
  u: [removeUp(INS_KINDS, 3, { where: W.coastal })],
  s: [placeIn(insGuer, 3, { where: W.coastal, per: 1 })],
}));

defCard(93, 'Aid +3.', 'Aid -6. Move up to 3 US Troops from Available to Out of Play.', () => ({
  u: [aid(3)],
  s: [aid(-6), poolMove('us_troops', 'available', 'out_of_play', 3)],
}));

defCard(94, 'Remove the Tunnel marker from up to 2 NVA/VC Tunneled Bases.', 'Place a Tunnel marker on up to 2 NVA/VC Bases.', () => ({
  u: [pick(2, W.has('nva_tunnel', 'vc_tunnel'), (g, a, id) => { if (!flip(g, id, 'nva_tunnel', 'nva_base')) flip(g, id, 'vc_tunnel', 'vc_base'); }, { label: 'Remove a Tunnel marker' })],
  s: [pick(2, W.has('nva_base', 'vc_base'), (g, a, id) => { if (!flip(g, id, 'nva_base', 'nva_tunnel')) flip(g, id, 'vc_base', 'vc_tunnel'); }, { label: 'Place a Tunnel marker' })],
}));

defCard(95, 'Place up to 4 US Troops in South Vietnam, then free US Assault.', 'Remove up to 3 US Troops from the map to Casualties.', () => ({
  u: [placeIn('us_troops', 4, { where: W.sv }), freeOp('op_assault', { faction: 'US' })],
  s: [removeUp([...US_TROOPS], 3)],
}));

defCard(96, 'Place up to 3 ARVN Troops in South Vietnam Cities/Provinces, then free ARVN Sweep in up to 2 spaces.', 'Remove up to 3 ARVN Troops from the map.', () => ({
  u: [placeIn('arvn_troops', 3, { where: W.and(W.sv, W.notLoc) }), freeOp('op_sweep', { faction: 'ARVN', extra: { max: 2 } })],
  s: [removeUp(['arvn_troops'], 3)],
}));

defCard(97, 'Shift up to 1 City 1 level toward Active Support.', 'Shift up to 2 Cities 1 level toward Active Opposition. Add 1 Terror to Saigon. Aid -3.', () => ({
  u: [shift(1, 1, { where: W.city })],
  s: [shift(2, -1, { where: W.city }), run((g) => { g.spaces['saigon'].terror += 1; }), aid(-3)],
}));

defCard(98, 'Remove up to 3 VC Guerrillas from South Vietnam Provinces.', 'Remove up to 2 US Troops from South Vietnam to Casualties.', () => ({
  u: [removeUp(['vc_guer_u', 'vc_guer_a'], 3, { where: W.and(W.sv, W.prov) })],
  s: [removeUp([...US_TROOPS], 2, { where: W.sv, dest: 'casualties' })],
}));

defCard(99, 'Free US Sweep, then free US Assault, in Binh Dinh.', 'Place up to 2 of your Guerrillas in Binh Dinh, then remove up to 2 US Troops there.', () => ({
  u: [freeOp('op_sweep', { faction: 'US', extra: { spaces: ['binh_dinh'] } }), freeOp('op_assault', { faction: 'US', extra: { spaces: ['binh_dinh'] } })],
  s: [placeIn(insGuer, 2, { where: W.isId('binh_dinh') }), removeUp([...US_TROOPS], 2, { where: W.isId('binh_dinh'), dest: 'casualties' })],
}));

defCard(100, 'Free ARVN Sweep, then free ARVN Assault, in the Mekong Delta (Kien Hoa-Vinh Binh, Kien Phong, Ba Xuyen, Kien Giang-An Xuyen, Can Tho).', 'Place up to 3 VC Guerrillas in the Mekong Delta spaces listed on the unshaded side.', () => {
  const delta = ids('kien_hoa_vinh_binh', 'kien_phong', 'ba_xuyen', 'kien_giang_an_xuyen', 'can_tho');
  return {
    u: [freeOp('op_sweep', { faction: 'ARVN', extra: { spaces: delta } }), freeOp('op_assault', { faction: 'ARVN', extra: { spaces: delta } })],
    s: [placeIn('vc_guer', 3, { where: W.isId(...delta) })],
  };
});

defCard(101, 'Capability: Booby Traps are neutralised - no extra COIN losses.', 'Capability: Booby Traps - when COIN Sweeps or Assaults a space with Underground Guerrillas, roll a die; on 1-3 remove 1 COIN cube there.', () => ({ u: [cap()], s: [cap()] }));

defCard(102, 'Free ARVN Assault in Tay Ninh and Saigon.', 'Place 1 Tunneled VC Base and up to 2 VC Guerrillas in Tay Ninh.', () => ({
  u: [freeOp('op_assault', { faction: 'ARVN', extra: { spaces: ['tay_ninh', 'saigon'] } })],
  s: [placeIn('vc_base', 1, { where: W.isId('tay_ninh'), as: 'vc_tunnel', by: 'VC' }), placeIn('vc_guer', 2, { where: W.isId('tay_ninh'), by: 'VC' })],
}));

defCard(103, 'Aid +3.', 'Remove up to 3 US Troops from the map to Out of Play. Aid -3.', () => ({
  u: [aid(3)],
  s: [removeUp([...US_TROOPS], 3, { dest: 'out_of_play' }), aid(-3)],
}));

defCard(104, 'Capability: Main Force Bns are neutralised - no extra insurgent Attack strength.', 'Capability: Main Force Bns - Guerrilla Attack in a space with 3+ Guerrillas removes 1 extra piece.', () => ({ u: [cap()], s: [cap()] }));

defCard(105, 'Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Support.', 'Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition.', () => ({
  u: [shift(2, 1, { where: W.sv })],
  s: [shift(2, -1, { where: W.sv })],
}));

defCard(106, 'Free US Sweep, then free US Assault, in Tay Ninh and An Loc.', 'Place up to 3 VC Guerrillas in Tay Ninh, An Loc and/or Phuoc Long.', () => ({
  u: [freeOp('op_sweep', { faction: 'US', extra: { spaces: ['tay_ninh', 'an_loc'] } }), freeOp('op_assault', { faction: 'US', extra: { spaces: ['tay_ninh', 'an_loc'] } })],
  s: [placeIn('vc_guer', 3, { where: W.isId('tay_ninh', 'an_loc', 'phuoc_long') })],
}));

defCard(107, 'Patronage +3. Shift up to 1 Cities/Provinces with Population in South Vietnam 1 level toward Active Support.', 'Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition. Patronage -3.', () => ({
  u: [patronage(3), shift(1, 1, { where: W.sv })],
  s: [shift(1, -1, { where: W.sv }), patronage(-3)],
}));

defCard(108, 'Move up to 3 US Troops from Out of Play to Available.', 'Move up to 3 US Troops from Available to Out of Play.', () => ({
  u: [poolMove('us_troops', 'out_of_play', 'available', 3)],
  s: [poolMove('us_troops', 'available', 'out_of_play', 3)],
}));

defCard(109, 'Remove up to 3 VC pieces from Provinces (Bases last).', 'Place up to 3 VC Guerrillas in South Vietnam. VC Resources +3.', () => ({
  u: [removeUp(FACTION_PIECES.VC, 3, { where: W.prov })],
  s: [placeIn('vc_guer', 3, { where: W.sv }), resources('VC', 3)],
}));

defCard(110, 'Remove up to 3 Guerrillas from Provinces.', 'Free NVA or VC Ambush (whichever executes).', () => ({
  u: [removeUp(GUER_KINDS, 3, { where: W.prov })],
  s: [(g, c) => freeOp('sa_ambush', { faction: c.faction === 'NVA' ? 'NVA' : 'VC' })(g, c)],
}));

defCard(111, 'Remove up to 3 Guerrillas from Jungle spaces.', 'Place up to 3 of your Guerrillas in Jungle spaces, at most 1 per space.', () => ({
  u: [removeUp(GUER_KINDS, 3, { where: W.jungle })],
  s: [placeIn(insGuer, 3, { where: W.jungle, per: 1 })],
}));

defCard(112, 'Place up to 2 ARVN Police in South Vietnam Provinces, then shift 1 Province 1 level toward Active Support.', 'Remove up to 2 ARVN Police from the map. Shift up to 1 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition.', () => ({
  u: [placeIn('arvn_police', 2, { where: W.and(W.sv, W.prov) }), shift(1, 1, { where: W.prov })],
  s: [removeUp(['arvn_police'], 2), shift(1, -1, { where: W.sv })],
}));

defCard(113, 'Place up to 4 ARVN Police in South Vietnam Cities/Provinces.', 'Remove up to 4 ARVN Police from the map.', () => ({
  u: [placeIn('arvn_police', 4, { where: W.and(W.sv, W.notLoc) })],
  s: [removeUp(['arvn_police'], 4)],
}));

defCard(114, 'Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Support.', 'Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition.', () => ({
  u: [shift(2, 1, { where: W.sv })],
  s: [shift(2, -1, { where: W.sv })],
}));

defCard(115, 'Momentum (until Coup): Typhoon Kate - no US Air Lift.', 'NVA Resources +3.', () => ({
  u: [mom()],
  s: [resources('NVA', 3)],
}));

defCard(116, 'Capability: Cadres are neutralised - no extra insurgent Terror/Rally effect.', 'Capability: Cadres - VC Rally and Terror may each select 1 additional space.', () => ({ u: [cap()], s: [cap()] }));

defCard(117, 'Patronage +5. Place up to 2 ARVN Rangers in South Vietnam.', 'Patronage -5.', () => ({
  u: [patronage(5), placeIn('arvn_ranger', 2, { where: W.sv })],
  s: [patronage(-5)],
}));

defCard(118, 'NVA Resources -3. Trail -1.', 'NVA Resources +3. VC Resources +3.', () => ({
  u: [resources('NVA', -3), trail(-1)],
  s: [resources('NVA', 3), resources('VC', 3)],
}));

defCard(119, 'Shift up to 1 Cities/Provinces with Population in South Vietnam 1 level toward Active Support.', 'Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition. Aid -3.', () => ({
  u: [shift(1, 1, { where: W.sv })],
  s: [shift(2, -1, { where: W.sv }), aid(-3)],
}));

defCard(120, 'Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Support.', 'VC Resources +3. Shift up to 1 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition.', () => ({
  u: [shift(2, 1, { where: W.sv })],
  s: [resources('VC', 3), shift(1, -1, { where: W.sv })],
}));

void [COIN_KINDS, INS_KINDS, GUER_KINDS, count, flip, insBase, mom, patronage, pick, run, stayEligible, RANGERS, VC_K, VC_G, NVA_K, NVA_TROOPS, usDest, ids, laosIds, highlandProvs, IRREG, US_TROOPS, cap, poolMove, trail, resources, shift, aid];
