// Events 91-120, implemented from the official playbook text (reference/playbook.txt) and rules section 5.
// Unshaded = first text paragraph, shaded = second. Single-text cards (94 Tunnel Rats, 106 Binh Duong,
// 115 Typhoon Kate) only have an unshaded side.
//
// Instructions to the Ops code (extras on free Ops/SAs): ignoreMonsoon, noMove (Sweep in place), noFollow (Assault
// without the ARVN follow-up), asUS (an ARVN-executed Assault counts ARVN Troops like US Troops), noTrail (Air
// Strike may not Degrade the Trail), guerOnly + ambush + ambushAny + ambushMax (insurgent March with free Ambush).
// Capabilities/momentum only record the marker (their effects are read by coin_ops.ts / insurgent_ops.ts / coup.ts).
import type { Faction, Game, PieceKind, PoolKind } from '../../core/types';
import {
  INS_KINDS, K, choose, defCard, flipAll, freeOp as freeOpHelper, log, pickSpaces, removePieces, rollDie, track, transferPieces,
} from './helpers';
import type { Ctx, Step, XferRule } from './helpers';
import {
  FACTION_PIECES, control, count, countBases, countFaction, place, remove, setSupport, shiftSupport,
} from '../../core/pieces';
import { MAP, SPACE_IDS } from '../../data/map';
import {
  aid, anyOf, cap, chooseFaction, eachOf, either, freeOp, makeIneligible, mom, patronage, pick, placeIn, poolMove, removeUp,
  resources, run, selectInto, shift, stayEligible, xfer,
} from './dsl';
import * as W from './wh';

const US_POOLS: PoolKind[] = ['us_troops', 'us_base', 'us_irreg'];
const ARVN_KINDS: PieceKind[] = FACTION_PIECES.ARVN;
const VC_ANY: PieceKind[] = ['vc_guer_u', 'vc_guer_a', 'vc_base', 'vc_tunnel'];
const ALL_GUER: PieceKind[] = ['nva_guer_u', 'nva_guer_a', 'vc_guer_u', 'vc_guer_a'];
const CUBES: PieceKind[] = ['us_troops', 'arvn_troops', 'arvn_police'];
const CAN_THO = 'can_tho';
const MAX_TUNNELS = 6;

const casualtyPieces = (g: Game) => g.casualties.us_troops + g.casualties.us_base + g.casualties.us_irreg;
const leaderCards = (g: Game) => g.leader_box.length + (g.leader !== null ? 1 : 0);
const tunnelsOnMap = (g: Game) => SPACE_IDS.reduce((n, id) => n + count(g, id, 'nva_tunnel', 'vc_tunnel'), 0);
const insBaseIn = (g: Game, id: string) => count(g, id, 'nva_base', 'vc_base') > 0;
const nonBaseMove = (x: PoolKind[]) => x;
void nonBaseMove;

function markTunnel(g: Game, id: string): boolean {
  if (tunnelsOnMap(g) >= MAX_TUNNELS) return false;
  for (const [b, t] of [['nva_base', 'nva_tunnel'], ['vc_base', 'vc_tunnel']] as [PieceKind, PieceKind][]) {
    if (count(g, id, b) > 0) {
      g.spaces[id].pieces[b] = (g.spaces[id].pieces[b] ?? 0) - 1;
      if (g.spaces[id].pieces[b] === 0) delete g.spaces[id].pieces[b];
      g.spaces[id].pieces[t] = (g.spaces[id].pieces[t] ?? 0) + 1;
      return true;
    }
  }
  return false;
}

// Insurgent pool piece placement helper for the executing insurgent Faction.
const insPools = (f: Faction): PoolKind[] => (f === 'NVA' ? ['nva_guer', 'nva_base'] : ['vc_guer', 'vc_base']);

