import { WHO_PICTOGRAMS } from '../../constants/pictogramAssets';

export const AFFECTED_OTHER_LABEL = 'その他';
export const AFFECTED_OTHER_MAX_LEN = 30;

/** AR 投稿フォーム用（観光客チップなし・その他あり） */
export const AR_TARGET_GROUP_OPTIONS = [
  { id: 'all', label: 'みんな', iconSrc: WHO_PICTOGRAMS.all },
  { id: 'senior', label: '高齢者', iconSrc: WHO_PICTOGRAMS.senior },
  { id: 'wheelchair', label: '車いす', iconSrc: WHO_PICTOGRAMS.wheelchair },
  { id: 'stroller', label: 'ベビーカー', iconSrc: WHO_PICTOGRAMS.stroller },
  { id: 'child', label: '子ども', iconSrc: WHO_PICTOGRAMS.child },
  { id: 'other', label: AFFECTED_OTHER_LABEL, iconSrc: null },
];

/**
 * @returns {{ affectedGroups: string[], affectedOther: string }}
 */
export function toggleAffectedGroup(prevGroups = [], label, affectedOther = '') {
  if (label === 'みんな') {
    return prevGroups.includes('みんな')
      ? { affectedGroups: [], affectedOther: '' }
      : { affectedGroups: ['みんな'], affectedOther: '' };
  }

  const base = prevGroups.filter((v) => v !== 'みんな');

  if (label === AFFECTED_OTHER_LABEL) {
    if (base.includes(AFFECTED_OTHER_LABEL)) {
      return {
        affectedGroups: base.filter((v) => v !== AFFECTED_OTHER_LABEL),
        affectedOther: '',
      };
    }
    return { affectedGroups: [...base, AFFECTED_OTHER_LABEL], affectedOther };
  }

  if (base.includes(label)) {
    return { affectedGroups: base.filter((v) => v !== label), affectedOther };
  }
  return { affectedGroups: [...base, label], affectedOther };
}

export function isOtherGroupSelected(groups = []) {
  return groups.includes(AFFECTED_OTHER_LABEL);
}
