// Events 31-60, implemented from the official playbook text (reference/playbook.txt) and rules section 5.
// See the header of cards_001_030.ts for the extra args passed to free Ops (ignoreMonsoon, ignoreTunnel, into, ...).
// Extras used here: decider (who decides an Air Strike's details), onlyNVA (ARVN Assault removes NVA only),
// fromOutsideSouth (March starts only from spaces outside South Vietnam, cost 0 while Trail >= 1).
import { freeOp as freeOpHelper, COIN_KINDS, INS_KINDS, GUER_KINDS, K, cardTitle, changeTrail, choose, defCard, flipAll, log, removePieces, rollDie, setCapability, track } from './helpers';
import { FACTION_PIECES, count, flip, place, remove, setSupport, countFaction, control } from '../../core/pieces';
import { MAP, SPACE_IDS } from '../../data/map';
import { LIMOPS, aid, anyOf, cap, chooseFaction, eachOf, either, freeOp, ifThen, limOps, makeIneligible, mom, patronage, pick, placeIn, poolMove, removeUp, resources, run, selectInto, stayEligible, trail, xfer } from './dsl';
import * as W from './wh';
import type { Where } from './dsl';

const US_POOLS = ['us_troops', 'us_base', 'us_irreg'] as const;
const ARVN_POOLS = ['arvn_troops', 'arvn_police', 'arvn_ranger', 'arvn_base'] as const;
const NVA_ALL = FACTION_PIECES.NVA;
const NVA_NONBASE_INS: (typeof INS_KINDS)[number][] = ['nva_troops', 'nva_guer_u', 'nva_guer_a', 'vc_guer_u', 'vc_guer_a'];
const SV_HIGHLAND: Where = (g, id) => MAP[id].terrain === 'highland' && MAP[id].country === 'south_vietnam';
const anyNVA: Where = (g, id) => count(g, id, 'nva_troops', 'nva_guer_u', 'nva_guer_a', 'nva_base', 'nva_tunnel') > 0;
const spRef = (g: any, c: any): string[] => c.d.sp ?? [];
const die = (label: string) => (g: any) => { const n = rollDie(g); log(g, `${label}: die roll ${n}.`); return n; };
const US_CAPS = [4, 8, 11, 13, 14, 18, 19, 20, 28];

defCard(31, () => ({ u: [cap()], s: [cap()] }));
defCard(32, () => ({ u: [cap()], s: [cap()] }));
defCard(33, () => ({
  u: [cap()],
  s: [run((g, c) => {
    if (g.capabilities[4] === 'unshaded') { log(g, 'Top Gun (unshaded) blocks shaded MiGs.'); return; }
    setCapability(g, c);
  })],
}));
defCard(34, () => ({ u: [cap()], s: [cap()] }));

defCard(35, () => ({
  u: [trail(-3)],
  s: [trail(1), run((g) => { track(g, 'NVA', 3 * g.trail); })],
}));

defCard(36, () => ({
  u: [
    ...selectInto('sp', 1, SV_HIGHLAND, { label: 'Highland space' }),
    xfer([{ pool: 'us_troops', from: 'map', to: 'map', toSpace: (g, c) => c.d.sp?.[0] }], 4, { label: 'Move US Troops to the Highland' }),
    removeUp(['nva_base', 'nva_tunnel', 'vc_base', 'vc_tunnel'], 1, { tunnels: true, ids: spRef, label: 'Remove an NVA or VC Base (even if Tunneled)' }),
  ],
  s: [
    ...selectInto('sp', 1, (g, id) => SV_HIGHLAND(g, id) && count(g, id, 'nva_base', 'vc_base') > 0, { label: 'Highland with an untunneled NVA/VC Base' }),
    run((g, c) => {
      for (const id of c.d.sp ?? []) {
        if (!flip(g, id, 'nva_base', 'nva_tunnel', 1)) flip(g, id, 'vc_base', 'vc_tunnel', 1);
        remove(g, id, 'us_troops', 3);
        log(g, `Prepared defenses in ${MAP[id].name}.`);
      }
    }),
  ],
}));

