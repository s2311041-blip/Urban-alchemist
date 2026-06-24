# Phase 9 実装計画 — 海・離島・フェリー（交通接続）

| 項目 | 内容 |
|------|------|
| 対象 | Urban Alchemist — 海を「見た目」から「移動・解決手段」へ |
| 前提 | Phase 8 バリアフリー基盤（scale / needType / プラン判定）が稼働していること |
| 目的 | 離島・海溝を舞台に **Line スケールの交通課題** を解けるようにし、`needType: L`（行き来しにくい）の体験を完成させる |
| 成果物 | フェリー停・離島生成・`transit_link` 判定・乗船 UX |
| 更新日 | 2026-05-23 |

---

## 0. エグゼクティブサマリー

Phase 8 までで「一点・動線・周辺エリア」のバリア判定と建築解決は揃った。  
Phase 9 は **海という「物理的な断絶」** をゲーム世界に導入し、建築だけでは届かない距離を **ソフトな交通手段（フェリー）** でつなぐ。

| 現状 | Phase 9 後 |
|------|------------|
| 海は `Ocean` 平面の背景のみ | 海は「渡れない領域」。離島との間は交通インフラが必要 |
| 島拡張はメイン島周辺のリング状チャンク | **離島チャンク** が別座標に出現（視覚的にも「新大陸」） |
| `line_step_gap` は `hard_fix` / `detour_path` のみ | **`transit_link`（海列車・フェリー）** で Line 課題を解決可能 |
| ホバーボードは `hoverboard_station` で乗降 | 同パターンで **フェリー乗り場** を実装 |

**MVP の一言**: 「バグ解決で離島が浮上 → フェリー停を2点配置 → 乗って渡れる → Line バグを `transit_link` でクリア」

---

## 1. なぜ Phase 9 か — 設計上の位置づけ

### 1.1 ゲーム目的との接続

`docs/01_ゲームの目的.md` の「まちを拡張する」は、Phase 8 まで **隣接チャンクの増殖** で表現されていた。  
Phase 9 では拡張の意味を広げ、**「海の向こうにもまちがある」** という都市計画の比喩（多核都市・離島開発・アクセス格差）を追加する。

### 1.2 Phase 8 との接続（必読）

Phase 8 計画書 §10 より:

| Phase 9 要素 | バリアとの接続 |
|--------------|----------------|
| 離島生成 | 新 bugs に `scale: 'line'`, needType `L` |
| フェリー停車点 | `solutionPlan: 'transit_link'`（factor: soft） |
| 泳ぎ（任意） | Line 近距離オプション。`detour_path` validator 拡張 |

Phase 8 で有効化済みの `line_step_gap`（needType `L`）が **Phase 9 の主な消費者**。  
離島側に配置するバグは「本島と離島を行き来できない」という Line 課題として設計する。

### 1.3 スコープ外（Phase 10 以降）

- リアル航路シミュレーション（潮汐・天候による運休）
- 複数離島チェーン（3島以上のルート最適化）
- 政策・予算 UI（フェリー運賃・補助金）
- 本格的な船舶物理（浮力・衝突）

---

## 2. 現状コードの出発点

| ファイル | 現状 | Phase 9 で触る |
|----------|------|----------------|
| `Environment.jsx` | `Ocean` — 1000×1000 平面、y=-3.5、装飾のみ | 海境界・浅瀬シェーダ（任意） |
| `Island.jsx` / `useGameStore.js` | `islandChunks[]` — 中心 `[0,-0.3,0]` からリング拡張 | `kind: 'remote'` チャンク追加 |
| `Avatar.jsx` | `hoverboard_station` 近傍で E キー乗車 | フェリー乗り場の乗降フロー |
| `Block.jsx` | `hoverboard_station` メッシュあり | `ferry_dock` 形状追加 |
| `barrierData.js` | `line_step_gap` — `hard_fix`, `detour_path` のみ | `transit_link` プラン追加 |
| `barrierValidation.js` | path / shape 近傍判定 | `hasFerryRoute` 追加 |
| `barrierActions.js` | scale 別分岐 | `transit_link` 分岐 |

### 2.1 島チャンクの現行スキーマ

