// 3D piece meshes, layout per space, and diff-driven animation.
import * as THREE from 'three';
import type { Game, PieceKind, PoolKind } from '../core/types';
import { PIECE_KINDS } from '../core/types';
import { FACTION_OF, POOL_OF } from '../core/pieces';
import type { Board, SpaceNode } from './board';
import { easeInOut, easeOut, type Stage } from './scene';

export const FACTION_COLOR = { US: 0x6f8f2a, ARVN: 0xe8c62c, NVA: 0xd33a2e, VC: 0x2f74e0 } as const;
export const FACTION_CSS = { US: '#8fb43a', ARVN: '#f0cf3a', NVA: '#e0483b', VC: '#4a8cf0' } as const;

const ORDER: PieceKind[] = [
  'us_base', 'us_troops', 'us_irreg_u', 'us_irreg_a',
  'arvn_base', 'arvn_troops', 'arvn_police', 'arvn_ranger_u', 'arvn_ranger_a',
  'nva_base', 'nva_tunnel', 'nva_troops', 'nva_guer_u', 'nva_guer_a',
  'vc_base', 'vc_tunnel', 'vc_guer_u', 'vc_guer_a',
];
const KIND_RANK = Object.fromEntries(ORDER.map((k, i) => [k, i])) as Record<PieceKind, number>;

const PS = 1.3; // global piece size multiplier
const STACK: Partial<Record<PieceKind, number>> = {
  us_troops: 4, arvn_troops: 4, arvn_police: 4, nva_troops: 4,
  us_base: 3, arvn_base: 3, nva_base: 3, vc_base: 3, nva_tunnel: 3, vc_tunnel: 3,
};
const HEIGHT: Partial<Record<PieceKind, number>> = {
  us_troops: 0.27, arvn_troops: 0.27, arvn_police: 0.27, nva_troops: 0.27,
  us_base: 0.16, arvn_base: 0.16, nva_base: 0.16, vc_base: 0.16, nva_tunnel: 0.16, vc_tunnel: 0.16,
};

const geo = {
  cube: new THREE.BoxGeometry(0.3, 0.27, 0.3),
  police: new THREE.BoxGeometry(0.34, 0.2, 0.22),
  tall: new THREE.CylinderGeometry(0.135, 0.15, 0.46, 20),
  short: new THREE.CylinderGeometry(0.15, 0.15, 0.2, 20),
  cap: new THREE.SphereGeometry(0.1, 12, 8),
  base: new THREE.CylinderGeometry(0.25, 0.27, 0.16, 6),
  baseTop: new THREE.CylinderGeometry(0.13, 0.15, 0.06, 6),
  ring: new THREE.TorusGeometry(0.17, 0.028, 8, 24),
  tunnel: new THREE.TorusGeometry(0.31, 0.055, 8, 6),
  glow: new THREE.RingGeometry(0.2, 0.34, 24),
};

