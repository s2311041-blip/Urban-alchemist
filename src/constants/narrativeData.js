import { getPersona } from './personas';
import {
  MIN_ISLAND_SATISFACTION,
  SATISFACTION_ATTRS,
  normalizeIslandSatisfaction,
} from './satisfactionAttributes';

const rush = getPersona('link');
const rest = getPersona('place');
const guard = getPersona('inclusive');
const quiet = getPersona('livability');

export const TUTORIAL_SCENARIO = [
  {
    speaker: '副市長',
    role: 'システム',
    color: '#90caf9',
    introAttributes: true,
    text: `市長、着任おめでとうございます。この街には、${rush.name}・${rest.name}・${guard.name}・${quiet.name}——4人の願いが交差しています。`,
  },
  {
    speaker: '副市長',
    role: 'システム',
    color: '#90caf9',
    text: '着任早々ですが問題です。駅前の『空き地』をどう整備するかで、市民が揉めています！',
  },
  {
    speaker: rush.name,
    role: rush.role,
    attributeKey: 'link',
    text: '空き地なんてアスファルトで固めて『近道（ショートカット）』にしようぜ！駅までの時間が惜しいんだ！',
  },
  {
    speaker: quiet.name,
    role: quiet.role,
    attributeKey: 'livability',
    text: 'とんでもない！抜け道なんかにしたら、自転車がビュンビュン通って騒々しくなるじゃろうが！',
  },
  {
    speaker: rest.name,
    role: rest.role,
    attributeKey: 'place',
    text: 'じゃあ、ベンチを置いて『みんなの広場』にしましょうよ！夜まで語り明かせるように明るい街灯もつけて！',
  },
  {
    speaker: quiet.name,
    role: quiet.role,
    attributeKey: 'livability',
    text: 'やめてくれ！夜中まで若者が騒いで、街灯が眩しくて一睡もできなくなる！',
  },
  {
    speaker: guard.name,
    role: guard.role,
    attributeKey: 'inclusive',
    text: 'あの…私はただ、ガタガタの道を直して、安全に通れるようにしてほしいだけなんですが…',
  },
  {
    speaker: '副市長',
    role: 'システム',
    color: '#90caf9',
    text: '…ご覧の通りです。あちらを立てればこちらが立たず。しかも、我々の『予算』は限られています。',
  },
  {
    speaker: '副市長',
    role: 'システム',
    color: '#90caf9',
    text: '市長、あなたの仕事は彼ら全員の不満を聞き、予算内で『誰の願いを叶え、誰に我慢してもらうか』を決断することです。さあ、街の声に耳を傾けてください！',
  },
];

