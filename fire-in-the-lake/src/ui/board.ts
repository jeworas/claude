// Procedural stylised map: province tiles (Voronoi-ish), city plazas, LoC roads, markers, labels.
import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { Game, SpaceDef, SupportLevel } from '../core/types';
import { control } from '../core/pieces';
import type { Stage } from './scene';

export const SCALE = 0.4;
export const TILE_TOP = 0.43;
export const PLAZA_H = 0.36;
export const ROAD_Y = 0.47;

// Support = COIN colours blended (US olive + ARVN yellow); Opposition = insurgent colours blended (NVA red + VC blue).
export const SUPPORT_COLORS: Record<number, number> = { 2: 0xa8cf2a, 1: 0xd6e58c, [-1]: 0xc39ae0, [-2]: 0x8e3ec9 };
export const SUPPORT_SHORT: Record<number, string> = { 2: 'AS', 1: 'PS', [-1]: 'PO', [-2]: 'AO' };

const COUNTRY_TINT: Record<string, number> = {
  south_vietnam: 0xffffff,
  laos: 0xc4b4ea,
  cambodia: 0xf0d08c,
  north_vietnam: 0xf0a49a,
};

type HL = 'none' | 'legal' | 'selected';

export interface SpaceNode {
  def: SpaceDef;
  group: THREE.Group;
  center: THREE.Vector3;   // where pieces rest (surface point at the space's centre)
  r: number;               // usable radius for pieces
  capMats: THREE.MeshStandardMaterial[];
  hl: THREE.Object3D;
  hlMat: THREE.MeshBasicMaterial;
  hlState: HL;
  markers: THREE.Group;
  markerSig: string;
  labelEl: HTMLElement;
  label: THREE.Object3D;
  cands: THREE.Vector3[];
  prio: number;
  labelHtml: string;
  wCache: number;
  flashT: number;
  hover: boolean;
}

function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// ---------------------------------------------------------------- textures
function canvasTex(draw: (g: CanvasRenderingContext2D, n: number) => void, size = 256): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  draw(cv.getContext('2d')!, size);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / 5, 1 / 5);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function wrapDraw(g: CanvasRenderingContext2D, n: number, fn: (dx: number, dy: number) => void) {
  for (const dx of [-n, 0, n]) for (const dy of [-n, 0, n]) { g.save(); g.translate(dx, dy); fn(dx, dy); g.restore(); }
}

let TEX: Record<string, THREE.CanvasTexture> | null = null;
function textures() {
  if (TEX) return TEX;
  const R = rng(7);
  TEX = {
    jungle: canvasTex((g, n) => {
      g.fillStyle = '#2c5a35'; g.fillRect(0, 0, n, n);
      const pts = Array.from({ length: 90 }, () => [R() * n, R() * n, 9 + R() * 14, R()]);
      for (const [x, y, r, c] of pts) wrapDraw(g, n, () => {
        g.fillStyle = c < 0.5 ? 'rgba(20,60,30,0.55)' : 'rgba(80,140,70,0.35)';
        g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
      });
    }),
    highland: canvasTex((g, n) => {
      g.fillStyle = '#7d6d42'; g.fillRect(0, 0, n, n);
      g.lineWidth = 2;
      for (let i = 0; i < 9; i++) {
        g.strokeStyle = i % 2 ? 'rgba(60,45,20,0.35)' : 'rgba(210,190,130,0.25)';
        g.beginPath();
        for (let x = 0; x <= n; x += 8) {
          const y = (i * n) / 9 + Math.sin((x / n) * Math.PI * 4 + i) * 8 + Math.sin((x / n) * Math.PI * 2 + i * 2) * 6;
          x ? g.lineTo(x, y) : g.moveTo(x, y);
        }
        g.stroke();
      }
      for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(50,40,20,0.18)'; g.fillRect(R() * n, R() * n, 3, 3); }
    }),
    lowland: canvasTex((g, n) => {
      g.fillStyle = '#86b055'; g.fillRect(0, 0, n, n);
      const cell = n / 8;
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
        const v = R();
        g.fillStyle = v < 0.3 ? 'rgba(90,150,60,0.30)' : v < 0.6 ? 'rgba(220,230,130,0.28)' : v < 0.7 ? 'rgba(90,160,190,0.25)' : 'rgba(0,0,0,0)';
        g.fillRect(i * cell + 2, j * cell + 2, cell - 4, cell - 4);
      }
      g.strokeStyle = 'rgba(40,80,30,0.22)'; g.lineWidth = 1.5;
      for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * cell, 0); g.lineTo(i * cell, n); g.stroke(); g.beginPath(); g.moveTo(0, i * cell); g.lineTo(n, i * cell); g.stroke(); }
    }),
  };
  return TEX;
}

