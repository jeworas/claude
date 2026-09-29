// Events 1-30, in the canonical Fire in the Lake deck order (titles in src/data/cards.ts).
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

defCard(1, 'Free US Air Strike. Then move up to 3 US Troops from Casualties to Available.',
  'Aid -6. Remove up to 3 US Troops from the map to Out of Play.', () => ({
    u: [freeOp('sa_air_strike', { faction: 'US' }), poolMove('us_troops', 'casualties', 'available', 3)],
    s: [aid(-6), removeUp([...US_TROOPS], 3, { dest: 'out_of_play' })],
  }));

defCard(2, 'Aid +6. Place up to 3 US Irregulars in Provinces, in any distribution.', 'Aid -6. Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition.', () => ({
  u: [aid(6), placeIn('us_irreg', 3, { where: W.prov })],
  s: [aid(-6), shift(2, -1, { where: W.sv })],
}));

defCard(3, 'NVA Resources -6.', 'NVA Resources +6. Trail +1.', () => ({
  u: [resources('NVA', -6)],
  s: [resources('NVA', 6), trail(1)],
}));

defCard(4, 'Capability: US Air Strike may degrade the Trail by up to 2 instead of 1.',
  'Capability: US Air Strike degrades the Trail only on a die roll of 4-6.', () => ({ u: [cap()], s: [cap()] }));

defCard(5, 'Free US Air Strike.', 'Momentum (until Coup): Wild Weasels - Air Strike may not degrade the Trail.', () => ({
  u: [freeOp('sa_air_strike', { faction: 'US' })],
  s: [mom()],
}));

defCard(6, 'Free US Air Strike.', 'Remove up to 2 US Troops from the map to Casualties.', () => ({
  u: [freeOp('sa_air_strike', { faction: 'US' })],
  s: [removeUp([...US_TROOPS], 2, { dest: usDest })],
}));

defCard(7, 'Momentum (until Coup): ADSID - each time the Trail is improved, NVA Resources -6.', 'Trail +1.', () => ({
  u: [mom()],
  s: [trail(1)],
}));

defCard(8, 'Capability: US Air Strike may include 1 space that has no COIN pieces.',
  'Capability: When Air Strike hits 2 or more spaces, shift Support 2 levels toward Opposition (instead of 1) in each.', () => ({ u: [cap()], s: [cap()] }));

defCard(9, 'Move up to 4 US Troops from Casualties to Available.', 'Move up to 3 US Troops from Available to Out of Play.', () => ({
  u: [poolMove('us_troops', 'casualties', 'available', 4)],
  s: [poolMove('us_troops', 'available', 'out_of_play', 3)],
}));

defCard(10, 'Momentum (until Coup): Rolling Thunder - the Trail may not be improved (Rally, Laos/Cambodia) or degraded (Air Strike).', 'NVA Resources +6.', () => ({
  u: [mom()],
  s: [resources('NVA', 6)],
}));

defCard(11, 'Capability: US Assault may also remove one enemy Base per Assault even while other enemy pieces remain in that space.', 'Capability: US Assault may select at most 2 spaces.', () => ({ u: [cap()], s: [cap()] }));

defCard(12, 'Free US Air Strike.', 'Place up to 3 of your Guerrillas in Provinces, at most 1 per Province (NVA or VC, whichever executes).', () => ({
  u: [freeOp('sa_air_strike', { faction: 'US' })],
  s: [placeIn(insGuer, 3, { where: W.prov, per: 1 })],
}));

defCard(13, 'Capability: After a US/ARVN Sweep, the first 2 swept spaces each remove 1 Active enemy piece.', 'Capability: When US Assaults a space, roll a die; on 1-3 remove 1 US Troop from that space.', () => ({ u: [cap()], s: [cap()] }));

defCard(14, 'Capability: In Highland or Jungle, up to 2 spaces per Assault remove 2 additional enemy pieces.', 'Capability: After a Patrol, NVA removes up to 2 of the COIN cubes that moved.', () => ({ u: [cap()], s: [cap()] }));

defCard(15, 'Momentum (until Coup): Medevac - US Troops that would go to Casualties go to Available instead.', 'Remove up to 3 US Troops from the map to Casualties.', () => ({
  u: [mom()],
  s: [removeUp([...US_TROOPS], 3, { dest: usDest })],
}));

defCard(16, 'Momentum (until Coup): Blowtorch Komer - Pacification costs 1 ARVN Resource.', 'Aid -6.', () => ({
  u: [mom()],
  s: [aid(-6)],
}));

defCard(17, 'Momentum (until Coup): Claymores - no Ambush.', 'Place up to 3 of your Guerrillas in COIN-Controlled Cities/Provinces, at most 1 per space.', () => ({
  u: [mom()],
  s: [placeIn(insGuer, 3, { where: W.and(W.coinCtl, W.notLoc), per: 1 })],
}));

defCard(18, 'Capability: US Sweep counts ARVN Police as US Troops.', 'Capability: Terror by insurgents in a space with US Troops and Police shifts Support an extra level.', () => ({ u: [cap()], s: [cap()] }));

defCard(19, 'Capability: Pacification may shift up to 3 levels per Pacify instead of 2.', 'Capability: Pacification may shift only 1 level per Pacify.', () => ({ u: [cap()], s: [cap()] }));

defCard(20, 'Capability: An Air Strike that removes exactly 1 piece does not shift Support.', 'Capability: Air Strike may hit at most 2 spaces.', () => ({ u: [cap()], s: [cap()] }));

