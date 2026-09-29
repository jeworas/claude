// HTML overlay: faction panels, cards, pools, log, prompt & actions.
import type { ActionOption, Faction, Game, PoolKind, View } from '../core/types';
import { FACTIONS, POOL_KINDS } from '../core/types';
import { VICTORY_THRESHOLD, victoryScore } from '../core/pieces';
import { CARD } from '../data/cards';
import { FACTION_CSS } from './pieces';

export interface HudHandlers {
  onAction(verb: string, arg?: string | number): void;
  onUndo(): void;
  onNewGame(): void;
  onSave(): void;
  onLoad(): void;
  onSpeed(v: number): void;
  onFF(on: boolean): void;
  onResetView(): void;
  onHelp(): void;
}

const FNAME: Record<Faction, string> = { US: 'United States', ARVN: 'ARVN', NVA: 'North Vietnam', VC: 'Viet Cong' };
const POOL_LABEL: Record<PoolKind, string> = {
  us_troops: 'Troops', us_base: 'Bases', us_irreg: 'Irreg.',
  arvn_troops: 'Troops', arvn_police: 'Police', arvn_ranger: 'Rangers', arvn_base: 'Bases',
  nva_troops: 'Troops', nva_guer: 'Guer.', nva_base: 'Bases',
  vc_guer: 'Guer.', vc_base: 'Bases',
};
const POOL_FACTION = (k: PoolKind): Faction => (k.split('_')[0].toUpperCase() as Faction);

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

export class Hud {
  private el: Record<string, HTMLElement> = {};
  private logCount = 0;
  private poolTab: 'available' | 'casualties' | 'out_of_play' = 'available';
  private lastGame: Game | null = null;
  private lastView: View | null = null;
  private lastBusy = false;
  private lastThinking: Faction | null = null;
  private overShown = false;
  private cache = new Map<string, string>();
  private curCard: number | null = null;
  private seenActed: Faction[] = [];
  private prevActed: Faction[] = [];

  private setHtml(key: string, el: HTMLElement, html: string): boolean {
    if (this.cache.get(key) === html) return false;
    this.cache.set(key, html);
    el.innerHTML = html;
    return true;
  }

  constructor(private root: HTMLElement, private h: HudHandlers) {
    root.innerHTML = `
      <div class="top panel">
        <div class="brand"><span class="flame"></span><b>FIRE IN THE LAKE</b><small id="scen"></small></div>
        <div class="status" id="status"></div>
        <div class="ctl">
          <label class="speed" title="Bot speed">Speed <input id="speed" type="range" min="0" max="100" value="60" /></label>
          <button id="ff" class="btn small" title="Fast forward AI turns">&#9193; Fast</button>
          <button id="resetview" class="btn small" title="Reset camera">&#8982; View</button>
          <button id="help-btn" class="btn small" title="Rules help (?)">?</button>
          <button id="save" class="btn small">Save</button>
          <button id="load" class="btn small">Load</button>
          <button id="newgame" class="btn small">New</button>
        </div>
      </div>
      <div class="left">
        <div id="factions"></div>
        <div id="tracks" class="panel tracks"></div>
        <div id="pools" class="panel pools"></div>
      </div>
      <div class="right">
        <div id="cards" class="panel cards"></div>
        <div id="effects" class="panel effects"></div>
        <div class="panel logbox"><div class="ptitle">Game Log</div><div id="log"></div></div>
      </div>
      <div class="bottom">
        <div class="panel promptbox">
          <div id="prompt"></div>
          <div id="actions"></div>
        </div>
      </div>
      <div id="banner" class="hidden"></div>
      <div id="gameover" class="hidden"></div>`;
    for (const id of ['scen', 'status', 'factions', 'tracks', 'pools', 'cards', 'effects', 'log', 'prompt', 'actions', 'gameover', 'speed', 'ff', 'banner']) {
      this.el[id] = root.querySelector('#' + id) as HTMLElement;
    }
    (this.el.speed as HTMLInputElement).oninput = () => h.onSpeed(+(this.el.speed as HTMLInputElement).value);
    this.el.ff.onclick = () => { const on = !this.el.ff.classList.contains('on'); this.el.ff.classList.toggle('on', on); h.onFF(on); };
    root.querySelector<HTMLElement>('#resetview')!.onclick = h.onResetView;
    root.querySelector<HTMLElement>('#help-btn')!.onclick = h.onHelp;
    root.querySelector<HTMLElement>('#save')!.onclick = h.onSave;
    root.querySelector<HTMLElement>('#load')!.onclick = h.onLoad;
    root.querySelector<HTMLElement>('#newgame')!.onclick = h.onNewGame;
    h.onSpeed(60);
  }

  show(on: boolean) { this.root.style.display = on ? '' : 'none'; }

