export const getBarrierSideEffectToast = (bug, resolution) => {
  if (!bug || !resolution?.ok) return null;

  // Phase 8-D MVP:
  // hard_fix で通行不満を解消したときの軽いトレードオフ通知
  if (bug.needType === 'P' && bug.chosenPlan === 'hard_fix') {
    return '通行は改善しましたが、勾配が急だと一部の人にはまだ負担が残るかもしれません。';
  }

  return null;
};
