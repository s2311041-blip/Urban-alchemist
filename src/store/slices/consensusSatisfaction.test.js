import { describe, it, expect } from 'vitest';
import {
  applyPlanDeltaToSatisfaction,
  getPlanPreviewDeltas,
} from '../../utils/planSatisfaction.js';
import { createInitialSatisfaction } from '../../constants/satisfactionAttributes.js';
import { getAllowedPlansForQuest } from '../../constants/tradeoffMatrix.js';

describe('consensus satisfaction persistence (unit)', () => {
  it('second quest baseline uses first quest committed values', () => {
    let islandSatisfaction = createInitialSatisfaction();
    const firstPlan = getAllowedPlansForQuest({ needType: 'P' })[0];
    const firstEffect = getPlanPreviewDeltas('P', firstPlan);
    expect(firstEffect).toBeTruthy();

    islandSatisfaction = applyPlanDeltaToSatisfaction(islandSatisfaction, {
      needType: 'P',
      planId: firstPlan,
    });

    expect(Object.values(islandSatisfaction).some((v) => v !== 50)).toBe(true);

    const secondPlan = getAllowedPlansForQuest({ needType: 'V' })[0];
    const previewFromCommitted = applyPlanDeltaToSatisfaction(islandSatisfaction, {
      needType: 'V',
      planId: secondPlan,
    });
    const previewFromFresh50 = applyPlanDeltaToSatisfaction(createInitialSatisfaction(), {
      needType: 'V',
      planId: secondPlan,
    });

    // 1件目反映後のプレビューは、常に50起点とは異なる
    expect(previewFromCommitted).not.toEqual(previewFromFresh50);
  });
});
