// Coup Round (6.0), per the 2018 Rulebook:
//   [Coup card immediate effect: RVN leader / Failed Attempt desertion]
//   6.1 Victory, 6.2 Resources, 6.3 Support (Pacification, Agitation), 6.4 Redeploy (game ends here if final),
//   6.5 Commitment, 6.6 Reset.
//
// State: 'coup' (reads g.current, g.final_coup, g.humans). Pops with { done: true, over?: boolean }, or after
// setting g.over / g.result.
//
// Automated: Victory, leader effects, Resources, Laos/Cambodia removal, Reset. Decisions are prompted only for
// factions in g.humans; other factions use a simple heuristic (mandatory steps are always carried out).
//
// Exports: leaderEffect (for Train / Transport / Govern), computeEcon, margins, victoryCheck.

import { registerState, pop, log } from '../core/framework';
import type { Prompt } from '../core/framework';
import type { Faction, Game, PieceKind } from '../core/types';
import { FACTIONS } from '../core/types';
import { SPACE_IDS } from '../data/map';
import { CARD } from '../data/cards';
import {
  space, count, countFaction, control, addResources, addAid, shiftSupport, move, flip, remove, removeTo, place,
  victoryMargin, victoryScore, canHaveSupport, PIECE_NAME, countBases,
} from '../core/pieces';
import { changeTrail, agitateSpace, agitateOk } from './insurgent_ops';

const PACIFY_MAX_SPACES = 4;
const TERROR_MARKER_CAP = 15;

const nm = (id: string) => space(id).name;
const isHuman = (g: Game, f: Faction) => g.humans.includes(f);
const isLC = (id: string) => { const c = space(id).country; return c === 'laos' || c === 'cambodia'; };
const momSide = (g: Game, n: number): string | undefined => (g.momentum.includes(n) ? g.tmp?.momentum_side?.[n] : undefined);

/**
 * RVN leader effects (2.4.1) for Agent B's Train / Transport / Govern and this file's Pacification.
 *   Duong Van Minh (g.leader === null, not cancelled by a Failed Attempt): trainAid = 5 (each ARVN Train Op adds +5 Aid).
 *   Khanh (125):        transportMaxLocs = 1 (each Transport uses at most 1 LoC space).
 *   Young Turks (126):  governPatronage = 2 (each ARVN Govern Special Activity adds +2 Patronage, once per SA).
 *   Ky (127):           pacifyCost = 4 (Resources per Terror removal or level; default 3).
 *   Thieu (128):        no effect.
 */
export interface LeaderEffect { trainAid: number; transportMaxLocs: number; governPatronage: number; pacifyCost: number }
export function leaderEffect(g: Game): LeaderEffect {
  const minhActive = g.leader === null && !g.leader_box.some((id) => id === 129 || id === 130);
  return {
    trainAid: minhActive ? 5 : 0,
    transportMaxLocs: g.leader === 125 ? 1 : Infinity,
    governPatronage: g.leader === 126 ? 2 : 0,
    pacifyCost: g.leader === 127 ? 4 : 3,
  };
}

// ---------------------------------------------------------------- victory (6.1, 7.x)

export function margins(g: Game): Record<Faction, number> {
  const m = {} as Record<Faction, number>;
  for (const f of FACTIONS) m[f] = victoryMargin(g, f);
  return m;
}

// 7.1: highest margin first; ties go to Non-players, then VC, ARVN, NVA (US last).
const TIE_ORDER: Faction[] = ['VC', 'ARVN', 'NVA', 'US'];
function rank(g: Game, among: Faction[]): Faction[] {
  const m = margins(g);
  const tie = (f: Faction) => (isHuman(g, f) ? 10 : 0) + TIE_ORDER.indexOf(f);
  return [...among].sort((a, b) => (m[b] - m[a]) || (tie(a) - tie(b)));
}

function summary(g: Game): string {
  const m = margins(g);
  return FACTIONS.map((f) => `${f} ${victoryScore(g, f)} (${m[f] >= 0 ? '+' : ''}${m[f]})`).join(', ');
}

