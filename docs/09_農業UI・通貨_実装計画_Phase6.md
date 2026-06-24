# 農業UI・通貨・種まき 実装計画書（Phase 6 一括）

## 文書情報

| 項目 | 内容 |
|------|------|
| 対象 | Phase 5 残タスク + 経済の最小核 + 種まき操作の分離 |
| 前提 | Phase 5-A〜D（昼夜・季節・成長・時間UI）および暫定実装（収穫・更地・Lv） |
| 作成目的 | **5項目を1リリース単位**で実装するためのスコープ・順序・リファクタ方針 |
| 更新方針 | 完了後 `03_ゲームの仕様.md` に `worldTime` / `economy` / `agri` 追記 |

### 今回一括で入れる5項目

| # | 内容 | 現状 |
|---|------|------|
| 1 | **建築モード中も** 時間・農業Lv UI | `TopRightPanel` は `!buildMode` 時のみ表示（`App.jsx` L1283） |
| 2 | **島チャンクの季節色**（控えめ） | 固定 `#aed581` 系（`Island.jsx` L68） |
| 3 | **収穫可能時の視覚FB** | `ripe` 時リング等は一部のみ（`AgriMeshes`） |
| 4 | **収穫→通貨** | 農業Lv/XP のみ。通貨なし |
| 5 | **種まき専用操作** | 更地クリックで `plantAgriBlock`（`MainGameScene`）— パレット操作なし |

---

## 1. 目的

- Phase 5 を**計画上クローズ**しつつ、会話で超過した「収穫ループ」を**意図した Phase 6**として整理する
- 建築中も「時間が進んでいる・農業が育っている」ことが分かる
- 収穫に**通貨報酬**を付け、将来の商業施設（Phase 7）への入口を作る
- **種まき / 収穫**を操作として分離し、誤クリックを減らす

### やらない（今回）

- 商業施設の配置コスト・売上（Phase 7）
- インベントリ・倉庫
- 作物種の大量追加（3農地 shape の `cropId` 固定で開始可）
- 天候・NPC・店舗開閉

---

## 2. 現状コードの整理（出発点）

| 領域 | ファイル | 備考 |
|------|----------|------|
| 時間 | `worldTimeConfig.js`, `dayNight.js`, `WorldTimeTicker.jsx` | 安定 |
| 季節色 | `seasonData.js`, `seasonTint.js` | agri / terrain / nature のみ。島未対応 |
| 成長 | `agriGrowthData.js`, `agriGrowth.js` | phase: fallow〜vanished |
| 収穫 | `useGameStore.harvestAgriBlock` | XP + 更地化 |
| 再植 | `useGameStore.plantAgriBlock` | 通常クリックで更地→planted |
| UI | `TopRightPanel.jsx` | 時間 + 農業Lv + トースト |
| 島 | `Island.jsx` `IslandChunk` | 色ハードコード |
| Store | `useGameStore.js` | **約 1300 行**。農業・時間・建築が同居 |

---

## 3. リファクタリング方針（実装前に着手）

**原則**: 機能追加と同時に「Store 肥大化」を止める。`App.jsx` にはロジックを足さない。

### 3.1 必須（Phase 6 と同 PR で OK）

| 対象 | 問題 | 対策 |
|------|------|------|
| `useGameStore.js` | 農業・時間・経済が1ファイル | **`store/farming/`** にアクション抽出 |
| `harvestAgriBlock` / `plantAgriBlock` | Store 内に報酬計算・トースト | **`utils/farmingActions.js`** に純関数 + 1 アクション |
| `getFarmingNeedXp` | Store 先頭の定数 | **`constants/farmingProgressData.js`** へ |
| `TopRightPanel.jsx` | 視点切替 + 時間 + 農業 + トースト | 分割（下記 UI 節） |
| 更地クリック植え | 操作が暗黙 | **`interactionMode`** で明示 |

### 3.2 推奨（余力があれば同 PR）

