// Events 1-30, implemented from the official playbook text (reference/playbook.txt) and rules section 5.
// Notes on how "instructions to the ops code" are passed: free Ops/SAs are pushed with the usual
// {faction, free:true, spaces?, max?} plus these documented extras: ignoreMonsoon (Sweep/March may occur in Monsoon),
// ignoreTunnel (Assault removes Tunneled Bases as if untunneled), into (Air Lift destination space).
// Capabilities/momentum only record the marker (and, for Top Gun / Wild Weasels / Peace Talks, the cross-card effects).
import { INS_KINDS, defCard, track, changeTrail, setTrailTo, removePieces, K, log, rollDie, flipAll, countIn } from './helpers';
import { FACTION_PIECES, count, remove, removeTo, place, setSupport, shiftSupport } from '../../core/pieces';
import { MAP, SPACE_IDS } from '../../data/map';
import { anyOf, cap, chooseFaction, flipUp, freeOp, makeIneligible, mom, patronage, pick, placeIn, poolMove, removeUp, resources, run, selectInto, shift, stayEligible, trail, xfer, aid } from './dsl';
import * as W from './wh';

const US_POOLS = ['us_troops', 'us_base', 'us_irreg'] as const;
const NVA_POOLS = ['nva_troops', 'nva_guer', 'nva_base'] as const;
const IRREG = ['us_irreg_u', 'us_irreg_a'] as const;
const VC_KINDS = FACTION_PIECES.VC;
const MEK3 = ['loc_can_tho_chau_doc', 'loc_can_tho_bac_lieu', 'loc_can_tho_long_phu'];
const lowlandsTouchingMekong = () => SPACE_IDS.filter((id) => MAP[id].terrain === 'lowland' && MAP[id].adjacent.some((a) => MEK3.includes(a)));

defCard(1, () => ({
  u: [
    freeOp('sa_air_strike', { faction: 'US' }),
    xfer(anyOf([...US_POOLS], 'out_of_play', 'map', { toWhere: W.city }), 6, { label: 'US piece from Out of Play to a City' }),
  ],
  s: [run((g, c) => {
    let n = 0;
    for (const p of US_POOLS) { n += g.casualties[p]; g.out_of_play[p] += g.casualties[p]; g.casualties[p] = 0; }
    log(g, `Congressional regrets: ${n} Casualties go Out of Play.`);
    track(g, 'aid', -n);
  })],
}));

defCard(2, () => ({
  u: [removeUp(INS_KINDS, (g) => { const n = rollDie(g); log(g, `Operation Menu: die roll ${n}.`); return n; }, { where: W.lc, label: 'Remove Insurgent pieces from Cambodia/Laos' })],
  s: [
    xfer(anyOf([...NVA_POOLS], 'available', 'map', { toWhere: W.cambodia }), 2, { by: 'NVA', label: 'NVA places a piece in Cambodia' }),
    xfer([
      { pool: 'us_troops', from: 'map', to: 'out_of_play' },
      { pool: 'us_troops', from: 'available', to: 'out_of_play' },
      { pool: 'us_troops', from: 'casualties', to: 'out_of_play' },
    ], 2, { label: 'US Troops to Out of Play' }),
    aid(-6),
  ],
}));

defCard(3, () => ({
  u: [resources('NVA', -9), run((g) => {
    if (!g.pivotal_played.includes('US')) { g.tmp = g.tmp ?? {}; g.tmp.peace_talks = true; log(g, 'Peace Talks marker placed on Linebacker II (Support+Available > 25).'); }
  })],
  s: [resources('NVA', 9), run((g) => { if (g.trail <= 2) setTrailTo(g, 3); })],
}));

defCard(4, () => ({
  u: [cap(), run((g) => { if (g.capabilities[33] === 'shaded') { delete g.capabilities[33]; log(g, 'Top Gun cancels shaded MiGs.'); } })],
  s: [cap()],
}));

defCard(5, () => ({
  u: [run((g) => {
    if (g.capabilities[34] === 'shaded') { delete g.capabilities[34]; log(g, 'Wild Weasels remove shaded SA-2s.'); }
    else { changeTrail(g, -2); track(g, 'NVA', -9); }
  })],
  s: [mom()],
}));