// -------------------------------------------------------------------------------------------------- 91 Bob Hope
defCard(91, () => {
  const fromKey = K((g, a, id) => a.data.ids.includes(id));
  const kProvUS = K((g, a, id) => MAP[id].type === 'province' && count(g, id, 'us_troops') > 0);
  const kCity = K((g, a, id) => MAP[id].type === 'city');
  const kDst = K((g, a, dst) => {
    const { src, f } = a.data as { src: string; f: Faction };
    if (count(g, src, 'us_troops') > 0) {
      g.spaces[src].pieces.us_troops = (g.spaces[src].pieces.us_troops ?? 0) - 1;
      if (!g.spaces[src].pieces.us_troops) delete g.spaces[src].pieces.us_troops;
      g.spaces[dst].pieces.us_troops = (g.spaces[dst].pieces.us_troops ?? 0) + 1;
      place(g, src, f === 'NVA' ? 'nva_guer' : 'vc_guer', 1);
      log(g, `${f} moves a US Troop from ${MAP[src].name} to ${MAP[dst].name} and leaves a Guerrilla.`);
    }
  });
  const kSrc = K((g, a, src) => {
    pickSpaces(g, a, { n: 1, filter: kCity, by: a.data.f, label: 'City to move the US Troop to', data: { src, f: a.data.f }, apply: kDst });
  });
  return {
    u: [
      ...selectInto('src', 1, (g, id) => MAP[id].type === 'province' && count(g, id, 'us_troops') > 0, { label: 'Province with US Troops' }),
      ...selectInto('dst', 1, (g, id) => MAP[id].type === 'city' && control(g, id) === 'COIN', { label: 'COIN-Controlled City' }),
      (g, c) => {
        if (!c.d.src?.length || !c.d.dst?.length) { c.d.moved = 0; return; }
        transferPieces(g, c, {
          n: 99, data: { ids: c.d.src },
          rules: [{ pool: 'us_troops', from: 'map', to: 'map', fromWhere: fromKey, toSpace: c.d.dst[0], label: 'Move a US Troop' }],
        });
      },
      run((g, c) => { c.d.moved = c.last?.moved ?? c.d.moved ?? 0; }),
      xfer(anyOf(US_POOLS, 'casualties', 'available'), (g, c) => Math.floor((c.d.moved ?? 0) / 2), { label: 'Casualty piece to Available' }),
    ],
    s: [
      // NVA or VC move up to 3 US Troops from Provinces to Cities, placing a Guerrilla where each Troop was.
      eachOf(() => ['1', '2', '3'], (g, a) => {
        const f: Faction = a.faction === 'NVA' ? 'NVA' : 'VC';
        pickSpaces(g, a, { n: 1, filter: kProvUS, by: f, label: 'Province with a US Troop', data: { f }, apply: kSrc });
      }),
    ],
  };
});

// -------------------------------------------------------------------------------------------------- 92 SEALORDS
defCard(92, () => {
  const adj = () => MAP[CAN_THO].adjacent;
  const sweepOrAssault = (f: 'ARVN' | 'US'): Step => either(['Sweep in place', 'Assault'], [
    freeOp('op_sweep', { faction: f, extra: () => ({ spaces: adj(), noMove: true, ignoreMonsoon: true }) }),
    freeOp('op_assault', { faction: f, extra: () => ({ spaces: adj() }) }),
  ], { by: f, text: `${f}: free Sweep in place or Assault in the spaces adjacent to Can Tho` });
  return {
    u: [sweepOrAssault('ARVN'), sweepOrAssault('US')],
    s: [xfer((['NVA', 'VC'] as Faction[]).flatMap((f) => insPools(f).map((pool): any => ({
      pool, from: 'map', to: 'map', when: (g: Game, c: Ctx) => c.faction === f,
      fromWhere: (g: Game, id: string) => MAP[id].country === 'cambodia' || id === 'tay_ninh',
      toWhere: (g: Game, id: string) => MAP[CAN_THO].adjacent.includes(id),
    }))), 99, { label: 'Move Insurgent pieces to spaces adjacent to Can Tho' })],
  };
});

// -------------------------------------------------------------------------------------------------- 93 Senator Fulbright
defCard(93, () => ({
  u: [xfer(anyOf(US_POOLS, 'map', 'available'), 4, { label: 'US pieces from the map to Available' })],
  s: [poolMove('us_base', 'available', 'out_of_play', 1), aid(-9)],
}));

