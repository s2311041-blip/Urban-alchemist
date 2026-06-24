# 地形実装計画書（Phase 4-A 〜 4-B）

## 文書情報

| 項目 | 内容 |
|------|------|
| 対象フェーズ | **Phase 4-A**（手動配置：池・小川・滝・山） / **Phase 4-B**（ランダム生成・島連動） |
| 前提完了 | Phase 1〜2（植物）、Phase 3-A/B（農地・隣接連続）、線路隣接ライト |
| 作成目的 | 「最初は自分で置く → 後からランダム」のスコープ固定 |
| 更新方針 | 実装完了後に `03_ゲームの仕様.md` へ形状定義を反映する |
| 詳細設計 | メッシュ座標は着手時に `07_地形_詳細設計.md` を切る（農地の 05 と同型） |

### スコープ方針（2026-05 合意）

| 時期 | 内容 |
|------|------|
| **今回（4-A）** | プレイヤーが **池・小川・滝・山** を建築パレットから手動配置 |
| **後から（4-B）** | 島拡張などで **同じ 4 形状をランダム生成**（手動配置と shape ID を共有） |

岩群・崖・島チャンクの `terrainType` 分岐などは **4-B 以降または別フェーズ** とする。

---

## 1. 目的と位置づけ

### 1.1 ゲーム上の目的

- **まず手で景観を作る**：プレイヤーが池・水路・滝・山を置いて、まちのランドマークを決める
- **後から自動化**：同じ見た目資産を使い、島が広がったときなどにランダムで散らす（手動配置は常に可能）
- **農地・植物との差別化**：田んぼ（畦あり）≠ 池（自然の静水）、舗装 ≠ 小川

### 1.2 本計画でやること / やらないこと

| やる | やらない（初回） |
|------|------------------|
| 4 形状の**手動配置** + `terrain.color` | 岩群・崖・丘の別形状（将来追加可） |
| 池・小川の**隣接連続**（A ライト） | 島拡張時の自動ランダム配置（**4-B**） |
| パレット「地形」タブ、Undo / セーブ / ゴースト | 島チャンク `terrainType` の色分け（**4-B**） |
| ランダム生成用の**データ互換**（shape ID 統一） | 高さマップ・完全プロシージャル地形 |
| | 水の物理・泳ぎ、昼夜・季節（Phase 5） |

---

## 2. スコープ定義

### Phase 4-A：手動配置（初回リリース・必須）

**ゴール**：建築パレット「地形」から、次の **4 種だけ** を地面クリックで置ける。

| 形状ID | 表示名 | 概要 | 隣接連動 |
|--------|--------|------|----------|
| `pond_tile` | 池 | 沈み込んだ水面＋自然の岸（畦なし） | 同種隣接で岸線を共有 |
| `stream_tile` | 小川 | 細い水路（線路と同型の直線連続） | 隣接で流れを接続 |
| `waterfall` | 滝 | 岩＋落水面＋下池（単体装飾） | なし |
| `mountain` | 山 | 1 マス内の山塊（岩＋緑の起伏、上面は歩行可能） | なし |

**配置ルール**

- `pos`：0.5m グリッドスナップ（既存ブロックと同じ）
- Y：`pond_tile` / `stream_tile` / `waterfall` は床面に沈める（`y - 0.24` 付近）
- `mountain`：上面が +0.1〜0.2 程度盛るが、**コライダーはフラット近似**（アバター引っかかり防止）
- 素材デフォルト：水系 → `water`、山 → `stone` または `sand`
- スケール：初期 `[1, 1, 1]` 固定

**田んぼとの差別化**

| | 田んぼ `rice_paddy` | 池 `pond_tile` |
|--|---------------------|----------------|
| タブ | 農地 | 地形 |
| 畦 | あり（農業） | なし（自然岸） |
| 色プリセット | 青水・泥水 | 青・深緑・苔池など |

**4-A で後回し（形状追加は別 PR）**

- `rock_cluster`（岩群）、`cliff_face`（崖）— 山で代用可能なら初回は入れない
- 滝の下流に小川を自動接続するウィザード
- 地形タイル間の段差・水位差

### Phase 4-A ライト：隣接連続（A と同一リリース推奨）

| 形状 | ルール |
|------|--------|
| `pond_tile` | 隣接辺の岸線を 1 本化（農地の畦と同ロジック） |
| `stream_tile` | 接続方向に水路を伸ばす。未接続端は源流／終端メッシュ |

### Phase 4-B：ランダム生成（後から・必須だが A の後）

**ゴール**：手動で置いたのと**同じ `shape` + `terrain`** を、ルールに従って自動配置する。

| トリガー（候補） | 挙動例 |
|------------------|--------|
| 島拡張（`finishBuildMode`） | 新チャンク内の空きマスに、seed から池・小川・山を散らす |
| 設定フラグ `terrainAutoGen: true` | 上記を有効化（デフォルト **false**＝今は手動のみ） |
| （将来）フリー建築メニュー | 「このエリアに地形をランダム配置」ボタン |