// 6.1 / 7.2: game ends if any Faction meets its condition. Returns true if the game ended.
export function victoryCheck(g: Game): boolean {
  const m = margins(g);
  const met = FACTIONS.filter((f) => m[f] > 0);
  if (met.length === 0) return false;
  const npMet = met.filter((f) => !isHuman(g, f));
  const order = rank(g, [...FACTIONS]);
  g.over = true;
  if (npMet.length > 0 && g.humans.length > 0) {
    g.result = `Non-player ${npMet[0]} meets its victory condition: all players lose. ${summary(g)}`;
  } else {
    g.result = `${order[0]} wins at the Coup Round victory check (ranking ${order.join(' > ')}). ${summary(g)}`;
  }
  log(g, g.result);
  return true;
}

// 7.3: after the final Coup Round the highest victory margin wins.
function finalScoring(g: Game): void {
  const order = rank(g, [...FACTIONS]);
  g.over = true;
  g.result = `Final Coup Round complete: ${order[0]} wins with the highest victory margin (ranking ${order.join(' > ')}). ${summary(g)}`;
  log(g, g.result);
}

// ---------------------------------------------------------------- coup card effects (2.4, 2.4.1)

function leaderPhase(g: Game): void {
  const card = g.current !== null ? CARD[g.current] : undefined;
  if (!card) return;
  if (card.leader) {
    if (g.leader !== null && g.leader !== card.id) g.leader_box.push(g.leader);
    g.leader = card.id;
    log(g, `New RVN leader: ${card.title}.`);
  } else if (card.title === 'Failed Attempt') {
    // Desertion: ARVN removes 1 in 3 of its cubes in each space (round down); Police first, then Troops.
    let removed = 0;
    for (const id of SPACE_IDS) {
      let n = Math.floor(count(g, id, 'arvn_troops', 'arvn_police') / 3);
      for (const k of ['arvn_police', 'arvn_troops'] as PieceKind[]) {
        const r = remove(g, id, k, n);
        n -= r; removed += r;
      }
    }
    g.leader_box.push(card.id); // counts as a card in the RVN Leader box, under the top leader
    log(g, `Failed Attempt: ARVN desertion (${removed} cubes).`);
  }
}

// ---------------------------------------------------------------- resources (6.2)

export function totalMarkers(g: Game): number {
  let n = 0;
  for (const id of SPACE_IDS) n += g.spaces[id].terror;
  return n;
}

export function computeEcon(g: Game): number {
  let n = 0;
  for (const id of SPACE_IDS) {
    const s = space(id);
    if (s.type === 'loc' && g.spaces[id].terror === 0) n += s.econ;
  }
  return n;
}

function resourcesPhase(g: Game): void {
  // 6.2.1 Sabotage: unSabotaged LoCs where Insurgent Guerrillas outnumber COIN pieces or adjacent to a City
  // without COIN Control, until no markers remain (VC chooses: highest Econ first).
  const locs = SPACE_IDS.filter((id) => {
    const s = space(id);
    if (s.type !== 'loc' || g.spaces[id].terror > 0) return false;
    const guer = count(g, id, 'nva_guer_u', 'nva_guer_a', 'vc_guer_u', 'vc_guer_a');
    const coin = countFaction(g, id, 'US') + countFaction(g, id, 'ARVN');
    if (guer > coin) return true;
    return s.adjacent.some((n) => space(n).type === 'city' && control(g, n) !== 'COIN');
  }).sort((a, b) => space(b).econ - space(a).econ);
  for (const id of locs) {
    if (totalMarkers(g) >= TERROR_MARKER_CAP) break;
    g.spaces[id].terror = 1;
    log(g, `Insurgents sabotage ${nm(id)}.`);
  }
  // 6.2.2 Degrade Trail.
  if (g.trail > 0 && SPACE_IDS.some((id) => isLC(id) && space(id).type !== 'loc' && control(g, id) === 'COIN')) {
    changeTrail(g, -1);
    log(g, `COIN Control in Laos/Cambodia degrades the Trail to ${g.trail}.`);
  }
  // 6.2.3 ARVN earnings.
  g.econ = computeEcon(g);
  const arvn = g.aid + g.econ;
  addResources(g, 'ARVN', arvn);
  // 6.2.4 Insurgent earnings.
  let vcBases = 0, nvaBases = 0;
  for (const id of SPACE_IDS) {
    vcBases += count(g, id, 'vc_base', 'vc_tunnel');
    if (isLC(id)) nvaBases += count(g, id, 'nva_base', 'nva_tunnel');
  }
  const nva = nvaBases + 2 * g.trail;
  addResources(g, 'VC', vcBases);
  addResources(g, 'NVA', nva);
  log(g, `Resources: ARVN +${arvn} (Aid ${g.aid} + Econ ${g.econ}), VC +${vcBases}, NVA +${nva}.`);
  // 6.2.5 Casualties and Aid.
  const cas = g.casualties.us_troops + g.casualties.us_base + g.casualties.us_irreg;
  if (cas > 0) { addAid(g, -3 * cas); log(g, `US Casualties (${cas}) reduce Aid to ${g.aid}.`); }
}

