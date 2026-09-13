import { describe, expect, it } from 'vitest';
import {
  classifyMetaFromDraft,
  inferPlaceArchetypeFromText,
  inferSeverityFromText,
  inferTimeTagFromText,
} from './classifyMetaFields.js';

describe('inferPlaceArchetypeFromText', () => {
  it('maps station keyword', () => {
    expect(inferPlaceArchetypeFromText('駅前の段差').placeArchetype).toBe('station');
  });

  it('maps label hint', () => {
    expect(inferPlaceArchetypeFromText('歩道').placeArchetype).toBe('road');
  });

  it('returns none for unknown text', () => {
    expect(inferPlaceArchetypeFromText('なんか変な場所').placeArchetype).toBe('none');
  });
});

describe('inferTimeTagFromText', () => {
  it('detects night', () => {
    expect(inferTimeTagFromText('夜は暗い')).toBe('night');
  });

  it('defaults to always', () => {
    expect(inferTimeTagFromText('')).toBe('always');
  });
});

describe('inferSeverityFromText', () => {
  it('detects high severity', () => {
    expect(inferSeverityFromText('深刻で危ない')).toBe('high');
  });

  it('defaults to mid', () => {
    expect(inferSeverityFromText('')).toBe('mid');
  });
});

describe('classifyMetaFromDraft', () => {
  it('merges free-text fields into structured meta', () => {
    const meta = classifyMetaFromDraft({
      placeText: '駅',
      whoText: '女性・夜一人',
      contextText: '夜、深刻',
    });
    expect(meta.placeArchetype).toBe('station');
    expect(meta.whoText).toBe('女性・夜一人');
    expect(meta.affectedGroups).toEqual([]);
    expect(meta.affectedOther).toBe('');
    expect(meta.timeTag).toBe('night');
    expect(meta.severity).toBe('high');
  });

  it('preserves legacy chip selections when present on draft', () => {
    const meta = classifyMetaFromDraft({
      whoText: '車いす',
      affectedGroups: ['車いす'],
    });
    expect(meta.whoText).toBe('車いす');
    expect(meta.affectedGroups).toEqual(['車いす']);
  });

  it('prefers explicit timeTag and severity over contextText', () => {
    const meta = classifyMetaFromDraft({
      timeTag: 'day',
      severity: 'low',
      contextText: '夜、深刻',
    });
    expect(meta.timeTag).toBe('day');
    expect(meta.severity).toBe('low');
  });
});
