// Events 61-90, implemented from the official playbook text (reference/playbook.txt, verbatim in src/data/cards.ts).
// Free Ops/SAs are pushed with {faction, free:true, spaces?, max?} plus these documented extras understood by
// coin_ops.ts: ignoreMonsoon, into, within, asUS, noFollow, noMove, override (MACV vs Typhoon Kate), decider.
// Local helper states: ev_pacify (Honolulu), ev_free_sa (MACV), ev_replace (CIDG, Thi), ev_withdraw (Great Society).
import { defCard, K, movePieces, changeTrail } from './helpers';
import {
  FACTION_PIECES, count, countFaction, countInsurgent, place, remove, removeTo, setSupport, shiftSupport, control,
  canHaveSupport, PIECE_NAME, addResources, addPatronage,
} from '../../core/pieces';
import { MAP, SPACE_IDS } from '../../data/map';
import { registerState, push, pop, log, rollDie, hasState } from '../../core/framework';
import type { Faction, Game, PieceKind, PoolKind } from '../../core/types';
import {
  aid, anyOf, cap, chooseFaction, eachOf, either, freeOp, makeIneligible, mom, patronage, pick, placeIn, poolMove, removeUp,
  resources, run, selectInto, shift, stayEligible, xfer, POOLS_OF,
} from './dsl';
import type { Step, Ctx } from './helpers';
import * as W from './wh';
import { pacifyCands, pacifyCost, usCommitDests } from '../coup';

const ARVN_KINDS = FACTION_PIECES.ARVN;
const US_KINDS = FACTION_PIECES.US;
const ids = (...x: string[]) => x;
const nm = (id: string) => MAP[id].name;
const cambodiaIds = SPACE_IDS.filter((id) => MAP[id].country === 'cambodia');
const laosIds = SPACE_IDS.filter((id) => MAP[id].country === 'laos');
const isSaigon = (id: string) => id === 'saigon';

// spaces within n steps of `from` (adjacency), excluding LoCs? No: any space counts as a step (1.3.6)
function within(from: string, n: number): string[] {
  const seen = new Set([from]);
  let frontier = [from];
  for (let i = 0; i < n; i++) {
    const nxt: string[] = [];
    for (const s of frontier) for (const a of MAP[s].adjacent) if (!seen.has(a)) { seen.add(a); nxt.push(a); }
    frontier = nxt;
  }
  return [...seen];
}
const within3Hue = within('hue', 3);
const within2Hue = within('hue', 2);

const setNeutral = (g: Game, id: string) => setSupport(g, id, 0);
// one level toward a target support level
function stepToward(g: Game, id: string, target: number): void {
  const s = g.spaces[id].support;
  if (s < target) shiftSupport(g, id, 1);
  else if (s > target) shiftSupport(g, id, -1);
}
const noop: Step = () => { /* nothing */ };
function pushOp(g: Game, state: string, args: any): void {
  if (!hasState(state)) { log(g, `(free ${state} not available)`); return; }
  push(g, state, args);
}

// ------------------------------------------------------------------ helper states

// Pacification as in the Support Phase (6.3.1) for ONE Faction (Honolulu Conference).
registerState('ev_pacify', {
  faction: (_g, a) => a.faction,
  enter(g, a) { a.done = []; if (pacifyCands(g, a.faction, a.done).length === 0) pop(g, { done: true }); },
  prompt(g, a, p) {
    p.text(`${a.faction} Pacification as in the Support Phase (${a.done.length}/4 spaces; ARVN Resources ${g.resources.ARVN}, ${pacifyCost(g)} per step).`);
    for (const id of pacifyCands(g, a.faction, a.done)) p.space(id, nm(id));
    p.select(a.done);
    p.action('done', undefined, 'Done pacifying');
  },
  act(g, a, verb, arg) {
    if (verb === 'done') { pop(g, { done: true }); return; }
    const id = String(arg);
    const st = g.spaces[id];
    const cost = pacifyCost(g);
    const can = () => g.resources.ARVN - cost >= (a.faction === 'US' ? g.econ : 0);
    let levels = 0;
    if (st.terror > 0 && can()) { st.terror = 0; addResources(g, 'ARVN', -cost); }
    while (levels < 2 && st.terror === 0 && canHaveSupport(id) && st.support < 2 && can()) { shiftSupport(g, id, 1); addResources(g, 'ARVN', -cost); levels++; }
    a.done.push(id);
    log(g, `${a.faction} Pacification in ${nm(id)}.`);
    if (pacifyCands(g, a.faction, a.done).length === 0) pop(g, { done: true });
  },
});

