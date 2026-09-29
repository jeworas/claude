// Events 91-120. Same caveat: texts reconstructed from memory, numbers approximate.
// Capabilities: 101, 104, 116 (marker only). Momentum: 115 (unshaded).
import { COIN_KINDS, INS_KINDS, GUER_KINDS, defCard } from './helpers';
import { FACTION_PIECES, count, flip } from '../../core/pieces';
import { MAP } from '../../data/map';
import { aid, cap, freeOp, insBase, insGuer, mom, patronage, pick, placeIn, poolMove, removeUp, resources, run, shift, trail } from './dsl';
import * as W from './wh';

const US_TROOPS = ['us_troops'] as const;
const NVA_TROOPS = ['nva_troops'] as const;
const VC_G = ['vc_guer_u', 'vc_guer_a'] as const;
const ids = (...x: string[]) => x;
const laosIds = ['central_laos', 'southern_laos'];

defCard(91, 'Remove up to 2 NVA/VC pieces in South Vietnam.', 'Place up to 3 NVA Troops in South Vietnam Provinces.', () => ({
  u: [removeUp(INS_KINDS, 2, { where: W.sv })],
  s: [placeIn('nva_troops', 3, { where: W.and(W.sv, W.prov), by: 'NVA' })],
}));

defCard(92, 'Trail -1. Remove up to 3 NVA Troops in Laos.', 'Trail +1. NVA Resources +3.', () => ({
  u: [trail(-1), removeUp([...NVA_TROOPS], 3, { where: W.laos })],
  s: [trail(1), resources('NVA', 3)],
}));

defCard(93, 'Free ARVN Sweep then Assault in Laos.', 'Place up to 3 NVA Troops in Laos; remove up to 3 ARVN Troops in Laos.', () => ({
  u: [freeOp('op_sweep', { faction: 'ARVN', extra: { spaces: laosIds } }), freeOp('op_assault', { faction: 'ARVN', extra: { spaces: laosIds } })],
  s: [placeIn('nva_troops', 3, { where: W.laos, by: 'NVA' }), removeUp(['arvn_troops'], 3, { where: W.laos })],
}));

defCard(94, 'Up to 3 US Troops from Available to Out of Play; place up to 3 ARVN Troops.', 'Up to 3 ARVN Troops removed; Patronage -3.', () => ({
  u: [poolMove('us_troops', 'available', 'out_of_play', 3), placeIn('arvn_troops', 3, { where: W.and(W.sv, W.notLoc) })],
  s: [removeUp(['arvn_troops'], 3), patronage(-3)],
}));

defCard(95, 'Free US Sweep in Quang Tri-Thua Thien / Hue.', 'Remove up to 2 US Troops in Quang Tri-Thua Thien.', () => ({
  u: [freeOp('op_sweep', { faction: 'US', extra: { spaces: ['quang_tri_thua_thien', 'hue'] } })],
  s: [removeUp([...US_TROOPS], 2, { where: W.isId('quang_tri_thua_thien', 'hue') })],
}));

defCard(96, 'Remove up to 2 Guerrillas from spaces with COIN pieces.', 'Free Ambush by the executing insurgent.', () => ({
  u: [removeUp(GUER_KINDS, 2, { where: W.hasCOIN })],
  s: [(g, c) => freeOp('sa_ambush', { faction: c.faction === 'NVA' ? 'NVA' : 'VC' })(g, c)],
}));

defCard(97, 'Up to 2 Tunneled Bases lose their Tunnel marker.', 'Up to 2 insurgent Bases gain a Tunnel marker.', () => ({
  u: [pick(2, W.has('nva_tunnel', 'vc_tunnel'), (g, a, id) => { if (!flip(g, id, 'nva_tunnel', 'nva_base')) flip(g, id, 'vc_tunnel', 'vc_base'); }, { label: 'Remove a Tunnel marker' })],
  s: [pick(2, W.has('nva_base', 'vc_base'), (g, a, id) => { if (!flip(g, id, 'nva_base', 'nva_tunnel')) flip(g, id, 'vc_base', 'vc_tunnel'); }, { label: 'Place a Tunnel marker' })],
}));

