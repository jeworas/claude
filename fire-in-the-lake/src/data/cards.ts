// All 130 Fire in the Lake cards. Titles follow the canonical deck order; the rules text is generated from the
// event implementations in src/engine/events (TEXT), so it always matches what the engine does.
// Row format: id | title | order (U=US A=ARVN N=NVA V=VC) | flags (c=capability m=momentum) | unshaded | shaded
import type { CardDef, Faction } from '../core/types';

const F: Record<string, Faction> = { U: 'US', A: 'ARVN', N: 'NVA', V: 'VC' };

const ROWS = `
1|Gulf of Tonkin|UNAV||Free Air Strike. Then up to 3 US Troops from Casualties to Available.|Aid -6. Remove up to 3 US Troops from the map Out of Play.
2|Kennedy Speech|UAVN||Aid +6. Place up to 3 Irregulars in Provinces.|Aid -6. Shift up to 2 spaces one level toward Opposition.
3|Peace Talks|UANV||NVA Resources -9.|NVA Resources +6. Trail +1.
4|Top Gun|UNAV|c|Capability: US Air Strike may remove up to 2 more enemy pieces in one space.|Capability: US Air Strike removes at most 1 piece total.
5|Wild Weasels|UAVN|m|Free Air Strike.|Momentum (until Coup): Air Strike may not degrade the Trail.
6|Aces|UANV||Free Air Strike.|Remove up to 2 US Troops from the map to Casualties.
7|ADSID|UNAV|m|Momentum (until Coup): -6 NVA Resources whenever the Trail is improved.|Trail +1.
8|Arc Light|UAVN|c|Capability: Air Strike may also affect spaces adjacent to the chosen one.|Capability: Air Strike limited to a single space.
9|Psychedelic Cookie|UANV||Up to 4 US Troops from Casualties to Available.|Up to 3 US Troops from Available to Out of Play.
10|Rolling Thunder|UNAV|m|Momentum (until Coup): the Trail may not be improved.|Momentum (until Coup): NVA Rally is stronger. NVA Resources +6.
11|Abrams|UAVN|c|Capability: US Assault more effective.|Capability: US Assault less effective.
12|Capt Buck Adams|UANV||Free Air Strike.|Place up to 3 Guerrillas in Provinces (executing insurgent).
13|Cobras|UNAV|c|Capability: US/ARVN Assault helicopter bonus.|Capability: US loses a Troop when it Assaults.
14|M-48 Patton|UAVN|c|Capability: Assault bonus in Lowland.|Capability: NVA/VC Ambush bonus.
15|Medevac|UANV|m|Momentum (until Coup): US Casualties return to Available.|Momentum (until Coup): no Medevac. Remove up to 3 US Troops from the map to Casualties.
16|Blowtorch Komer|UNAV|m|Momentum (until Coup): Pacification is cheaper.|Momentum (until Coup): Pacification limited. Aid -6.
17|Claymores|UAVN|m|Momentum (until Coup): insurgent Marches are hindered.|Place up to 3 Guerrillas in COIN-controlled spaces (Bases stay).
18|Combined Action Platoons|UANV|c|Capability: Civic Action shifts easier.|Capability: Terror can shift Support more.
19|CORDS|UNAV|c|Capability: Pacification shifts 2 levels.|Capability: Pacification shifts only 1 level.
20|Laser Guided Bombs|UAVN|c|Capability: Air Strike removes without US losses.|Capability: Air Strike restricted.
21|Americal|UANV||Place up to 4 US Troops from Available in South Vietnam.|Remove up to 3 US Troops in South Vietnam to Casualties.
22|Da Nang|UNAV|m|Momentum (until Coup): free Air Lift into/out of Da Nang. Place up to 3 US Troops in Da Nang.|Place up to 3 Guerrillas in Quang Nam / Da Nang / Quang Tin.
23|Operation Attleboro|UAVN||Free US Sweep then Assault in Tay Ninh, Phuoc Long and The Fishhook.|Remove up to 3 US Troops in South Vietnam to Casualties.
24|Operation Starlite|UANV||Free US Sweep and Assault in up to 3 coastal Provinces.|Place 1 Base in a coastal Province with your Guerrillas.
25|TF-116 Riverines|UNAV||Free ARVN Sweep and Assault along the Mekong.|Sabotage up to 3 Mekong LoCs.
26|LRRP|UAVN||Remove up to 3 Guerrillas in or adjacent to Laos/Cambodia.|Remove up to 3 Irregulars/Rangers from the map.
27|Phoenix Program|UANV||Remove up to 3 VC pieces in Cities/Provinces of South Vietnam.|Shift up to 2 spaces one level toward Opposition.
28|Search and Destroy|UNAV|c|Capability: Sweep/Assault bonus.|Capability: Sweep penalty.
29|Tribesmen|UAVN||Place up to 3 Irregulars in Highland spaces.|Remove up to 3 Irregulars from the map.
30|USS New Jersey|UANV||Remove up to 3 NVA/VC pieces in coastal South Vietnam.|Place up to 2 Guerrillas in coastal spaces.
31|AAA|NAUV|c|Capability: Air Strike may degrade the Trail regardless of NVA defences (AAA neutralised).|Capability: AAA - Air Strike may cost the US a Troop and removes fewer pieces.
32|Long Range Guns|NUVA|c|Capability: NVA Bombard removes only 1 Troop.|Capability: NVA Bombard removes 2 more Troops.
33|MiGs|NVUA|c|Capability: Air Strike degrades the Trail on 4-6 only.|Capability: MiGs - Air Strike may cost a US Troop.
34|SA-2s|NAUV|c|Capability: SA-2s neutralised.|Capability: SA-2s - Air Strike may lose a US Troop on roll 1-3.
35|Thanh Hoa|NUVA||Free Air Strike.|NVA Resources +6. Trail +1.
36|Hamburger Hill|NVUA||Free US Assault in one Highland Province.|Remove up to 3 US Troops from one Highland Province.
37|Khe Sanh|NAUV||Remove up to 3 NVA Troops in Quang Tri-Thua Thien / Laos.|NVA places 3 Troops in Quang Tri-Thua Thien; remove up to 2 US Troops there.
38|McNamara Line|NUVA|m|Momentum (until Coup): NVA Marches into South Vietnam are costly.|NVA places 3 Troops in Laos/North Vietnam.
39|Oriskany|NVUA|m|Momentum (until Coup): US Air Strikes are strengthened.|Trail +1.
40|PoWs|NAUV||Up to 3 US Troops from Casualties to Available. NVA Resources -3.|Up to 2 US Troops from Available to Out of Play. Aid -3.
41|Bombing Pause|NUVA|m|Trail -1.|Momentum (until Coup): no Air Strikes. NVA Resources +3.
42|Chou En Lai|NVUA||NVA Resources -6.|NVA Resources +6. Place up to 2 NVA Troops in Laos/Cambodia/North Vietnam.
43|Economic Aid|NAUV||Aid +9.|NVA and VC Resources +3 each. Aid -3.
44|Ia Drang|NUVA||Free US Sweep then Assault in Pleiku-Darlac.|NVA places 3 Troops in a Highland/Pleiku space; remove up to 2 US Troops there.
45|PT-76|NVUA|c|Capability: NVA Attack removes fewer pieces (PT-76 neutralised).|Capability: PT-76 - NVA Troop Attack removes 2 more COIN pieces.
46|559th Transport Grp|NAUV|m|Remove up to 3 NVA Troops in Laos/Cambodia.|Momentum (until Coup): Trail improvement is free. Trail +1.
47|Chu Luc|NUVA||Remove up to 3 NVA Troops in South Vietnam.|Place up to 3 NVA Troops and 2 NVA Guerrillas in South Vietnam.
48|Nam Dong|NVUA||Place up to 2 Irregulars in a South Vietnam Highland space, then remove up to 2 insurgent pieces in Highlands.|Remove up to 3 Irregulars. Place up to 2 Guerrillas in Highland South Vietnam.
49|Russian Arms|NAUV||NVA Resources -6.|NVA Resources +6. Place up to 3 NVA Troops in Laos/North Vietnam/Cambodia.
50|Uncle Ho|NUVA||Remove up to 2 NVA/VC Bases (only if no Guerrillas remain in the space).|NVA and VC Resources +4 each.
51|301st Supply Bn|NVUA||NVA Resources -6.|NVA Resources +6. Place up to 3 NVA Troops in Laos.
52|RAND|NAUV||Aid +4. Shift up to 2 spaces one level toward Support.|Shift up to 2 spaces one level toward Opposition. Aid -4.
53|Sappers|NUVA||Remove up to 2 Guerrillas from spaces with COIN pieces.|Remove up to 3 COIN pieces (Bases last) from spaces with insurgents.
54|Son Tay|NVUA||Free Air Strike. Remove up to 2 NVA/VC pieces in North Vietnam.|Remove up to 2 US Troops from the map. NVA Resources +3.
55|Trucks|NAUV||Trail -1. Remove up to 3 NVA Troops in Laos.|Trail +1. NVA Resources +3.
56|Vo Nguyen Giap|NUVA||NVA Resources -6.|Free NVA March then free NVA Attack.
57|International Unrest|NVUA||Up to 3 US Troops from Out of Play to Available.|Up to 3 US Troops from Available to Out of Play. Aid -3.
58|Pathet Lao|NAUV||Remove up to 3 NVA pieces in Laos.|Place up to 3 NVA Troops in Laos and 1 NVA Base.
59|Plei Mei|NUVA||Free US Sweep then Assault in Pleiku-Darlac.|Place up to 3 NVA Troops in Pleiku-Darlac; remove up to 2 US Troops there.
60|War Photographer|NVUA||Shift 1 space one level toward Support.|Shift up to 3 spaces one level toward Opposition. Aid -3.
61|Armored Cavalry|AUVN|c|Capability: Armored Cavalry - US/ARVN Sweep helps.|Capability: Armored Cavalry - COIN losses.
62|Cambodian Civil War|ANUV||Remove up to 3 NVA/VC pieces in Cambodia.|Place up to 3 NVA Troops in Cambodia.
63|Fact Finding|AUNV||Shift up to 2 spaces one level toward Support.|Patronage -4.
64|Honolulu Conference|AUVN||Aid +6. Shift up to 2 spaces one level toward Support.|Aid -6.
65|International Forces|ANUV||Place up to 3 ARVN Police in South Vietnam Cities/Provinces.|Remove up to 3 ARVN Police.
66|Ambassador Taylor|AUNV||Aid +6. Shift up to 2 spaces one level toward Support.|Aid -6. Shift up to 2 spaces one level toward Opposition.
67|Amphib Landing|AUVN||Place up to 3 US Troops in coastal South Vietnam, then a free US Sweep in up to 2 spaces.|Remove up to 2 US Troops from coastal spaces.
68|Green Berets|ANUV||Place up to 3 Irregulars in Provinces.|Remove up to 3 Irregulars.
69|MACV|AUNV||Free US Sweep then Assault in up to 2 spaces.|Remove up to 2 US Troops from the map.
70|ROKs|AUVN||Place up to 4 ARVN Troops in South Vietnam, then a free ARVN Sweep in up to 2 spaces.|Remove up to 3 ARVN Troops.
71|An Loc|ANUV||Free ARVN Assault in An Loc, Tay Ninh and Phuoc Long.|Place up to 3 NVA Troops in An Loc / Tay Ninh / Phuoc Long; remove up to 2 ARVN Troops there.
72|Body Count|AUNV|m|Momentum (until Coup): Assaults add Body Count bonuses.|Shift up to 2 spaces one level toward Opposition.
73|Great Society|AUVN||Aid +6. Up to 2 US Troops from Out of Play to Available.|Aid -6.
74|Lam Son 719|ANUV||Free ARVN Sweep then Assault in Laos.|Place up to 3 NVA Troops in Laos; remove up to 3 ARVN Troops in Laos.
75|Sihanouk|AUNV||Free ARVN Sweep in Cambodia.|Place up to 3 Guerrillas in Cambodia.
76|Annam|AUVN||Remove up to 2 NVA/VC pieces in South Vietnam.|Place up to 3 NVA Troops in South Vietnam Provinces.
77|Detente|ANUV||NVA Resources -6. Trail -1.|Trail +1. VC Resources +3.
78|General Lansdale|AUNV|m|Momentum (until Coup): Patronage cannot be lost through Transport.|Aid -3.
79|Henry Cabot Lodge|AUVN||Aid +6. Patronage -3.|Patronage +6. Aid -3.
80|Light at the End of the Tunnel|ANUV||Aid +6. Shift up to 2 spaces one level toward Support.|Aid -6. Shift up to 2 spaces one level toward Opposition.
81|CIDG|AUNV||Place up to 3 Irregulars in Highland spaces.|Remove up to 3 Irregulars from the map.
82|Domino Theory|AUVN||Aid +9.|Shift up to 2 spaces one level toward Opposition.
83|Election|ANUV||Shift up to 3 spaces one level toward Support.|Shift up to 3 spaces one level toward Opposition.
84|To Quoc|AUNV||Patronage +5. Place up to 3 ARVN Troops in Cities.|Patronage -5.
85|USAID|AUVN||Aid +6. ARVN Resources +6.|Aid -6. Patronage -3.
86|Mandate of Heaven|ANUV|c|Capability: Mandate of Heaven - Govern strengthened.|Capability: Mandate of Heaven - Govern weakened.
87|Nguyen Chanh Thi|AUNV||Place up to 3 ARVN Rangers in Provinces.|Patronage -5. Remove up to 2 ARVN Troops.
88|Phan Quang Dan|AUVN||Patronage -3. Shift 1 space one level toward Support.|Patronage +3. Shift 1 space one level toward Opposition.
89|Tam Chau|ANUV||Shift up to 2 Cities one level toward Support.|Shift up to 2 Cities one level toward Opposition.
90|Walt Rostow|AUNV||Free Air Strike. Trail -1.|Trail +1. NVA Resources +3.
91|Bob Hope|VUAN||Aid +4. Up to 2 US Troops from Casualties to Available.|Up to 2 US Troops from Available to Out of Play.
92|SEALORDS|VNAU||Remove up to 3 insurgent pieces from coastal spaces.|Place up to 3 Guerrillas in coastal spaces.
93|Senator Fulbright|VNUA||Aid +3.|Aid -6. Up to 3 US Troops from Available to Out of Play.
94|Tunnel Rats|VUAN||Up to 2 Tunneled Bases lose their Tunnel marker.|Up to 2 insurgent Bases gain a Tunnel marker.
95|Westmoreland|VNAU||Place up to 4 US Troops in South Vietnam, then a free US Assault.|Remove up to 3 US Troops from the map to Casualties.
96|APC|VNUA||Place up to 3 ARVN Troops in South Vietnam, then a free ARVN Sweep in up to 2 spaces.|Remove up to 3 ARVN Troops.
97|Brinks Hotel|VUAN||Shift 1 City one level toward Support.|Shift up to 2 Cities one level toward Opposition; Terror in Saigon. Aid -3.
98|Long Tan|VNAU||Remove up to 3 VC Guerrillas in one South Vietnam Province.|Remove up to 2 US Troops from South Vietnam.
99|Masher/White Wing|VNUA||Free US Sweep then Assault in Binh Dinh.|Place 2 Guerrillas in Binh Dinh; remove up to 2 US Troops there.
100|Rach Ba Rai|VUAN||Free ARVN Sweep then Assault in the Mekong Delta.|Place up to 3 VC Guerrillas in the Delta; Terror there.
101|Booby Traps|VNAU|c|Capability: Booby Traps - insurgent Ambush/defence weakened.|Capability: Booby Traps - Sweep/Assault losses for COIN.
102|Cu Chi|VNUA||Free ARVN Assault in Tay Ninh / Saigon.|Place a Tunneled VC Base and 2 Guerrillas in Tay Ninh.
103|Kent State|VUAN||Aid +3.|Remove up to 3 US Troops from the map Out of Play. Aid -3.
104|Main Force Bns|VNAU|c|Capability: Main Force Bns - Guerrilla concentrations limited.|Capability: Main Force Bns - VC Attack/March stronger.
105|Rural Pressure|VNUA||Shift up to 2 spaces one level toward Support.|Shift up to 2 spaces one level toward Opposition.
106|Binh Duong|VUAN||Free US Sweep then Assault in Tay Ninh / An Loc.|Place up to 3 VC Guerrillas in Tay Ninh / An Loc / Phuoc Long.
107|Burning Bonze|VNAU||Patronage +3. Shift up to 1 space one level toward Support.|Shift up to 2 spaces one level toward Opposition. Patronage -3.
108|Draft Dodgers|VNUA||Up to 3 US Troops from Out of Play to Available.|Up to 3 US Troops from Available to Out of Play.
109|Nguyen Huu Tho|VUAN||Remove up to 3 VC pieces in Provinces.|Place up to 3 VC Guerrillas; VC Resources +3.
110|No Contact|VNAU||Remove up to 3 Guerrillas in Provinces.|Free Ambush by the executing insurgent.
111|Agent Orange|VNUA||Remove up to 3 Guerrillas from Jungle spaces.|Place up to 3 Guerrillas in Jungle spaces.
112|Colonel Chau|VUAN||Place up to 2 ARVN Police in a Province and shift it one level toward Support.|Remove up to 2 Police; shift up to 2 spaces toward Opposition.
113|Ruff Puff|VNAU||Place up to 4 ARVN Police in South Vietnam Cities/Provinces.|Remove up to 4 ARVN Police.
114|Tri Quang|VNUA||Shift up to 2 spaces one level toward Support.|Shift up to 3 spaces one level toward Opposition.
115|Typhoon Kate|VUAN|m|Momentum (until Coup): no NVA/VC Rally or March in Provinces without adjacent friendly pieces (Typhoon Kate).|NVA Resources +3.
116|Cadres|VNAU|c|Capability: Cadres - Terror/Agitate limited.|Capability: Cadres - VC Rally/Terror stronger.
117|Corps Commanders|VNUA||Patronage +5. Place up to 2 ARVN Rangers.|Patronage -5.
118|Korean War Arms|VUAN||NVA Resources -3. Trail -1.|NVA and VC Resources +6 each.
119|My Lai|VNAU||Shift up to 1 space one level toward Support.|Shift up to 3 spaces one level toward Opposition. Aid -3.
120|US Press Corps|VNUA||Shift up to 2 spaces one level toward Support.|VC Resources +3. Shift up to 2 spaces one level toward Opposition.
121|Linebacker II|UANV||Trail to 0. NVA Resources -50%. The US may Air Strike anywhere.|
122|Easter Offensive|NAUV||NVA free March, then free Attack with +1 bonus.|
123|Vietnamization|AUNV||US Troops on the map to Available. Free ARVN Train and Govern.|
124|Tet Offensive|VNAU||Free VC Terror in every space with VC Guerrillas, then free VC Attack.|
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