// ---------------------------------------------------------------- support (6.3)

export function pacifyCost(g: Game): number {
  if (momSide(g, 16) === 'unshaded') return 1; // Blowtorch Komer
  return leaderEffect(g).pacifyCost;
}

// US spends only ARVN Resources above marked Total Econ; ARVN may spend down to 0.
const canSpend = (g: Game, f: 'US' | 'ARVN', c: number) => g.resources.ARVN - c >= (f === 'US' ? g.econ : 0);

export function pacifyCands(g: Game, f: 'US' | 'ARVN', done: string[]): string[] {
  if (done.length >= PACIFY_MAX_SPACES || !canSpend(g, f, pacifyCost(g))) return [];
  const troops: PieceKind = f === 'US' ? 'us_troops' : 'arvn_troops';
  return SPACE_IDS.filter((id) => {
    if (done.includes(id) || space(id).type === 'loc') return false;
    if (control(g, id) !== 'COIN') return false;
    if (count(g, id, troops) === 0 || count(g, id, 'arvn_police') === 0) return false;
    const st = g.spaces[id];
    return st.terror > 0 || (canHaveSupport(id) && st.support < 2);
  });
}

function pacifySpace(g: Game, f: 'US' | 'ARVN', id: string): void {
  const st = g.spaces[id];
  const cost = pacifyCost(g);
  let steps = 0, levels = 0;
  if (st.terror > 0 && canSpend(g, f, cost)) { st.terror = 0; addResources(g, 'ARVN', -cost); steps++; }
  while (levels < 2 && st.terror === 0 && canHaveSupport(id) && st.support < 2 && canSpend(g, f, cost)) {
    shiftSupport(g, id, 1);
    addResources(g, 'ARVN', -cost);
    levels++; steps++;
  }
  log(g, `${f} Pacification in ${nm(id)} (${steps} step(s)).`);
}

export function agitateCands(g: Game, done: string[]): string[] {
  if (done.length >= PACIFY_MAX_SPACES || g.resources.VC < 1) return [];
  return SPACE_IDS.filter((id) => {
    if (done.includes(id) || space(id).type === 'loc') return false;
    if (countFaction(g, id, 'VC') === 0 || control(g, id) === 'COIN') return false;
    if (!agitateOk(g, id)) return false;
    const st = g.spaces[id];
    return st.terror > 0 || (canHaveSupport(id) && st.support > -2);
  });
}

const byPop = (cands: string[]) => [...cands].sort((a, b) => space(b).pop - space(a).pop);

// ---------------------------------------------------------------- redeploy (6.4)

