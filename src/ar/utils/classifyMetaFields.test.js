import { describe, expect, it } from 'vitest';
import {
  classifyMetaFromDraft,
  inferAffectedFromText,
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

describe('inferAffectedFromText', () => {
  it('maps wheelchair', () => {
    expect(inferAffectedFromText('車いすユーザー').affectedGroups).toContain('車いす');
  });

  it('returns empty for skip', () => {
    expect(inferAffectedFromText('')).toEqual({ affectedGroups: [], affectedOther: '' });
  });

  it('stores custom text as other', () => {
    const r = inferAffectedFromText('観光客');
    expect(r.affectedGroups).toEqual(['その他']);
    expect(r.affectedOther).toBe('観光客');
  });
});

describe('classifyMetaFromDraft', () => {
  it('merges free-text fields into structured meta', () => {
    const meta = classifyMetaFromDraft({
      placeText: '駅',
      whoText: '高齢者',
      contextText: '夜、深刻',
    });
    expect(meta.placeArchetype).toBe('station');
    expect(meta.affectedGroups).toContain('高齢者');
    expect(meta.timeTag).toBe('night');
    expect(meta.severity).toBe('high');
  });
});
