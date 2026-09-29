// Scenario setups transcribed from the 2018 Rulebook "Scenarios (2.1)" pages.
// Space names in the book -> ids: Quang Tri = quang_tri_thua_thien, Quang Tin = quang_tin_quang_ngai,
// Pleiku = pleiku_darlac, Phu Bon = phu_bon_phu_yen, Quang Duc = quang_duc_long_khanh,
// Binh Tuy = binh_tuy_binh_tuy, Kien Hoa = kien_hoa_vinh_binh, Kien Giang = kien_giang_an_xuyen.
// Available pools are computed by the engine (totals - map - casualties - out of play).
// Pivotal Events are dealt to the Factions (Medium/Full) or removed (Short), never shuffled into the deck.
// Period Events option: the Capabilities listed by the book are in effect at the start and their cards
// are set out of the deck.
import type { PieceKind, ScenarioDef, SupportLevel } from '../core/types';

type Pcs = Partial<Record<PieceKind, number>>;

const PIVOTAL = [121, 122, 123, 124];

const ID: Record<string, string> = {
  hue: 'hue', da_nang: 'da_nang', kontum: 'kontum', qui_nhon: 'qui_nhon', cam_ranh: 'cam_ranh',
  an_loc: 'an_loc', saigon: 'saigon', can_tho: 'can_tho',
  quang_tri: 'quang_tri_thua_thien', quang_nam: 'quang_nam', quang_tin: 'quang_tin_quang_ngai',
  binh_dinh: 'binh_dinh', pleiku: 'pleiku_darlac', phu_bon: 'phu_bon_phu_yen', khanh_hoa: 'khanh_hoa',
  phuoc_long: 'phuoc_long', quang_duc: 'quang_duc_long_khanh', binh_tuy: 'binh_tuy_binh_tuy',
  tay_ninh: 'tay_ninh', kien_phong: 'kien_phong', kien_hoa: 'kien_hoa_vinh_binh', ba_xuyen: 'ba_xuyen',
  kien_giang: 'kien_giang_an_xuyen',
  north_vietnam: 'north_vietnam', central_laos: 'central_laos', southern_laos: 'southern_laos',
  ne_cambodia: 'northeast_cambodia', fishhook: 'the_fishhook', parrots_beak: 'the_parrots_beak',
  sihanoukville: 'sihanoukville',
};

// Builder: put(['hue','da_nang'], {arvn_police: 2}, 1) sets the same pieces/support on several spaces.
function builder() {
  const pieces: Record<string, Pcs> = {};
  const support: Record<string, SupportLevel> = {};
  const put = (names: string[], p: Pcs, sup?: SupportLevel) => {
    for (const n of names) {
      const id = ID[n];
      if (!id) throw new Error(`unknown scenario space ${n}`);
      pieces[id] = { ...(pieces[id] ?? {}), ...p };
      if (sup !== undefined && sup !== 0) support[id] = sup;
    }
  };
  return { pieces, support, put };
}

