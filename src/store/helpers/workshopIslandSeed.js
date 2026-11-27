import { NEED_TYPE_TO_DEFAULT_TYPE } from '../../constants/barrierData';
import { getPersona } from '../../constants/personas';
import { WORKSHOP_CHALLENGES } from '../../constants/workshopChallenges';
import { createDefaultPlacedBlocks, createPresetForQuestPlacement } from '../../utils/placePresets';
import { getIslandTopYAt } from '../../utils/terrainPlacement';
import { createDefaultIslandChunks } from './saveSchema';
import { normalizeQuest } from './bugFactory';
import { createQuestFromPost, questToBug } from './questLifecycle';
import { QUEST_STATUS } from './questState';

export const WORKSHOP_SEED_VERSION = 5;

const LEGACY_PERSONA_BY_ID = {
  'ar-1792484266589-qk9i9dy': 'inclusive',
  'ar-1792483946203-3yxt010': 'link',
  'ar-1792483690461-xp641d3': 'place',
  'ar-1792483015533-x3nbmdb': 'livability',
};

/** 島の四隅。隣り合う距離が同じになる正方形。 */
const WORKSHOP_CORNERS = [
  [-11, -11],
  [11, -11],
  [-11, 11],
  [11, 11],
];

const cornerPosition = (islandChunks, [x, z]) => {
  const y = Number((getIslandTopYAt(x, z, islandChunks) + 0.5).toFixed(3));
  return [x, y, z];
};

const personaDemographic = (personaKey) => {
  const persona = getPersona(personaKey);
  return persona ? `${persona.name}（${persona.role}）` : '';
};

const CORNER_BY_PERSONA = {
  inclusive: 0,
  link: 1,
  place: 2,
  livability: 3,
};

const WORKSHOP_POSTS = [...WORKSHOP_CHALLENGES]
  .sort((a, b) => CORNER_BY_PERSONA[a.personaKey] - CORNER_BY_PERSONA[b.personaKey])
  .map((challenge) => ({
    id: challenge.id,
    personaKey: challenge.personaKey,
    needType: challenge.needType,
    placeArchetype: challenge.placeArchetype,
    placeText: challenge.placeText,
    demographic: personaDemographic(challenge.personaKey),
    severity: challenge.severity,
    comment: challenge.comment,
    photo: challenge.photo,
    photoPins: challenge.photoPins,
  }));

/** セーブ済みの四隅投稿にも、人物を後から当てる。 */
export function workshopPersonaKey(record) {
  if (typeof record?.personaKey === 'string' && record.personaKey) return record.personaKey;
  const id = record?.sourceAnnotationId;
  if (typeof id !== 'string') return null;
  return WORKSHOP_POSTS.find((post) => post.id === id)?.personaKey
    ?? LEGACY_PERSONA_BY_ID[id]
    ?? null;
}

export const WORKSHOP_POST_IDS = WORKSHOP_POSTS.map((post) => post.id);

/** 4件のデモ投稿がすべてセーブ内にあるときだけ、その進行状況を維持する。 */
export const hasCurrentWorkshopPosts = (savedData) => {
  const savedIds = new Set(
    (Array.isArray(savedData?.quests) ? savedData.quests : [])
      .map((quest) => quest?.sourceAnnotationId)
      .filter((id) => typeof id === 'string'),
  );
  return WORKSHOP_POST_IDS.every((id) => savedIds.has(id));
};

export function createWorkshopIslandState() {
  const islandChunks = createDefaultIslandChunks();
  let placedBlocks = createDefaultPlacedBlocks(islandChunks);
  let bugs = [];
  const quests = [];

  WORKSHOP_POSTS.forEach((post, index) => {
    const quest = normalizeQuest(createQuestFromPost({
      ...post,
      sourceAnnotationId: post.id,
      postKind: 'bad',
      type: NEED_TYPE_TO_DEFAULT_TYPE[post.needType] ?? 'danger',
      photo: post.photo,
      photoPins: post.photoPins ?? [{ id: 'center', nx: 0.5, ny: 0.5 }],
      timeTag: 'いつでも',
      whoText: post.demographic,
      isMine: false,
      fromPost: true,
    }));
    const pos = cornerPosition(islandChunks, WORKSHOP_CORNERS[index]);
    const preset = createPresetForQuestPlacement({
      quest,
      basePos: pos,
      islandChunks,
      existingBlocks: placedBlocks,
    });
    const bug = questToBug(quest, pos);
    if (preset.archetype) bug.placeArchetype = preset.archetype;
    bugs = [...bugs, bug];
    quests.push({
      ...quest,
      questStatus: QUEST_STATUS.ON_ISLAND,
      linkedBugId: bug.id,
    });
    if (preset.blocks.length > 0) {
      placedBlocks = [...placedBlocks, ...preset.blocks];
    }
  });

  return { islandChunks, bugs, quests, placedBlocks };
}
