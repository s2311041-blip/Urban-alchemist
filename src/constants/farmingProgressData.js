export const DEFAULT_FARMING_PROGRESS = {
  level: 1,
  xp: 0,
  growthBonusDays: 0,
  totalHarvests: 0,
};

export const getFarmingNeedXp = (level = 1) => 6 + (Math.max(1, level) - 1) * 4;

export const normalizeFarmingProgress = (raw = {}) => {
  const level = Number.isFinite(raw?.level) ? Math.max(1, Math.floor(raw.level)) : DEFAULT_FARMING_PROGRESS.level;
  const xp = Number.isFinite(raw?.xp) ? Math.max(0, Math.floor(raw.xp)) : DEFAULT_FARMING_PROGRESS.xp;
  const totalHarvests = Number.isFinite(raw?.totalHarvests)
    ? Math.max(0, Math.floor(raw.totalHarvests))
    : DEFAULT_FARMING_PROGRESS.totalHarvests;
  return {
    level,
    xp,
    growthBonusDays: Math.floor((level - 1) / 3),
    totalHarvests,
  };
};