defCard(98, 'Remove up to 3 insurgent pieces from coastal spaces.', 'Place up to 3 Guerrillas in coastal spaces.', () => ({
  u: [removeUp(INS_KINDS, 3, { where: W.coastal })],
  s: [placeIn(insGuer, 3, { where: W.coastal, per: 1 })],
}));

defCard(99, 'Remove up to 4 NVA/VC pieces in Laos/Cambodia.', 'Place up to 3 Guerrillas in Laos/Cambodia; Trail +1.', () => ({
  u: [removeUp(INS_KINDS, 4, { where: W.lc })],
  s: [placeIn(insGuer, 3, { where: W.lc }), trail(1)],
}));

defCard(100, 'NVA Resources -6. Trail -1.', 'NVA Resources +6.', () => ({
  u: [resources('NVA', -6), trail(-1)],
  s: [resources('NVA', 6)],
}));

defCard(101, 'Capability: Booby Traps - insurgent Ambush/defence weakened.', 'Capability: Booby Traps - Sweep/Assault losses for COIN.', () => ({ u: [cap()], s: [cap()] }));

defCard(102, 'Remove up to 3 VC Guerrillas.', 'Place up to 4 VC Guerrillas in South Vietnam.', () => ({
  u: [removeUp([...VC_G], 3)],
  s: [placeIn('vc_guer', 4, { where: W.sv })],
}));

defCard(103, 'Remove up to 2 VC Bases.', 'Place up to 3 Guerrillas; VC Resources +3.', () => ({
  u: [removeUp(['vc_base'], 2)],
  s: [placeIn('vc_guer', 3, { where: W.sv }), resources('VC', 3)],
}));

defCard(104, 'Capability: Main Force Bns - Guerrilla concentrations limited.', 'Capability: Main Force Bns - VC Attack/March stronger.', () => ({ u: [cap()], s: [cap()] }));

defCard(105, 'Shift up to 2 spaces one level toward Support.', 'Shift up to 2 spaces one level toward Opposition.', () => ({
  u: [shift(2, 1, { where: W.sv })],
  s: [shift(2, -1, { where: W.sv })],
}));

defCard(106, 'Free US Sweep then Assault in Tay Ninh / An Loc.', 'Place up to 3 VC Guerrillas in Tay Ninh / An Loc / Phuoc Long.', () => ({
  u: [freeOp('op_sweep', { faction: 'US', extra: { spaces: ['tay_ninh', 'an_loc'] } }), freeOp('op_assault', { faction: 'US', extra: { spaces: ['tay_ninh', 'an_loc'] } })],
  s: [placeIn('vc_guer', 3, { where: W.isId('tay_ninh', 'an_loc', 'phuoc_long') })],
}));

defCard(107, 'Remove up to 2 VC Guerrillas.', 'Place up to 3 VC Guerrillas.', () => ({
  u: [removeUp([...VC_G], 2)],
  s: [placeIn('vc_guer', 3, { where: W.sv })],
}));

defCard(108, 'Remove up to 3 VC pieces in Provinces.', 'Place up to 3 VC Guerrillas; VC Resources +3.', () => ({
  u: [removeUp(FACTION_PIECES.VC, 3, { where: W.prov })],
  s: [placeIn('vc_guer', 3, { where: W.sv }), resources('VC', 3)],
}));

defCard(109, 'Remove up to 3 NVA pieces in Laos.', 'Place up to 3 NVA Troops in Laos and 1 NVA Base.', () => ({
  u: [removeUp(FACTION_PIECES.NVA, 3, { where: W.laos })],
  s: [placeIn('nva_troops', 3, { where: W.laos, by: 'NVA' }), placeIn('nva_base', 1, { where: W.laos, by: 'NVA' })],
}));

