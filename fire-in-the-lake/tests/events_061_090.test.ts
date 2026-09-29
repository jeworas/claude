import { describe, expect, it } from 'vitest';
import type { Game, PoolKind } from '../src/core/types';
import { POOL_KINDS, PIECE_TOTALS } from '../src/core/types';
import { doAction, getView, push } from '../src/core/framework';
import { SPACE_IDS } from '../src/data/map';
import { eventPlayable } from '../src/engine/events';
import '../src/engine/coup';
import '../src/engine/coin_ops';
import '../src/engine/insurgent_ops';
import '../src/engine/opmenu';

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


describe('events 61-90 (playbook text)', () => {
  it('63 Fact Finding: Aid +6 and a die roll of Patronage to ARVN Resources; shaded removes Support and Patronage +4', () => {
    const g = mk();
    play(g, 63, false, 'US', [['choose', 1]]);
    expect(g.aid).toBe(26);
    expect(g.patronage + g.resources.ARVN).toBe(15 + 30);
    expect(g.patronage).toBeLessThan(15);
    const h = mk();
    put(h, 'hue', 'arvn_troops', 3); h.spaces.hue.support = 1;
    play(h, 63, true, 'VC', [['space', 'hue'], ['choose', 0]]);
    expect(h.spaces.hue.support).toBe(0);
    expect(h.patronage).toBe(19);
  });
  it('66 Ambassador Taylor shaded: Support removed from 3 spaces outside Saigon, Patronage -3', () => {
    const g = mk();
    for (const id of ['hue', 'da_nang', 'kontum', 'saigon']) g.spaces[id].support = 1;
    play(g, 66, true, 'VC', [['space', 'hue'], ['space', 'da_nang'], ['space', 'kontum']]);
    expect(['hue', 'da_nang', 'kontum'].every((id) => g.spaces[id].support === 0)).toBe(true);
    expect(g.spaces.saigon.support).toBe(1);
    expect(g.patronage).toBe(12);
  });
  it('71 An Loc: removes all NVA Troops and places 3 ARVN Troops in a space with ARVN', () => {
    const g = mk();
    put(g, 'an_loc', 'arvn_police', 1); put(g, 'an_loc', 'nva_troops', 4);
    play(g, 71, false, 'ARVN', [['space', 'an_loc']]);
    expect(n(g, 'an_loc', 'nva_troops')).toBe(0);
    expect(n(g, 'an_loc', 'arvn_troops')).toBe(3);
  });
  it('72 Body Count: momentum unshaded; shaded places VC Guerrillas in Active Opposition spaces and 2 NVA Troops in Laos/Cambodia', () => {
    const g = mk();
    play(g, 72, false, 'ARVN');
    expect(g.momentum).toContain(72);
    const h = mk();
    h.spaces.hue.support = -2;
    play(h, 72, true, 'NVA');
    expect(n(h, 'hue', 'vc_guer_u')).toBe(1);
    expect(n(h, 'central_laos', 'nva_troops')).toBe(2);
    expect(n(h, 'sihanoukville', 'nva_troops')).toBe(2);
  });
  it('76 Annam: -1 NVA and VC Resources per space with both; Patronage +2', () => {
    const g = mk();
    put(g, 'tay_ninh', 'nva_guer_u'); put(g, 'tay_ninh', 'vc_guer_u'); put(g, 'quang_duc_long_khanh', 'nva_guer_u'); put(g, 'quang_duc_long_khanh', 'vc_guer_u'); put(g, 'saigon', 'vc_guer_u');
    play(g, 76, false, 'ARVN');
    expect(g.resources.NVA).toBe(18);
    expect(g.resources.VC).toBe(13);
    expect(g.patronage).toBe(17);
  });
  it('77 Detente: halves NVA and VC Resources (round down), 5 Available NVA Troops out of play', () => {
    const g = mk();
    g.resources.VC = 15;
    play(g, 77, false, 'ARVN');
    expect(g.resources.NVA).toBe(10);
    expect(g.resources.VC).toBe(7);
    expect(g.out_of_play.nva_troops).toBe(5);
  });
  it('79 Henry Cabot Lodge: Aid +20; shaded removes ARVN pieces for +2 Patronage each and ARVN Ineligible', () => {
    const g = mk();
    play(g, 79, false, 'US');
    expect(g.aid).toBe(40);
    const h = mk();
    put(h, 'saigon', 'arvn_troops', 2); put(h, 'saigon', 'arvn_police', 2);
    play(h, 79, true, 'VC', [['piece'], ['piece'], ['piece']]);
    expect(h.patronage).toBe(21);
    expect(h.next_ineligible).toContain('ARVN');
  });
  it('80 Light at the End of the Tunnel: per US piece Patronage +2, a shift, 4 NVA Troops outside the South; stay Eligible', () => {
    const g = mk();
    put(g, 'saigon', 'us_troops', 2);
    g.spaces.hue.support = 1;
    play(g, 80, false, 'NVA', [['piece'], ['space', 'hue'], ['space', 'north_vietnam'], ['space', 'central_laos']]);
    expect(g.patronage).toBe(17);
    expect(g.available.us_troops).toBeGreaterThan(0);
    expect(g.next_eligible).toContain('NVA');
  });
  it('82 Domino Theory shaded: 3 Available US Troops out of play, Aid -9', () => {
    const g = mk();
    g.available.us_troops = 5;
    play(g, 82, true, 'VC');
    expect(g.out_of_play.us_troops).toBe(3);
    expect(g.aid).toBe(11);
  });
  it('83 Election: 3 Passive Support spaces to Active Support, Aid +10; shaded Aid -15', () => {
    const g = mk();
    for (const id of ['hue', 'da_nang', 'kontum', 'qui_nhon']) g.spaces[id].support = 1;
    play(g, 83, false, 'US', [['space', 'hue'], ['space', 'da_nang'], ['space', 'kontum']]);
    expect(g.spaces.hue.support).toBe(2);
    expect(g.spaces.qui_nhon.support).toBe(1);
    expect(g.aid).toBe(30);
    const h = mk();
    play(h, 83, true, 'VC');
    expect(h.aid).toBe(5);
  });
  it('84 To Quoc: 1 ARVN Troop and 1 Police in each South Vietnam space with NVA', () => {
    const g = mk();
    put(g, 'quang_duc_long_khanh', 'nva_guer_u');
    play(g, 84, false, 'ARVN');
    expect(n(g, 'quang_duc_long_khanh', 'arvn_troops')).toBe(1);
    expect(n(g, 'quang_duc_long_khanh', 'arvn_police')).toBe(1);
  });
  it('84 To Quoc shaded: ARVN removes 1 in 3 cubes per space; VC Guerrilla in spaces where it did', () => {
    const g = mk();
    put(g, 'saigon', 'arvn_troops', 4); put(g, 'hue', 'arvn_police', 2);
    play(g, 84, true, 'VC', [['space', 'saigon']]);
    expect(n(g, 'saigon', 'arvn_troops')).toBe(3);
    expect(n(g, 'hue', 'arvn_police')).toBe(2);
    expect(n(g, 'saigon', 'vc_guer_u')).toBe(1);
  });
  it('85 USAID shaded: +-2 to ARVN Resources, Aid, Patronage each', () => {
    const g = mk();
    play(g, 85, true, 'VC', [['choose', 0], ['choose', 1], ['choose', 0]]);
    expect(g.resources.ARVN).toBe(32);
    expect(g.aid).toBe(18);
    expect(g.patronage).toBe(17);
  });
  it('86 Mandate of Heaven records its capability', () => {
    const g = mk();
    play(g, 86, true, 'NVA');
    expect(g.capabilities[86]).toBe('shaded');
  });
  it('88 Phan Quang Dan: Saigon shifts and Patronage moves', () => {
    const g = mk();
    play(g, 88, false, 'ARVN');
    expect(g.spaces.saigon.support).toBe(1);
    expect(g.patronage).toBe(20);
    const h = mk();
    h.spaces.saigon.support = 2;
    play(h, 88, true, 'VC');
    expect(h.spaces.saigon.support).toBe(1);
    expect(h.patronage).toBe(10);
    expect(h.next_ineligible).toContain('ARVN');
  });
  it('89 Tam Chau: Saigon toward Passive Support, Patronage +6; shaded VC piece and Patronage -6', () => {
    const g = mk();
    play(g, 89, false, 'ARVN');
    expect(g.spaces.saigon.support).toBe(1);
    expect(g.patronage).toBe(21);
    const h = mk();
    h.spaces.saigon.support = 0;
    play(h, 89, true, 'VC', [['choose', 0], ['space', 'saigon']]);
    expect(h.spaces.saigon.support).toBe(-1);
    expect(n(h, 'saigon', 'vc_guer_u')).toBe(1);
    expect(h.patronage).toBe(9);
  });
  it('62 Cambodian Civil War shaded: NVA places 12 Troops/Guerrillas in Cambodia', () => {
    const g = mk();
    play(g, 62, true, 'NVA', Array.from({ length: 12 }, () => ['mv'] as [string]).flatMap((x) => [x, ['space', 'the_fishhook'] as [string, string]]));
    let total = 0;
    for (const id of ['northeast_cambodia', 'the_fishhook', 'the_parrots_beak', 'sihanoukville']) total += n(g, id, 'nva_troops') + n(g, id, 'nva_guer_u');
    expect(total).toBe(12);
  });
  it('70 ROKs shaded: Qui Nhon, Phu Bon and Khanh Hoa shift toward Opposition', () => {
    const g = mk();
    for (const id of ['qui_nhon', 'phu_bon_phu_yen', 'khanh_hoa']) g.spaces[id].support = 1;
    play(g, 70, true, 'VC');
    expect(['qui_nhon', 'phu_bon_phu_yen', 'khanh_hoa'].map((id) => g.spaces[id].support)).toEqual([0, 0, 0]);
  });
  it('81 CIDG shaded: Rangers/Police/Irregulars in a Highland space replaced by 2 VC Guerrillas', () => {
    const g = mk();
    put(g, 'quang_nam', 'arvn_police', 1); put(g, 'quang_nam', 'arvn_ranger_u', 1); put(g, 'quang_nam', 'us_irreg_u', 1);
    play(g, 81, true, 'VC', [['space', 'quang_nam']]);
    expect(n(g, 'quang_nam', 'arvn_police') + n(g, 'quang_nam', 'arvn_ranger_u') + n(g, 'quang_nam', 'us_irreg_u')).toBe(0);
    expect(n(g, 'quang_nam', 'vc_guer_u')).toBe(2);
    expect(g.casualties.us_irreg).toBe(0);
  });
  it('every card 61-90, both sides, runs to completion with legal Support levels', () => {
    for (const c of [61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90]) {
      for (const shaded of [false, true]) {
        const g = mk();
        for (const id of ['saigon', 'hue', 'tay_ninh']) { put(g, id, 'us_troops', 2); put(g, id, 'arvn_troops', 2); put(g, id, 'arvn_police', 2); put(g, id, 'vc_guer_u', 2); }
        let ok = true;
        try { play(g, c, shaded, 'US'); } catch (e) { ok = false; throw new Error(`card ${c} ${shaded ? 'shaded' : 'unshaded'}: ${(e as Error).message}`); }
        expect(ok).toBe(true);
        expect(g.stack.length).toBe(0);
        for (const id of SPACE_IDS) expect(Math.abs(g.spaces[id].support)).toBeLessThanOrEqual(2);
      }
    }
  });
});