// -------------------------------------------------------------------------------------------------- 94 Tunnel Rats
defCard(94, () => ({
  u: [either(['Tunnel markers in 2 Provinces', 'Remove a Tunneled Base near US Troops'], [
    pick(2, (g, id) => MAP[id].type === 'province' && insBaseIn(g, id) && tunnelsOnMap(g) < MAX_TUNNELS, (g, a, id) => { markTunnel(g, id); log(g, `Tunnel marker placed in ${MAP[id].name}.`); }, { label: 'Province with an Insurgent Base' }),
    removeUp(['nva_tunnel', 'vc_tunnel'], 1, { where: (g, id) => count(g, id, 'us_troops') > 0, tunnels: true, label: 'Tunneled Base in a space with US Troops' }),
  ])],
  s: [],
}));

// -------------------------------------------------------------------------------------------------- 95 Westmoreland
defCard(95, () => {
  const each = K((g, a, i) => {
    const sp = a.data.sp as string;
    freeOpHelper(g, i === 0 ? 'op_sweep' : 'op_assault', 'US', i === 0
      ? { spaces: [sp], max: 1, noMove: true, ignoreMonsoon: true } : { spaces: [sp], max: 1, noFollow: true });
  });
  return {
    u: [
      freeOp('sa_air_lift', { faction: 'US' }),
      ...selectInto('sp', 2, undefined, { label: 'Space for a free Sweep (no moves) or Assault (no ARVN)' }),
      eachOf((g, c) => c.d.sp ?? [], (g, a, sp) => {
        choose(g, a, { by: 'US', opts: ['Sweep (no moves)', 'Assault (no ARVN)'], fn: each, data: { sp }, text: `US free Operation in ${MAP[sp].name}` });
      }, { by: 'US' }),
      freeOp('sa_air_strike', { faction: 'US' }),
    ],
    s: [pick(3, (g, id) => MAP[id].type === 'province' && MAP[id].pop > 0 && count(g, id, 'arvn_police') === 0 && g.spaces[id].support > -2,
      (g, a, id) => { shiftSupport(g, id, -2); log(g, `Support shifted -2 in ${MAP[id].name}.`); }, { label: 'Province with no Police: shift 2 levels toward Active Opposition' })],
  };
});

// -------------------------------------------------------------------------------------------------- 96 APC
function pacifyLike(f: 'US' | 'ARVN'): Step[] {
  const apply = K((gg, a, id) => {
    if (gg.spaces[id].terror > 0) gg.spaces[id].terror = 0;
    if (MAP[id].pop > 0 && gg.spaces[id].support < 2) shiftSupport(gg, id, 1);
    log(gg, `${a.by} Pacification in ${MAP[id].name} (free).`);
  });
  return [
    (g: Game, c: Ctx) => {
      const used: string[] = c.d.used ?? (c.d.used = []);
      if (used.length >= 4) return;
      const troops: PieceKind = f === 'US' ? 'us_troops' : 'arvn_troops';
      const cands = SPACE_IDS.filter((id) => !used.includes(id) && MAP[id].type !== 'loc' && control(g, id) === 'COIN'
        && count(g, id, troops) > 0 && count(g, id, 'arvn_police') > 0 && (g.spaces[id].terror > 0 || (MAP[id].pop > 0 && g.spaces[id].support < 2)));
      if (cands.length === 0) return;
      pickSpaces(g, c, { n: 4 - used.length, by: f, label: `${f} Pacification (cost 0, 1 level per space)`, data: { ids: cands }, filter: PACIFY_FILTER, apply });
    },
    (g: Game, c: Ctx) => { for (const id of c.last?.spaces ?? []) (c.d.used ??= []).push(id); c.last = null; },
  ];
}
const CITY_KEY = K((g, a, id) => MAP[id].type === 'city');
const PACIFY_FILTER = K((g, a, id) => a.data.ids.includes(id));

