# 時間軸実装計画書（Phase 5-A 〜 5-D）

## 文書情報

| 項目 | 内容 |
|------|------|
| 対象フェーズ | **Phase 5-A**（世界時計・昼夜ライト） / **5-B**（季節ティント） / **5-C**（成長ステージ・見た目） / **5-D**（UI・セーブ・設定） |
| 前提完了 | Phase 1〜2（植物）、Phase 3（農地）、Phase 4（地形・島拡張連動） |
| 作成目的 | 「まちが時間とともに変わる」体験のスコープ固定・段階リリース |
| 更新方針 | 各サブフェーズ完了後に `03_ゲームの仕様.md` へ追記 |
| 詳細設計 | 着手時に **`08_時間軸_詳細設計.md`** を切る（ライト曲線・`agri.stage` メッシュ座標・セーブ移行） |

### スコープ方針（2026-05 合意）

| 時期 | 内容 |
|------|------|
| **5-A（最初）** | ゲーム内時間が進み、空・霧・太陽光が **昼→夕→夜→朝** に変化する |
| **5-B** | 季節（または簡易サイクル）で **農地・地形・植物** の色・見た目が変わる |
| **5-C** | 農地に **成長ステージ（見た目のみ）** — 収穫ゲーム・スコアは入れない |
| **5-D** | 時間コントロール UI、一時停止、速度、セーブ復元 |

---

## 1. 目的と位置づけ

### 1.1 ゲーム上の目的

Urban Alchemist は「まちを歩き、課題を見つけ、建築で直す」体験が核。時間軸は次を足す。

- **暮らしのリズム**：昼は活気、夜は街灯と影 — 「夜道が暗い」バグの文脈と直結
- **景観の変化**：田んぼの青田→黄金色、木の葉色、池の反射 — 同じ島が何度も違って見える
- **農地の物語**：Phase 3 で「置けるだけ」に留めた農地に、**時間が経つと育つ**見え方を足す（ルールは後回し可）
- **拡張の土台**：将来の天候・イベント・クエスト連動（収穫祭など）に `worldTime` を渡せる

### 1.2 本計画でやること / やらないこと

| やる（5-A〜D） | やらない（別フェーズ） |
|----------------|----------------------|
| 単一の **世界時計**（Zustand + セーブ） | マルチプレイ同期・サーバー時刻 |
| **昼夜**による環境光・霧・背景色 | ボリュメトリック雲・天気シミュレーション（雨粒物理） |
| **季節ティント**（色乗算・プリセット） | 葉の個別アニメーション（風で揺れる等） |
| `agri.stage` による **見た目ステージ**（0〜3 程度） | 種まき UI・収穫・インベントリ・経済 |
| 街灯 `light_pole` の **夜間強調**（既存 PointLight） | 全ブロックの PBR マテリアル差し替え |
| 時間 UI（再生/停止/速度/時刻表示） | NPC の生活スケジュール・店の開閉 |

栽培の **ゲームルール**（収穫でスコア、クエスト達成）は **別企画**。Phase 5-C は `04_農地実装計画` の「見た目ステージ」方針を踏襲する。

---

## 2. 現状整理（実装の出発点）

| 領域 | 現状 | Phase 5 で触る箇所 |
|------|------|-------------------|
| ライト | `MainGameScene.jsx` で `ambientLight` + `directionalLight` + `fog` 固定 | 5-A：`DayNightEnvironment` に集約 |
| 背景 | `<color attach="background" />` 固定 `#0a1929` | 5-A：時刻で補間 |
| 街灯 | `Block.jsx` の `light_pole` が常時 PointLight | 5-A：夜のみ強度アップ（昼は弱く or OFF） |
| 植物 | `nature` + `SPECIES`、色は配置時固定 | 5-B：季節ティント（樹冠のみ等） |
| 農地 | `agri.color` のみ | 5-B ティント、5-C `agri.stage` |
| 地形 | `terrain.color` | 5-B：水面・岩の季節色 |
| セーブ | `urban_alchemist_save_v1` に blocks/chunks のみ | 5-D：`worldTime` ルート追加 + ロード時デフォルト |
| バグ例 | 「暗くて危ない」系コメントあり | 5-A 後：夜プレイで体験検証（必須改修ではない） |

**設計原則（Phase 3/4 と同型）**

1. **`App.jsx` に時間ロジックを足さない** — `worldTime/` モジュール + シーン直下コンポーネント
2. **純関数で見た目を決める** — `getDayNightState(t)`, `getSeasonTint(season, domain)` はユニットテスト可能に
3. **ブロックデータは既存フィールドを拡張** — `agri.stage`, `agri.plantedDay` など。`nature` / `terrain` と混在させない
4. **オフライン単体で完結** — ネット不要、localStorage のみ

---

## 3. スコープ定義（サブフェーズ）