defCard(21, 'Place up to 4 US Troops from Available in South Vietnam, in any distribution.', 'Remove up to 3 US Troops in South Vietnam to Casualties.', () => ({
  u: [placeIn('us_troops', 4, { where: W.sv })],
  s: [removeUp([...US_TROOPS], 3, { where: W.sv, dest: usDest })],
}));

defCard(22, 'Momentum (until Coup): Da Nang - US Air Lift into or out of Da Nang is free. Place up to 3 US Troops in Da Nang.',
  'Place up to 3 of your Guerrillas in Quang Nam, Da Nang and/or Quang Tin-Quang Ngai.', () => ({
    u: [placeIn('us_troops', 3, { where: W.isId('da_nang') }), mom()],
    s: [placeIn(insGuer, 3, { where: W.isId('quang_nam', 'da_nang', 'quang_tin_quang_ngai') })],
  }));

defCard(23, 'Free US Sweep, then free US Assault, in Tay Ninh, Phuoc Long and The Fishhook.', 'Remove up to 3 US Troops in South Vietnam to Casualties.', () => {
  const sp = { spaces: ['tay_ninh', 'phuoc_long', 'the_fishhook'] };
  return {
    u: [freeOp('op_sweep', { faction: 'US', extra: sp }), freeOp('op_assault', { faction: 'US', extra: sp })],
    s: [removeUp([...US_TROOPS], 3, { where: W.sv, dest: usDest })],
  };
});

defCard(24, 'Free US Sweep, then free US Assault, in up to 3 coastal South Vietnam Provinces.', 'Place 1 of your Bases in a coastal Province containing NVA or VC Guerrillas.', () => {
  const coast = () => SPACE_IDS.filter((id) => MAP[id].type === 'province' && MAP[id].coastal && MAP[id].country === 'south_vietnam');
  return {
    u: [
      freeOp('op_sweep', { faction: 'US', extra: () => ({ spaces: coast(), max: 3 }) }),
      freeOp('op_assault', { faction: 'US', extra: () => ({ spaces: coast(), max: 3 }) }),
    ],
    s: [placeIn(insBase, 1, { where: W.and(W.coastal, W.prov, (g, id) => count(g, id, 'vc_guer_u', 'vc_guer_a', 'nva_guer_u', 'nva_guer_a') > 0) })],
  };
});

defCard(25, 'Free ARVN Sweep, then free ARVN Assault, in up to 3 spaces on or adjacent to the Mekong.', 'Add Sabotage to up to 3 Mekong LoCs.', () => {
  const mk = () => SPACE_IDS.filter((id) => MAP[id].mekong || MAP[id].adjacent.some((a) => MAP[a].mekong));
  return {
    u: [
      freeOp('op_sweep', { faction: 'ARVN', extra: () => ({ spaces: mk(), max: 3 }) }),
      freeOp('op_assault', { faction: 'ARVN', extra: () => ({ spaces: mk(), max: 3 }) }),
    ],
    s: [pick(3, W.and(W.mekong, (g, id) => g.spaces[id].terror === 0), (g, a, id) => { g.spaces[id].terror = 1; }, { label: 'Sabotage a Mekong LoC' })],
  };
});

defCard(26, 'Remove up to 3 Guerrillas in Laos, Cambodia or spaces adjacent to them.', 'Remove up to 3 Irregulars and/or Rangers from the map.', () => ({
  u: [removeUp(GUER_KINDS, 3, { where: (g, id) => W.lc(g, id) || MAP[id].adjacent.some((a) => W.lc(g, a)) })],
  s: [removeUp([...IRREG, 'arvn_ranger_u', 'arvn_ranger_a'], 3)],
}));

defCard(27, 'Remove up to 3 VC pieces from Cities/Provinces in South Vietnam (Bases last).', 'Shift 1 City/Province with Population in South Vietnam 1 level toward Active Opposition.', () => ({
  u: [removeUp(VC_K, 3, { where: W.and(W.sv, W.notLoc) })],
  s: [shift(1, -1, { where: W.sv })],
}));

defCard(28, 'Capability: Once per US Assault, also remove 1 Underground Guerrilla from an assaulted space.', 'Capability: Each space that a US or ARVN Assault hits, if it has Population, shifts 1 level toward Opposition.', () => ({ u: [cap()], s: [cap()] }));

defCard(29, 'Place up to 3 US Irregulars in Highland spaces, at most 1 per space.', 'Remove up to 3 US Irregulars from the map.', () => ({
  u: [placeIn('us_irreg', 3, { where: W.highland, per: 1 })],
  s: [removeUp([...IRREG], 3)],
}));

defCard(30, 'Remove up to 3 NVA/VC pieces from coastal spaces in South Vietnam (Bases last).', 'Place up to 2 of your Guerrillas in coastal spaces, at most 1 per space.', () => ({
  u: [removeUp(INS_KINDS, 3, { where: W.and(W.sv, W.coastal) })],
  s: [placeIn(insGuer, 2, { where: W.coastal, per: 1 })],
}));

void [COIN_KINDS, INS_KINDS, GUER_KINDS, count, flip, insBase, mom, patronage, pick, run, stayEligible, RANGERS, VC_K, VC_G, NVA_K, NVA_TROOPS, usDest, ids, laosIds, highlandProvs, IRREG, US_TROOPS, cap, poolMove, trail, resources, shift, aid];
