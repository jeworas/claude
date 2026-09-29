// Coup Round (6.0): Victory, [RVN leader], Resources, Support, Redeploy, Commitment, Reset.
//
// State: 'coup' (args: none needed; reads g.current, g.final_coup, g.humans).
// Pops with { done: true, over?: boolean } when the round is complete, or after setting g.over.
//
// Automated phases: Victory, leader change, Resources, Laos/Cambodia removal, Reset.
// Decisions (only for factions in g.humans; bots skip discretionary steps or use a simple heuristic):
//   Support phase Pacification (US, else ARVN player), Agitation (VC), ARVN redeploy, NVA redeploy,
//   US Commitment moves.
//
// Rule deviations / guesses are listed in the report and marked "GUESS" below.

import { registerState, pop, log } from '../core/framework';
import type { Prompt } from '../core/framework';
import type { Faction, Game, PieceKind } from '../core/types';
import { FACTIONS } from '../core/types';
import { SPACE_IDS } from '../data/map';
import { CARD } from '../data/cards';
import {
  space, count, countFaction, control, addResources, addAid, addPatronage, setTrail, shiftSupport,
  move, flip, movePool, remove, place, victoryMargin, victoryScore, canHaveSupport, PIECE_NAME,
} from '../core/pieces';

// GUESS: tie-break order for equal margins (VC, ARVN, NVA, US).
const TIE_ORDER: Faction[] = ['VC', 'ARVN', 'NVA', 'US'];
const PACIFY_MAX_SPACES = 4;
const STEPS_PER_SPACE = 2;
const TERROR_MARKER_CAP = 15;

const nm = (id: string) => space(id).name;
const isHuman = (g: Game, f: Faction) => g.humans.includes(f);
const isLC = (id: string) => { const c = space(id).country; return c === 'laos' || c === 'cambodia'; };

// ---------------------------------------------------------------- victory (6.1, 7.3)

export function margins(g: Game): Record<Faction, number> {
  const m = {} as Record<Faction, number>;
  for (const f of FACTIONS) m[f] = victoryMargin(g, f);
  return m;
}

function rank(g: Game, among: Faction[]): Faction[] {
  const m = margins(g);
  return [...among].sort((a, b) => (m[b] - m[a]) || (TIE_ORDER.indexOf(a) - TIE_ORDER.indexOf(b)));
}

function summary(g: Game): string {
  const m = margins(g);
  return FACTIONS.map((f) => `${f} ${victoryScore(g, f)} (${m[f] >= 0 ? '+' : ''}${m[f]})`).join(', ');
}

// Returns true if the game ended.
export function victoryCheck(g: Game): boolean {
  const m = margins(g);
  if (g.final_coup) {
    const w = rank(g, [...FACTIONS])[0];
    g.over = true;
    g.result = `Final Coup Round: ${w} wins with the highest victory margin. ${summary(g)}`;
    log(g, g.result);
    return true;
  }
  const over = FACTIONS.filter((f) => m[f] > 0);
  if (over.length === 0) return false;
  const w = rank(g, over)[0];
  g.over = true;
  g.result = `${w} wins at the Coup Round victory check. ${summary(g)}`;
  log(g, g.result);
  return true;
}

// ---------------------------------------------------------------- RVN leader (card on the Coup card)