// "Executes any 1 free Special Activity" (MACV).
const SAS: Record<Faction, [string, string][]> = {
  US: [['sa_advise', 'Advise'], ['sa_air_lift', 'Air Lift'], ['sa_air_strike', 'Air Strike']],
  ARVN: [['sa_govern', 'Govern'], ['sa_transport', 'Transport'], ['sa_raid', 'Raid']],
  NVA: [['sa_infiltrate', 'Infiltrate'], ['sa_bombard', 'Bombard'], ['sa_ambush', 'Ambush']],
  VC: [['sa_tax', 'Tax'], ['sa_subvert', 'Subvert'], ['sa_ambush', 'Ambush']],
};
registerState('ev_free_sa', {
  faction: (_g, a) => a.faction,
  prompt(g, a, p) {
    p.text(`${a.faction}: execute any 1 free Special Activity (or none).`);
    for (const [st, label] of SAS[a.faction as Faction]) if (hasState(st)) p.action('sa', st, `Free ${label}`);
    p.action('done', undefined, 'No Special Activity');
  },
  act(g, a, verb, arg) {
    if (verb === 'done') { pop(g, { done: true }); return; }
    a.wait = true;
    push(g, String(arg), { faction: a.faction, free: true, override: true });
  },
  resume(g, a) { if (a.wait) pop(g, { done: true }); },
});

// Replace n pieces (any of `from` kinds in spaces passing `where`) with pieces from the `to` pools in the same space.
// If the replacement is not Available (or would break stacking) the piece is just removed (5.1.1).
registerState('ev_replace', {
  faction: (_g, a) => a.by,
  enter(g, a) { a.done = 0; a.sel = null; if (replaceSources(g, a).length === 0) pop(g, { replaced: 0 }); },
  prompt(g, a, p) {
    if (!a.sel) {
      p.text(`${a.label} (${a.done}/${a.n}): click a piece to replace.`);
      for (const [id, k] of replaceSources(g, a)) p.piece(id, k, `${PIECE_NAME[k]} in ${nm(id)}`);
    } else {
      p.text(`Replace the ${PIECE_NAME[a.sel.kind as PieceKind]} in ${nm(a.sel.id)} with:`);
      replaceOptions(g, a).forEach((pool, i) => p.action('choose', i, replaceLabel(pool)));
      p.action('cancel', undefined, 'Cancel');
    }
    p.action('done', undefined, 'Done');
  },
  act(g, a, verb, arg) {
    if (verb === 'done') { pop(g, { replaced: a.done }); return; }
    if (verb === 'cancel') { a.sel = null; return; }
    if (verb === 'piece') {
      const [id, kind] = String(arg).split(':');
      a.sel = { id, kind };
      if (replaceOptions(g, a).length === 0) { doReplace(g, a, -1); }
      return;
    }
    doReplace(g, a, Number(arg));
  },
});
const POOL_LABEL: Partial<Record<PoolKind, string>> = {
  arvn_ranger: 'a Ranger', us_irreg: 'an Irregular', arvn_police: 'Police', vc_guer: 'a VC Guerrilla', vc_base: 'a VC Base',
  arvn_troops: 'ARVN Troops', arvn_base: 'an ARVN Base',
};
const replaceLabel = (p: PoolKind) => `Place ${POOL_LABEL[p] ?? p}`;
function replaceSources(g: Game, a: any): [string, PieceKind][] {
  const out: [string, PieceKind][] = [];
  if (a.done >= a.n) return out;
  for (const id of SPACE_IDS) {
    if (a.ids && !a.ids.includes(id)) continue;
    if (a.whereKey && !a.whereKey.includes(id)) continue;
    for (const k of a.from as PieceKind[]) if (count(g, id, k) > 0) out.push([id, k]);
  }
  return out;
}
function replaceOptions(g: Game, a: any): PoolKind[] {
  const { id } = a.sel;
  return (a.to as PoolKind[]).filter((pool) => {
    if (g.available[pool] <= 0) return false;
    if (pool === 'vc_base' || pool === 'arvn_base') return MAP[id].type !== 'loc' && countBasesIn(g, id) - (/base|tunnel/.test(a.sel.kind) ? 1 : 0) < 2;
    return true;
  });
}
const countBasesIn = (g: Game, id: string) => count(g, id, 'us_base', 'arvn_base', 'nva_base', 'nva_tunnel', 'vc_base', 'vc_tunnel');
function doReplace(g: Game, a: any, choice: number): void {
  const { id, kind } = a.sel as { id: string; kind: PieceKind };
  a.sel = null;
  const opts = a.sel ? [] : replaceOptions(g, { ...a, sel: { id, kind } });
  remove(g, id, kind, 1);
  if (choice >= 0 && opts[choice]) place(g, id, opts[choice], 1);
  a.done++;
  log(g, `${PIECE_NAME[kind]} in ${nm(id)} replaced.`);
  if (a.done >= a.n || replaceSources(g, a).length === 0) pop(g, { replaced: a.done });
}

