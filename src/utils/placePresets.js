import { TYPE_TO_BARRIER_META } from '../constants/barrierData';
import { PLACE_PRESET_TEMPLATES } from '../constants/placePresetTemplates';
import { getIslandTopYAt, isOnIsland } from './terrainPlacement';
import {
  EXPRESSION_NEED_TYPES,
  isPlaceLayoutShape,
  STRUCTURAL_NEED_TYPES,
} from './placeNeedTypeStyle';

const GRID_STEP = 0.5;
const PRESET_SPAWN_MIN_DISTANCE = 8;

export const PLACE_ARCHETYPE_ALIASES = {
  transit: 'station',
};

export const PLACE_ARCHETYPE_LABELS = {
  station: '駅',
  bus_stop: 'バス停',
  plaza: '広場・駅前',
  road: '道路',
  lane: '街区・路地',
  campus: '学校・キャンパス',
  park: '公園・緑',
  waterfront: '水辺',
  commerce: '商業施設',
};
export const PLACE_ARCHETYPE_OPTIONS = Object.entries(PLACE_ARCHETYPE_LABELS).map(([id, label]) => ({ id, label }));

export const normalizePlaceArchetypeId = (archetype) => (
  typeof archetype === 'string' ? (PLACE_ARCHETYPE_ALIASES[archetype] ?? archetype) : archetype
);

const normalizeArchetypeId = normalizePlaceArchetypeId;

const NEED_TYPE_TO_ARCHETYPE_PRIORITY = {
  P: ['station', 'bus_stop', 'plaza', 'road', 'lane'],
  V: ['lane', 'park', 'waterfront'],
  I: ['station', 'plaza', 'road', 'commerce'],
  M: ['park', 'plaza', 'waterfront', 'commerce'],
  R: ['plaza', 'park', 'waterfront', 'commerce'],
  S: ['lane', 'park', 'road', 'waterfront'],
  L: ['station', 'waterfront', 'road'],
  C: ['lane', 'park', 'plaza', 'campus'],
};

const PRESET_TEMPLATES = PLACE_PRESET_TEMPLATES;

const snapToBuildGrid = (value) => Math.floor(value / GRID_STEP) * GRID_STEP + GRID_STEP / 2;

const computeYForShape = (shape, topY) => {
  if (shape === 'path' || shape === 'rail') return Number((topY + 0.01).toFixed(3));
  if (shape === 'half' || shape === 'slope') return Number((topY + 0.25).toFixed(3));
  if (shape === 'ferry_dock') return Number((topY + 0.25).toFixed(3));
  if (shape?.startsWith?.('station_')) return Number((topY + 0.25).toFixed(3));
  if (shape === 'station_layout') return Number((topY + 0.25).toFixed(3));
  if (shape === 'bus_stop_layout') return Number((topY + 0.25).toFixed(3));
  if (shape === 'plaza_layout') return Number((topY + 0.25).toFixed(3));
  if (shape === 'road_layout') return Number((topY + 0.25).toFixed(3));
  if (shape === 'lane_layout') return Number((topY + 0.25).toFixed(3));
  if (shape === 'park_layout') return Number((topY + 0.25).toFixed(3));
  if (shape === 'waterfront_layout') return Number((topY + 0.25).toFixed(3));
  if (shape === 'campus_layout') return Number((topY + 0.25).toFixed(3));
  if (shape === 'commerce_layout') return Number((topY + 0.25).toFixed(3));
  return Number((topY + 0.5).toFixed(3));
};

const resolveNeedTypeFromQuest = (quest) => {
  if (quest?.needType && typeof quest.needType === 'string') return quest.needType;
  const inferred = TYPE_TO_BARRIER_META[quest?.type]?.needType;
  return typeof inferred === 'string' ? inferred : 'P';
};

