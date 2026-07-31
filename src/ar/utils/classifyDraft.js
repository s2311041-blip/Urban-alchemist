import { NEED_TYPE_CODES } from '../../constants/barrierData';
import { KOTO_PLACE_OPTIONS } from '../constants/kotoArea';

const SCORABLE_TYPES = NEED_TYPE_CODES.filter((t) => t !== 'O');

/** @typedef {'P'|'V'|'I'|'M'|'R'|'S'|'L'|'C'|'O'} NeedTypeCode */

/**
 * 困り型ごとの語彙表。
 * strong=3, medium=2, weak=1 — できるだけ広く包含し、境界語は applyBoundaryRules で排他調整。
 *
 * 「その他 (O)」の自動振り分け:
 * - 8タイプ (P〜C) のいずれもスコアが MIN_SCORE_FOR_CLASS 未満 → O（reason: low_signal）
 * - 記述に「その他」等の明示語 → O（reason: explicit_other）
 * - 8タイプのどれかが勝ったが確信度が低い → その型を提案（確認カードで O に変更可）
 *   ※ 曖昧さだけでは O にはしない（ユーザーが確認カードで選ぶ）
 */
export const NEED_TYPE_LEXICON = {
  P: {
    strong: [
      '段差', '段差が', '段差の', '段差で', '段差あり', '段差有', '段差があ', '段差が高', '段差がきつ',
      'つっかえ', 'つまず', 'つまづ', 'つまずき', 'つまづき', '滑り', '滑る', '滑りやす', '滑った', '滑りそう',
      '歩きにく', '歩けな', '歩行しにく', '歩くのが大変', '歩くのがつら', '歩くのがきつ',
      '通りにく', '通れな', '通りづら', '通過しにく', '通過できな', '通り抜け',
      '狭すぎ', '狭い', 'せまい', '狭すぎる', 'キツい', 'きつい', '窮屈',
      '幅が狭', '通路が狭', '道が狭', '幅員', '幅が足りな',
      '勾配', '急な坂', '急坂', '上り坂', '下り坂', '上がれな', '上れな', '登れな', '下りにく', '下れな',
      '階段', 'ステップ', '段数', '段がある', '数段', '昇降', '昇降口',
      '路面', '舗装', '舗装が', '舗装不良', '穴ぼこ', '穴が', '穴あ', 'ポットホール', 'でこぼこ', 'ガタガタ', '凸', '凹', 'なだらかじゃな',
      '車いすでは上がれ', '車椅子では上がれ', 'ベビーカーでは上がれ', '車いすが通れ', '車椅子が通れ',
      'ベビーカーが通れ', '車いす不可', '車椅子不可', '車いすだと無理', '車椅子だと無理',
      'バリア', 'バリアフリーじゃな', 'バリアフリーでない', 'アクセシブルじゃな',
      '縁石', ' curb', 'カーブ', '路肩', '縁石が高', '縁石段差',
      '石畳', 'レンガ', 'タイル', 'タイルの段', 'ブロック', 'ブロックが',
      '自転車が通りにく', 'チャリが通れ', 'チャリ不可',
    ],
    medium: [
      '歩道', '歩道が', '歩道の', '歩道に', '歩道と', '歩道幅', '歩道の幅',
      '坂道', '坂', '上り', '下り', '段', '段が', '小さな段',
      '障害物', '植木', '植込', 'ポール', '電柱', '標識柱', '自転車が邪魔', '放置自転車', '自転車置',
      '石が', 'えんとつ', '縁石', '手すりがない', '手すりなし', '手摺', '手すり不足',
      '轢', 'はね', '転倒', '転び', 'こけ', 'コケ', '足元', '足元が', '足元の', '足元不良',
      'エレベーターなし', 'エレベーターがない', 'EVなし', 'EVがない', 'エスカレーターのみ',
      'スロープなし', 'スロープがない', '斜路', 'らせん', '曲がり角', '角', '角が',
      '混雑', '人が多くて歩', 'すれ違い', 'すれ違えな', '避けられな',
      '砂利', '砂利道', '土', '泥', 'ぬかる', 'ぬかるみ', '雨の日',
      '縁', '縁に', '端', '端っこ', '端に',
    ],
    weak: [
      '歩く', '歩行', '通る', '通過', '移動しにく', '膝', '腰が', '足腰', '足が', '足に',
      '足取り', '足場', '足場が', '道', '道が', '通路', '通路が', '横断', '横断歩道',
    ],
  },
  L: {
    strong: [
      '行き来', '行き来しにく', '行き来でき', '行き来が', '行き来の',
      '行けな', '行きにく', '行くのが大変', '行くのが遠', '向こうに行け',
      'つながら', 'つながってな', 'つながりがない', '接続', '接続が', '接続不足', '接続されてな',
      '移動手段', '移動手段が', 'アクセス', 'アクセスが', 'アクセス不良', 'アクセスしにく',
      'バスが来', 'バスが少', 'バス停が遠', 'バス停がない', 'バスがない', 'バス本数',
      '路線が', '路線が少', '乗り換え', '乗換', '乗換え', '乗り継',
      'フェリー', '渡船', '渡れな', '渡る手段', '渡る方法', '渡し舟',
      '一方通行', '遠回り', '迂回', '回り道', '遠道', '回る必要',
      '到達しにく', '到達でき', '往来', '移動が不便', '移動しにく', '移動が大変',
      '駐輪場が', '駐輪が', '駐輪不可', '駐車場が', '駐車が', 'Pがない', '自転車置き場', 'シェアサイクル',
      '最寄りが', '最寄り駅', '最寄りの', '最寄が', '駅から遠', 'バス停から遠',
      'シャトル', '送迎', '送迎が', 'デマンド', 'コミュニティバス',
      '橋', '橋が', '橋がない', '橋を渡', '陸橋', '歩道橋', '歩道橋が',
      'トンネルしか', '地下道しか', '唯一のルート',
    ],
    medium: [
      'バス', 'バス停', '駅まで', '駅から', '出口まで', '入口まで', 'ホームまで', '改札まで',
      '遠い', '距離が', 'km', 'キロ', '徒歩', '分かか', '分歩', '分歩く', 'アクセスしにく',
      '乗れな', '降りられ', '乗降', '乗り場', '停留所', '水辺', '運河', '川を渡', '川渡',
      '電車', '電車が', '電車本数', '始発', '終電', 'ダイヤ', '本数',
      '自転車', 'チャリ', 'チャリで', '自転車で', 'サイクリング',
      'タクシー', 'タクシーが', '配車', '配車が',
      '一方', '行き止まり', '行き止', '袋小路', '分断', '分断され',
      '跨', 'また', 'またげ', '跨げ', '跨が', '隔', '隔た',
    ],
    weak: [
      '移動', '行く', '来る', '往復', '通勤', '通学', 'ルート', '経路', '接続',
      '遠', '距離', '移動距離', 'アクセス',
    ],
  },
  I: {
    strong: [
      '迷子', '迷う', '迷い', '迷って', '迷子に', '迷子になる', '迷子になり',
      '分からな', 'わからな', '分かりにく', 'わかりにく', '理解できな',
      '行き方が分', '行き方がわ', '行き方が不明', '行き方が不',
      '案内が', '案内不足', '案内が少', '案内が無', '案内がない', '案内板', '案内板が',
      '看板が', '看板がない', '看板が無', '看板が分', '看板が見', '看板が小',
      '標識が', '標識がない', '標識が無', '標識不足', '標識が少',
      'サインが', 'サイン不足', '表示が', '表示がない', '表示が無', '表示不足', '表示が小',
      '出口が分', '出口がわ', '出口が不明', '出口が見', '出口が分から',
      '入口が分', '入口がわ', '入口が不明', '入口が見',
      '分岐', '分岐点', '分岐が', '方向が分', '方向がわ', '方向が不明',
      '行き先が分', '行き先がわ', '行き先不明', '地図が', '地図がない', '地図が無',
      '誘導', '誘導不足', 'ナビ', 'ナビが', '番線', 'ホーム番号', '番線が',
      'どこに行', 'どこへ行', 'どこに向', 'どこへ向', 'どこから',
      '情報が少', '情報不足', 'サイン不足', 'サインが少',
      '案内表示', '誘導表示', 'ピクト', 'ピクトグラム', 'アイコンが',
      '英語表記', '多言語', '外国語', '英語が', '英語表',
      '複雑', '複雑すぎ', 'ややこし', '入り組', '入り組ん',
    ],
    medium: [
      '看板', '標識', 'サイン', '案内', '表示', '出口', '入口', '案内所', 'インフォ',
      '番号', '番線表示', '案内灯', '誘導灯', '案内板が', '地図', '案内図', 'フロア',
      '階', 'フロア案内', '方向', '行き先', '行先', 'どこ', 'どっち', 'どちら',
      'ルート案内', '経路案内', '動線', '動線が', '動線不明',
      '改札', '改札口', '改札が', 'ホーム', 'ホームが', 'ホームへ',
      '案内人', '案内係', 'スタッフに聞', '聞かないと',
    ],
    weak: [
      '迷', '分かり', 'わかり', '案内', '情報', '指示', '誘導', '不明', '不親切',
    ],
  },
  V: {
    strong: [
      '暗い', '暗すぎ', '暗いです', '暗くて', '暗く', '真っ暗', '薄暗',
      '明るくな', '明るくない', '明るさ', '明るさ不足', '明るさが',
      '照明が', '照明不足', '照明が暗', '照明がない', '照明が無', '照明が足り',
      '灯りが', '灯りがない', '灯り不足', 'ライトが', 'ライトがない', 'ライト不足',
      '明かりが', '明かりがない', '明かり不足',
      '見えな', '見えにく', '見えない', '見づら', '見にく', '見通せ', '見通し',
      '見晴らし', '死角', '死角が', '視認', '視認性', '視界', '視界が', '視界不良',
      '反射', 'まぶし', '眩し', 'まぶしく', 'コントラスト', '影', '影が', '影に',
      '薄暗', '暗がり', '夜道で見', '夜に見', '夜は見', '夕方見', '夕方に見',
      '暗闇', '灯り不足', '街灯が', '街灯がない', '街灯不足', '街灯が少',
      '電灯', '電灯が', '蛍光灯', 'LED',
      '逆光', '背光', 'シルエット', 'シルエットで',
      '色が分', '色がわ', '色が見', '色弱', '色覚',
      'モニター', 'ディスプレイ', '画面が見',
    ],
    medium: [
      '夜', '夜道', '夜間', '夕方', '夕暮', '薄暮', 'トンネル', '地下', '地下道', 'アンダー', '高架下',
      '日陰', '木陰', '視認しにく', '視認不良',
      '暗', '明', '光', '灯', '照度', '照度が', '明度',
      '月', '月明', '月明かり', '日没', '日没後', '日が暮', '日が沈',
      '公園の夜', '路地の夜', '裏道',
      '防犯カメラ', '監視カメラ', 'ライト',
    ],
    weak: [
      '見', '視', '光', '明', '暗', '灯', '照', '輝', '点',
    ],
  },
  M: {
    strong: [
      '汚い', '汚れ', '汚れて', '汚く', 'キタナ', 'きたな', '不潔',
      'ゴミ', 'ごみ', 'ゴミが', 'ごみが', 'ゴミ散乱', 'ごみ散乱', ' litter', 'ポイ捨て',
      '荒れ', '荒れて', '荒れ果', '荒廃', '放置', '放置され', '放置物',
      '草むら', '雑草', '草が', '草生', '草刈', '草刈り', '刈込', '刈込み',
      '清掃', '掃除', '清掃不足', '掃除不足', '清掃されてな', '掃除されてな',
      'メンテ', 'メンテナンス', '維持', '維持管理', '管理', '管理不足', '管理が行',
      '破損', '壊れ', '壊れて', '破れ', '錆', '錆び', '剥がれ', '剥が', '老朽', '老朽化', '老い',
      '臭い', '匂い', '異臭', '臭う', '臭く', '悪臭', '生ゴミ',
      '騒音', 'うるさ', '騒がし', '音が', '音が大', '騒音が',
      '暑い', '蒸し', 'ムシムシ', '熱中症', '日射', '照り返し',
      '雨漏', '水たまり', '水溜', '浸水', '冠水', 'カビ', 'カビが', '湿', '湿っぽ', 'ジメジメ',
      '害虫', 'ネズミ', '鳩', 'ハト', 'カラス', '虫', '蚊', 'ゴキ',
      'タバコ', '吸殻', '吸い殻', 'ペット', '犬のフン', '尿', '野犬',
      '塗装', '塗装剥', 'ペンキ', '落書', '落書き', 'グラフィティ', 'シール', '張り紙',
      '看板倒', 'フェンス倒', '倒木', '枝', '枝が',
    ],
    medium: [
      '汚', 'ゴミ箱', 'ごみ箱', '清潔', '不衛生', '散らか', '散らかっ', '雑然', '荒', '草',
      '舗装が剥', 'タイルが', 'フェンスが', '手入れ', '手入れ不足', '管理が行',
      'メンテ不足', '修繕', '修繕不足', '補修', '補修不足', '更新', '更新不足',
      '枯れ', '枯れ木', '落ち葉', '落葉',
      '埃', 'ほこり', 'ホコリ', '泥', '泥だら', '油', '油汚',
      '風', '風で', '砂', '砂埃', '排気', '排気ガス', '煙',
    ],
    weak: [
      '環境', '状態', '整備', '維持管理', '景観', '美化', '美観', '衛生', '清掃',
    ],
  },
  R: {
    strong: [
      '休めな', '休みにく', '休む場', '休む所', '休む場所',
      '休憩', '休憩所', '休憩場', '休憩スペース', '休憩でき',
      'ベンチ', 'ベンチが', 'ベンチがない', 'ベンチが無', 'ベンチ不足', 'ベンチが少',
      '椅子', '椅子が', '椅子がない', '椅子が無', '椅子不足',
      '座れ', '座る場', '座る所', '座る場所', '座れな', '座り', '座って',
      '待てな', '待ちにく', '待てない', '待合', '待合室', '待合所', '待合スペース',
      '待つ場', '待つ所', '待つ場所', '待ち場',
      '腰', '腰が', '腰を', '立ちっぱなし', '立ち疲', '立ち続',
      '日陰が', '木陰が', ' shade', 'シェード', '日よけ', '日除', '日除け',
      '屋根が', '雨宿り', '雨宿', '雨避', '雨避け', '雨よけ',
      'トイレ', 'トイレが', 'トイレがない', 'トイレが遠', '便所',
      '給水', '水飲み', '水飲み場', '自動販売', '自販機',
      'テーブル', 'テーブルが', 'テーブルがない',
    ],
    medium: [
      '休', '座', '待', '腰を', '足を休', '一休み',
      'イス', 'いす', '腰掛', '腰かけ', 'ストラップ', 'ストラップが',
      '日陰', '木陰', '影', '涼', '暑くて休', '疲れ', '疲れた',
      'ベビー', '授乳', '授乳室', 'おむつ', 'おむつ替', '多目的',
      '車いすスペース', '車椅子スペース',
      'シェルター', 'パーゴラ', 'あずま', '東屋', '亭',
    ],
    weak: [
      '疲', '長時間', 'しばらく', '待ち時間', '待ち', '一息',
    ],
  },
  S: {
    strong: [
      '怖い', 'こわい', '怖く', 'こわく', '恐い', '恐ろし',
      '不安', '不安感', '心細', '心細い', '孤独', '孤独感',
      '一人', 'ひとり', '独り', '一人ぼ', '一人ぼっち', '薄気味', '薄気味悪',
      '不気味', '不気味な', '人通りが少', '人通りがない', '人通り少',
      '誰もいな', '誰もおら', '誰もいない', '静かすぎ', '静かすぎる',
      '犯罪', 'ハラスメント', 'つきまと', 'ストーカー', '痴漢', 'ちかん', 'ぼったくり', '怪しい',
      '安心できな', '安心感', '落ち着かな', '落ち着かない', '居心地', '居心地が悪',
      '雰囲気が', '雰囲気が悪', '雰囲気が怖', '雰囲気が不安',
      '夜道が怖', '夜一人', '夜に一人', '夜ひとり', '夜道一人', '夜道ひとり',
      '女性一人', '女性ひとり', '子供一人', '子ども一人',
      'スリ', '盗', '盗まれ', '襲', '襲わ', '暴行', '暴言',
      '監視不足', '防犯不足', '防犯カメラがない',
    ],
    medium: [
      '怖', '心配', '恐', '孤独', '寂', '寂し', '薄暗い雰囲気', '人が少', '人がいな', '人が少な',
      '監視', '防犯', '安全', '安全でな', '安全じゃな', '安心', '居づら', '入りにく', '入るのが',
      '気配', '気配が', '不穏', '違和感', '違和', '毛骨', 'ゾッ',
      '夜', '夜道', '夜間', '夕方', '夕方一人', '薄暮',
      'パトロール', '見回り', '見回りが',
    ],
    weak: [
      '気配', '雰囲気', '夜', '一人暮らし', '心',
    ],
  },
  C: {
    strong: [
      '頼れな', '頼れる', '頼れ', '頼り', '頼りに',
      '助け', '助けを', '助けて', '助けを呼', '助けを求', '助けてくれ',
      '支援', '支援が', '支援不足', '支援体制', 'サポート', 'サポートが', 'サポート不足',
      '見守り', '見守', '見守り不足', '見守り体制', '見守りが',
      '相談', '相談先', '相談窓口', '相談できる', '相談でき',
      '救急', 'SOS', 'コール', '緊急', '緊急時', '119', '110',
      '誰も助', 'スタッフがいな', 'スタッフがいない', '店員がいな', '店員がいない', '係がいな', '係員',
      '人に聞', '聞けな', '聞けない', '聞く人',
      '頼れる場', '頼れる人', '頼れる場所', '頼れる相手',
      '介助', '付き添い', '付添', '付添い', '付き添',
      'AED', 'aed', 'aedが', 'aedがない',
      '防犯ボックス', '非常ベル', '非常ボタン', 'コールボタン',
      'インターホン', '呼び出し', '呼出', '呼び出',
      '地域の人', '近所', '近所の人', '近所付',
      'ボランティア', '民生', '民生委員', '自治会', '町内会',
      '通訳', '通訳が', '多言語対応', '外国語対応',
    ],
    medium: [
      '頼', '助', '支援', '相談', '見守', '付添', '介護', 'ボランティア', '地域',
      '防犯ボックス', 'インターホン', '呼び出し',
      '孤立', '孤立し', '孤立感', '一人きり', '独り',
      '対応', '対応して', '対応でき', '対応が',
      '窓口', '窓口が', '窓口がない', '受付', '受付が', '受付がいな',
      '案内所', '案内所が', 'インフォ', 'インフォメーション',
      '防災', '防災無線', '防災放送',
    ],
    weak: [
      '困', '孤立', '一人で対応', '対応でき', '助け', '支援',
    ],
  },
  O: {
    strong: [
      'その他', 'どれにも当てはまら', '当てはまらな', '分類できな', '該当なし', '特にない',
      '言いにく', '説明しにく', 'うまく説明', '言語化',
    ],
    medium: [
      'なんとなく', 'よくわから', 'よく分から', 'モヤモヤ', '微妙', '複合', 'いろいろ',
      '混在', '混ざ', '両方', 'どちらも',
    ],
    weak: [],
  },
};