// VC may shift Population toward Opposition after a Withdrawal (6.5): budget = Population that may be shifted.
registerState('ev_withdraw', {
  faction: () => 'VC',
  enter(g, a) { if (withdrawCands(g, a).length === 0) pop(g, { done: true }); },
  prompt(g, a, p) {
    p.text(`Withdrawal: VC may shift ${a.budget} Population 1 level toward Opposition (each space at most 1 level).`);
    for (const id of withdrawCands(g, a)) p.space(id, `${nm(id)} (Pop ${MAP[id].pop})`);
    p.select(a.done);
    p.action('done', undefined, 'Done');
  },
  act(g, a, verb, arg) {
    if (verb === 'done') { pop(g, { done: true }); return; }
    const id = String(arg);
    shiftSupport(g, id, -1);
    a.budget -= MAP[id].pop;
    a.done.push(id);
    if (withdrawCands(g, a).length === 0) pop(g, { done: true });
  },
});
function withdrawCands(g: Game, a: any): string[] {
  a.done = a.done ?? [];
  return SPACE_IDS.filter((id) => MAP[id].type !== 'loc' && MAP[id].pop > 0 && MAP[id].pop <= a.budget && !a.done.includes(id) && g.spaces[id].support > -2);
}

// ------------------------------------------------------------------ 61-70

defCard(61, () => ({ u: [cap()], s: [cap()] }));

defCard(62, () => ({
  u: [
    freeOp('sa_air_lift', { faction: 'US', extra: { into: cambodiaIds } }),
    either(['US Sweep within Cambodia', 'ARVN Sweep within Cambodia'], [
      freeOp('op_sweep', { faction: 'US', extra: { spaces: cambodiaIds, within: cambodiaIds, ignoreMonsoon: true } }),
      freeOp('op_sweep', { faction: 'ARVN', extra: { spaces: cambodiaIds, within: cambodiaIds, ignoreMonsoon: true } }),
    ], { text: 'US or ARVN free Sweep within Cambodia' }),
    removeUp(['nva_base', 'vc_base'], 2, { where: W.cambodia, label: 'Remove NVA/VC Bases from Cambodia' }),
  ],
  s: [xfer(anyOf(['nva_troops', 'nva_guer'], 'available', 'map', { toWhere: W.cambodia }), 12, { by: 'NVA', label: 'NVA places Troops/Guerrillas in Cambodia' })],
}));

defCard(63, () => ({
  u: [
    either(['2 US pieces from Out of Play to South Vietnam', 'Transfer a die roll from Patronage to ARVN Resources'], [
      xfer(anyOf(['us_troops', 'us_base', 'us_irreg'], 'out_of_play', 'map', { toWhere: W.sv }), 2, { label: 'US piece from Out of Play to South Vietnam' }),
      run((g) => { const r = rollDie(g); const t = Math.min(r, g.patronage); addPatronage(g, -t); addResources(g, 'ARVN', t); log(g, `Die roll ${r}: ${t} Patronage transferred to ARVN Resources.`); }),
    ]),
    aid(6),
  ],
  s: [
    pick(1, W.and(W.city, W.coinCtl, W.support, W.not(W.isId('saigon'))), (g, a, id) => setNeutral(g, id), { label: 'remove Support from a COIN-Controlled City outside Saigon' }),
    either(['Patronage +4', 'VC Resources +4'], [patronage(4), resources('VC', 4)]),
  ],
}));

defCard(64, () => ({
  u: [
    either(['Aid +10', 'Aid -10'], [aid(10), aid(-10)]),
    either(['Patronage +3', 'Patronage -5'], [patronage(3), patronage(-5)]),
    run((g, c) => {
      if (c.faction === 'US' || c.faction === 'ARVN') push(g, 'ev_pacify', { faction: c.faction, card: 64 });
      else if (!g.next_eligible.includes(c.faction)) g.next_eligible.push(c.faction);
    }),
  ],
  s: [],
}));