```javascript
{
  id: 'chunk_lvl1_0',
  pos: [10, -0.3, 0],      // ワールド座標
  size: [10, 0.6, 10],
  dropIn: true,            // 浮上演出
  level: 0                 // 省略時は base 扱い
}
```

### 2.2 参考実装 — ホバーボード乗り場

`Avatar.jsx` の E キー + 2m 近傍判定 + `setIsHoverboarding` は、フェリー乗船 UX の **そのまま流用可能なテンプレート**。

---

## 3. コンセプトモデル

### 3.1 世界のレイヤ

```
┌─────────────────────────────────────────┐
│  メイン島（既存 islandChunks, kind: main） │
│  ┌───┐ ┌───┐                            │
│  │   │ │   │  ← バグ解決でリング拡張      │
│  └───┘ └───┘                            │
└─────────────────────────────────────────┘
         ～～ 海（非歩行） ～～
┌─────────────────────────────────────────┐
│  離島 A（kind: remote, linkedTo: main）  │
│  ・Line バグ（行き来しにくい）            │
│  ・フェリー着岸ポイント                   │
└─────────────────────────────────────────┘
```

### 3.2 交通手段の分類（3×3 土台との整合）

| 手段 | factor | 解決プラン | 距離感 |
|------|--------|------------|--------|
| スロープ・歩道整備 | hard | `hard_fix`, `detour_path` | 島内 Line |
| **フェリー・海列車** | **soft** | **`transit_link`** | **島間 Line** |
| ベンチ・案内 | human | `care_point`, `sign_info` | 心理的 |

「建築で橋を架ける」は Phase 9 MVP では **hard_fix の拡張候補** とし、優先度はフェリーの後（工数対効果）。

### 3.3 プレイヤー体験フロー（MVP）

```
1. メイン島でバグを数件解決（既存フロー）
   ↓
2. トリガー条件達成 → 離島が海から浮上（God 視点演出）
   ↓
3. 離島に Line バグ出現（「向こう岸まで行けない」）
   ↓
4. DIY → プラン「海列車（transit_link）」選択
   ↓
5. 本島・離島それぞれに ferry_dock を配置
   ↓
6. 完成 → hasFerryRoute 判定 OK → solved → メイン島も拡張（任意）
   ↓
7. 散歩モードで ferry_dock に近づき E → 乗船 → 着岸（テレポート or 短アニメ）
```

---

## 4. データ設計

### 4.1 islandChunks 拡張

```javascript
{
  id: 'remote_alpha',
  kind: 'main' | 'remote',       // NEW — 省略時 'main'
  pos: [80, -0.3, 40],
  size: [10, 0.6, 10],
  dropIn: true,
  linkedTo: 'center',            // NEW — 接続先チャンク id
  ferryDockHint: [2, 0, -4],     // NEW — 着岸推奨位置（ローカル offset）
  spawnBugType: 'line_step_gap', // NEW — 初回出現バグ（任意）
}
```

**load 互換**: `kind` 未設定 → `'main'`。`linkedTo` 未設定 → 無視。

### 4.2 ferryRoutes（Store 新規）

```javascript
// useGameStore 初期値: []
{
  id: 'route_main_remote_alpha',
  stopIds: ['dock_main_west', 'dock_remote_alpha'],  // ferry_dock block id
  chunkIds: ['center', 'remote_alpha'],
  status: 'active' | 'planned',  // planned = ブロック配置済みだが未接続
}
```

ルートは **フェリー停ブロック 2 点以上** で自動生成する（MVP: 2 点固定）。  
手動で routes を編集する UI は Phase 9 では不要。

### 4.3 placedBlocks — ferry_dock 形状

```javascript
{
  id: 'dock_main_west',
  shape: 'ferry_dock',
  pos: [-45, y, 0],
  rot: [0, Math.PI / 2, 0],
  meta: {
    routeId: 'route_main_remote_alpha',  // 完成時に自動付与
    label: '本島西港',                    // 看板表示用
  },
}
```

### 4.4 barrierData — transit_link 追加

```javascript
// PLAN_META に追加
transit_link: {
  label: '海列車',
  factor: 'soft',
  validator: 'hasFerryRoute',
  hint: '本島と離島の両方にフェリー乗り場を置き、航路をつなげよう',
},

// line_step_gap.allowedPlans に追加
allowedPlans: ['hard_fix', 'detour_path', 'transit_link'],
defaultPlan: 'transit_link',  // 離島バグはデフォルトを交通系に（要: バグごと override）
```

