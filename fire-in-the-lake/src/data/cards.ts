// All 130 Fire in the Lake cards. Titles follow the canonical deck order; the rules text is generated from the
// event implementations in src/engine/events (TEXT), so it always matches what the engine does.
// Row format: id | title | order (U=US A=ARVN N=NVA V=VC) | flags (c=capability m=momentum) | unshaded | shaded
import type { CardDef, Faction } from '../core/types';

const F: Record<string, Faction> = { U: 'US', A: 'ARVN', N: 'NVA', V: 'VC' };

const ROWS = `
1|Gulf of Tonkin|UNAV||Free US Air Strike. Then move up to 3 US Troops from Casualties to Available.|Aid -6. Remove up to 3 US Troops from the map to Out of Play.
2|Kennedy Speech|UAVN||Aid +6. Place up to 3 US Irregulars in Provinces, in any distribution.|Aid -6. Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition.
3|Peace Talks|UANV||NVA Resources -6.|NVA Resources +6. Trail +1.
4|Top Gun|UNAV|c|Capability: US Air Strike may degrade the Trail by up to 2 instead of 1.|Capability: US Air Strike degrades the Trail only on a die roll of 4-6.
5|Wild Weasels|UAVN|m|Free US Air Strike.|Momentum (until Coup): Wild Weasels - Air Strike may not degrade the Trail.
6|Aces|UANV||Free US Air Strike.|Remove up to 2 US Troops from the map to Casualties.
7|ADSID|UNAV|m|Momentum (until Coup): ADSID - each time the Trail is improved, NVA Resources -6.|Trail +1.
8|Arc Light|UAVN|c|Capability: US Air Strike may include 1 space that has no COIN pieces.|Capability: When Air Strike hits 2 or more spaces, shift Support 2 levels toward Opposition (instead of 1) in each.
9|Psychedelic Cookie|UANV||Move up to 4 US Troops from Casualties to Available.|Move up to 3 US Troops from Available to Out of Play.
10|Rolling Thunder|UNAV|m|Momentum (until Coup): Rolling Thunder - the Trail may not be improved (Rally, Laos/Cambodia) or degraded (Air Strike).|NVA Resources +6.
11|Abrams|UAVN|c|Capability: US Assault may also remove one enemy Base per Assault even while other enemy pieces remain in that space.|Capability: US Assault may select at most 2 spaces.
12|Capt Buck Adams|UANV||Free US Air Strike.|Place up to 3 of your Guerrillas in Provinces, at most 1 per Province (NVA or VC, whichever executes).
13|Cobras|UNAV|c|Capability: After a US/ARVN Sweep, the first 2 swept spaces each remove 1 Active enemy piece.|Capability: When US Assaults a space, roll a die; on 1-3 remove 1 US Troop from that space.
14|M-48 Patton|UAVN|c|Capability: In Highland or Jungle, up to 2 spaces per Assault remove 2 additional enemy pieces.|Capability: After a Patrol, NVA removes up to 2 of the COIN cubes that moved.
15|Medevac|UANV|m|Momentum (until Coup): Medevac - US Troops that would go to Casualties go to Available instead.|Remove up to 3 US Troops from the map to Casualties.
16|Blowtorch Komer|UNAV|m|Momentum (until Coup): Blowtorch Komer - Pacification costs 1 ARVN Resource.|Aid -6.
17|Claymores|UAVN|m|Momentum (until Coup): Claymores - no Ambush.|Place up to 3 of your Guerrillas in COIN-Controlled Cities/Provinces, at most 1 per space.
18|Combined Action Platoons|UANV|c|Capability: US Sweep counts ARVN Police as US Troops.|Capability: Terror by insurgents in a space with US Troops and Police shifts Support an extra level.
19|CORDS|UNAV|c|Capability: Pacification may shift up to 3 levels per Pacify instead of 2.|Capability: Pacification may shift only 1 level per Pacify.
20|Laser Guided Bombs|UAVN|c|Capability: An Air Strike that removes exactly 1 piece does not shift Support.|Capability: Air Strike may hit at most 2 spaces.
21|Americal|UANV||Place up to 4 US Troops from Available in South Vietnam, in any distribution.|Remove up to 3 US Troops in South Vietnam to Casualties.
22|Da Nang|UNAV|m|Momentum (until Coup): Da Nang - US Air Lift into or out of Da Nang is free. Place up to 3 US Troops in Da Nang.|Place up to 3 of your Guerrillas in Quang Nam, Da Nang and/or Quang Tin-Quang Ngai.
23|Operation Attleboro|UAVN||Free US Sweep, then free US Assault, in Tay Ninh, Phuoc Long and The Fishhook.|Remove up to 3 US Troops in South Vietnam to Casualties.
24|Operation Starlite|UANV||Free US Sweep, then free US Assault, in up to 3 coastal South Vietnam Provinces.|Place 1 of your Bases in a coastal Province containing NVA or VC Guerrillas.
25|TF-116 Riverines|UNAV||Free ARVN Sweep, then free ARVN Assault, in up to 3 spaces on or adjacent to the Mekong.|Add Sabotage to up to 3 Mekong LoCs.
26|LRRP|UAVN||Remove up to 3 Guerrillas in Laos, Cambodia or spaces adjacent to them.|Remove up to 3 Irregulars and/or Rangers from the map.
27|Phoenix Program|UANV||Remove up to 3 VC pieces from Cities/Provinces in South Vietnam (Bases last).|Shift 1 City/Province with Population in South Vietnam 1 level toward Active Opposition.
28|Search and Destroy|UNAV|c|Capability: Once per US Assault, also remove 1 Underground Guerrilla from an assaulted space.|Capability: Each space that a US or ARVN Assault hits, if it has Population, shifts 1 level toward Opposition.
29|Tribesmen|UAVN||Place up to 3 US Irregulars in Highland spaces, at most 1 per space.|Remove up to 3 US Irregulars from the map.
30|USS New Jersey|UANV||Remove up to 3 NVA/VC pieces from coastal spaces in South Vietnam (Bases last).|Place up to 2 of your Guerrillas in coastal spaces, at most 1 per space.
31|AAA|NAUV|c|Capability: AAA is neutralised - Air Strike Trail degrade is not hindered.|Capability: AAA - each Air Strike removes at most 1 insurgent piece per space.
32|Long Range Guns|NUVA|c|Capability: NVA Bombard may select only 1 space.|Capability: NVA Bombard may select up to 3 spaces, and Troops up to 2 spaces away may Bombard.
33|MiGs|NVUA|c|Capability: MiGs are neutralised - US Air Strike is unaffected.|Capability: MiGs - after an Air Strike, roll a die; on 1-3 remove 1 US Troop.
34|SA-2s|NAUV|c|Capability: SA-2s are neutralised - US Air Strike is unaffected.|Capability: SA-2s - Air Strike may not degrade the Trail on a die roll of 1-3.
35|Thanh Hoa|NUVA||Free US Air Strike.|NVA Resources +6. Trail +1.
36|Hamburger Hill|NVUA||Free US Assault in 1 South Vietnam Highland Province.|Remove up to 3 US Troops from Highland Provinces in South Vietnam to Casualties.
37|Khe Sanh|NAUV||Remove up to 3 NVA Troops from Quang Tri-Thua Thien, Central Laos and/or North Vietnam.|Place up to 3 NVA Troops in Quang Tri-Thua Thien, then remove up to 2 US Troops there.
38|McNamara Line|NUVA|m|Momentum (until Coup): McNamara Line - the Trail may not be improved.|Place up to 3 NVA Troops in Laos, Cambodia and/or North Vietnam.
39|Oriskany|NVUA|m|Momentum (until Coup): Oriskany - Air Strike may not degrade the Trail.|Trail +1.
40|PoWs|NAUV||Move up to 3 US Troops from Casualties to Available. NVA Resources -3.|Move up to 2 US Troops from Available to Out of Play. Aid -3.
41|Bombing Pause|NUVA|m|Trail -1.|Momentum (until Coup): Bombing Pause - no US Air Strike. NVA Resources +3.
42|Chou En Lai|NVUA||NVA Resources -6.|NVA Resources +6. Place up to 2 NVA Troops in Laos, Cambodia and/or North Vietnam.
43|Economic Aid|NAUV||Aid +6.|NVA Resources +3. VC Resources +3. Aid -3.
44|Ia Drang|NUVA||Free US Sweep, then free US Assault, in Pleiku-Darlac and Kontum.|Place up to 3 NVA Troops in South Vietnam Highland spaces, then remove up to 2 US Troops from Highland spaces.
45|PT-76|NVUA|c|Capability: Each NVA Attack with Troops loses 1 NVA Troop.|Capability: NVA Attack with Troops needs only 1 Troop per removal instead of 2.
46|559th Transport Grp|NAUV|m|Momentum (until Coup): 559th Transport Grp - NVA Infiltrate may select at most 1 space. Remove up to 3 NVA Troops in Laos/Cambodia.|Trail +1. NVA Resources +3.
47|Chu Luc|NUVA||Remove up to 3 NVA Troops in South Vietnam.|Place up to 3 NVA Troops and 2 NVA Guerrillas in South Vietnam Provinces.
48|Nam Dong|NVUA||Place up to 2 US Irregulars in South Vietnam Highland spaces, then remove up to 2 NVA/VC pieces from South Vietnam Highland spaces.|Remove up to 3 US Irregulars from the map. Place up to 2 of your Guerrillas in South Vietnam Highland spaces.
49|Russian Arms|NAUV||NVA Resources -6.|NVA Resources +6. Place up to 3 NVA Troops in Laos, Cambodia and/or North Vietnam.
50|Uncle Ho|NUVA||Remove up to 2 NVA/VC Bases (a Base is removed only if its Faction has no other pieces there).|NVA Resources +3. VC Resources +3.
51|301st Supply Bn|NVUA||NVA Resources -6.|NVA Resources +6. Place up to 3 NVA Troops in Laos.
52|RAND|NAUV||Aid +4. Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Support.|Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition. Aid -4.
53|Sappers|NUVA||Remove up to 2 Guerrillas from spaces with COIN pieces.|Remove up to 3 US/ARVN pieces from spaces with NVA/VC pieces (Bases last).
54|Son Tay|NVUA||Free US Air Strike. Remove up to 2 NVA/VC pieces from North Vietnam.|Remove up to 2 US Troops from the map to Casualties. NVA Resources +3.
55|Trucks|NAUV||Trail -1. Remove up to 3 NVA Troops from Laos.|Trail +1. NVA Resources +3.
56|Vo Nguyen Giap|NUVA||NVA Resources -6.|Free NVA March, then free NVA Attack.
57|International Unrest|NVUA||Move up to 3 US Troops from Out of Play to Available.|Move up to 3 US Troops from Available to Out of Play. Aid -3.
58|Pathet Lao|NAUV||Remove up to 3 NVA pieces from Laos (Bases last).|Place up to 3 NVA Troops and 1 NVA Base in Laos.
59|Plei Mei|NUVA||Free US Sweep, then free US Assault, in Pleiku-Darlac.|Place up to 3 NVA Troops in Pleiku-Darlac, then remove up to 2 US Troops there.
60|War Photographer|NVUA||Shift 1 City/Province with Population in South Vietnam 1 level toward Active Support.|Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition. Aid -3.
61|Armored Cavalry|AUVN|c|Capability: After ARVN Transport, ARVN may Assault free in the destination spaces.|Capability: ARVN Rangers moved by Transport flip to Active.
62|Cambodian Civil War|ANUV||Remove up to 3 NVA/VC pieces from Cambodia (Bases last).|Place up to 3 NVA Troops in Cambodia.
63|Fact Finding|AUNV||Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Support.|Patronage -4.
64|Honolulu Conference|AUVN||Aid +6. Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Support.|Aid -6.
65|International Forces|ANUV||Place up to 3 ARVN Police in South Vietnam Cities/Provinces.|Remove up to 3 ARVN Police from the map.
66|Ambassador Taylor|AUNV||Aid +6. Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Support.|Aid -6. Shift up to 1 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition.
67|Amphib Landing|AUVN||Place up to 3 US Troops in coastal South Vietnam spaces, then free US Sweep in up to 2 spaces.|Remove up to 2 US Troops from coastal spaces.
68|Green Berets|ANUV||Place up to 3 US Irregulars in Provinces, in any distribution.|Remove up to 3 US Irregulars from the map.
69|MACV|AUNV||Free US Sweep, then free US Assault, each in up to 2 spaces.|Remove up to 2 US Troops from the map.
70|ROKs|AUVN||Place up to 4 ARVN Troops in South Vietnam Cities/Provinces, then free ARVN Sweep in up to 2 spaces.|Remove up to 3 ARVN Troops from the map.
71|An Loc|ANUV||Free ARVN Assault in An Loc, Tay Ninh and Phuoc Long.|Place up to 3 NVA Troops in An Loc, Tay Ninh and/or Phuoc Long, then remove up to 2 ARVN Troops there.
72|Body Count|AUNV|m|Momentum (until Coup): Body Count - each enemy piece removed by US/ARVN Assault adds 1 to Aid.|Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition.
73|Great Society|AUVN||Aid +6. Move up to 2 US Troops from Out of Play to Available.|Aid -6.
74|Lam Son 719|ANUV||Free ARVN Sweep, then free ARVN Assault, in Central Laos and Southern Laos.|Place up to 3 NVA Troops in Laos, then remove up to 3 ARVN Troops from Laos.
75|Sihanouk|AUNV||Free ARVN Sweep in Cambodia.|Place up to 3 of your Guerrillas in Cambodia.
76|Annam|AUVN||Remove up to 2 NVA/VC pieces from South Vietnam (Bases last).|Place up to 3 NVA Troops in South Vietnam Provinces.
77|Detente|ANUV||NVA Resources -6. Trail -1.|Trail +1. VC Resources +3.
78|General Lansdale|AUNV|m|Momentum (until Coup): General Lansdale - Patronage may not be reduced.|Aid -3.
79|Henry Cabot Lodge|AUVN||Aid +6. Patronage -3.|Patronage +6. Aid -3.
80|Light at the End of the Tunnel|ANUV||Aid +6. Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Support.|Aid -6. Shift up to 1 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition.
81|CIDG|AUNV||Place up to 3 US Irregulars in Highland spaces, at most 1 per space.|Remove up to 3 US Irregulars from the map.
82|Domino Theory|AUVN||Aid +6.|Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition.
83|Election|ANUV||Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Support.|Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition.
84|To Quoc|AUNV||Patronage +5. Place up to 3 ARVN Troops in Cities.|Patronage -5.
85|USAID|AUVN||Aid +6. ARVN Resources +6.|Aid -6. Patronage -3.
86|Mandate of Heaven|ANUV|c|Capability: ARVN Govern may select up to 2 spaces.|Capability: ARVN Govern may select only 1 space.
87|Nguyen Chanh Thi|AUNV||Place up to 3 ARVN Rangers in South Vietnam Provinces, in any distribution.|Patronage -5. Remove up to 2 ARVN Troops from the map.
88|Phan Quang Dan|AUVN||Patronage -3. Shift 1 City/Province with Population in South Vietnam 1 level toward Active Support.|Patronage +3. Shift 1 City/Province with Population in South Vietnam 1 level toward Active Opposition.
89|Tam Chau|ANUV||Shift up to 2 Cities 1 level toward Active Support.|Shift up to 2 Cities 1 level toward Active Opposition.
90|Walt Rostow|AUNV||Free US Air Strike. Trail -1.|Trail +1. NVA Resources +3.
91|Bob Hope|VUAN||Aid +4. Move up to 2 US Troops from Casualties to Available.|Move up to 2 US Troops from Available to Out of Play.
92|SEALORDS|VNAU||Remove up to 3 NVA/VC pieces from coastal spaces (Bases last).|Place up to 3 of your Guerrillas in coastal spaces, at most 1 per space.
93|Senator Fulbright|VNUA||Aid +3.|Aid -6. Move up to 3 US Troops from Available to Out of Play.
94|Tunnel Rats|VUAN||Remove the Tunnel marker from up to 2 NVA/VC Tunneled Bases.|Place a Tunnel marker on up to 2 NVA/VC Bases.
95|Westmoreland|VNAU||Place up to 4 US Troops in South Vietnam, then free US Assault.|Remove up to 3 US Troops from the map to Casualties.
96|APC|VNUA||Place up to 3 ARVN Troops in South Vietnam Cities/Provinces, then free ARVN Sweep in up to 2 spaces.|Remove up to 3 ARVN Troops from the map.
97|Brinks Hotel|VUAN||Shift up to 1 City 1 level toward Active Support.|Shift up to 2 Cities 1 level toward Active Opposition. Add 1 Terror to Saigon. Aid -3.
98|Long Tan|VNAU||Remove up to 3 VC Guerrillas from South Vietnam Provinces.|Remove up to 2 US Troops from South Vietnam to Casualties.
99|Masher/White Wing|VNUA||Free US Sweep, then free US Assault, in Binh Dinh.|Place up to 2 of your Guerrillas in Binh Dinh, then remove up to 2 US Troops there.
100|Rach Ba Rai|VUAN||Free ARVN Sweep, then free ARVN Assault, in the Mekong Delta (Kien Hoa-Vinh Binh, Kien Phong, Ba Xuyen, Kien Giang-An Xuyen, Can Tho).|Place up to 3 VC Guerrillas in the Mekong Delta spaces listed on the unshaded side.
101|Booby Traps|VNAU|c|Capability: Booby Traps are neutralised - no extra COIN losses.|Capability: Booby Traps - when COIN Sweeps or Assaults a space with Underground Guerrillas, roll a die; on 1-3 remove 1 COIN cube there.
102|Cu Chi|VNUA||Free ARVN Assault in Tay Ninh and Saigon.|Place 1 Tunneled VC Base and up to 2 VC Guerrillas in Tay Ninh.
103|Kent State|VUAN||Aid +3.|Remove up to 3 US Troops from the map to Out of Play. Aid -3.
104|Main Force Bns|VNAU|c|Capability: Main Force Bns are neutralised - no extra insurgent Attack strength.|Capability: Main Force Bns - Guerrilla Attack in a space with 3+ Guerrillas removes 1 extra piece.
105|Rural Pressure|VNUA||Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Support.|Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition.
106|Binh Duong|VUAN||Free US Sweep, then free US Assault, in Tay Ninh and An Loc.|Place up to 3 VC Guerrillas in Tay Ninh, An Loc and/or Phuoc Long.
107|Burning Bonze|VNAU||Patronage +3. Shift up to 1 Cities/Provinces with Population in South Vietnam 1 level toward Active Support.|Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition. Patronage -3.
108|Draft Dodgers|VNUA||Move up to 3 US Troops from Out of Play to Available.|Move up to 3 US Troops from Available to Out of Play.
109|Nguyen Huu Tho|VUAN||Remove up to 3 VC pieces from Provinces (Bases last).|Place up to 3 VC Guerrillas in South Vietnam. VC Resources +3.
110|No Contact|VNAU||Remove up to 3 Guerrillas from Provinces.|Free NVA or VC Ambush (whichever executes).
111|Agent Orange|VNUA||Remove up to 3 Guerrillas from Jungle spaces.|Place up to 3 of your Guerrillas in Jungle spaces, at most 1 per space.
112|Colonel Chau|VUAN||Place up to 2 ARVN Police in South Vietnam Provinces, then shift 1 Province 1 level toward Active Support.|Remove up to 2 ARVN Police from the map. Shift up to 1 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition.
113|Ruff Puff|VNAU||Place up to 4 ARVN Police in South Vietnam Cities/Provinces.|Remove up to 4 ARVN Police from the map.
114|Tri Quang|VNUA||Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Support.|Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition.
115|Typhoon Kate|VUAN|m|Momentum (until Coup): Typhoon Kate - no US Air Lift.|NVA Resources +3.
116|Cadres|VNAU|c|Capability: Cadres are neutralised - no extra insurgent Terror/Rally effect.|Capability: Cadres - VC Rally and Terror may each select 1 additional space.
117|Corps Commanders|VNUA||Patronage +5. Place up to 2 ARVN Rangers in South Vietnam.|Patronage -5.
118|Korean War Arms|VUAN||NVA Resources -3. Trail -1.|NVA Resources +3. VC Resources +3.
119|My Lai|VNAU||Shift up to 1 Cities/Provinces with Population in South Vietnam 1 level toward Active Support.|Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition. Aid -3.
120|US Press Corps|VNUA||Shift up to 2 Cities/Provinces with Population in South Vietnam 1 level toward Active Support.|VC Resources +3. Shift up to 1 Cities/Provinces with Population in South Vietnam 1 level toward Active Opposition.
121|Linebacker II|UANV||Requires 2+ cards in the RVN Leader box and Support + Available US pieces > 40. Trail to 0. NVA Resources -50%. Free US Air Strike that may target any space.|
122|Easter Offensive|NAUV||Requires 2+ cards in the RVN Leader box and more NVA Troops than US Troops on the map. Free NVA March, then free NVA Attack with +1 bonus.|
123|Vietnamization|AUNV||Requires 2+ cards in the RVN Leader box and fewer than 20 US Troops on the map. Move all US Troops from the map to Available. Free ARVN Train, then free ARVN Govern.|
124|Tet Offensive|VNAU||Requires 2+ cards in the RVN Leader box and more than 20 VC Guerrillas in South Vietnam. Free VC Terror in every space with VC Guerrillas (no flipping), then free VC Attack.|
`.trim();