defCard(37, () => ({
  u: [
    ...selectInto('sp', 1, (g, id) => count(g, id, 'us_base') > 0 && count(g, id, 'us_troops') > 0, { label: 'US Base with US Troops' }),
    removeUp(['nva_troops'], 10, { ids: (g, c) => (c.d.sp?.length ? W.near(c.d.sp[0]) : []), label: 'Remove NVA Troops within 1 space' }),
  ],
  s: [
    ...selectInto('sp', 1, (g, id) => anyNVA(g, id) && count(g, id, 'us_troops') > 0, { label: 'Space with NVA and US Troops' }),
    removeUp(['us_troops'], 3, { ids: spRef, label: 'US Troops to Casualties' }),
    makeIneligible('US'),
  ],
}));

defCard(38, () => ({
  u: [
    xfer(anyOf(['us_troops', 'us_irreg', 'arvn_troops', 'arvn_police', 'arvn_ranger'], 'map', 'map', { fromWhere: W.lc, toWhere: W.and(W.city, W.coinCtl) }), 99, { label: 'Redeploy COIN forces from Laos/Cambodia to COIN-Controlled Cities' }),
    resources('ARVN', -12),
    mom(),
  ],
  s: [],
}));

defCard(39, () => ({
  u: [
    removeUp(INS_KINDS, 4, { where: W.nvn, label: 'Remove pieces from North Vietnam' }),
    removeUp(INS_KINDS, (g, c) => 4 - (c.last?.removed ?? 0), { where: W.laos, label: 'Remove pieces from Laos' }),
    trail(-2),
  ],
  s: [poolMove('us_troops', 'available', 'out_of_play', 1), mom()],
}));

defCard(40, () => ({
  u: [
    freeOp('sa_air_strike', { faction: 'US', extra: (g, c) => ({ decider: c.faction }) }),
    poolMove('us_troops', 'casualties', 'available', 2),
  ],
  s: [poolMove('us_troops', 'available', 'casualties', 3)],
}));

defCard(41, () => ({
  u: [
    pick(2, (g, id) => MAP[id].type !== 'loc' && MAP[id].pop > 0, (g, a, id) => { setSupport(g, id, 1); }, { label: 'Set a space to Passive Support' }),
    patronage(2),
    mom(),
  ],
  s: [],
}));

defCard(42, () => ({
  u: [resources('NVA', -10), removeUp(['nva_troops'], die('Chou En Lai'), { by: 'NVA', label: 'NVA removes Troops' })],
  s: [resources('NVA', 10), run((g) => { track(g, 'VC', g.trail); })],
}));

defCard(43, () => ({
  u: [
    either(['2 ARVN Bases Out of Play to Available', '2 US Bases Out of Play to Available'], [poolMove('arvn_base', 'out_of_play', 'available', 2), poolMove('us_base', 'out_of_play', 'available', 2)]),
    either(['ARVN Resources +6', 'Aid +12'], [resources('ARVN', 6), aid(12)]),
  ],
  s: [trail(1), either(['Improve the Trail 1 more box', 'NVA Resources +10'], [trail(1), resources('NVA', 10)])],
}));

defCard(44, () => ({
  u: [
    ...selectInto('sp', 1, anyNVA, { label: 'Space with an NVA piece' }),
    freeOp('sa_air_lift', { faction: 'US', extra: (g, c) => (c.d.sp?.length ? { into: c.d.sp[0] } : false) }),
    freeOp('op_sweep', { faction: 'US', extra: (g, c) => (c.d.sp?.length ? { spaces: c.d.sp, max: 1, ignoreMonsoon: true } : false) }),
    freeOp('op_assault', { faction: 'US', extra: (g, c) => (c.d.sp?.length ? { spaces: c.d.sp, max: 1 } : false) }),
  ],
  s: [
    ...selectInto('sp', 1, (g, id) => MAP[id].type === 'province' && count(g, id, 'nva_troops') > 0, { label: 'Province with NVA Troops' }),
    removeUp(['us_troops'], die('Hot LZs'), { ids: (g, c) => (c.d.sp?.length ? W.near(c.d.sp[0]) : []), label: 'US Troops to Casualties' }),
  ],
}));

