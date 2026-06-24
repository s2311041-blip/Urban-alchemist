import { getIslandTopYAt, isOnIsland } from '../../utils/terrainPlacement';
import {
  createPresetForQuestPlacement,
  hasExistingPlaceSite,
  PLACE_ARCHETYPE_LABELS,
  snapQuestPositionIfOnIsland,
} from '../../utils/placePresets';
import { normalizePostStats } from '../../constants/economyData';
import { normalizeBug } from './bugFactory';
import { QUEST_STATUS } from './questState';

const GRID_STEP = 0.5;

const MAX_POST_EVENTS = 200;

const snapToBuildGrid = (value) => Math.floor(value / GRID_STEP) * GRID_STEP + GRID_STEP / 2;

const getCenterPos = (islandChunks = []) => {
  const center = islandChunks.find((chunk) => chunk.id === 'center') ?? islandChunks[0];
  if (!center?.pos) return [0, 0.5, 0];
  return [center.pos[0], Number((center.pos[1] + 0.8).toFixed(3)), center.pos[2]];
};

const getSpawnCandidates = (origin) => {
  const [ox, , oz] = origin;
  const ring = [
    [0, 0],
    [8, 0], [-8, 0], [0, 8], [0, -8],
    [8, 8], [-8, 8], [8, -8], [-8, -8],
    [12, 0], [0, 12], [-12, 0], [0, -12],
  ];
  return ring.map(([dx, dz]) => [snapToBuildGrid(ox + dx), origin[1], snapToBuildGrid(oz + dz)]);
};

const hasNearbyPreset = (candidate, existingBlocks = [], minDistance = 6) => existingBlocks.some((block) => {
  if (!block?.presetLocked || !Array.isArray(block?.pos)) return false;
  const dx = (block.pos[0] ?? 0) - candidate[0];
  const dz = (block.pos[2] ?? 0) - candidate[2];
  return Math.hypot(dx, dz) < minDistance;
});

const hasNearbyBug = (candidate, bugs = [], minDistance = 3) => bugs.some((bug) => {
  if (!Array.isArray(bug?.pos)) return false;
  const dx = (bug.pos[0] ?? 0) - candidate[0];
  const dz = (bug.pos[2] ?? 0) - candidate[2];
  return Math.hypot(dx, dz) < minDistance;
});

const findExistingSiteAnchor = (archetype, existingBlocks = []) => {
  const siteBlock = existingBlocks.find(
    (block) => block?.presetLocked && block?.presetArchetype === archetype,
  );
  return siteBlock?.pos ?? null;
};

export const createQuestFromPost = (post = {}) => {
  const questId = `quest_${Date.now()}`;
  return {
    ...post,
    id: questId,
    postKind: 'bad',
    questStatus: QUEST_STATUS.PENDING_SPAWN,
    linkedBugId: null,
    isMine: true,
  };
};

export const resolveSpawnPosition = ({
  quest,
  islandChunks = [],
  existingBlocks = [],
  bugs = [],
}) => {
  if (Array.isArray(quest?.mapPin) && quest.mapPin.length >= 2) {
    const x = snapToBuildGrid(Number(quest.mapPin[0]) || 0);
    const z = snapToBuildGrid(Number(quest.mapPin[1]) || 0);
    const y = Number((getIslandTopYAt(x, z, islandChunks) + 0.5).toFixed(3));
    return [x, y, z];
  }

  const archetype = quest?.placeArchetype;
  if (typeof archetype === 'string' && archetype !== 'none') {
    const anchor = findExistingSiteAnchor(archetype, existingBlocks);
    if (anchor) {
      const sameSiteBugCount = bugs.filter(
        (bug) => bug?.placeArchetype === archetype && !bug.solved,
      ).length;
      const offsetAngle = sameSiteBugCount * (Math.PI / 3);
      const radius = 1.5;
      const x = snapToBuildGrid(anchor[0] + Math.cos(offsetAngle) * radius);
      const z = snapToBuildGrid(anchor[2] + Math.sin(offsetAngle) * radius);
      const y = Number((getIslandTopYAt(x, z, islandChunks) + 0.5).toFixed(3));
      return [x, y, z];
    }
  }

  const origin = getCenterPos(islandChunks);
  const candidates = getSpawnCandidates(origin).filter(
    (candidate) => isOnIsland(candidate[0], candidate[2], islandChunks),
  );
  const spawn = candidates.find(
    (candidate) => !hasNearbyPreset(candidate, existingBlocks) && !hasNearbyBug(candidate, bugs),
  ) ?? candidates[0] ?? origin;
  const y = Number((getIslandTopYAt(spawn[0], spawn[2], islandChunks) + 0.5).toFixed(3));
  return [spawn[0], y, spawn[2]];
};