defCard(96, () => ({
  u: [...pacifyLike('US'), ...pacifyLike('ARVN')],
  s: [(g, c) => {
    if (g.pivotal_played.includes('VC')) {
      g.pivotal_played = g.pivotal_played.filter((f) => f !== 'VC');
      if (!g.pivotal_available.includes('VC')) g.pivotal_available.push('VC');
      log(g, 'Tet Offensive is returned to the VC.');
      return;
    }
    // General uprising (Tet Offensive text, without using the card): Terror, 6 VC pieces in Cities, VC+NVA Attack.
    freeOpHelper(g, 'op_terror', 'VC', { spaces: SPACE_IDS.filter((id) => count(g, id, 'vc_guer_u') > 0) });
    c.d.uprising = true;
  },
  (g, c) => {
    if (!c.d.uprising) return;
    transferPieces(g, c, { n: 6, by: 'VC', rules: (['vc_guer', 'vc_base'] as PoolKind[]).map((pool): XferRule => ({ pool, from: 'available', to: 'map', toWhere: CITY_KEY })), label: 'Place VC pieces in Cities' });
  },
  (g, c) => {
    if (!c.d.uprising) return;
    freeOpHelper(g, 'op_attack', 'VC', { guerOnly: true, ambush: false, spaces: SPACE_IDS.filter((id) => count(g, id, 'vc_guer_u', 'vc_guer_a') > 0 && count(g, id, 'us_troops', 'us_base', 'us_irreg_u', 'us_irreg_a', 'arvn_troops', 'arvn_police', 'arvn_ranger_u', 'arvn_ranger_a', 'arvn_base') > 0) });
    freeOpHelper(g, 'op_attack', 'NVA', { guerOnly: true, ambush: false, spaces: SPACE_IDS.filter((id) => count(g, id, 'nva_guer_u', 'nva_guer_a') > 0 && count(g, id, 'us_troops', 'us_base', 'us_irreg_u', 'us_irreg_a', 'arvn_troops', 'arvn_police', 'arvn_ranger_u', 'arvn_ranger_a', 'arvn_base') > 0) });
  }],
}));

// -------------------------------------------------------------------------------------------------- 97 Brinks Hotel
defCard(97, () => ({
  u: [
    either(['Aid +10', 'Transfer 4 Patronage to ARVN Resources'], [
      aid(10),
      run((g) => { const n = Math.min(4, g.patronage); track(g, 'patronage', -n); track(g, 'ARVN', n); }),
    ]),
    run((g) => {
      // Flip the current RVN leader card: its text is ignored (no effect on Minh or Failed Attempt).
      if (g.leader !== null) { g.tmp = g.tmp ?? {}; g.tmp.leader_ignored = g.leader; log(g, 'The RVN leader card is flipped: its text is ignored.'); }
    }),
  ],
  s: [pick(1, (g, id) => MAP[id].type === 'city' && count(g, id, ...VC_ANY) > 0, (g, a, id) => {
    shiftSupport(g, id, -2);
    if (SPACE_IDS.reduce((n, x) => n + g.spaces[x].terror, 0) < 15) g.spaces[id].terror += 1;
    log(g, `${MAP[id].name}: shifted 2 toward Active Opposition and Terror added.`);
  }, { label: 'City with VC' })],
}));

// -------------------------------------------------------------------------------------------------- 98 Long Tan
defCard(98, () => ({
  u: [either(['Place 2 out of play US Troops in a Province', 'Remove all Guerrillas from all Jungle with US Troops'], [
    xfer([{ pool: 'us_troops', from: 'out_of_play', to: 'map', toWhere: W.prov, label: 'US Troop to a Province' }], 2),
    run((g) => {
      for (const id of SPACE_IDS) {
        if (MAP[id].terrain !== 'jungle' || count(g, id, 'us_troops') === 0) continue;
        for (const k of ALL_GUER) remove(g, id, k, count(g, id, k));
      }
      log(g, 'All Guerrillas removed from Jungle spaces with US Troops.');
    }),
  ])],
  s: [
    ...selectInto('sp', 1, (g, id) => MAP[id].terrain === 'jungle' && count(g, id, 'vc_guer_u', 'vc_guer_a') >= 2 && count(g, id, 'us_troops', 'us_base') > 0, { label: 'Jungle with 2+ VC Guerrillas and US pieces' }),
    run((g, c) => {
      for (const id of c.d.sp ?? []) {
        remove(g, id, 'us_base', 1);
        remove(g, id, 'us_troops', 1);
        log(g, `US Base and Troop to Casualties in ${MAP[id].name}.`);
      }
    }),
  ],
}));

