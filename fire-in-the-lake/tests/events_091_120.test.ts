import { describe, expect, it } from 'vitest';
import type { Game, PoolKind } from '../src/core/types';
import { POOL_KINDS, PIECE_TOTALS } from '../src/core/types';
import { doAction, getView, push } from '../src/core/framework';
import { SPACE_IDS } from '../src/data/map';
import { eventPlayable } from '../src/engine/events';
import '../src/engine/coup';
import { leaderEffect } from '../src/engine/coup';

function mk(): Game {
  const zeros = () => Object.fromEntries(POOL_KINDS.map((k) => [k, 0])) as Record<PoolKind, number>;
  const g = {
    version: 1, seed: 3, scenario: 'test', humans: ['US', 'ARVN', 'NVA', 'VC'], log: [], stack: [], active: 'VC', over: false, result: null,
    spaces: Object.fromEntries(SPACE_IDS.map((id) => [id, { pieces: {}, support: 0, terror: 0 }])),
    available: zeros(), casualties: zeros(), out_of_play: zeros(),
    resources: { ARVN: 30, NVA: 20, VC: 15 }, aid: 20, patronage: 15, econ: 10, trail: 2,
    deck: [], current: null, next: null, discard: [], coup_count: 0, final_coup: false,
    eligible: { US: true, ARVN: true, NVA: true, VC: true }, next_ineligible: [], next_eligible: [],
    first_faction: null, first_action: null, acted: [],
    capabilities: {}, momentum: [], leader: null, leader_box: [], pivotal_played: [], pivotal_available: [],
    undo: [], tmp: {},
  } as unknown as Game;
  for (const k of POOL_KINDS) g.available[k] = PIECE_TOTALS[k];
  return g;
}
const put = (g: Game, id: string, k: string, n = 1) => { (g.spaces[id].pieces as any)[k] = ((g.spaces[id].pieces as any)[k] ?? 0) + n; };
const n = (g: Game, id: string, k: string) => (g.spaces[id].pieces as any)[k] ?? 0;
function play(g: Game, card: number, shaded: boolean, faction: 'US' | 'ARVN' | 'NVA' | 'VC' = 'VC', script: [string, (string | number)?][] = []): void {
  g.active = faction;
  push(g, 'event', { card, shaded, faction });
  let steps = 0;
  const q = [...script];
  while (g.stack.length > 0 && steps++ < 200) {
    const acts = getView(g).actions.filter((a) => a.verb !== 'undo');
    const want = q[0];
    const hit = want && acts.find((a) => a.verb === want[0] && (want[1] === undefined || a.arg === want[1]));
    if (hit) { q.shift(); doAction(g, hit.verb, hit.arg); continue; }
    const pick = acts.find((a) => a.verb === 'done') ?? acts[0];
    doAction(g, pick.verb, pick.arg);
  }
}

