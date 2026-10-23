import { NEED_TYPE_TO_DEFAULT_TYPE } from '../../constants/barrierData';
import { createDefaultPlacedBlocks, createPresetForQuestPlacement } from '../../utils/placePresets';
import { getIslandTopYAt } from '../../utils/terrainPlacement';
import { createDefaultIslandChunks } from './saveSchema';
import { normalizeQuest } from './bugFactory';
import { createQuestFromPost, questToBug } from './questLifecycle';
import { QUEST_STATUS } from './questState';

const PHOTO_BASE = 'https://ltpgtysvikszlcwsyieb.supabase.co/storage/v1/object/public/ar-photos/07a22342-6baa-4a1f-8d44-e212e87ff75b';
export const WORKSHOP_SEED_VERSION = 4;

const photoUrl = (id) => `${PHOTO_BASE}/${id}.jpg`;

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
const WORKSHOP_POSTS = [
  {
    id: 'ar-1792484266589-qk9i9dy',
    needType: 'P',
    placeArchetype: 'road',
    placeText: '歩道・道路',
    demographic: '自転車に乗ってる人',
    severity: 'mid',
    comment: '歩道に上がる段差のブロックの一個が周りより少し浮いていて転びそうになる',
  },
  {
    id: 'ar-1792483946203-3yxt010',
    needType: 'S',
    placeArchetype: 'road',
    placeText: '歩道・道路',
    demographic: '歩行者',
    severity: 'high',
    comment: '自転車がスピードを出して降りてきて歩行者とぶつかりそうになる。歩道橋の道自体も広くないから危ない。',
  },
  {
    id: 'ar-1792483690461-xp641d3',
    needType: 'P',
    placeArchetype: 'none',
    placeText: '歩道橋',
    demographic: '特に足腰の弱い人は危険だと思う。',
    severity: 'mid',
    comment: '歩道を舗装して欲しい。ボロボロになっていてつまづいた。階段だから危なかった。',
  },
  {
    id: 'ar-1792483015533-x3nbmdb',
    needType: 'M',
    placeArchetype: 'plaza',
    placeText: '駅前・広場',
    demographic: 'みんな',
    severity: 'low',
    comment: '自販機の近くというだけで飲料のゴミが捨てられている。',
  },
];

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
      photo: photoUrl(post.id),
      photoPins: [{ id: 'center', nx: 0.5, ny: 0.5 }],
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