defCard(6, () => ({
  u: [
    ...selectInto('sp', 1, W.outsideSouth, { label: 'Air Strike space outside the South' }),
    removeUp(INS_KINDS, 6, { air: true, ids: (g, c) => c.d.sp ?? [], label: 'Air Strike: 6 hits' }),
    trail(-2),
  ],
  s: [poolMove('us_troops', 'available', 'casualties', 2), trail(2)],
}));

defCard(7, () => ({
  u: [mom()],
  s: [run((g) => { setTrailTo(g, Math.max(g.trail + 1, 2)); }), resources('ARVN', -9)],
}));

defCard(8, () => ({ u: [cap()], s: [cap()] }));

defCard(9, () => ({
  u: [xfer([
    { pool: 'us_troops', from: 'out_of_play', to: 'available' },
    { pool: 'us_troops', from: 'out_of_play', to: 'map', toWhere: W.sv },
    { pool: 'us_troops', from: 'map', to: 'available' },
  ], 3, { label: 'Move US Troops' })],
  s: [xfer([{ pool: 'us_troops', from: 'map', to: 'out_of_play' }], 3, { label: 'US Troops from the map Out of Play' })],
}));

defCard(10, () => ({
  u: [trail(-2), resources('NVA', -9), makeIneligible('NVA')],
  s: [resources('ARVN', -5), mom()],
}));

defCard(11, () => ({ u: [cap()], s: [cap()] }));

defCard(12, () => ({
  u: [
    run((g) => { for (const id of SPACE_IDS) if (MAP[id].country !== 'south_vietnam') flipAll(g, id, 'active', ['nva_guer_u', 'vc_guer_u']); log(g, 'All Insurgent Guerrillas outside the South flipped Active.'); }),
    removeUp(['nva_base'], 1, { where: W.outsideSouth, label: 'Remove 1 NVA Base' }),
  ],
  s: [
    placeIn('nva_base', 1, { where: (g, id) => W.outsideSouth(g, id) && W.nvaCtl(g, id), label: 'Place an NVA Base at NVA Control outside the South' }),
    flipUp(['nva_guer_a'], 3, 'underground', { label: 'Flip NVA Guerrillas Underground' }),
  ],
}));

defCard(13, () => ({ u: [cap()], s: [cap()] }));
defCard(14, () => ({ u: [cap()], s: [cap()] }));

defCard(15, () => ({
  u: [mom()],
  s: [stayEligible(), mom()],
}));

defCard(16, () => ({
  u: [aid(10), mom()],
  s: [aid(-10), shift(1, -1, { where: (g, id) => count(g, id, 'us_troops', 'arvn_troops') > 0 && count(g, id, 'arvn_police') > 0, label: 'Space with Troops and Police' })],
}));

defCard(17, () => ({
  u: [stayEligible(), mom()],
  s: [
    ...selectInto('sp', 1, (g, id) => W.coinBase(g, id) && count(g, id, 'nva_guer_u', 'vc_guer_u') > 0, { label: 'Space with a COIN Base and an Underground Insurgent' }),
    removeUp(['us_base', 'arvn_base'], 1, { ids: (g, c) => c.d.sp ?? [], label: 'Remove a COIN Base' }),
    removeUp(['nva_guer_u', 'vc_guer_u'], 1, { ids: (g, c) => c.d.sp ?? [], label: 'Remove an Underground Insurgent' }),
  ],
}));

defCard(18, () => ({ u: [cap()], s: [cap()] }));
defCard(19, () => ({ u: [cap()], s: [cap()] }));
defCard(20, () => ({ u: [cap()], s: [cap()] }));