**抽選対象は A の 4 形状のみ**

```javascript
const TERRAIN_GEN_SHAPES = ['pond_tile', 'stream_tile', 'waterfall', 'mountain'];
```

**4-B で足すデータ（プレビュー）**

```json
{
  "terrainGen": {
    "enabled": false,
    "density": 0.08,
    "weights": {
      "pond_tile": 3,
      "stream_tile": 2,
      "waterfall": 1,
      "mountain": 2
    }
  }
}
```

- `enabled: false` が初期値 → **既存プレイは手動のみのまま**
- 生成結果も `placedBlocks[]` に載せる → 手動配置と Undo・セーブが同じ経路

**4-B で後回し**

- 島チャンク上面の `terrainType`（草地 / 低地 / 丘陵）— ランダム生成が動いてからでよい
- 低地チャンクに田んぼを偏らせるルール
- 小川の連続を考慮した「川筋」生成（最初は単マス抽選でよい）

---

## 3. 技術方針

### 3.1 設計原則

1. **手動と自動で shape ID を共有** — ランダムは `placeBlock` 相当のデータを bulk 追加するだけ
2. **`terrain` フィールドに集約** — `nature` / `agri` と混在しない
3. **`App.jsx` にロジックを足さない** — `terrainData` / `TerrainMeshes` / `terrainGen.js`（4-B）に分割
4. **4-B はフラグ OFF がデフォルト** — ユーザーが設定で ON にしたときだけ自動生成

### 3.2 アーキテクチャ（4-A）

```
ControlBottomBar
  └─ paletteMode: 'terrain'
       └─ TerrainPalette（4 ボタン + 色 UI）

useGameStore
  └─ placeBlockAtHover → placedBlocks[].terrain = { color }

MainGameScene
  └─ getCardinalNeighbors → terrainNeighbors（pond / stream）
       └─ Block → TerrainMeshes
```

### 3.3 アーキテクチャ（4-B・後付け）

```
useGameStore.finishBuildMode
  └─ if (terrainGen.enabled) generateTerrainForChunks(newChunks, placedBlocks, settings)

src/utils/terrainGen.js   ← 純関数（seed, 密度, weights, 空きセル一覧）
  └─ 返り値: Block[] を placedBlocks に concat
```

---

## 4. データ仕様

### 4.1 配置ブロック（4-A）

```json
{
  "id": "string",
  "pos": [x, y, z],
  "shape": "pond_tile | stream_tile | waterfall | mountain",
  "material": "water | stone | sand",
  "rotation": 0,
  "scale": [1, 1, 1],
  "terrain": {
    "color": "#4fc3f7"
  }
}
```

- `terrain.variant`：初回は省略可（4-B のランダムで `rocky_shore` など足す余地を残す）

### 4.2 定数（`src/constants/terrainData.js`）

```javascript
/** 初回パレットに出す形状（手動配置） */
export const TERRAIN_SHAPES = [
  'pond_tile', 'stream_tile', 'waterfall', 'mountain',
];

/** ランダム生成も同じ ID を使う（4-B） */
export const TERRAIN_GEN_SHAPES = TERRAIN_SHAPES;

export const TERRAIN_CONNECTABLE_SHAPES = ['pond_tile', 'stream_tile'];

export const DEFAULT_TERRAIN_COLORS = {
  pond_tile:    '#4fc3f7',
  stream_tile:  '#81d4fa',
  waterfall:    '#4fc3f7',
  mountain:     '#78909c',
};

export const TERRAIN_META = {
  pond_tile:    { label: '池',   icon: '💧', defaultMaterial: 'water' },
  stream_tile:  { label: '小川', icon: '〰️', defaultMaterial: 'water' },
  waterfall:    { label: '滝',   icon: '🌊', defaultMaterial: 'water' },
  mountain:     { label: '山',   icon: '⛰️', defaultMaterial: 'stone' },
};

/** 4-B 用デフォルト（store 初期値と同期） */
export const DEFAULT_TERRAIN_GEN = {
  enabled: false,
  density: 0.08,
  weights: { pond_tile: 3, stream_tile: 2, waterfall: 1, mountain: 2 },
};
```

### 4.3 ストア（4-B で追加）

```javascript
terrainGen: { enabled: false, density: 0.08, weights: { ... } },
setTerrainGen: (partial) => { ... },
```

UI は **設定パネルまたはフリー建築時のみ** 表示でよい（初回実装は store + localStorage 保存だけでも可）。

---

## 5. メッシュ方針（4-A）

| 形状 | メッシュ構成 |
|------|--------------|
| `pond_tile` | 土ベース + やや丸い水面 + 自然岸 |
| `stream_tile` | 細長水路 + 土岸、隣接で接続 |
| `waterfall` | 岩壁 + 縦落水面 + 下の小池 |
| `mountain` | 岩塊 + 緑面の複合（1 マス内で山らしいシルエット） |

詳細座標は `07_地形_詳細設計.md`。

---

## 6. UI 仕様

### 6.1 パレット（4-A）

