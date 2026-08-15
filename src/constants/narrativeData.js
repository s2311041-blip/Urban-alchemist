export const TUTORIAL_SCENARIO = [
  {
    speaker: '副市長',
    role: 'システム',
    color: '#90caf9',
    introAttributes: true,
    text: '市長、着任おめでとうございます。この街には、移動・滞在・安全・静けさ——4つの願いが交差しています。',
  },
  {
    speaker: '副市長',
    role: 'システム',
    color: '#90caf9',
    text: '着任早々ですが問題です。駅前の『空き地』をどう整備するかで、市民が揉めています！',
  },
  {
    speaker: '移動',
    role: '通勤・配達員',
    attributeKey: 'link',
    text: '空き地なんてアスファルトで固めて『近道（ショートカット）』にしようぜ！駅までの時間が惜しいんだ！',
  },
  {
    speaker: '静けさ',
    role: '古くからの住民',
    attributeKey: 'livability',
    text: 'とんでもない！抜け道なんかにしたら、自転車がビュンビュン通って騒々しくなるじゃろうが！',
  },
  {
    speaker: '滞在',
    role: 'カフェ店主・若者',
    attributeKey: 'place',
    text: 'じゃあ、ベンチを置いて『みんなの広場』にしましょうよ！夜まで語り明かせるように明るい街灯もつけて！',
  },
  {
    speaker: '静けさ',
    role: '古くからの住民',
    attributeKey: 'livability',
    text: 'やめてくれ！夜中まで若者が騒いで、街灯が眩しくて一睡もできなくなる！',
  },
  {
    speaker: '安全',
    role: '車椅子の住人',
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
    positive: { speaker: '安全', text: '通れる！もう転ぶ心配もない。最高の市長だ！' },
    negative: { speaker: '副市長', text: '…しかし市長、莫大な工事費がかかり、市の財政が大きく圧迫されました…。' }
  },
  detour_path: {
    positive: { speaker: '移動', text: 'スイスイ通れるぜ！最高に効率が良い道だ！' },
    negative: { speaker: '安全・静けさ', text: '自転車が猛スピードで抜け道を通っていく…。\n家の横を人がひっきりなしに通るようになって落ち着かないんじゃが…' }
  },
  sign_info: {
    positive: { speaker: '副市長', text: '予算をほぼ使わずに、行政としての案内（アリバイ作り）を完了しました。' },
    negative: { speaker: '移動・安全', text: '道のど真ん中に看板を立てるな！邪魔で仕方ない！\n足元注意と言われても、この段差は自力では越えられないんです…。' }
  },
  lighting: {
    positive: { speaker: '安全', text: '夜道が明るくなって、安心して帰れるようになりました！' },
    negative: { speaker: '静けさ', text: '防犯灯が眩しすぎる！夜中も昼みたいで一睡もできないぞ！' }
  },
  maintenance: {
    positive: { speaker: '滞在', text: '綺麗になった道端で、ちょっと座って休めるわ。嬉しい！' },
    negative: { speaker: '移動', text: '歩道にベンチなんか置いたら、道幅が狭くてすれ違えないだろうが！' }
  },
  care_point: {
    positive: { speaker: '滞在・安全', text: 'みんなが集まれる最高の居場所ができた！助け合いの輪が広がっている！' },
    negative: { speaker: '静けさ', text: '見知らぬ車が出入りし、若者が夜までたむろしている…。静かな生活を返してくれ！' }
  },
  mobility_support: {
    positive: { speaker: '安全', text: '自力で外出できなかった私たちが、涙を流して喜んでいます！' },
    negative: { speaker: '静けさ・副市長', text: 'ひっきりなしに家の前をバスが通る。排気ガスとエンジン音がうるさいんじゃ！\n素晴らしい施策ですが、維持費が市の財政を猛烈に圧迫し続けています…。' }
  },
  ignore: {
    positive: { speaker: '副市長', text: '市長は予算を節約するため、見て見ぬふりをした…。' },
    negative: { speaker: '住民', text: '私たちの切実な声は、市長には届かないのか！もうこの街には住めない！' }
  },
  transit_link: {
    positive: { speaker: '移動', text: '海列車が開通したぞ！これで島へのアクセスが劇的に良くなる！' },
    negative: { speaker: '副市長', text: '便利ですが、莫大な建設コストが市の財政を直撃しています…。' }
  }
};
