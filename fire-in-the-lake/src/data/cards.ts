// All 130 Fire in the Lake cards. Titles/order/flags come from memory of the deck; rules text is a
// concise paraphrase for display only (the engine's event implementations are authoritative).
// Row format: id | title | order (U=US A=ARVN N=NVA V=VC) | flags (c=capability m=momentum) | unshaded | shaded
import type { CardDef, Faction } from '../core/types';

const F: Record<string, Faction> = { U: 'US', A: 'ARVN', N: 'NVA', V: 'VC' };

const ROWS = `
1|Gulf of Tonkin|UANV||Remove a Guerrilla or Base in NVA/VC hands from a coastal space; place US Troops there from Out of Play.|Aid -6 and Available US Troops go Out of Play? (Approximate) NVA and VC gain free Attacks on US.
2|Kissinger|UNAV||Remove a NVA/VC Base in Laos or Cambodia (unshaded per card text).|NVA place a Base in Laos or Cambodia.
3|Peace Talks|UNVA||NVA lose Resources; Trail cannot be improved until Coup.|Shift Support/Opposition; US Available adjustments.
4|Top Gun|UAVN|c|US Air Strike may remove 2 more enemy pieces in one space (capability).|Air Strike removes at most 1 piece (capability).
5|Wild Weasels|UANV|m|Air Strike degrades Trail only with die roll; SA-2 momentum (until Coup).|Air Strike cannot reduce Trail (until Coup).
6|Aces|UAVN||Air Strike may hit 2 spaces; US Troop bonus.|US Air Strike -1 space; casualties.
7|ADSID|UANV|m|-6 NVA Resources at any Trail improvement; Trail +1 cost (until Coup).|NVA Trail improvement free (until Coup).
8|Arc Light|UNAV|c|Air Strike may affect adjacent spaces (capability).|Air Strike limited to 1 space (capability).
9|Psychedelic Cookie|UAVN||US Troops from Casualties to Available.|US Troops from Available to Out of Play.
10|Rolling Thunder|UNAV|m|NVA Resources -9; NVA cannot improve the Trail (until Coup).|No Air Strike in North Vietnam (until Coup).
11|Abrams|UANV|c|US Troops Assault in Highland with 3 Troops per Guerrilla (capability).|US Assault less effective (capability).
12|Capt Buck Adams|UAVN||Remove up to 3 NVA/VC pieces in a Province with US Air Strike.|Place 3 NVA/VC Guerrillas.
13|Cobras|UAVN|c|US or ARVN Sweep helicopters: 2 Guerrillas per Assault (capability).|1 US Troop lost per Assault (capability).
14|M-48 Patton|UAVN|c|US/ARVN Assault removes 2 pieces with Troops in Lowland (capability).|Ambush removes 2 more Troops (capability).
15|Medevac|UAVN|m|US Casualties return to Available instead of Casualties (until Coup).|US Casualties stay Casualties (until Coup).
16|Blowtorch Komer|UAVN|m|Pacification costs 1 fewer Resource per shift; +Aid (until Coup).|Pacification limited (until Coup).
17|Claymores|UANV|m|Guerrillas March/Infiltrate limited; Ambush removes 1 more (until Coup).|Guerrilla March into COIN spaces flips (until Coup).
18|Combined Action Platoons|UAVN|c|US Troops with Police allow Civic Action shifts (capability).|Terror in Support spaces (capability).
19|CORDS|UAVN|c|Pacification: shift 2 levels in one space (capability).|Pacification shifts only 1 level (capability).
20|Laser Guided Bombs|UNAV|c|Air Strike removes without US Troop loss (capability).|Air Strike must remove Underground only (capability).
21|Americal|UAVN||Place US Troops from Available in South Vietnam.|VC/NVA remove 3 US Troops.
22|Da Nang|UAVN|m|US Troops in Da Nang, Air Lift free; Da Nang stays COIN Controlled (until Coup).|VC/NVA place Guerrillas near Da Nang (until Coup).
23|Operation Attleboro|UAVN||Free US Sweep and Assault in Tay Ninh, Phuoc Long, Fishhook.|VC attack: US Troops removed.
24|Operation Starlite|UAVN||Free Sweep or Assault; remove VC Base in coastal Province.|VC/NVA place Base in coastal Province.
25|TF-116 Riverines|UANV||US/ARVN free Sweep/Assault along Mekong.|VC Terror on the Mekong.
26|LRRP|UAVN||Remove up to 3 NVA/VC pieces near Laos/Cambodia.|Place VC Guerrillas.
27|Phoenix Program|UAVN||Remove Underground VC Guerrillas; ARVN Patronage.|VC place Guerrillas, Terror.
28|Search and Destroy|UAVN|c|US/ARVN Sweep activates 1 more Guerrilla; Assault in Jungle (capability).|Sweep activates fewer Guerrillas (capability).
29|Tribesmen|UAVN||Place 4 Irregulars in Highlands.|Remove 4 Irregulars; VC Terror.
30|USS New Jersey|UAVN||Free Air Strike-like removal in coastal spaces.|NVA/VC place Guerrillas in coastal spaces.
31|AAA|NAUV|c|Air Strike: die roll to degrade Trail negated (capability).|NVA: Air Strike removes at most 1; costs US Troop on roll 1-3 (capability).
32|Long Range Guns|NUAV|c|NVA Bombard removes only 1 Troop (capability).|Bombard removes 2 more Troops (capability).
33|MiGs|NUVA|c|Air Strike degrades Trail on roll 4-6 (capability).|Air Strike may lose US Troop (capability).
34|SA-2s|NUAV|c|Air Strike may degrade Trail on roll 4-6 (capability).|US Air Strike may lose Troop on roll 1-3 (capability).
35|Thanh Hoa|NUAV||Air Strike removes NVA pieces in North Vietnam.|NVA gain Resources; Trail +1.
36|Ia Drang|UNAV||US Troops Sweep/Assault free in Pleiku, remove NVA Troops.|NVA Troops Attack US.
37|Khe Sanh|UNAV||US Troops in Quang Tri: free Assault; NVA Troops removed.|NVA Attack; US Troops lost.
38|McNamara Line|UNAV|m|NVA cannot March into South Vietnam without cost (until Coup).|NVA March free of restriction (until Coup).
39|Oriskany|UAVN|m|US Air Strike may degrade Trail (until Coup).|Air Strike prevented on Trail (until Coup).
40|Hamburger Hill|UNAV||US Troops Assault in Highland; NVA Troops removed.|US Troops removed from Highland.
41|Bombing Pause|UNVA|m|Air Strike cannot be used (until Coup).|Air Strike limited; NVA Resources +.
42|Sappers|NVUA||Remove COIN pieces in a space.|US/ARVN gains.
43|Rat Pack|NUVA||NVA/VC Troops removed.|COIN pieces removed near Cambodia.
44|Ho Chi Minh Trail|NVAU||Trail degraded.|Trail improved 2.
45|PT-76|NAUV|c|NVA Attack removes fewer (capability).|NVA Attack removes 2 more COIN pieces (capability).
46|559th Transport Grp|NUAV|m|Trail improvement costs more; Infiltrate limited (until Coup).|Trail improvement free; Infiltrate stronger (until Coup).
47|Russian Arms|NVUA||NVA Resources -.|NVA Resources +; place NVA Troops.
48|Long Tan|UNAV||US free Assault; NVA/VC pieces removed.|VC Attack.
49|Masher/White Wing|UAVN||Free Sweep/Assault; remove pieces in Binh Dinh.|VC place Guerrillas in Binh Dinh.
50|Rach Ba Rai|UAVN||Free Sweep in Mekong Delta.|VC Terror in Mekong Delta.
51|Henry Cabot Lodge|AUNV||Aid +; Patronage transfer.|ARVN Patronage -; Aid -.
52|Nguyen Chanh Thi|AUVN||ARVN Troops free Sweep; Patronage.|VC/NVA gain Support shifts.
53|Ruff-Puff|AUVN||Place Police and Troops.|Remove Police.
54|Green Berets|AUVN||Place Irregulars, free Civic Action.|Remove Irregulars.
55|Rangers|AUNV||Place Rangers.|Remove Rangers.
56|Ambassador Taylor|AUVN||Aid +.|Aid -.
57|Cambodian Civil War|AUNV||Remove NVA in Cambodia.|Place NVA in Cambodia.
58|Sihanouk|AVNU||Remove NVA/VC Bases in Cambodia.|NVA/VC place in Cambodia.
59|Honolulu Conference|AUNV||Aid; US gains.|Support shifts.
60|Election|AUNV||Patronage +, Aid +.|Patronage shifts.
61|Armored Cavalry|AUVN|c|ARVN Assault Troops in Lowland (capability).|ARVN Assault less effective (capability).
62|Chu Luc|AVNU||ARVN Troops free March.|NVA Troops place.
63|Duong Van Minh|AUNV||Patronage +3.|Patronage -3.
64|Tri Quang|AUNV||Remove Support.|Shift Support to Opposition.
65|Bob Hope|AUVN||US gains Support.|US loses.
66|Walt Rostow|AUNV||Aid +.|Aid -.
67|Robert McNamara|AUNV||Aid; US Troops.|US Troops out.
68|Domino Theory|AUNV||US Resources.|Support -.
69|Nguyen Huu Co|ANUV||Aid +; Patronage.|Aid -; Patronage.
70|Colonel Chau|AUVN||Place Police, Pacify.|Remove Police, Terror.
71|My Lai|VUNA||Shift Support toward Neutral.|VC gain.
72|Body Count|AUVN|m|Assault/Sweep count kills as Aid; Casualties (until Coup).|Body Count ignored (until Coup).
73|Fragging|VUAN||US Troops removed.|Place US Troops.
74|Kent State|VUAN||Support shift.|Opposition shift.
75|Burning Bonze|VUAN||Aid -.|Opposition +.
76|Fact Finding|AUVN||Place Police.|Remove Police.
77|Bribery|AUVN||Patronage.|Patronage -.
78|General Lansdale|AUVN|m|Pacification: Assault limits; ARVN Patronage (until Coup).|Pacification/Assault penalties (until Coup).
79|Ky|AUVN||Patronage.|Patronage -.
80|Westmoreland|UAVN||US Troops.|Casualties.
81|Sappers Attack|NVUA||Remove COIN.|Remove more.
82|Plei Mei|NUAV||NVA Troops.|NVA Attack.
83|Cu Chi|VUAN||VC Base removed.|VC gains Tunnel.
84|Ap Bac|VAUN||VC pieces removed.|VC Attack.
85|Brinks Hotel|VUAN||VC Terror.|VC Terror in Saigon.
86|Mandate of Heaven|AUVN|c|Govern: ARVN Patronage +(capability).|Govern costs Aid (capability).
87|Turning Point|VUAN||US Support.|VC Opposition.
88|Draft Dodgers|VNUA||US Troops.|US Troops out.
89|Uncle Ho|NVUA||NVA Resources.|NVA gains.
90|Vo Nguyen Giap|NVUA||NVA Troops removed.|NVA gains Resources.
91|Annam|NVUA||NVA Resources.|NVA Bases.
92|Trucks|NVUA||Trail -1.|Trail +1.
93|Lam Son 719|UANV||ARVN Troops Assault in Laos.|ARVN Troops lost.
94|Vietnamization|AUNV||ARVN Troops from Out of Play.|ARVN Troops replaced.
95|Operation Pegasus|UANV||US Sweep to Khe Sanh.|NVA Attack.
96|Ambush|VNUA||VC Ambush.|VC Guerrillas.
97|Tunnel Rats|UAVN||Remove Tunnel marker.|VC Tunnels.
98|Sea Lords|UAVN||Free Sweep Mekong.|VC.
99|Operation Menu|UNAV||Remove NVA Bases in Cambodia.|NVA gains.
100|Mining of Haiphong|UNAV||NVA Resources -.|NVA gains.
101|Booby Traps|VNUA|c|Sweep/Assault costs a Troop on roll 1-3 (capability).|Sweep/Assault loses Troops (capability).
102|Cadres Growth|VNUA||VC gains Guerrillas.|VC Base.
103|Recruitment|VNUA||VC Rally free.|VC Rally.
104|Main Force Bns|VNAU|c|VC Attack with 3 Guerrillas (capability).|VC Attack needs fewer (capability).
105|Rural Pressure|VNAU||VC Tax.|VC Terror.
106|Binh Duong|VUAN||Remove VC.|Place VC.
107|Huk|VUAN||VC Rally.|VC gains.
108|Vo Nguyen|VNUA||VC Resources.|VC Resources -.
109|Pathet Lao|NVUA||Remove NVA in Laos.|NVA in Laos.
110|Ravine|VUAN||VC.|VC.
111|Tet Truce|VUAN||Truce.|Truce.
112|Chinese Support|NVUA||NVA Resources.|NVA Resources +.
113|Soviet Aid|NVUA||Trail.|Trail.
114|Peasant Uprising|VUAN||Opposition.|Opposition.
115|Typhoon Kate|UAVN|m|No Air Lift, Transport, Air Strike; Troops mobility reduced (until Coup).|Movement limited (until Coup).
116|Cadres|VNUA|c|VC Rally/Terror limited (capability).|VC Terror/Agitate extra (capability).
117|Sabotage|VNUA||Sabotage LoCs.|Sabotage LoCs.
118|Agent Orange|UAVN||Remove Jungle cover.|Place VC.
119|Monsoon|NVUA||Trail.|Trail.
120|Tunnel Warfare|VNUA||VC Tunnels.|VC Tunnels.
121|Linebacker II|UANV|||US pivotal: Trail to 1 etc.|
122|Easter Offensive|NAUV|||NVA pivotal: free Attack/March.|
123|Vietnamization|AUNV|||ARVN pivotal: ARVN placement.|
124|Tet Offensive|VNAU|||VC pivotal: free Terror/Attack.|
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