defCard(65, () => ({
  u: [xfer(anyOf(['us_troops', 'us_base', 'us_irreg'], 'out_of_play', 'map', {}), 4, { label: 'US piece from Out of Play onto the map' })],
  s: [xfer(anyOf(['us_troops', 'us_base', 'us_irreg'], 'map', 'out_of_play', { fromWhere: W.anySpace }), (g) => { const r = rollDie(g); log(g, `Withdrawal: die roll ${r}.`); return r; }, { by: 'US', label: 'US piece from the map to Out of Play' })],
}));

defCard(66, () => ({
  u: [
    aid(9), resources('ARVN', 9),
    either(['Up to 2 US pieces from Out of Play to South Vietnam', 'Patronage -3', 'Neither'], [
      xfer(anyOf(['us_troops', 'us_base', 'us_irreg'], 'out_of_play', 'map', { toWhere: W.sv }), 2, { label: 'US piece from Out of Play to South Vietnam' }),
      patronage(-3),
      noop,
    ]),
  ],
  s: [
    pick(3, W.and(W.support, W.not(W.isId('saigon'))), (g, a, id) => setNeutral(g, id), { label: 'remove Support outside Saigon' }),
    patronage(-3),
  ],
}));

defCard(67, () => {
  const coastal = K((g, a, id) => MAP[id].coastal);
  return {
    u: [
      ...chooseFaction('who', ['US', 'ARVN'], { text: 'US or ARVN?' }),
      (g, c) => {
        const who: Faction = c.d.who;
        movePieces(g, c, { by: who, n: 99, kinds: [who === 'US' ? 'us_troops' : 'arvn_troops'], from: coastal, to: coastal, label: `${who} relocates Troops among coastal spaces` });
      },
      pick(1, W.coastal, (g, a, id) => {
        const who: Faction = a.data.who;
        pushOp(g, 'op_assault', { faction: who, free: true, spaces: [id], max: 1 });
        pushOp(g, 'op_sweep', { faction: who, free: true, spaces: [id], max: 1, ignoreMonsoon: true });
      }, { label: 'free Sweep and Assault in 1 coastal space', data: (g: Game, c: Ctx) => ({ who: c.d.who }), by: (g, c) => c.d.who }),
    ],
    s: [
      xfer([
        { pool: 'vc_guer', from: 'map', to: 'map', fromWhere: W.coastal, toWhere: W.anySpace },
        { pool: 'vc_base', from: 'map', to: 'map', fromWhere: W.coastal, toWhere: W.notLoc },
      ], 3, { by: 'VC', label: 'VC relocates pieces from coastal spaces' }),
      makeIneligible('US'), makeIneligible('ARVN'),
    ],
  };
});

defCard(68, () => ({
  u: [
    ...selectInto('prov', 1, W.and(W.prov, W.not(W.nvaCtl), W.not(W.nvn)), { label: 'Province without NVA Control' }),
    either(['3 Irregulars', '3 Rangers'], [
      run((g, c) => { for (const id of c.d.prov ?? []) place(g, id, 'us_irreg', 3); }),
      run((g, c) => { for (const id of c.d.prov ?? []) place(g, id, 'arvn_ranger', 3); }),
    ]),
    run((g, c) => { for (const id of c.d.prov ?? []) setSupport(g, id, 2); }),
  ],
  s: [
    removeUp(['us_irreg_u', 'us_irreg_a'], 3, { dest: 'available', label: 'Remove Irregulars to Available' }),
    pick(1, W.prov, (g, a, id) => setSupport(g, id, -2), { ids: (g, c) => c.last?.spaces ?? [], label: 'set one of their Provinces to Active Opposition' }),
  ],
}));

defCard(69, () => {
  const pair = (f1: Faction, f2: Faction): Step => (g) => {
    push(g, 'ev_free_sa', { faction: f2 });
    push(g, 'ev_free_sa', { faction: f1 });
  };
  return {
    u: [
      either(['US then ARVN', 'NVA then VC'], [pair('US', 'ARVN'), pair('NVA', 'VC')], { text: 'Which pair of Factions executes a free Special Activity?' }),
      stayEligible(),
    ],
    s: [],
  };
});

