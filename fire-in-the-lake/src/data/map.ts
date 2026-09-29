// Fire in the Lake map: 8 cities, 23 provinces (incl. North Vietnam, Laos, Cambodia), 17 LoCs.
// Layout: x 0..100 (west->east), y 0..140 (north->south).
import type { Country, SpaceDef, Terrain } from '../core/types';

interface Node { id: string; name: string; x: number; y: number }

// Towns are not spaces but LoCs meeting at a town are adjacent to each other.
const TOWNS: Record<string, [number, number]> = {
  khe_sanh: [44, 20], dak_to: [46, 50], ban_me_thuot: [54, 82], da_lat: [74, 104],
  chau_doc: [38, 130], bac_lieu: [56, 139], long_phu: [72, 134],
};

interface P {
  id: string; name: string; type: 'city' | 'province'; pop: number; terrain?: Terrain;
  country?: Country; coastal?: boolean; x: number; y: number;
}
const N = (id: string, name: string, pop: number, x: number, y: number, terrain: Terrain, country: Country, coastal = false): P =>
  ({ id, name, type: 'province', pop, terrain, country, coastal, x, y });
const C = (id: string, name: string, pop: number, x: number, y: number, coastal = false): P =>
  ({ id, name, type: 'city', pop, coastal, x, y });

const PLACES: P[] = [
  C('hue', 'Hue', 2, 80, 22, true),
  C('da_nang', 'Da Nang', 1, 82, 40, true),
  C('kontum', 'Kontum', 1, 44, 62),
  C('qui_nhon', 'Qui Nhon', 1, 86, 68, true),
  C('cam_ranh', 'Cam Ranh', 1, 88, 94, true),
  C('an_loc', 'An Loc', 1, 40, 100),
  C('saigon', 'Saigon', 6, 60, 116, true),
  C('can_tho', 'Can Tho', 1, 50, 130),
  N('north_vietnam', 'North Vietnam', 0, 40, 6, 'highland', 'north_vietnam', true),
  N('central_laos', 'Central Laos', 0, 20, 32, 'jungle', 'laos'),
  N('southern_laos', 'Southern Laos', 0, 18, 54, 'jungle', 'laos'),
  N('northeast_cambodia', 'Northeast Cambodia', 0, 20, 78, 'jungle', 'cambodia'),
  N('the_fishhook', 'The Fishhook', 0, 20, 98, 'jungle', 'cambodia'),
  N('the_parrots_beak', "The Parrot's Beak", 0, 22, 116, 'jungle', 'cambodia'),
  N('sihanoukville', 'Sihanoukville', 0, 8, 132, 'lowland', 'cambodia', true),
  N('quang_tri_thua_thien', 'Quang Tri–Thua Thien', 2, 62, 24, 'highland', 'south_vietnam', true),
  N('quang_nam', 'Quang Nam', 1, 62, 40, 'highland', 'south_vietnam', true),
  N('quang_tin_quang_ngai', 'Quang Tin–Quang Ngai', 2, 64, 54, 'highland', 'south_vietnam', true),
  N('binh_dinh', 'Binh Dinh', 2, 66, 68, 'highland', 'south_vietnam', true),
  N('pleiku_darlac', 'Pleiku–Darlac', 1, 46, 76, 'highland', 'south_vietnam'),
  N('phu_bon_phu_yen', 'Phu Bon–Phu Yen', 1, 68, 82, 'lowland', 'south_vietnam', true),
  N('khanh_hoa', 'Khanh Hoa', 1, 70, 94, 'highland', 'south_vietnam', true),
  N('phuoc_long', 'Phuoc Long', 0, 46, 90, 'jungle', 'south_vietnam'),
  N('quang_duc_long_khanh', 'Quang Duc–Long Khanh', 1, 58, 102, 'jungle', 'south_vietnam'),
  N('binh_tuy_binh_tuy', 'Binh Tuy–Binh Tuy', 1, 80, 110, 'jungle', 'south_vietnam', true),
  N('tay_ninh', 'Tay Ninh', 2, 38, 112, 'lowland', 'south_vietnam'),
  N('kien_phong', 'Kien Phong', 2, 34, 122, 'lowland', 'south_vietnam'),
  N('kien_hoa_vinh_binh', 'Kien Hoa–Vinh Binh', 2, 68, 126, 'lowland', 'south_vietnam', true),
  N('ba_xuyen', 'Ba Xuyen', 2, 62, 136, 'lowland', 'south_vietnam', true),
  N('kien_giang_an_xuyen', 'Kien Giang–An Xuyen', 2, 34, 138, 'lowland', 'south_vietnam', true),
];

