// Events 1-30 (US-flavoured deck section).
// NOTE: the card texts are reconstructed from memory of the printed deck; numbers and fine wording are
// approximations throughout (each defCard() carries the text that is actually implemented). Capability cards
// only record the marker (4, 8, 11, 13, 14, 18, 19, 20, 28); momentum cards record the id in g.momentum and the
// side in g.tmp.momentum_side (5 shaded, 7, 10, 15, 16, 17, 22 unshaded).
import { COIN_KINDS, INS_KINDS, GUER_KINDS, defCard } from './helpers';
import { FACTION_PIECES, count } from '../../core/pieces';
import { MAP, SPACE_IDS } from '../../data/map';
import { aid, cap, freeOp, insBase, insGuer, mom, pick, placeIn, poolMove, removeUp, resources, run, shift, stayEligible, trail } from './dsl';
import * as W from './wh';

const US_TROOPS = ['us_troops'] as const;
const IRREG = ['us_irreg_u', 'us_irreg_a'] as const;
const VC_K = FACTION_PIECES.VC;
const NVA_K = FACTION_PIECES.NVA;
const usDest = 'casualties' as const;

defCard(1, 'Free Air Strike. Then up to 3 US Troops from Casualties to Available.',
  'Aid -6. Remove up to 3 US Troops from the map Out of Play.', () => ({
    u: [freeOp('sa_air_strike', { faction: 'US' }), poolMove('us_troops', 'casualties', 'available', 3)],
    s: [aid(-6), removeUp([...US_TROOPS], 3, { dest: 'out_of_play' })],
  }));

defCard(2, 'Remove up to 3 NVA/VC pieces (Bases last) in Laos and/or Cambodia.',
  'NVA places 1 Base and 2 Guerrillas in Laos/Cambodia.', () => ({
    u: [removeUp(INS_KINDS, 3, { where: W.lc })],
    s: [placeIn('nva_base', 1, { where: W.lc, by: 'NVA' }), placeIn('nva_guer', 2, { where: W.lc, by: 'NVA' })],
  }));

defCard(3, 'NVA Resources -9.', 'NVA Resources +6. Trail +1.', () => ({
  u: [resources('NVA', -9)],
  s: [resources('NVA', 6), trail(1)],
}));

defCard(4, 'Capability: US Air Strike may remove up to 2 more enemy pieces in one space.',
  'Capability: US Air Strike removes at most 1 piece total.', () => ({ u: [cap()], s: [cap()] }));

defCard(5, 'Free Air Strike.', 'Momentum (until Coup): Air Strike may not degrade the Trail.', () => ({
  u: [freeOp('sa_air_strike', { faction: 'US' })],
  s: [mom()],
}));

defCard(6, 'Free Air Strike.', 'Remove up to 2 US Troops from the map to Casualties.', () => ({
  u: [freeOp('sa_air_strike', { faction: 'US' })],
  s: [removeUp([...US_TROOPS], 2, { dest: usDest })],
}));

defCard(7, 'Momentum (until Coup): -6 NVA Resources whenever the Trail is improved.', 'Trail +1.', () => ({
  u: [mom()],
  s: [trail(1)],
}));

defCard(8, 'Capability: Air Strike may also affect spaces adjacent to the chosen one.',
  'Capability: Air Strike limited to a single space.', () => ({ u: [cap()], s: [cap()] }));

defCard(9, 'Up to 4 US Troops from Casualties to Available.', 'Up to 3 US Troops from Available to Out of Play.', () => ({
  u: [poolMove('us_troops', 'casualties', 'available', 4)],
  s: [poolMove('us_troops', 'available', 'out_of_play', 3)],
}));

defCard(10, 'Momentum (until Coup): the Trail may not be improved.', 'NVA Resources +6.', () => ({
  u: [mom()],
  s: [resources('NVA', 6)],
}));

defCard(11, 'Capability: US Assault more effective.', 'Capability: US Assault less effective.', () => ({ u: [cap()], s: [cap()] }));

defCard(12, 'Free Air Strike.', 'Place up to 3 Guerrillas in Provinces (executing insurgent).', () => ({
  u: [freeOp('sa_air_strike', { faction: 'US' })],
  s: [placeIn(insGuer, 3, { where: W.prov, per: 1 })],
}));

defCard(13, 'Capability: US/ARVN Assault helicopter bonus.', 'Capability: US loses a Troop when it Assaults.', () => ({ u: [cap()], s: [cap()] }));
defCard(14, 'Capability: Assault bonus in Lowland.', 'Capability: NVA/VC Ambush bonus.', () => ({ u: [cap()], s: [cap()] }));

defCard(15, 'Momentum (until Coup): US Casualties return to Available.', 'Remove up to 3 US Troops from the map to Casualties.', () => ({
  u: [mom()],
  s: [removeUp([...US_TROOPS], 3, { dest: usDest })],
}));

defCard(16, 'Momentum (until Coup): Pacification is cheaper.', 'Aid -6.', () => ({
  u: [mom()],
  s: [aid(-6)],
}));

defCard(17, 'Momentum (until Coup): insurgent Marches are hindered.', 'Place up to 3 Guerrillas in COIN-controlled spaces (Bases stay).', () => ({
  u: [mom()],
  s: [placeIn(insGuer, 3, { where: W.and(W.coinCtl, W.notLoc), per: 1 })],
}));