**離島専用バグ** には `defaultPlan: 'transit_link'` を `normalizeBug` または seed 時に付与。

### 4.5 離島出現トリガー

| 案 | 条件 | 採用 |
|----|------|------|
| A | solvedCount >= 3 | ✅ MVP — シンプル |
| B | 特定クエスト完了 | 将来 |
| C | プレイヤーが港ブロックを研究 | 将来 |

```javascript
// useGameStore — finishBuildMode 内または専用関数
const REMOTE_ISLAND_TRIGGER_SOLVED = 3;

function shouldSpawnRemoteIsland(solvedCount, islandChunks) {
  return (
    solvedCount >= REMOTE_ISLAND_TRIGGER_SOLVED &&
    !islandChunks.some((c) => c.kind === 'remote')
  );
}
```

離島座標は **メイン島バウンディングボックス + マージン 30m** の方向に 1 枚（例: `[80, -0.3, 40]`）。

---

## 5. 判定ロジック

### 5.1 hasFerryRoute（barrierValidation.js）

**入力**: `bug`, `placedBlocks`, `ferryRoutes`, `islandChunks`

**MVP 条件（すべて満たす）**:

1. アクティブな `ferryRoutes` が 1 件以上
2. 対象バグの `scale === 'line'`（または `needType === 'L'`）
3. ルートの `stopIds` に紐づく `ferry_dock` が **2 点存在**
4. 各 dock が **異なる kind のチャンク上**（main + remote）に載っている
5. バグ位置から各 dock まで **Line 半径内**（`getRadiusByScale('line')` ≒ 8.1m）に少なくとも 1 停がある

```javascript
export const hasFerryRoute = (bug, ctx) => {
  const { placedBlocks = [], ferryRoutes = [], islandChunks = [] } = ctx;
  const radius = getRadiusByScale(bug.scale ?? 'line');
  const activeRoutes = ferryRoutes.filter((r) => r.status === 'active');
  if (activeRoutes.length === 0) return false;

  return activeRoutes.some((route) => {
    const docks = route.stopIds
      .map((id) => placedBlocks.find((b) => b.id === id && b.shape === 'ferry_dock'))
      .filter(Boolean);
    if (docks.length < 2) return false;

    const chunkKinds = new Set(
      docks.map((d) => getChunkKindAt(d.pos, islandChunks)).filter(Boolean)
    );
    if (!chunkKinds.has('main') || !chunkKinds.has('remote')) return false;

    const nearBug = docks.some((d) => distance2D(bug.pos, d.pos) <= radius);
    return nearBug;
  });
};
```

### 5.2 ルート active 化タイミング

| タイミング | 処理 |
|------------|------|
| `finishBuildMode` 成功時 | `ferry_dock` を走査 → 同一 `routeId` の 2 停が両島にあれば `status: 'active'` |
| load 時 | 上記と同じ再計算（`reconcileFerryRoutes`） |

### 5.3 失敗メッセージ

`barrierData.js` の `PLAN_FAIL_MESSAGE_BY_SCALE` に追加:

```javascript
transit_link: {
  line: 'フェリー乗り場が足りないか、本島と離島を結ぶ航路になっていません',
},
```

---

## 6. 乗船 UX（散歩モード）

### 6.1 MVP: テレポート乗船

ホバーボードと同様:

1. `ferry_dock` から 2.5m 以内
2. **E キー** または画面プロンプト「フェリーに乗る」
3. 同一 `routeId` の **反対側 dock** へアバター位置を移動（y は `getIslandTopYAt`）
4. 0.8 秒間カメラフェード（任意）

### 6.2 演出強化（Phase 9-E 余力）

- 簡易ボート mesh が海面上を Lerp 移動
- 乗船中は入力ロック
- 着岸時に短い揺れ SE

### 6.3 海への落下防止

- アバターが `islandChunks` 外 + 海面下に落ちた場合 → 直近の `ferry_dock` またはスポーン点へリスポawn
- または Rapier の `sensor` で海平面 y < -1 を検知

---

## 7. ファイル構成（新規・変更）

