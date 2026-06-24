import { AGRI_GROWTH_RULES, DEFAULT_AGRI_GROWTH_RULE } from '../constants/agriGrowthData';

const getRule = (shape) => AGRI_GROWTH_RULES[shape] ?? DEFAULT_AGRI_GROWTH_RULE;
const PHASE = {
  FALLOW: 'fallow',
  PLANTED: 'planted',
  GROWING: 'growing',
  RIPE: 'ripe',
  WITHERED: 'withered',
  VANISHED: 'vanished',
};

export const getAgriMaxStage = (shape) => {
  const max = getRule(shape).maxStage;
  return Number.isFinite(max) ? Math.max(0, Math.floor(max)) : 3;
};

export const clampAgriStage = (shape, stage) => {
  const s = Number.isFinite(stage) ? Math.floor(stage) : 0;
  return Math.max(0, Math.min(getAgriMaxStage(shape), s));
};

export const advanceAgriStage = (shape, currentStage, passedDays = 1) => {
  const days = Number.isFinite(passedDays) ? Math.max(0, Math.floor(passedDays)) : 0;
  if (days <= 0) return clampAgriStage(shape, currentStage);

  const rule = getRule(shape);
  const durations = Array.isArray(rule.daysPerStage) && rule.daysPerStage.length > 0
    ? rule.daysPerStage
    : DEFAULT_AGRI_GROWTH_RULE.daysPerStage;

  let stage = clampAgriStage(shape, currentStage);
  let remaining = days;
  while (remaining > 0 && stage < getAgriMaxStage(shape)) {
    const need = Number.isFinite(durations[stage]) ? Math.max(1, Math.floor(durations[stage])) : 1;
    if (remaining < need) break;
    remaining -= need;
    stage += 1;
  }
  return clampAgriStage(shape, stage);
};

const getThresholdDaysForMaxStage = (shape) => {
  const rule = getRule(shape);
  const maxStage = getAgriMaxStage(shape);
  const durations = Array.isArray(rule.daysPerStage) ? rule.daysPerStage : [];
  let total = 0;
  for (let i = 0; i < maxStage; i += 1) {
    const d = Number.isFinite(durations[i]) ? Math.max(1, Math.floor(durations[i])) : 1;
    total += d;
  }
  return total;
};

export const getAgriPhaseFromAge = (shape, ageDays = 0) => {
  const age = Number.isFinite(ageDays) ? Math.max(0, Math.floor(ageDays)) : 0;
  const ripeAt = getThresholdDaysForMaxStage(shape);
  const rule = getRule(shape);
  const ripeWindow = Number.isFinite(rule.ripeWindowDays) ? Math.max(1, Math.floor(rule.ripeWindowDays)) : 1;
  const witherAt = ripeAt + ripeWindow;
  const witherDuration = Number.isFinite(rule.witherDays) ? Math.max(1, Math.floor(rule.witherDays)) : 1;
  const vanishAt = witherAt + witherDuration;

  if (age === 0) return PHASE.PLANTED;
  if (age < ripeAt) return PHASE.GROWING;
  if (age < witherAt) return PHASE.RIPE;
  if (age < vanishAt) return PHASE.WITHERED;
  return PHASE.VANISHED;
};

/** 新規に畑ブロックを置いた直後（種はまだ入っていない・播種操作が必要） */
export const createNewPlotAgriState = (shape, dayIndex = 0, base = {}) => ({
  ...base,
  stage: 0,
  ageDays: 0,
  phase: PHASE.FALLOW,
  harvestable: false,
  vanished: false,
  plantedDay: Number.isFinite(dayIndex) ? Math.max(0, Math.floor(dayIndex)) : 0,
  harvestedCount: 0,
});

/** 播種（再植え）後の初期状態 */
export const createInitialAgriState = (shape, dayIndex = 0, base = {}) => ({
  ...base,
  stage: 0,
  ageDays: 0,
  phase: PHASE.PLANTED,
  harvestable: false,
  plantedDay: Number.isFinite(dayIndex) ? Math.max(0, Math.floor(dayIndex)) : 0,
  harvestedCount: Number.isFinite(base?.harvestedCount) ? Math.max(0, Math.floor(base.harvestedCount)) : 0,
});

export const normalizeAgriState = (shape, agri = {}, dayIndex = 0) => {
  if (agri?.phase === PHASE.FALLOW) {
    return {
      ...agri,
      stage: 0,
      ageDays: 0,
      phase: PHASE.FALLOW,
      harvestable: false,
      vanished: false,
      plantedDay: Number.isFinite(agri?.plantedDay) ? Math.max(0, Math.floor(agri.plantedDay)) : (Number.isFinite(dayIndex) ? Math.max(0, Math.floor(dayIndex)) : 0),
      harvestedCount: Number.isFinite(agri?.harvestedCount) ? Math.max(0, Math.floor(agri.harvestedCount)) : 0,
    };
  }

  const stage = clampAgriStage(shape, agri?.stage);
  const ageDays = Number.isFinite(agri?.ageDays) ? Math.max(0, Math.floor(agri.ageDays)) : stage;
  const phase = getAgriPhaseFromAge(shape, ageDays);
  const harvestable = phase === PHASE.RIPE;
  const vanished = phase === PHASE.VANISHED;
  return {
    ...agri,
    stage,
    ageDays,
    phase,
    harvestable,
    vanished,
    plantedDay: Number.isFinite(agri?.plantedDay) ? Math.max(0, Math.floor(agri.plantedDay)) : (Number.isFinite(dayIndex) ? Math.max(0, Math.floor(dayIndex)) : 0),
    harvestedCount: Number.isFinite(agri?.harvestedCount) ? Math.max(0, Math.floor(agri.harvestedCount)) : 0,
  };
};

export const advanceAgriLifecycle = (shape, agri = {}, passedDays = 1, currentDayIndex = 0) => {
  const days = Number.isFinite(passedDays) ? Math.max(0, Math.floor(passedDays)) : 0;
  const prev = normalizeAgriState(shape, agri, currentDayIndex);
  if (days <= 0 || prev.phase === PHASE.FALLOW) return prev;

  const ageDays = prev.ageDays + days;
  const phase = getAgriPhaseFromAge(shape, ageDays);
  const stage = advanceAgriStage(shape, prev.stage, days);

  return {
    ...prev,
    ageDays,
    stage,
    phase,
    harvestable: phase === PHASE.RIPE,
    vanished: phase === PHASE.VANISHED,
  };
};

export const createFallowAgriState = (shape, prevAgri = {}, dayIndex = 0) => {
  const normalized = normalizeAgriState(shape, prevAgri, dayIndex);
  return {
    ...normalized,
    stage: 0,
    ageDays: 0,
    phase: PHASE.FALLOW,
    harvestable: false,
    vanished: false,
    plantedDay: Number.isFinite(dayIndex) ? Math.max(0, Math.floor(dayIndex)) : normalized.plantedDay,
    harvestedCount: (normalized.harvestedCount ?? 0) + 1,
  };
};

export const AGRI_PHASE = PHASE;
