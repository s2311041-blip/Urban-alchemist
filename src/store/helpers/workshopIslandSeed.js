import { NEED_TYPE_TO_DEFAULT_TYPE } from '../../constants/barrierData';
import { createDefaultPlacedBlocks } from '../../utils/placePresets';
import { createDefaultIslandChunks } from './saveSchema';
import { normalizeQuest } from './bugFactory';
import { createQuestFromPost, spawnQuestOnIslandState } from './questLifecycle';

const PHOTO_BASE = 'https://ltpgtysvikszlcwsyieb.supabase.co/storage/v1/object/public/ar-photos/07a22342-6baa-4a1f-8d44-e212e87ff75b';

const photoUrl = (id) => `${PHOTO_BASE}/${id}.jpg`;

/** 学会デモ用。ARに残っている4件を、最初から島に置いた状態にする。 */
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
    placeArchetype: 'road',
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

export function createWorkshopIslandState() {
  const islandChunks = createDefaultIslandChunks();
  let placedBlocks = createDefaultPlacedBlocks(islandChunks);
  let bugs = [];
  const quests = [];

  WORKSHOP_POSTS.forEach((post) => {
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
    const spawned = spawnQuestOnIslandState({
      quest,
      islandChunks,
      placedBlocks,
      bugs,
    });
    if (!spawned) return;
    bugs = [...bugs, spawned.bug];
    quests.push(spawned.updatedQuest);
    placedBlocks = spawned.nextBlocks;
  });

  return { islandChunks, bugs, quests, placedBlocks };
}