// -------------------------------------------------------------------------------------------------- 99 Masher / White Wing
defCard(99, () => ({
  u: [
    ...chooseFaction('f', ['US', 'ARVN'], { text: 'US or ARVN executes the Sweep and Assault' }),
    ...selectInto('sp', 1, (g, id) => MAP[id].terrain !== 'jungle' && MAP[id].type !== 'loc' && count(g, id, 'us_troops') > 0 && count(g, id, 'arvn_troops') > 0, { label: 'Non-Jungle space with US and ARVN Troops' }),
    freeOp('op_sweep', { faction: (g, c) => c.d.f, extra: (g, c) => (c.d.sp?.length ? { spaces: c.d.sp, max: 1, ignoreMonsoon: true } : false) }),
    freeOp('op_assault', { faction: (g, c) => c.d.f, extra: (g, c) => (c.d.sp?.length ? { spaces: c.d.sp, max: 1, asUS: true } : false) }),
  ],
  s: [
    ...chooseFaction('f', ['VC', 'NVA'], { text: 'VC or NVA executes the March and Ambush' }),
    freeOp('op_march', { faction: (g, c) => c.d.f, extra: { max: 3, guerOnly: true, ignoreMonsoon: true, ambush: true, ambushAny: true, ambushMax: 3 } }),
  ],
}));

// -------------------------------------------------------------------------------------------------- 100 Rach Ba Rai
defCard(100, () => ({
  u: [
    ...selectInto('sp', 1, (g, id) => MAP[id].terrain === 'lowland' && MAP[id].type === 'province' && count(g, id, 'us_troops') > 0, { label: 'Lowland with US Troops' }),
    either(['Remove all VC', 'Remove all non-Troop NVA'], [
      run((g, c) => { for (const id of c.d.sp ?? []) for (const k of ['vc_guer_u', 'vc_guer_a', 'vc_base'] as PieceKind[]) remove(g, id, k, count(g, id, k)); }),
      run((g, c) => { for (const id of c.d.sp ?? []) for (const k of ['nva_guer_u', 'nva_guer_a', 'nva_base'] as PieceKind[]) remove(g, id, k, count(g, id, k)); }),
    ]),
  ],
  s: [
    ...selectInto('sp', 1, (g, id) => MAP[id].terrain === 'lowland' && MAP[id].type === 'province' && count(g, id, ...VC_ANY) > 0, { label: 'Lowland with any VC' }),
    removeUp(CUBES, (g) => { const n = rollDie(g); log(g, `Rach Ba Rai: die roll ${n}.`); return n; }, { ids: (g, c) => c.d.sp ?? [], label: 'Remove US/ARVN cubes' }),
    xfer(anyOf(['vc_guer', 'vc_base'], 'available', 'map', { toSpace: undefined }).map((r) => ({ ...r, toSpace: (g: Game, c: Ctx) => c.d.sp?.[0] })), 1, { by: 'VC', label: 'Place 1 VC piece' }),
  ],
}));

// -------------------------------------------------------------------------------------------------- 101 Booby Traps
defCard(101, () => ({ u: [cap()], s: [cap()] }));

// -------------------------------------------------------------------------------------------------- 102 Cu Chi
defCard(102, () => ({
  u: [
    ...selectInto('sp', 1, (g, id) => W.tunneled(g, id) && control(g, id) === 'COIN', { label: 'Space with a Tunnel and COIN Control' }),
    run((g, c) => { for (const id of c.d.sp ?? []) for (const k of ALL_GUER) remove(g, id, k, count(g, id, k)); log(g, 'All Guerrillas removed.'); }),
  ],
  s: [
    ...selectInto('sp', 1, (g, id) => MAP[id].type === 'province' && insBaseIn(g, id), { label: 'Province with an Insurgent Base' }),
    run((g, c) => {
      for (const id of c.d.sp ?? []) {
        while (count(g, id, 'nva_base', 'vc_base') > 0 && markTunnel(g, id)) { /* every Base */ }
        place(g, id, 'nva_guer', 1);
        place(g, id, 'vc_guer', 1);
        log(g, `Tunnel markers placed in ${MAP[id].name}; 1 NVA and 1 VC Guerrilla placed.`);
      }
    }),
  ],
}));

// -------------------------------------------------------------------------------------------------- 103 Kent State
defCard(103, () => ({
  u: [
    xfer(anyOf(US_POOLS, 'casualties', 'available'), 2, { label: 'US Casualties to Available' }),
    freeOp('op_menu', { faction: 'US', extra: { limited: true, sa: false, free: true } }),
    stayEligible('US'),
  ],
  s: [xfer([{ pool: 'us_troops', from: 'casualties', to: 'out_of_play' }], 3, { label: 'US Troop Casualties out of play' }), aid(-6), makeIneligible('US')],
}));