const PLACE_LEXICON = {
  station: ['駅', '改札', 'ホーム', '電車', '乗り換え', '駅構内', '駅ビル', '駅前改札', '駅前', '駅ナカ', '駅中', 'プラット'],
  plaza: ['広場', '駅前広', '噴水', 'イベント広', 'コンコース', 'ペデスト', '歩行者空間'],
  bus_stop: ['バス停', 'バス乗', 'バスのり', '停留所', 'バス待', 'バスターミナル', 'バスセンター'],
  waterfront: ['水辺', '運河', '川', '河', '海', '桟橋', '護岸', '遊歩道', '河川', '河岸', '堤', '水門'],
  road: ['歩道', '道路', '横断', '交差点', '信号', '車道', '歩行者', '歩行者天国', '大通り', '車線', '横断歩道', '踏切'],
  commerce: ['商店', '店', '商業', 'ショップ', 'デパ', 'スーパ', 'コンビニ', '商店街', '店舗', 'モール', 'アーケード', 'マーケット'],
  park: ['公園', '緑地', '芝生', '遊具', '花壇', '広場緑', '遊園', '児童公園'],
  lane: ['路地', '裏道', '細道', '住宅', '住宅街', '横丁', ' alley', '弄', '小道', '私道'],
};

const WEIGHT = { strong: 3, medium: 2, weak: 1 };

