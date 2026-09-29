import { it } from 'vitest';
import { newGame, doAction } from '../src/engine';
import { botStep } from '../src/ai/bot';
import { victoryScore } from '../src/core/pieces';
import { FACTIONS } from '../src/core/types';
const sc = (g:any)=>FACTIONS.map(f=>victoryScore(g,f));
const RE=/Terror|Agitat|Air Strike|Pacif|Event|Tax|Rally|Base|Assault|Sweep|Govern|Train|Patrol|Attack|Ambush|Subvert|Infiltrate|Redeploy|March|Bombard|Transport/;
it('tally', () => {
  for (const name of ['full']) {
    const tally: Record<string, number[]> = {};
    for (const seed of [1,2,3,4]) {
      const g = newGame(name, [], seed);
      let prev = sc(g), pl = g.log.length, steps=0;
      while (!g.over && steps++ < 60000 && g.coup_count < 2) {
        const a = botStep(g); doAction(g, a.verb, a.arg);
        const s = sc(g); const d = s.map((v,i)=>v-prev[i]);
        if (d.some(x=>x)) {
          const lines = g.log.slice(pl); const l = lines.find(x=>RE.test(x)) ?? 'other';
          const key = (l.match(RE)?.[0] ?? 'other');
          tally[key] = (tally[key] ?? [0,0,0,0]).map((v,i)=>v+d[i]);
        }
        prev = s; pl = g.log.length;
      }
      console.log(name, seed, 'cards played until', g.coup_count?'coup':'end', prev.join(' '), g.result?.slice(0,60));
    }
    console.log(name, JSON.stringify(tally));
  }
}, 300000);