export const questToBug = (quest, pos) => normalizeBug({
  ...quest,
  id: `bug_${quest.id}`,
  pos,
  solved: false,
  sourceQuestId: quest.id,
  fromPost: true,
});

export const spawnQuestOnIslandState = ({
  quest,
  islandChunks = [],
  placedBlocks = [],
  bugs = [],
}) => {
  if (!quest || quest.questStatus === QUEST_STATUS.ON_ISLAND || quest.questStatus === QUEST_STATUS.RESOLVED) {
    return null;
  }

  const spawnPos = resolveSpawnPosition({
    quest,
    islandChunks,
    existingBlocks: placedBlocks,
    bugs,
  });

  const archetype = quest.placeArchetype;
  const reuseSite = hasExistingPlaceSite(archetype, placedBlocks);
  const preset = (!reuseSite && archetype !== 'none')
    ? createPresetForQuestPlacement({
      quest,
      basePos: spawnPos,
      islandChunks,
      existingBlocks: placedBlocks,
    })
    : { archetype: null, needType: quest.needType, label: null, blocks: [] };

  const bug = questToBug(quest, spawnPos);
  if (preset.archetype) {
    bug.placeArchetype = preset.archetype;
  }

  const nextBlocks = preset.blocks.length > 0
    ? [...placedBlocks, ...preset.blocks]
    : placedBlocks;

  const updatedQuest = {
    ...quest,
    questStatus: QUEST_STATUS.ON_ISLAND,
    linkedBugId: bug.id,
  };

  let toast = 'あなたの投稿を島に載せました。';
  if (preset.label) {
    toast = `${preset.label}にあなたの投稿を載せました。`;
  } else if (archetype === 'none') {
    toast = 'あなたの投稿をオーブとして島に載せました。';
  } else if (reuseSite && PLACE_ARCHETYPE_LABELS[archetype]) {
    toast = `${PLACE_ARCHETYPE_LABELS[archetype]}の既存サイトに投稿を追加しました。`;
  }

  return {
    bug,
    updatedQuest,
    nextBlocks,
    toast,
  };
};

export const markQuestResolved = (quests, questId, bugId) => quests.map((quest) => (
  quest.id === questId || quest.linkedBugId === bugId
    ? { ...quest, questStatus: QUEST_STATUS.RESOLVED }
    : quest
));

export { QUEST_STATUS, normalizeQuestStatus } from './questState';

export const appendPostEvent = (postStats, event) => {
  const base = normalizePostStats(postStats);
  return {
    ...base,
    events: [...base.events, { ...event, t: Number.isFinite(event?.t) ? event.t : Date.now() }]
      .slice(-MAX_POST_EVENTS),
  };
};

export const buildPostEventFromQuest = (quest) => ({
  t: Number.isFinite(quest?.t) ? quest.t : Date.now(),
  kind: 'post',
  questId: quest?.id ?? null,
  captureMode: quest?.captureMode ?? 'onsite',
  needType: quest?.needType ?? null,
  placeArchetype: quest?.placeArchetype ?? null,
  isMine: !!quest?.isMine,
});

export const buildSpawnEvent = ({ questId, bugId }) => ({
  t: Date.now(),
  kind: 'spawn',
  questId: questId ?? null,
  bugId: bugId ?? null,
});

export const buildResolveEvent = ({ questId, bugId, chosenPlan, t }) => ({
  t: Number.isFinite(t) ? t : Date.now(),
  kind: 'resolve',
  questId: questId ?? null,
  bugId: bugId ?? null,
  chosenPlan: chosenPlan ?? null,
});

export const snapManualQuestPosition = (point, islandChunks = []) => (
  snapQuestPositionIfOnIsland(point, islandChunks)
);