| 対象 | 対策 |
|------|------|
| `MainGameScene.jsx` Block `onClick` | `AgriInteractionHandler` コンポーネントへ |
| `farmingToast` + `setTimeout` | `uiToast` 汎用（type, message, ttl） |
| セーブ subscribe | `pickPersistedState(state)` 1 関数に集約 |

### 3.3 触らない（スコープ外）

- `Block.jsx` 全体分割
- Zustand slice 化（ファイル分割だけで十分なら後回し）

---

## 4. 機能設計

### 4.1 建築モード中の HUD（項目1）

**ゴール**: 建築中も右上に「時間 + 農業 + 通貨」が常時見える。

**UI 構成**

```
components/ui/hud/
  GameHud.jsx              … 表示条件の親（buildMode / 通常 共通）
  WorldTimePanel.jsx       … 日付・季節・時間帯・停止・速度
  FarmingStatusPanel.jsx   … Lv / XP / 成長ボーナス
  WalletPanel.jsx          … 通貨残高（4.4 と同時）
  GameToast.jsx            … farmingToast を汎用化
```

**表示条件（案）**

| 状態 | 表示 |
|------|------|
| 建築モード | HUD コンパクト版（視点切替ボタンは非表示 or 小） |
| 通常散歩 | HUD フル + 視点切替 |
| スタジオ / AR / 島拡張演出 | HUD のみ（時間停止表示） |
| `activeBug` オーバーレイ | HUD は背面、操作はオーバーレイ優先 |

**`App.jsx` 変更**

- L1283 の `!store.buildMode` 条件を外し、`GameHud` を **`buildMode` 問わず**マウント
- `TopRightPanel` の視点切替は `viewMode` 用に残すか `GameHud` 内で `!buildMode` 分岐

---

### 4.2 島チャンク季節色・控えめ（項目2）

**ゴール**: 季節で島の芝が**わずか**に変わる（派手な全画面色変えはしない）。

**定数追加** `seasonData.js`

```javascript
islandGrass: [1.0, 1.0, 1.0],  // 春 = 基準
// 夏 [0.98, 1.02, 0.96]
// 秋 [1.03, 0.97, 0.92]
// 冬 [0.94, 0.96, 1.02]
```

**適用** `Island.jsx`

- 基準色 `#aed581`（通常）/ `#dcedc8`（建築）/ `#c5e1a5`（配置中）を維持
- `useGameStore(s => s.worldTime.season)` で `applySeasonTint(base, season, 'islandGrass')`
- **buildMode / isPlacing の明度差はそのまま**（季節は乗算のみ）

**受け入れ基準**

- [ ] 春夏秋冬で島色が**同じ場所を比較して**分かる程度
- [ ] 農地・樹・池より変化は弱い（島は背景）

---

### 4.3 収穫可能時の視覚FB（項目3）

**ゴール**: 散歩中に「収穫できる畑」が一目で分かる。

**3層で実装**

| 層 | 内容 | 実装場所 |
|----|------|----------|
| A. メッシュ | `phase === 'ripe'` で黄金リング + 微パルス emissive | `AgriMeshes.jsx` |
| B. ワールド | 畑上に小さな Html 「🌾 収穫可」 | `AgriHarvestMarker.jsx`（新規） |
| C. カーソル | 通常モード + ripe 上で pointer + ホバー強調 | `MainGameScene` or `AgriInteractionHandler` |

**ルール**

- `fallow` → 土色のみ（作物メッシュなし）
- `withered` → 茶色・萎び（既存）
- `interactionMode === 'harvest'` 時のみクリックで収穫（5. と連動）

**パフォーマンス**

- Html マーカーは `ripe` ブロックのみ（通常数十件以下）
- `useFrame` で全ブロック走査しない

---

### 4.4 収穫→通貨（項目4）

**ゴール**: 収穫成功で **コイン** を得る。セーブ・HUD 表示。

**データ**