// -------------------------------------------------------------------------------------------------- 104 Main Force Bns
defCard(104, () => ({ u: [cap()], s: [cap()] }));

// -------------------------------------------------------------------------------------------------- 105 Rural Pressure
defCard(105, () => ({
  u: [shift(4, 1, { where: (g, id) => MAP[id].type === 'province' && count(g, id, ...VC_ANY) > 0, label: 'Province with VC' })],
  s: [
    shift(3, -1, { where: (g, id) => MAP[id].type === 'province' && count(g, id, 'arvn_police') > 0, label: 'Province with Police' }),
    either(['Patronage +6', 'Patronage -6'], [patronage(6), patronage(-6)]),
  ],
}));

// -------------------------------------------------------------------------------------------------- 106 Binh Duong
defCard(106, () => {
  const opts = ['Shift toward Support, place a VC Guerrilla', 'Shift toward Support, place Police', 'Shift toward Opposition, place a VC Guerrilla', 'Shift toward Opposition, place Police'];
  const apply = K((g, a, i) => {
    const id = a.data.id as string;
    shiftSupport(g, id, i < 2 ? 1 : -1);
    place(g, id, i % 2 === 0 ? 'vc_guer' : 'arvn_police', 1);
    log(g, `Binh Duong: ${MAP[id].name} shifted, piece placed.`);
  });
  return {
    u: [pick(2, (g, id) => MAP[id].type === 'province' && MAP[id].adjacent.includes('saigon'), (g, a, id) => {
      choose(g, a, { by: a.faction, opts, fn: apply, data: { id }, text: `Binh Duong in ${MAP[id].name}` });
    }, { label: 'Province adjacent to Saigon' })],
    s: [],
  };
});

// -------------------------------------------------------------------------------------------------- 107 Burning Bonze
defCard(107, () => ({
  u: [patronage((g) => (g.spaces['saigon'].support === 2 ? 6 : 3))],
  s: [run((g) => { shiftSupport(g, 'saigon', -1); }), aid(-12)],
}));

// -------------------------------------------------------------------------------------------------- 108 Draft Dodgers
defCard(108, () => ({
  u: [poolMove('us_troops', 'out_of_play', 'available', (g) => (casualtyPieces(g) < 3 ? 3 : 0))],
  s: [poolMove('us_troops', 'available', 'out_of_play', (g) => Math.min(3, casualtyPieces(g)))],
}));

// -------------------------------------------------------------------------------------------------- 109 Nguyen Huu Tho
defCard(109, () => ({
  u: [run((g) => {
    for (const id of SPACE_IDS) if (MAP[id].type === 'city' && count(g, id, ...VC_ANY) > 0) shiftSupport(g, id, 1);
    log(g, 'Each City with VC shifted 1 level toward Active Support.');
  })],
  s: [run((g) => {
    if (countBases(g, 'saigon') < 2) place(g, 'saigon', 'vc_base', 1);
    place(g, 'saigon', 'vc_guer', 1);
    log(g, 'VC place a Base and a Guerrilla in Saigon.');
  }), stayEligible()],
}));

// -------------------------------------------------------------------------------------------------- 110 No Contact
defCard(110, () => ({
  u: [
    xfer(anyOf(US_POOLS, 'casualties', 'map'), 2, { label: 'Place a Casualty on the map' }),
    run((g) => { for (const id of SPACE_IDS) flipAll(g, id, 'underground', ['us_irreg_a', 'arvn_ranger_a']); log(g, 'All Rangers and Irregulars Underground.'); }),
  ],
  s: [run((g) => { for (const id of SPACE_IDS) flipAll(g, id, 'underground', ['nva_guer_a', 'vc_guer_a']); log(g, 'All VC and NVA Guerrillas Underground.'); })],
}));

