# バリアフリー・アクセシビリティ 実装計画書（Phase 8）

## 文書情報

| 項目 | 内容 |
|------|------|
| 対象 | 不満（バグ）の構造化、解決プラン選択、配置ベースの条件判定、トレードオフ（最小1件） |
| 前提 | Phase 6 完了（時間・農業・通貨・HUD）、既存 `bugs` / `finishBuildMode` / 建築ブロック群 |
| 作成目的 | 講義・会話で整理した **スケール × 要因 × 解決ファミリー** を、**増え続けない型ベース**でゲームに載せる |
| 後続 | Phase 9（海・離島・フェリー）— Line 不満の **ソフト解** として接続 |
| 更新方針 | 完了後 `03_ゲームの仕様.md` に `bugs` 拡張スキーマ・解決判定を追記 |

### Phase 8 で入れるもの（MVP）

| # | 内容 | 現状 |
|---|------|------|
| 1 | 不満の **内部タグ**（scale / factor / needType） | `type` + `comment` のみ |
| 2 | **解決プラン選択** UI（2〜3択） | 「DIYで解決」のみ |
| 3 | **`finishBuildMode` 条件判定** | 無条件 `solved: true` |
| 4 | **Point + Hard** 判定（街灯・スロープ・ベンチ） | なし |
| 5 | **Point + Hard/Line** 迂回 path 判定（danger） | path は配置可能だが判定なし |
| 6 | **トレードオフ spawn** 1件（表で定義） | なし |
| 7 | 解決失敗時 **トースト**（理由表示） | なし |

### Phase 8 で入れないもの（Phase 9 以降）

- 離島・海・泳ぎ・フェリー（Phase 9）
- Area 政策トグル・住民反発イベント（Phase 8-B 以降）
- Good Spot 記録 UI（Phase 8-C 推奨だが MVP 外可）
- AIカメラ・MaaS アプリ等の本格ソフト表現
- NPC・自動運転車の走行 AI
- 商業施設コスト（旧 Phase 7 — バリア後でも可）

---

## 0. エグゼクティブサマリー

### なぜ Phase 8 か

- ゲームのコアループ（不満 → 改善 → 島拡張）を **「建築＝唯一の正解」から解放** する
- 講義メモ（4要因・社会モデル・トレードオフ）を **プレイヤー投稿を重くせず** 載せられる
- 海系（Phase 9）の **フェリー = Line 不満のソフト解** として意味を持たせる土台になる

### 設計の3原則

1. **プレイヤー入力は軽い** — 写真 + 一言 + 既存 `type` のまま。タグはシステムが付与
2. **ロジックは型で頭打ち** — 不満コメント数 ≠ 判定パターン数。`needType` × `solutionPlan` 表で管理
3. **建築は Hard 解の1つ** — path / 看板 / 停車点は既存 or 少数追加 shape で足す

---

## 1. 概念モデル（統合）

### 1.1 3層タクソノミ

```
不満インスタンス（bugs[]）
  ├─ scale:   Point | Line | Area     … 空間スケール（今回 MVP は Point のみ）
  ├─ factor:  hard | soft | human    … 主因（UI カード色分け）
  ├─ needType: P|V|I|M|R|L|S|C       … 判定・テンプレ用（8型）
  └─ tag:     表示用ラベル（#局所的欠損 等）… フレーバー

解決プラン（プレイヤーが DIY 開始時に選択）
  └─ planId: hard_fix | detour_path | lighting | maintenance | sign_info | …

判定（finishBuildMode）
  └─ 選んだ planId に対応する validator が true → solved
```

### 1.2 既存 `type` → 内部マッピング（シード・移行）

| 旧 `type` | scale | factor | needType | デフォルト tag | 許容プラン |
|-----------|-------|--------|----------|----------------|------------|
| `dark` | Point | hard | V（視認） | #特定地点の死角_不安 | `lighting`, `detour_path` |
| `danger` | Point | hard | P（通行） | #局所的欠損_障壁 | `hard_fix`, `detour_path`, `sign_info` |
| `dirty` | Point | soft | M（維持） | #局所的キャパ不足 | `maintenance`, `hard_fix` |

