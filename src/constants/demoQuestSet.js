/** WS デモ用 — 同一 placeArchetype + 異 needType で reuse accent を見せる */
export const DEMO_QUEST_POSTS = [
  {
    id: 'quest_demo_station_p',
    sourceAnnotationId: 'demo_station_p',
    needType: 'P',
    type: 'danger',
    comment: '駅前の段差が高くて怖い',
    placeArchetype: 'station',
    affectedGroups: ['車いす', '高齢者'],
    demographic: '車いす',
    captureMode: 'onsite',
    isMine: false,
  },
  {
    id: 'quest_demo_station_v',
    sourceAnnotationId: 'demo_station_v',
    needType: 'V',
    type: 'empty',
    comment: '夜の駅前が暗くて不安',
    placeArchetype: 'station',
    affectedGroups: ['視覚', '高齢者'],
    demographic: '視覚',
    captureMode: 'onsite',
    isMine: false,
  },
  {
    id: 'quest_demo_station_l',
    sourceAnnotationId: 'demo_station_l',
    needType: 'L',
    type: 'empty',
    comment: 'ベンチが少なくて休めない',
    placeArchetype: 'station',
    affectedGroups: ['高齢者', '一般'],
    demographic: '高齢者',
    captureMode: 'onsite',
    isMine: false,
  },
];

export const isDemoQuestId = (id) => typeof id === 'string' && id.startsWith('quest_demo_');
