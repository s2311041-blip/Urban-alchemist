export const REAL_SECONDS_PER_GAME_DAY = 8 * 60;
export const DAYS_PER_SEASON = 4;

export const SEASON_ORDER = ['spring', 'summer', 'autumn', 'winter'];

export const SEASON_LABELS = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
};

export const TIME_PERIODS = [
  { id: 'night', label: '深夜', start: 0.0, end: 0.16 },
  { id: 'dawn', label: '朝', start: 0.16, end: 0.32 },
  { id: 'day', label: '昼', start: 0.32, end: 0.68 },
  { id: 'dusk', label: '夕', start: 0.68, end: 0.84 },
  { id: 'night', label: '夜', start: 0.84, end: 1.0 },
];

export const DEFAULT_WORLD_TIME = {
  dayIndex: 0,
  timeOfDay: 0.35,
  season: 'spring',
  paused: false,
  speed: 1,
};

export const WORLD_TIME_SPEED_OPTIONS = [1, 2, 4];

export const normalizeTimeOfDay = (time) => {
  if (!Number.isFinite(time)) return DEFAULT_WORLD_TIME.timeOfDay;
  const wrapped = time % 1;
  return wrapped < 0 ? wrapped + 1 : wrapped;
};

export const getSeasonFromDay = (dayIndex) => {
  const day = Number.isFinite(dayIndex) ? Math.max(0, Math.floor(dayIndex)) : 0;
  const idx = Math.floor(day / DAYS_PER_SEASON) % SEASON_ORDER.length;
  return SEASON_ORDER[idx];
};

export const getTimePeriodLabel = (timeOfDay) => {
  const t = normalizeTimeOfDay(timeOfDay);
  const hit = TIME_PERIODS.find((p) => t >= p.start && t < p.end);
  return hit?.label ?? '昼';
};