function leaderPhase(g: Game): void {
  const card = g.current !== null ? CARD[g.current] : undefined;
  if (!card) return;
  if (card.leader) {
    if (g.leader !== null && g.leader !== card.id) g.leader_box.push(g.leader);
    g.leader = card.id;
    log(g, `New RVN leader: ${card.title}.`);
  } else if (card.title === 'Failed Attempt') {
    // GUESS: desertion of 1 in 5 ARVN cubes on the map (rounded down), most crowded spaces first; Patronage -2.
    let total = 0;
    for (const id of SPACE_IDS) total += count(g, id, 'arvn_troops', 'arvn_police');
    let n = Math.floor(total / 5);
    const spaces = SPACE_IDS.filter((id) => count(g, id, 'arvn_troops', 'arvn_police') > 0)
      .sort((a, b) => count(g, b, 'arvn_troops', 'arvn_police') - count(g, a, 'arvn_troops', 'arvn_police'));
    while (n > 0 && spaces.length) {
      for (const id of spaces) {
        if (n <= 0) break;
        const k: PieceKind = count(g, id, 'arvn_troops') > 0 ? 'arvn_troops' : 'arvn_police';
        if (count(g, id, k) > 0) { remove(g, id, k, 1); n--; }
      }
      for (let i = spaces.length - 1; i >= 0; i--) if (count(g, spaces[i], 'arvn_troops', 'arvn_police') === 0) spaces.splice(i, 1);
    }
    addPatronage(g, -2);
    log(g, `Failed Attempt: ARVN desertion (${Math.floor(total / 5)} cubes), Patronage -2.`);
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
  // Sabotage: LoCs with more Insurgent Guerrillas than COIN pieces (GUESS: highest Econ first, marker cap 15).
  const locs = SPACE_IDS.filter((id) => {
    const s = space(id);
    if (s.type !== 'loc' || s.econ <= 0 || g.spaces[id].terror > 0) return false;
    const guer = count(g, id, 'nva_guer_u', 'nva_guer_a', 'vc_guer_u', 'vc_guer_a');
    const coin = countFaction(g, id, 'US') + countFaction(g, id, 'ARVN');
    return guer > coin;
  }).sort((a, b) => space(b).econ - space(a).econ);
  for (const id of locs) {
    if (totalMarkers(g) >= TERROR_MARKER_CAP) break;
    g.spaces[id].terror = 1;
    log(g, `Insurgents sabotage ${nm(id)}.`);
  }
  // Trail degrade (GUESS): -1 if COIN controls any Laos/Cambodia space.
  if (g.trail > 0 && SPACE_IDS.some((id) => isLC(id) && space(id).type !== 'loc' && control(g, id) === 'COIN')) {
    setTrail(g, g.trail - 1);
    log(g, `COIN Control in Laos/Cambodia degrades the Trail to ${g.trail}.`);
  }
  // Earnings.
  g.econ = computeEcon(g);
  const arvn = g.aid + g.econ;
  addResources(g, 'ARVN', arvn);
  let vcBases = 0, nvaBases = 0;
  for (const id of SPACE_IDS) {
    const c = space(id).country;
    if (c === 'south_vietnam') vcBases += count(g, id, 'vc_base', 'vc_tunnel');
    if (c === 'laos' || c === 'cambodia') nvaBases += count(g, id, 'nva_base', 'nva_tunnel');
  }
  const nva = nvaBases + 2 * g.trail;
  addResources(g, 'VC', vcBases);
  addResources(g, 'NVA', nva);
  log(g, `Resources: ARVN +${arvn} (Aid ${g.aid} + Econ ${g.econ}), VC +${vcBases}, NVA +${nva}.`);
  // US casualties reduce Aid (GUESS: 1 per piece in the Casualties box).
  const cas = g.casualties.us_troops + g.casualties.us_base + g.casualties.us_irreg;
  if (cas > 0) { addAid(g, -cas); log(g, `US Casualties (${cas}) reduce Aid to ${g.aid}.`); }
}

// ---------------------------------------------------------------- support (6.3)

const pacifyCost = (g: Game) => (g.leader === 127 ? 4 : 3); // Nguyen Cao Ky

export function pacifyCands(g: Game, done: string[]): string[] {
  if (done.length >= PACIFY_MAX_SPACES || g.resources.ARVN < pacifyCost(g)) return [];
  return SPACE_IDS.filter((id) => {
    if (done.includes(id) || space(id).type === 'loc') return false;
    if (control(g, id) !== 'COIN') return false;
    if (count(g, id, 'us_troops', 'arvn_troops') === 0 || count(g, id, 'arvn_police') === 0) return false;
    const st = g.spaces[id];
    return st.terror > 0 || (canHaveSupport(id) && st.support < 2);
  });
}

function pacifySpace(g: Game, id: string): void {
  const st = g.spaces[id];
  const cost = pacifyCost(g);
  let steps = 0;
  while (steps < STEPS_PER_SPACE && g.resources.ARVN >= cost) {
    if (st.terror > 0) st.terror = 0;
    else if (canHaveSupport(id) && st.support < 2) shiftSupport(g, id, 1);
    else break;
    addResources(g, 'ARVN', -cost);
    steps++;
  }
  log(g, `Pacification in ${nm(id)} (${steps} step(s)).`);
}

export function agitateCands(g: Game, done: string[]): string[] {
  if (done.length >= PACIFY_MAX_SPACES || g.resources.VC < 1) return [];
  return SPACE_IDS.filter((id) => {
    if (done.includes(id) || space(id).type === 'loc') return false;
    if (count(g, id, 'vc_guer_u', 'vc_guer_a') === 0 || control(g, id) === 'COIN') return false;
    const st = g.spaces[id];
    return st.terror > 0 || (canHaveSupport(id) && st.support > -2);
  });
}

function agitateSpace(g: Game, id: string): void {
  const st = g.spaces[id];
  let steps = 0;
  while (steps < STEPS_PER_SPACE && g.resources.VC >= 1) {
    if (st.terror > 0) st.terror = 0;
    else if (canHaveSupport(id) && st.support > -2) shiftSupport(g, id, -1);
    else break;
    addResources(g, 'VC', -1);
    steps++;
  }
  log(g, `VC Agitation in ${nm(id)} (${steps} step(s)).`);
}

function autoPick(cands: string[]): string[] {
  return [...cands].sort((a, b) => space(b).pop - space(a).pop);
}

// ---------------------------------------------------------------- redeploy (6.4)

function laosCambodiaRemoval(g: Game): void {
  let n = 0;
  const kinds: PieceKind[] = ['us_troops', 'us_irreg_u', 'us_irreg_a', 'arvn_troops', 'arvn_police', 'arvn_ranger_u', 'arvn_ranger_a'];
  for (const id of SPACE_IDS) {
    if (!isLC(id) || space(id).type === 'loc') continue;
    for (const k of kinds) {
      const c = count(g, id, k);
      if (c > 0) { n += c; removeToAvailable(g, id, k, c); }
    }
  }
  if (n > 0) log(g, `Redeploy: ${n} COIN piece(s) leave Laos/Cambodia for Available.`);
}

function removeToAvailable(g: Game, id: string, k: PieceKind, c: number): void {
  // US pieces from Laos/Cambodia go to Available (not Casualties): use removeTo semantics via pool bookkeeping.
  const p = g.spaces[id].pieces;
  const v = (p[k] ?? 0) - c;
  if (v <= 0) delete p[k]; else p[k] = v;
  const pool = k.startsWith('us_') ? (k === 'us_troops' ? 'us_troops' : 'us_irreg')
    : k === 'arvn_troops' ? 'arvn_troops' : k === 'arvn_police' ? 'arvn_police' : 'arvn_ranger';
  g.available[pool] += c;
}

const ARVN_MOVERS: PieceKind[] = ['arvn_troops', 'arvn_police'];

function arvnDests(g: Game, k: PieceKind): string[] {
  return SPACE_IDS.filter((id) => {
    const s = space(id);
    if (s.type === 'loc' || isLC(id) || s.country === 'north_vietnam') return false;
    if (k === 'arvn_police') return control(g, id) === 'COIN';
    return id === 'saigon' || count(g, id, 'arvn_base') > 0 || (s.type === 'city' && control(g, id) === 'COIN');
  });
}

function nvaDests(g: Game): string[] {
  return SPACE_IDS.filter((id) => count(g, id, 'nva_base', 'nva_tunnel') > 0);
}

const lockOf = (a: any, id: string, k: PieceKind): number => a.lock?.[id]?.[k] ?? 0;
function lockAdd(a: any, id: string, k: PieceKind, n = 1): void {
  a.lock = a.lock ?? {};
  a.lock[id] = a.lock[id] ?? {};
  a.lock[id][k] = (a.lock[id][k] ?? 0) + n;
}
const mv = (g: Game, a: any, id: string, k: PieceKind) => count(g, id, k) - lockOf(a, id, k);

function redeploySources(g: Game, a: any, kinds: PieceKind[]): { space: string; kind: PieceKind }[] {
  const out: { space: string; kind: PieceKind }[] = [];
  for (const id of SPACE_IDS) for (const k of kinds) if (mv(g, a, id, k) > 0) out.push({ space: id, kind: k });
  return out;
}

// ---------------------------------------------------------------- commitment (6.5)

function commitmentCasualties(g: Game): void {
  // GUESS: half (rounded down) of US Troop casualties go Out of Play, the rest (and Bases, Irregulars) to Available.
  const t = g.casualties.us_troops;
  const oop = Math.floor(t / 2);
  movePool(g, 'us_troops', 'casualties', 'out_of_play', oop);
  movePool(g, 'us_troops', 'casualties', 'available', t - oop);
  movePool(g, 'us_base', 'casualties', 'available', g.casualties.us_base);
  movePool(g, 'us_irreg', 'casualties', 'available', g.casualties.us_irreg);
  if (t > 0) log(g, `Commitment: ${oop} US Troops Out of Play, ${t - oop} back to Available.`);
}

const US_MOVERS: PieceKind[] = ['us_troops', 'us_irreg_u', 'us_irreg_a'];
const US_MOVE_MAX = 10;

function usDests(): string[] {
  return SPACE_IDS.filter((id) => space(id).country === 'south_vietnam');
}

// ---------------------------------------------------------------- reset (6.6)

function resetPhase(g: Game): void {
  if (g.trail === 0) setTrail(g, 1);
  else if (g.trail === 4) setTrail(g, 3);
  const flips: [PieceKind, PieceKind][] = [
    ['nva_guer_a', 'nva_guer_u'], ['vc_guer_a', 'vc_guer_u'], ['us_irreg_a', 'us_irreg_u'], ['arvn_ranger_a', 'arvn_ranger_u'],
  ];
  for (const id of SPACE_IDS) {
    g.spaces[id].terror = 0;
    for (const [a, u] of flips) flip(g, id, a, u, count(g, id, a));
  }
  g.momentum = [];
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

function pacifyActor(g: Game): Faction | null {
  if (isHuman(g, 'US')) return 'US';
  if (isHuman(g, 'ARVN')) return 'ARVN';
  return null;
}

function advance(g: Game, a: any): void {
  for (;;) {
    switch (a.phase) {
      case 'start':
        if (victoryCheck(g)) return pop(g, { done: true, over: true });
        a.phase = 'leader';
        break;
      case 'leader':
        leaderPhase(g);
        a.phase = 'resources';
        break;
      case 'resources':
        resourcesPhase(g);
        a.phase = 'pacify';
        a.sdone = [];
        break;
      case 'pacify': {
        const actor = pacifyActor(g);
        if (!actor) {
          for (const id of autoPick(pacifyCands(g, a.sdone))) {
            if (a.sdone.length >= PACIFY_MAX_SPACES || g.resources.ARVN < pacifyCost(g)) break;
            pacifySpace(g, id);
            a.sdone.push(id);
          }
        } else if (pacifyCands(g, a.sdone).length > 0) {
          a.actor = actor;
          return;
        }
        a.phase = 'agitate';
        a.sdone = [];
        break;
      }
      case 'agitate':
        if (!isHuman(g, 'VC')) {
          for (const id of autoPick(agitateCands(g, a.sdone))) {
            if (a.sdone.length >= PACIFY_MAX_SPACES || g.resources.VC < 1) break;
            agitateSpace(g, id);
            a.sdone.push(id);
          }
        } else if (agitateCands(g, a.sdone).length > 0) {
          a.actor = 'VC';
          return;
        }
        a.phase = 'redeploy_laos';
        break;
      case 'redeploy_laos':
        laosCambodiaRemoval(g);
        a.phase = 'redeploy_arvn';
        a.lock = {};
        a.sel = null;
        break;
      case 'redeploy_arvn':
        if (isHuman(g, 'ARVN') && redeploySources(g, a, ARVN_MOVERS).length > 0) { a.actor = 'ARVN'; return; }
        a.phase = 'redeploy_nva';
        a.lock = {};
        a.sel = null;
        break;
      case 'redeploy_nva':
        if (isHuman(g, 'NVA') && nvaDests(g).length > 0 && redeploySources(g, a, ['nva_troops']).length > 0) { a.actor = 'NVA'; return; }
        a.phase = 'commit';
        a.sel = null;
        a.moved = 0;
        commitmentCasualties(g);
        break;
      case 'commit':
        if (isHuman(g, 'US')) { a.actor = 'US'; return; }
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

function actorOf(g: Game, a: any): Faction | null {
  return a.actor ?? g.active;
}

registerState('coup', {
  faction: (g, a) => actorOf(g, a),
  enter(g, a) {
    a.phase = 'start';
    a.sdone = [];
    a.lock = {};
    a.sel = null;
    advance(g, a);
  },
  prompt(g, a, p: Prompt) {
    switch (a.phase) {
      case 'pacify':
        p.text(`Support Phase: Pacification (${a.sdone.length}/${PACIFY_MAX_SPACES} spaces, ARVN Resources ${g.resources.ARVN}).`);
        p.select(a.sdone);
        for (const id of pacifyCands(g, a.sdone)) p.space(id, nm(id));
        p.action('done', undefined, 'Done pacifying');
        return;
      case 'agitate':
        p.text(`Support Phase: Agitation (${a.sdone.length}/${PACIFY_MAX_SPACES} spaces, VC Resources ${g.resources.VC}).`);
        p.select(a.sdone);
        for (const id of agitateCands(g, a.sdone)) p.space(id, nm(id));
        p.action('done', undefined, 'Done agitating');
        return;
      case 'redeploy_arvn':
      case 'redeploy_nva': {
        const kinds: PieceKind[] = a.phase === 'redeploy_arvn' ? ARVN_MOVERS : ['nva_troops'];
        if (!a.sel) {
          p.text(a.phase === 'redeploy_arvn' ? 'Redeploy: choose an ARVN Troop/Police to move.' : 'Redeploy: choose an NVA Troop to move.');
          for (const s of redeploySources(g, a, kinds)) p.piece(s.space, s.kind);
        } else {
          p.text(`Redeploy ${PIECE_NAME[a.sel.kind as PieceKind]} from ${nm(a.sel.space)}: choose the destination.`);
          p.select([a.sel.space]);
          const dests = a.phase === 'redeploy_arvn' ? arvnDests(g, a.sel.kind) : nvaDests(g);
          for (const d of dests) if (d !== a.sel.space) p.space(d, nm(d));
          p.action('cancel', undefined, 'Cancel');
        }
        p.action('done', undefined, 'Done redeploying');
        return;
      }
      case 'commit':
        p.text(`Commitment: US may move up to ${US_MOVE_MAX} pieces (${a.moved} moved).`);
        if (!a.sel) {
          if (a.moved < US_MOVE_MAX) {
            for (const id of SPACE_IDS) for (const k of US_MOVERS) if (mv(g, a, id, k) > 0) p.piece(id, k);
            if (g.available.us_troops > 0) p.action('avail', 'us_troops', 'Take a US Troop from Available');
          }
        } else {
          p.text(`Commitment: choose the destination for the ${a.sel.space ? PIECE_NAME[a.sel.kind as PieceKind] : 'US Troop from Available'}.`);
          for (const d of usDests()) if (d !== a.sel.space) p.space(d, nm(d));
          p.action('cancel', undefined, 'Cancel');
        }
        p.action('done', undefined, 'End Commitment');
        return;
      default:
        p.text('Coup Round.');
        p.action('done', undefined, 'Continue');
    }
  },
  act(g, a, verb, arg) {
    const phase = a.phase as string;
    if (verb === 'done') {
      if (phase === 'pacify' || phase === 'agitate') { a.sdone = []; a.phase = phase === 'pacify' ? 'agitate' : 'redeploy_laos'; }
      else if (phase === 'redeploy_arvn') { a.phase = 'redeploy_nva'; a.lock = {}; a.sel = null; }
      else if (phase === 'redeploy_nva') { a.phase = 'commit'; a.sel = null; a.moved = 0; commitmentCasualties(g); }
      else if (phase === 'commit') a.phase = 'reset';
      a.actor = null;
      return advance(g, a);
    }
    if (verb === 'cancel') { a.sel = null; return; }
    if (phase === 'pacify') {
      const id = String(arg);
      pacifySpace(g, id);
      a.sdone.push(id);
      if (pacifyCands(g, a.sdone).length === 0) { a.sdone = []; a.phase = 'agitate'; a.actor = null; advance(g, a); }
      return;
    }
    if (phase === 'agitate') {
      const id = String(arg);
      agitateSpace(g, id);
      a.sdone.push(id);
      if (agitateCands(g, a.sdone).length === 0) { a.sdone = []; a.phase = 'redeploy_laos'; a.actor = null; advance(g, a); }
      return;
    }
    if (phase === 'redeploy_arvn' || phase === 'redeploy_nva') {
      if (verb === 'piece') {
        const [space, kind] = String(arg).split(':') as [string, PieceKind];
        a.sel = { space, kind };
        return;
      }
      const d = String(arg);
      move(g, a.sel.space, d, a.sel.kind, 1);
      lockAdd(a, d, a.sel.kind);
      log(g, `Redeploy: ${PIECE_NAME[a.sel.kind as PieceKind]} ${nm(a.sel.space)} -> ${nm(d)}.`);
      a.sel = null;
      return;
    }
    if (phase === 'commit') {
      if (verb === 'piece') {
        const [space, kind] = String(arg).split(':') as [string, PieceKind];
        a.sel = { space, kind };
        return;
      }
      if (verb === 'avail') { a.sel = { space: null, kind: 'us_troops' }; return; }
      const d = String(arg);
      if (a.sel.space) move(g, a.sel.space, d, a.sel.kind, 1);
      else place(g, d, 'us_troops', 1);
      lockAdd(a, d, a.sel.kind);
      a.moved++;
      log(g, `Commitment: US piece to ${nm(d)}.`);
      a.sel = null;
      if (a.moved >= US_MOVE_MAX) { a.phase = 'reset'; a.actor = null; advance(g, a); }
    }
  },
});