const phuBonNear = within('phu_bon_phu_yen', 1);
defCard(70, () => ({
  u: [
    ...chooseFaction('who', ['US', 'ARVN'], { text: 'US or ARVN?' }),
    (g, c) => {
      const who: Faction = c.d.who;
      pushOp(g, 'op_assault', { faction: who, free: true, spaces: phuBonNear, asUS: true });
      pushOp(g, 'op_sweep', { faction: who, free: true, spaces: phuBonNear.filter((id) => MAP[id].type !== 'loc'), asUS: true, ignoreMonsoon: true });
    },
  ],
  s: [run((g) => { for (const id of ['qui_nhon', 'phu_bon_phu_yen', 'khanh_hoa']) shiftSupport(g, id, -1); })],
}));

// ------------------------------------------------------------------ 71-80

defCard(71, () => ({
  u: [pick(1, W.and(W.sv, W.hasFaction('ARVN')), (g, a, id) => {
    const n = count(g, id, 'nva_troops');
    if (n > 0) remove(g, id, 'nva_troops', n);
    place(g, id, 'arvn_troops', 3);
    log(g, `An Loc: removed ${n} NVA Troops and placed ARVN Troops in ${nm(id)}.`);
  }, { label: 'space in the South with ARVN' })],
  s: [pick(1, W.city, (g, a, id) => {
    pushOp(g, 'op_attack', { faction: 'NVA', free: true, spaces: [id], max: 1 });
    pushOp(g, 'op_attack', { faction: 'NVA', free: true, spaces: [id], max: 1 });
    pushOp(g, 'op_march', { faction: 'NVA', free: true, spaces: [id], max: 1, troopsOnly: true, ignoreMonsoon: true });
  }, { by: 'NVA', label: 'City for the NVA March and Attacks' })],
}));

defCard(72, () => ({
  u: [mom()],
  s: [run((g) => {
    for (const id of SPACE_IDS) if (g.spaces[id].support === -2 && MAP[id].type !== 'loc') place(g, id, 'vc_guer', 1);
    for (const id of SPACE_IDS) if (MAP[id].country === 'laos' || MAP[id].country === 'cambodia') place(g, id, 'nva_troops', 2);
  })],
}));

defCard(73, () => {
  const dests = (g: Game, id: string) => usCommitDests(g, 'us_troops').includes(id);
  const baseDests = (g: Game, id: string) => usCommitDests(g, 'us_base').includes(id);
  const troopRules = (pool: PoolKind, to: (g: Game, id: string) => boolean) => [
    { pool, from: 'available' as const, to: 'map' as const, toWhere: to },
    { pool, from: 'map' as const, to: 'available' as const, fromWhere: W.anySpace },
    { pool, from: 'map' as const, to: 'map' as const, fromWhere: W.anySpace, toWhere: to },
  ];
  return {
    u: [
      // Commitment Phase (6.5): rotation, placement of Casualties, then up to 10 - placed Troops and 2 Bases moves.
      run((g, c) => {
        const t = g.casualties.us_troops;
        const medevac = g.momentum.includes(15) && g.tmp?.momentum_side?.[15] === 'unshaded';
        if (medevac) { g.available.us_troops += t; g.casualties.us_troops = 0; c.d.toPlace = 0; log(g, 'Medevac: all Troop Casualties become Available.'); }
        else {
          const oop = Math.floor(t / 3);
          g.out_of_play.us_troops += oop; g.casualties.us_troops -= oop;
          c.d.toPlace = g.casualties.us_troops;
          log(g, `Commitment: ${oop} Troop Casualties out of play; ${c.d.toPlace} to be placed.`);
        }
        g.out_of_play.us_base += g.casualties.us_base; g.casualties.us_base = 0;
        g.available.us_irreg += g.casualties.us_irreg; g.casualties.us_irreg = 0;
      }),
      xfer([{ pool: 'us_troops', from: 'casualties', to: 'map', toWhere: dests }], (g, c) => c.d.toPlace, { by: 'US', label: 'Place Troop Casualties on the map' }),
      run((g, c) => {
        c.d.placed = c.d.toPlace - g.casualties.us_troops;
        c.d.pre = g.available.us_troops + g.available.us_base;
        // any Troop Casualties that could not be placed stay in the Casualties box
      }),
      xfer(troopRules('us_troops', dests), (g, c) => Math.max(0, 10 - c.d.placed), { by: 'US', label: 'Move US Troops (Available / COIN Control / LoCs / Saigon)' }),
      xfer(troopRules('us_base', baseDests), 2, { by: 'US', label: 'Move US Bases' }),
      run((g, c) => {
        const withdrawn = Math.max(0, g.available.us_troops + g.available.us_base - c.d.pre);
        const budget = Math.floor(withdrawn / 2);
        if (budget > 0) push(g, 'ev_withdraw', { card: 73, faction: c.faction, budget, done: [] });
      }),
    ],
    s: [xfer(anyOf(['us_troops', 'us_base', 'us_irreg'], 'available', 'out_of_play', {}), 3, { by: 'US', label: 'US piece from Available to Out of Play' })],
  };
});

