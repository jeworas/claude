// Start screen: scenario, human/AI seats, seed, continue/load.
import type { Faction } from '../core/types';
import { FACTIONS } from '../core/types';
import { SCENARIOS } from '../data/scenarios';
import { FACTION_CSS } from './pieces';

export interface StartConfig { scenario: string; humans: Faction[]; seed: number; }

export interface StartHandlers {
  onStart(cfg: StartConfig): void;
  onContinue(): void;
  onLoadFile(): void;
  hasSave(): boolean;
}

const FNAME: Record<Faction, string> = { US: 'United States', ARVN: 'Army of the Republic of Vietnam', NVA: 'North Vietnamese Army', VC: 'Viet Cong' };
const FBLURB: Record<Faction, string> = { US: 'Win Total Support > 50', ARVN: 'COIN-controlled Pop + Patronage > 50', NVA: 'NVA-controlled Pop + Bases > 18', VC: 'Opposition + VC Bases > 35' };

export class StartScreen {
  private humans = new Set<Faction>(['US']);
  private scenario = '';
  constructor(private root: HTMLElement, private h: StartHandlers) {}

  show() {
    const ids = Object.keys(SCENARIOS);
    if (!this.scenario || !SCENARIOS[this.scenario]) this.scenario = SCENARIOS['short'] ? 'short' : ids[0] ?? '';
    const scen = ids.map((id) => {
      const s = SCENARIOS[id];
      return `<label class="scen ${id === this.scenario ? 'on' : ''}" data-id="${id}"><input type="radio" name="scen" value="${id}" ${id === this.scenario ? 'checked' : ''}/><b>${s.name}</b><span>${s.description}</span></label>`;
    }).join('') || '<div class="scen"><b>No scenarios loaded</b><span>Scenario data is not available yet.</span></div>';
    const seats = FACTIONS.map((f) => `
      <div class="seat" data-f="${f}" style="--fc:${FACTION_CSS[f]}">
        <div class="seatname"><i></i><b>${f}</b><small>${FNAME[f]}</small></div>
        <div class="seatgoal">${FBLURB[f]}</div>
        <div class="toggle"><button data-v="human" class="${this.humans.has(f) ? 'on' : ''}">Human</button><button data-v="ai" class="${this.humans.has(f) ? '' : 'on'}">AI</button></div>
      </div>`).join('');
    this.root.innerHTML = `
      <div class="startwrap">
        <div class="startcard">
          <div class="title"><span class="flame big"></span><div><h1>FIRE IN THE LAKE</h1><p>COIN Series Vol. IV &middot; Insurgency in Vietnam</p></div></div>
          <h3>Scenario</h3><div class="scens">${scen}</div>
          <h3>Players</h3><div class="seats">${seats}</div>
          <div class="row">
            <label class="seed">Seed <input id="seed" type="number" value="${Math.floor(Math.random() * 1e9)}" /></label>
            <button class="btn small" id="rnd">&#127922; Random</button>
            <span class="grow"></span>
            <button class="btn small" id="cont" ${this.h.hasSave() ? '' : 'disabled'}>Continue saved game</button>
            <button class="btn small" id="loadf">Load from file</button>
            <button class="btn act big" id="go" ${ids.length ? '' : 'disabled'}>Start Game</button>
          </div>
        </div>
      </div>`;
    this.root.classList.remove('hidden');
    const q = <T extends HTMLElement>(s: string) => this.root.querySelector(s) as T;
    this.root.querySelectorAll<HTMLElement>('.scen[data-id]').forEach((el) => (el.onclick = () => {
      this.scenario = el.dataset.id!;
      this.root.querySelectorAll('.scen').forEach((x) => x.classList.toggle('on', x === el));
    }));
    this.root.querySelectorAll<HTMLElement>('.seat').forEach((el) => {
      el.querySelectorAll<HTMLElement>('button').forEach((b) => (b.onclick = () => {
        const f = el.dataset.f as Faction;
        if (b.dataset.v === 'human') this.humans.add(f); else this.humans.delete(f);
        el.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
      }));
    });
    q('#rnd').onclick = () => { (q('#seed') as HTMLInputElement).value = String(Math.floor(Math.random() * 1e9)); };
    q('#cont').onclick = () => this.h.onContinue();
    q('#loadf').onclick = () => this.h.onLoadFile();
    q('#go').onclick = () => {
      const seed = parseInt((q('#seed') as HTMLInputElement).value, 10);
      this.h.onStart({ scenario: this.scenario, humans: FACTIONS.filter((f) => this.humans.has(f)), seed: Number.isFinite(seed) ? seed : 1 });
    };
  }

  hide() { this.root.classList.add('hidden'); this.root.innerHTML = ''; }
}
