// Shared contract for the whole game. Every module builds on these types.
// Keep this file stable: other modules depend on the exact names below.

export type Faction = 'US' | 'ARVN' | 'NVA' | 'VC';
export const FACTIONS: Faction[] = ['US', 'ARVN', 'NVA', 'VC'];
export const COIN: Faction[] = ['US', 'ARVN'];
export const INSURGENTS: Faction[] = ['NVA', 'VC'];

// Every physical piece state that can sit in a map space.
// Guerrillas / Irregulars / Rangers have Underground (_u) and Active (_a) sides.
// Tunnels are Bases with a Tunnel marker.
export type PieceKind =
  | 'us_troops' | 'us_base' | 'us_irreg_u' | 'us_irreg_a'
  | 'arvn_troops' | 'arvn_police' | 'arvn_ranger_u' | 'arvn_ranger_a' | 'arvn_base'
  | 'nva_troops' | 'nva_guer_u' | 'nva_guer_a' | 'nva_base' | 'nva_tunnel'
  | 'vc_guer_u' | 'vc_guer_a' | 'vc_base' | 'vc_tunnel';

export const PIECE_KINDS: PieceKind[] = [
  'us_troops', 'us_base', 'us_irreg_u', 'us_irreg_a',
  'arvn_troops', 'arvn_police', 'arvn_ranger_u', 'arvn_ranger_a', 'arvn_base',
  'nva_troops', 'nva_guer_u', 'nva_guer_a', 'nva_base', 'nva_tunnel',
  'vc_guer_u', 'vc_guer_a', 'vc_base', 'vc_tunnel',
];

// Off-map pools (Available / Casualties / Out of Play) track piece TYPES, not sides.
export type PoolKind =
  | 'us_troops' | 'us_base' | 'us_irreg'
  | 'arvn_troops' | 'arvn_police' | 'arvn_ranger' | 'arvn_base'
  | 'nva_troops' | 'nva_guer' | 'nva_base'
  | 'vc_guer' | 'vc_base';

export const POOL_KINDS: PoolKind[] = [
  'us_troops', 'us_base', 'us_irreg',
  'arvn_troops', 'arvn_police', 'arvn_ranger', 'arvn_base',
  'nva_troops', 'nva_guer', 'nva_base',
  'vc_guer', 'vc_base',
];

export type SpaceType = 'city' | 'province' | 'loc';
export type Terrain = 'highland' | 'jungle' | 'lowland';
export type Country = 'south_vietnam' | 'north_vietnam' | 'laos' | 'cambodia';

// Static map definition (src/data/map.ts).
export interface SpaceDef {
  id: string;             // stable snake_case id, e.g. 'saigon', 'quang_tri_thua_thien', 'loc_hue_da_nang'
  name: string;           // display name
  type: SpaceType;
  pop: number;            // population (0 for LoCs / 0-pop provinces)
  econ: number;           // economic value (LoCs only, else 0)
  terrain: Terrain | null;// provinces only
  country: Country;
  coastal: boolean;
  highway: boolean;       // LoC is a Highway (vs Mekong)
  mekong: boolean;        // LoC is (or includes) a Mekong segment
  adjacent: string[];     // ids of adjacent spaces (symmetric)
  x: number;              // board layout coordinates in [0,100] (west->east)
  y: number;              // board layout coordinates in [0,140] (north->south)
}

export type SupportLevel = -2 | -1 | 0 | 1 | 2; // -2 Active Opposition .. +2 Active Support

export interface SpaceState {
  pieces: Partial<Record<PieceKind, number>>;
  support: SupportLevel;   // always 0 for LoCs and 0-pop spaces
  terror: number;          // Terror markers (provinces/cities) or Sabotage (LoCs, 0/1)
}

export type CardShading = 'unshaded' | 'shaded';

export interface CardDef {
  id: number;               // 1..130 events, 125..130 are coup cards in the physical game
  title: string;
  coup: boolean;
  order: Faction[];         // faction eligibility order printed on the card (empty for coup)
  period?: '1964' | '1965' | '1968'; // for period events option
  unshaded: string;         // rules text (display)
  shaded: string;           // rules text (display); '' if none
  capability?: boolean;     // event places a lasting capability marker
  momentum?: boolean;       // unshaded/shaded momentum (lasts until coup)
  pivotal?: Faction;        // pivotal event owner (cards 121-124)
  leader?: boolean;         // coup card naming an RVN leader
  flavor?: string;
}

export type ActionKind = 'op' | 'op_sa' | 'limited_op' | 'event' | 'pass';