```javascript
// constants/economyData.js
export const CURRENCY_ID = 'coin';
export const CURRENCY_LABEL = 'コイン';

export const HARVEST_REWARD = {
  farm_plot:  { base: 3, ripeBonus: 2 },
  rice_paddy: { base: 4, ripeBonus: 2 },
  garden_bed: { base: 2, ripeBonus: 1 },
};

export const FARMING_LEVEL_COIN_BONUS = 0.1; // Lvごと +10%（上限は後で）
```

**Store**

```javascript
economy: {
  coin: 0,
  lifetimeEarned: 0,  // 任意・実績用
},
```

**報酬式（案）**

```
reward = floor((base + ripeBonus) * (1 + (farmingLevel - 1) * 0.1))
```

- `withered` からの収穫は **不可**（現状どおり）
- 枯れて `vanished` 前に収穫しなかった → 機会損失（ゲームテンポ）

**`harvestAgriBlock` 変更**

1. `canHarvest(block)` 判定（純関数）
2. `computeHarvestReward(shape, farmingLevel)`（純関数）
3. Store は結果を apply のみ
4. トースト: `+5 コイン · 収穫！` / LvUp 時は両方

**セーブ**

- `economy` を `SAVE_KEY` JSON に追加
- ロード時欠損 → `{ coin: 0, lifetimeEarned: 0 }`

---

### 4.5 種まき専用操作（項目5）

**ゴール**: 更地への再植えを **「種まきツール」** に限定。通常クリックでは植えない。

**操作モード**

```javascript
interactionMode: 'build' | 'harvest' | 'plant' | null
// build = デフォルト（建築パレット）
// harvest = 収穫のみ
// plant = 種まきのみ（更地対象）
```

**UI**

- 建築パレット「農地」タブにツール行を追加:
  - 🌾 **種まき**（`interactionMode: 'plant'`）
  - ✂️ **収穫**（`interactionMode: 'harvest'`）
  - 🔨 **配置**（従来どおり shape 選択）
- 通常散歩時: 下部に小さな **「種まき」「収穫」** トグル（`MainBottomNav` 付近 or HUD）

**挙動**

| モード | クリック対象 | 結果 |
|--------|--------------|------|
| `plant` | `agri.phase === 'fallow'` | `createInitialAgriState`（**コスト 0** で開始。Phase 7 で種代可） |
| `plant` | それ以外 | 無視 or トースト「更地ではありません」 |
| `harvest` | `harvestable` | 収穫 + コイン + 更地 |
| `harvest` | それ以外 | 無視 |
| 通常 | 農地 | **何もしない**（現 `plantAgriBlock` 削除） |

**種まきコスト（任意・今回は OFF）**

- 将来: `plant` 時に `coin >= seedCost` を消費
- 定数だけ `SEED_COST = 0` で置いておく

---

## 5. ファイル構成（新規・変更）

```
constants/
  economyData.js          … NEW
  farmingProgressData.js  … NEW（getFarmingNeedXp 移動）
  seasonData.js           … islandGrass 追加

utils/
  farmingActions.js       … NEW harvest/plant 純関数
  economy.js              … NEW computeHarvestReward 等

store/
  farming/
    applyHarvest.js       … NEW（Store から呼ぶ）
    applyPlant.js         … NEW

components/ui/hud/
  GameHud.jsx             … NEW
  WorldTimePanel.jsx      … TopRightPanel から分割
  FarmingStatusPanel.jsx
  WalletPanel.jsx
  GameToast.jsx

components/ui/
  AgriToolBar.jsx         … NEW 種まき/収穫トグル（散歩用）
  AgriPalette.jsx         … ツール行追加

components/3d/agri/
  AgriHarvestMarker.jsx   … NEW ripe マーカー
  AgriMeshes.jsx            … ripe ビジュアル強化

components/3d/
  AgriInteractionHandler.jsx … NEW クリック集約
  Island.jsx                … 季節色

store/useGameStore.js       … 薄くする（委譲）
App.jsx                     … GameHud 常時表示
MainGameScene.jsx           … onClick → Handler
docs/03_ゲームの仕様.md     … 追記
```

---

## 6. 推奨実装順（1 PR または 2 PR）

### PR-1: 基盤 + HUD + リファクタ（Sprint 1–2）