※ `dark` を S（安心）に寄せる議論もあるが、MVP は **判定が明確な V** を採用。

### 1.3 講義4要因との対応

| factor（ゲームUI） | 講義4要因 |
|--------------------|-----------|
| `hard` | 物理 |
| `soft` | 情報 + 精度・運用 |
| `human` | 意識・こころ（Phase 8-B） |

---

## 2. 現状コード（出発点）

| 領域 | ファイル | 備考 |
|------|----------|------|
| 不満データ | `useGameStore.js` L330-335 | `type`, `comment`, `demographic`, `pos` |
| 解決確定 | `useGameStore.js` `finishBuildMode` | **検証なし**で `solved: true` |
| オーバーレイ | `Overlays.jsx` `BugReportOverlay` | タグ hardcode「バグ：暗闇・危険」 |
| 建築形状 | `Block.jsx`, `ControlBottomBar.jsx` | slope, path, light_pole, bench あり |
| 隣接 | `utils/gridNeighbors.js` | path / rail 用 — Line 判定に流用可 |
| トースト | `FarmingToast` / `farmingToast` | 汎用化 or `gameToast` で再利用 |

---

## 3. リファクタリング方針

**原則**: `finishBuildMode` に判定ロジックを直書きしない。`App.jsx` は触らない。

### 3.1 必須（Phase 8-A と同 PR）

| 対象 | 対策 |
|------|------|
| `finishBuildMode` | **`utils/barrierActions.js`** に `evaluateBugResolution` を抽出 |
| タグ定義 | **`constants/barrierData.js`** — マップ表・半径定数・プラン定義 |
| 近接判定 | **`utils/barrierValidation.js`** — 汎用 validator 群 |
| `BugReportOverlay` | factor / tag 表示、`startDIY` 前にプラン選択へ |

### 3.2 推奨

| 対象 | 対策 |
|------|------|
| `farmingToast` | `gameToast: { type, message }` にリネーム汎用化（barrier / farming 共用） |
| `useGameStore` load | `normalizeBug(bug)` で旧セーブにタグ自動付与 |

### 3.3 触らない

- `Block.jsx` 形状追加（看板 `sign_post` は Phase 8-B。MVP は bench/light/slope/path のみ）
- 農業・経済ロジック

---

## 4. 詳細設計

### 4.1 データ構造 — `bugs[]` 拡張

```typescript
// 概念型（実装は JSDoc + plain object）

type BarrierScale = 'point' | 'line' | 'area';
type BarrierFactor = 'hard' | 'soft' | 'human';
type NeedType = 'P' | 'V' | 'I' | 'M' | 'R' | 'L' | 'S' | 'C';

type SolutionPlanId =
  | 'hard_fix'      // slope, bench 等
  | 'lighting'      // light_pole
  | 'detour_path'   // path ルート
  | 'maintenance'   // dirty: bench + path（清掃導線の比喩）
  | 'sign_info';    // Phase 8-B

type Bug = {
  id: string;
  pos: [number, number, number];
  type: 'dark' | 'danger' | 'dirty';  // 後方互換・投稿UI用
  solved: boolean;
  demographic: string;
  comment: string;
  photo?: string;

  // --- Phase 8 追加 ---
  scale: BarrierScale;
  factor: BarrierFactor;
  needType: NeedType;
  tagLabel: string;                    // 例: '#局所的欠損_障壁'
  allowedPlans: SolutionPlanId[];
  chosenPlan: SolutionPlanId | null; // DIY 開始時にセット
};
```

**セーブ互換 — `normalizeBug(bug)`**

```javascript
// constants/barrierData.js
export const LEGACY_TYPE_MAP = {
  dark:   { scale: 'point', factor: 'hard', needType: 'V', tagLabel: '#特定地点の死角_不安', allowedPlans: ['lighting', 'detour_path'] },
  danger: { scale: 'point', factor: 'hard', needType: 'P', tagLabel: '#局所的欠損_障壁',     allowedPlans: ['hard_fix', 'detour_path', 'sign_info'] },
  dirty:  { scale: 'point', factor: 'soft', needType: 'M', tagLabel: '#局所的キャパ不足',   allowedPlans: ['maintenance', 'hard_fix'] },
};
```

