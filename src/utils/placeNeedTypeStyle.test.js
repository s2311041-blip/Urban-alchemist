import { describe, expect, it } from 'vitest';
import { QUEST_STATUS } from '../store/helpers/questState';
import {
  isPresetExpressionResolved,
  resolvePlaceNeedStyle,
  shouldHidePresetExpressionAccent,
} from './placeNeedTypeStyle';

describe('resolvePlaceNeedStyle', () => {
  it('keeps structural P styling after expression resolution', () => {
    const unresolved = resolvePlaceNeedStyle('P');
    const resolved = resolvePlaceNeedStyle('P', { expressionResolved: true });

    expect(resolved.extraNorthEntrySteps).toBe(unresolved.extraNorthEntrySteps);
    expect(resolved.roadWidthMul).toBe(unresolved.roadWidthMul);
  });

  it('clears expression styling for V after resolution', () => {
    const resolved = resolvePlaceNeedStyle('V', { expressionResolved: true });

    expect(resolved.lightMul).toBe(1);
    expect(resolved.bleakMood).toBe(false);
    expect(resolved.asphaltColor).toBe('#353535');
  });

  it('clears bleak mood for S after resolution', () => {
    const resolved = resolvePlaceNeedStyle('S', { expressionResolved: true });

    expect(resolved.bleakMood).toBe(false);
    expect(resolved.lightMul).toBe(1);
  });
});

describe('isPresetExpressionResolved', () => {
  it('returns true when linked quest is resolved', () => {
    const block = {
      presetNeedType: 'V',
      presetSourceQuestId: 'quest_1',
      presetArchetype: 'station',
    };
    const quests = [{ id: 'quest_1', questStatus: QUEST_STATUS.RESOLVED, needType: 'V' }];

    expect(isPresetExpressionResolved(block, quests)).toBe(true);
  });

  it('returns false for structural P even when quest is resolved', () => {
    const block = {
      presetNeedType: 'P',
      presetSourceQuestId: 'quest_2',
      presetArchetype: 'station',
    };
    const quests = [{ id: 'quest_2', questStatus: QUEST_STATUS.RESOLVED, needType: 'P' }];

    expect(isPresetExpressionResolved(block, quests)).toBe(false);
  });

  it('falls back to archetype matching for legacy blocks', () => {
    const block = {
      presetNeedType: 'M',
      presetArchetype: 'park',
    };
    const quests = [
      { id: 'quest_3', questStatus: QUEST_STATUS.RESOLVED, needType: 'M', placeArchetype: 'park' },
    ];

    expect(isPresetExpressionResolved(block, quests)).toBe(true);
  });
});

describe('shouldHidePresetExpressionAccent', () => {
  it('hides expression accent blocks after resolution', () => {
    const block = {
      presetExpressionAccent: true,
      presetNeedType: 'M',
      presetSourceQuestId: 'quest_4',
    };
    const quests = [{ id: 'quest_4', questStatus: QUEST_STATUS.RESOLVED, needType: 'M' }];

    expect(shouldHidePresetExpressionAccent(block, quests)).toBe(true);
  });
});