function laosCambodiaRemoval(g: Game): void {
  let n = 0;
  const kinds: PieceKind[] = ['us_troops', 'us_base', 'us_irreg_u', 'us_irreg_a', 'arvn_troops', 'arvn_police', 'arvn_ranger_u', 'arvn_ranger_a', 'arvn_base'];
  for (const id of SPACE_IDS) {
    if (!isLC(id)) continue;
    for (const k of kinds) {
      const c = count(g, id, k);
      if (c > 0) { n += c; removeTo(g, id, k, c, k === 'us_troops' ? 'out_of_play' : 'available'); }
    }
  }
  if (n > 0) log(g, `Redeploy: ${n} COIN piece(s) leave Laos/Cambodia.`);
}

const hasCOINBase = (g: Game, id: string) => count(g, id, 'us_base', 'arvn_base') > 0;

export function arvnTroopDests(g: Game): string[] {
  return SPACE_IDS.filter((id) => {
    const s = space(id);
    if (s.type === 'loc' || isLC(id) || s.country === 'north_vietnam') return false;
    return id === 'saigon' || hasCOINBase(g, id) || (s.type === 'city' && control(g, id) !== 'NVA');
  });
}
export function arvnPoliceDests(g: Game): string[] {
  return SPACE_IDS.filter((id) => {
    const s = space(id);
    if (s.country !== 'south_vietnam') return false;
    return s.type === 'loc' || control(g, id) === 'COIN';
  });
}
const nvaDests = (g: Game) => SPACE_IDS.filter((id) => count(g, id, 'nva_base', 'nva_tunnel') > 0);

const lockOf = (a: any, id: string, k: PieceKind): number => a.lock?.[id]?.[k] ?? 0;
function lockAdd(a: any, id: string, k: PieceKind, n = 1): void {
  a.lock = a.lock ?? {};
  a.lock[id] = a.lock[id] ?? {};
  a.lock[id][k] = (a.lock[id][k] ?? 0) + n;
}
const mv = (g: Game, a: any, id: string, k: PieceKind) => count(g, id, k) - lockOf(a, id, k);

// ARVN Troops that must move: on LoCs and in Provinces without COIN Bases.
function mandatoryTroops(g: Game, a: any): string[] {
  return SPACE_IDS.filter((id) => {
    const s = space(id);
    if (mv(g, a, id, 'arvn_troops') <= 0) return false;
    if (s.type === 'loc') return true;
    return s.type === 'province' && !hasCOINBase(g, id);
  });
}

function redeploySources(g: Game, a: any, kinds: PieceKind[]): { space: string; kind: PieceKind }[] {
  const out: { space: string; kind: PieceKind }[] = [];
  for (const id of SPACE_IDS) for (const k of kinds) if (mv(g, a, id, k) > 0) out.push({ space: id, kind: k });
  return out;
}

function autoArvnRedeploy(g: Game, a: any): void {
  const dests = arvnTroopDests(g);
  const score = (id: string) => (hasCOINBase(g, id) ? 100 : 0) + space(id).pop + countFaction(g, id, 'NVA') + countFaction(g, id, 'VC');
  for (const src of mandatoryTroops(g, a)) {
    const n = mv(g, a, src, 'arvn_troops');
    const d = [...dests].sort((x, y) => score(y) - score(x))[0] ?? 'saigon';
    move(g, src, d, 'arvn_troops', n);
    lockAdd(a, d, 'arvn_troops', n);
    log(g, `Redeploy: ${n} ARVN Troops ${nm(src)} -> ${nm(d)}.`);
  }
}

// ---------------------------------------------------------------- commitment (6.5)

const US_MAP_KINDS: PieceKind[] = ['us_troops', 'us_base'];

export function usCommitDests(g: Game, kind: PieceKind): string[] {
  return SPACE_IDS.filter((id) => {
    const s = space(id);
    if (s.country !== 'south_vietnam') return false;
    if (kind === 'us_base') return s.type !== 'loc' && countBases(g, id) < 2 && (id === 'saigon' || control(g, id) === 'COIN');
    return s.type === 'loc' || id === 'saigon' || control(g, id) === 'COIN';
  });
}