defCard(21, () => ({
  u: [
    ...selectInto('dst', 1, undefined, { label: 'Destination space (or Done for Available)' }),
    xfer([
      { pool: 'us_troops', from: 'map', to: 'map', max: 2, toSpace: (g, c) => c.d.dst?.[0], when: (g, c) => !!c.d.dst?.length },
      { pool: 'us_troops', from: 'map', to: 'available', max: 2, when: (g, c) => !c.d.dst?.length },
      { pool: 'us_troops', from: 'out_of_play', to: 'map', max: 2, toSpace: (g, c) => c.d.dst?.[0], when: (g, c) => !!c.d.dst?.length },
      { pool: 'us_troops', from: 'out_of_play', to: 'available', max: 2, when: (g, c) => !c.d.dst?.length },
    ], 4, { label: 'Move US Troops' }),
  ],
  s: [(g, c) => {
    // Provinces with US Troops, VC and that could be set to Active Opposition must be chosen first.
    const hasVCpiece = (id: string) => count(g, id, 'vc_guer_u', 'vc_guer_a', 'vc_base') > 0;
    const settable = (id: string) => MAP[id].pop > 0 && g.spaces[id].support !== -2;
    const provs = SPACE_IDS.filter((id) => MAP[id].type === 'province' && count(g, id, 'us_troops') > 0);
    const first = provs.filter((id) => hasVCpiece(id) && settable(id));
    c.d.cands = first.length ? first : provs;
    void c;
  }, ...americalPick()],
}));
function americalPick() {
  const st = pick(2, undefined, (g, a, id) => {
    removePieces(g, a, {
      n: 1, kinds: ['vc_guer_u', 'vc_guer_a', 'vc_base'], filter: K((gg, aa, i) => i === id), by: a.by, data: {}, label: 'Remove a VC piece',
      then: K((gg, aa, res) => { if (res.removed > 0 && MAP[id].pop > 0) setSupport(gg, id, -2); }),
    });
  }, { label: 'Province with US Troops', ids: (g, c) => c.d.cands ?? [] });
  return [st];
}

defCard(22, () => ({
  u: [xfer([
    { pool: 'us_troops', from: 'available', to: 'map', toSpace: 'da_nang' },
    { pool: 'us_troops', from: 'out_of_play', to: 'map', toSpace: 'da_nang', max: 3 },
  ], 6, { label: 'Place US Troops in Da Nang' })],
  s: [run((g) => {
    for (const id of W.near('da_nang')) if (g.spaces[id].support > 0) setSupport(g, id, 0);
    log(g, 'Support removed within 1 space of Da Nang.');
  }), mom()],
}));

defCard(23, () => {
  const tunnelSp = (g: any, id: string) => W.tunneled(g, id);
  return {
    u: [
      ...selectInto('sp', 1, tunnelSp, { label: 'Space with a Tunnel' }),
      freeOp('sa_air_lift', { faction: 'US', extra: (g, c) => (c.d.sp?.length ? { into: c.d.sp[0], spaces: undefined } : false) }),
      freeOp('op_sweep', { faction: 'US', extra: (g, c) => (c.d.sp?.length ? { spaces: c.d.sp, max: 1, ignoreMonsoon: true } : false) }),
      freeOp('op_assault', { faction: 'US', extra: (g, c) => (c.d.sp?.length ? { spaces: c.d.sp, max: 1, ignoreTunnel: true } : false) }),
    ],
    s: [
      ...selectInto('sp', 1, tunnelSp, { label: 'Space with a Tunnel' }),
      removeUp(['us_troops'], (g) => { const n = rollDie(g); log(g, `Heavy casualties: die roll ${n}.`); return n; }, { ids: (g, c) => (c.d.sp?.length ? W.near(c.d.sp[0]) : []), label: 'US Troops to Casualties' }),
    ],
  };
});

defCard(24, () => ({
  u: [
    ...selectInto('sp', 1, (g, id) => MAP[id].type === 'province' && MAP[id].coastal && (count(g, id, 'us_troops') > 0 || MAP[id].adjacent.some((a) => count(g, a, 'us_troops') > 0)), { label: 'Coastal Province with or adjacent to US Troops' }),
    run((g, c) => {
      for (const id of c.d.sp ?? []) for (const k of ['vc_guer_u', 'vc_guer_a', 'vc_base'] as const) remove(g, id, k, count(g, id, k));
      log(g, 'All VC removed (Tunneled Bases stay).');
    }),
  ],
  s: [
    pick(3, W.prov, (g, a, id) => { flipAll(g, id, 'underground', ['vc_guer_a']); }, { label: 'Province: flip VC Guerrillas Underground' }),
    stayEligible(),
  ],
}));