const CAP_M = (s: string) => ({ capability: s.includes('c'), momentum: s.includes('m') });

const events: CardDef[] = ROWS.split('\n').map((row) => {
  const [id, title, ord, flags, un, sh] = row.split('|');
  const n = Number(id);
  const c: CardDef = {
    id: n, title, coup: false,
    order: [...ord].map((ch) => F[ch]),
    unshaded: un, shaded: sh,
  };
  const fl = CAP_M(flags);
  if (fl.capability) c.capability = true;
  if (fl.momentum) c.momentum = true;
  if (n >= 121) {
    c.pivotal = c.order[0];
    c.shaded = '';
  }
  if (n >= 1 && n <= 20 && [1, 2, 3].includes(n)) c.period = '1964';
  return c;
});

const coupDef = (id: number, title: string, leader: boolean, text: string): CardDef => ({
  id, title, coup: true, order: [], unshaded: text, shaded: '', leader,
});

const coups: CardDef[] = [
  coupDef(125, 'Nguyen Khanh', true, 'Leader: Transport costs 3 (ARVN Transport Resource cost).'),
  coupDef(126, 'Young Turks', true, 'Leader: Each Coup Round Aid Support +2 Patronage (Pacify/Govern bonus).'),
  coupDef(127, 'Nguyen Cao Ky', true, 'Leader: Pacification costs 4 per level.'),
  coupDef(128, 'Nguyen Van Thieu', true, 'Leader: stable government; Govern bonus.'),
  coupDef(129, 'Failed Attempt', false, 'Failed coup attempt: Patronage/ARVN Troops lost depending on leader box.'),
  coupDef(130, 'Failed Attempt', false, 'Failed coup attempt: Patronage/ARVN Troops lost depending on leader box.'),
];

export const CARDS: CardDef[] = [...events, ...coups].sort((a, b) => a.id - b.id);
export const CARD: Record<number, CardDef> = Object.fromEntries(CARDS.map((c) => [c.id, c]));