defCard(74, () => ({
  u: [
    ...selectInto('sp', 1, W.laos, { label: 'Laos space' }),
    run((g, c) => { for (const id of c.d.sp ?? []) place(g, id, 'arvn_troops', 6); }),
    either(['Train', 'Patrol', 'Sweep', 'Assault', 'Skip'], [
      ...['op_train', 'op_patrol', 'op_sweep', 'op_assault'].map((st): Step => (g, c) => {
        if (c.d.sp?.[0]) pushOp(g, st, { faction: 'ARVN', free: true, limited: true, max: 1, spaces: [c.d.sp[0]] });
      }),
      noop,
    ], { by: 'ARVN', text: 'ARVN free Limited Operation in that space' }),
    run((g) => { changeTrail(g, -2); }),
  ],
  s: [resources('NVA', (g) => 6 + laosIds.reduce((n, id) => n + countFaction(g, id, 'ARVN'), 0))],
}));

defCard(75, () => ({
  u: [
    ...chooseFaction('who', ['US', 'ARVN'], { text: 'US or ARVN?' }),
    freeOp('op_sweep', { faction: (g, c) => c.d.who, extra: { spaces: cambodiaIds, ignoreMonsoon: true } }),
    freeOp('op_assault', { faction: (g, c) => c.d.who, extra: { spaces: cambodiaIds, max: 1 } }),
  ],
  s: [
    freeOp('op_rally', { faction: 'VC', extra: { spaces: cambodiaIds } }),
    freeOp('op_march', { faction: 'VC', extra: (g, c) => ({ ignoreMonsoon: true, from: c.last?.spaces ?? [] }) }),
    freeOp('op_rally', { faction: 'NVA', extra: { spaces: cambodiaIds } }),
    freeOp('op_march', { faction: 'NVA', extra: (g, c) => ({ ignoreMonsoon: true, from: c.last?.spaces ?? [] }) }),
  ],
}));

defCard(76, () => ({
  u: [
    run((g) => {
      const n = SPACE_IDS.filter((id) => countFaction(g, id, 'NVA') > 0 && countFaction(g, id, 'VC') > 0).length;
      addResources(g, 'NVA', -n); addResources(g, 'VC', -n);
      log(g, `Annam: ${n} space(s) with both; NVA and VC Resources -${n} each.`);
    }),
    patronage(2),
  ],
  s: [
    run((g) => { setNeutral(g, 'hue'); setNeutral(g, 'da_nang'); }),
    pick(1, W.and(W.prov, W.adjacentTo(['hue', 'da_nang']), W.support), (g, a, id) => setNeutral(g, id), { label: 'Province adjacent to Hue or Da Nang' }),
  ],
}));

defCard(77, () => ({
  u: [
    run((g) => {
      g.resources.NVA = Math.floor(g.resources.NVA / 2);
      g.resources.VC = Math.floor(g.resources.VC / 2);
      log(g, 'Detente: NVA and VC Resources halved.');
    }),
    poolMove('nva_troops', 'available', 'out_of_play', 5),
  ],
  s: [
    either(['NVA Resources +9', 'NVA free Infiltrate'], [resources('NVA', 9), freeOp('sa_infiltrate', { faction: 'NVA' })], { by: 'NVA' }),
    freeOp('op_rally', { faction: 'VC', extra: { max: 6 } }),
  ],
}));

defCard(78, () => ({
  u: [
    pick(1, W.and(W.not(W.isId('saigon')), W.notLoc, W.popd, W.or(W.hasFaction('US'), W.hasFaction('ARVN'))), (g, a, id) => {
      setSupport(g, id, 2);
      g.spaces[id].terror += 1;
      log(g, `General Lansdale: ${nm(id)} to Active Support with a Terror marker.`);
    }, { label: 'space outside Saigon with US or ARVN' }),
    patronage(1),
  ],
  s: [patronage(3), mom()],
}));

defCard(79, () => ({
  u: [aid(20)],
  s: [
    removeUp(ARVN_KINDS, 3, { label: 'Remove ARVN pieces', then: (g, a, res) => { addPatronage(g, 2 * res.removed); log(g, `Patronage +${2 * res.removed}.`); } }),
    makeIneligible('ARVN'),
  ],
}));

