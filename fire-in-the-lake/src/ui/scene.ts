// Renderer, camera, lights, sea, tween ticker.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
export const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

type Ticker = (dt: number, t: number) => void;

export class Stage {
  renderer: THREE.WebGLRenderer;
  labels: CSS2DRenderer;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  tickers = new Set<Ticker>();
  tweens: { t: number; dur: number; fn: (k: number) => void; done?: () => void }[] = [];
  speed = 1; // tween speed multiplier (fast forward)
  el: HTMLElement;
  private last = performance.now();
  private elapsed = 0;
  private sea!: THREE.Mesh;
  private seaTex!: THREE.CanvasTexture;
  private zoomed = false;
  safe = { l: 0, r: 0, t: 0, b: 0 };

  constructor(el: HTMLElement) {
    this.el = el;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.9;
    el.appendChild(this.renderer.domElement);

    this.labels = new CSS2DRenderer();
    this.labels.domElement.className = 'labels';
    this.labels.domElement.style.position = 'absolute';
    this.labels.domElement.style.inset = '0';
    this.labels.domElement.style.pointerEvents = 'none';
    el.appendChild(this.labels.domElement);

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.5, 400);
    this.camera.position.set(0, 46, 34);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.09;
    this.controls.maxPolarAngle = Math.PI * 0.46;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 110;
    this.controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
    this.controls.screenSpacePanning = false;

