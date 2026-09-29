// Event-card rendering (HTML), used by the card panel and the deck viewer.
import type { CardDef, Faction } from '../core/types';
import { FACTION_CSS } from './pieces';

const FNAME: Record<Faction, string> = { US: 'United States', ARVN: 'ARVN', NVA: 'North Vietnam', VC: 'Viet Cong' };
const SHORT: Record<Faction, string> = { US: 'US', ARVN: 'AR', NVA: 'NV', VC: 'VC' };

export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

/** Split "Headline: body" into an italic headline and the remaining text. */
function side(text: string): string {
  const m = /^([A-Z][^.:\n]{2,60}):\s+([\s\S]*)$/.exec(text.trim());
  if (!m) return esc(text);
  return `<i class="hl">${esc(m[1])}:</i> ${esc(m[2])}`;
}

export function orderChips(c: CardDef | null | undefined, small = false): string {
  if (!c) return '';
  if (c.coup) return '<span class="coupchip">COUP</span>';
  return c.order.map((f, i) => `<span class="ochip${small ? ' sm' : ''}" style="--fc:${FACTION_CSS[f]}" title="${i + 1}. ${FNAME[f]}">${SHORT[f]}</span>`).join('');
}

function periodLabel(c: CardDef): string {
  const p = (c as any).period as string | undefined;
  const ed = (c as any).edition ?? ((c as any).secondEd ? '2nd Ed' : '');
  return [p ? `${p}` : '', ed].filter(Boolean).join(' · ');
}

export interface CardOpts { compact?: boolean; capability?: 'shaded' | 'unshaded'; momentum?: boolean }

export function cardHtml(c: CardDef, o: CardOpts = {}): string {
  const tips = (c as any).tips as string | string[] | undefined;
  const tipHtml = tips && (Array.isArray(tips) ? tips.length : tips.length)
    ? `<details class="tips"><summary>Tips</summary><div>${(Array.isArray(tips) ? tips : [tips]).map((t) => `<p>${esc(t)}</p>`).join('')}</div></details>` : '';
  const per = periodLabel(c);
  if (c.coup) {
    return `<div class="ecard coup">
      <div class="ehead"><span class="enum">#${c.id}</span><b>${esc(c.title)}</b><span class="tag act">COUP!</span></div>
      ${c.leader ? `<div class="banner leader">RVN LEADER</div>` : ''}
      ${c.unshaded ? `<div class="etext un">${side(c.unshaded)}</div>` : ''}
      ${c.shaded ? `<div class="etext sh">${side(c.shaded)}</div>` : ''}
      <div class="phases">Victory &rarr; Resources &rarr; Support &rarr; Redeploy &rarr; Commitment &rarr; Reset</div>
      ${tipHtml}</div>`;
  }
  const piv = c.pivotal;
  const banners = [
    piv ? `<div class="banner piv" style="--fc:${FACTION_CSS[piv]}">PIVOTAL EVENT &middot; ${FNAME[piv]}</div>` : '',
    c.capability ? '<div class="banner cap">CAPABILITY</div>' : '',
    c.momentum ? '<div class="banner mom">MOMENTUM</div>' : '',
  ].join('');
  const body = piv
    ? `<div class="etext un piv">${side(c.unshaded)}</div>${c.shaded ? `<div class="etext sh">${side(c.shaded)}</div>` : ''}`
    : `<div class="etext un"><span class="lbl">&#9728; Unshaded</span>${side(c.unshaded)}</div>${c.shaded ? `<div class="etext sh"><span class="lbl">&#9790; Shaded</span>${side(c.shaded)}</div>` : ''}`;
  return `<div class="ecard ${piv ? 'pivotal' : ''}" ${piv ? `style="--fc:${FACTION_CSS[piv]}"` : ''}>
    <div class="ehead"><span class="enum">#${c.id}</span><b>${esc(c.title)}</b>${per ? `<span class="eper">${esc(per)}</span>` : ''}</div>
    <div class="order">${orderChips(c)}</div>
    ${banners}${body}${tipHtml}</div>`;
}