defCard(45, () => ({ u: [cap()], s: [cap()] }));

defCard(46, () => ({
  u: [trail(-2), mom()],
  s: [
    freeOp('sa_infiltrate', { faction: 'NVA' }),
    run((g) => { track(g, 'NVA', 3 * g.trail); track(g, 'VC', 2 * g.trail); }),
  ],
}));

defCard(47, () => ({
  u: [
    ...selectInto('sp', 1, (g, id) => anyNVA(g, id) && count(g, id, 'arvn_troops', 'arvn_police', 'arvn_ranger_u', 'arvn_ranger_a', 'arvn_base') > 0, { label: 'Space with NVA and ARVN' }),
    run((g, c) => {
      for (const id of c.d.sp ?? []) {
        const n = count(g, id, 'arvn_troops', 'arvn_police', 'arvn_ranger_u', 'arvn_ranger_a', 'arvn_base');
        place(g, id, 'arvn_troops', n);
        log(g, `ARVN Troops doubled in ${MAP[id].name}.`);
      }
    }),
    freeOp('op_assault', {
      faction: 'ARVN',
      extra: (g) => {
        const spaces = SPACE_IDS.filter((id) => count(g, id, 'arvn_troops', 'arvn_police') > 0 && count(g, id, 'nva_troops', 'nva_guer_a') > 0);
        return spaces.length ? { spaces, onlyNVA: true } : false;
      },
    }),
  ],
  s: [placeIn('nva_troops', 10, { where: W.isId('north_vietnam', 'central_laos', 'quang_tri_thua_thien', 'loc_hue_khe_sanh'), label: 'Place NVA Troops' })],
}));

defCard(48, () => ({
  u: [
    ...selectInto('sp', 1, (g, id) => MAP[id].type === 'province' && W.coinBase(g, id), { label: 'Province with a COIN Base' }),
    removeUp(GUER_KINDS, 3, { ids: spRef, label: 'Remove Guerrillas' }),
    run((g, c) => { for (const id of c.d.sp ?? []) setSupport(g, id, 2); }),
  ],
  s: [
    ...selectInto('sp', 1, (g, id) => MAP[id].type === 'province' && W.coinBase(g, id) && count(g, id, 'us_troops', 'arvn_troops', 'arvn_police') <= 2, { label: 'Province with a COIN Base and 0-2 COIN cubes' }),
    removeUp(['us_base', 'arvn_base'], 1, { ids: spRef, label: 'Remove a COIN Base' }),
    run((g, c) => { for (const id of c.d.sp ?? []) setSupport(g, id, -2); }),
  ],
}));

defCard(49, () => ({
  u: [xfer(anyOf([...ARVN_POOLS], 'available', 'map', { toWhere: W.sv }), 6, { label: 'Place ARVN pieces in South Vietnam' })],
  s: [
    pick(3, (g, id) => count(g, id, 'nva_troops') > 0, (g, a, id) => { place(g, id, 'nva_troops', count(g, id, 'nva_troops')); log(g, `NVA Troops doubled in ${MAP[id].name}.`); }, { by: 'NVA', label: 'NVA doubles its Troops in a space' }),
    freeOp('sa_bombard', { faction: 'NVA' }),
  ],
}));

defCard(50, () => ({
  u: [
    either(['4 Out-of-play US Troops to South Vietnam', 'ARVN Resources +9'], [
      xfer([{ pool: 'us_troops', from: 'out_of_play', to: 'map', toWhere: W.sv }], 4, { label: 'US Troops to South Vietnam' }),
      resources('ARVN', 9),
    ]),
    ...limOps('ARVN', LIMOPS.ARVN, 2),
  ],
  s: [...limOps('VC', LIMOPS.VC, 3), ...limOps('NVA', LIMOPS.NVA, 3)],
}));