    this.buildEnvironment();
    window.addEventListener('resize', () => this.resize());
    this.resize();
    this.renderer.setAnimationLoop(() => this.frame());
  }

  private buildEnvironment() {
    const s = this.scene;
    s.background = new THREE.Color(0x0b1720);
    s.fog = new THREE.Fog(0x0b1720, 90, 190);
    s.add(new THREE.HemisphereLight(0xcfe3ff, 0x2b2a1e, 0.95));
    const sun = new THREE.DirectionalLight(0xfff0d0, 1.9);
    sun.position.set(-22, 46, 26);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const c = sun.shadow.camera;
    c.left = -45; c.right = 45; c.top = 45; c.bottom = -45; c.near = 5; c.far = 140;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.03;
    s.add(sun);
    const rim = new THREE.DirectionalLight(0x6fa8ff, 0.6);
    rim.position.set(30, 20, -30);
    s.add(rim);

    // sea
    const cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    const g = cv.getContext('2d')!;
    g.fillStyle = '#12405e';
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(160,215,255,0.13)';
    g.lineWidth = 2;
    for (let i = 0; i < 46; i++) {
      const x = Math.random() * 256, y = Math.random() * 256, w = 14 + Math.random() * 30;
      g.beginPath();
      g.moveTo(x, y);
      g.bezierCurveTo(x + w * 0.3, y - 4, x + w * 0.7, y + 4, x + w, y);
      g.stroke();
      // wrap copies
      g.beginPath(); g.moveTo(x - 256, y); g.bezierCurveTo(x - 256 + w * 0.3, y - 4, x - 256 + w * 0.7, y + 4, x - 256 + w, y); g.stroke();
    }
    this.seaTex = new THREE.CanvasTexture(cv);
    this.seaTex.wrapS = this.seaTex.wrapT = THREE.RepeatWrapping;
    this.seaTex.repeat.set(30, 30);
    this.seaTex.colorSpace = THREE.SRGBColorSpace;
    this.seaTex.anisotropy = 4;
    this.sea = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshStandardMaterial({ map: this.seaTex, color: 0xffffff, roughness: 0.35, metalness: 0.2 }),
    );
    this.sea.rotation.x = -Math.PI / 2;
    this.sea.position.y = -0.35;
    this.sea.receiveShadow = true;
    s.add(this.sea);
  }

  resize() {
    const w = this.el.clientWidth || window.innerWidth;
    const h = this.el.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h);
    this.labels.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.applySafe();
  }

  /** Shift the projection so the map centres in the area not covered by HUD panels. */
  applySafe() {
    const w = this.el.clientWidth || window.innerWidth, h = this.el.clientHeight || window.innerHeight;
    const { l, r, t, b } = this.safe;
    if (!l && !r && !t && !b) { this.camera.clearViewOffset(); return; }
    this.camera.setViewOffset(w, h, (r - l) / 2, (b - t) / 2, w, h);
  }

  /** Frame the given world points inside the safe area, keeping the viewing direction. */
  fit(points: THREE.Vector3[], dir: THREE.Vector3, animate = false) {
    const W = this.el.clientWidth || window.innerWidth, H = this.el.clientHeight || window.innerHeight;
    const { l, r, t, b } = this.safe;
    const limX = ((W - l - r) / W) * 0.97, limY = ((H - t - b) / H) * 0.97;
    const cam = this.camera.clone();
    cam.clearViewOffset();
    cam.aspect = W / H; cam.updateProjectionMatrix();
    const target = new THREE.Vector3();
    for (const p of points) target.add(p);
    target.divideScalar(points.length);
    const v = new THREE.Vector3();
    const extents = (dist: number) => {
      cam.position.copy(target).addScaledVector(dir, dist);
      cam.lookAt(target); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
      let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
      for (const p of points) { v.copy(p).project(cam); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); }
      return { x0, x1, y0, y1 };
    };
    let dist = 60;
    for (let it = 0; it < 3; it++) {
      let lo = 15, hi = 300;
      for (let k = 0; k < 24; k++) {
        const mid = (lo + hi) / 2, e = extents(mid);
        if ((e.x1 - e.x0) / 2 <= limX && (e.y1 - e.y0) / 2 <= limY) hi = mid; else lo = mid;
      }
      dist = hi;
      const e = extents(dist);
      // recentre: move target so the projected extents are centred
      const ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2((e.x0 + e.x1) / 2, (e.y0 + e.y1) / 2), cam);
      const hit = new THREE.Vector3();
      if (ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit)) target.copy(hit);
    }
    const pos = target.clone().addScaledVector(dir, dist);
    if (animate) {
      const p0 = this.camera.position.clone(), t0 = this.controls.target.clone();
      this.tween(0.8, (k) => { const e = k * k * (3 - 2 * k); this.camera.position.lerpVectors(p0, pos, e); this.controls.target.lerpVectors(t0, target, e); });
    } else { this.camera.position.copy(pos); this.controls.target.copy(target); }
  }

  addTicker(fn: Ticker) { this.tickers.add(fn); }

  tween(dur: number, fn: (k: number) => void, done?: () => void) {
    this.tweens.push({ t: 0, dur: Math.max(0.001, dur), fn, done });
  }

  /** Smoothly fly the camera to a target. */
  flyTo(target: THREE.Vector3, dist?: number) {
    const from = this.controls.target.clone();
    const off = this.camera.position.clone().sub(from);
    if (dist) off.setLength(dist);
    const startOff = this.camera.position.clone().sub(from);
    this.tween(0.7, (k) => {
      const e = easeInOut(k);
      const t = from.clone().lerp(target, e);
      this.controls.target.copy(t);
      this.camera.position.copy(t).add(startOff.clone().lerp(off, e));
    });
  }

  private frame() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.elapsed += dt;
    const t = this.elapsed;
    const sdt = dt * this.speed;
    for (const tw of this.tweens) {
      tw.t += sdt;
      const k = Math.min(1, tw.t / tw.dur);
      tw.fn(k);
      if (k >= 1) tw.done?.();
    }
    this.tweens = this.tweens.filter((tw) => tw.t < tw.dur);
    for (const f of this.tickers) f(dt, t);
    this.seaTex.offset.set(t * 0.004, t * 0.002);
    const zoomed = this.camera.position.distanceTo(this.controls.target) < 42;
    if (zoomed !== this.zoomed) { this.zoomed = zoomed; this.el.classList.toggle('zoomed', zoomed); }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labels.render(this.scene, this.camera);
  }
}