defCard(25, () => ({
  u: [
    run((g) => { for (const id of MEK3) for (const k of INS_KINDS) remove(g, id, k, count(g, id, k)); log(g, 'NVA/VC removed from the Mekong LoCs.'); }),
    ...chooseFaction('f', ['US', 'ARVN'], { text: 'US or ARVN Sweeps and Assaults' }),
    freeOp('op_sweep', { faction: (g, c) => c.d.f, extra: () => ({ spaces: lowlandsTouchingMekong(), ignoreMonsoon: true }) }),
    freeOp('op_assault', { faction: (g, c) => c.d.f, extra: () => ({ spaces: lowlandsTouchingMekong() }) }),
  ],
  s: [run((g) => {
    for (const id of MEK3) {
      place(g, id, 'vc_guer', 2);
      if (count(g, id, 'vc_guer_u', 'vc_guer_a') > count(g, id, 'us_troops', 'us_irreg_u', 'us_irreg_a', 'arvn_troops', 'arvn_police', 'arvn_ranger_u', 'arvn_ranger_a')) { g.spaces[id].terror = 1; log(g, `Sabotage in ${MAP[id].name}.`); }
    }
  })],
}));

defCard(26, () => ({
  u: [placeIn('us_irreg', 3, { where: W.lc, label: 'Place Irregulars outside the South' }), freeOp('sa_air_strike', { faction: 'US' })],
  s: [
    removeUp([...IRREG], 3, { dest: 'casualties', label: 'Irregulars to Casualties' }),
    run((g, c) => { for (const id of c.last?.spaces ?? []) if (MAP[id].type !== 'loc' && MAP[id].pop > 0) shiftSupport(g, id, -1); }),
  ],
}));

defCard(27, () => ({
  u: [removeUp(VC_KINDS, 3, { where: W.coinCtl, label: 'Remove VC pieces from COIN Control spaces' })],
  s: [pick(2, (g, id) => id !== 'saigon' && W.coinCtl(g, id) && count(g, id, 'vc_guer_u', 'vc_guer_a', 'vc_base', 'vc_tunnel') > 0, (g, a, id) => {
    g.spaces[id].terror += 1;
    if (MAP[id].pop > 0) setSupport(g, id, -2);
  }, { label: 'COIN-Controlled space with VC (outside Saigon)' })],
}));

defCard(28, () => ({ u: [cap()], s: [cap()] }));

defCard(29, () => ({
  u: [removeUp(INS_KINDS, 4, { where: W.has(...IRREG), label: 'Remove Insurgent pieces from spaces with Irregulars' })],
  s: [
    run((g) => {
      for (const id of SPACE_IDS) {
        const n = countIn(g, id, [...IRREG]);
        if (!n) continue;
        for (const k of IRREG) removeTo(g, id, k, count(g, id, k), 'available');
        place(g, id, 'vc_guer', n);
      }
      log(g, 'Irregulars replaced by VC Guerrillas.');
    }),
    pick(1, (g, id) => W.highland(g, id) && W.neutral(g, id), (g, a, id) => { setSupport(g, id, -2); }, { label: 'Neutral Highland to Active Opposition' }),
    patronage(-3),
  ],
}));

defCard(30, () => ({
  u: [
    ...chooseFaction('f', ['US', 'ARVN'], { text: 'US or ARVN Air Strikes' }),
    pick(3, W.coastal, (g, a, id) => {
      removePieces(g, a, { n: 2, kinds: INS_KINDS, filter: K((gg, aa, i) => i === id), air: true, by: a.by, data: {}, label: 'Fire support: remove up to 2 pieces' });
    }, { by: (g, c) => c.d.f, label: 'Coastal space to strike' }),
    run((g, c) => { for (const id of c.last?.touched ?? []) if (MAP[id].type !== 'loc' && MAP[id].pop > 0) shiftSupport(g, id, -1); }),
  ],
  s: [shift(2, -2, { where: (g, id) => MAP[id].type === 'province' && MAP[id].coastal && count(g, id, 'us_troops') > 0, label: 'Coastal Province with US Troops' })],
}));

void [trail, patronage, setSupport, SPACE_IDS];