defCard(18, 'Capability: Civic Action shifts easier.', 'Capability: Terror can shift Support more.', () => ({ u: [cap()], s: [cap()] }));
defCard(19, 'Capability: Pacification shifts 2 levels.', 'Capability: Pacification shifts only 1 level.', () => ({ u: [cap()], s: [cap()] }));
defCard(20, 'Capability: Air Strike removes without US losses.', 'Capability: Air Strike restricted.', () => ({ u: [cap()], s: [cap()] }));

defCard(21, 'Place up to 4 US Troops from Available in South Vietnam.', 'Remove up to 3 US Troops in South Vietnam to Casualties.', () => ({
  u: [placeIn('us_troops', 4, { where: W.sv })],
  s: [removeUp([...US_TROOPS], 3, { where: W.sv, dest: usDest })],
}));

defCard(22, 'Momentum (until Coup): free Air Lift into/out of Da Nang. Place up to 3 US Troops in Da Nang.',
  'Place up to 3 Guerrillas in Quang Nam / Da Nang / Quang Tin.', () => ({
    u: [placeIn('us_troops', 3, { where: W.isId('da_nang') }), mom()],
    s: [placeIn(insGuer, 3, { where: W.isId('quang_nam', 'da_nang', 'quang_tin_quang_ngai') })],
  }));

defCard(23, 'Free US Sweep then Assault in Tay Ninh, Phuoc Long and The Fishhook.', 'Remove up to 3 US Troops in South Vietnam to Casualties.', () => {
  const sp = { spaces: ['tay_ninh', 'phuoc_long', 'the_fishhook'] };
  return {
    u: [freeOp('op_sweep', { faction: 'US', extra: sp }), freeOp('op_assault', { faction: 'US', extra: sp })],
    s: [removeUp([...US_TROOPS], 3, { where: W.sv, dest: usDest })],
  };
});

defCard(24, 'Free US Sweep and Assault in up to 3 coastal Provinces.', 'Place 1 Base in a coastal Province with your Guerrillas.', () => {
  const coast = () => SPACE_IDS.filter((id) => MAP[id].type === 'province' && MAP[id].coastal && MAP[id].country === 'south_vietnam');
  return {
    u: [
      freeOp('op_sweep', { faction: 'US', extra: () => ({ spaces: coast(), max: 3 }) }),
      freeOp('op_assault', { faction: 'US', extra: () => ({ spaces: coast(), max: 3 }) }),
    ],
    s: [placeIn(insBase, 1, { where: W.and(W.coastal, W.prov, (g, id) => count(g, id, 'vc_guer_u', 'vc_guer_a', 'nva_guer_u', 'nva_guer_a') > 0) })],
  };
});

defCard(25, 'Free ARVN Sweep and Assault along the Mekong.', 'Sabotage up to 3 Mekong LoCs.', () => {
  const mk = () => SPACE_IDS.filter((id) => MAP[id].mekong || MAP[id].adjacent.some((a) => MAP[a].mekong));
  return {
    u: [
      freeOp('op_sweep', { faction: 'ARVN', extra: () => ({ spaces: mk(), max: 3 }) }),
      freeOp('op_assault', { faction: 'ARVN', extra: () => ({ spaces: mk(), max: 3 }) }),
    ],
    s: [pick(3, W.and(W.mekong, (g, id) => g.spaces[id].terror === 0), (g, a, id) => { g.spaces[id].terror = 1; }, { label: 'Sabotage a Mekong LoC' })],
  };
});

defCard(26, 'Remove up to 3 Guerrillas in or adjacent to Laos/Cambodia.', 'Remove up to 3 Irregulars/Rangers from the map.', () => ({
  u: [removeUp(GUER_KINDS, 3, { where: (g, id) => W.lc(g, id) || MAP[id].adjacent.some((a) => W.lc(g, a)) })],
  s: [removeUp([...IRREG, 'arvn_ranger_u', 'arvn_ranger_a'], 3)],
}));

defCard(27, 'Remove up to 3 VC pieces in Cities/Provinces of South Vietnam.', 'Shift up to 2 spaces one level toward Opposition.', () => ({
  u: [removeUp(VC_K, 3, { where: W.and(W.sv, W.notLoc) })],
  s: [shift(2, -1, { where: W.sv })],
}));

defCard(28, 'Capability: Sweep/Assault bonus.', 'Capability: Sweep penalty.', () => ({ u: [cap()], s: [cap()] }));

defCard(29, 'Place up to 3 Irregulars in Highland spaces.', 'Remove up to 3 Irregulars from the map.', () => ({
  u: [placeIn('us_irreg', 3, { where: W.highland, per: 1 })],
  s: [removeUp([...IRREG], 3)],
}));

defCard(30, 'Remove up to 3 NVA/VC pieces in coastal South Vietnam.', 'Place up to 2 Guerrillas in coastal spaces.', () => ({
  u: [removeUp(INS_KINDS, 3, { where: W.and(W.sv, W.coastal) })],
  s: [placeIn(insGuer, 2, { where: W.coastal, per: 1 })],
}));

void COIN_KINDS; void NVA_K; void stayEligible; void run;