```text
src/
├── constants/
│   ├── barrierData.js              … transit_link, line_step_gap 更新
│   └── seaData.js                  … NEW 離島座標・トリガー定数
├── utils/
│   ├── barrierValidation.js        … hasFerryRoute, getChunkKindAt
│   ├── barrierActions.js           … transit_link 分岐
│   ├── ferryRoutes.js              … NEW reconcileFerryRoutes, pair docks
│   └── terrainPlacement.js         … remote チャンク上の snap 対応確認
├── components/3d/
│   ├── Environment.jsx             … 海境界マーカー（任意）
│   ├── Block.jsx                   … renderFerryDock
│   ├── Avatar.jsx                  … 乗船 E キー
│   ├── Island.jsx                  … remote チャンク見た目差（任意）
│   └── FerryRideOverlay.jsx        … NEW 乗船プロンプト（任意）
├── components/ui/
│   ├── ControlBottomBar.jsx        … ferry_dock パレット（建築モード）
│   └── Overlays.jsx                … transit_link ヒント
├── store/
│   └── useGameStore.js             … ferryRoutes, spawnRemoteIsland, load/save
└── docs/
    ├── 03_ゲームの仕様.md          … islandChunks / ferry スキーマ追記
    └── 11_海・離島・フェリー_実装計画_Phase9.md  … 本書
```

---

## 8. フェーズ分割（スプリント）

### Phase 9-A — 海境界・離島データ基盤（Sprint 1）

1. `seaData.js` — 離島座標・トリガー定数
2. `islandChunks` に `kind` / `linkedTo` 追加 + load 互換
3. `spawnRemoteIsland()` — solvedCount 条件で remote チャンク 1 枚追加
4. God 視点浮上演出（既存 `dropIn` 流用）
5. 離島出現時に `line_step_gap` バグ 1 件 spawn

**完了条件**: 3 バグ解決後、離島が浮上し、離島上に Line バグが見える

### Phase 9-B — フェリー乗り場ブロック（Sprint 2）

6. `ferry_dock` 形状（Block.jsx — `hoverboard_station` ベース）
7. 建築パレットに「フェリー乗り場」追加
8. `ferryRoutes` store + save/load + `reconcileFerryRoutes`
9. dock 配置時に `routeId` 自動割当（最初の 1 停 = planned、2 停目でペアリング）

**完了条件**: 本島・離島に dock を置ける。Store に route が記録される

### Phase 9-C — transit_link 判定（Sprint 3）

10. `hasFerryRoute` 実装
11. `barrierData` / `barrierActions` 接続
12. `SolutionPlanPicker` に「海列車」表示（Line バグのみ）
13. 失敗トースト・`getPlanHint` 更新

**完了条件**: 両島に dock → 離島 Line バグを `transit_link` で solved 可能

### Phase 9-D — 乗船 UX（Sprint 4）

14. Avatar 乗船（E キー + 反対岸テレポート）
15. 海落下リスポawn
16. 乗船プロンプト UI（「E: フェリーに乗る」）

**完了条件**: 散歩モードで本島 ↔ 離島を往復できる

### Phase 9-E — 拡張（任意）

17. 乗船アニメーション（ボート Lerp）
18. **泳ぎ** — 海溝幅 < 8m のみ徒渾・速度 0.4x（`detour_path` 的扱い）
19. 橋（`hard_fix` 拡張 — path が海センサ上を 3 マス以上）
20. 複数離島（remote_beta …）

---

## 9. 推奨 PR 構成

| PR | 内容 | スプリント |
|----|------|------------|
| PR-1 | 9-A 離島 spawn + Line バグ + スキーマ | 1 |
| PR-2 | 9-B ferry_dock + ferryRoutes | 2 |
| PR-3 | 9-C transit_link 判定 + UI | 3 |
| PR-4 | 9-D 乗船 UX + 落下防止 | 4 |

**工数目安**: 1人 4〜5 セッション（PR-1: 1, PR-2: 1, PR-3: 1〜2, PR-4: 1）

---

## 10. 受け入れ基準（Phase 9 MVP リリース）

### 世界・データ