### 4.2 定数 — `constants/barrierData.js`

```javascript
/** 不満地点からの判定半径（m） */
export const BUG_RESOLVE_RADIUS = 6;

/** path 迂回: 不満地点から path 上の最遠 reach（m） */
export const PATH_DETOUR_MIN_LENGTH = 4;

/** 街灯: dark 不満の最低本数 */
export const LIGHTING_MIN_COUNT = 1;

/** スロープ: danger 不満 */
export const HARD_FIX_SLOPE_SHAPES = ['slope', 'half'];

/** ベンチ: dirty maintenance */
export const MAINTENANCE_SHAPES = ['bench'];

export const SOLUTION_PLAN_META = {
  hard_fix:     { label: '物理整備',   icon: '🔧', factor: 'hard',  hint: 'スロープや段差解消を置く' },
  lighting:     { label: '照明',       icon: '💡', factor: 'hard',  hint: '街灯を増やす' },
  detour_path:  { label: '迂回ルート', icon: '🛤', factor: 'hard',  hint: '歩道で安全な経路をつなぐ' },
  maintenance:  { label: '維持・清掃', icon: '🧹', factor: 'soft',  hint: 'ベンチと歩道で使える空間に' },
  sign_info:    { label: '案内',       icon: '📋', factor: 'soft',  hint: '看板で迂回先を示す（8-B）' },
};
```

### 4.3 判定 — `utils/barrierValidation.js`

**汎用部品**

```javascript
export function getBlocksNear(pos, placedBlocks, radius) {
  return placedBlocks.filter(b => {
    const dx = b.pos[0] - pos[0];
    const dz = b.pos[2] - pos[2];
    return Math.hypot(dx, dz) <= radius;
  });
}

export function countShapesNear(pos, placedBlocks, shapes, radius) {
  const near = getBlocksNear(pos, placedBlocks, radius);
  return near.filter(b => shapes.includes(b.shape)).length;
}

export function hasShapeNear(pos, placedBlocks, shapes, radius, minCount = 1) {
  return countShapesNear(pos, placedBlocks, shapes, radius) >= minCount;
}
```

**プラン別 validator**

| planId | 条件（MVP） |
|--------|-------------|
| `lighting` | 半径内 `light_pole` ≥ 1 |
| `hard_fix` | 半径内 `slope` または `half` ≥ 1 |
| `maintenance` | 半径内 `bench` ≥ 1 **かつ** `path` ≥ 2 |
| `detour_path` | 半径内 `path` が **3マス以上連結**（ flood-fill ）し、不満地点から edge まで距離 ≥ `PATH_DETOUR_MIN_LENGTH` |
| `sign_info` | Phase 8-B: `sign_post` ≥ 1（なければ `path`+`bench` で代用可） |

**Line 判定（detour_path）詳細**

```javascript
/**
 * 不満地点を含む半径内の path をグラフ化し、
 * 「不満地点に隣接する path セル」が 2 方向以上に伸びる、または
 * path セル数 >= 3 を満たせば迂回ルート成立とみなす（MVP 簡易版）
 */
export function validateDetourPath(bugPos, placedBlocks, radius) {
  const paths = getBlocksNear(bugPos, placedBlocks, radius)
    .filter(b => b.shape === 'path');
  if (paths.length < 3) return false;
  // gridNeighbors の CARDINAL 隣接で path のみ連結成分を数える
  // …実装は gridNeighbors 流用
  return largestPathComponentSize(paths, placedBlocks) >= 3;
}
```

### 4.4 アクション — `utils/barrierActions.js`