function rotation(g: Game, a: any): void {
  // Casualties: 1 in 3 (round down) US Troops and all Bases out of play; Irregulars to Available;
  // the other Troops are placed by the US. Medevac (15) unshaded: all Troop Casualties Available.
  const t = g.casualties.us_troops;
  if (momSide(g, 15) === 'unshaded') {
    g.available.us_troops += t;
    g.casualties.us_troops = 0;
    a.toPlace = 0;
  } else {
    const oop = Math.floor(t / 3);
    g.out_of_play.us_troops += oop;
    g.casualties.us_troops -= oop;
    a.toPlace = g.casualties.us_troops;
  }
  g.out_of_play.us_base += g.casualties.us_base;
  g.casualties.us_base = 0;
  g.available.us_irreg += g.casualties.us_irreg;
  g.casualties.us_irreg = 0;
  a.placed = 0;
  a.mvT = 0; a.mvB = 0; a.withdrawn = 0;
  a.sel = null;
  log(g, `Commitment: Casualties rotate (${a.toPlace} US Troop(s) to be placed).`);
}

function placeCasualty(g: Game, id: string): void {
  g.casualties.us_troops--;
  g.spaces[id].pieces.us_troops = (g.spaces[id].pieces.us_troops ?? 0) + 1;
}

function autoPlaceCasualties(g: Game, a: any): void {
  const dests = usCommitDests(g, 'us_troops').filter((id) => space(id).type !== 'loc');
  const sorted = [...dests].sort((x, y) => (countFaction(g, y, 'VC') + countFaction(g, y, 'NVA') + space(y).pop) - (countFaction(g, x, 'VC') + countFaction(g, x, 'NVA') + space(x).pop));
  while (a.toPlace > 0) {
    const d = sorted.length ? sorted[a.placed % sorted.length] : 'saigon';
    placeCasualty(g, d);
    a.toPlace--; a.placed++;
  }
}

const withdrawBudget = (a: any) => Math.floor(a.withdrawn / 2);

function autoWithdraw(g: Game, a: any): void {
  let budget = withdrawBudget(a);
  const cands = SPACE_IDS.filter((id) => canHaveSupport(id) && g.spaces[id].support > -2).sort((x, y) => space(y).pop - space(x).pop);
  for (const id of cands) {
    if (budget <= 0) break;
    if (space(id).pop <= budget) { shiftSupport(g, id, -1); budget -= space(id).pop; log(g, `Withdrawal shifts ${nm(id)} toward Opposition.`); }
  }
}

// ---------------------------------------------------------------- reset (6.6)

function resetPhase(g: Game): void {
  if (g.trail === 0) changeTrail(g, 1);
  else if (g.trail === 4) changeTrail(g, -1);
  if (g.capabilities[33] === 'unshaded') { addResources(g, 'NVA', -6); log(g, 'MiGs: NVA Resources -6.'); }
  const flips: [PieceKind, PieceKind][] = [
    ['nva_guer_a', 'nva_guer_u'], ['vc_guer_a', 'vc_guer_u'], ['us_irreg_a', 'us_irreg_u'], ['arvn_ranger_a', 'arvn_ranger_u'],
  ];
  for (const id of SPACE_IDS) {
    g.spaces[id].terror = 0;
    for (const [a, u] of flips) flip(g, id, a, u, count(g, id, a));
  }
  g.momentum = [];
  if (g.tmp) g.tmp.momentum_side = {};
  g.eligible = { US: true, ARVN: true, NVA: true, VC: true };
  g.next_eligible = [];
  g.next_ineligible = [];
  g.acted = [];
  g.first_faction = null;
  g.first_action = null;
  g.coup_count++;
  log(g, 'Coup Reset: markers removed, Guerrillas Underground, momentum cleared, all factions Eligible.');
}

// ---------------------------------------------------------------- state machine

