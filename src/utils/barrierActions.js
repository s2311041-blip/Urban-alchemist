import {
  BUG_RESOLVE_RADIUS,
  getPlanFailMessage,
} from '../constants/barrierData';
import {
  countShapesNearByScale,
  hasDetourPathByScale,
  hasFerryRoute,
  hasShapeNearByScale,
} from './barrierValidation';
import { findBugById } from './bugIds';

export const evaluateBugResolution = (bug, placedBlocks = [], context = {}) => {
  if (!bug) {
    return { ok: false, message: '不満データが見つかりません。' };
  }
  if (!Array.isArray(bug.pos) || bug.pos.length < 3) {
    return { ok: false, message: '不満の位置データが壊れています。別の不満を選んでください。' };
  }
  if (!bug.chosenPlan) {
    return { ok: false, message: '解決プランを選択してからDIYを開始してください。' };
  }

  const plan = bug.chosenPlan;
  const scale = bug.scale ?? 'point';
  let ok = false;

  const requirementByScale = {
    point: { hardFixCount: 1, maintenancePathCount: 2, signPathCount: 1, careBenchCount: 1, careLightCount: 1 },
    line: { hardFixCount: 2, maintenancePathCount: 4, signPathCount: 2, careBenchCount: 1, careLightCount: 2 },
    area: { hardFixCount: 3, maintenancePathCount: 5, signPathCount: 3, careBenchCount: 2, careLightCount: 2 },
  };
  const req = requirementByScale[scale] ?? requirementByScale.point;

  if (plan === 'lighting') {
    ok = hasShapeNearByScale(bug.pos, placedBlocks, ['light_pole'], scale, BUG_RESOLVE_RADIUS, req.careLightCount);
  } else if (plan === 'hard_fix') {
    ok = hasShapeNearByScale(bug.pos, placedBlocks, ['slope', 'half'], scale, BUG_RESOLVE_RADIUS, req.hardFixCount);
  } else if (plan === 'detour_path') {
    ok = hasDetourPathByScale(bug.pos, placedBlocks, scale, BUG_RESOLVE_RADIUS);
  } else if (plan === 'transit_link') {
    ok = hasFerryRoute(
      bug,
      placedBlocks,
      context.ferryRoutes ?? [],
      context.islandChunks ?? [],
      BUG_RESOLVE_RADIUS,
    );
  } else if (plan === 'maintenance') {
    const hasBench = hasShapeNearByScale(bug.pos, placedBlocks, ['bench'], scale, BUG_RESOLVE_RADIUS, req.careBenchCount);
    const pathCount = countShapesNearByScale(bug.pos, placedBlocks, ['path'], scale, BUG_RESOLVE_RADIUS);
    ok = hasBench && pathCount >= req.maintenancePathCount;
  } else if (plan === 'sign_info') {
    const hasSign = hasShapeNearByScale(bug.pos, placedBlocks, ['sign_post'], scale, BUG_RESOLVE_RADIUS, 1);
    const hasBench = hasShapeNearByScale(bug.pos, placedBlocks, ['bench'], scale, BUG_RESOLVE_RADIUS, req.careBenchCount);
    const pathCount = countShapesNearByScale(bug.pos, placedBlocks, ['path'], scale, BUG_RESOLVE_RADIUS);
    ok = hasSign || (hasBench && pathCount >= req.signPathCount);
  } else if (plan === 'care_point') {
    const hasBench = hasShapeNearByScale(bug.pos, placedBlocks, ['bench'], scale, BUG_RESOLVE_RADIUS, req.careBenchCount);
    const hasLight = hasShapeNearByScale(bug.pos, placedBlocks, ['light_pole'], scale, BUG_RESOLVE_RADIUS, req.careLightCount);
    ok = hasBench && hasLight;
  }

  if (ok) {
    return { ok: true, message: 'この不満は解決しました。' };
  }
  return { ok: false, message: getPlanFailMessage(plan, scale) };
};

export const evaluateActiveBuildResolution = (
  buildMode,
  bugs = [],
  placedBlocks = [],
  context = {},
) => {
  if (!buildMode || buildMode === 'free') return null;
  const bug = findBugById(bugs, buildMode);
  if (!bug) {
    return { ok: false, message: '不満データが見つかりません。建築対象が消えています。' };
  }
  return evaluateBugResolution(bug, placedBlocks, context);
};
