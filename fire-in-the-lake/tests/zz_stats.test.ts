import { it } from 'vitest';
import * as fs from 'fs';
import { newGame, doAction } from '../src/engine';
import { botStep } from '../src/ai/bot';
it('stats', () => {
  const out: string[] = [];
  const scs = ['short', 'medium', 'full'];
  for (let i = 0; i < 12; i++) {
    const sc = scs[i % 3]; const seed = 100 + i;
    const g = newGame(sc, [], seed);
    let steps = 0; const t0 = Date.now();
    while (!g.over && steps < 60000) { const a = botStep(g); doAction(g, a.verb, a.arg); steps++; }
    const dt = Date.now() - t0;
    out.push(`${sc} ${seed} steps=${steps} coups=${g.coup_count} ms/step=${(dt / steps).toFixed(1)} ${g.result?.slice(0, 400)}`);
  }
  fs.writeFileSync(process.env.STATS_OUT ?? '/tmp/stats.txt', out.join('\n'));
}, 900000);
