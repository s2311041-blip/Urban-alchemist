/** needType × planId ごとの文脈別 UI テキスト */

const CONTEXT = {
  P: {
    hard_fix: {
      label: '段差や路面の平滑化、道幅を広げる',
      description: '物理的バリアを取り除く根本解決。予算を多く使う。',
      tradeoff: '誰もが安全に歩けるが、莫大な予算が吹き飛び、他の課題に回せなくなる。',
    },
    detour_path: {
      label: '危険な箇所を避ける迂回ルートを作る',
      description: '直さずに通れる道を確保する妥協案。',
      tradeoff: '予算は抑えられるが、車椅子などに遠回りを強い、安全の不満が残る。',
    },
    sign_info: {
      label: '「足元注意・狭小注意」等の立て看板を置く',
      description: '行政のアリバイ。看板自体が障害物になりうる。',
      tradeoff: '予算は浮くが、看板が移動と安全の両方を阻害する罠の選択肢。',
    },
  },
  L: {
    mobility_support: {
      label: 'コミュニティバスなど移動支援を導入する',
      description: '孤立を解消する高コスト施策。',
      tradeoff: '移動は劇的に楽になるが、騒音・排気で静かな住環境が損なわれる。',
    },
    detour_path: {
      label: '敷地を貫通する新たな近道を作る',
      description: '歩行者用ショートカット。',
      tradeoff: '移動は便利になるが、通り抜けで憩いと静けさが失われる。',
    },
    sign_info: {
      label: '迂回路や行き止まりの案内看板を立てる',
      description: '距離は縮まらない案内のみ。',
      tradeoff: '自力で長距離移動できない人は放置されたまま。',
    },
  },
  I: {
    sign_info: {
      label: '分かりやすい大型案内看板・サインを設置する',
      description: 'この型だけ看板が有効な解決策になりうる。',
      tradeoff: '迷いは減るが、大型看板が歩行空間の障害物となり安全が下がる。',
    },
    maintenance: {
      label: '視界を遮る障害物を撤去し見通しを良くする',
      description: '空間をスッキリさせる。',
      tradeoff: '迷いにくくなるが、緑などの潤いが減り無機質になる。',
    },
    care_point: {
      label: '有人案内所を作る',
      description: '対面案内で確実に迷子を減らす。',
      tradeoff: '交流も生まれるが、人が集まり周辺が混雑して静けさが下がる。',
    },
  },
  R: {
    care_point: {
      label: '見守り・交流できる休憩拠点を作る',
      description: '誰もが立ち寄れる憩いの場。',
      tradeoff: '滞在は最高だが、話し声で近隣の静けさと衝突する。',
    },
    maintenance: {
      label: '道端に簡易なベンチを置き歩道を整える',
      description: '予算を抑えた休憩スペース。',
      tradeoff: '休める場所は増えるが、歩道が狭くなり移動が圧迫される。',
    },
    sign_info: {
      label: '「最寄りの休憩所は〇m先」の案内看板',
      description: '遠くの公園へ誘導するだけ。',
      tradeoff: '「これ以上歩けない」人には冷たい対応。',
    },
  },
  V: {
    lighting: {
      label: '街灯を大幅に増設し夜間の視認性を高める',
      description: '暗さ対策の本命。',
      tradeoff: '安全は上がるが、光害で近隣の静けさが損なわれる。',
    },
    care_point: {
      label: '人が集まる拠点を置き「人の目」で明るくする',
      description: '防犯と交流の両面。',
      tradeoff: '安心は増すが、深夜のたむろで静けさが大きく下がる。',
    },
    maintenance: {
      label: '見通しを悪くする茂みや壁を撤去・整備する',
      description: '死角を減らす。',
      tradeoff: '安全は上がるが、落ち着いた景観が失われる。',
    },
  },
  M: {
    maintenance: {
      label: '舗装を直し清掃の行き届いた空間を保つ',
      description: '景観と衛生の改善。',
      tradeoff: '大満足だが、維持管理費で予算を使い続ける。',
    },
    hard_fix: {
      label: '壊れた箇所・路面の剥がれを物理的に塞ぎ直す',
      description: '応急処置の補修。',
      tradeoff: '転倒リスクは下がるが、美観・滞在は向上しない。',
    },
    sign_info: {
      label: '「ポイ捨て禁止・マナー向上」の立て看板',
      description: '実効性の薄い呼びかけ。',
      tradeoff: '景観も不満もほとんど変わらない。',
    },
  },
  S: {
    care_point: {
      label: '見守り拠点を設置し常に人の目を置く',
      description: '人による防犯。',
      tradeoff: '安心は増すが、閑静な住環境にノイズが生じる。',
    },
    lighting: {
      label: '防犯照明を増やし死角をなくす',
      description: '明るさで恐怖感を和らげる。',
      tradeoff: '安心は増すが、光害で近隣の睡眠を妨げる。',
    },
    sign_info: {
      label: '「防犯カメラ作動中」の警告看板・ダミーカメラ',
      description: '抑止力のある看板。',
      tradeoff: '安全は少し上がるが、監視されている圧迫感で静けさと滞在が下がる。',
    },
  },
  C: {
    care_point: {
      label: '気軽に相談できる地域の福祉・交流ハブを作る',
      description: '弱者を包摂する理想施策。',
      tradeoff: '交流は生まれるが、近隣からの反発で静けさが下がる。',
    },
    mobility_support: {
      label: '外出支援サービスを手配する',
      description: '孤立の根本解決。',
      tradeoff: '外出機会は増えるが、サービス維持で予算を圧迫する。',
    },
    sign_info: {
      label: '行政相談窓口の連絡先看板を置く',
      description: '届かない人もいる案内。',
      tradeoff: '電話すら困難な弱者には届かないアリバイ。',
    },
  },
};

export function getPlanContextCopy(needType, planId) {
  return CONTEXT[needType]?.[planId] ?? null;
}

export function getPlanContextLabel(needType, planId) {
  return getPlanContextCopy(needType, planId)?.label ?? null;
}

export function getPlanContextDescription(needType, planId) {
  return getPlanContextCopy(needType, planId)?.description ?? null;
}

export function getPlanContextTradeoff(needType, planId) {
  return getPlanContextCopy(needType, planId)?.tradeoff ?? null;
}
