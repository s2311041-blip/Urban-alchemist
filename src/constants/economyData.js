export const DEFAULT_ECONOMY = {
  coin: 0,
  lifetimeEarned: 0,
};

export const DEFAULT_POST_STATS = {
  totalPosts: 0,
  totalResolved: 0,
  firstPostBonusClaimed: false,
  events: [],
};

export const POST_REWARD = {
  onsite: { bad: 8, good: 5 },
  map: { bad: 4, good: 3 },
};

export const POST_REWARD_FIRST_BONUS = 5;

/** 更地への種まき（coin sink・農業と共通ウォレット） */
export const SEED_COST = 4;

export const HARVEST_REWARD = {
  farm_plot: { base: 3, ripeBonus: 2 },
  rice_paddy: { base: 4, ripeBonus: 2 },
  garden_bed: { base: 2, ripeBonus: 1 },
};

export const FARMING_LEVEL_COIN_BONUS = 0.1;

export const normalizeEconomy = (raw = {}) => ({
  coin: Number.isFinite(raw?.coin) ? Math.max(0, Math.floor(raw.coin)) : DEFAULT_ECONOMY.coin,
  lifetimeEarned: Number.isFinite(raw?.lifetimeEarned)
    ? Math.max(0, Math.floor(raw.lifetimeEarned))
    : DEFAULT_ECONOMY.lifetimeEarned,
});

export const normalizePostStats = (raw = {}) => ({
  totalPosts: Number.isFinite(raw?.totalPosts) ? Math.max(0, Math.floor(raw.totalPosts)) : 0,
  totalResolved: Number.isFinite(raw?.totalResolved) ? Math.max(0, Math.floor(raw.totalResolved)) : 0,
  firstPostBonusClaimed: !!raw?.firstPostBonusClaimed,
  events: Array.isArray(raw?.events)
    ? raw.events
      .filter((event) => event && typeof event === 'object' && typeof event.kind === 'string')
      .map((event) => ({
        ...event,
        t: Number.isFinite(event.t) ? event.t : Date.now(),
      }))
      .slice(-200)
    : [],
});
