// Rules-help drawer, summarised from the 2018 Fire in the Lake rulebook (section numbers in brackets).
const HTML = `
<div class="hh"><b>Rules help</b><button class="btn small" id="help-x">&times;</button></div>
<div class="hb">
<h4>Sequence of play <small>[2.0]</small></h4>
<ul>
<li><b>Eligibility [2.3.1]:</b> factions that did not execute an Op or Event on the previous card are Eligible; those that did are Ineligible.</li>
<li><b>Order [2.3.2]:</b> the leftmost Eligible symbol on the card is 1st Eligible, the next is 2nd Eligible.</li>
<li><b>Pass [2.3.3]:</b> stay Eligible; +1 Resource (NVA/VC) or +3 ARVN Resources (US/ARVN). Next Eligible faction moves up.</li>
<li><b>1st Eligible [2.3.4]:</b> Event, <i>or</i> Operation (with or without a Special Activity).</li>
<li><b>2nd Eligible:</b> after Op only: Limited Op. After Op + SA: Limited Op or the Event. After Event: Op (+SA).</li>
<li><b>Limited Op [2.3.5]:</b> an Op in 1 space, no SA.</li>
<li><b>Pivotal Events [2.3.8]:</b> play from hand to cancel an Event card if you are Eligible, the precondition is met, and the 1st Eligible has not acted.</li>
<li><b>Monsoon [2.3.9]:</b> on the last card before a Coup: no Sweep or March, Air Strike/Lift limited to 2 spaces, no Pivotal Events.</li>
<li><b>Coup card [2.4]:</b> sets the RVN Leader, then a Coup Round runs.</li>
</ul>

<h4>Operations <small>[3.0]</small></h4>
<ul>
<li>Pay Resources, usually per space [3.1]. US spends ARVN Resources, never below Total Econ.</li>
<li><b>COIN [3.2]:</b> <b>Train</b> (place ARVN forces / Irregulars, Pacify) &middot; <b>Patrol</b> (move cubes along LoCs, activate guerrillas) &middot; <b>Sweep</b> (move Troops, activate Underground guerrillas) &middot; <b>Assault</b> (remove enemy pieces).</li>
<li><b>Insurgent [3.3]:</b> <b>Rally</b> (place guerrillas/Bases, Trail) &middot; <b>March</b> (move guerrillas/Troops) &middot; <b>Attack</b> (remove enemies, risk losses) &middot; <b>Terror</b> (shift Support, Terror/Sabotage markers).</li>
</ul>

<h4>Special Activities <small>[4.0]</small></h4>
<ul>
<li><b>US [4.2]:</b> Advise, Air Lift, Air Strike.</li>
<li><b>ARVN [4.3]:</b> Govern, Transport, Raid.</li>
<li><b>NVA [4.4]:</b> Infiltrate, Bombard, Ambush.</li>
<li><b>VC [4.5]:</b> Tax, Subvert, Ambush.</li>
<li>An SA may be done before, during or after its Op, in the same or different spaces per its rules [4.1].</li>
</ul>

<h4>Events <small>[5.0]</small></h4>
<ul>
<li>Choose the unshaded or shaded text (dual use [5.2]).</li>
<li><b>Capabilities [5.3]</b> last until the game ends; <b>Momentum [5.4]</b> lasts until the next Coup Round's Reset.</li>
</ul>

<h4>Coup Round <small>[6.0]</small></h4>
<ol>
<li><b>Victory [6.1]:</b> if anyone meets their condition, the game ends.</li>
<li><b>Resources [6.2]:</b> Sabotage; Degrade Trail if COIN controls Laos/Cambodia; ARVN earns Aid + unsabotaged Econ; VC earns its Bases; NVA earns Laos/Cambodia Bases + 2&times;Trail; Aid &minus; 3&times;Casualties.</li>
<li><b>Support [6.3]:</b> Pacification (US/ARVN, 3 ARVN Resources per step, up to 4 spaces, max 2 levels each); VC Agitation (1 Resource per step).</li>
<li><b>Redeploy [6.4]:</b> clear US/ARVN from Laos/Cambodia; ARVN and NVA redeploy Troops.</li>
<li><b>Commitment [6.5]:</b> US rotation and withdrawal.</li>
<li><b>Reset [6.6]:</b> Trail 0&rarr;1, 4&rarr;3; remove Terror/Sabotage; flip guerrillas Underground; clear Momentum; all Eligible.</li>
</ol>

<h4>Victory <small>[7.0]</small></h4>
<table>
<tr><th class="US">US</th><td>Total Support + Available US Troops &amp; Bases &gt; 50</td></tr>
<tr><th class="ARVN">ARVN</th><td>COIN-Controlled Pop + Patronage &gt; 50</td></tr>
<tr><th class="NVA">NVA</th><td>NVA-Controlled Pop + NVA Bases on map &gt; 18</td></tr>
<tr><th class="VC">VC</th><td>Total Opposition + VC Bases on map &gt; 35</td></tr>
</table>
<p><small>Total Support/Opposition counts Active levels double [1.6.2]. After the final Coup the highest victory margin wins [7.3]; ties: Non-players, VC, ARVN, NVA [7.1].</small></p>

<h4>Control and Support <small>[1.6-1.7]</small></h4>
<ul>
<li><b>COIN Control:</b> US + ARVN pieces exceed NVA + VC pieces. <b>NVA Control:</b> NVA pieces exceed all others.</li>
<li>LoCs and 0-Pop Provinces are always Neutral.</li>
</ul>

<h4>Map legend</h4>
<div class="leg">
<span><i class="cube"></i>Troops (cube)</span>
<span><i class="flat"></i>Police (flat block, ARVN)</span>
<span><i class="tall"></i>Underground guerrilla / Irregular / Ranger (tall, dark)</span>
<span><i class="short"></i>Active guerrilla etc. (short, bright, white ring)</span>
<span><i class="hex"></i>Base (hex disc); gold ring = Tunnel</span>
<span><i class="hex" style="background:linear-gradient(90deg,#6f8f2a 50%,#e8c62c 50%)"></i>COIN Control (olive + yellow)</span>
<span><i class="hex" style="background:#c02a20"></i>NVA Control (red)</span>
<span><i class="flag" style="background:#a8cf2a"></i>Support: lime flag (pale = Passive, tall + 2 banners = Active)</span>
<span><i class="flag" style="background:#8e3ec9"></i>Opposition: violet flag (pale = Passive, tall = Active)</span>
</div>
<div class="leg colors"><span style="--c:#6f8f2a">US olive</span><span style="--c:#e8c62c">ARVN yellow</span><span style="--c:#d33a2e">NVA red</span><span style="--c:#2f74e0">VC blue</span></div>
<ul>
<li>Black cones = Terror; orange = Sabotage. Round badge = Population; blue badge = LoC Econ.</li>
<li>Cyan pulse = legal choice, gold = selected, orange flash = where a bot just acted.</li>
<li>Left-drag pans, right-drag rotates, wheel zooms. Click the <b>Cards</b> button to browse played cards.</li>
</ul>
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
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.toggle(false); if (e.key === '?') this.toggle(); });
  }
  toggle(on?: boolean) { this.el.classList.toggle('hidden', on === undefined ? !this.el.classList.contains('hidden') : !on); }
}