// ------------------------------------------------------------------ Short: 1965-1967 (Westy's War)
function makeShort(): ScenarioDef {
  const { pieces, support, put } = builder();
  put(['da_nang', 'kontum'], { us_troops: 3, arvn_police: 1 }, 2);
  put(['saigon', 'can_tho'], { us_base: 1, us_troops: 3, arvn_troops: 4, arvn_police: 2, arvn_ranger_u: 1 }, 2);
  put(['quang_tri'], { arvn_base: 1, arvn_troops: 2, nva_base: 1, nva_guer_u: 4 }, -2);
  put(['quang_nam'], { arvn_ranger_u: 1, arvn_police: 1 });
  put(['quang_tin'], { us_troops: 2, arvn_police: 1 });
  put(['binh_dinh'], { us_base: 1, us_irreg_u: 1, us_troops: 4, arvn_troops: 2, arvn_police: 1, vc_base: 1, vc_guer_u: 2 }, 1);
  put(['pleiku'], { us_base: 1, us_irreg_u: 1, us_troops: 1, vc_base: 1, vc_guer_u: 2 });
  put(['khanh_hoa'], { us_irreg_u: 1, us_troops: 1 });
  put(['hue', 'kien_hoa', 'ba_xuyen'], { arvn_police: 2 });
  put(['an_loc', 'qui_nhon', 'cam_ranh'], { arvn_police: 1 }, 1);
  put(['binh_tuy'], { us_troops: 2, arvn_police: 1, vc_base: 1, vc_guer_u: 2 }, 1);
  put(['quang_duc'], { vc_base: 1, vc_guer_u: 2, nva_guer_u: 1 }, -2);
  put(['tay_ninh'], { vc_tunnel: 1, vc_guer_u: 2, nva_guer_u: 1 }, -2);
  put(['kien_phong', 'kien_giang'], { vc_guer_u: 2 }, -2);
  put(['north_vietnam', 'southern_laos'], { nva_base: 2, nva_guer_u: 1, nva_troops: 6 });
  put(['central_laos', 'fishhook', 'parrots_beak'], { nva_base: 1, nva_guer_u: 2 });
  return {
    id: 'short',
    name: 'Short: 1965-1967',
    description: "Westy's War. Escalating battle for the South. Young Turks lead the RVN; three Coup Rounds.",
    pieces, support,
    casualties: {},
    out_of_play: { us_troops: 6, arvn_troops: 10, arvn_ranger: 3 },
    resources: { ARVN: 30, NVA: 15, VC: 10 },
    aid: 15, patronage: 18, trail: 2,
    leader: 126, leader_box: [125],
    capabilities: { 31: 'shaded' },
    eligible: ['US', 'ARVN', 'NVA', 'VC'],
    // 3 piles of 8 Events + 1 Coup (Ky, Thieu, one Failed Attempt). Pivotal Events removed.
    deck: { piles: 3, events_per_pile: 8, coup_cards: [127, 128, 129], exclude: [...PIVOTAL, 31] },
  };
}

// ------------------------------------------------------------------ Medium: 1968-1972 (A Better War)
function makeMedium(): ScenarioDef {
  const { pieces, support, put } = builder();
  put(['north_vietnam', 'central_laos'], { nva_base: 1, nva_guer_u: 1, nva_troops: 9 });
  put(['phuoc_long'], { vc_base: 1, vc_guer_u: 2, nva_guer_u: 1 });
  put(['quang_tri'], { us_base: 1, us_troops: 4, us_irreg_u: 1, arvn_troops: 3, nva_base: 1, nva_guer_u: 3 }, 1);
  put(['quang_nam'], { vc_base: 1, vc_guer_u: 2 }, -2);
  put(['hue', 'da_nang', 'qui_nhon', 'cam_ranh'], { us_troops: 1, arvn_police: 2 }, 1);
  put(['quang_tin'], { us_base: 1, us_troops: 2, arvn_troops: 2, arvn_police: 1 }, 1);
  put(['kontum'], { us_base: 1, us_troops: 1, us_irreg_u: 1 }, 1);
  put(['binh_dinh', 'pleiku', 'khanh_hoa'], { us_troops: 2, us_irreg_u: 1, arvn_police: 1, vc_base: 1, vc_guer_u: 2 }, 2);
  put(['phu_bon'], { us_troops: 3, arvn_troops: 2, arvn_police: 2, vc_guer_u: 2 }, 1);
  put(['binh_tuy'], { us_base: 1, us_troops: 2, arvn_troops: 3, arvn_police: 1, vc_base: 1, vc_guer_u: 2 });
  put(['saigon'], { us_base: 1, us_troops: 2, arvn_troops: 1, arvn_ranger_u: 1, arvn_police: 4, vc_base: 1, vc_guer_u: 1 }, 2);
  put(['quang_duc'], { arvn_troops: 2, arvn_police: 1, vc_guer_u: 1 });
  put(['tay_ninh'], { us_base: 1, us_troops: 3, arvn_troops: 2, arvn_ranger_u: 1, vc_tunnel: 1, vc_guer_u: 3, nva_guer_u: 2 }, -2);
  put(['an_loc'], { arvn_troops: 1, arvn_police: 2 });
  put(['can_tho'], { us_troops: 3, us_irreg_u: 1, arvn_troops: 2, arvn_police: 1 }, 1);
  put(['kien_phong', 'kien_hoa', 'ba_xuyen'], { arvn_police: 1, vc_guer_u: 1 }, -1);
  put(['kien_giang'], { arvn_base: 1, arvn_troops: 2, arvn_ranger_u: 1, vc_guer_u: 1 }, -2);
  put(['southern_laos', 'ne_cambodia', 'fishhook', 'parrots_beak', 'sihanoukville'], { nva_base: 1, nva_guer_u: 2 });
  return {
    id: 'medium',
    name: 'Medium: 1968-1972',
    description: 'A Better War. Looking for light at the end of the tunnel. Ky leads the RVN; three Coup Rounds.',
    pieces, support,
    casualties: {},
    out_of_play: { us_troops: 5, arvn_troops: 10, arvn_ranger: 3 },
    resources: { ARVN: 30, NVA: 20, VC: 15 },
    aid: 30, patronage: 15, trail: 3,
    leader: 127, leader_box: [125, 126],
    // Shaded: AAA(31), Main Force Bns(104), SA-2s(34), Search and Destroy(28); Unshaded: Arc Light(8), M-48 Patton(14)
    capabilities: { 31: 'shaded', 104: 'shaded', 34: 'shaded', 28: 'shaded', 8: 'unshaded', 14: 'unshaded' },
    eligible: ['US', 'ARVN', 'NVA', 'VC'],
    // 3 piles of 12 Events + 1 Coup (Thieu and both Failed Attempts). Pivotal Events dealt to the Factions.
    deck: { piles: 3, events_per_pile: 12, coup_cards: [128, 129, 130], exclude: [...PIVOTAL, 31, 104, 34, 28, 8, 14] },
  };
}

