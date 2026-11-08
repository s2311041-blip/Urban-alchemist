/** needType × planId ごとの文脈別 UI テキスト */

const CONTEXT = {
  P: {
    hard_fix: {
      label: '段差や路面の平滑化、道幅を広げる',
      description: '道を広げて段差をなくす。休む場所は減り、通りは速くなって騒がしくなる。予算も多く使う。',
      tradeoff: '誰もが通りやすく安全になるが、ベンチの余地が消え、静けさも落ちる。予算も大きく減る。',
    },
    detour_path: {
      label: '危険な箇所を避ける迂回ルートを作る',
      description: '直さずに通れる道を確保する妥協案。',
      tradeoff: '予算は抑えられるが、車椅子などに遠回りを強い、安全の不満が残る。',
    },
    sign_info: {
      label: '「足元注意・狭小注意」等の立て看板を置く',
      description: '行政のアリバイ。看板自体が歩く場所の障害物になる。',
      tradeoff: '予算は浮くが、看板が移動を大きく妨げ、安全も下がる。',
    },
  },
  L: {
    mobility_support: {
      label: 'コミュニティバスなど移動支援を導入する',
      description: '移動は楽になる高コスト施策。スロープや車両が、休む空間を占有する。',
      tradeoff: '移動と安全は大きく上がるが、設備が滞在場所を圧迫し、騒音で静けさも落ちる。',
    },
    detour_path: {
      label: '敷地を貫通する新たな近道を作る',
      description: '歩行者用ショートカット。',
      tradeoff: '移動は便利になるが、通り抜けで憩いと静けさが失われる。',
    },
    sign_info: {
      label: '迂回路や行き止まりの案内看板を立てる',
      description: '距離は縮まらない案内のみ。看板は景観のノイズになる。',
      tradeoff: '長距離を歩けない人は置いたままで、看板が静けさを大きく損なう。',
    },
  },
  I: {
    sign_info: {
      label: '分かりやすい大型案内看板・サインを設置する',
      description: '迷いには効く案内。大型の看板は静けさと景観を損なう。',
      tradeoff: '迷いは減るが、大型看板が静けさを大きく下げ、安全も少し下がる。',
    },
    maintenance: {
      label: '見通しのため植え込みを撤去し、管理しやすい空間にする',
      description: '死角になる緑を減らし、管理しやすい無機質な空間にする。',
      tradeoff: '迷いにくくなるが、緑などの潤いが減り無機質になる。',
    },
    care_point: {
      label: '人が集まって案内できる場所をつくる',
      description: '広場やカフェのように人が集まり、迷った人に声がかかる。',
      tradeoff: '交流も生まれるが、人が集まり周辺が混雑して静けさが下がる。',
    },
  },
  R: {
    care_point: {
      label: '集まれる休憩場所（広場・カフェ等）をつくる',
      description: '誰もが立ち寄って休める憩いの場。',
      tradeoff: '滞在は最高だが、話し声で近隣の静けさと衝突する。',
    },
    maintenance: {
      label: '道端に簡易なベンチを置き歩道を整える',
      description: '予算を抑えた休憩スペース。',
      tradeoff: '休める場所は増えるが、歩道が狭くなり移動が圧迫される。',
    },
    sign_info: {
      label: '「最寄りの休憩所は〇m先」の案内看板',
      description: '遠くの公園へ誘導するだけ。看板が歩く場所の邪魔になる。',
      tradeoff: 'これ以上歩けない人には届かず、看板が移動を大きく妨げる。',
    },
  },
  V: {
    lighting: {
      label: '街灯を大幅に増設し夜間の視認性を高める',
      description: '暗さ対策の本命。',
      tradeoff: '安全は上がるが、光害で近隣の静けさが損なわれる。',
    },
    care_point: {
      label: '人が集まる場所をつくり、にぎわいで夜の不安を和らげる',
      description: '人が留まることで、暗がりの不安が和らぐ。',
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
      label: '管理しやすい無機質な空間にする',
      description: '植え込みやベンチを減らし、清掃しやすい場所にする。人は留まりにくくなる。',
      tradeoff: '管理と静けさは楽になるが、休める機能が大きく失われる。',
    },
    hard_fix: {
      label: '壊れた箇所・路面の剥がれを物理的に塞ぎ直す',
      description: '応急処置の補修。',
      tradeoff: '転倒リスクは下がるが、美観・滞在は向上しない。',
    },
    sign_info: {
      label: '「ポイ捨て禁止・マナー向上」の立て看板',
      description: '呼びかけだけで荒れは残る。看板が道と景観の邪魔になる。',
      tradeoff: '実効性は薄いまま、移動と静けさが大きく下がる。',
    },
  },
  S: {
    care_point: {
      label: '人が集まる場所（広場・カフェ等）をつくる',
      description: '人が自然に集まることで、安心が生まれる。',
      tradeoff: '安心は増すが、話し声や出入りで閑静な住環境にノイズが生じる。',
    },
    lighting: {
      label: '防犯照明を増やし死角をなくす',
      description: '明るさで恐怖感を和らげる。',
      tradeoff: '安心は増すが、光害で近隣の睡眠を妨げる。',
    },
    sign_info: {
      label: '「防犯カメラ作動中」の警告看板・ダミーカメラ',
      description: '抑止の看板。道の邪魔になり、圧迫感で静けさも下がる。',
      tradeoff: '安全は少し上がるが、看板が移動を妨げ、圧迫感で静けさと滞在が下がる。',
    },
  },
  C: {
    care_point: {
      label: '気軽に集まれる相談の場所（広場・カフェ等）をつくる',
      description: '困ったときに人と話せる居場所。',
      tradeoff: '交流は生まれるが、近隣からの反発で静けさが下がる。',
    },
    mobility_support: {
      label: '外出支援サービスを手配する',
      description: '外出の手段は増える。車両や設備が、留まれる場所を圧迫する。',
      tradeoff: '外出と安全は増えるが、空間の占有で滞在が減り、維持費もかかる。',
    },
    sign_info: {
      label: '行政相談窓口の連絡先看板を置く',
      description: '届かない人もいる案内。看板が歩く場所の邪魔になる。',
      tradeoff: '電話が難しい人には届かず、看板が移動を大きく妨げる。',
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
