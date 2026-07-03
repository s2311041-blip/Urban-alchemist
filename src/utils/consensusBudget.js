import { TYPE_TO_BARRIER_META, DEFAULT_BARRIER_META } from '../constants/barrierData';
import { TRADEOFF_MATRIX } from '../constants/tradeoffMatrix';

export function getScaleMultiplier(scale) {
  if (scale === 'line') return 2;
  if (scale === 'area') return 3;
  return 1; // point
}

export function computeSessionBudget(activeBugs) {
  let sumMaxCost = 0;
  for (const bug of activeBugs) {
    if (bug.solved) continue;
    const meta = TYPE_TO_BARRIER_META[bug.type] ?? DEFAULT_BARRIER_META;
    const needType = meta.needType || 'P';
    const scaleMultiplier = getScaleMultiplier(meta.scale);
    
    const row = TRADEOFF_MATRIX[needType] ?? TRADEOFF_MATRIX.P;
    
    let maxCost = 0;
    for (const [plan, data] of Object.entries(row)) {
      if (plan === 'ignore') continue;
      const absCost = Math.abs(data.budget);
      if (absCost > maxCost) {
        maxCost = absCost;
      }
    }
    
    sumMaxCost += maxCost * scaleMultiplier;
  }
  
  const total = Math.floor(sumMaxCost * 0.75);
  return {
    totalSessionBudget: total,
    budgetInitialFormula: `sumMaxPlanCost(${sumMaxCost}) * 0.75`,
  };
}