// ------------------------------------------------------------------ Full: 1964-1972 (Nam)
function makeFull(): ScenarioDef {
  const { pieces, support, put } = builder();
  put(['saigon'], { us_base: 1, us_troops: 2, arvn_troops: 2, arvn_police: 3 }, 1);
  put(['hue'], { arvn_troops: 2, arvn_police: 2 });
  put(['qui_nhon', 'cam_ranh', 'an_loc', 'can_tho'], { arvn_troops: 2, arvn_police: 2 }, 1);
  put(['da_nang', 'kontum'], { us_troops: 2, arvn_police: 1 });
  put(['quang_tri', 'binh_dinh'], { us_irreg_u: 1, us_troops: 1, vc_base: 1, vc_guer_u: 2 });
  put(['quang_nam'], { arvn_ranger_u: 1, arvn_police: 1 });
  put(['pleiku'], { us_base: 1, us_irreg_u: 1, us_troops: 1, vc_base: 1, vc_guer_u: 2 });
  put(['quang_tin', 'quang_duc', 'binh_tuy'], { vc_base: 1, vc_guer_u: 2 }, -2);
  put(['tay_ninh'], { vc_tunnel: 1, vc_guer_u: 2 }, -2);
  put(['phu_bon', 'khanh_hoa', 'kien_hoa', 'ba_xuyen'], { arvn_police: 1 }, 1);
  put(['kien_phong', 'kien_giang'], { vc_guer_u: 1 }, -2);
  put(['north_vietnam', 'central_laos', 'southern_laos', 'parrots_beak'], { nva_base: 1, nva_guer_u: 3 });
  return {
    id: 'full',
    name: 'Full: 1964-1972',
    description: 'Nam. Cockpit of the Cold War. Duong Van Minh rules in Saigon; six Coup Rounds.',
    pieces, support,
    casualties: {},
    out_of_play: { us_base: 2, us_troops: 10, arvn_base: 2, arvn_troops: 10, arvn_ranger: 3 },
    resources: { ARVN: 30, NVA: 10, VC: 5 },
    aid: 15, patronage: 15, trail: 1,
    leader: null, leader_box: [],
    capabilities: {},
    eligible: ['US', 'ARVN', 'NVA', 'VC'],
    // Top pile 12 "1964" Events, 2nd and 3rd 12 "1965", bottom three 12 "1968" (period option), each with 1 Coup.
    deck: { piles: 6, events_per_pile: 12, coup_cards: [125, 126, 127, 128, 129, 130], exclude: PIVOTAL },
  };
}

export const SCENARIOS: Record<string, ScenarioDef> = { short: makeShort(), medium: makeMedium(), full: makeFull() };