defCard(51, () => ({
  u: [removeUp(NVA_NONBASE_INS, 6, { where: W.outsideSouth, label: 'Remove non-Base Insurgent pieces from outside South Vietnam' })],
  s: [trail(2), run((g) => { const n = rollDie(g); log(g, `Trail construction: die roll ${n}.`); track(g, 'NVA', n); })],
}));

defCard(52, () => {
  const flipTo = K((g, a, i) => { const id = a.data.ids[i]; g.capabilities[id] = a.data.to; log(g, `${cardTitle(id)} flipped to ${a.data.to}.`); });
  const flipStep = (from: 'shaded' | 'unshaded', to: 'shaded' | 'unshaded') => run((g, c) => {
    const ids = US_CAPS.filter((id) => g.capabilities[id] === from);
    if (ids.length) choose(g, c, { opts: ids.map((id) => cardTitle(id)), fn: flipTo, data: { ids, to } });
  });
  return { u: [flipStep('shaded', 'unshaded')], s: [flipStep('unshaded', 'shaded')] };
});

defCard(53, () => ({
  u: [
    pick(3, (g, id) => W.sv(g, id) && count(g, id, 'nva_troops') > 0, (g, a, id) => { remove(g, id, 'nva_troops', 2); log(g, `2 NVA Troops removed from ${MAP[id].name}.`); }, { label: 'South Vietnam space with NVA Troops' }),
    stayEligible(),
  ],
  s: [
    removeUp(['us_base'], 1, { where: W.prov, label: 'Remove a US Base' }),
    removeUp(['arvn_base'], 2, { where: W.prov, label: 'Remove ARVN Bases' }),
  ],
}));

defCard(54, () => ({
  u: [poolMove('us_troops', 'casualties', 'available', 2), makeIneligible('NVA'), stayEligible('US')],
  s: [xfer(anyOf([...US_POOLS], 'casualties', 'out_of_play'), 2, { label: 'Casualties Out of Play' }), makeIneligible('US')],
}));

defCard(55, () => ({
  u: [
    trail(-2),
    removeUp(NVA_ALL, 4, { where: W.laos, by: 'NVA', tunnels: true, label: 'NVA removes 4 pieces from Laos' }),
    removeUp(NVA_ALL, 4, { where: W.cambodia, by: 'NVA', tunnels: true, label: 'NVA removes 4 pieces from Cambodia' }),
  ],
  s: [
    run((g) => { track(g, 'NVA', 2 * g.trail); track(g, 'VC', 2 * g.trail); }),
    xfer([{ pool: 'nva_base', from: 'map', to: 'map', kinds: ['nva_base'], fromWhere: W.lc, toWhere: W.lc }], 99, { by: 'NVA', label: 'NVA moves its Bases within Laos/Cambodia' }),
  ],
}));

const NVA_OPS: [string, string][] = [['op_rally', 'Rally'], ['op_march', 'March'], ['op_attack', 'Attack'], ['op_terror', 'Terror'], ['sa_infiltrate', 'Infiltrate'], ['sa_bombard', 'Bombard'], ['sa_ambush', 'Ambush']];
defCard(56, () => {
  const doOp = K((g, a, i) => { const op = NVA_OPS[i]; if (op) freeOpHelper(g, op[0], 'NVA', { spaces: [a.data.sp], max: 1 }); });
  const only = K((g, a, i) => i === a.data.sp);
  const replace = K((g, a, res) => { if (res.removed === 2) place(g, a.data.sp, 'nva_troops', 1); });
  return {
    u: [pick(3, (g, id) => count(g, id, ...GUER_KINDS) >= 2, (g, a, id) => {
      removePieces(g, a, { n: 2, kinds: GUER_KINDS, filter: only, by: a.by, data: { sp: id }, then: replace, label: 'Replace 2 Guerrillas with 1 NVA Troop' });
    }, { label: 'Space with 2+ Guerrillas' })],
    s: [
      freeOp('op_march', { faction: 'NVA', extra: { max: 3, ignoreMonsoon: true } }),
      eachOf((g, c) => c.last?.spaces ?? [], (g, a, sp) => {
        choose(g, a, { by: 'NVA', opts: [...NVA_OPS.map((o) => o[1]), 'None'], fn: doOp, data: { sp }, text: `Free Op or Special Activity in ${MAP[sp].name}?` });
      }),
    ],
  };
});
defCard(57, () => ({
  u: [xfer(anyOf([...US_POOLS], 'casualties', 'available'), 2, { label: 'US Casualties to Available' })],
  s: [poolMove('us_troops', 'available', 'out_of_play', 2), run((g) => { const n = rollDie(g); log(g, `Add a die roll of Resources: ${n}.`); track(g, 'NVA', n); })],
}));