- [ ] solvedCount ≥ 3 で **初回のみ** 離島チャンクが出現する
- [ ] 離島に `kind: 'remote'`、`linkedTo` が設定される
- [ ] 旧セーブ load 時、`kind` 未設定チャンクは `main` 扱い
- [ ] `ferryRoutes` が save/load される

### 建築・判定

- [ ] 建築パレットから `ferry_dock` を配置できる
- [ ] 本島・離島に 1 点ずつ dock → `transit_link` で Line バグが solved
- [ ] dock が片方のみ → 完成 NG + プレイヤー向けメッセージ
- [ ] `hard_fix` / `detour_path` も引き続き有効（リグレッションなし）

### プレイ体験

- [ ] 散歩モードで dock 近傍から **E** で反対岸へ移動できる
- [ ] 海に落ちてもゲームオーバーにならずリスポawnする
- [ ] 離島浮上時に God 視点演出が走る

### リグレッション

- [ ] Phase 8 の point バグ（dark / danger / dirty）に影響なし
- [ ] 農業・時間・既存島拡張リングに影響なし
- [ ] ホバーボード乗降が壊れていない

---

## 11. リスクと対策

| リスク | 対策 |
|--------|------|
| 離島が遠すぎてカメラが届かない | 初回出現後にミニマップピン or 「離島が現れた」トースト + 方向矢印 |
| ferry_dock のペアリングミス | `reconcileFerryRoutes` を load / finishBuildMode の両方で実行 |
| Line バグ位置と dock が離れすぎ | 離島バグは `ferryDockHint` 近傍に spawn。半径は playtest で 8m → 10m 調整可 |
| テレポート乗船が味気ない | 9-E でボート演出。MVP はテレポートで十分 |
| Store 肥大化 | `ferryRoutes.js` にロジック集約。Store は状態のみ |
| 物理落ちで Rapier 不安定 | 海面 sensor + 0.5 秒 debounce リスポawn |

---

## 12. Phase 8 / Phase 10 との境界

| 項目 | Phase 8 | Phase 9 | Phase 10 候補 |
|------|---------|---------|---------------|
| Line 判定 | path / slope | + ferry route | 橋・政策 |
| Area 判定 | 半径内 bench 等 | 変更なし | 地区計画 |
| 島拡張 | リング状 adjacent | + remote 離島 | プロシージャル地形 |
| needType L | line_step_gap 型のみ | **交通体験** | MaaS・バス路線 |

---

## 13. 手動テスト checklist

1. 新規開始 → 3 バグ solved → 離島浮上 + God 演出
2. 離島の Line バグタップ → プランに「海列車」が出る
3. dock 0 → 1 → 完成 NG
4. 本島 dock + 離島 dock → `transit_link` 完成 OK → solved
5. 散歩 → 本島 dock で E → 離島着岸
6. 離島 dock で E → 本島着岸
7. 意図的に海へ落下 → リスポawn
8. リロード → remote チャンク・ferryRoutes・solved 維持
9. solvedCount 4 以降 → 離島が **二重出現しない**
10. ホバーボード駅で E → 従来どおり乗車

---

## 14. 参照

- `docs/10_バリアフリー実装計画_Phase8.md` §10 — Phase 9 接続表
- `docs/02_ゲームの概要.md` — 浮島・海の世界観
- `docs/03_ゲームの仕様.md` — bugs / islandChunks スキーマ（実装時に追記）
- `src/components/3d/Avatar.jsx` — ホバーボード乗降パターン
- `src/constants/barrierData.js` — `line_step_gap`, needType `L`
- 講義: 物理 / 制度 / 心理 → フェリーは **soft（制度・サービス）** 解決

---

## 15. 本書の位置づけ

| レイヤ | 本書でカバー | 別途が必要な場合 |
|--------|--------------|------------------|
| 計画・スコープ | ✅ §0–1, 8–9 | — |
| データ構造 | ✅ §4 | ferry_dock mesh 詳細図（任意） |
| 判定ロジック | ✅ §5 | hasFerryRoute 単体テスト |
| 乗船 UX | ✅ §6 | ボートアニメ仕様（9-E） |
| 泳ぎ | 概要のみ §8-E | 入力・スタミナ設計 |

**結論**: Phase 9 MVP は **本書だけで実装着手可能**。泳ぎ・複数離島・橋は 9-E 以降。