const resolvePlaceArchetype = (quest) => {
  if (quest?.placeArchetype === 'none') return null;
  const normalizedArchetype = normalizeArchetypeId(quest?.placeArchetype);
  if (typeof normalizedArchetype === 'string' && PRESET_TEMPLATES[normalizedArchetype]) {
    return normalizedArchetype;
  }
  const needType = resolveNeedTypeFromQuest(quest);
  const priorities = NEED_TYPE_TO_ARCHETYPE_PRIORITY[needType] ?? NEED_TYPE_TO_ARCHETYPE_PRIORITY.P;
  return priorities[0] ?? 'road';
};

const toBlock = (basePos, islandChunks, def) => {
  const x = snapToBuildGrid(basePos[0] + (def.offset?.[0] ?? 0));
  const z = snapToBuildGrid(basePos[2] + (def.offset?.[1] ?? 0));
  const topY = getIslandTopYAt(x, z, islandChunks);
  return {
    id: `preset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    pos: [x, computeYForShape(def.shape, topY), z],
    shape: def.shape,
    material: def.material ?? 'stone',
    rotation: 0,
    scale: Array.isArray(def.scale) ? [...def.scale] : [1, 1, 1],
    presetLocked: true,
    presetArchetype: def.presetArchetype ?? null,
    ...(def.presetNeedType ? { presetNeedType: def.presetNeedType } : {}),
    ...(def.presetSourceQuestId ? { presetSourceQuestId: def.presetSourceQuestId } : {}),
    ...(def.presetExpressionAccent ? { presetExpressionAccent: true } : {}),
  };
};

const KEEP_EXPRESSION_ACCENT_SHAPES = new Set(['light_pole', 'bench', 'sign_post']);

const tagExpressionAccent = (def, needType, questId) => {
  if (STRUCTURAL_NEED_TYPES.has(needType) || KEEP_EXPRESSION_ACCENT_SHAPES.has(def.shape)) {
    return def;
  }
  if (!EXPRESSION_NEED_TYPES.has(needType)) {
    return def;
  }
  return {
    ...def,
    presetNeedType: needType,
    ...(questId ? { presetSourceQuestId: questId } : {}),
    presetExpressionAccent: true,
  };
};

const isOverlapping = (block, existingBlocks = []) => existingBlocks.some((b) => (
  Math.abs((b.pos?.[0] ?? 0) - block.pos[0]) < 0.05
  && Math.abs((b.pos?.[1] ?? 0) - block.pos[1]) < 0.05
  && Math.abs((b.pos?.[2] ?? 0) - block.pos[2]) < 0.05
));

export const hasExistingPlaceSite = (archetype, existingBlocks = []) => {
  const normalized = normalizeArchetypeId(archetype);
  return typeof normalized === 'string'
    && normalized !== 'none'
    && existingBlocks.some((block) => (
      block?.presetLocked
      && normalizeArchetypeId(block?.presetArchetype) === normalized
    ));
};

export const buildQuestPlacementPreview = ({
  quest,
  basePos,
  islandChunks = [],
  existingBlocks = [],
}) => {
  if (!Array.isArray(basePos) || basePos.length < 3) {
    return { blocks: [], orbPos: null, label: null, reusesSite: false };
  }

  if (quest?.placeArchetype === 'none') {
    return { blocks: [], orbPos: basePos, label: 'オーブのみ', reusesSite: false };
  }

  const archetypeId = normalizeArchetypeId(quest?.placeArchetype);
  const reusesSite = hasExistingPlaceSite(archetypeId, existingBlocks);
  if (reusesSite) {
    return {
      blocks: [],
      orbPos: basePos,
      label: PLACE_ARCHETYPE_LABELS[archetypeId] ?? null,
      reusesSite: true,
    };
  }

  const preset = createPresetForQuestPlacement({
    quest,
    basePos,
    islandChunks,
    existingBlocks: [],
  });

  return {
    blocks: preset.blocks,
    orbPos: basePos,
    label: preset.label,
    reusesSite: false,
  };
};

/** L2: needType に合わせた不満 accent ブロックのみ（reuse 時・場所型 none 時） */
export const createDissatisfactionAccentOnly = ({
  quest,
  basePos,
  islandChunks = [],
  existingBlocks = [],
}) => {
  const archetype = resolvePlaceArchetype(quest);
  const needType = resolveNeedTypeFromQuest(quest);
  const normalizedArchetype = archetype ? normalizeArchetypeId(archetype) : null;
  const template = normalizedArchetype ? PRESET_TEMPLATES[normalizedArchetype] : null;
  const accentDefs = template?.accents?.[needType] ?? [];

  if (accentDefs.length === 0) {
    return { blocks: [], needType, archetype: normalizedArchetype };
  }

  const questId = typeof quest?.id === 'string' ? quest.id : null;
  const blocks = accentDefs
    .map((def) => tagExpressionAccent(def, needType, questId))
    .map((def) => toBlock(basePos, islandChunks, {
      ...def,
      presetArchetype: normalizedArchetype,
    }))
    .filter((block) => !isOverlapping(block, existingBlocks));

  return { blocks, needType, archetype: normalizedArchetype };
};

export const buildQuestSpawnBlocks = ({
  quest,
  spawnPos,
  islandChunks = [],
  placedBlocks = [],
}) => {
  const archetype = quest?.placeArchetype;
  const reuseSite = hasExistingPlaceSite(archetype, placedBlocks);

  if (!reuseSite && archetype !== 'none') {
    const preset = createPresetForQuestPlacement({
      quest,
      basePos: spawnPos,
      islandChunks,
      existingBlocks: placedBlocks,
    });
    return {
      blocks: preset.blocks,
      archetype: preset.archetype,
      label: preset.label,
      reuseSite: false,
    };
  }

  const accent = createDissatisfactionAccentOnly({
    quest,
    basePos: spawnPos,
    islandChunks,
    existingBlocks: placedBlocks,
  });

  return {
    blocks: accent.blocks,
    archetype: accent.archetype,
    label: accent.archetype ? PLACE_ARCHETYPE_LABELS[accent.archetype] ?? null : null,
    reuseSite: !!reuseSite,
  };
};

export const createPresetForQuestPlacement = ({ quest, basePos, islandChunks = [], existingBlocks = [] }) => {
  const archetype = resolvePlaceArchetype(quest);
  const needType = resolveNeedTypeFromQuest(quest);
  const template = PRESET_TEMPLATES[archetype];
  if (!template) {
    return { archetype: null, needType, blocks: [] };
  }

  const questId = typeof quest?.id === 'string' ? quest.id : null;
  const defs = [
    ...template.base.map((def) => (
      isPlaceLayoutShape(def.shape)
        ? {
          ...def,
          presetNeedType: needType,
          ...(questId ? { presetSourceQuestId: questId } : {}),
        }
        : def
    )),
    ...(template.accents?.[needType] ?? []).map((def) => tagExpressionAccent(def, needType, questId)),
  ];
  const blocks = defs
    .map((def) => toBlock(basePos, islandChunks, { ...def, presetArchetype: archetype }))
    .filter((block) => !isOverlapping(block, existingBlocks));

  return {
    archetype,
    needType,
    label: PLACE_ARCHETYPE_LABELS[archetype] ?? archetype,
    blocks,
  };
};

const getCenterPos = (islandChunks = []) => {
  const center = islandChunks.find((chunk) => chunk.id === 'center') ?? islandChunks[0];
  if (!center?.pos) return [0, 0.5, 0];
  return [center.pos[0], Number((center.pos[1] + 0.8).toFixed(3)), center.pos[2]];
};

const hasNearbyPreset = (candidate, existingBlocks = []) => existingBlocks.some((block) => {
  if (!block?.presetLocked || !Array.isArray(block?.pos)) return false;
  const dx = (block.pos[0] ?? 0) - candidate[0];
  const dz = (block.pos[2] ?? 0) - candidate[2];
  return Math.hypot(dx, dz) < PRESET_SPAWN_MIN_DISTANCE;
});

const getSpawnCandidates = (origin) => {
  const [ox, , oz] = origin;
  const ring = [
    [0, 0],
    [8, 0], [-8, 0], [0, 8], [0, -8],
    [8, 8], [-8, 8], [8, -8], [-8, -8],
    [12, 0], [0, 12], [-12, 0], [0, -12],
    [-12, 8], [12, -8], [-8, -12], [8, 12],
    [16, 0], [0, 16], [-16, 0], [0, -16],
  ];
  return ring.map(([dx, dz]) => [snapToBuildGrid(ox + dx), origin[1], snapToBuildGrid(oz + dz)]);
};

export const createDefaultPlacedBlocks = (islandChunks = []) => {
  const center = islandChunks.find((chunk) => chunk.id === 'center') ?? islandChunks[0];
  const cx = snapToBuildGrid(center?.pos?.[0] ?? 0);
  const cz = snapToBuildGrid(center?.pos?.[2] ?? 0);

  const layouts = [
    // --- 一時的に場所プリセットの初期配置を無効化（いつでも戻せるようにコメントアウト） ---
    // { archetype: 'station', offset: [0, 0] },
    // { archetype: 'plaza', offset: [0, 6] },
    // { archetype: 'bus_stop', offset: [-10, 4] },
    // { archetype: 'road', offset: [14, 0] },
    // { archetype: 'commerce', offset: [-15, 12] },
    // { archetype: 'lane', offset: [-14, -12] },
    // { archetype: 'park', offset: [12, -14] },
    // { archetype: 'campus', offset: [-4, -16] },
    // { archetype: 'waterfront', offset: [16, 14] },
  ];

  let allBlocks = [];
  
  layouts.forEach(({ archetype, offset }) => {
    const x = snapToBuildGrid(cx + offset[0]);
    const z = snapToBuildGrid(cz + offset[1]);
    const y = Number((getIslandTopYAt(x, z, islandChunks) + 0.5).toFixed(3));
    
    const preset = createPresetForQuestPlacement({
      quest: { needType: 'P', placeArchetype: archetype },
      basePos: [x, y, z],
      islandChunks,
      existingBlocks: allBlocks,
    });
    
    allBlocks = [...allBlocks, ...preset.blocks];
  });

  return allBlocks;
};

export const createPresetForFreeBuild = ({ archetype, islandChunks = [], existingBlocks = [] }) => {
  const normalizedArchetype = normalizeArchetypeId(archetype);
  if (!PRESET_TEMPLATES[normalizedArchetype]) {
    return { archetype: null, label: null, blocks: [] };
  }
  const origin = getCenterPos(islandChunks);
  const candidates = getSpawnCandidates(origin);
  const spawnBasePos = candidates.find((candidate) => !hasNearbyPreset(candidate, existingBlocks)) ?? candidates[0];
  const pseudoQuest = { needType: 'P', placeArchetype: normalizedArchetype };
  const result = createPresetForQuestPlacement({
    quest: pseudoQuest,
    basePos: spawnBasePos,
    islandChunks,
    existingBlocks,
  });
  return result;
};

export const snapQuestPosition = (point, islandChunks = []) => {
  const x = snapToBuildGrid(point.x);
  const z = snapToBuildGrid(point.z);
  const y = Number((getIslandTopYAt(x, z, islandChunks) + 0.5).toFixed(3));
  return [x, y, z];
};

export const snapQuestPositionIfOnIsland = (point, islandChunks = []) => {
  const pos = snapQuestPosition(point, islandChunks);
  if (!isOnIsland(pos[0], pos[2], islandChunks)) return null;
  return pos;
};