function advance(g: Game, a: any): void {
  for (;;) {
    switch (a.phase) {
      case 'start':
        leaderPhase(g);
        if (victoryCheck(g)) return pop(g, { done: true, over: true });
        a.phase = 'resources';
        break;
      case 'resources':
        resourcesPhase(g);
        a.phase = 'pacify_us';
        a.sdone = [];
        break;
      case 'pacify_us':
      case 'pacify_arvn': {
        const f: 'US' | 'ARVN' = a.phase === 'pacify_us' ? 'US' : 'ARVN';
        if (isHuman(g, f)) {
          if (pacifyCands(g, f, a.sdone).length > 0) { a.actor = f; return; }
        } else {
          for (const id of byPop(pacifyCands(g, f, a.sdone))) {
            if (pacifyCands(g, f, a.sdone).length === 0) break;
            if (!pacifyCands(g, f, a.sdone).includes(id)) continue;
            pacifySpace(g, f, id);
            a.sdone.push(id);
          }
        }
        a.actor = null;
        a.phase = f === 'US' ? 'pacify_arvn' : 'agitate';
        if (f === 'ARVN') a.adone = [];
        break;
      }
      case 'agitate':
        if (isHuman(g, 'VC')) {
          if (agitateCands(g, a.adone).length > 0) { a.actor = 'VC'; return; }
        } else {
          for (const id of byPop(agitateCands(g, a.adone))) {
            if (a.adone.length >= PACIFY_MAX_SPACES || !agitateCands(g, a.adone).includes(id)) continue;
            agitateSpace(g, id);
            a.adone.push(id);
          }
        }
        a.actor = null;
        a.phase = 'redeploy_laos';
        break;
      case 'redeploy_laos':
        laosCambodiaRemoval(g);
        a.phase = 'redeploy_arvn';
        a.lock = {};
        a.sel = null;
        break;
      case 'redeploy_arvn':
        if (isHuman(g, 'ARVN')) {
          if (redeploySources(g, a, ['arvn_troops', 'arvn_police']).length > 0) { a.actor = 'ARVN'; return; }
        } else {
          autoArvnRedeploy(g, a);
        }
        a.actor = null;
        a.phase = 'redeploy_nva';
        a.lock = {};
        a.sel = null;
        break;
      case 'redeploy_nva':
        if (isHuman(g, 'NVA') && nvaDests(g).length > 0 && redeploySources(g, a, ['nva_troops']).length > 0) { a.actor = 'NVA'; return; }
        a.actor = null;
        if (g.final_coup) { // 6.4.5 Game End?
          finalScoring(g);
          return pop(g, { done: true, over: true });
        }
        a.phase = 'commit_place';
        rotation(g, a);
        break;
      case 'commit_place':
        if (a.toPlace > 0 && isHuman(g, 'US')) { a.actor = 'US'; return; }
        if (a.toPlace > 0) autoPlaceCasualties(g, a);
        a.phase = 'commit_move';
        break;
      case 'commit_move':
        if (isHuman(g, 'US')) { a.actor = 'US'; return; }
        a.phase = 'withdraw';
        break;
      case 'withdraw':
        if (withdrawBudget(a) > 0) {
          if (isHuman(g, 'VC')) { a.actor = 'VC'; a.wdone = []; a.budget = withdrawBudget(a); return; }
          autoWithdraw(g, a);
        }
        a.actor = null;
        a.phase = 'reset';
        break;
      case 'reset':
        resetPhase(g);
        a.phase = 'end';
        break;
      default:
        pop(g, { done: true });
        return;
    }
  }
}

function withdrawCands(g: Game, a: any): string[] {
  return SPACE_IDS.filter((id) => canHaveSupport(id) && g.spaces[id].support > -2 && !a.wdone.includes(id) && space(id).pop <= a.budget);
}