- タブ：**⛰️ 地形**（4 ボタンのみ：池 / 小川 / 滝 / 山）
- 色 UI：4 形状すべて（山は岩色・緑寄りのプリセット）

### 6.2 ガイダンス

> ⛰️ 【地面をクリック】で地形を配置します  
> 池・小川は隣接するとつながって見えます

### 6.3 設定 UI（4-B・後から）

| 項目 | 説明 |
|------|------|
| 自動生成 | ON/OFF（`terrainGen.enabled`） |
| 密度 | チャンクあたりの配置確率 |
| 重み | 池 / 小川 / 滝 / 山 の出現比率 |

初回リリース（4-A）では **設定 UI なし** でもよい。フラグは常に `false`。

---

## 7. ファイル構成

### 7.1 新規（4-A）

```
src/constants/terrainData.js
src/components/3d/terrain/{ index.js, TerrainMeshes.jsx, terrainColliders.jsx }
src/components/ui/TerrainPalette.jsx
```

### 7.2 4-B で追加

```
src/utils/terrainGen.js
```

（設定 UI は `ControlBottomBar` または専用 `TerrainSettings.jsx`）

### 7.3 変更

| ファイル | 4-A | 4-B |
|----------|-----|-----|
| `Block.jsx` | 地形委譲 | — |
| `useGameStore.js` | `terrain` 保存、色 state | `terrainGen`、`finishBuildMode` 連携 |
| `ControlBottomBar.jsx` | 地形タブ | 設定 UI（任意） |
| `MainGameScene.jsx` | 隣接 | — |
| `Island.jsx` | 触らない | 触らない（チャンク色分けは更に後） |

---

## 8. 実装タスク

### Sprint 1：Phase 4-A（手動・4 形状）

| # | タスク | 完了条件 |
|---|--------|----------|
| T1 | `terrainData.js` | 4 形状・接続対象・`DEFAULT_TERRAIN_GEN` スタブ |
| T2 | `TerrainMeshes` + colliders | 4 形状が配置・ゴーストできる |
| T3 | `Block.jsx` 委譲 | Undo / セーブ動作 |
| T4 | store + パレット | 地形タブから色付きで置ける |
| T5 | 隣接 | 池・小川がつながる |
| T6 | ビルド確認 | `npm run build`、リロード復元 |

### Sprint 2：Phase 4-B（ランダム・後から）

| # | タスク | 完了条件 |
|---|--------|----------|
| G1 | `terrainGen.js` | seed から 4 形状の Block 配列を返す |
| G2 | `finishBuildMode` 連携 | `enabled` 時のみ新チャンクに散らす |
| G3 | 設定永続化 | `terrainGen` が localStorage で復元 |
| G4 | 設定 UI（任意） | ON/OFF・密度・重みを変更できる |
| G5 | 手動優先 | 既存 `placedBlocks` と重ならないマスのみ |

---

## 9. 受け入れ基準

### 4-A（今回）

- [ ] 地形タブから **池・小川・滝・山** の 4 種を手動配置できる
- [ ] `terrain.color` が保存・復元される
- [ ] 池・小川が隣接でつながる
- [ ] 田んぼと池が区別できる
- [ ] **自動生成は一切走らない**（`terrainGen.enabled === false`）

### 4-B（後から）

- [ ] 設定で自動生成 ON にすると、島拡張時に 4 形状が散らされる
- [ ] 生成ブロックも手動と同じ見た目・Undo 対象（bulk 追加を Undo 1 回で戻せるとなお良い）
- [ ] OFF に戻すと従来どおり手動のみ

---

## 10. リスクと対策

| リスク | 対策 |
|--------|------|
| 池と田んぼが似る | 畦の有無・タブ分離・プリセット差 |
| 山のコライダー | 見た目だけ盛る、Collider は flat Box |
| ランダムが川をバラバラにする | 4-B 初版は単マス抽選、川筋は 4-B+ で改善 |
| 手動配置を上書き | 生成は空きマスのみ、既存 id は触らない |

---

## 11. 将来拡張

| 内容 | 時期 |
|------|------|
| `rock_cluster` / `cliff_face` | 4-A 安定後 |
| 島チャンク `terrainType` 色分け | 4-B と並行または後 |
| 昼夜・季節で池・滝の色 | Phase 5 |
| 川筋・滝下流の連鎖生成 | 4-B+ |

---

## 12. 推奨実装順

```
Phase 4-A … 手動：池・小川・滝・山（＋池・小川の隣接）
    ↓
Phase 4-B … 設定 ON 時のみランダム生成（同じ 4 shape）
    ↓
形状追加・島 terrainType・季節 …
```

**PR 目安**：Sprint 1 を 1〜2 PR、Sprint 2 を 1 PR。

---

## 13. `03_ゲームの仕様.md` 追記予定（4-A 後）

| 形状ID | 名称 |
|--------|------|
| `pond_tile` | 池 |
| `stream_tile` | 小川 |
| `waterfall` | 滝 |
| `mountain` | 山 |

```json
"terrain": { "color": "#4fc3f7" }
```