defCard(80, () => ({
  u: [
    removeUp(US_KINDS, 4, { dest: 'available', label: 'Remove 1-4 US pieces from the map to Available' }),
    run((g, c) => { c.d.n = c.last?.removed ?? 0; addPatronage(g, 2 * c.d.n); log(g, `Patronage +${2 * c.d.n}.`); }),
    shift((g, c) => c.d.n, -1, { where: W.notLoc, label: 'shift a space toward Active Opposition' }),
    placeIn('nva_troops', (g, c) => 4 * c.d.n, { where: W.outside, label: 'place NVA Troops outside the South' }),
    stayEligible(),
  ],
  s: [],
}));

// ------------------------------------------------------------------ 81-90

const RANGER_KINDS: PieceKind[] = ['arvn_ranger_u', 'arvn_ranger_a', 'arvn_police', 'us_irreg_u', 'us_irreg_a'];
defCard(81, () => ({
  u: [(g, c) => {
    const n = rollDie(g);
    log(g, `CIDG: die roll ${n}.`);
    push(g, 'ev_replace', { card: 81, faction: c.faction, by: c.faction, n, from: ['vc_guer_u', 'vc_guer_a'], to: ['arvn_ranger', 'us_irreg', 'arvn_police'], ids: SPACE_IDS.filter((id) => MAP[id].country === 'south_vietnam'), label: 'CIDG: replace VC Guerrillas with Rangers, Irregulars or Police' });
  }],
  s: [pick(1, W.and(W.highland, W.has(...RANGER_KINDS)), (g, a, id) => {
    let n = 0;
    for (const k of RANGER_KINDS) { const c = count(g, id, k); if (c > 0) { removeTo(g, id, k, c, 'available'); n += c; } }
    place(g, id, 'vc_guer', 2);
    log(g, `Desertions: ${n} pieces replaced by VC Guerrillas in ${nm(id)}.`);
  }, { label: 'Highland space with Rangers, Police or Irregulars' })],
}));

defCard(82, () => ({
  u: [either(['Up to 3 US or 6 ARVN pieces from Out of Play to Available', 'ARVN Resources and Aid each +9'], [
    either(['Up to 3 US pieces', 'Up to 6 ARVN pieces'], [
      xfer(anyOf(['us_troops', 'us_base', 'us_irreg'], 'out_of_play', 'available', {}), 3, { label: 'US piece Out of Play to Available' }),
      xfer(anyOf(['arvn_troops', 'arvn_police', 'arvn_ranger', 'arvn_base'], 'out_of_play', 'available', {}), 6, { label: 'ARVN piece Out of Play to Available' }),
    ]),
    run((g) => { addResources(g, 'ARVN', 9); g.aid = Math.min(75, g.aid + 9); }),
  ])],
  s: [poolMove('us_troops', 'available', 'out_of_play', 3), aid(-9)],
}));

defCard(83, () => ({
  u: [pick(3, W.and(W.popd, W.notLoc, (g, id) => g.spaces[id].support === 1), (g, a, id) => setSupport(g, id, 2), { label: 'Passive Support space to Active Support' }), aid(10)],
  s: [shift(2, -1, { where: W.city }), aid(-15)],
}));

defCard(84, () => ({
  u: [run((g) => {
    for (const id of SPACE_IDS) if (MAP[id].country === 'south_vietnam' && countFaction(g, id, 'NVA') > 0) { place(g, id, 'arvn_troops', 1); place(g, id, 'arvn_police', 1); }
  })],
  s: [
    run((g, c) => {
      c.d.rem = [];
      for (const id of SPACE_IDS) {
        let n = Math.floor(count(g, id, 'arvn_troops', 'arvn_police') / 3);
        if (n <= 0) continue;
        c.d.rem.push(id);
        for (const k of ['arvn_troops', 'arvn_police'] as PieceKind[]) { const r = remove(g, id, k, n); n -= r; }
      }
    }),
    pick(3, undefined, (g, a, id) => { place(g, id, 'vc_guer', 1); }, { ids: (g, c) => c.d.rem ?? [], label: 'space where ARVN removed cubes: place a VC Guerrilla' }),
  ],
}));