export interface Frame {
  state: string;            // key into the STATES registry
  args: any;                // mutable per-frame scratch data (JSON-serializable!)
}

export interface Game {
  version: 1;
  seed: number;             // RNG state (mulberry32)
  scenario: string;
  humans: Faction[];        // factions controlled by people; the rest are AI bots
  log: string[];

  stack: Frame[];           // state machine stack; top = current decision
  active: Faction | null;   // faction who must act at the top frame
  over: boolean;
  result: string | null;    // winner description when over

  spaces: Record<string, SpaceState>;
  available: Record<PoolKind, number>;
  casualties: Record<PoolKind, number>;
  out_of_play: Record<PoolKind, number>;

  resources: Record<'ARVN' | 'NVA' | 'VC', number>; // 0..75
  aid: number;              // 0..75
  patronage: number;        // 0..75
  econ: number;             // computed at coup
  trail: number;            // 0..4

  deck: number[];           // remaining draw pile, top = index 0
  current: number | null;   // card being played
  next: number | null;      // face-up upcoming card
  discard: number[];
  coup_count: number;       // coups resolved so far
  final_coup: boolean;

  // Eligibility for the current card.
  eligible: Record<Faction, boolean>;
  next_ineligible: Faction[];   // factions forced ineligible on the next card
  next_eligible: Faction[];     // factions forced eligible on the next card (events)
  first_faction: Faction | null;   // first eligible faction that acted on the current card
  first_action: ActionKind | null; // what it did
  acted: Faction[];               // factions that executed an Op/Event on the current card

  capabilities: Record<number, CardShading>; // card id -> side in effect
  momentum: number[];         // card ids of momentum events in effect (until coup)
  leader: number | null;      // current RVN leader coup card id (null = Duong Van Minh)
  leader_box: number[];       // prior leaders (count matters for Failed Attempts)
  pivotal_played: Faction[];
  pivotal_available: Faction[]; // factions whose pivotal event is currently playable (conditions tracked by engine)

  undo: string[];             // JSON snapshots for undo (cleared when hidden info revealed)
  tmp: any;                   // free scratch space (JSON-serializable)
}

// What the UI / AI see: a prompt and a list of legal actions for one faction.
export interface ActionOption {
  verb: string;            // e.g. 'space', 'piece', 'choose', 'done', 'undo', 'pass', 'event', 'op'...
  arg?: string | number;   // e.g. space id, piece kind, option key
  label: string;           // human readable
  space?: string;          // space this action relates to (for highlighting / clicking on the 3D map)
  piece?: PieceKind;       // piece kind this action relates to (for clicking pieces on the map)
}

export interface View {
  active: Faction | null;
  prompt: string;
  actions: ActionOption[];
  selected?: string[];     // space ids to show as currently selected
}

// Scenario setup data (src/data/scenarios.ts).
export interface ScenarioDef {
  id: string;                 // 'short' | 'medium' | 'full'
  name: string;               // e.g. 'Short: 1965-1967'
  description: string;
  pieces: Record<string, Partial<Record<PieceKind, number>>>; // initial map pieces by space id
  support: Record<string, SupportLevel>;                      // spaces not listed are Neutral
  available?: Partial<Record<PoolKind, number>>;  // if omitted, engine computes available = totals - map - casualties - out_of_play
  casualties: Partial<Record<PoolKind, number>>;
  out_of_play: Partial<Record<PoolKind, number>>;
  resources: Record<'ARVN' | 'NVA' | 'VC', number>;
  aid: number;
  patronage: number;
  trail: number;
  leader: number | null;      // RVN leader coup card in effect (null = Duong Van Minh)
  leader_box: number[];       // cards already in leader box
  capabilities: Record<number, CardShading>;
  eligible?: Faction[];       // default all
  deck: {
    piles: number;            // number of piles, each shuffled with one Coup card
    events_per_pile: number;
    coup_cards?: number[];    // coup card ids to use (random selection if omitted)
    exclude?: number[];       // card ids not in the deck (e.g. pivotal events, leader cards already used)
    first_card?: number;      // card id forced to be first (optional)
    // Optional: period-event restriction per rules option (not required)
  };
}

// Total piece counts in the game box (force pools).
export const PIECE_TOTALS: Record<PoolKind, number> = {
  us_troops: 40, us_base: 6, us_irreg: 6,
  arvn_troops: 30, arvn_police: 30, arvn_ranger: 6, arvn_base: 3,
  nva_troops: 40, nva_guer: 20, nva_base: 9,
  vc_guer: 30, vc_base: 9,
};