const MIN_SCORE_FOR_CLASS = 2;
const LOW_CONFIDENCE_MARGIN = 1;

/** @param {string} text */
export function normalizeClassifyText(text = '') {
  return String(text)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, '');
}

/** @param {string} text @param {Record<string, { strong?: string[], medium?: string[], weak?: string[] }>} lexicon */
function scoreFromLexicon(text, lexicon) {
  /** @type {Record<string, number>} */
  const scores = {};
  Object.entries(lexicon).forEach(([type, tiers]) => {
    let total = 0;
    Object.entries(tiers).forEach(([tier, words]) => {
      const w = WEIGHT[tier] ?? 1;
      (words ?? []).forEach((word) => {
        if (text.includes(normalizeClassifyText(word))) {
          total += w;
        }
      });
    });
    scores[type] = total;
  });
  return scores;
}

/**
 * 境界が曖昧なペアを、排他的な手がかりで再調整する。
 * @param {Record<string, number>} scores
 * @param {string} text
 */
function applyBoundaryRules(scores, text) {
  const s = { ...scores };

  if (s.P > 0 && s.L > 0) {
    if (/段差|狭|歩|段|階段|つまづ|路面|舗装|勾配|上がれ|下り|通りづら|歩きにく/.test(text)) s.L -= 2;
    if (/行き来|つなが|接続|バス|フェリー|渡れ|アクセス|遠回り|迂回|到達|移動手段|一方通行|最寄|駅まで|バス停まで/.test(text)) s.P -= 2;
    if (/ここ|この場|その場|足元|この道|この歩道/.test(text)) s.L -= 1;
    if (/まで|から|行き来|Aから|Bまで|駅まで|バス停まで/.test(text)) s.P -= 1;
  }

  if (s.V > 0 && s.I > 0) {
    if (/暗|見え|照明|灯|死角|視認|視界|明る/.test(text)) s.I -= 2;
    if (/迷|分から|わから|案内|看板|標識|出口|分岐|行き方|番線|地図/.test(text)) s.V -= 2;
  }

  if (s.V > 0 && s.S > 0) {
    if (/暗|見え|照明|灯|死角|視認|視界|見通し/.test(text)) s.S -= 2;
    if (/怖|不安|人通り|雰囲気|一人|ひとり|孤独|心細|不気味/.test(text)) s.V -= 2;
    if (/暗い.*怖|怖.*暗/.test(text)) {
      s.V += 1;
      s.S += 1;
    }
  }

  if (s.S > 0 && s.C > 0) {
    if (/怖|不安|雰囲気|一人|心細|不気味|人通り/.test(text)) s.C -= 2;
    if (/助|支援|見守|相談|頼|救急|スタッフ|店員|SOS|AED|窓口/.test(text)) s.S -= 2;
  }

  if (s.R > 0 && s.M > 0) {
    if (/ベンチ|座|待|休憩|休め|腰|立ち|トイレ|授乳/.test(text)) s.M -= 2;
    if (/汚|ゴミ|荒|清掃|維持|臭|破損|草|騒音/.test(text)) s.R -= 2;
  }

  if (s.P > 0 && s.I > 0) {
    if (/段差|狭|歩|路面|階段|つまづ|勾配/.test(text)) s.I -= 2;
    if (/迷|案内|看板|標識|分岐|出口|行き方/.test(text)) s.P -= 2;
  }

  if (s.P > 0 && s.V > 0) {
    if (/見え|暗|照明|灯|死角|視認|視界/.test(text)) s.P -= 2;
    if (/段差|狭|歩|段|階段|つまづ|路面|舗装|勾配|足元/.test(text)) s.V -= 1;
  }

  SCORABLE_TYPES.forEach((t) => {
    if (s[t] < 0) s[t] = 0;
  });
  return s;
}