// -------------------------------------------------------------------------------------------------- 111 Agent Orange
defCard(111, () => ({
  u: [
    run((g) => { for (const id of SPACE_IDS) if (MAP[id].terrain === 'jungle') flipAll(g, id, 'active', ['nva_guer_u', 'vc_guer_u']); log(g, 'All Insurgents in Jungle go Active.'); }),
    freeOp('sa_air_strike', { faction: 'US', extra: () => ({ spaces: SPACE_IDS.filter((id) => MAP[id].terrain === 'jungle'), max: 2, noTrail: true }) }),
  ],
  s: [run((g) => {
    for (const id of SPACE_IDS) {
      const m = MAP[id];
      if (m.type === 'province' && (m.terrain === 'jungle' || m.terrain === 'highland') && countFaction(g, id, 'NVA') + countFaction(g, id, 'VC') > 0) shiftSupport(g, id, -1);
    }
    log(g, 'Each Jungle and Highland with Insurgents shifted 1 level toward Active Opposition.');
  })],
}));

// -------------------------------------------------------------------------------------------------- 112 Colonel Chau
defCard(112, () => ({
  u: [placeIn('arvn_police', 6, { where: W.prov, per: 1, label: 'Police into a Province' })],
  s: [pick(3, (g, id) => MAP[id].type === 'province' && countFaction(g, id, 'ARVN') > 0, (g, a, id) => {
    if (MAP[id].pop > 0) shiftSupport(g, id, -1);
    place(g, id, 'vc_guer', 1);
    log(g, `${MAP[id].name}: shifted toward Active Opposition and a VC Guerrilla placed.`);
  }, { label: 'Province with ARVN' })],
}));

// -------------------------------------------------------------------------------------------------- 113 Ruff Puff
defCard(113, () => ({
  u: [placeIn('arvn_police', 8, { where: W.sv, label: 'Police in the South' })],
  s: [removeUp(['arvn_police'], 5, {
    where: (g, id) => MAP[id].type !== 'city', label: 'Police outside Cities to replace with VC pieces',
    then: (g, a) => {
      let base = true;
      for (const [id, n] of Object.entries(a.counts as Record<string, number>)) {
        for (let i = 0; i < n; i++) {
          if (base && MAP[id].type !== 'loc' && countBases(g, id) < 2 && g.available.vc_base > 0) { place(g, id, 'vc_base', 1); base = false; }
          else place(g, id, 'vc_guer', 1);
        }
      }
      log(g, 'VC pieces replace the Police (at most 1 Base).');
    },
  })],
}));

// -------------------------------------------------------------------------------------------------- 114 Tri Quang
defCard(114, () => ({
  u: [pick(3, (g, id) => MAP[id].type === 'city' && MAP[id].pop > 0 && g.spaces[id].support <= 0, (g, a, id) => { setSupport(g, id, 1); log(g, `${MAP[id].name} set to Passive Support.`); }, { label: 'Neutral or Opposition City' })],
  s: [
    run((g) => { for (const id of ['hue', 'da_nang', 'saigon']) shiftSupport(g, id, -1); }),
    xfer(anyOf(['vc_guer', 'vc_base'], 'available', 'map', { toSpace: 'saigon' }), 1, { by: 'VC', label: 'Place a VC piece in Saigon' }),
  ],
}));

// -------------------------------------------------------------------------------------------------- 115 Typhoon Kate
defCard(115, () => ({ u: [stayEligible(), mom()], s: [] }));

// -------------------------------------------------------------------------------------------------- 116 Cadres
defCard(116, () => ({ u: [cap()], s: [cap()] }));

