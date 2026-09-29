// Concise rules-help drawer.
const HTML = `
<div class="hh"><b>Rules help</b><button class="btn small" id="help-x">&times;</button></div>
<div class="hb">
<h4>Sequence of play</h4>
<ul>
<li>A card is played; the next is shown. The <b>1st Eligible</b> faction (order on the card) chooses, then the <b>2nd Eligible</b>.</li>
<li>Choices: <b>Event</b>, <b>Operation</b> (+ Special Activity), <b>Limited Op</b> (1 space), or <b>Pass</b> (+resources).</li>
<li>If the 1st faction did Op + SA, the 2nd may only Limited Op (or Event if the first did an Op only).</li>
<li>Factions that acted are <b>Ineligible</b> on the next card; passers stay Eligible.</li>
<li><b>Coup cards</b> trigger a Coup Round: Victory check, Resources, Support, Redeploy, Commitment, Reset.</li>
</ul>
<h4>Factions and victory</h4>
<table>
<tr><th class="US">US</th><td>Total Support + Available US Troops/Bases &gt; 50.<br><small>Ops: Train, Patrol, Sweep, Assault. SAs: Advise, Air Lift, Air Strike.</small></td></tr>
<tr><th class="ARVN">ARVN</th><td>COIN-controlled Pop + Patronage &gt; 50.<br><small>Ops: Train, Patrol, Sweep, Assault. SAs: Govern, Transport, Raid.</small></td></tr>
<tr><th class="NVA">NVA</th><td>NVA-controlled Pop + NVA Bases on map &gt; 18.<br><small>Ops: Rally, March, Attack, Terror. SAs: Infiltrate, Bombard, Ambush.</small></td></tr>
<tr><th class="VC">VC</th><td>Total Opposition + VC Bases on map &gt; 35.<br><small>Ops: Rally, March, Attack, Terror. SAs: Tax, Subvert, Ambush.</small></td></tr>
</table>
<h4>Piece legend</h4>
<div class="leg">
<span><i class="cube"></i>Troops (cube)</span>
<span><i class="flat"></i>Police (flat block, ARVN)</span>
<span><i class="tall"></i>Underground guerrilla / Irregular / Ranger (tall, dark)</span>
<span><i class="short"></i>Active guerrilla etc. (short, bright, white ring)</span>
<span><i class="hex"></i>Base (hex disc)</span>
<span><i class="tun"></i>Tunneled Base (gold ring)</span>
</div>
<div class="leg colors"><span style="--c:#6f8f2a">US</span><span style="--c:#e8c62c">ARVN</span><span style="--c:#d33a2e">NVA</span><span style="--c:#2f74e0">VC</span></div>
<h4>Map markers</h4>
<ul>
<li>Green flag = Support (tall = Active), violet flag = Opposition (tall = Active).</li>
<li><b>C</b> hex = COIN Control, <b>N</b> hex = NVA Control. Black cones = Terror; orange = Sabotage on LoCs.</li>
<li>Round badge = Population; blue square badge = LoC Economic value.</li>
<li>Cyan pulse = legal choice, gold = selected, orange flash = where a bot just acted.</li>
</ul>
<h4>Controls</h4>
<ul><li>Left-drag pans, right-drag rotates, wheel zooms. Hover a space for details. Click a highlighted space or piece to choose.</li></ul>
</div>`;

export class HelpDrawer {
  private el: HTMLElement;
  constructor() {
    this.el = document.createElement('div');
    this.el.id = 'help';
    this.el.className = 'hidden';
    this.el.innerHTML = HTML;
    document.getElementById('app')!.appendChild(this.el);
    this.el.querySelector<HTMLElement>('#help-x')!.onclick = () => this.toggle(false);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.toggle(false); if (e.key === '?' ) this.toggle(); });
  }
  toggle(on?: boolean) { this.el.classList.toggle('hidden', on === undefined ? !this.el.classList.contains('hidden') : !on); }
}
