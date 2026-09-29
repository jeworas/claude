import { it } from 'vitest';
import { newGame } from '../src/engine';
import { victoryScore } from '../src/core/pieces';
import { FACTIONS } from '../src/core/types';
it('start', () => { for (const n of ['short','medium','full']) { const g = newGame(n, [], 1); console.log(n, FACTIONS.map(f=>victoryScore(g,f)).join(' ')); } });