  toast(msg: string, kind: 'error' | 'info' = 'error') {
    const box = document.getElementById('toasts')!;
    const t = document.createElement('div');
    t.className = `toast ${kind}`;
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => t.classList.add('out'), 4200);
    setTimeout(() => t.remove(), 4800);
  }

  update(g: Game, view: View, busy: boolean, thinking: Faction | null) {
    this.lastGame = g; this.lastView = view; this.lastBusy = busy; this.lastThinking = thinking;
    this.el.scen.textContent = g.scenario;
    this.renderStatus(g);
    this.renderFactions(g, view);
    this.renderTracks(g);
    this.renderPools(g);
    this.renderCards(g);
    this.renderEffects(g);
    this.renderLog(g);
    this.renderPrompt(g, view, busy, thinking);
    this.renderBanner(g, busy, thinking);
    this.renderOver(g);
  }

  private renderStatus(g: Game) {
    const coupsLeft = g.deck.filter((id) => CARD[id]?.coup).length + (g.current && CARD[g.current]?.coup ? 1 : 0) + (g.next && CARD[g.next]?.coup ? 1 : 0);
    this.setHtml('status', this.el.status, `<span>Deck <b>${g.deck.length}</b></span><span>Coups left <b>${coupsLeft}</b></span><span>Coups played <b>${g.coup_count}</b></span>${g.leader ? `<span>Leader <b>${esc(CARD[g.leader]?.title ?? String(g.leader))}</b></span>` : ''}`);
  }

  private renderFactions(g: Game, view: View) {
    if (g.current !== this.curCard) { this.prevActed = this.seenActed.slice(); this.curCard = g.current; }
    this.seenActed = g.acted.slice();
    const out: string[] = [];
    for (const f of FACTIONS) {
      const score = victoryScore(g, f), thr = VICTORY_THRESHOLD[f];
      const pct = Math.max(0, Math.min(100, (score / (thr * 1.4)) * 100));
      const thrPct = (thr / (thr * 1.4)) * 100;
      const human = g.humans.includes(f);
      const res = f === 'US' ? '' : `<span class="res" title="Resources">&#9679; ${g.resources[f]}</span>`;
      const elig = g.eligible[f];
      const acted = g.acted.includes(f);
      const badge = view.active === f ? '<span class="tag act">ACTING</span>' : acted ? '<span class="tag done">ACTED</span>' : elig ? '<span class="tag ok">ELIGIBLE</span>' : '<span class="tag no">INELIGIBLE</span>';
      let reason = '';
      if (!elig) reason = this.prevActed.includes(f) ? 'Acted on the previous card' : 'Made ineligible by an Event or Coup';
      else if (g.next_ineligible.includes(f)) reason = 'Will be ineligible next card (Event)';
      else if (g.first_faction && !acted && view.active !== f) reason = '';
      out.push(`<div class="fpanel ${f} ${view.active === f ? 'active' : ''} ${elig ? '' : 'inelig'}" style="--fc:${FACTION_CSS[f]}">
        <div class="frow"><b class="fname">${FNAME[f]}</b><span class="who ${human ? 'human' : 'ai'}">${human ? 'HUMAN' : 'AI'}</span>${res}</div>
        <div class="frow"><div class="vbar"><i style="width:${pct}%"></i><u style="left:${thrPct}%"></u></div><span class="vnum ${score > thr ? 'win' : ''}">${score}<small>/${thr}</small></span></div>
        <div class="frow" title="${esc(reason)}">${badge}${reason ? `<span class="ireason">${esc(reason)}</span>` : ''}</div>
      </div>`);
    }
    this.setHtml('factions', this.el.factions, out.join(''));
  }

  private renderTracks(g: Game) {
    const pips = Array.from({ length: 5 }, (_, i) => `<i class="${i <= g.trail ? 'on' : ''}"></i>`).join('');
    this.setHtml('tracks', this.el.tracks, `
      <div><span>Aid</span><b>${g.aid}</b></div>
      <div><span>Patronage</span><b>${g.patronage}</b></div>
      <div><span>Econ</span><b>${g.econ}</b></div>
      <div><span>Trail</span><span class="pips">${pips}</span></div>`);
  }

  private renderPools(g: Game) {
    const tabs: [string, 'available' | 'casualties' | 'out_of_play'][] = [['Available', 'available'], ['Casualties', 'casualties'], ['Out of play', 'out_of_play']];
    const pool = g[this.poolTab];
    const rows = FACTIONS.map((f) => {
      const chips = POOL_KINDS.filter((k) => POOL_FACTION(k) === f).map((k) => `<span class="chip" title="${f} ${POOL_LABEL[k]}"><small>${POOL_LABEL[k]}</small><b>${pool[k] ?? 0}</b></span>`).join('');
      return `<div class="prow" style="--fc:${FACTION_CSS[f]}"><em>${f}</em>${chips}</div>`;
    }).join('');
    if (!this.setHtml('pools', this.el.pools, `<div class="tabs">${tabs.map(([n, k]) => `<button data-t="${k}" class="${k === this.poolTab ? 'on' : ''}">${n}</button>`).join('')}</div>${rows}`)) return;
    this.el.pools.querySelectorAll<HTMLElement>('button[data-t]').forEach((b) => (b.onclick = () => { this.poolTab = b.dataset.t as any; if (this.lastGame) this.renderPools(this.lastGame); }));
  }

  private orderChips(id: number | null): string {
    const c = id ? CARD[id] : null;
    if (!c) return '';
    if (c.coup) return '<span class="coupchip">COUP</span>';
    return c.order.map((f, i) => `<span class="ochip" style="--fc:${FACTION_CSS[f]}" title="${i + 1}. ${FNAME[f]}">${f === 'ARVN' ? 'AR' : f === 'NVA' ? 'NV' : f}</span>`).join('');
  }

  private renderCards(g: Game) {
    const cur = g.current ? CARD[g.current] : null;
    const nxt = g.next ? CARD[g.next] : null;
    let html = '';
    if (cur) {
      html += `<div class="card cur"><div class="chead"><span class="cid">#${cur.id}</span><b>${esc(cur.title)}</b>${cur.pivotal ? '<span class="tag act">PIVOTAL</span>' : ''}</div><div class="order">${this.orderChips(cur.id)}${cur.capability ? '<span class="tag done">CAPABILITY</span>' : ''}${cur.momentum ? '<span class="tag done">MOMENTUM</span>' : ''}</div>`;
      if (!cur.coup) {
        html += `<div class="etext un"><span class="lbl">&#9728; Unshaded</span>${esc(cur.unshaded)}</div>`;
        if (cur.shaded) html += `<div class="etext sh"><span class="lbl">&#9790; Shaded</span>${esc(cur.shaded)}</div>`;
      } else html += `<div class="etext un">${esc(cur.unshaded || 'Coup Round: Victory, Resources, Support, Redeploy, Commitment, Reset.')}</div>`;
      html += '</div>';
    } else html += '<div class="card cur empty">No card in play</div>';
    if (nxt) html += `<div class="card nxt"><span class="lbl">NEXT</span><span class="cid">#${nxt.id}</span><b>${esc(nxt.title)}</b><div class="order">${this.orderChips(nxt.id)}</div></div>`;
    this.setHtml('cards', this.el.cards, html);
  }

  private renderEffects(g: Game) {
    const caps = Object.entries(g.capabilities).map(([id, side]) => `<span class="eff cap ${side}" title="${esc(CARD[+id]?.[side as 'shaded'] ?? '')}">${esc(CARD[+id]?.title ?? id)} <small>${side === 'shaded' ? '&#9790;' : '&#9728;'}</small></span>`);
    const mom = g.momentum.map((id) => `<span class="eff mom" title="${esc(CARD[id]?.unshaded ?? '')}">${esc(CARD[id]?.title ?? String(id))}</span>`);
    this.setHtml('effects', this.el.effects, caps.length || mom.length
      ? `${caps.length ? `<div class="ptitle">Capabilities</div><div class="effs">${caps.join('')}</div>` : ''}${mom.length ? `<div class="ptitle">Momentum</div><div class="effs">${mom.join('')}</div>` : ''}`
      : '');
    this.el.effects.style.display = caps.length || mom.length ? '' : 'none';
  }

  private renderLog(g: Game) {
    const box = this.el.log;
    if (g.log.length < this.logCount) { box.innerHTML = ''; this.logCount = 0; }
    const stick = box.scrollTop + box.clientHeight >= box.scrollHeight - 30;
    for (let i = this.logCount; i < g.log.length; i++) {
      const line = g.log[i];
      const d = document.createElement('div');
      const m = /^(US|ARVN|NVA|VC)\b/.exec(line);
      d.className = 'll' + (m ? ' f-' + m[1] : '') + (/^(=|-|#)/.test(line) || /^(Card|Coup|Eligible)/i.test(line) ? ' hd' : '');
      d.textContent = line;
      box.appendChild(d);
    }
    this.logCount = g.log.length;
    while (box.childElementCount > 400) box.firstElementChild!.remove();
    if (stick) box.scrollTop = box.scrollHeight;
  }

  private renderPrompt(g: Game, view: View, busy: boolean, thinking: Faction | null) {
    const P = this.el.prompt, A = this.el.actions;
    if (g.over) { P.innerHTML = `<b>Game over.</b> ${esc(g.result ?? '')}`; A.innerHTML = ''; return; }
    const who = view.active;
    const col = who ? FACTION_CSS[who] : '#ccc';
    if (busy || (who && !g.humans.includes(who))) {
      P.innerHTML = `<span class="who-dot" style="background:${col}"></span><b style="color:${col}">${who ?? ''}</b> <span class="think">is thinking<i>.</i><i>.</i><i>.</i></span>`;
      A.innerHTML = view.actions.some((a) => a.verb === 'undo') ? '' : '';
      this.addUndo(A, view);
      return;
    }
    const txt = who && view.prompt.startsWith(who) && /^\W|\s/.test(view.prompt.charAt(who.length)) ? view.prompt.slice(who.length).replace(/^:?\s*/, '') : view.prompt;
    P.innerHTML = `<span class="who-dot" style="background:${col}"></span><b style="color:${col}">${who ?? ''}</b> ${esc(txt)}`;
    A.innerHTML = '';
    const acts = view.actions.filter((a) => a.verb !== 'space' && a.verb !== 'piece' && a.verb !== 'undo');
    for (const a of acts) {
      const b = document.createElement('button');
      b.className = 'btn act ' + a.verb;
      b.textContent = a.label;
      b.title = a.label;
      b.onclick = () => this.h.onAction(a.verb, a.arg);
      A.appendChild(b);
    }
    const hasSpaces = view.actions.some((a) => a.verb === 'space' || a.verb === 'piece');
    if (hasSpaces) {
      const n = view.actions.filter((a) => a.verb === 'space').length;
      const hint = document.createElement('span');
      hint.className = 'hint';
      hint.textContent = n ? 'Click a highlighted space on the map' : 'Click a highlighted piece on the map';
      A.prepend(hint);
    }
    this.addUndo(A, view);
  }

  private renderBanner(g: Game, busy: boolean, thinking: Faction | null) {
    const b = this.el.banner;
    const bot = busy && thinking && !g.over;
    b.classList.toggle('hidden', !bot);
    if (!bot) return;
    let last = '';
    for (let i = g.log.length - 1; i >= 0; i--) { if (!/^-{2,}/.test(g.log[i])) { last = g.log[i]; break; } }
    const GER: [RegExp, string][] = [[/Rally|Rallies/i, 'rallying'], [/March/i, 'marching'], [/Attack/i, 'attacking'], [/Terror/i, 'terrorizing'],
      [/Train/i, 'training'], [/Patrol/i, 'patrolling'], [/Sweep/i, 'sweeping'], [/Assault/i, 'assaulting'], [/Govern/i, 'governing'],
      [/Transport/i, 'transporting'], [/Raid/i, 'raiding'], [/Tax/i, 'taxing'], [/Subvert/i, 'subverting'], [/Infiltrat/i, 'infiltrating'],
      [/Bombard/i, 'bombarding'], [/Ambush/i, 'ambushing'], [/Advise/i, 'advising'], [/Air Lift/i, 'air lifting'], [/Air Strike/i, 'striking from the air'],
      [/Event/i, 'playing an event'], [/pass/i, 'passing']];
    const own = new RegExp('^' + thinking + '\b');
    let verb = 'is thinking';
    for (let i = g.log.length - 1; i >= Math.max(0, g.log.length - 12); i--) {
      const l = g.log[i];
      if (!own.test(l)) continue;
      const hit = GER.find(([re]) => re.test(l));
      if (hit) { verb = 'is ' + hit[1]; break; }
    }
    const col = FACTION_CSS[thinking!];
    b.style.setProperty('--fc', col);
    this.setHtml('banner', b, `<span style="color:${col}">${thinking}</span> ${verb}&hellip;<small>${esc(last)}</small>`);
  }

  private addUndo(A: HTMLElement, view: View) {
    if (!view.actions.some((a) => a.verb === 'undo')) return;
    const b = document.createElement('button');
    b.className = 'btn undo';
    b.innerHTML = '&#8630; Undo';
    b.onclick = () => this.h.onUndo();
    A.appendChild(b);
  }

  private renderOver(g: Game) {
    const o = this.el.gameover;
    if (!g.over) { o.classList.add('hidden'); this.overShown = false; return; }
    if (!this.overShown) {
      this.overShown = true;
      o.classList.remove('hidden');
      o.innerHTML = `<div class="panel"><h2>Game Over</h2><p>${esc(g.result ?? '')}</p><button class="btn act" id="go-new">New game</button> <button class="btn" id="go-view">View board</button></div>`;
      o.querySelector<HTMLElement>('#go-view')!.onclick = () => o.classList.add('hidden');
      o.querySelector<HTMLElement>('#go-new')!.onclick = this.h.onNewGame;
    }
  }

  static nonSpaceActions(view: View): ActionOption[] {
    return view.actions.filter((a) => a.verb !== 'space' && a.verb !== 'piece' && a.verb !== 'undo');
  }
}
