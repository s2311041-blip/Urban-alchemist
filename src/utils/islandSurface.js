import { DEFAULT_CENTER_ISLAND_SIZE } from '../constants/islandConfig';

const allFinite = (arr) => arr.every((v) => Number.isFinite(v));

const getChunkSize = (chunk) => ({
  w: chunk?.size?.[0] ?? 14,
  h: chunk?.size?.[1] ?? 0.6,
  d: chunk?.size?.[2] ?? 14,
});

export const getClusterBounds = (clusterChunks = [], centerX = 0, centerZ = 0) => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  clusterChunks.forEach((chunk) => {
    const { w, d } = getChunkSize(chunk);
    const cx = chunk.pos?.[0] ?? centerX;
    const cz = chunk.pos?.[2] ?? centerZ;
    const hx = w / 2;
    const hz = d / 2;
    minX = Math.min(minX, cx - hx);
    maxX = Math.max(maxX, cx + hx);
    minZ = Math.min(minZ, cz - hz);
    maxZ = Math.max(maxZ, cz + hz);
  });

  if (!Number.isFinite(minX)) {
    const half = DEFAULT_CENTER_ISLAND_SIZE[0] / 2;
    return { minX: centerX - half, maxX: centerX + half, minZ: centerZ - half, maxZ: centerZ + half };
  }

  return { minX, maxX, minZ, maxZ };
};

/** メイン島クラスターとリモート島クラスターに分割 */
export const getIslandClusters = (islandChunks = []) => {
  const valid = (Array.isArray(islandChunks) ? islandChunks : []).filter(
    (c) => Array.isArray(c?.pos) && c.pos.length >= 3,
  );
  const main = valid.filter((c) => c.kind !== 'remote');
  const remoteRoots = valid.filter((c) => c.kind === 'remote' && c.remoteHub);
  const remoteSatellites = valid.filter((c) => c.kind === 'remote' && !c.remoteHub);

  const remoteClusters = remoteRoots.map((hub) => {
    const linked = remoteSatellites.filter((c) => c.linkedTo === hub.id);
    return [hub, ...linked];
  });

  remoteSatellites
    .filter((c) => !remoteRoots.some((h) => h.id === c.linkedTo))
    .forEach((orphan) => remoteClusters.push([orphan]));

  return {
    main: main.length > 0 ? main : valid,
    remoteClusters,
  };
};

export const clusterToSurface = (cluster, { pad = 0.08 } = {}) => {
  const bounds = getClusterBounds(cluster);
  const width = Math.max(bounds.maxX - bounds.minX + pad * 2, 4);
  const depth = Math.max(bounds.maxZ - bounds.minZ + pad * 2, 4);
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerZ = (bounds.minZ + bounds.maxZ) / 2;

  let topY = -0.3;
  let thickness = 0.6;
  cluster.forEach((chunk) => {
    const { h } = getChunkSize(chunk);
    const cy = chunk.pos?.[1] ?? -0.3;
    topY = Math.max(topY, cy + h / 2);
    thickness = Math.max(thickness, h);
  });

  const size = [width, Math.max(thickness, 0.4), depth];
  const position = [centerX, topY - size[1] / 2, centerZ];
  if (!allFinite(size) || size.some((v) => v <= 0) || !allFinite(position)) {
    return {
      position: [0, -0.3, 0],
      size: [...DEFAULT_CENTER_ISLAND_SIZE],
      topY: 0,
      bounds,
      isRemote: false,
    };
  }

  return {
    position,
    size,
    topY,
    bounds,
    isRemote: cluster.some((c) => c.kind === 'remote'),
  };
};

export const clusterRimFoamPositions = (cluster, foamY, blockSize) => {
  const { bounds } = clusterToSurface(cluster, { pad: 0 });
  const { minX, maxX, minZ, maxZ } = bounds;
  const y = (cluster[0]?.pos?.[1] ?? -0.3) + foamY;
  const b = blockSize;

  const lenX = Math.max(2, Math.ceil((maxX - minX) / (b * 1.8)));
  const edgeX = Array.from({ length: lenX }, (_, i) => {
    const t = lenX === 1 ? 0.5 : i / (lenX - 1);
    const x = minX + (maxX - minX) * t;
    return [
      [x, y, minZ - b * 0.5],
      [x, y, maxZ + b * 0.5],
    ];
  }).flat();

  const lenZ = Math.max(2, Math.ceil((maxZ - minZ) / (b * 1.8)));
  const edgeZ = Array.from({ length: lenZ }, (_, i) => {
    const t = lenZ === 1 ? 0.5 : i / (lenZ - 1);
    const z = minZ + (maxZ - minZ) * t;
    return [
      [minX - b * 0.5, y, z],
      [maxX + b * 0.5, y, z],
    ];
  }).flat();

  const edge = [
    ...edgeX,
    ...edgeZ,
    [minX, y, minZ],
    [maxX, y, minZ],
    [minX, y, maxZ],
    [maxX, y, maxZ],
  ];
  return edge;
};