### Phase 5-A：昼夜サイクル（必須・最初の PR）

**ゴール**：プレイ中、空と光がゆっくり変化し、「夜になった」と分かる。

| 項目 | 仕様（案） |
|------|------------|
| 時刻表現 | `timeOfDay ∈ [0, 1)` — 0=深夜寄り、0.25=朝、0.5=昼、0.75=夕 |
| 1 ゲーム日 | リアル **6〜10 分**（定数 `REAL_MS_PER_GAME_DAY`、設定で変更可は 5-D） |
| 進行 | 建築モード・TPS どちらでも進む（`paused` 時のみ停止） |
| ライト | 環境光強度、太陽方向、色温度、影の有無（夜は弱シャドウ or OFF） |
| 霧・背景 | `#0a1929` 系から夜は深く、昼はやや明るい青へ補間 |

**受け入れ基準**

- [ ] 60 秒以上放置してもフレーム落ちなく 1 周できる
- [ ] 夕方で影の向きが変わる（太陽 `directionalLight` の position 補間）
- [ ] 夜に街灯だけが目立つ（既存メッシュの変更最小）
- [ ] スタジオ・AR・島拡張演出中は時間停止（`paused` または `timeFrozenReason`）

**やらない（5-A）**

- 季節色、作物メッシュ、UI スライダー（仮表示のみなら可）

---

### Phase 5-B：季節・環境ティント（5-A の次）

**ゴール**：同じブロックでも「春の田」「秋の木」に見える。

| 項目 | 仕様（案） |
|------|------------|
| 季節 | `season ∈ { spring, summer, autumn, winter }` |
| 進行 | `dayIndex` から **4 日 = 1 季節** など簡易サイクル（初版）。のちに `DAYS_PER_SEASON` 定数化 |
| 農地 | `rice_paddy` 水面色、 `farm_plot` 土色 — `agri.color` × `seasonTint` |
| 植物 | `street_tree` / `canopy_tree` の冠色のみ季節オフセット（`SPECIES` は維持） |
| 地形 | `pond_tile` / `stream_tile` の反射っぽい色、滝の白沫量は固定で可 |
| 島 | チャンク grass 色は **全体ティント 1 本**（チャンク個別は後回し） |

**データ（ブロック側・任意）**

```json
"agri": {
  "color": "#4fc3f7",
  "seasonOverride": null
}
```

上書きが `null` なら世界の `season` に従う。

**受け入れ基準**

- [ ] 季節をデバッグコマンド or UI で切替え、1 秒以内に色が変わる
- [ ] セーブ再読み込み後も `dayIndex` / `season` が復元される
- [ ] 農地・地形・植物で **同じ season 定数** を参照（色がバラバラにならない）

---

### Phase 5-C：成長ステージ（見た目のみ）

**ゴール**：畑・菜園に「育っている」読み取りができる。プレイヤー操作は最小。

| 形状 | ステージ案 | 見た目 |
|------|------------|--------|
| `farm_plot` | 0=裸土, 1=芽, 2=中, 3=実り | 畝の上に低ポリ作物 |
| `garden_bed` | 同上（花／野菜で色違いプリセット） | 枠内メッシュ差し替え |
| `rice_paddy` | 0=水面のみ, 1=青苗, 2=黄金 | 水面の上に草ライン（畦は既存） |

**進行ルール（初版・シンプル）**

- 配置時 `agri.plantedDay = worldTime.dayIndex`
- 毎日境界（`dayIndex` 増加）で `stage = min(3, stage + 1)` — **自動成長**
- 後続：建築パレット「種をまく」は **5-C+** または Phase 6

**データ**

```json
"agri": {
  "color": "#8d6e63",
  "stage": 2,
  "plantedDay": 14
}
```

**受け入れ基準**

- [ ] 新規配置は stage 0、3 ゲーム日後に stage 3（定数で調整可）
- [ ] Undo でブロック削除 → 成長状態も消える（既存 Undo スタックに乗る）
- [ ] 成長メッシュは `AgriMeshes` 内のみ — `Block.jsx` を肥大化しない
- [ ] **収穫ボタン・スコア加算なし**

---

### Phase 5-D：UI・設定・セーブ統合

**ゴール**：プレイヤーが時間を「わかる・止められる・速くできる」。

| UI 要素 | 配置案 |
|---------|--------|
| 時刻リング or 太陽アイコン | 右上パネル（`TopRightPanel` 付近） |
| 表示 | `第 N 日` + 小さく `春` + 時刻（朝/昼/夕/夜） |
| 操作 | 一時停止、×1 / ×2 / ×4、（任意）次の朝へスキップ |
| 設定 | メニュー or 初回のみ：「1 日の長さ」プリセット |

**セーブ**