const matCache = new Map<string, THREE.MeshStandardMaterial>();
function mat(color: number, k = 1, extra: Partial<THREE.MeshStandardMaterialParameters> = {}): THREE.MeshStandardMaterial {
  const key = `${color}|${k}|${JSON.stringify(extra)}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(k), roughness: 0.55, metalness: 0.1, ...extra });
    matCache.set(key, m);
  }
  return m;
}

export const glowMat = new THREE.MeshBasicMaterial({ color: 0x55e0ff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });

function buildMesh(kind: PieceKind): THREE.Group {
  const f = FACTION_OF[kind];
  const c = FACTION_COLOR[f];
  const g = new THREE.Group();
  const add = (m: THREE.Mesh, y = 0) => { m.position.y = y; m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  switch (kind) {
    case 'us_troops': case 'arvn_troops': case 'nva_troops':
      add(new THREE.Mesh(geo.cube, mat(c)), 0.135); break;
    case 'arvn_police':
      add(new THREE.Mesh(geo.police, mat(0xf4e58a)), 0.1); break;
    case 'us_irreg_u': case 'arvn_ranger_u': case 'nva_guer_u': case 'vc_guer_u': {
      add(new THREE.Mesh(geo.tall, mat(c, 0.62)), 0.23);
      if (kind.includes('irreg') || kind.includes('ranger')) add(new THREE.Mesh(geo.cap, mat(c, 0.45)), 0.5);
      break;
    }
    case 'us_irreg_a': case 'arvn_ranger_a': case 'nva_guer_a': case 'vc_guer_a': {
      add(new THREE.Mesh(geo.short, mat(c, 1.25, { emissive: c, emissiveIntensity: 0.25 })), 0.1);
      const r = add(new THREE.Mesh(geo.ring, mat(0xffffff, 1, { emissive: 0xffffff, emissiveIntensity: 0.6 })), 0.21);
      r.rotation.x = Math.PI / 2;
      if (kind.includes('irreg') || kind.includes('ranger')) add(new THREE.Mesh(geo.cap, mat(c, 1.4)), 0.3);
      break;
    }
    case 'us_base': case 'arvn_base': case 'nva_base': case 'vc_base': case 'nva_tunnel': case 'vc_tunnel': {
      add(new THREE.Mesh(geo.base, mat(c)), 0.08);
      add(new THREE.Mesh(geo.baseTop, mat(c, 1.3)), 0.19);
      if (kind.endsWith('tunnel')) {
        const t = add(new THREE.Mesh(geo.tunnel, mat(0x151515, 1, { emissive: 0xe0a020, emissiveIntensity: 0.55, metalness: 0.4 })), 0.09);
        t.rotation.x = Math.PI / 2;
        t.rotation.z = 0;
      }
      break;
    }
  }
  const glow = new THREE.Mesh(geo.glow, glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.01;
  glow.visible = false;
  glow.name = 'glow';
  glow.renderOrder = 6;
  g.add(glow);
  return g;
}

interface Entity {
  id: number;
  kind: PieceKind;
  space: string;
  obj: THREE.Group;
  token: number;
  target: THREE.Vector3;
  scale: number;
  stackIdx: number;
}

interface Slot { pos: THREE.Vector3; scale: number; kind: PieceKind; stackIdx: number; }

export class PieceLayer {
  private ents: Entity[] = [];
  private nextId = 1;
  private root = new THREE.Group();
  private glowing = new Set<string>();
  private first = true;

  constructor(private stage: Stage, private board: Board) {
    stage.scene.add(this.root);
    stage.addTicker((_d, t) => { glowMat.opacity = 0.35 + 0.3 * Math.sin(t * 5); });
  }

  pickables(): THREE.Object3D[] { return this.ents.filter((e) => !e.obj.userData.dying).map((e) => e.obj); }

  static entityAt(obj: THREE.Object3D): { space: string; kind: PieceKind } | null {
    let o: THREE.Object3D | null = obj;
    while (o) {
      if (o.userData.entity) return { space: o.userData.space, kind: o.userData.kind };
      o = o.parent;
    }
    return null;
  }

  /** Sync 3D pieces with the game state. */
  update(g: Game, pieceActions: Set<string>) {
    const animate = !this.first;
    this.first = false;
    this.glowing = pieceActions;
    const want: Record<string, PieceKind[]> = {};
    for (const id in this.board.nodes) {
      const p = g.spaces[id]?.pieces ?? {};
      const list: PieceKind[] = [];
      for (const k of PIECE_KINDS) for (let i = 0; i < (p[k] ?? 0); i++) list.push(k);
      list.sort((a, b) => KIND_RANK[a] - KIND_RANK[b]);
      want[id] = list;
    }
    const bySpace: Record<string, Entity[]> = {};
    for (const e of this.ents) (bySpace[e.space] ??= []).push(e);

    const removed: Entity[] = [];
    const added: { space: string; kind: PieceKind }[] = [];
    for (const id in want) {
      const cur = (bySpace[id] ??= []).slice();
      const need = want[id].slice();
      for (let i = need.length - 1; i >= 0; i--) {
        const j = cur.findIndex((e) => e.kind === need[i]);
        if (j >= 0) { cur.splice(j, 1); need.splice(i, 1); }
      }
      removed.push(...cur);
      for (const k of need) added.push({ space: id, kind: k });
    }
    // Pair removed with added (same pool): same space first (flip), then nearest space.
    const survivors = new Set(this.ents);
    const pairs: { e: Entity; to: { space: string; kind: PieceKind } }[] = [];
    const poolOf = (k: PieceKind): PoolKind => POOL_OF[k];
    const dist = (a: string, b: string) => this.board.nodes[a].center.distanceTo(this.board.nodes[b].center);
    const restRem = new Set(removed);
    const restAdd = new Set(added);
    for (const e of removed) {
      const a = [...restAdd].find((x) => x.space === e.space && poolOf(x.kind) === poolOf(e.kind));
      if (a) { restRem.delete(e); restAdd.delete(a); pairs.push({ e, to: a }); }
    }
    const cand: { e: Entity; a: { space: string; kind: PieceKind }; d: number }[] = [];
    for (const e of restRem) for (const a of restAdd) if (poolOf(a.kind) === poolOf(e.kind)) cand.push({ e, a, d: dist(e.space, a.space) + (a.kind === e.kind ? 0 : 3) });
    cand.sort((x, y) => x.d - y.d);
    for (const c of cand) {
      if (!restRem.has(c.e) || !restAdd.has(c.a)) continue;
      restRem.delete(c.e); restAdd.delete(c.a); pairs.push({ e: c.e, to: c.a });
    }
    for (const e of restRem) { survivors.delete(e); this.kill(e, animate); }
    this.ents = [...survivors];
    for (const { e, to } of pairs) {
      if (to.kind !== e.kind) this.reskin(e, to.kind, animate);
      e.space = to.space;
    }
    for (const a of restAdd) this.spawn(a.space, a.kind);

    // Layout
    const groups: Record<string, Entity[]> = {};
    for (const e of this.ents) (groups[e.space] ??= []).push(e);
    for (const id in groups) {
      const list = groups[id].sort((a, b) => KIND_RANK[a.kind] - KIND_RANK[b.kind] || a.id - b.id);
      const slots = this.layout(this.board.nodes[id], list.map((e) => e.kind));
      list.forEach((e, i) => this.moveTo(e, slots[i], animate));
    }
    this.refreshGlow();
  }

  private refreshGlow() {
    for (const e of this.ents) {
      const gl = e.obj.getObjectByName('glow');
      if (gl) gl.visible = this.glowing.has(`${e.space}:${e.kind}`);
    }
  }

  private spawn(space: string, kind: PieceKind) {
    const obj = buildMesh(kind);
    const e: Entity = { id: this.nextId++, kind, space, obj, token: 0, target: new THREE.Vector3(1e6, 0, 0), scale: 1, stackIdx: 0 };
    obj.userData = { entity: true, space, kind };
    obj.visible = false;
    this.root.add(obj);
    this.ents.push(e);
  }

  private reskin(e: Entity, kind: PieceKind, animate: boolean) {
    const old = e.obj;
    const obj = buildMesh(kind);
    obj.position.copy(old.position);
    obj.scale.copy(old.scale);
    obj.userData = { entity: true, space: e.space, kind };
    this.root.add(obj);
    this.root.remove(old);
    e.obj = obj;
    e.kind = kind;
    e.token++;
    if (animate) {
      // little flip hop
      const y0 = obj.position.y;
      this.stage.tween(0.4, (k) => { obj.rotation.y = k * Math.PI * 2; obj.position.y = y0 + Math.sin(k * Math.PI) * 0.35; });
    }
  }

  private kill(e: Entity, animate: boolean) {
    const obj = e.obj;
    obj.userData.dying = true;
    if (!animate || !obj.visible) { this.root.remove(obj); return; }
    this.fade(obj, 1, 0, 0.4, () => this.root.remove(obj), true);
  }

  private fade(obj: THREE.Object3D, from: number, to: number, dur: number, done?: () => void, shrink = false) {
    const mats: THREE.Material[] = [];
    obj.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.name !== 'glow') {
        m.material = (m.material as THREE.Material).clone();
        (m.material as THREE.Material).transparent = true;
        mats.push(m.material as THREE.Material);
        m.castShadow = false;
      }
    });
    const s0 = obj.scale.x;
    const y0 = obj.position.y;
    this.stage.tween(dur, (k) => {
      const v = from + (to - from) * k;
      for (const m of mats) m.opacity = v;
      if (shrink) { obj.scale.setScalar(s0 * (0.6 + 0.4 * v)); obj.position.y = y0 + (1 - v) * 0.5; }
    }, () => { for (const m of mats) m.dispose(); done?.(); });
  }

  private moveTo(e: Entity, slot: Slot, animate: boolean) {
    const obj = e.obj;
    e.stackIdx = slot.stackIdx;
    obj.userData.space = e.space;
    obj.userData.kind = e.kind;
    const same = e.target.distanceToSquared(slot.pos) < 1e-6 && e.scale === slot.scale;
    e.target.copy(slot.pos);
    e.scale = slot.scale;
    if (same) return;
    const token = ++e.token;
    if (!obj.visible || !animate) {
      obj.position.copy(slot.pos);
      obj.scale.setScalar(slot.scale);
      if (!obj.visible) {
        obj.visible = true;
        if (animate) {
          // newly placed piece: drop in and fade in
          obj.position.y += 1.6;
          this.fade(obj, 0, 1, 0.45, () => {
            // restore shared materials after fade
            const fresh = buildMesh(e.kind);
            const kids = [...obj.children];
            for (const c of kids) obj.remove(c);
            for (const c of [...fresh.children]) obj.add(c);
          });
          const p0 = obj.position.clone();
          this.stage.tween(0.45, (k) => { if (token === e.token) obj.position.set(p0.x, p0.y - 1.6 * easeOut(k), p0.z); });
        }
      }
      return;
    }
    const from = obj.position.clone();
    const s0 = obj.scale.x;
    const dist = from.distanceTo(slot.pos);
    const dur = Math.min(0.9, 0.3 + dist * 0.05);
    this.stage.tween(dur, (k) => {
      if (token !== e.token) return;
      const t = easeInOut(k);
      obj.position.lerpVectors(from, slot.pos, t);
      if (dist > 0.6) obj.position.y += Math.sin(k * Math.PI) * Math.min(1.6, dist * 0.18 + 0.3);
      obj.scale.setScalar(s0 + (slot.scale - s0) * t);
    }, () => { if (token === e.token) { obj.position.copy(slot.pos); obj.scale.setScalar(slot.scale); } });
  }

  /** Arrange kinds (already sorted) into tidy stacks/rows around the space centre. */
  private layout(n: SpaceNode, kinds: PieceKind[]): Slot[] {
    // build stacks
    type Stack = { kind: PieceKind; n: number };
    const rowsByFaction: Stack[][] = [];
    let lastF = '';
    let cur: Stack | null = null;
    for (const k of kinds) {
      const f = FACTION_OF[k];
      if (f !== lastF) { rowsByFaction.push([]); lastF = f; cur = null; }
      const lim = STACK[k] ?? 1;
      if (cur && cur.kind === k && cur.n < lim) cur.n++;
      else { cur = { kind: k, n: 1 }; rowsByFaction[rowsByFaction.length - 1].push(cur); }
    }
    const isLoc = n.def.type === 'loc';
    const width = n.r * 2 * (isLoc ? 1.0 : 0.95);
    const depth = n.r * 2 * (isLoc ? 0.9 : n.def.type === 'city' ? 0.95 : 0.75);
    let scale = 1, cols = 3, rows: Stack[][] = [];
    for (const s of [1, 0.85, 0.72, 0.6, 0.5]) {
      scale = s;
      const sx = 0.42 * PS * s;
      cols = Math.max(2, Math.floor(width / sx));
      rows = [];
      for (const r of rowsByFaction) for (let i = 0; i < r.length; i += cols) rows.push(r.slice(i, i + cols));
      if (rows.length * 0.42 * PS * s <= Math.max(depth, 0.8)) break;
    }
    const sx = 0.42 * PS * scale, sz = 0.44 * PS * scale;
    const slots: Slot[] = [];
    const z0 = n.center.z + (isLoc ? 0 : 0.3) - ((rows.length - 1) * sz) / 2;
    rows.forEach((row, ri) => {
      row.forEach((st, ci) => {
        const x = n.center.x + (ci - (row.length - 1) / 2) * sx;
        const z = z0 + ri * sz;
        for (let i = 0; i < st.n; i++) {
          const h = (HEIGHT[st.kind] ?? 0) * scale * PS;
          slots.push({ pos: new THREE.Vector3(x, n.center.y + 0.02 + i * h, z), scale: scale * PS, kind: st.kind, stackIdx: i });
        }
      });
    });
    return slots;
  }

  /** Pause animations bookkeeping for a fresh game. */
  reset() {
    for (const e of this.ents) this.root.remove(e.obj);
    this.ents = [];
    this.first = true;
  }
}