/** @param {Record<string, number>} scores @param {string} text @param {{ type: string, score: number }[]} ranked */
function resolveTieBreak(scores, text, ranked) {
  const topScore = ranked[0]?.score ?? 0;
  const tied = ranked.filter((r) => r.score === topScore && r.score > 0);
  if (tied.length <= 1) return ranked[0]?.type ?? 'O';

  const types = new Set(tied.map((t) => t.type));

  if (types.has('V') && types.has('P') && /見え|暗|照明|灯|死角|視認/.test(text)) return 'V';
  if (types.has('V') && types.has('S') && /見え|暗|照明|死角/.test(text)) return 'V';
  if (types.has('V') && types.has('S') && /怖|不安|一人|雰囲気/.test(text) && !/見え|暗|照明/.test(text)) return 'S';
  if (types.has('V') && types.has('I') && /見え|暗|照明/.test(text)) return 'V';
  if (types.has('I') && types.has('V') && /迷|案内|看板|分岐|行き方/.test(text)) return 'I';
  if (types.has('L') && types.has('P') && /行き来|つなが|バス|渡|アクセス|まで|から|最寄/.test(text)) return 'L';
  if (types.has('R') && types.has('M') && /ベンチ|座|待|休|トイレ/.test(text)) return 'R';
  if (types.has('S') && types.has('C') && /怖|不安|一人|雰囲気/.test(text)) return 'S';
  if (types.has('C') && types.has('S') && /助|支援|見守|相談|頼|AED|窓口/.test(text)) return 'C';

  return tied[0].type;
}

