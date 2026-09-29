// Picking, hover tooltip and context menu.
import * as THREE from 'three';
import type { ActionOption, Game, View } from '../core/types';
import { PIECE_KINDS } from '../core/types';
import { FACTION_OF, PIECE_NAME, SUPPORT_NAME, control } from '../core/pieces';
import type { Board } from './board';
import { PieceLayer, FACTION_CSS } from './pieces';
import type { Stage } from './scene';

export interface InputHost {
  game(): Game | null;
  view(): View | null;
  canAct(): boolean;
  act(verb: string, arg?: string | number): void;
}

const cap = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export class Input {
  private ray = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private down: { x: number; y: number } | null = null;
  private hoverId: string | null = null;
  private tip = document.getElementById('tooltip')!;
  private menu = document.getElementById('ctxmenu')!;
  private pending: PointerEvent | null = null;

  constructor(private stage: Stage, private board: Board, private pieces: PieceLayer, private host: InputHost) {
    const dom = stage.renderer.domElement;
    dom.addEventListener('pointerdown', (e) => { this.down = { x: e.clientX, y: e.clientY }; this.hideMenu(); });
    dom.addEventListener('pointerup', (e) => {
      if (!this.down || e.button !== 0) return;
      const moved = Math.hypot(e.clientX - this.down.x, e.clientY - this.down.y);
      this.down = null;
      if (moved < 6) this.click(e);
    });
    dom.addEventListener('pointermove', (e) => {
      if (this.pending === null) requestAnimationFrame(() => { const p = this.pending; this.pending = null; if (p) this.hover(p); });
      this.pending = e;
    });
    dom.addEventListener('pointerleave', () => this.clearHover());
    dom.addEventListener('wheel', () => this.hideMenu(), { passive: true });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.hideMenu(); });
  }

  private pick(e: PointerEvent): { space: string | null; piece: { space: string; kind: string } | null } {
    const r = this.stage.renderer.domElement.getBoundingClientRect();
    this.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.stage.camera);
    const targets = [...this.pieces.pickables(), ...this.board.pickables];
    const hits = this.ray.intersectObjects(targets, true);
    for (const h of hits) {
      const p = PieceLayer.entityAt(h.object);
      if (p) return { space: p.space, piece: p };
      const s = this.board.spaceAt(h.object);
      if (s) return { space: s, piece: null };
    }
    return { space: null, piece: null };
  }

  private clearHover() {
    this.hoverId = null;
    this.board.setHover(null);
    this.tip.classList.add('hidden');
    this.stage.renderer.domElement.style.cursor = '';
  }

  private hover(e: PointerEvent) {
    const { space } = this.pick(e);
    const g = this.host.game();
    if (!this.menu.classList.contains('hidden')) return;
    if (!space || !g) { this.clearHover(); return; }
    if (space !== this.hoverId) { this.hoverId = space; this.board.setHover(space); this.tip.innerHTML = this.tipHtml(g, space); }
    const view = this.host.view();
    const clickable = this.host.canAct() && !!view?.actions.some((a) => a.space === space && (a.verb === 'space' || a.verb === 'piece' || a.space));
    this.stage.renderer.domElement.style.cursor = clickable ? 'pointer' : '';
    this.tip.classList.remove('hidden');
    const w = this.tip.offsetWidth, h = this.tip.offsetHeight;
    let x = e.clientX + 16, y = e.clientY + 16;
    if (x + w > window.innerWidth - 8) x = e.clientX - w - 16;
    if (y + h > window.innerHeight - 8) y = e.clientY - h - 16;
    this.tip.style.transform = `translate(${x}px, ${y}px)`;
  }

  private tipHtml(g: Game, id: string): string {
    const n = this.board.nodes[id];
    const d = n.def;
    const st = g.spaces[id];
    const ctl = d.type === 'loc' ? null : control(g, id);
    const rows: string[] = [];
    const kind = d.type === 'loc' ? (d.mekong ? 'Mekong LoC' : 'Highway LoC') : d.type === 'city' ? 'City' : 'Province';
    rows.push(`<div class="tt-h">${d.name}</div><div class="tt-s">${kind}${d.terrain ? ' &middot; ' + cap(d.terrain) : ''} &middot; ${cap(d.country)}${d.coastal ? ' &middot; Coastal' : ''}</div>`);
    const stats: string[] = [];
    if (d.type !== 'loc') stats.push(`Pop <b>${d.pop}</b>`);
    else stats.push(`Econ <b>${d.econ}</b>`);
    if (d.type !== 'loc' && d.pop > 0) stats.push(`<b>${SUPPORT_NAME[st.support]}</b>`);
    if (d.type !== 'loc') stats.push(ctl === 'COIN' ? 'COIN control' : ctl === 'NVA' ? 'NVA control' : 'Uncontrolled');
    if (st.terror) stats.push(`${d.type === 'loc' ? 'Sabotage' : 'Terror'} <b>${st.terror}</b>`);
    rows.push(`<div class="tt-r">${stats.join(' &middot; ')}</div>`);
    const pcs = PIECE_KINDS.filter((k) => (st.pieces[k] ?? 0) > 0);
    if (pcs.length) rows.push('<div class="tt-p">' + pcs.map((k) => `<span style="--fc:${FACTION_CSS[FACTION_OF[k]]}"><i></i>${st.pieces[k]} &times; ${PIECE_NAME[k]}</span>`).join('') + '</div>');
    else rows.push('<div class="tt-r dim">No pieces</div>');
    return rows.join('');
  }

  private click(e: PointerEvent) {
    if (!this.host.canAct()) return;
    const view = this.host.view();
    if (!view) return;
    const { space, piece } = this.pick(e);
    if (!space) return;
    const pieceActs = view.actions.filter((a) => a.verb === 'piece' && a.space === space);
    const spaceAct = view.actions.find((a) => a.verb === 'space' && a.arg === space);
    const other = view.actions.filter((a) => a.verb !== 'piece' && a.verb !== 'space' && a.verb !== 'undo' && a.space === space);
    if (piece) {
      const direct = pieceActs.find((a) => a.arg === `${space}:${piece.kind}`);
      if (direct && !spaceAct) { this.host.act(direct.verb, direct.arg); return; }
    }
    const opts: ActionOption[] = [...(spaceAct ? [spaceAct] : []), ...pieceActs, ...other];
    if (opts.length === 0) return;
    if (opts.length === 1 && !pieceActs.length) { this.host.act(opts[0].verb, opts[0].arg); return; }
    if (opts.length === 1) { this.host.act(opts[0].verb, opts[0].arg); return; }
    this.showMenu(e.clientX, e.clientY, space, opts);
  }

  private showMenu(x: number, y: number, space: string, opts: ActionOption[]) {
    this.tip.classList.add('hidden');
    const n = this.board.nodes[space];
    this.menu.innerHTML = `<div class="cm-h">${n.def.name}</div>`;
    for (const o of opts) {
      const b = document.createElement('button');
      b.className = 'cm-b';
      const fac = o.piece ? FACTION_CSS[FACTION_OF[o.piece]] : null;
      b.innerHTML = `${fac ? `<i style="background:${fac}"></i>` : '<i class="sp"></i>'}${o.verb === 'space' ? 'Select space' : o.label}`;
      b.onclick = () => { this.hideMenu(); this.host.act(o.verb, o.arg); };
      this.menu.appendChild(b);
    }
    this.menu.classList.remove('hidden');
    const w = this.menu.offsetWidth, h = this.menu.offsetHeight;
    this.menu.style.transform = `translate(${Math.min(x + 6, window.innerWidth - w - 8)}px, ${Math.min(y + 6, window.innerHeight - h - 8)}px)`;
  }

  hideMenu() { this.menu.classList.add('hidden'); }
}