```javascript
/**
 * @returns {{ ok: boolean, message: string, sideEffect?: SideEffectSpec }}
 */
export function evaluateBugResolution(bug, placedBlocks) {
  if (!bug?.chosenPlan) {
    return { ok: false, message: '解決プランが選ばれていません' };
  }
  const validators = {
    lighting: () => hasShapeNear(bug.pos, placedBlocks, ['light_pole'], BUG_RESOLVE_RADIUS),
    hard_fix: () => hasShapeNear(bug.pos, placedBlocks, HARD_FIX_SLOPE_SHAPES, BUG_RESOLVE_RADIUS),
    maintenance: () =>
      hasShapeNear(bug.pos, placedBlocks, ['bench'], BUG_RESOLVE_RADIUS) &&
      countShapesNear(bug.pos, placedBlocks, ['path'], BUG_RESOLVE_RADIUS) >= 2,
    detour_path: () => validateDetourPath(bug.pos, placedBlocks, BUG_RESOLVE_RADIUS),
    sign_info: () => false, // 8-B
  };
  const fn = validators[bug.chosenPlan];
  if (!fn) return { ok: false, message: '未対応のプランです' };
  const ok = fn();
  return ok
    ? { ok: true, message: 'この不満は解決しました' }
    : { ok: false, message: PLAN_FAIL_MESSAGES[bug.chosenPlan] };
}
```

**`finishBuildMode` 変更後**

```javascript
// useGameStore.js（概念）
finishBuildMode: () => {
  const { buildMode, bugs, placedBlocks, ... } = get();
  if (buildMode === 'free') { /* 既存 */ return; }

  const bug = bugs.find(b => b.id === buildMode);
  if (!bug) { /* 既存フォールバック */ return; }

  const result = evaluateBugResolution(bug, placedBlocks);
  if (!result.ok) {
    set({ gameToast: { type: 'barrier', message: result.message } });
    return; // solved にしない。建築モードは維持
  }

  const updatedBugs = bugs.map(b => b.id === buildMode ? { ...b, solved: true } : b);
  // 副作用（トレードオフ）
  const spawn = getSideEffectSpawn(bug, result);
  // …島拡張は既存のまま
};
```

### 4.5 トレードオフ — `constants/barrierSideEffects.js`（Phase 8-D）

MVP **1件のみ** 実装:

| トリガー | 条件 | 生成する不満 |
|----------|------|--------------|
| `hard_fix` で danger solved | needType P | 近傍に **新 bug** `type: 'danger'`, tag `#経路のガタつき`, comment テンプレ「スロープの勾配が急で車椅子が通りにくい」— **または** 既存 unsolved bug の `severity` を上げる代わりに **トーストのみ**（MVP はトーストのみ推奨） |

**MVP 推奨（実装軽量）**

```javascript
// 解決成功時
if (bug.needType === 'P' && bug.chosenPlan === 'hard_fix') {
  toast: '通行は改善しましたが、別の方にはまだ勾配が厳しいかもしれません';
}
// Phase 8-D で spawnBug(sideEffectSpec) を有効化
```

### 4.6 UI 設計

#### 4.6.1 フロー

```
バグオーブタップ
  → BugReportOverlay（comment, tagLabel, factor バッジ）
  → 「解決プランを選ぶ」
  → SolutionPlanPicker（allowedPlans 2〜3 カード）
  → 「DIYで解決」→ buildMode = bug.id, chosenPlan 保存
  → 建築（パレットは plan に応じてヒント表示のみ。形状ロックはしない）
  → 「完成させる」→ evaluateBugResolution
       OK  → solved + 島拡張
       NG  → トースト、建築モード継続
```

#### 4.6.2 新規コンポーネント

```
components/ui/barrier/
  SolutionPlanPicker.jsx   … プランカード grid
  BarrierTagBadge.jsx      … tagLabel + factor 色
  BarrierBuildHint.jsx     … 建築モード中、ControlBottomBar 上に chosenPlan ヒント
```

#### 4.6.3 `BugReportOverlay` 変更

- 固定「バグ：暗闇・危険」→ `tagLabel` + `factor` 表示
- `demographic` は残すが、サブコピーに **社会モデル** 文を1行（テンプレ）  
  例: 「この場所の段差が、歩行者・自転車・ベビーカーに影響しています」

#### 4.6.4 建築モード中ヒント（非ブロッキング）