```json
{
  "worldTime": {
    "dayIndex": 12,
    "timeOfDay": 0.42,
    "season": "summer",
    "paused": false,
    "speed": 1
  },
  "placedBlocks": [ ... ],
  "islandChunks": [ ... ]
}
```

- キーは `v1` のまま中身拡張（ロード時 `worldTime` 欠損 → デフォルト生成）
- 既存セーブの `agri` に `stage` が無いブロックは **stage 0 扱い**

**受け入れ基準**

- [ ] リロード後、日付・時刻・速度が一致
- [ ] 建築 Undo とは独立（時間は戻さない — 仕様として明記）
- [ ] `paused` 中は `dayIndex` が進まない

---

## 4. 技術方針

### 4.1 状態管理（Zustand）

```javascript
// useGameStore へ追加（案）
worldTime: {
  dayIndex: 0,
  timeOfDay: 0.35,      // 朝から開始など
  season: 'spring',
  paused: false,
  speed: 1,
},
tickWorldTime: (deltaMs) => { ... },
setWorldTimePaused: (v) => { ... },
setWorldTimeSpeed: (v) => { ... },
skipToNextMorning: () => { ... },
```

- **時間の積算**は `WorldTimeTicker` コンポーネント（`useFrame`）が `tickWorldTime` を呼ぶ
- シーンがアンマウントされてもストアは残る（現状と同じ）

### 4.2 昼夜（5-A）

```
constants/worldTimeConfig.js   … REAL_MS_PER_GAME_DAY, キーフレーム
utils/dayNight.js              … getDayNightState(timeOfDay) → { ambient, sun, fog, bg }
components/3d/environment/
  DayNightEnvironment.jsx      … lights + fog + background を適用
  WorldTimeTicker.jsx          … delta 積算
```

`getDayNightState` 返却例：

```javascript
{
  ambientIntensity: 0.15..0.5,
  sunPosition: [x,y,z],
  sunIntensity: 0..1.2,
  sunColor: '#fff9c4'..'#ff8a65',
  fogColor: '#050510'..'#0a1929',
  fogNear: 8..12,
  fogFar: 40..55,
  background: '#020818'..'#1a3a5c',
}
```

`MainGameScene.jsx` から固定ライトを削除し `<DayNightEnvironment />` に置換。

**街灯**：`Block.jsx` の `light_pole` に `useGameStore(s => s.worldTime.timeOfDay)` を渡すか、コンテキストで `nightFactor` を取得し `intensity *= lerp(0.1, 2.0, nightFactor)`。

### 4.3 季節ティント（5-B）

```
constants/seasonData.js        … 各 domain の RGB 乗算係数
utils/seasonTint.js            … applyTint(hex, season, domain)
```

描画側：

- `AgriMeshes` / `TerrainMeshes` / `NatureMeshes`（または `Island` の ground）で **表示直前**に `applyTint`
- ストア購読はメッシュ単位ではなく `MainGameScene` で `season` を一度読み props で渡す（再レンダー範囲を抑える）

### 4.4 成長（5-C）

```
constants/agriGrowthData.js    … shape ごとの stage ラベル・日数
utils/agriGrowth.js          … getAgriStage(block, worldTime), shouldAdvanceOnNewDay
```

- **日境界検知**：`WorldTimeTicker` で `dayIndex` が変わったフレームに `advanceAgriStages()` を 1 回だけ store アクション
- `placedBlocks` の `agri` のみイミュータブル更新（全ブロック走査 — 現状規模なら可。将来は `agri` タグ Map）

### 4.5 パフォーマンス

| 懸念 | 対策 |
|------|------|
| 毎フレーム全ブロック再計算 | 日境界・季節変更時のみ store 更新 |
| ライト補間毎フレーム | `DayNightEnvironment` のみ `useFrame` で uniform 更新（ブロックは触らない） |
| 成長メッシュ増 | stage ごとに **1 形状追加**まで（4 段 × 3 農地 = 最大 12 バリエーション） |

---

## 5. 推奨実装順（スプリント）

```
Sprint 1 — 5-A  core
  W1  worldTimeConfig + dayNight.js + store tick
  W2  DayNightEnvironment + WorldTimeTicker + MainGameScene 差し替え
  W3  light_pole 夜間連動 + スタジオ/島拡張で pause
  → PR「Phase 5-A: 昼夜サイクル」

Sprint 2 — 5-D  lite（UI なしでもデバッグ可能にしてから UI）
  W4  セーブ/ロード worldTime + デフォルト復元
  W5  TimeControlPanel（停止・速度・日付表示）
  → PR「Phase 5-D: 時間 UI とセーブ」

Sprint 3 — 5-B  season
  W6  seasonData + seasonTint + Agri/Terrain/Nature 適用
  W7  dayIndex → season 自動更新
  → PR「Phase 5-B: 季節ティント」

Sprint 4 — 5-C  growth
  W8  agriGrowthData + AgriMeshes stage メッシュ
  W9  plantedDay / advanceAgriStages + placeBlock 初期化
  → PR「Phase 5-C: 農地成長（見た目）」
```