// -------------------------------------------------------------------------------------------------- 117 Corps Commanders
defCard(117, () => ({
  u: [
    ...selectInto('a', 1, (g, id) => MAP[id].type !== 'loc', { by: 'ARVN', label: 'First space for ARVN Troops' }),
    ...selectInto('b', 1, undefined, { by: 'ARVN', ids: (g, c) => (c.d.a?.length ? MAP[c.d.a[0]].adjacent.filter((x) => MAP[x].type !== 'loc') : []), label: 'Optional second adjacent space (Done to skip)' }),
    xfer(['available', 'out_of_play'].flatMap((from) => ['a', 'b'].map((key): any => ({
      pool: 'arvn_troops', from, to: 'map', label: `Place ARVN Troops (${key === 'a' ? '1st' : '2nd'} space)`,
      toSpace: (g: Game, c: Ctx) => c.d[key]?.[0],
    }))), 3, { by: 'ARVN', label: 'ARVN places 3 Troops' }),
    freeOp('op_sweep', { faction: 'ARVN', extra: (g, c) => { const sp = [...(c.d.a ?? []), ...(c.d.b ?? [])]; return sp.length ? { spaces: sp } : false; } }),
  ],
  s: [
    ...selectInto('a', 1, (g, id) => count(g, id, ...ARVN_KINDS) > 0, { label: 'First space to remove ARVN pieces from' }),
    ...selectInto('b', 1, undefined, { ids: (g, c) => (c.d.a?.length ? MAP[c.d.a[0]].adjacent.filter((x) => count(g, x, ...ARVN_KINDS) > 0) : []), label: 'Optional second adjacent space (Done to skip)' }),
    removeUp(ARVN_KINDS, (g) => { const n = rollDie(g); log(g, `Corps Commanders: die roll ${n}.`); return n; }, { ids: (g, c) => [...(c.d.a ?? []), ...(c.d.b ?? [])], label: 'Remove ARVN pieces' }),
    makeIneligible('ARVN'),
  ],
}));

// -------------------------------------------------------------------------------------------------- 118 Korean War Arms
defCard(118, () => {
  const opts = (g: Game, id: string): PieceKind[] => {
    const out: PieceKind[] = ['vc_guer_u'];
    if (countBases(g, id) < 2 && MAP[id].type !== 'loc' && g.available.vc_base > 0) out.push('vc_base');
    return out;
  };
  const place1 = K((g, a, i) => {
    const k = a.data.kinds[i] as PieceKind;
    place(g, a.data.id, k === 'vc_base' ? 'vc_base' : 'vc_guer', 1);
  });
  return {
    u: [run((g) => {
      // VC remove 1 VC Guerrilla (Active first) from each space with at least 2 and no NVA Base.
      for (const id of SPACE_IDS) {
        if (count(g, id, 'vc_guer_u', 'vc_guer_a') >= 2 && count(g, id, 'nva_base', 'nva_tunnel') === 0) {
          if (remove(g, id, 'vc_guer_a', 1) === 0) remove(g, id, 'vc_guer_u', 1);
        }
      }
      log(g, 'VC remove 1 Guerrilla from each qualifying space.');
    })],
    s: [pick(3, undefined, (g, a, id) => {
      const kinds = opts(g, id);
      if (g.available.vc_guer <= 0 && !kinds.includes('vc_base')) return;
      choose(g, a, { by: 'VC', opts: kinds.map((k) => (k === 'vc_base' ? 'VC Base' : 'VC Guerrilla')), fn: place1, data: { id, kinds }, text: `Place a VC piece in ${MAP[id].name}` });
    }, { by: 'VC', label: 'Space for a VC piece' })],
  };
});

// -------------------------------------------------------------------------------------------------- 119 My Lai
defCard(119, () => ({
  u: [poolMove('us_troops', 'available', 'out_of_play', 2), patronage(2)],
  s: [
    pick(1, (g, id) => MAP[id].type === 'province' && count(g, id, 'us_troops') > 0, (g, a, id) => {
      if (MAP[id].pop > 0) setSupport(g, id, -2);
      if (countBases(g, id) < 2) place(g, id, 'vc_base', 1);
      place(g, id, 'vc_guer', 1);
      log(g, `My Lai: ${MAP[id].name} set to Active Opposition; VC Base and Guerrilla placed.`);
    }, { label: 'Province with US Troops' }),
    aid(-6),
  ],
}));

// -------------------------------------------------------------------------------------------------- 120 US Press Corps
defCard(120, () => ({
  u: [xfer(anyOf(US_POOLS, 'out_of_play', 'map'), (g) => { const n = leaderCards(g); return n <= 2 ? 4 : n <= 5 ? 2 : 0; }, { label: 'US pieces from Out of Play to the map' })],
  s: [
    poolMove('us_troops', 'casualties', 'out_of_play', (g) => Math.min(leaderCards(g), g.casualties.us_troops)),
    poolMove('us_base', 'casualties', 'out_of_play', (g) => g.casualties.us_base),
  ],
}));

void [INS_KINDS, removePieces, resources, shift, placeIn, cap, patronage, insPools, W];