| chosenPlan | ヒント文 |
|------------|----------|
| `lighting` | 不満地点の近くに街灯を置きましょう |
| `hard_fix` | スロープまたはハーフブロックで段差を解消 |
| `detour_path` | 歩道を3マス以上つないで迂回ルートに |
| `maintenance` | ベンチと歩道で座れる・歩ける空間に |

**形状ロックは Phase 8 では行わない**（自由度優先。判定だけ plan 別）

### 4.7 Store 変更

```javascript
// 追加 state
chosenPlanByBugId: {},  // buildMode 中の一時保持。または bug.chosenPlan に直接

// 追加 actions
setBugChosenPlan: (bugId, planId) => { ... },
startDIYWithPlan: (bugId, planId) => {
  set({ buildMode: bugId, bugs: bugs.map(normalize chosenPlan) });
},
```

---

## 5. ファイル構成（新規・変更）

```text
src/
├── constants/
│   ├── barrierData.js           … NEW マップ・半径・PLAN_META
│   └── barrierSideEffects.js    … NEW Phase 8-D
├── utils/
│   ├── barrierValidation.js     … NEW 汎用 + plan validators
│   └── barrierActions.js        … NEW evaluateBugResolution
├── components/ui/barrier/
│   ├── SolutionPlanPicker.jsx   … NEW
│   ├── BarrierTagBadge.jsx      … NEW
│   └── BarrierBuildHint.jsx     … NEW
├── components/ui/
│   └── Overlays.jsx             … BugReportOverlay 改修
├── store/
│   └── useGameStore.js          … finishBuildMode, normalizeBug, load
└── docs/
    └── 03_ゲームの仕様.md       … bugs スキーマ追記
```

---

## 6. フェーズ分割（スプリント）

### Phase 8-A — データ基盤（Sprint 1）

1. `barrierData.js` + `normalizeBug`
2. シード bugs / クエストにタグ付与
3. load 時旧セーブ互換
4. `BugReportOverlay` に tag / factor 表示

**完了条件**: オーバーレイで新タグが見える。ゲームプレイは従来どおり

### Phase 8-B — 判定コア（Sprint 2）

5. `barrierValidation.js` 部品 + `lighting` / `hard_fix` / `maintenance`
6. `barrierActions.js` + `finishBuildMode` 接続
7. 失敗トースト
8. **`dark` / `danger` / `dirty` それぞれ最低1プランで only 解決可能**

**完了条件**: 街灯なしで dark を「完成」→ NG。街灯後 → OK

### Phase 8-C — プラン選択 UI（Sprint 3）

9. `SolutionPlanPicker.jsx`
10. `startDIYWithPlan` フロー
11. `BarrierBuildHint.jsx`

**完了条件**: DIY 前にプラン選択必須。ヒント表示

### Phase 8-D — Line 判定 + トレードオフ（Sprint 4）

12. `validateDetourPath`（path 連結）
13. danger に `detour_path` 有効化
14. トレードオフ 1件（トースト or spawn）

**完了条件**: path のみで danger 解決可能（スロープなしルート）

### Phase 8-E — 拡張（任意）

15. `sign_post` 形状 + `sign_info` 判定
16. Good Spot 記録（1タップ）
17. `human` プラン（`care_point` = bench + light 组合）
18. Area / 政策（Phase 10 候補）

---

## 7. 推奨 PR 構成

| PR | 内容 | スプリント |
|----|------|------------|
| PR-1 | 8-A データ + Overlay 表示 | 1 |
| PR-2 | 8-B 判定 + finishBuildMode + トースト | 2 |
| PR-3 | 8-C プラン選択 UI + ヒント | 3 |
| PR-4 | 8-D detour_path + トレードオフ | 4 |

**工数目安**: 1人 4〜6 セッション（PR-1: 1, PR-2: 1〜2, PR-3: 1, PR-4: 1〜2）

---

## 8. 受け入れ基準（Phase 8 MVP リリース）

### データ・表示

- [ ] 3種シード不満に `tagLabel` / `factor` が表示される
- [ ] 旧セーブの bugs が load 時に `normalizeBug` される
- [ ] オーバーレイの固定「暗闇・危険」文言が消え、type 別 tag になる

