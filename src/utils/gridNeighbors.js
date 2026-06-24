export const CARDINAL_DELTA = {
  plusX: [0.5, 0, 0],
  minusX: [-0.5, 0, 0],
  plusZ: [0, 0, 0.5],
  minusZ: [0, 0, -0.5],
};

const CARDINAL_KEYS = Object.keys(CARDINAL_DELTA);

const defaultOptions = {
  posEpsilon: 0.05,
  yTolerance: 0.1,
  matchShape: true,
  matchMaterial: false,
  shapeFilter: null,
};

const isNear = (a, b, eps) => Math.abs(a - b) < eps;

export const getCardinalNeighbors = (block, placedBlocks, options = {}) => {
  const opts = { ...defaultOptions, ...options };
  const base = block?.pos ?? [0, 0, 0];
  const neighbors = {
    plusX: false,
    minusX: false,
    plusZ: false,
    minusZ: false,
  };

  for (const key of CARDINAL_KEYS) {
    const delta = CARDINAL_DELTA[key];
    const target = [base[0] + delta[0], base[1] + delta[1], base[2] + delta[2]];

    neighbors[key] = placedBlocks.some((other) => {
      if (!other || other.id === block.id || !Array.isArray(other.pos)) return false;
      if (opts.shapeFilter && other.shape !== opts.shapeFilter) return false;
      if (opts.matchShape && other.shape !== block.shape) return false;
      if (opts.matchMaterial && other.material !== block.material) return false;
      if (!isNear(other.pos[1], base[1], opts.yTolerance)) return false;

      return (
        isNear(other.pos[0], target[0], opts.posEpsilon) &&
        isNear(other.pos[1], target[1], opts.posEpsilon) &&
        isNear(other.pos[2], target[2], opts.posEpsilon)
      );
    });
  }

  return neighbors;
};