defCard(110, 'Remove up to 3 Guerrillas in Provinces.', 'Free Ambush by the executing insurgent.', () => ({
  u: [removeUp(GUER_KINDS, 3, { where: W.prov })],
  s: [(g, c) => freeOp('sa_ambush', { faction: c.faction === 'NVA' ? 'NVA' : 'VC' })(g, c)],
}));

defCard(111, 'Shift up to 2 spaces one level toward Support.', 'VC Resources +3. Shift up to 2 spaces one level toward Opposition.', () => ({
  u: [shift(2, 1, { where: W.sv })],
  s: [resources('VC', 3), shift(2, -1, { where: W.sv })],
}));

defCard(112, 'NVA Resources -6.', 'NVA Resources +6. Trail +1.', () => ({
  u: [resources('NVA', -6)],
  s: [resources('NVA', 6), trail(1)],
}));

defCard(113, 'NVA Resources -3. Trail -1.', 'NVA and VC Resources +6 each.', () => ({
  u: [resources('NVA', -3), trail(-1)],
  s: [resources('NVA', 6), resources('VC', 6)],
}));

defCard(114, 'Shift up to 2 spaces one level toward Support.', 'Shift up to 3 spaces one level toward Opposition.', () => ({
  u: [shift(2, 1, { where: W.sv })],
  s: [shift(3, -1, { where: W.sv })],
}));

defCard(115, 'Momentum (until Coup): no NVA/VC Rally or March in Provinces without adjacent friendly pieces (Typhoon Kate).', 'NVA Resources +3.', () => ({
  u: [mom()],
  s: [resources('NVA', 3)],
}));

defCard(116, 'Capability: Cadres - Terror/Agitate limited.', 'Capability: Cadres - VC Rally/Terror stronger.', () => ({ u: [cap()], s: [cap()] }));

defCard(117, 'Remove Sabotage from up to 3 LoCs.', 'Sabotage up to 3 LoCs.', () => ({
  u: [pick(3, (g, id) => MAP[id].type === 'loc' && g.spaces[id].terror > 0, (g, a, id) => { g.spaces[id].terror = 0; }, { label: 'Remove Sabotage' })],
  s: [pick(3, (g, id) => MAP[id].type === 'loc' && g.spaces[id].terror === 0, (g, a, id) => { g.spaces[id].terror = 1; }, { label: 'Sabotage a LoC' })],
}));

defCard(118, 'Remove up to 3 Guerrillas from Jungle spaces.', 'Place up to 3 Guerrillas in Jungle spaces.', () => ({
  u: [removeUp(GUER_KINDS, 3, { where: W.jungle })],
  s: [placeIn(insGuer, 3, { where: W.jungle, per: 1 })],
}));

defCard(119, 'Aid +3.', 'Aid -3. NVA Resources +3.', () => ({
  u: [aid(3)],
  s: [aid(-3), resources('NVA', 3)],
}));

defCard(120, 'Remove up to 2 Tunneled Bases (Tunnel removed, Base stays).', 'Place up to 2 Tunnel markers on insurgent Bases.', () => ({
  u: [pick(2, W.has('nva_tunnel', 'vc_tunnel'), (g, a, id) => { if (!flip(g, id, 'nva_tunnel', 'nva_base')) flip(g, id, 'vc_tunnel', 'vc_base'); }, { label: 'Remove a Tunnel marker' })],
  s: [pick(2, W.has('nva_base', 'vc_base'), (g, a, id) => { if (!flip(g, id, 'nva_base', 'nva_tunnel')) flip(g, id, 'vc_base', 'vc_tunnel'); }, { label: 'Place a Tunnel marker' })],
}));

void COIN_KINDS; void count; void mom; void insBase; void patronage; void run; void ids;