### ゲームプレイ

- [ ] DIY 開始前に **解決プランを1つ選択** する
- [ ] `dark` + `lighting`: 半径内に街灯なし → 完成 NG / あり → OK
- [ ] `danger` + `hard_fix`: スロープなし → NG / あり → OK
- [ ] `dirty` + `maintenance`: ベンチ+path 不足 → NG / 充足 → OK
- [ ] 条件 NG 時 **島拡張しない**（solved にならない）
- [ ] 条件 NG 時 **建築モード継続** + 理由トースト

### リファクタ

- [ ] `evaluateBugResolution` が `barrierActions.js` にある
- [ ] `finishBuildMode` は 20 行以内のオーケストレーション

### リグレッション

- [ ] `buildMode: 'free'` は従来どおり無条件終了
- [ ] 農業・収穫・時間進行に影響なし

---

## 9. リスクと対策

| リスク | 対策 |
|--------|------|
| 判定が厳しすぎて詰む | 半径 6m、path 3マスは playtest で調整。デバッグ HUD に near blocks 表示 |
| プラン選択が面倒 | デフォルトプランを `allowedPlans[0]` に pre-select |
| path 迂回が分かりにくい | ゴースト path をハイライト（Phase 8-D 余力） |
| 旧セーブで chosenPlan null | normalize 時 `null` のまま。完成時「プラン未選択」トースト |
| Store 肥大化 | barrier 系は constants + utils に閉じる |
| ゼミデモで説明不足 | Overlay に factor 日本語ラベル（物理/制度/心理） |

---

## 10. Phase 9（海）への接続

Phase 8 完了後:

| Phase 9 | バリアとの接続 |
|---------|----------------|
| 離島生成 | 新 bugs に `scale: 'line'`, needType `L` |
| フェリー停車点 | `solutionPlan: 'transit_link'`（ソフト） |
| 泳ぎ | Line 近距離オプション。Phase 8 の `detour_path`  validator 拡張 |

```javascript
// Phase 9 で barrierData に1行追加するだけ
transit_link: { label: '海列車', factor: 'soft', validator: 'hasFerryRoute' },
```

---

## 11. 手動テスト checklist

1. 新規開始 → dark バグ → `lighting` 選択 → 街灯なしで完成 → NG メッセージ
2. 同 → 街灯1本配置 → 完成 → solved → 島拡張
3. danger → `hard_fix` → slope 配置 → OK
4. danger → `detour_path` → path 2マスのみ → NG / 3マス → OK（8-D）
5. dirty → `maintenance` → ベンチのみ → NG / ベンチ+path×2 → OK
6. free build → 完成 → バグ solved しない
7. リロード → bugs のタグ・solved 状態維持
8. クエストボード → 配置 → 新 bug が normalize される

---

## 12. 詳細設計は必要か — 本書の位置づけ

| レイヤ | 本書でカバー | 別途が必要な場合 |
|--------|--------------|------------------|
| 計画・スコープ | ✅ セクション 0–1, 6–7 | — |
| データ構造 | ✅ 4.1–4.2 | `sign_post` mesh 仕様（8-E） |
| 判定ロジック | ✅ 4.3–4.4 | path flood-fill の単体テスト |
| UI フロー | ✅ 4.6 | ワイヤーフレーム画像（任意） |
| トレードオフ表 | ✅ 4.5（MVP はトースト） | spawn 全表（8-D 以降） |

**結論**: Phase 8 MVP なら **本書だけで実装着手可能**。`sign_post` 形状や Area 政策は Phase 8-E / Phase 10 で別紙を足す。

---

## 13. 参照（会話・講義の統合）

- 講義4要因 → `factor: hard | soft | human`
- Point/Line/Area → `scale`（MVP: point のみ）
- 8 needType → 判定テンプレ・将来拡張
- 建築以外の解決 → `soft` プラン + Phase 9 交通
- トレードオフ → `barrierSideEffects.js`
- 投稿を重くしない → `LEGACY_TYPE_MAP` 自動付与
