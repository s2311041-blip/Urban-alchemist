import { getPersona } from './personas';

const move = getPersona('link').name;
const stay = getPersona('place').name;
const safe = getPersona('inclusive').name;
const quiet = getPersona('livability').name;

const voice = (speaker, text) => ({ speaker, text });

const IGNORE_HAPPY = voice('副市長', '市長は予算を温存するため、今回は手を打たない判断を下しました…。');
const IGNORE_UNHAPPY = voice('住民', '私たちの切実な声は届かないのか！危険で不便なまま放置されるなんて納得いかない！');
const IGNORE_SYSTEM = '今回は手を打たず、現状維持としました。';

/**
 * ワークショップ4件。数値と台詞はこの課題だけの表で、8類型の共通表とは分ける。
 * planId は、今のゲームで置けるブロックの種類（資料の「枠」）に対応する。
 */
export const WORKSHOP_CHALLENGES = [
  {
    id: 'ws-shiomi-bikes',
    personaKey: 'inclusive',
    needType: 'S',
    placeArchetype: 'plaza',
    placeText: '駅前・広場',
    severity: 'low',
    photo: '/workshop/shiomi-bikes.jpg',
    photoPins: [{ id: 'spot', nx: 0.42, ny: 0.58 }],
    comment: '駅前の点字ブロックのすぐ真横に、原付バイクや自転車が停められていてすごく危ない。そもそも駐輪禁止の黄色い注意コーンが置いてあるのに無視して停められているし、道が狭くなってしまっているので、視覚障害のある人やベビーカー・車椅子が安心して駅を利用できるようにしてほしい。',
    plans: [
      {
        id: 'maintenance',
        label: '広場の一角に区画整理した駐輪スペース・ラックを新設する',
        description: '点字ブロック付近の危険と動線の詰まりは大きく解消できる。広場の開放感は減り、予算も重い。',
        budget: 30,
        link: 15,
        place: -15,
        inclusive: 20,
        livability: 0,
        positive: voice(safe, '点字ブロックの横からバイクや自転車がなくなって、車椅子でもベビーカーでも安心して駅を使えるようになりました！'),
        negative: voice(stay, 'せっかくの広い駅前広場の一角が駐輪ラックで埋まってしまって、ちょっと立ち止まって一息つく開放感がなくなっちゃったな…。'),
      },
      {
        id: 'detour_path',
        label: '歩行者エリアの路面区画分け（簡易柵・表示）と警告・撤去の強化',
        description: '中くらいの予算で広場の安全は補える。締め出された自転車が路地や住宅地へ流れる。',
        budget: 15,
        link: 5,
        place: 0,
        inclusive: 10,
        livability: -15,
        positive: voice(safe, '歩行者エリアがはっきり区切られて放置自転車も撤去されたおかげで、点字ブロックの上を安全に歩けるようになったよ。'),
        negative: voice(quiet, '駅前に停められなくなった自転車や原付が、今度はうちの近くの狭い路地や家の前に溢れてきて迷惑しているんだが…。'),
      },
      {
        id: 'sign_info',
        label: '注意喚起のコーンや「駐輪禁止」の看板を増やす',
        description: '予算はほとんど使わない。すでにコーンが無視されているので、危険は残る。',
        budget: 5,
        link: -10,
        place: 0,
        inclusive: -10,
        livability: -5,
        positive: voice('副市長', '予算をほとんど使わずに、行政としての注意喚起と周知対応を完了しました。'),
        negative: voice(safe, '前のコーンだって無視されていたのに、看板だけ増やしてもやっぱり点字ブロックの横に停められたままで危ないままです…。'),
      },
      {
        id: 'ignore',
        label: '何もしない（現状維持）',
        description: '点字ブロック脇の放置駐輪が残ります。',
        budget: 0,
        link: -15,
        place: 0,
        inclusive: -25,
        livability: 0,
        systemText: IGNORE_SYSTEM,
        positive: IGNORE_HAPPY,
        negative: IGNORE_UNHAPPY,
      },
    ],
  },
  {
    id: 'ws-underpass-rest',
    personaKey: 'place',
    needType: 'R',
    placeArchetype: 'waterfront',
    placeText: '水辺の広場',
    severity: 'low',
    photo: '/workshop/underpass-rest.jpg',
    photoPins: [{ id: 'spot', nx: 0.75, ny: 0.58 }],
    comment: '高架下で雨をある程度しのげる広い場所なのに、ゆっくり腰を下ろして過ごせる場所や雰囲気がなく、みんな素通りするだけになっていて勿体ない。散歩の途中で一息つける空間になっていたらいいな。',
    plans: [
      {
        id: 'care_point',
        label: 'ベンチと照明を整え、雨の日も集まれる憩いの広場をつくる',
        description: '滞在と安全は大きく上がる。声が反響する高架下では、近くの住まいの静けさが下がる。',
        budget: 30,
        link: -5,
        place: 25,
        inclusive: 15,
        livability: -20,
        positive: voice(stay, '雨の日でも明るくて座れる素敵な居場所ができた！散歩の途中でゆっくり一息つけるし、地域の人も集まれて嬉しいな。'),
        negative: voice(quiet, '高架下は声が反響しやすいのに、夜まで人が集まって話し声が響くようになってしまった…。すぐ裏の家に住んでいる身としては落ち着かないよ。'),
      },
      {
        id: 'maintenance',
        label: '通路の端に簡易ベンチを少数置き、舗装を少し整える',
        description: '少し休めるようになる。通路が狭くなり、通り抜ける動きは大きく削られる。',
        budget: 20,
        link: -15,
        place: 15,
        inclusive: 5,
        livability: -10,
        positive: voice(stay, 'ちょっとしたベンチが置かれて舗装も綺麗になったおかげで、散歩の合間に少し腰を下ろせるようになったわ。'),
        negative: voice(move, 'ただでさえ通り抜ける人が多い通路の端にベンチを置かれたせいで、すれ違う幅が狭くなってスムーズに歩けなくなったよ。'),
      },
      {
        id: 'sign_info',
        label: '設備は増やさず、近くの公園・休憩所を示す案内看板を立てる',
        description: '静けさと予算は守れる。ここで休めない不満は残る。',
        budget: 5,
        link: -5,
        place: -15,
        inclusive: -5,
        livability: 0,
        positive: voice('副市長', '最小限の予算で既存の公園へ誘導する案内板を設置し、維持コストを抑えました。'),
        negative: voice(stay, '『別の公園へ行け』と看板だけ立てられても、今ここで一息つきたいのに休める場所がどこにもないままじゃないか…。'),
      },
      {
        id: 'ignore',
        label: '何もしない（このまま通路にする）',
        description: 'この場所は通るだけの通路のままです。',
        budget: 0,
        link: 0,
        place: -25,
        inclusive: -10,
        livability: 0,
        systemText: IGNORE_SYSTEM,
        positive: IGNORE_HAPPY,
        negative: IGNORE_UNHAPPY,
      },
    ],
  },
  {
    id: 'ws-lane-bikes',
    personaKey: 'livability',
    needType: 'S',
    placeArchetype: 'lane',
    placeText: '路地・住宅街',
    severity: 'mid',
    photo: '/workshop/lane-night.jpg',
    photoPins: [{ id: 'spot', nx: 0.55, ny: 0.62 }],
    comment: '歩道もない見通しのよくない狭い住宅街の道なのに、住居の玄関のすぐ横を、近道をする自転車がスピードを出して通り抜けていく。ベルや車などの走行音も響くし、玄関から出た瞬間にぶつかりそうで毎日ヒヤヒヤする。もう少し生活道路として落ち着いて安心できる環境にしてほしい。',
    plans: [
      {
        id: 'lighting',
        label: '道路の色塗り（カラー舗装）・凸凹の減速帯とカーブミラーを整備する',
        description: '自転車が速度を落とし、玄関先のヒヤヒヤが減る。通り抜ける時間は少し増える。',
        budget: 30,
        link: -5,
        place: 0,
        inclusive: 10,
        livability: 20,
        positive: voice(quiet, '減速帯と色分けのおかげで自転車がスピードを落としてくれるようになったし、カーブミラーもあって玄関から出る時のヒヤヒヤがなくなったよ！'),
        negative: voice(move, '近道として使っていたけど、凸凹の減速帯があってスピードを出せないから前より通過に時間がかかるな…。'),
      },
      {
        id: 'detour_path',
        label: '「自転車は降りて押し歩き」の通行規制と路面表示を導入する',
        description: '猛スピードで通り抜ける音は減る。近道にしていた人は押し歩きで大きく時間を取られる。',
        budget: 15,
        link: -20,
        place: 0,
        inclusive: 5,
        livability: 15,
        positive: voice(quiet, '自転車が降りて押して歩いてくれるようになったおかげで、猛スピードで走り抜ける音や飛び出しの恐怖がなくなってほっとしたよ。'),
        negative: voice(move, '毎朝ここを近道にして通勤していたのに、わざわざ自転車を降りて押し歩きさせられるのは正直かなり時間がかかるよ…。'),
      },
      {
        id: 'sign_info',
        label: '電柱に「スピード落とせ・飛び出し注意」の注意看板を貼る',
        description: '予算はほとんど使わない。急いでいる自転車は止まらず、静けさの不安は残る。',
        budget: 5,
        link: 0,
        place: 0,
        inclusive: -10,
        livability: -15,
        positive: voice('副市長', '予算をほとんど使わずに、電柱への注意喚起表示による啓発対応を行いました。'),
        negative: voice(quiet, '電柱に看板を貼ったくらいじゃ急いでいる自転車は止まらないよ。結局スピードを出して通り抜けていくし、毎日ヒヤヒヤしたままだ…。'),
      },
      {
        id: 'ignore',
        label: '何もしない（現状維持）',
        description: 'スピードを出す自転車が、玄関の横を通り続けます。',
        budget: 0,
        link: -5,
        place: 0,
        inclusive: -10,
        livability: -25,
        systemText: IGNORE_SYSTEM,
        positive: IGNORE_HAPPY,
        negative: IGNORE_UNHAPPY,
      },
    ],
  },
  {
    id: 'ws-slope-blind',
    personaKey: 'link',
    needType: 'L',
    placeArchetype: 'road',
    placeText: '歩道・道路',
    severity: 'high',
    photo: '/workshop/slope-blind.jpg',
    photoPins: [{ id: 'spot', nx: 0.36, ny: 0.45 }],
    comment: '歩道橋のスロープから自転車が勢いよく降りてくるのに、目の前に巨大な橋脚があって視界が遮られ、バス停や横断歩道から来る人が見えない時がある。買い物客やバス待ちの人も交差するので、自転車も歩行者も毎回ここで立ち止まったり避けたりしてスムーズに通り抜けられない。',
    plans: [
      {
        id: 'lighting',
        label: '動線の物理分離と大型ミラー・視認照明の整備',
        description: '移動と安全は同時に戻る。柵や光の圧迫で、立ち止まりにくく静けさも下がる。',
        budget: 30,
        link: 20,
        place: -10,
        inclusive: 15,
        livability: -10,
        positive: voice(move, '自転車と歩行者の動線が分かれて大型ミラーもついたおかげで、立ち止まらずに安全かつスムーズに通り抜けられるようになった！'),
        negative: voice(stay, '柵や照明がぎっしり設置されて通り抜けやすくはなったけど、圧迫感があってバス待ちや買い物帰りに立ち止まりづらい空間になったな…。'),
      },
      {
        id: 'detour_path',
        label: 'スロープ内に柵を設け、自転車の降りての押し歩き・減速を徹底する',
        description: '勢いよく飛び出す自転車は減る。遠回りと押し歩きで、移動は大きく下がる。',
        budget: 20,
        link: -20,
        place: 5,
        inclusive: 15,
        livability: -5,
        positive: voice(safe, 'スロープから自転車が勢いよく飛び出してこなくなったので、橋脚の陰からでも安心して横断歩道やバス停へ向かえます！'),
        negative: voice(move, 'スロープを降りるたびに柵の前で自転車を降りて押し歩きしなきゃいけなくて、通勤時間帯は後ろまで詰まって全然進めないよ…。'),
      },
      {
        id: 'sign_info',
        label: '橋脚とスロープ出口に減速シートと注意看板を貼る',
        description: '予算は少なく静けさは守れる。死角と狭さは残り、移動と安全は下がる。',
        budget: 5,
        link: -10,
        place: -5,
        inclusive: -10,
        livability: 0,
        positive: voice('副市長', '最小限の予算で減速シートと注意看板を設置し、コストを抑えた対応を行いました。'),
        negative: voice(move, '減速シートや看板は増えたけど、橋脚の死角も通路の狭さもそのまま。結局毎回ブレーキをかけて立ち止まる羽目になり、かえって通りづらくなったよ…。'),
      },
      {
        id: 'ignore',
        label: '何もしない（現状維持）',
        description: '死角と立ち止まりが残ります。',
        budget: 0,
        link: -25,
        place: -10,
        inclusive: -20,
        livability: 0,
        systemText: IGNORE_SYSTEM,
        positive: IGNORE_HAPPY,
        negative: IGNORE_UNHAPPY,
      },
    ],
  },
];

const byId = Object.fromEntries(WORKSHOP_CHALLENGES.map((challenge) => [challenge.id, challenge]));

export function getWorkshopChallenge(sourceAnnotationId) {
  if (typeof sourceAnnotationId !== 'string') return null;
  return byId[sourceAnnotationId] ?? null;
}

export function getWorkshopPlan(sourceAnnotationId, planId) {
  return getWorkshopChallenge(sourceAnnotationId)?.plans.find((plan) => plan.id === planId) ?? null;
}

export function getWorkshopBuildPlanIds(sourceAnnotationId) {
  const challenge = getWorkshopChallenge(sourceAnnotationId);
  if (!challenge) return null;
  return challenge.plans.filter((plan) => plan.id !== 'ignore').map((plan) => plan.id);
}

export function workshopPlanMatrixEntry(sourceAnnotationId, planId) {
  const plan = getWorkshopPlan(sourceAnnotationId, planId);
  if (!plan) return null;
  return {
    budget: -Math.abs(plan.budget ?? 0),
    link: plan.link ?? 0,
    place: plan.place ?? 0,
    inclusive: plan.inclusive ?? 0,
    livability: plan.livability ?? 0,
  };
}