defCard(85, () => {
  const tri = (label: string, apply: (g: Game, d: number) => void): Step =>
    either([`${label} +2`, `${label} -2`, `${label} unchanged`], [(g) => apply(g, 2), (g) => apply(g, -2), noop], { text: `Change ${label}?` });
  return {
    u: [shift(3, 1, { where: W.coinCtl, label: 'COIN-Controlled space toward Active Support' })],
    s: [
      tri('ARVN Resources', (g, d) => addResources(g, 'ARVN', d)),
      tri('Aid', (g, d) => { g.aid = Math.max(0, Math.min(75, g.aid + d)); }),
      tri('Patronage', (g, d) => addPatronage(g, d)),
    ],
  };
});

defCard(86, () => ({ u: [cap()], s: [cap()] }));

defCard(87, () => ({
  u: [
    xfer(anyOf(['arvn_troops', 'arvn_police', 'arvn_ranger', 'arvn_base'], 'available', 'map', { toWhere: (g, id) => within3Hue.includes(id) }), 3, { label: 'ARVN piece within 3 spaces of Hue' }),
    run((g, c) => { for (const id of c.last?.spaces ?? []) shiftSupport(g, id, 1); }),
  ],
  s: [
    (g, c) => push(g, 'ev_replace', { card: 87, faction: c.faction, by: c.faction, n: 2, from: ['arvn_troops', 'arvn_police', 'arvn_ranger_u', 'arvn_ranger_a', 'arvn_base'], to: ['vc_guer', 'vc_base'], ids: within2Hue, label: 'Replace ARVN pieces with VC pieces within 2 spaces of Hue' }),
    either(['Patronage +4', 'Patronage -4'], [patronage(4), patronage(-4)]),
  ],
}));

defCard(88, () => ({
  u: [run((g) => shiftSupport(g, 'saigon', 1)), patronage(5)],
  s: [run((g) => stepToward(g, 'saigon', 0)), patronage(-5), makeIneligible('ARVN')],
}));

defCard(89, () => ({
  u: [run((g) => stepToward(g, 'saigon', 1)), patronage(6)],
  s: [
    either(['Place a VC Guerrilla in Saigon', 'Place a VC Base in Saigon'], [
      placeIn('vc_guer', 1, { where: W.isId('saigon') }),
      placeIn('vc_base', 1, { where: W.isId('saigon') }),
    ]),
    run((g) => stepToward(g, 'saigon', -1)),
    patronage(-6),
  ],
}));

defCard(90, () => {
  const pools: PoolKind[] = ['arvn_troops', 'arvn_police', 'arvn_ranger', 'arvn_base'];
  const redeployFrom = K((g, a, id) => MAP[id].type === 'province' || MAP[id].type === 'loc');
  const redeployTo = K((g, a, id) => id === 'saigon' || (MAP[id].type === 'city' && control(g, id) !== 'NVA'));
  return {
    u: [xfer([
      ...anyOf(pools, 'available', 'map', { toWhere: W.coinCtl }),
      ...anyOf(pools, 'out_of_play', 'map', { toWhere: W.coinCtl }),
      ...anyOf(pools, 'map', 'map', { fromWhere: W.anySpace, toWhere: W.coinCtl }),
    ], 2, { label: 'ARVN piece into a COIN Control space' })],
    s: [
      (g, c) => {
        // "any 1 Guerrilla in each Province with ARVN": the executing Faction picks NVA or VC per Province.
        const provs = SPACE_IDS.filter((id) => MAP[id].type === 'province' && countFaction(g, id, 'ARVN') > 0);
        c.d.provs = provs;
      },
      eachOf((g, c) => c.d.provs ?? [], (g, a, id) => {
        push(g, 'ev_choose', { card: a.card, faction: a.faction, by: a.faction, opts: ['NVA Guerrilla', 'VC Guerrilla'], fn: guerFn, data: { id }, text: `Place a Guerrilla in ${nm(id)}` });
      }),
      xfer([{ pool: 'arvn_troops', from: 'map', to: 'map', fromWhere: W.or(W.prov, W.loc), toWhere: (g, id) => MAP[id].type === 'city' && control(g, id) !== 'NVA' || id === 'saigon' }], 99, { by: 'ARVN', label: 'ARVN Troops Redeploy to Cities/Saigon' }),
    ],
  };
});
const guerFn = K((g, a, i) => {
  const id = a.data.id as string;
  place(g, id, i === 0 ? 'nva_guer' : 'vc_guer', 1);
  log(g, `Placed a ${i === 0 ? 'NVA' : 'VC'} Guerrilla in ${nm(id)}.`);
});

void [countInsurgent, control, MAP, ids, POOLS_OF, aid, isSaigon, W];