describe('events 91-120 (playbook text)', () => {
  it('107 Burning Bonze: Patronage +3, or +6 if Saigon is at Active Support; shaded shifts Saigon and Aid -12', () => {
    const g = mk();
    play(g, 107, false, 'ARVN');
    expect(g.patronage).toBe(18);
    const h = mk();
    h.spaces.saigon.support = 2;
    play(h, 107, false, 'ARVN');
    expect(h.patronage).toBe(21);
    const k = mk();
    k.spaces.saigon.support = 1;
    play(k, 107, true, 'VC');
    expect(k.spaces.saigon.support).toBe(0);
    expect(k.aid).toBe(8);
  });
  it('108 Draft Dodgers: only with fewer than 3 Casualty pieces; shaded moves 1 Troop per Casualty piece (max 3)', () => {
    const g = mk();
    g.out_of_play.us_troops = 5;
    g.casualties.us_troops = 2;
    play(g, 108, false, 'ARVN');
    expect(g.out_of_play.us_troops).toBe(2);
    const h = mk();
    h.out_of_play.us_troops = 5;
    h.casualties.us_troops = 3;
    play(h, 108, false, 'ARVN');
    expect(h.out_of_play.us_troops).toBe(5);
    const k = mk();
    k.casualties.us_troops = 2;
    k.casualties.us_base = 1;
    const before = k.available.us_troops;
    play(k, 108, true, 'VC');
    expect(k.out_of_play.us_troops).toBe(3);
    expect(k.available.us_troops).toBe(before - 3);
  });
  it('109 Nguyen Huu Tho: each City with VC shifts toward Support; shaded places a Base and Guerrilla in Saigon and stays Eligible', () => {
    const g = mk();
    put(g, 'hue', 'vc_guer_u');
    g.spaces.hue.support = -1;
    play(g, 109, false, 'ARVN');
    expect(g.spaces.hue.support).toBe(0);
    const h = mk();
    play(h, 109, true, 'VC');
    expect(n(h, 'saigon', 'vc_base')).toBe(1);
    expect(n(h, 'saigon', 'vc_guer_u')).toBe(1);
    expect(h.next_eligible).toContain('VC');
  });
  it('110 No Contact: shaded flips all VC and NVA Guerrillas Underground', () => {
    const g = mk();
    put(g, 'tay_ninh', 'vc_guer_a', 2);
    put(g, 'central_laos', 'nva_guer_a', 1);
    play(g, 110, true, 'VC');
    expect(n(g, 'tay_ninh', 'vc_guer_u')).toBe(2);
    expect(n(g, 'central_laos', 'nva_guer_u')).toBe(1);
  });
  it('111 Agent Orange shaded shifts each Jungle/Highland Province with Insurgents toward Active Opposition', () => {
    const g = mk();
    put(g, 'quang_nam', 'vc_guer_u'); // Highland, pop 1
    put(g, 'phuoc_long', 'vc_guer_u'); // Jungle, pop 0: no shift
    play(g, 111, true, 'VC');
    expect(g.spaces.quang_nam.support).toBe(-1);
    expect(g.spaces.phuoc_long.support).toBe(0);
  });
  it('115 Typhoon Kate: stay Eligible and momentum; no shaded side', () => {
    const g = mk();
    play(g, 115, false, 'VC');
    expect(g.momentum).toContain(115);
    expect(g.next_eligible).toContain('VC');
    expect(eventPlayable(g, 115, true)).toBe(false);
  });
  it('94 Tunnel Rats has no shaded side; unshaded can place Tunnel markers', () => {
    const g = mk();
    put(g, 'tay_ninh', 'vc_base');
    put(g, 'kien_phong', 'vc_base');
    expect(eventPlayable(g, 94, true)).toBe(false);
    play(g, 94, false, 'US', [['choose', 0], ['space', 'tay_ninh'], ['space', 'kien_phong']]);
    expect(n(g, 'tay_ninh', 'vc_tunnel')).toBe(1);
    expect(n(g, 'kien_phong', 'vc_tunnel')).toBe(1);
  });
  it('97 Brinks Hotel: Aid +10 and the current leader card is flipped (its text is ignored)', () => {
    const g = mk();
    g.leader = 127;
    expect(leaderEffect(g).pacifyCost).toBe(4);
    play(g, 97, false, 'US', [['choose', 0]]);
    expect(g.aid).toBe(30);
    expect(leaderEffect(g).pacifyCost).toBe(3);
  });
  it('103 Kent State shaded: 3 Troop Casualties out of play, Aid -6, US Ineligible', () => {
    const g = mk();
    g.casualties.us_troops = 4;
    play(g, 103, true, 'VC');
    expect(g.out_of_play.us_troops).toBe(3);
    expect(g.casualties.us_troops).toBe(1);
    expect(g.aid).toBe(14);
    expect(g.next_ineligible).toContain('US');
  });
  it('119 My Lai: unshaded 2 Available Troops out of play and Patronage +2; shaded sets a Province to Active Opposition', () => {
    const g = mk();
    play(g, 119, false, 'US');
    expect(g.out_of_play.us_troops).toBe(2);
    expect(g.patronage).toBe(17);
    const h = mk();
    put(h, 'binh_dinh', 'us_troops', 2);
    play(h, 119, true, 'VC', [['space', 'binh_dinh']]);
    expect(h.spaces.binh_dinh.support).toBe(-2);
    expect(n(h, 'binh_dinh', 'vc_base')).toBe(1);
    expect(n(h, 'binh_dinh', 'vc_guer_u')).toBe(1);
    expect(h.aid).toBe(14);
  });
  it('120 US Press Corps: shaded moves Base casualties and up to (cards in leader box) Troop casualties out of play', () => {
    const g = mk();
    g.leader = 125; g.leader_box = [129];
    g.casualties.us_troops = 5;
    g.casualties.us_base = 1;
    play(g, 120, true, 'VC');
    expect(g.out_of_play.us_troops).toBe(2);
    expect(g.out_of_play.us_base).toBe(1);
  });
  it('93 Senator Fulbright shaded: Available Base out of play, Aid -9', () => {
    const g = mk();
    play(g, 93, true, 'VC');
    expect(g.out_of_play.us_base).toBe(1);
    expect(g.aid).toBe(11);
  });
});