registerState('coup', {
  faction: (g, a) => a.actor ?? g.active,
  enter(g, a) {
    a.phase = 'start';
    a.sdone = [];
    a.adone = [];
    a.lock = {};
    a.sel = null;
    advance(g, a);
  },
  prompt(g, a, p: Prompt) {
    switch (a.phase) {
      case 'pacify_us':
      case 'pacify_arvn': {
        const f: 'US' | 'ARVN' = a.phase === 'pacify_us' ? 'US' : 'ARVN';
        p.text(`Support Phase: ${f} Pacification (${a.sdone.length}/${PACIFY_MAX_SPACES} spaces, ARVN Resources ${g.resources.ARVN}, ${pacifyCost(g)} per step).`);
        p.select(a.sdone);
        for (const id of pacifyCands(g, f, a.sdone)) p.space(id, nm(id));
        p.action('done', undefined, 'Done pacifying');
        return;
      }
      case 'agitate':
        p.text(`Support Phase: Agitation (${a.adone.length}/${PACIFY_MAX_SPACES} spaces, VC Resources ${g.resources.VC}).`);
        p.select(a.adone);
        for (const id of agitateCands(g, a.adone)) p.space(id, nm(id));
        p.action('done', undefined, 'Done agitating');
        return;
      case 'redeploy_arvn': {
        const must = mandatoryTroops(g, a);
        if (!a.sel) {
          p.text(must.length ? 'Redeploy: ARVN Troops on LoCs and in Provinces without COIN Bases must move.' : 'Redeploy: move ARVN Troops or Police (optional).');
          for (const s of redeploySources(g, a, ['arvn_troops', 'arvn_police'])) p.piece(s.space, s.kind);
        } else {
          p.text(`Redeploy ${PIECE_NAME[a.sel.kind as PieceKind]} from ${nm(a.sel.space)}: choose the destination.`);
          p.select([a.sel.space]);
          const dests = a.sel.kind === 'arvn_police' ? arvnPoliceDests(g) : arvnTroopDests(g);
          for (const d of dests) if (d !== a.sel.space) p.space(d, nm(d));
          p.action('cancel', undefined, 'Cancel');
        }
        if (must.length === 0) p.action('done', undefined, 'Done redeploying');
        return;
      }
      case 'redeploy_nva':
        if (!a.sel) {
          p.text('Redeploy: choose an NVA Troop to move to an NVA Base.');
          for (const s of redeploySources(g, a, ['nva_troops'])) p.piece(s.space, s.kind);
        } else {
          p.text(`Redeploy NVA Troops from ${nm(a.sel.space)}: choose an NVA Base space.`);
          p.select([a.sel.space]);
          for (const d of nvaDests(g)) if (d !== a.sel.space) p.space(d, nm(d));
          p.action('cancel', undefined, 'Cancel');
        }
        p.action('done', undefined, 'Done redeploying');
        return;
      case 'commit_place':
        p.text(`Commitment: place ${a.toPlace} US Troop Casualt${a.toPlace === 1 ? 'y' : 'ies'} in COIN-Controlled spaces, LoCs or Saigon.`);
        for (const d of usCommitDests(g, 'us_troops')) p.space(d, nm(d));
        return;
      case 'commit_move': {
        const troopsLeft = 10 - a.placed - a.mvT;
        p.text(`Commitment: US may move up to ${Math.max(0, troopsLeft)} more Troops and ${2 - a.mvB} Bases.`);
        if (!a.sel) {
          for (const id of SPACE_IDS) for (const k of US_MAP_KINDS) {
            if (count(g, id, k) > 0 && lockOf(a, id, k) < count(g, id, k) && (k === 'us_troops' ? troopsLeft > 0 : a.mvB < 2)) p.piece(id, k);
          }
          if (g.available.us_troops > 0 && troopsLeft > 0) p.action('avail', 'us_troops', 'Take a US Troop from Available');
          if (g.available.us_base > 0 && a.mvB < 2) p.action('avail', 'us_base', 'Take a US Base from Available');
        } else {
          p.text(`Commitment: choose the destination for the ${PIECE_NAME[a.sel.kind as PieceKind]}.`);
          if (a.sel.space) p.action('to_avail', undefined, 'Return to Available', { space: a.sel.space });
          for (const d of usCommitDests(g, a.sel.kind)) if (d !== a.sel.space) p.space(d, nm(d));
          p.action('cancel', undefined, 'Cancel');
        }
        p.action('done', undefined, 'End Commitment');
        return;
      }
      case 'withdraw':
        p.text(`Withdrawal: VC may shift up to ${a.budget} Population 1 level toward Opposition.`);
        p.select(a.wdone);
        for (const id of withdrawCands(g, a)) p.space(id, nm(id));
        p.action('done', undefined, 'Done');
        return;
      default:
        p.text('Coup Round.');
        p.action('done', undefined, 'Continue');
    }
  },
  act(g, a, verb, arg) {
    const phase = a.phase as string;
    if (verb === 'cancel') { a.sel = null; return; }
    switch (phase) {
      case 'pacify_us':
      case 'pacify_arvn': {
        const f: 'US' | 'ARVN' = phase === 'pacify_us' ? 'US' : 'ARVN';
        if (verb === 'space') {
          pacifySpace(g, f, String(arg));
          a.sdone.push(String(arg));
          if (pacifyCands(g, f, a.sdone).length > 0) return;
        }
        a.actor = null;
        a.phase = f === 'US' ? 'pacify_arvn' : 'agitate';
        if (f === 'ARVN') a.adone = [];
        return advance(g, a);
      }
      case 'agitate':
        if (verb === 'space') {
          agitateSpace(g, String(arg));
          a.adone.push(String(arg));
          if (agitateCands(g, a.adone).length > 0) return;
        }
        a.actor = null;
        a.phase = 'redeploy_laos';
        return advance(g, a);
      case 'redeploy_arvn':
      case 'redeploy_nva':
        if (verb === 'done') {
          a.actor = null;
          a.sel = null;
          if (phase === 'redeploy_arvn') { a.phase = 'redeploy_nva'; a.lock = {}; return advance(g, a); }
          return advanceAfterNva(g, a);
        }
        if (verb === 'piece') {
          const [s, kind] = String(arg).split(':') as [string, PieceKind];
          a.sel = { space: s, kind };
          return;
        }
        {
          const d = String(arg);
          move(g, a.sel.space, d, a.sel.kind, 1);
          lockAdd(a, d, a.sel.kind);
          log(g, `Redeploy: ${PIECE_NAME[a.sel.kind as PieceKind]} ${nm(a.sel.space)} -> ${nm(d)}.`);
          a.sel = null;
        }
        return;
      case 'commit_place': {
        placeCasualty(g, String(arg));
        a.toPlace--; a.placed++;
        if (a.toPlace <= 0) { a.actor = null; a.phase = 'commit_move'; return advance(g, a); }
        return;
      }
      case 'commit_move': {
        if (verb === 'done') { a.actor = null; a.phase = 'withdraw'; return advance(g, a); }
        if (verb === 'piece') {
          const [s, kind] = String(arg).split(':') as [string, PieceKind];
          a.sel = { space: s, kind };
          return;
        }
        if (verb === 'avail') { a.sel = { space: null, kind: String(arg) }; return; }
        const kind = a.sel.kind as PieceKind;
        if (verb === 'to_avail') {
          removeTo(g, a.sel.space, kind, 1, 'available');
          a.withdrawn++;
        } else {
          const d = String(arg);
          if (a.sel.space) move(g, a.sel.space, d, kind, 1);
          else place(g, d, kind === 'us_base' ? 'us_base' : 'us_troops', 1);
          lockAdd(a, d, kind);
        }
        if (kind === 'us_base') a.mvB++; else a.mvT++;
        log(g, `Commitment: US ${PIECE_NAME[kind]} moved.`);
        a.sel = null;
        return;
      }
      case 'withdraw':
        if (verb === 'space') {
          shiftSupport(g, String(arg), -1);
          a.budget -= space(String(arg)).pop;
          a.wdone.push(String(arg));
          if (withdrawCands(g, a).length > 0) return;
        }
        a.actor = null;
        a.phase = 'reset';
        return advance(g, a);
      default:
        return advance(g, a);
    }
  },
});

// After the human NVA finishes (or skips) Redeploy: game end or Commitment.
function advanceAfterNva(g: Game, a: any): void {
  if (g.final_coup) {
    finalScoring(g);
    return pop(g, { done: true, over: true });
  }
  a.phase = 'commit_place';
  rotation(g, a);
  advance(g, a);
}
