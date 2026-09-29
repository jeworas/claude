import { describe, it, expect } from 'vitest';
import { newGame, getView, doAction, currentFaction } from '../src/engine';
import type { Game } from '../src/core/types';
import { top, push } from '../src/core/framework';
import { SPACE_IDS } from '../src/data/map';

// Tiny seeded PRNG for choosing actions.
function rng(seed: number) {
  let t = seed | 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const SNAKE = /\b[a-z0-9]+(?:_[a-z0-9]+)+\b/;
const OTHER = /^(op_(rally|march|attack|terror)|sa_(infiltrate|bombard|ambush|tax|subvert)|coup|event|pivotal|ev_.*|ins_.*|.*_event.*)$/;
const ownIssues = new Set<string>();
const otherIssues = new Set<string>();
const visited = new Set<string>();

function checkView(g: Game, where: string) {
  const v = getView(g);
  const st = top(g)?.state ?? '?';
  const sink = OTHER.test(st) ? otherIssues : ownIssues;
  const bad = (msg: string) => sink.add(`[${st}] ${msg} (prompt "${v.prompt}")`);
  if (v.prompt.trim().length === 0) bad('empty prompt');
  if (/undefined|NaN|\[object/.test(v.prompt)) bad('bad prompt text');
  const real = v.actions.filter((a) => a.verb !== 'undo');
  if (real.length === 0) bad(`no non-undo action at ${where}`);
  for (const a of v.actions) {
    if (!a.label) bad(`missing label ${a.verb}:${a.arg}`);
    else if (/undefined|NaN|\[object/.test(a.label)) bad(`bad label "${a.label}"`);
    else if (SNAKE.test(a.label)) bad(`raw id in label "${a.label}"`);
  }
  return v;
}

function play(seed: number, cards: number): { cards: number; steps: number; states: Set<string> } {
  const g = newGame('short', ['US', 'ARVN'], seed);
  const rand = rng(seed * 7919 + 1);
  const seen = new Set<string>();
  let cardsPlayed = 0;
  let last = g.current;
  let steps = 0;
  while (!g.over && cardsPlayed < cards && steps < 6000) {
    steps++;
    const v = checkView(g, `seed ${seed} step ${steps}`);
    seen.add(top(g)!.state);
    visited.add(top(g)!.state);
    expect(currentFaction(g)).not.toBeNull();
    const opts = v.actions.filter((a) => a.verb !== 'undo');
    if (opts.length === 0) break; // dead end, already recorded
    // Prefer finishing verbs a little so that random play makes progress.
    const fin = opts.filter((a) => ['done', 'next', 'pass', 'decline', 'skip'].includes(a.verb));
    const pick = fin.length && rand() < 0.35 ? fin[Math.floor(rand() * fin.length)] : opts[Math.floor(rand() * opts.length)];
    doAction(g, pick.verb, pick.arg);
    if (g.current !== last) { cardsPlayed++; last = g.current; }
  }
  return { cards: cardsPlayed, steps, states: seen };
}

describe('human flow through the engine', () => {
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
    it(`random legal play, seed ${seed}`, () => {
      const r = play(seed, 12);
      expect(r.cards).toBeGreaterThanOrEqual(6);
    });
  }
  it('Agent B states: prompts, labels, no dead ends', () => {
    expect([...ownIssues]).toEqual([]);
  });
  it('reports issues in other agents\' states (informational)', () => {
    const byState = new Map<string, string>();
    let n = 0;
    for (const m of otherIssues) { const k = m.replace(/"[^"]*"/g, '"..."').replace(/ \(prompt.*$/, ''); n++; if (!byState.has(k)) byState.set(k, m); }
    if (byState.size) console.warn(`Issues in other agents' states (${n} total, one sample each):\n` + [...byState.values()].join('\n'));
    console.warn('States visited: ' + [...visited].sort().join(', '));
    expect(true).toBe(true);
  });
});

describe('every US/ARVN state driven in a crowded position', () => {
  const cases: [string, any][] = [
    ['op_train', { faction: 'US' }], ['op_train', { faction: 'ARVN' }],
    ['op_patrol', { faction: 'US' }], ['op_patrol', { faction: 'ARVN' }],
    ['op_sweep', { faction: 'US' }], ['op_sweep', { faction: 'ARVN' }],
    ['op_assault', { faction: 'US' }], ['op_assault', { faction: 'ARVN' }],
    ['sa_advise', { faction: 'US' }], ['sa_air_lift', { faction: 'US' }], ['sa_air_strike', { faction: 'US' }],
    ['sa_govern', { faction: 'ARVN' }], ['sa_transport', { faction: 'ARVN' }], ['sa_raid', { faction: 'ARVN' }],
    ['op_menu', { faction: 'US', limited: false, sa: true, free: false }],
    ['op_menu', { faction: 'ARVN', limited: true, sa: false, free: false }],
  ];
  for (const [state, args] of cases) {
    for (const seed of [1, 2, 3]) {
      it(`${state} ${args.faction} seed ${seed}`, () => {
        const g = newGame('short', ['US', 'ARVN'], seed);
        const rand = rng(seed * 31 + 5);
        for (const id of SPACE_IDS) {
          const pc = g.spaces[id].pieces;
          if (rand() < 0.8) { pc.us_troops = 2; pc.arvn_troops = 2; pc.arvn_police = 2; pc.arvn_ranger_u = 1; pc.us_irreg_u = 1; }
          if (rand() < 0.7) { pc.vc_guer_u = 2; pc.vc_guer_a = 1; pc.nva_troops = 1; if (rand() < 0.5) pc.vc_base = 1; }
          g.spaces[id].support = 1;
        }
        g.stack = [];
        g.resources.ARVN = 40;
        push(g, state, { ...args });
        let steps = 0;
        while (g.stack.length > 0 && steps++ < 400) {
          const v = checkView(g, `${state} step ${steps}`);
          const opts = v.actions.filter((a) => a.verb !== 'undo');
          if (!opts.length) break;
          const fin = opts.filter((a) => ['done', 'next', 'skip'].includes(a.verb));
          const pick = fin.length && rand() < 0.3 ? fin[Math.floor(rand() * fin.length)] : opts[Math.floor(rand() * opts.length)];
          doAction(g, pick.verb, pick.arg);
        }
        expect(g.stack.length, `${state} did not finish`).toBe(0);
        expect([...ownIssues]).toEqual([]);
      });
    }
  }
});
