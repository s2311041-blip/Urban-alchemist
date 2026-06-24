import { CHUNK_SIZE } from '../constants/seaData';

const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** 1チャンクだけのとき地図全体を埋めないための最小ワールド幅（離島・拡張リングも収まる目安） */
const MAP_MIN_WORLD_SPAN = 72;

const chunkHalfSize = (chunk) => ({
  w: (chunk.size?.[0] ?? CHUNK_SIZE) / 2,
  d: (chunk.size?.[2] ?? CHUNK_SIZE) / 2,
});

const chunkCentroid = (chunks) => {
  if (!chunks.length) return [0, 0];
  const sum = chunks.reduce(
    (acc, c) => {
      acc[0] += c.pos?.[0] ?? 0;
      acc[1] += c.pos?.[2] ?? 0;
      return acc;
    },
    [0, 0],
  );
  return [sum[0] / chunks.length, sum[1] / chunks.length];
};

const chunkWorldBbox = (chunks) => {
  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;
  chunks.forEach((chunk) => {
    const { w, d } = chunkHalfSize(chunk);
    const x = chunk.pos?.[0] ?? 0;
    const z = chunk.pos?.[2] ?? 0;
    minX = Math.min(minX, x - w);
    maxX = Math.max(maxX, x + w);
    minZ = Math.min(minZ, z - d);
    maxZ = Math.max(maxZ, z + d);
  });
  return { minX, maxX, minZ, maxZ };
};

const bboxToPercentRect = (bbox, project) => {
  const tl = project(bbox.minX, bbox.minZ);
  const br = project(bbox.maxX, bbox.maxZ);
  const left = Math.min(tl.x, br.x);
  const top = Math.min(tl.y, br.y);
  const right = Math.max(tl.x, br.x);
  const bottom = Math.max(tl.y, br.y);
  return {
    left: left * 100,
    top: top * 100,
    width: Math.max(4, (right - left) * 100),
    height: Math.max(4, (bottom - top) * 100),
  };
};

/** 本島中心から見た離島のおおよその方角 */
export const directionLabelFromMain = (mainCenter, targetCenter) => {
  const dx = (targetCenter[0] ?? 0) - (mainCenter[0] ?? 0);
  const dz = (targetCenter[1] ?? 0) - (mainCenter[1] ?? 0);
  if (Math.hypot(dx, dz) < 8) return '近く';
  const deg = ((Math.atan2(dx, dz) * 180) / Math.PI + 360) % 360;
  if (deg >= 337.5 || deg < 22.5) return '北';
  if (deg < 67.5) return '北東';
  if (deg < 112.5) return '東';
  if (deg < 157.5) return '南東';
  if (deg < 202.5) return '南';
  if (deg < 247.5) return '南西';
  if (deg < 292.5) return '西';
  return '北西';
};

const buildIslandGroups = (chunks, project) => {
  const mainChunks = chunks.filter((c) => (c.kind ?? 'main') !== 'remote');
  const remoteChunks = chunks.filter((c) => c.kind === 'remote');
  const mainCenter = chunkCentroid(mainChunks.length ? mainChunks : chunks.slice(0, 1));

  const main = mainChunks.length
    ? {
      id: 'main',
      label: '本島',
      kind: 'main',
      chunkCount: mainChunks.length,
      rect: bboxToPercentRect(chunkWorldBbox(mainChunks), project),
    }
    : null;

  const hubIds = new Set(
    remoteChunks.filter((c) => c.remoteHub).map((c) => c.id),
  );
  if (hubIds.size === 0 && remoteChunks.length > 0) {
    remoteChunks.forEach((c) => hubIds.add(c.id));
  }

  const remotes = [...hubIds].map((hubId, index) => {
    const cluster = remoteChunks.filter(
      (c) => c.id === hubId || c.linkedTo === hubId,
    );
    const list = cluster.length ? cluster : remoteChunks.filter((c) => c.id === hubId);
    const center = chunkCentroid(list);
    return {
      id: hubId,
      label: hubIds.size > 1 ? `離島${index + 1}` : '離島',
      kind: 'remote',
      chunkCount: list.length,
      direction: directionLabelFromMain(mainCenter, center),
      rect: bboxToPercentRect(chunkWorldBbox(list), project),
    };
  });

  return { main, remotes };
};

/**
 * 島チャンク群をミニマップ座標（0–1）に投影する。
 * WorldMapPanel / MapPinPicker で共有。
 */
export const buildIslandMapProjection = (islandChunks = []) => {
  const chunks = Array.isArray(islandChunks)
    ? islandChunks.filter((chunk) => Array.isArray(chunk?.pos))
    : [];
  if (chunks.length === 0) return null;

  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;
  chunks.forEach((chunk) => {
    const { w, d } = chunkHalfSize(chunk);
    const cx = chunk.pos[0] ?? 0;
    const cz = chunk.pos[2] ?? 0;
    minX = Math.min(minX, cx - w - 4);
    minZ = Math.min(minZ, cz - d - 4);
    maxX = Math.max(maxX, cx + w + 4);
    maxZ = Math.max(maxZ, cz + d + 4);
  });

  const contentCx = (minX + maxX) / 2;
  const contentCz = (minZ + maxZ) / 2;
  const spanX = Math.max(maxX - minX, MAP_MIN_WORLD_SPAN);
  const spanZ = Math.max(maxZ - minZ, MAP_MIN_WORLD_SPAN);
  minX = contentCx - spanX / 2;
  maxX = contentCx + spanX / 2;
  minZ = contentCz - spanZ / 2;
  maxZ = contentCz + spanZ / 2;

  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxZ - minZ);

  const project = (x, z) => ({
    x: clamp01((x - minX) / width),
    y: clamp01((z - minZ) / height),
  });

  const unproject = (nx, ny) => ({
    x: minX + clamp01(nx) * width,
    z: minZ + clamp01(ny) * height,
  });

  const groups = buildIslandGroups(chunks, project);

  return {
    project,
    unproject,
    groups,
    bounds: { minX, minZ, maxX, maxZ },
  };
};
