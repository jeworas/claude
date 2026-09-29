import { describe, it, expect } from 'vitest';
import { newGame, getView, doAction, currentFaction } from '../src/engine';
import { botStep } from '../src/ai/bot';

describe('soak: bot-vs-bot games', () => {
  for (const sc of ['short', 'medium', 'full']) {
    for (const seed of [1, 2, 3]) {
      it(`${sc} seed ${seed} finishes`, () => {
        const g = newGame(sc, [], seed);
        let steps = 0;
        while (!g.over && steps < 60000) {
          const a = botStep(g);
          doAction(g, a.verb, a.arg);
          steps++;
        }
        console.log(sc, seed, steps, g.coup_count, g.result?.slice(0, 120));
        expect(g.over).toBe(true);
      }, 300000);
    }
  }
});
