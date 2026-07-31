import { SPECIAL_PROMPTS, STANDING_PROMPTS_BY_MONTH } from '../constants/promptSpecs';

const parseDay = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** @param {Date} [now] */
export function getStandingPrompt(now = new Date()) {
  const month = now.getMonth() + 1;
  return STANDING_PROMPTS_BY_MONTH.find((p) => p.calendarMonth === month)
    ?? STANDING_PROMPTS_BY_MONTH[0];
}

/** @param {Date} [now] */
export function getActiveSpecialPrompts(now = new Date()) {
  const today = startOfDay(now).getTime();
  return SPECIAL_PROMPTS.filter((p) => {
    if (!p.activeFrom || !p.activeUntil) return false;
    const from = parseDay(p.activeFrom).getTime();
    const until = parseDay(p.activeUntil).getTime() + 86400000 - 1;
    return today >= from && today <= until;
  });
}

/** @param {Date} [now] */
export function getStandingPromptPeriod(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

/** @param {Date} [now] */
export function getDaysLeftInMonth(now = new Date()) {
  const { end } = getStandingPromptPeriod(now);
  const ms = end.getTime() - startOfDay(now).getTime();
  return Math.max(0, Math.ceil(ms / 86400000));
}

/**
 * @param {Array<{ promptId?: string|null }>} annotations
 * @param {string} promptId
 */
export function countPostsForPrompt(annotations = [], promptId) {
  if (!promptId) return 0;
  return annotations.filter((a) => a.promptId === promptId).length;
}

export function getPpsGroupLabel(ppsGroup) {
  const labels = {
    access: '行き来・移動',
    uses: '滞在・居場所',
    comfort: '環境・維持',
    sociability: '安心・社会',
  };
  return labels[ppsGroup] ?? ppsGroup;
}