// Province/city adjacency (non-LoC).
const EDGES: [string, string][] = [
  ['north_vietnam', 'central_laos'], ['north_vietnam', 'quang_tri_thua_thien'],
  ['central_laos', 'quang_tri_thua_thien'], ['central_laos', 'quang_nam'], ['central_laos', 'southern_laos'],
  ['southern_laos', 'quang_nam'], ['southern_laos', 'quang_tin_quang_ngai'], ['southern_laos', 'binh_dinh'],
  ['southern_laos', 'pleiku_darlac'], ['southern_laos', 'northeast_cambodia'],
  ['northeast_cambodia', 'pleiku_darlac'], ['northeast_cambodia', 'the_fishhook'],
  ['northeast_cambodia', 'phuoc_long'], ['northeast_cambodia', 'quang_duc_long_khanh'],
  ['the_fishhook', 'the_parrots_beak'], ['the_fishhook', 'phuoc_long'], ['the_fishhook', 'tay_ninh'], ['the_fishhook', 'an_loc'],
  ['the_parrots_beak', 'sihanoukville'], ['the_parrots_beak', 'tay_ninh'], ['the_parrots_beak', 'saigon'],
  ['the_parrots_beak', 'kien_phong'], ['the_parrots_beak', 'kien_giang_an_xuyen'],
  ['sihanoukville', 'kien_giang_an_xuyen'],
  ['quang_tri_thua_thien', 'quang_nam'], ['quang_tri_thua_thien', 'hue'], ['quang_nam', 'da_nang'],
  ['quang_nam', 'quang_tin_quang_ngai'], ['quang_tin_quang_ngai', 'binh_dinh'],
  ['binh_dinh', 'pleiku_darlac'], ['binh_dinh', 'phu_bon_phu_yen'], ['binh_dinh', 'qui_nhon'],
  ['pleiku_darlac', 'phu_bon_phu_yen'], ['pleiku_darlac', 'khanh_hoa'], ['pleiku_darlac', 'quang_duc_long_khanh'],
  ['pleiku_darlac', 'phuoc_long'], ['pleiku_darlac', 'kontum'],
  ['phu_bon_phu_yen', 'khanh_hoa'], ['phu_bon_phu_yen', 'qui_nhon'], ['khanh_hoa', 'quang_duc_long_khanh'],
  ['khanh_hoa', 'binh_tuy_binh_tuy'], ['khanh_hoa', 'cam_ranh'],
  ['phuoc_long', 'quang_duc_long_khanh'], ['phuoc_long', 'tay_ninh'], ['phuoc_long', 'an_loc'],
  ['quang_duc_long_khanh', 'binh_tuy_binh_tuy'], ['quang_duc_long_khanh', 'saigon'],
  ['binh_tuy_binh_tuy', 'saigon'], ['binh_tuy_binh_tuy', 'cam_ranh'],
  ['tay_ninh', 'saigon'], ['tay_ninh', 'an_loc'], ['tay_ninh', 'kien_phong'],
  ['saigon', 'kien_hoa_vinh_binh'],
  ['kien_phong', 'kien_hoa_vinh_binh'], ['kien_phong', 'kien_giang_an_xuyen'], ['kien_phong', 'can_tho'],
  ['kien_hoa_vinh_binh', 'ba_xuyen'], ['kien_hoa_vinh_binh', 'can_tho'],
  ['ba_xuyen', 'kien_giang_an_xuyen'], ['ba_xuyen', 'can_tho'], ['kien_giang_an_xuyen', 'can_tho'],
];

// LoCs: [id, name, econ, ends (cities or towns), adjacent provinces, mekong]
const LOCS: [string, string, number, string[], string[], boolean][] = [
  ['loc_hue_khe_sanh', 'Hue–Khe Sanh', 1, ['hue', 'khe_sanh'], ['quang_tri_thua_thien'], false],
  ['loc_hue_da_nang', 'Hue–Da Nang', 1, ['hue', 'da_nang'], ['quang_tri_thua_thien', 'quang_nam'], false],
  ['loc_da_nang_dak_to', 'Da Nang–Dak To', 0, ['da_nang', 'dak_to'], ['quang_nam', 'quang_tin_quang_ngai', 'pleiku_darlac'], false],
  ['loc_da_nang_qui_nhon', 'Da Nang–Qui Nhon', 1, ['da_nang', 'qui_nhon'], ['quang_tin_quang_ngai', 'binh_dinh'], false],
  ['loc_kontum_dak_to', 'Kontum–Dak To', 0, ['kontum', 'dak_to'], ['pleiku_darlac'], false],
  ['loc_kontum_qui_nhon', 'Kontum–Qui Nhon', 1, ['kontum', 'qui_nhon'], ['pleiku_darlac', 'binh_dinh'], false],
  ['loc_kontum_ban_me_thuot', 'Kontum–Ban Me Thuot', 1, ['kontum', 'ban_me_thuot'], ['pleiku_darlac'], false],
  ['loc_qui_nhon_cam_ranh', 'Qui Nhon–Cam Ranh', 1, ['qui_nhon', 'cam_ranh'], ['binh_dinh', 'phu_bon_phu_yen', 'khanh_hoa'], false],
  ['loc_cam_ranh_da_lat', 'Cam Ranh–Da Lat', 1, ['cam_ranh', 'da_lat'], ['khanh_hoa', 'quang_duc_long_khanh'], false],
  ['loc_ban_me_thuot_da_lat', 'Ban Me Thuot–Da Lat', 0, ['ban_me_thuot', 'da_lat'], ['pleiku_darlac', 'quang_duc_long_khanh'], false],
  ['loc_saigon_cam_ranh', 'Saigon–Cam Ranh', 1, ['saigon', 'cam_ranh'], ['binh_tuy_binh_tuy', 'khanh_hoa'], false],
  ['loc_saigon_da_lat', 'Saigon–Da Lat', 1, ['saigon', 'da_lat'], ['quang_duc_long_khanh', 'binh_tuy_binh_tuy'], false],
  ['loc_saigon_an_loc_ban_me_thuot', 'Saigon–An Loc–Ban Me Thuot', 1, ['saigon', 'an_loc', 'ban_me_thuot'], ['tay_ninh', 'phuoc_long', 'quang_duc_long_khanh'], false],
  ['loc_saigon_can_tho', 'Saigon–Can Tho', 2, ['saigon', 'can_tho'], ['kien_hoa_vinh_binh'], true],
  ['loc_can_tho_chau_doc', 'Can Tho–Chau Doc', 1, ['can_tho', 'chau_doc'], ['kien_phong', 'kien_giang_an_xuyen'], true],
  ['loc_can_tho_bac_lieu', 'Can Tho–Bac Lieu', 0, ['can_tho', 'bac_lieu'], ['ba_xuyen', 'kien_giang_an_xuyen'], true],
  ['loc_can_tho_long_phu', 'Can Tho–Long Phu', 1, ['can_tho', 'long_phu'], ['ba_xuyen'], true],
];

