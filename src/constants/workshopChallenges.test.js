import { describe, expect, it } from 'vitest';
import { getPlanPreviewDeltas } from '../utils/planSatisfaction';
import { buildPlanResolutionFeedback } from '../utils/planResolutionFeedback';
import { getSelectablePlansForQuest } from './tradeoffMatrix';

describe('workshop challenge sheet', () => {
  it('uses the station sheet instead of the shared danger row', () => {
    const preview = getPlanPreviewDeltas('S', 'maintenance', 'point', 'ws-shiomi-bikes');
    expect(preview.budgetCost).toBe(30);
    expect(preview.deltas).toMatchObject({ link: 15, place: -15, inclusive: 20, livability: 0 });
    expect(getSelectablePlansForQuest({
      needType: 'S',
      sourceAnnotationId: 'ws-shiomi-bikes',
    }).slice(0, 3)).toEqual(['maintenance', 'detour_path', 'sign_info']);
  });

  it('speaks the dedicated lines and does not say ignore', () => {
    const lines = buildPlanResolutionFeedback({
      needType: 'S',
      planId: 'ignore',
      sourceAnnotationId: 'ws-shiomi-bikes',
      questComment: '駅前の点字ブロック',
    });
    const text = lines.map((line) => line.text).join('\n');
    expect(text).toContain('今回は手を打たず、現状維持としました。');
    expect(text).toContain('手を打たない判断');
    expect(text).not.toContain('ignore');
  });

  it('gives the slope plan its own numbers and speaker', () => {
    const preview = getPlanPreviewDeltas('L', 'detour_path', 'point', 'ws-slope-blind');
    expect(preview.deltas).toMatchObject({ link: -20, place: 5, inclusive: 15, livability: -5 });
    const lines = buildPlanResolutionFeedback({
      needType: 'L',
      planId: 'lighting',
      sourceAnnotationId: 'ws-slope-blind',
      questComment: '歩道橋のスロープから自転車が勢いよく降りてくる',
    });
    expect(lines[1].speaker).toBe('スムーズに移動したい人');
    expect(lines[1].text).toContain('大型ミラー');
  });
});