**PR 目安**：5-A を 1 PR、5-D を 1 PR、5-B と 5-C を各 1 PR（計 4 PR）。5-A と 5-D の順序は **セーブを早めたいなら D を A 直後**でも可。

---

## 6. 既存モジュールとの接続

| 既存 | Phase 5 の接続 |
|------|----------------|
| `04_農地` 将来表 Phase 5/6 | `agri.seasonTint` → 本計画 5-B の `seasonTint` に統合命名 |
| `06_地形` 昼夜・季節 | `terrain.color` × 季節、池は夏濃い青 / 冬グレー寄り |
| `light_pole` バグ「暗い」 | 夜プレイで街灯の効果を体感テスト |
| `finishBuildMode` 島拡張 | 演出中 `paused: true` |
| `StudioScene` | 独自 fog/light あり → **スタジオは昼夜固定（昼）**でよい |

---

## 7. 受け入れ基準（リリース単位）

### 5-A 完了

- [ ] ゲーム開始から 1 周で昼夜が一周する（速度定数は文書化）
- [ ] 建築モード・TPS で光が同じように変わる
- [ ] 島拡張・スタジオ中は時間が止まる

### 5-B 完了

- [ ] 4 季節で農地・主要植物・池の色が変わる
- [ ] `dayIndex` 進行で季節が自動遷移する

### 5-C 完了

- [ ] 畑・菜園・田んぼで stage 0→3 が日数で進む
- [ ] 収穫・スコア UI なし

### 5-D 完了

- [ ] 停止・速度変更・日付表示が UI から操作できる
- [ ] セーブ再読み込みで時間状態が復元される

---

## 8. リスクと対策

| リスク | 対策 |
|--------|------|
| 夜が暗すぎて建築不能 | 建築モードのみ `ambient` 下限を 0.25 にクランプ |
| セーブ互換 | `worldTime` 欠損時デフォルト、`agri.stage` 欠損は 0 |
| `App.jsx` 肥大化 | 時間 UI は `TimeControlPanel.jsx`、tick は `WorldTimeTicker` |
| 成長と Undo | 成長は「時間経過」なので Undo 対象外と明記。ブロック削除は Undo で巻き戻る |
| 田んぼ stage と水面 | stage は **草メッシュのみ**追加、畦・水面ロジックは 3-B を維持 |
| パフォーマンス | 日境界 1 回/日の store 更新に限定 |

---

## 9. 将来拡張（本計画の外）

| 内容 | 時期 | 接続 |
|------|------|------|
| 天候（雨・曇） | Phase 5+ | `worldTime.weather` |
| 種まき・収穫ゲーム | Phase 6 | `agri.cropId`, クエスト連動 |
| 植物の個別成長 | Phase 6 | `nature.stage`（樹木のみ） |
| バグ自動判定（夜の暗さ） | クエスト企画 | `light_pole` 密度と `nightFactor` |
| リアル時刻連動 | オプション | `worldTime.mode: 'real'` |

---

## 10. `03_ゲームの仕様.md` 追記予定（5-D 後）

**状態管理に追加**

| 変数名 | 型 | 説明 |
|--------|-----|------|
| `worldTime` | object | 世界時計（日・時刻・季節・停止・速度） |

**農地データ拡張**

```json
"agri": {
  "color": "#8d6e63",
  "stage": 2,
  "plantedDay": 14
}
```

**ファイル構成（新規）**

```
constants/worldTimeConfig.js
constants/seasonData.js
constants/agriGrowthData.js
utils/dayNight.js
utils/seasonTint.js
utils/agriGrowth.js
components/3d/environment/DayNightEnvironment.jsx
components/3d/environment/WorldTimeTicker.jsx
components/ui/TimeControlPanel.jsx
```

---

## 11. まとめ

- **Phase 5-A** で「まちに昼夜」を足す — 体験のインパクトが最大で、既存ライト・街灯の延長で実現しやすい。
- **5-D** でセーブと UI を早めに固め、テストとデモがしやすくする。
- **5-B** で農地・地形・植物の文書化された「季節」を足す — Phase 3/4 の `agri` / `terrain` / `nature` フィールドを活かす。
- **5-C** で農地の **見た目だけの成長** — 栽培ゲームは入れず、のちの Phase 6 にルールを委ねる。

実装着手時は **Sprint 1（5-A）→ Sprint 2（5-D lite）→ Sprint 3（5-B）→ Sprint 4（5-C）** を推奨する。詳細な曲線・メッシュ座標は **`08_時間軸_詳細設計.md`** で確定する。
