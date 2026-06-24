import { describe, expect, it } from 'vitest';
import { getAllNeedTypeIds, PPS_NEED_GROUPS } from './needTypeGroups.js';
import {
  toggleAffectedGroup,
  isOtherGroupSelected,
  AFFECTED_OTHER_LABEL,
} from './arTargetGroups.js';
import { canProceedStep } from '../utils/postFormSteps.js';

describe('PPS_NEED_GROUPS', () => {
  it('covers all 8 need types exactly once', () => {
    const ids = getAllNeedTypeIds();
    expect(ids).toHaveLength(8);
    expect(new Set(ids).size).toBe(8);
  });

  it('has four groups', () => {
    expect(PPS_NEED_GROUPS).toHaveLength(4);
  });
});

describe('toggleAffectedGroup', () => {
  it('exclusive みんな', () => {
    expect(toggleAffectedGroup([], 'みんな')).toEqual({
      affectedGroups: ['みんな'],
      affectedOther: '',
    });
    expect(toggleAffectedGroup(['みんな'], '高齢者')).toEqual({
      affectedGroups: ['高齢者'],
      affectedOther: '',
    });
  });

  it('toggles その他 and clears text when off', () => {
    const on = toggleAffectedGroup(['高齢者'], AFFECTED_OTHER_LABEL, 'チャリ');
    expect(on.affectedGroups).toContain(AFFECTED_OTHER_LABEL);
    const off = toggleAffectedGroup(on.affectedGroups, AFFECTED_OTHER_LABEL, 'チャリ');
    expect(off.affectedOther).toBe('');
    expect(isOtherGroupSelected(off.affectedGroups)).toBe(false);
  });
});

describe('canProceedStep context', () => {
  it('allows empty selection', () => {
    expect(canProceedStep('context', { affectedGroups: [] })).toBe(true);
  });

  it('requires text when その他 selected', () => {
    expect(canProceedStep('context', {
      affectedGroups: [AFFECTED_OTHER_LABEL],
      affectedOther: '',
    })).toBe(false);
    expect(canProceedStep('context', {
      affectedGroups: [AFFECTED_OTHER_LABEL],
      affectedOther: 'チャリ',
    })).toBe(true);
  });
});