1. `farmingProgressData.js` / `farmingActions.js` 抽出
2. `GameHud` 分割、`App.jsx` 常時表示
3. `interactionMode` を Store に追加
4. 更地クリック植えを **削除**（種まきモード待ち）

### PR-2: ゲームプレイ一式（Sprint 3–5）

5. 島 `islandGrass` ティント
6. `AgriMeshes` + `AgriHarvestMarker` 視覚FB
7. `economy` + 収穫報酬 + `WalletPanel`
8. `AgriToolBar` / `AgriPalette` 種まき・収穫ツール
9. `AgriInteractionHandler` 接続
10. `03_ゲームの仕様.md` 追記

**工数目安**: 1人で 2〜3 セッション（PR-1 が半分、PR-2 が半分）

---

## 7. 受け入れ基準（リリース）

### HUD

- [ ] 建築モード中も「第N日 / 季節 / 時間帯 / 農業Lv / コイン」が見える
- [ ] リロード後 `worldTime` / `farmingProgress` / `economy` が復元される

### 島・視覚

- [ ] 季節で島の色が**控えめ**に変わる
- [ ] `ripe` 農地が遠目で分かる（リング or マーカー）
- [ ] `fallow` / `withered` と見分けがつく

### 操作

- [ ] 通常クリックだけでは更地に植わらない
- [ ] **種まきモード**で更地のみ再植えできる
- [ ] **収穫モード**で `ripe` のみ収穫できる
- [ ] 収穫でコインが増え、HUD に反映される

### リファクタ

- [ ] `harvestAgriBlock` の報酬・XP 計算が `farmingActions.js` にある
- [ ] `TopRightPanel` が 200 行未満、または HUD コンポーネントに分割済み

---

## 8. リスクと対策

| リスク | 対策 |
|--------|------|
| 建築UIと HUD が重なる | HUD を右上固定・z-index 調整。建築パネルは右下/下部 |
| 種まき/収穫モード忘れ | モード中はカーソル横に小ラベル「種まき中」 |
| 通貨インフレ | 報酬は小さく開始。商業施設（Phase 7）で sink を用意 |
| Store 分割で regression | 収穫・植え・日跨ぎの手動テスト checklist |
| Html マーカー多すぎ | ripe のみ。距離 culling（drei `distanceFactor`） |

---

## 9. Phase 7 への接続（次の予定）

Phase 6 完了後、自然な次ステップ:

| Phase 7 | 内容 |
|---------|------|
| 7-A | 商業 shape 1種（例: `market_stall`）+ 配置コスト（coin） |
| 7-B | 施設効果（収穫 +15%、成長 +1日 等） |
| 7-C | 種代・肥料（coin sink） |
| 7-D | クエスト連動（「収穫を10回」） |

Phase 6 で **coin の earn ループ**が回れば、Phase 7 は「spend 先」を足すだけになる。

---

## 10. 手動テスト checklist

1. 畑配置 → 時間 x4 → `ripe` 表示確認
2. 収穫モード ON → クリック → 更地 + コイン増 + XP増
3. 種まきモード ON → 更地クリック → `planted` から再成長
4. 通常モード → 更地クリック → **植わらない**
5. `ripe` を放置 → `withered` → `vanished`（ブロック消滅）
6. 建築モード突入 → HUD 表示継続
7. 季節を進めて島色がわずかに変化
8. リロード → coin / Lv / 日付保持

---

## 11. まとめ

- Phase 5 は **HUD・島色・収穫FB** で計画上の穴を埋める
- 会話で先行した **収穫ループ** を Phase 6 として **通貨 + 操作分離** で正式化する
- 実装前に **Store / HUD / farmingActions** を分割しないと、`useGameStore.js` が Phase 7 で破綻しやすい

着手順は **リファクタ（HUD常時表示）→ 操作モード → 通貨 → 視覚FB → 島色** が安全。  
一気にやる場合も、**PR-1 で土台、PR-2 でゲームプレイ** の2段がレビューしやすい。