/** @param {Record<string, number>} scores */
function pickWinner(scores, text = '') {
  const ranked = SCORABLE_TYPES
    .map((type) => ({ type, score: scores[type] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  const second = ranked[1] ?? { type: 'O', score: 0 };

  if (!top || top.score < MIN_SCORE_FOR_CLASS) {
    return {
      needType: /** @type {NeedTypeCode} */ ('O'),
      confidence: top?.score ? 0.35 : 0.2,
      ranked,
      reason: 'low_signal',
    };
  }

  let winnerType = top.type;
  const margin = top.score - second.score;
  if (margin <= LOW_CONFIDENCE_MARGIN && second.score > 0) {
    winnerType = resolveTieBreak(scores, text, ranked);
  }

  const winnerScore = scores[winnerType] ?? top.score;
  const rival = ranked.find((r) => r.type !== winnerType && r.score > 0) ?? second;

  if (margin <= LOW_CONFIDENCE_MARGIN && rival.score > 0) {
    return {
      needType: /** @type {NeedTypeCode} */ (winnerType),
      confidence: Math.min(0.72, winnerScore / (winnerScore + rival.score + 2)),
      ranked,
      ambiguous: true,
      rivalType: rival.type,
    };
  }

  return {
    needType: /** @type {NeedTypeCode} */ (winnerType),
    confidence: Math.min(0.95, winnerScore / (winnerScore + rival.score + 1)),
    ranked,
  };
}

/**
 * @param {string} text
 * @returns {{ placeArchetype: string|null, placeSource: 'keyword'|'none' }}
 */
export function inferPlaceFromText(text = '') {
  const normalized = normalizeClassifyText(text);
  /** @type {{ id: string, score: number }[]} */
  const hits = [];
  Object.entries(PLACE_LEXICON).forEach(([id, words]) => {
    let score = 0;
    words.forEach((word) => {
      if (normalized.includes(normalizeClassifyText(word))) score += 1;
    });
    if (score > 0) hits.push({ id, score });
  });
  hits.sort((a, b) => b.score - a.score);
  if (!hits.length) return { placeArchetype: null, placeSource: 'none' };
  return { placeArchetype: hits[0].id, placeSource: 'keyword' };
}

/**
 * 自由記述 + 任意メタから needType を推定する。
 * @param {object} draft
 * @param {string} [draft.comment]
 * @param {string|null} [draft.placeArchetype]
 * @param {string[]} [draft.affectedGroups]
 * @param {string} [draft.affectedOther]
 */
export function classifyDraft(draft = {}) {
  const parts = [
    draft.comment ?? '',
    ...(draft.affectedGroups ?? []),
    draft.affectedOther ?? '',
  ];
  const rawText = parts.join(' ');
  const text = normalizeClassifyText(rawText);

  let scores = scoreFromLexicon(text, NEED_TYPE_LEXICON);
  scores = applyBoundaryRules(scores, text);

  if ((scores.O ?? 0) >= 3) {
    return buildResult({
      needType: 'O',
      confidence: 0.85,
      scores,
      draft,
      rawText,
      reason: 'explicit_other',
    });
  }

  const winner = pickWinner(scores, text);
  const { needType, confidence, ranked, ambiguous, rivalType } = winner;

  return buildResult({
    needType,
    confidence,
    scores,
    draft,
    rawText,
    ranked,
    ambiguous,
    rivalType,
    reason: needType === 'O' ? (winner.reason ?? 'low_signal') : 'keyword',
  });
}

function buildResult({
  needType,
  confidence,
  scores,
  draft,
  rawText,
  ranked = [],
  ambiguous = false,
  rivalType = null,
  reason = 'keyword',
}) {
  const placeFromUser = draft.placeArchetype ?? null;
  const placeFromDraftText = draft.placeText
    ? inferPlaceFromText(draft.placeText)
    : { placeArchetype: null, placeSource: 'none' };
  const inferred = inferPlaceFromText(rawText);
  const placeArchetype = placeFromUser
    ?? placeFromDraftText.placeArchetype
    ?? inferred.placeArchetype;
  const placeSource = placeFromUser
    ? 'user'
    : (placeFromDraftText.placeArchetype ? 'keyword' : inferred.placeSource);

  /** @type {Record<string, number>} */
  const needTypeScores = {};
  NEED_TYPE_CODES.forEach((t) => {
    needTypeScores[t] = scores[t] ?? 0;
  });

  return {
    needType,
    confidence: Number(confidence.toFixed(2)),
    needTypeScores,
    ranked: ranked.slice(0, 3),
    ambiguous,
    rivalType,
    reason,
    placeArchetype,
    placeSource,
    classification: {
      status: 'auto_proposed',
      confidence: Number(confidence.toFixed(2)),
      needTypeScores,
      placeSource,
      reason,
      ambiguous,
      rivalType,
    },
  };
}

/** 確認カード用 — 全 needType の表示順 */
export function getNeedTypeOptionsForConfirm() {
  return NEED_TYPE_CODES;
}

export function getPlaceLabel(placeArchetype) {
  const opt = KOTO_PLACE_OPTIONS.find((o) => o.id === placeArchetype);
  return opt?.label ?? '未選択';
}