defCard(58, () => {
  const cubesInLaos = (g: any) => count(g, 'central_laos', 'us_troops', 'arvn_troops', 'arvn_police') + count(g, 'southern_laos', 'us_troops', 'arvn_troops', 'arvn_police');
  return {
    u: [removeUp(NVA_ALL, 6, { where: (g, id) => W.nvn(g, id) || W.laos(g, id), by: 'NVA', tunnels: true, label: 'NVA removes 6 pieces from North Vietnam/Laos' })],
    s: [
      ifThen((g) => cubesInLaos(g) === 0, trail(2)),
      ifThen((g) => cubesInLaos(g) > 0, xfer([{ pool: 'us_troops', from: 'map', to: 'map', fromWhere: W.laos, toWhere: W.sv }], 99, { by: 'US', label: 'US Redeploys Troops to Vietnam' })),
      ifThen((g) => cubesInLaos(g) > 0, xfer([
        { pool: 'arvn_troops', from: 'map', to: 'map', fromWhere: W.laos, toWhere: (g, id) => W.sv(g, id) && ((W.city(g, id) && control(g, id) !== 'NVA') || W.coinBase(g, id) || id === 'saigon') },
        { pool: 'arvn_police', from: 'map', to: 'map', fromWhere: W.laos, toWhere: (g, id) => W.sv(g, id) && (W.loc(g, id) || W.coinCtl(g, id)) },
      ], 99, { by: 'ARVN', label: 'ARVN Redeploys to Vietnam' })),
    ],
  };
});

defCard(59, () => ({
  u: [
    ...selectInto('sp', 1, (g, id) => anyNVA(g, id) && (W.coinBase(g, id) || MAP[id].adjacent.some((a) => W.coinBase(g, a))), { label: 'Space with or adjacent to a COIN Base, with NVA pieces' }),
    removeUp(NVA_ALL, 3, { ids: spRef, label: 'Remove NVA pieces' }),
  ],
  s: [
    freeOp('op_march', { faction: 'NVA', extra: { fromOutsideSouth: true, ignoreMonsoon: true } }),
    either(['Free Attack in 1 space', 'Free Ambush in 1 space'], [
      freeOp('op_attack', { faction: 'NVA', extra: { max: 1 } }),
      freeOp('sa_ambush', { faction: 'NVA', extra: { max: 1 } }),
    ]),
  ],
}));

defCard(60, () => ({
  u: [xfer(anyOf([...US_POOLS], 'out_of_play', 'available'), 3, { label: 'US pieces Out of Play to Available' })],
  s: [
    placeIn('nva_troops', 6, { where: W.outsideSouth, label: 'Place NVA Troops outside South Vietnam' }),
    resources('NVA', 6),
    run((g, c) => { if (c.faction === 'NVA') { if (!g.next_eligible.includes('NVA')) g.next_eligible.push('NVA'); g.next_ineligible = g.next_ineligible.filter((f) => f !== 'NVA'); } }),
  ],
}));

void [COIN_KINDS, chooseFaction, changeTrail, flipAll, countFaction, GUER_KINDS];