// ---------------------------------------------------------------- geometry helpers
type P2 = [number, number];

function circlePoly(cx: number, cz: number, r: number, n = 36): P2[] {
  return Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * r, cz + Math.sin((i / n) * Math.PI * 2) * r] as P2);
}

// keep the part of poly where nx*x+nz*z <= c
function clip(poly: P2[], nx: number, nz: number, c: number): P2[] {
  const out: P2[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const da = nx * a[0] + nz * a[1] - c, db = nx * b[0] + nz * b[1] - c;
    if (da <= 0) out.push(a);
    if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
      const t = da / (da - db);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}

function roundedShape(poly: P2[], rc: number): THREE.Shape {
  const n = poly.length;
  const sh = new THREE.Shape();
  const pts = poly.map(([x, z]) => new THREE.Vector2(x, -z));
  const cut = (i: number) => {
    const p = pts[(i + n - 1) % n], c = pts[i], q = pts[(i + 1) % n];
    const d1 = Math.min(rc, p.distanceTo(c) * 0.4), d2 = Math.min(rc, q.distanceTo(c) * 0.4);
    return [c.clone().add(p.clone().sub(c).setLength(d1)), c, c.clone().add(q.clone().sub(c).setLength(d2))];
  };
  const first = cut(0);
  sh.moveTo(first[2].x, first[2].y);
  for (let i = 1; i <= n; i++) {
    const [a, c, b] = cut(i % n);
    sh.lineTo(a.x, a.y);
    sh.quadraticCurveTo(c.x, c.y, b.x, b.y);
  }
  return sh;
}

function polyArea(p: P2[]) { let a = 0; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; a += p[i][0] * q[1] - q[0] * p[i][1]; } return a / 2; }
function pointInPoly(p: P2[], x: number, z: number) {
  let inside = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    if ((p[i][1] > z) !== (p[j][1] > z) && x < ((p[j][0] - p[i][0]) * (z - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]) inside = !inside;
  }
  return inside;
}
function minEdgeDist(p: P2[], x: number, z: number) {
  let m = 1e9;
  for (let i = 0; i < p.length; i++) {
    const a = p[i], b = p[(i + 1) % p.length];
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1)));
    m = Math.min(m, Math.hypot(x - (a[0] + dx * t), z - (a[1] + dz * t)));
  }
  return m;
}

function ribbon(curve: THREE.Curve<THREE.Vector3>, width: number, y: number, segs = 48): THREE.BufferGeometry {
  const pos: number[] = [], idx: number[] = [], uv: number[] = [];
  const pts = curve.getPoints(segs);
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const tx = b.x - a.x, tz = b.z - a.z;
    const l = Math.hypot(tx, tz) || 1;
    const nx = -tz / l, nz = tx / l;
    pos.push(pts[i].x + nx * width / 2, y, pts[i].z + nz * width / 2, pts[i].x - nx * width / 2, y, pts[i].z - nz * width / 2);
    uv.push(0, i / segs, 1, i / segs);
    if (i < pts.length - 1) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function textTexture(text: string, bg: string, fg = '#fff'): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const g = cv.getContext('2d')!;
  g.fillStyle = bg; g.fillRect(0, 0, 128, 128);
  g.fillStyle = fg; g.font = 'bold 60px Oswald, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, 64, 68);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Display-only warp so the long thin map reads as Vietnam's S-curve.
export function warpX(x: number, y: number): number {
  const t = y / 140;
  return x + 13 * Math.sin(Math.PI * 1.75 * t - 0.55) + (t - 0.5) * 6;
}
function coinTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const g = cv.getContext('2d')!;
  g.fillStyle = '#6f8f2a'; g.fillRect(0, 0, 64, 128);
  g.fillStyle = '#e8c62c'; g.fillRect(64, 0, 64, 128);
  g.fillStyle = '#111'; g.font = 'bold 56px Oswald, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('C', 64, 68);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function worldPos(d: { x: number; y: number }, y = 0): THREE.Vector3 {
  return new THREE.Vector3((warpX(d.x, d.y) - 50) * SCALE, y, (d.y - 70) * SCALE);
}

