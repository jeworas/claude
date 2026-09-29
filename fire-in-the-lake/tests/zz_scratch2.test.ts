import { it } from 'vitest';
import { newGame, doAction } from '../src/engine';
import { botStep } from '../src/ai/bot';
it('metric', () => {
  for (const name of ['short','medium','full']) {
    const out: string[] = [];
    for (let seed = 1; seed <= 8; seed++) {
      const g = newGame(name, [], seed); let steps = 0;
      while (!g.over && steps++ < 80000) { const a = botStep(g); doAction(g, a.verb, a.arg); }
      out.push(`${g.coup_count}${g.over ? '' : '?'}`);
    }
    console.log(name, 'coups at end:', out.join(' '));
  }
}, 600000);
