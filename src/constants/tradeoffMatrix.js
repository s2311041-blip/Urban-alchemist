export const TRADEOFF_MATRIX = {
  P: {
    hard_fix:      { budget: -8,  general: +2,  wheelchair: +15, senior: +5,  childcare: +10 },
    detour_path:   { budget: -3,  general: +5,  wheelchair: -5,  senior: -2,  childcare: 0   },
    sign_info:     { budget: -1,  general: 0,   wheelchair: -15, senior: -5,  childcare: -5  },
    ignore:        { budget: 0,   general: -5,  wheelchair: -20, senior: -10, childcare: -10 },
  },
  L: {
    mobility_support: { budget: -10, general: +5,  wheelchair: +10, senior: +15, childcare: +5 },
    detour_path:      { budget: -4,  general: +5,  wheelchair: -5,  senior: 0,   childcare: +2 },
    sign_info:        { budget: -2,  general: +2,  wheelchair: -10, senior: -5,  childcare: -2 },
    ignore:           { budget: 0,   general: -5,  wheelchair: -15, senior: -15, childcare: -5 },
  },
  I: {
    sign_info:        { budget: -3,  general: +10, wheelchair: +5,  senior: +10, childcare: +5 },
    maintenance:      { budget: -2,  general: +2,  wheelchair: +2,  senior: +2,  childcare: +2 },
    ignore:           { budget: 0,   general: -10, wheelchair: -10, senior: -15, childcare: -5 },
  },
  R: {
    care_point:       { budget: -6,  general: 0,   wheelchair: +10, senior: +15, childcare: +10 },
    maintenance:      { budget: -3,  general: +5,  wheelchair: +5,  senior: +5,  childcare: +5 },
    sign_info:        { budget: -1,  general: 0,   wheelchair: -5,  senior: -5,  childcare: 0 },
    ignore:           { budget: 0,   general: -5,  wheelchair: -10, senior: -20, childcare: -10 },
  },
  M: {
    maintenance:      { budget: -4,  general: +10, wheelchair: +5,  senior: +5,  childcare: +10 },
    hard_fix:         { budget: -7,  general: +5,  wheelchair: +15, senior: +5,  childcare: +5 },
    sign_info:        { budget: -1,  general: +2,  wheelchair: -5,  senior: -5,  childcare: 0 },
    ignore:           { budget: 0,   general: -10, wheelchair: -15, senior: -10, childcare: -15 },
  },
  V: {
    care_point:       { budget: -7,  general: +5,  wheelchair: +5,  senior: +10, childcare: +15 },
    lighting:         { budget: -4,  general: +10, wheelchair: +5,  senior: +5,  childcare: +10 },
    sign_info:        { budget: -1,  general: +2,  wheelchair: -5,  senior: -5,  childcare: 0 },
    ignore:           { budget: 0,   general: -15, wheelchair: -10, senior: -10, childcare: -20 },
  },
  S: {
    care_point:       { budget: -6,  general: +5,  wheelchair: +10, senior: +15, childcare: +10 },
    lighting:         { budget: -3,  general: +10, wheelchair: +2,  senior: +5,  childcare: +5 },
    sign_info:        { budget: -1,  general: 0,   wheelchair: -5,  senior: -2,  childcare: 0 },
    ignore:           { budget: 0,   general: -10, wheelchair: -15, senior: -20, childcare: -10 },
  },
  C: {
    mobility_support: { budget: -9,  general: +5,  wheelchair: +10, senior: +15, childcare: +10 },
    care_point:       { budget: -6,  general: 0,   wheelchair: +15, senior: +10, childcare: +10 },
    sign_info:        { budget: -1,  general: 0,   wheelchair: -5,  senior: -5,  childcare: -5 },
    ignore:           { budget: 0,   general: -5,  wheelchair: -20, senior: -15, childcare: -15 },
  },
};

export function getAllowedPlansForQuest({ needType }) {
  const row = TRADEOFF_MATRIX[needType] ?? TRADEOFF_MATRIX.P;
  return Object.keys(row).filter((plan) => plan !== 'ignore');
}