// Manual layout overrides for LoCs whose midpoint would collide with a province.
const LOC_POS: Record<string, [number, number]> = {
  loc_hue_khe_sanh: [56, 10], loc_hue_da_nang: [88, 31], loc_da_nang_dak_to: [66, 46],
  loc_kontum_dak_to: [38, 55], loc_kontum_qui_nhon: [70, 62], loc_kontum_ban_me_thuot: [52, 70],
  loc_ban_me_thuot_da_lat: [62, 92], loc_saigon_an_loc_ban_me_thuot: [50, 96],
  loc_saigon_cam_ranh: [76, 102], loc_can_tho_chau_doc: [42, 132], loc_can_tho_bac_lieu: [55, 136],
  loc_can_tho_long_phu: [58, 128], loc_saigon_can_tho: [56, 122],
};

function build(): SpaceDef[] {
  const adj: Record<string, Set<string>> = {};
  const link = (a: string, b: string) => {
    if (a === b) return;
    (adj[a] ??= new Set()).add(b);
    (adj[b] ??= new Set()).add(a);
  };
  const cityIds = new Set(PLACES.filter((p) => p.type === 'city').map((p) => p.id));
  const pos: Record<string, [number, number]> = { ...TOWNS };
  for (const p of PLACES) { pos[p.id] = [p.x, p.y]; adj[p.id] ??= new Set(); }
  for (const [a, b] of EDGES) link(a, b);
  for (const l of LOCS) {
    adj[l[0]] ??= new Set();
    for (const pr of l[4]) link(l[0], pr);
    for (const e of l[3]) if (cityIds.has(e)) link(l[0], e);
  }
  for (let i = 0; i < LOCS.length; i++) {
    for (let j = i + 1; j < LOCS.length; j++) {
      if (LOCS[i][3].some((e) => LOCS[j][3].includes(e))) link(LOCS[i][0], LOCS[j][0]);
    }
  }
  const out: SpaceDef[] = [];
  for (const p of PLACES) {
    out.push({
      id: p.id, name: p.name, type: p.type, pop: p.pop, econ: 0,
      terrain: p.type === 'province' ? p.terrain! : null,
      country: p.country ?? 'south_vietnam', coastal: !!p.coastal, highway: false, mekong: false,
      adjacent: [...adj[p.id]].sort(), x: p.x, y: p.y,
    });
  }
  for (const [id, name, econ, ends, , mekong] of LOCS) {
    // LoC drawn at the midpoint of its ends, nudged to keep clear of provinces.
    const pts = ends.map((e) => pos[e]);
    const mx = pts.reduce((s, q) => s + q[0], 0) / pts.length;
    const my = pts.reduce((s, q) => s + q[1], 0) / pts.length;
    out.push({
      id, name, type: 'loc', pop: 0, econ, terrain: null, country: 'south_vietnam', coastal: false,
      highway: !mekong, mekong, adjacent: [...adj[id]].sort(),
      x: LOC_POS[id]?.[0] ?? Math.round(mx * 10) / 10, y: LOC_POS[id]?.[1] ?? Math.round(my * 10) / 10,
    });
  }
  return out;
}

export const SPACES: SpaceDef[] = build();
export const MAP: Record<string, SpaceDef> = Object.fromEntries(SPACES.map((s) => [s.id, s]));
export const SPACE_IDS: string[] = SPACES.map((s) => s.id);
