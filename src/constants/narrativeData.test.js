import { describe, it, expect } from 'vitest';
import { appendWorkshopEnding } from './narrativeData';
import { createInitialSatisfaction } from './satisfactionAttributes';

const solved = [{ solved: true }, { solved: true }, { solved: true }, { solved: true }];
const open = [{ solved: true }, { solved: true }, { solved: true }, { solved: false }];
const lastLine = [{ speaker: '住民', text: '最後の声です。' }];

describe('appendWorkshopEnding', () => {
  it('keeps the success ending when every attribute is at least 20', () => {
    const satisfaction = { ...createInitialSatisfaction(), livability: 20 };
    const lines = appendWorkshopEnding(lastLine, solved, satisfaction);
    expect(lines.map((line) => line.text).join('\n')).toContain('ありがとうございました');
    expect(lines.map((line) => line.text).join('\n')).not.toContain('ゲームオーバー');
  });

  it('ends in game over when any attribute is under 20 after all four are solved', () => {
    const satisfaction = { ...createInitialSatisfaction(), livability: 19, link: 18 };
    const lines = appendWorkshopEnding(lastLine, solved, satisfaction);
    const text = lines.map((line) => line.text).join('\n');
    expect(text).toContain('最後の声です。');
    expect(text).toContain('静穏が19');
    expect(text).toContain('移動が18');
    expect(text).toContain('ゲームオーバー');
    expect(text).not.toContain('ありがとうございました');
  });

  it('does not judge the session while a complaint is still open', () => {
    const satisfaction = { ...createInitialSatisfaction(), livability: 0 };
    const lines = appendWorkshopEnding(lastLine, open, satisfaction);
    expect(lines).toEqual(lastLine);
  });
});