// ---------------------------------------------------------------- Board
export class Board {
  nodes: Record<string, SpaceNode> = {};
  root = new THREE.Group();
  pickables: THREE.Object3D[] = [];
  bounds = new THREE.Box3();
  private hlNodes: SpaceNode[] = [];
  private frame = 0;
  private pos = new THREE.Vector3();

  constructor(private stage: Stage, private defs: SpaceDef[]) {
    stage.scene.add(this.root);
    this.build();
    stage.addTicker((dt, t) => { this.pulse(t); this.flashTick(dt); if ((this.frame++ % 6) === 0) this.layoutLabels(); });
  }

  private build() {
    const provs = this.defs.filter((d) => d.type === 'province');
    const cities = this.defs.filter((d) => d.type === 'city');
    const locs = this.defs.filter((d) => d.type === 'loc');
    const tex = textures();
    const decorRnd = rng(99);

    // --- provinces
    const sites = provs.map((d) => worldPos(d));
    provs.forEach((d, i) => {
      const P = sites[i];
      const dists = sites.map((s, j) => (j === i ? 1e9 : Math.hypot(s.x - P.x, s.z - P.z))).sort((a, b) => a - b);
      const near = (dists[0] + dists[1] + (dists[2] ?? dists[1])) / 3;
      const R = Math.max(4.4, Math.min(9.5, near * 0.6));
      let poly = circlePoly(P.x, P.z, R, 40);
      const gap = 0.3;
      sites.forEach((Q, j) => {
        if (j === i) return;
        const dx = Q.x - P.x, dz = Q.z - P.z, l = Math.hypot(dx, dz) || 1;
        const nx = dx / l, nz = dz / l;
        const mx = (P.x + Q.x) / 2, mz = (P.z + Q.z) / 2;
        poly = clip(poly, nx, nz, nx * mx + nz * mz - gap / 2);
      });
      if (poly.length < 3) return;
      const shape = roundedShape(poly, 0.7);
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.35, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 2, curveSegments: 5 });
      geo.rotateX(-Math.PI / 2);
      const terrain = d.terrain ?? 'highland';
      const capMat = new THREE.MeshStandardMaterial({ map: tex[terrain], color: COUNTRY_TINT[d.country] ?? 0xffffff, roughness: 0.92, metalness: 0 });
      const sideMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0x3a3a2a).lerp(new THREE.Color(COUNTRY_TINT[d.country] ?? 0xffffff), 0.15), roughness: 1 });
      const mesh = new THREE.Mesh(geo, [capMat, sideMat]);
      mesh.receiveShadow = true; mesh.castShadow = true;
      mesh.userData.space = d.id;
      const group = new THREE.Group();
      group.add(mesh);

      // highlight (flat copy of shape)
      const hlMat = new THREE.MeshBasicMaterial({ color: 0x55e0ff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
      const hgeo = new THREE.ShapeGeometry(shape, 6);
      hgeo.rotateX(-Math.PI / 2);
      const hl = new THREE.Mesh(hgeo, hlMat);
      hl.position.y = TILE_TOP + 0.02;
      hl.renderOrder = 5;
      // glowing rim, slightly larger than the tile, visible in the gaps around it
      const rgeo = new THREE.ShapeGeometry(shape, 6);
      rgeo.translate(-P.x, P.z, 0); rgeo.scale(1.07, 1.07, 1); rgeo.translate(P.x, -P.z, 0);
      rgeo.rotateX(-Math.PI / 2);
      const rim = new THREE.Mesh(rgeo, hlMat);
      rim.position.y = TILE_TOP - 0.12;
      rim.renderOrder = 4;
      const hlg = new THREE.Group();
      hlg.add(hl, rim);

      const inr = minEdgeDist(poly, P.x, P.z);
      const node = this.register(d, group, new THREE.Vector3(P.x, TILE_TOP, P.z), inr, [capMat], hlg, hlMat);
      group.add(hlg);
      this.pickables.push(mesh);
      this.decorate(group, poly, P, terrain, inr, decorRnd, d.id);
      // tile name shown a bit above the centre pieces
      void node;
    });

    // --- LoCs (roads) first so plazas draw over them
    for (const d of locs) this.buildLoc(d, cities);

    // --- cities
    for (const d of cities) {
      const P = worldPos(d);
      const group = new THREE.Group();
      const r = 1.7;
      const base = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.18, r + 0.28, 0.14, 40), new THREE.MeshStandardMaterial({ color: 0x40382c, roughness: 0.8 }));
      base.position.set(P.x, TILE_TOP + 0.07, P.z);
      const capMat = new THREE.MeshStandardMaterial({ color: 0xd9d0b8, roughness: 0.75, metalness: 0.05 });
      const plaza = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.06, PLAZA_H, 40), [capMat, capMat, capMat]);
      plaza.position.set(P.x, TILE_TOP + 0.14 + PLAZA_H / 2 - 0.07, P.z);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r - 0.12, 0.035, 6, 48), new THREE.MeshStandardMaterial({ color: 0x8b7a55, roughness: 0.6 }));
      ring.rotation.x = Math.PI / 2;
      ring.position.set(P.x, TILE_TOP + 0.14 + PLAZA_H - 0.07 + 0.02, P.z);
      for (const m of [base, plaza]) { m.castShadow = true; m.receiveShadow = true; m.userData.space = d.id; }
      group.add(base, plaza, ring);
      // skyline
      const R = rng(hash(d.id));
      const bmat = [0x9b8f78, 0xb5a98c, 0x7d7a70, 0xa89b80].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 }));
      const nb = 9;
      for (let i = 0; i < nb; i++) {
        const a = (i / nb) * Math.PI * 2 + R() * 0.3;
        const h = 0.3 + R() * 0.55 + Math.max(0, d.pop - 1) * 0.08, w = 0.2 + R() * 0.16;
        const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), bmat[i % 4]);
        const rr = r - 0.3 - R() * 0.05;
        b.position.set(P.x + Math.cos(a) * rr, TILE_TOP + 0.14 + PLAZA_H - 0.07 + h / 2, P.z + Math.sin(a) * rr);
        b.rotation.y = R() * 3;
        b.castShadow = true; b.receiveShadow = true;
        group.add(b);
      }
      const hlMat = new THREE.MeshBasicMaterial({ color: 0x55e0ff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
      const hl = new THREE.Mesh(new THREE.RingGeometry(r + 0.05, r + 0.6, 48), hlMat);
      hl.rotation.x = -Math.PI / 2;
      hl.position.set(P.x, TILE_TOP + 0.03, P.z);
      hl.renderOrder = 5;
      const hl2 = new THREE.Mesh(new THREE.CircleGeometry(r, 40), hlMat);
      hl2.rotation.x = -Math.PI / 2;
      hl2.position.set(P.x, TILE_TOP + 0.14 + PLAZA_H + 0.01, P.z);
      hl2.renderOrder = 5;
      const hlg = new THREE.Group(); hlg.add(hl, hl2);
      group.add(hlg);
      this.register(d, group, new THREE.Vector3(P.x, TILE_TOP + 0.14 + PLAZA_H - 0.07, P.z), r, [capMat], hlg, hlMat);
      this.pickables.push(base, plaza);
    }

    this.bounds.setFromObject(this.root);
  }

  private decorate(group: THREE.Group, poly: P2[], P: THREE.Vector3, terrain: string, inr: number, R: () => number, id: string) {
    if (terrain === 'lowland') return;
    const n = Math.min(14, Math.max(4, Math.round(Math.abs(polyArea(poly)) * 0.4)));
    const geo = terrain === 'jungle' ? new THREE.ConeGeometry(0.2, 0.55, 6) : new THREE.ConeGeometry(0.42, 0.7, 4);
    const mat = new THREE.MeshStandardMaterial({ color: terrain === 'jungle' ? 0x1f4a2a : 0x6c5c3c, roughness: 1, flatShading: true });
    const inst = new THREE.InstancedMesh(geo, mat, n);
    inst.castShadow = true;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    let k = 0, tries = 0;
    const rr = rng(hash(id) ^ 0x51);
    while (k < n && tries++ < 400) {
      const a = rr() * Math.PI * 2, rad = (0.5 + rr() * 0.5) * (inr * 1.7);
      const x = P.x + Math.cos(a) * rad, z = P.z + Math.sin(a) * rad;
      if (!pointInPoly(poly, x, z) || minEdgeDist(poly, x, z) < 0.35) continue;
      if (Math.hypot(x - P.x, z - P.z) < Math.max(1.5, inr * 0.62)) continue;
      const s = 0.7 + rr() * 0.8;
      e.set(0, rr() * 6, 0);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(x, TILE_TOP + 0.27 * s, z), q, new THREE.Vector3(s, s, s));
      inst.setMatrixAt(k++, m);
    }
    void R;
    inst.count = k;
    group.add(inst);
  }

  private buildLoc(d: SpaceDef, cities: SpaceDef[]) {
    const P = worldPos(d, ROAD_Y);
    const byId = (id: string) => this.defs.find((x) => x.id === id)!;
    let ends = d.adjacent.map(byId).filter((x) => x && x.type === 'city');
    if (ends.length < 2) {
      const others = d.adjacent.map(byId).filter((x) => x && x.type !== 'loc' && !ends.includes(x))
        .sort((a, b) => Math.hypot(a.x - d.x, a.y - d.y) - Math.hypot(b.x - d.x, b.y - d.y));
      ends = ends.concat(others).slice(0, 2);
    }
    void cities;
    const group = new THREE.Group();
    const mek = d.mekong;
    const mat = new THREE.MeshStandardMaterial({ color: mek ? 0x2f86d6 : 0x4b4740, roughness: mek ? 0.25 : 0.9, metalness: mek ? 0.3 : 0 });
    const edge = new THREE.MeshStandardMaterial({ color: mek ? 0x9fd3ff : 0xb9ad8c, roughness: 0.8 });
    const w = mek ? 0.62 : 0.5;
    const meshes: THREE.Mesh[] = [];
    const mkCurve = (pts: THREE.Vector3[]) => new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
    const paths: THREE.Vector3[][] = [];
    if (ends.length === 2) paths.push([worldPos(ends[0], ROAD_Y), P, worldPos(ends[1], ROAD_Y)]);
    else if (ends.length === 1) paths.push([worldPos(ends[0], ROAD_Y), P]);
    else paths.push([P.clone().add(new THREE.Vector3(-1, 0, 0)), P.clone().add(new THREE.Vector3(1, 0, 0))]);
    for (const pts of paths) {
      // bend slightly for a natural look
      if (pts.length === 3) {
        const a = pts[0], b = pts[2];
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const off = P.clone().sub(mid);
        if (off.length() < 0.4) { const dir = b.clone().sub(a); pts[1] = P.clone().add(new THREE.Vector3(-dir.z, 0, dir.x).setLength(0.5)); }
      }
      const c = mkCurve(pts);
      const border = new THREE.Mesh(ribbon(c, w + 0.16, ROAD_Y - 0.005), edge);
      const road = new THREE.Mesh(ribbon(c, w, ROAD_Y + 0.008), mat);
      border.receiveShadow = road.receiveShadow = true;
      group.add(border, road);
      meshes.push(road, border);
      if (!mek) {
        const dash = new THREE.Mesh(ribbon(c, 0.05, ROAD_Y + 0.016), new THREE.MeshBasicMaterial({ color: 0xe8dfa0 }));
        group.add(dash);
      }
    }
    // pad
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 0.1, 28), new THREE.MeshStandardMaterial({ color: mek ? 0x3c8fd6 : 0x77705f, roughness: 0.6 }));
    pad.position.set(P.x, ROAD_Y + 0.02, P.z);
    pad.castShadow = pad.receiveShadow = true;
    group.add(pad);
    meshes.push(pad);
    for (const m of meshes) m.userData.space = d.id;
    // invisible fat hit area along road
    for (const pts of paths) {
      const c = mkCurve(pts);
      const hit = new THREE.Mesh(ribbon(c, 1.1, ROAD_Y + 0.02), new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }));
      hit.userData.space = d.id;
      group.add(hit);
      this.pickables.push(hit);
    }
    this.pickables.push(pad);

    const hlMat = new THREE.MeshBasicMaterial({ color: 0x55e0ff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    const hlg = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.35, 32), hlMat);
    ring.rotation.x = -Math.PI / 2; ring.position.set(P.x, ROAD_Y + 0.09, P.z); ring.renderOrder = 5;
    hlg.add(ring);
    for (const pts of paths) {
      const s = new THREE.Mesh(ribbon(mkCurve(pts), w + 0.7, ROAD_Y + 0.03), hlMat);
      s.renderOrder = 5;
      hlg.add(s);
    }
    group.add(hlg);
    this.register(d, group, new THREE.Vector3(P.x, ROAD_Y + 0.07, P.z), 1.0, [mat], hlg, hlMat);
  }

  private register(d: SpaceDef, group: THREE.Group, center: THREE.Vector3, r: number, capMats: THREE.MeshStandardMaterial[], hl: THREE.Object3D, hlMat: THREE.MeshBasicMaterial): SpaceNode {
    const markers = new THREE.Group();
    group.add(markers);
    const el = document.createElement('div');
    el.className = `slabel ${d.type}`;
    const label = new CSS2DObject(el);
    const yOff = d.type === 'city' ? 1.3 : d.type === 'loc' ? 0.6 : 0.7;
    const zOff = d.type === 'loc' ? 1.5 : d.type === 'city' ? 2.6 : -(r * 0.8) - 0.3;
    let cands: THREE.Vector3[];
    if (d.type === 'city') {
      cands = [new THREE.Vector3(center.x + r + 0.35, center.y + 0.3, center.z), new THREE.Vector3(center.x - r - 0.35, center.y + 0.3, center.z)];
      label.center.set(0, 0.5);
    } else {
      cands = [new THREE.Vector3(center.x, center.y + yOff - 1.0, center.z + zOff), new THREE.Vector3(center.x, center.y + yOff - 1.0, center.z - zOff + (d.type === 'loc' ? 0.4 : 2.2))];
      label.center.set(0.5, 0);
    }
    label.position.copy(cands[0]);
    group.add(label);
    this.root.add(group);
    const node: SpaceNode = { def: d, group, center, r, capMats, hl, hlMat, hlState: 'none', markers, markerSig: '', labelEl: el, label, cands, labelHtml: '', wCache: 0, flashT: 0, hover: false,
      prio: d.type === 'city' ? 5 + d.pop * 0.3 : d.type === 'province' ? (d.pop > 0 ? 3 + d.pop * 0.3 : 2) : d.econ > 0 ? 0.6 : 0.2 };
    hlMat.opacity = 0;
    hl.visible = false;
    this.nodes[d.id] = node;
    return node;
  }

  // ---------------------------------------------------------------- state sync
  update(g: Game, legal: Set<string>, selected: Set<string>) {
    for (const id in this.nodes) {
      const n = this.nodes[id];
      const st = g.spaces[id];
      if (!st) continue;
      const d = n.def;
      const ctl = d.type === 'loc' ? null : control(g, id);
      const sig = `${st.support}|${ctl}|${st.terror}`;
      if (sig !== n.markerSig) { n.markerSig = sig; this.buildMarkers(n, st.support, ctl, st.terror); }
      // label
      const sup = d.type !== 'loc' && d.pop > 0 && st.support !== 0
        ? `<span class="sup s${st.support < 0 ? 'm' + -st.support : st.support}">${SUPPORT_SHORT[st.support]}</span>` : '';
      const pop = d.type !== 'loc' && d.pop > 0 ? `<span class="pop">${d.pop}</span>` : '';
      const eco = d.type === 'loc' && d.econ > 0 ? `<span class="econ">${d.econ}</span>` : '';
      const terr = st.terror > 0 ? `<span class="terr">${d.type === 'loc' ? '⚠' : '☠'}${d.type === 'loc' ? '' : st.terror}</span>` : '';
      const html = `${pop}${eco}<span class="nm">${d.name}</span>${sup}${terr}`;
      if (html !== n.labelHtml) { n.labelHtml = html; n.labelEl.innerHTML = html; }
      const hs: HL = selected.has(id) ? 'selected' : legal.has(id) ? 'legal' : 'none';
      n.hlState = hs;
      n.hl.visible = hs !== 'none';
      n.hlMat.color.set(hs === 'selected' ? 0xffd23a : 0x33d6ff);
    }
    this.hlNodes = Object.values(this.nodes).filter((n) => n.hlState !== 'none');
  }

  private buildMarkers(n: SpaceNode, support: SupportLevel, ctl: 'COIN' | 'NVA' | null, terror: number) {
    const g = n.markers;
    while (g.children.length) {
      const c = g.children.pop()!;
      c.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mt = m.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] | undefined;
        for (const x of Array.isArray(mt) ? mt : mt ? [mt] : []) { x.map?.dispose(); x.dispose(); }
      });
    }
    const d = n.def;
    const top = n.center.y;
    const isLoc = d.type === 'loc';
    const rowZ = isLoc ? -1.3 : d.type === 'city' ? -2.5 : Math.max(1.6, n.r * 0.78);
    const items: THREE.Object3D[] = [];
    if (!isLoc && ctl) {
      const isC = ctl === 'COIN';
      const tex = isC ? coinTexture() : textTexture('N', '#c02a20');
      const top1 = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 });
      const side = new THREE.MeshStandardMaterial({ color: isC ? 0xa8a02a : 0x8f1f18, roughness: 0.5 });
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.12, 6), [side, top1, side]);
      t.rotation.y = Math.PI / 6;
      t.castShadow = true;
      const w = new THREE.Group(); w.add(t); t.position.y = 0.06;
      items.push(w);
    }
    if (!isLoc && support !== 0) {
      const col = SUPPORT_COLORS[support];
      const act = Math.abs(support) === 2;
      const w = new THREE.Group();
      const h = act ? 1.15 : 0.8;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, h, 6), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
      pole.position.y = h / 2;
      const flagMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.6, emissive: col, emissiveIntensity: act ? 0.35 : 0.1, side: THREE.DoubleSide });
      const flag = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.02), flagMat);
      flag.position.set(0.27, h - 0.17, 0);
      w.add(pole, flag);
      if (act) { const f2 = flag.clone(); f2.position.y = h - 0.5; w.add(f2); }
      // base disc marks side (support = round, opposition = square)
      const base = new THREE.Mesh(support > 0 ? new THREE.CylinderGeometry(0.16, 0.16, 0.06, 16) : new THREE.BoxGeometry(0.3, 0.06, 0.3), flagMat);
      base.position.y = 0.03;
      w.add(base);
      w.traverse((o) => (o.castShadow = true));
      items.push(w);
    }
    if (terror > 0) {
      const w = new THREE.Group();
      for (let i = 0; i < Math.min(terror, 6); i++) {
        const c = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 5), new THREE.MeshStandardMaterial({ color: isLoc ? 0xe28a1c : 0x1c1c1c, roughness: 0.5, emissive: isLoc ? 0x4a2600 : 0x300000 }));
        const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshStandardMaterial({ color: 0xff3020, emissive: 0xff2010, emissiveIntensity: 0.8 }));
        tip.position.y = 0.24;
        const cg = new THREE.Group(); cg.add(c, tip);
        cg.position.set((i % 3) * 0.32 - 0.32, 0.2, Math.floor(i / 3) * 0.32);
        c.castShadow = true;
        w.add(cg);
      }
      items.push(w);
    }
    const gap = 0.95;
    items.forEach((it, i) => {
      it.position.set(n.center.x + (i - (items.length - 1) / 2) * gap, top + 0.02, n.center.z + rowZ);
      g.add(it);
    });
    // fade-in
    g.scale.setScalar(0.01);
    this.stage.tween(0.35, (k) => g.scale.setScalar(0.01 + 0.99 * (1 - Math.pow(1 - k, 3))));
  }

  /** Briefly flash spaces (bot just acted there). */
  flash(ids: string[]) {
    for (const id of ids) { const n = this.nodes[id]; if (n) n.flashT = 1.8; }
  }

  private flashTick(dt: number) {
    for (const id in this.nodes) {
      const n = this.nodes[id];
      if (n.flashT <= 0) continue;
      n.flashT -= dt;
      if (n.flashT > 0) {
        n.hl.visible = true;
        n.hlMat.color.set(0xffa834);
        n.hlMat.opacity = Math.min(0.7, n.flashT / 1.8 * 0.9);
      } else {
        n.hl.visible = n.hlState !== 'none';
        n.hlMat.color.set(n.hlState === 'selected' ? 0xffd23a : 0x33d6ff);
      }
    }
  }

  private hoverId: string | null = null;

  /** Greedy label collision avoidance: highest priority first, try alternate anchors, else hide. */
  private layoutLabels() {
    const cam = this.stage.camera;
    const W = this.stage.el.clientWidth, H = this.stage.el.clientHeight;
    const dist = cam.position.distanceTo(this.stage.controls.target);
    const showLoc = dist < 46;
    const showMinor = dist < 130;
    const order = Object.values(this.nodes).map((n) => {
      const forced = n.hlState !== 'none' || n.flashT > 0 || n.def.id === this.hoverId;
      return { n, p: n.prio + (forced ? 20 : 0), forced };
    }).sort((a, b) => b.p - a.p);
    const placed: { x0: number; y0: number; x1: number; y1: number }[] = [];
    for (const { n, forced } of order) {
      const d = n.def;
      let allowed = true;
      if (!forced) {
        if (d.type === 'loc' && (!showLoc && !(d.econ > 0 && dist < 58))) allowed = false;
        if (d.type === 'province' && d.pop === 0 && !showMinor) allowed = false;
      }
      let ok = false;
      if (allowed) {
        const len = d.name.length * (d.type === 'city' ? 7.4 : d.type === 'loc' ? 5.2 : 6.2) + (d.type === 'loc' ? 34 : 50);
        const meas = n.labelEl.offsetWidth;
        if (meas > 0) n.wCache = meas;
        const w = Math.min(n.wCache || len, 300) + 4, h = (n.labelEl.offsetHeight || (d.type === 'city' ? 22 : 18)) + 2;
        for (let i = 0; i < n.cands.length && !ok; i++) {
          this.pos.copy(n.cands[i]).project(cam);
          if (this.pos.z > 1 || this.pos.z < -1) continue;
          const sx = (this.pos.x + 1) / 2 * W, sy = (1 - this.pos.y) / 2 * H;
          const r = d.type === 'city' ? { x0: i === 0 ? sx : sx - w, x1: i === 0 ? sx + w : sx, y0: sy - h / 2, y1: sy + h / 2 }
            : { x0: sx - w / 2, x1: sx + w / 2, y0: sy - h, y1: sy };
          if (!forced && placed.some((q) => r.x0 < q.x1 + 2 && r.x1 > q.x0 - 2 && r.y0 < q.y1 + 1 && r.y1 > q.y0 - 1)) continue;
          placed.push(r);
          if (i !== n.cands.length && !n.label.position.equals(n.cands[i])) {
            n.label.position.copy(n.cands[i]);
            if (d.type === 'city') (n.label as CSS2DObject).center.set(i === 0 ? 0 : 1, 0.5);
          }
          ok = true;
        }
      }
      n.label.visible = ok;
    }
  }

  setHover(id: string | null) {
    this.hoverId = id;
    for (const k in this.nodes) {
      const n = this.nodes[k];
      const h = k === id;
      if (h !== n.hover) {
        n.hover = h;
        for (const m of n.capMats) { m.emissive.set(h ? 0x2a3a4a : 0x000000); }
      }
    }
  }

  private pulse(t: number) {
    const a = 0.34 + 0.2 * Math.sin(t * 4);
    for (const n of this.hlNodes) n.hlMat.opacity = n.hlState === 'selected' ? 0.55 : a;
  }

  spaceAt(obj: THREE.Object3D): string | null {
    let o: THREE.Object3D | null = obj;
    while (o) { if (o.userData?.space) return o.userData.space as string; o = o.parent; }
    return null;
  }
}