export const PLAN_FEEDBACK_NARRATIVE = {
  hard_fix: {
    positive: { speaker: guard.name, text: '通れる！もう転ぶ心配もない。最高の市長だ！' },
    negative: { speaker: '副市長', text: '…しかし市長、莫大な工事費がかかり、市の財政が大きく圧迫されました…。' }
  },
  detour_path: {
    positive: { speaker: rush.name, text: 'スイスイ通れるぜ！最高に効率が良い道だ！' },
    negative: { speaker: `${guard.name}・${quiet.name}`, text: '自転車が猛スピードで抜け道を通っていく…。\n家の横を人がひっきりなしに通るようになって落ち着かないんじゃが…' }
  },
  sign_info: {
    positive: { speaker: '副市長', text: '予算をほぼ使わずに、行政としての案内（アリバイ作り）を完了しました。' },
    negative: { speaker: `${rush.name}・${guard.name}`, text: '道のど真ん中に看板を立てるな！邪魔で仕方ない！\n足元注意と言われても、この段差は自力では越えられないんです…。' }
  },
  lighting: {
    positive: { speaker: guard.name, text: '夜道が明るくなって、安心して帰れるようになりました！' },
    negative: { speaker: quiet.name, text: '防犯灯が眩しすぎる！夜中も昼みたいで一睡もできないぞ！' }
  },
  maintenance: {
    positive: { speaker: '副市長', text: '植え込みもベンチも撤去し、管理のしやすい空間に整えました。' },
    negative: { speaker: rest.name, text: '座る場所も日陰もなくなった。どこで休めばいいの…。' }
  },
  care_point: {
    positive: { speaker: `${rest.name}・${guard.name}`, text: 'みんなが集まれる最高の居場所ができた！助け合いの輪が広がっている！' },
    negative: { speaker: quiet.name, text: '見知らぬ車が出入りし、若者が夜までたむろしている…。静かな生活を返してくれ！' }
  },
  mobility_support: {
    positive: { speaker: guard.name, text: '自力で外出できなかった私たちが、涙を流して喜んでいます！' },
    negative: { speaker: `${quiet.name}・副市長`, text: 'ひっきりなしに家の前をバスが通る。排気ガスとエンジン音がうるさいんじゃ！\n素晴らしい施策ですが、維持費が市の財政を猛烈に圧迫し続けています…。' }
  },
  ignore: {
    positive: { speaker: '副市長', text: '市長は予算を節約するため、見て見ぬふりをした…。' },
    negative: { speaker: '住民', text: '私たちの切実な声は、市長には届かないのか！もうこの街には住めない！' }
  },
  transit_link: {
    positive: { speaker: rush.name, text: '海列車が開通したぞ！これで島へのアクセスが劇的に良くなる！' },
    negative: { speaker: '副市長', text: '便利ですが、莫大な建設コストが市の財政を直撃しています…。' }
  }
};

/** 島の不満をすべて受け終えたあとの結び。専用エンディング画面は無く、対話で出す。 */
export const WORKSHOP_ENDING_SCENARIO = [
  {
    speaker: '副市長',
    role: 'システム',
    color: '#90caf9',
    text: '島に届いていた四つの声に、すべて手を打ちました。',
  },
  {
    speaker: '副市長',
    role: 'システム',
    color: '#90caf9',
    text: '一つの直しで楽になる人もいれば、別の誰かに我慢が残ることもあります。限られた予算の中で、誰の願いに応えたのか。それが、この街の決断です。',
  },
  {
    speaker: '副市長',
    role: 'システム',
    color: '#90caf9',
    text: '市長、本日の仕事はここまでです。街の声を、自分の手で受け止めてくださり、ありがとうございました。',
  },
];

export function listIslandClearFailures(satisfaction) {
  const sat = normalizeIslandSatisfaction(satisfaction);
  return SATISFACTION_ATTRS
    .filter((attr) => sat[attr.key] < MIN_ISLAND_SATISFACTION)
    .map((attr) => ({ key: attr.key, label: attr.shortLabel, value: sat[attr.key] }));
}

/** 四つとも手を打ったあとに、どれかが20未満なら失敗の結び。20ちょうどはクリア。 */
export function buildWorkshopGameOverScenario(satisfaction) {
  const failed = listIslandClearFailures(satisfaction);
  const detail = failed.map((attr) => `${attr.label}が${attr.value}`).join('、');
  return [
    {
      speaker: '副市長',
      role: 'システム',
      color: '#ef9a9a',
      text: `四つの声には、すべて手を打ちました。しかし、${detail}です。`,
    },
    {
      speaker: '副市長',
      role: 'システム',
      color: '#ef9a9a',
      text: 'どれか一つでも20を切ると、この街は成り立ちません。ゲームオーバーです。',
    },
  ];
}

export function appendWorkshopEnding(feedback, bugs = [], satisfaction = null) {
  const list = Array.isArray(bugs) ? bugs : [];
  if (list.length === 0 || list.some((bug) => !bug?.solved)) return feedback;
  const ending = satisfaction != null && listIslandClearFailures(satisfaction).length > 0
    ? buildWorkshopGameOverScenario(satisfaction)
    : WORKSHOP_ENDING_SCENARIO;
  if (Array.isArray(feedback)) return [...feedback, ...ending];
  return ending;
}
