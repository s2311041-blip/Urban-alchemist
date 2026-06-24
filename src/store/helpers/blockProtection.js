export const isPresetLockedBlock = (block) => !!block?.presetLocked;

export const getDistance3 = (a = [], b = []) => Math.sqrt(
  ((a[0] ?? 0) - (b[0] ?? 0)) ** 2
  + ((a[1] ?? 0) - (b[1] ?? 0)) ** 2
  + ((a[2] ?? 0) - (b[2] ?? 0)) ** 2,
);

export const findClosestBlock = ({
  blocks = [],
  targetPos = [],
  maxDist = 1.0,
  allowLocked = true,
}) => {
  let closest = null;
  let minDist = maxDist;
  blocks.forEach((block) => {
    if (!allowLocked && isPresetLockedBlock(block)) return;
    const dist = getDistance3(block?.pos, targetPos);
    if (dist < minDist) {
      minDist = dist;
      closest = block;
    }
  });
  return closest;
};
