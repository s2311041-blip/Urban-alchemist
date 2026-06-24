# AR投稿ループ閉じ（B）— 実装計画書

> **目的**: AR投稿を「小手先の促進」ではなく、先行研究どおり **「投稿が効いた・直った」体験（ループの閉じ）** で継続参加につなげる。  
> **根拠**: `docs/25_AR投稿_参加要因_先行研究レビュー.md`（FixMyStreet: 初回解決 → 2回目投稿 +54% 等）  
> **前提**: `docs/24_投稿2択とコイン報酬_実装計画.md` の入口（現地/地図・コイン）は **実装済みまたは並行可**。本計画はその**先**の接続。  
> **やらないこと**: モンスター討伐、実世界GPSマップ（PoGO本格）、コインを主動機にする設計

---

## 0. エグゼクティブサマリー

| 現状のギャップ | Bで足すもの |
|----------------|-------------|
| 投稿 → クエスト一覧で止まる | Bad投稿 → **自動で島に不満出現** |
| 手動「配置場所を決める」が必須 | 任意（上級者用に残すか廃止） |
| バグとクエストがデータ上つながらない | `sourceQuestId` / `questStatus` |
| 解決しても投稿者に返らない | **解決フィードバック**（トースト・ボード・ログ） |
| 研究用の証拠が残らない | `postLog` / `resolutionLog` |

**工数目安**: 集中 3〜5日 / ゼミ並行 1〜2週  
**推奨PR分割**: 3本（データ+自動出現 / 解決返信 / ログ+UI磨き）

---

## 1. 目標体験（プレイヤーが感じる1本の物語）

### 1.1 Bad投稿（不満）— 主ループ

```
ARで投稿（現地 or 地図）
  → 「あなたの声を島に載せました」（即時）
  → 島を歩くと黒オーブ（自分の投稿由来と分かる）
  → タップ → プラン選択 → DIY → 完成
  → 「あなたが投稿した『段差の件』が解決されました」
  → その場所が変わっている（建築物＋必要なら島拡張）
  → また投稿したくなる
```

### 1.2 Good投稿（良い場所）

- 図鑑（`goodSpots`）中心は維持。
- ループ閉じの主対象は **Bad / 不満**（RQ2の解決体験と直結）。
- Good は「記録＋コイン」まで（Phase 2 以降で図鑑→島マーカーは任意）。

### 1.3 研究上の位置づけ（卒論用1文）

> 本プロトタイプは、市民投稿プラットフォームで必須とされる「応答性（government responsiveness）」を、ゲーム内で設計上保証し、投稿→課題化→視点置換・解決→変化の可視化を一連の閉じたループとして提供する。

---

## 2. 現状フローとギャップ（コード対応表）

| 段階 | 現状の実装 | ファイル |
|------|------------|----------|
| 投稿 | `onPost` → `setQuests` / `addGoodSpotPost` | `App.jsx`, `ARPostingMode.jsx` |
| コイン | `awardPostCoins` | `setterSlice.js`, `economyActions.js` |
| 配置 | `startPlacingQuest` → 地面クリックで `bugs` 追加 | `bugSlice.js`, `useBuildPointerPlacement.js` |
| 解決 | `finishBuildMode` → `solved: true` + 島拡張 | `bugSlice.js`, `expandWorldAfterSolve.js` |
| 紐づけ | **なし**（quest.id と bug.id が独立） | — |
| 投稿者への返信 | **なし** | — |

**配置時の注意（既知）**: `placingQuest` クリック時は `{ ...quest, pos, solved: false }` を `bugs` に入れるだけ。`normalizeBug` は DIY 開始時などで効く。Bでは **`questToBug()` ファクトリ** で型・プラン・メタを確定させる。

---

## 3. 目標アーキテクチャ

```mermaid
flowchart TB
  subgraph rq1 [RQ1 入力]
    AR[ARPostingMode]
    AR --> ingest[ingestQuestPost]
  end

  subgraph loop [ループの閉じ]
    ingest --> spawn[spawnQuestOnIsland]
    spawn --> bug[bugs[] + sourceQuestId]
    bug --> diy[startDIY + chosenPlan]
    diy --> finish[finishBuildMode]
    finish --> feedback[notifyQuestResolved]
    feedback --> log[resolutionLog]
  end

  subgraph ui [UI]
    QB[QuestBoardOverlay]
    toast[farmingToast / islandToast]
    map[WorldMapPanel 任意ピン]
  end

  ingest --> QB
  feedback --> toast
  spawn --> map
```

---

## 4. データモデル

### 4.1 Quest（`quests[]` 要素）— 拡張

| フィールド | 型 | 説明 |
|------------|-----|------|
| `id` | string \| number | 既存（投稿時 `Date.now()` 推奨を string 化） |
| `questStatus` | `'pending_spawn' \| 'on_island' \| 'resolved'` | **新規** |
| `linkedBugId` | string \| null | 島上の不満 id（出現後） |
| `isMine` | boolean | 自分の投稿（AR時 `true`） |
| `captureMode` | `'onsite' \| 'map'` | 既存（doc24） |
| `mapPin` | `[x, z]` \| null | 地図モードのワールド座標 |
| `comment`, `photo`, `needType`, `type`, … | 既存 | ARウィザード由来 |

**既存セーブ互換**: `questStatus` 未設定 → `pending_spawn`（手動配置待ち）またはデモ用 quest は `on_island` 扱いしない。

### 4.2 Bug（`bugs[]` 要素）— 拡張

| フィールド | 型 | 説明 |
|------------|-----|------|
| `sourceQuestId` | string \| number \| null | **新規**。どの投稿から生まれたか |
| `fromPost` | boolean | **新規**。AR/クエスト由来（デフォルト不満と区別） |
| 既存 | `solved`, `chosenPlan`, `allowedPlans`, … | 維持 |

`normalizeBug`（`bugFactory.js`）に `sourceQuestId`, `fromPost` を透過追加。

### 4.3 研究ログ（Store 新規または `postStats` 拡張）

```javascript
// postStats 拡張案（既存 normalizePostStats と整合）
{
  totalPosts: number,
  totalResolved: number,
  firstPostAwarded: boolean,
  events: [
    {
      t: number,              // Date.now()
      kind: 'post' | 'spawn' | 'resolve',
      questId,
      bugId?,
      captureMode?,
      chosenPlan?,
    }
  ]
}
```

**原則**: ゲームプレイを壊さない軽量ログ。エクスポートは `JSON.stringify(postStats)` で卒論メモ用。

---

## 5. 新規ヘルパー（純関数）

### 5.1 `src/store/helpers/questLifecycle.js`（新規）

| 関数 | 責務 |
|------|------|
| `createQuestFromPost(post)` | ARペイロード → quest オブジェクト（`isMine: true`, `questStatus: 'pending_spawn'`） |
| `questToBug(quest, worldPos)` | quest + 座標 → `normalizeBug` 済み bug（`sourceQuestId`, `fromPost: true`） |
| `resolveSpawnPosition(quest, islandChunks, mapPlayerPos)` | `mapPin` あればその XZ + `getIslandTopYAt`、なければプレイヤー近傍 or 本島中心オフセット |
| `markQuestOnIsland(questId, bugId)` | quest 更新パッチ |
| `markQuestResolved(questId, bugId, planId)` | quest `resolved` + ログイベント |

### 5.2 `src/utils/questFeedback.js`（新規）

| 関数 | 責務 |
|------|------|
| `buildSpawnToast(quest)` | 「島の◯◯付近にあなたの投稿が現れました」 |
| `buildResolveToast(quest, planId)` | 「『コメント先頭20字…』が解決されました（照明プラン）」 |

---

## 6. Store アクション

### 6.1 `ingestQuestPost(post)` — `setterSlice` または `bugSlice`

**入力**: `ARPostingMode` の Bad ペイロード  
**処理**:

1. `createQuestFromPost(post)` で quest 作成
2. `setQuests` に先頭追加
3. **`spawnQuestOnIsland(quest.id)` を直ちに呼ぶ**（Phase 1 の核心）
4. `awardPostCoins` は `App.jsx` 側のままでも可（順序: コイン → ingest）

### 6.2 `spawnQuestOnIsland(questId)`

1. quest 取得。`questStatus !== 'pending_spawn'` なら return
2. `resolveSpawnPosition` で `[x,y,z]`
3. `questToBug` → `bugs` に追加（id は `bug_${questId}` 等で一意化）
4. quest を `{ questStatus: 'on_island', linkedBugId }` に更新
5. `farmingToast` / `islandToast` で spawn メッセージ
6. `postStats.events` に `spawn` 記録

**手動配置**: Phase 3 まで残す場合、`pending_spawn` のみ「配置場所を決める」表示。自動出現後はボタンを「島で見る」に変更。

### 6.3 `finishBuildMode` 拡張 — `bugSlice.js`

解決成功時、対象 bug に `sourceQuestId` があれば:

1. 対応 quest を `resolved` に
2. `buildResolveToast` → `farmingToast`（5秒）
3. `postStats.totalResolved++` / `events` に `resolve`
4. （任意）`isQuestBoardOpen` を true にしてハイライト

### 6.4 コインの位置づけ（方針）

- **維持**: 投稿直後の `awardPostCoins`（味付け）
- **追加しない**: 解決時の大量コイン（ループの主報酬にしない）
- トースト優先順位: 解決メッセージ > コイン > 副作用トースト

---

## 7. UI 変更

### 7.1 `QuestBoardOverlay`（`Overlays.jsx`）

| questStatus | 表示 | ボタン |
|-------------|------|--------|
| `pending_spawn` | 未配置（レガシー・デモquest） | 「配置場所を決める」 |
| `on_island` | 「島に出現中」バッジ + captureMode | 「島で見る」（カメラ誘導は Phase 3） |
| `resolved` | 「解決済み」+ 日付 | 無効 or 「記録を見る」 |

**タブ（任意 P2）**: 「あなたの投稿」/「みんなの声」— `isMine` でフィルタ。

### 7.2 `ARPostingMode` 送信後

- クエストボードを開く前に **全画面1枚**（1.5秒）:
  - 「記録を島に載せました」
  - サブ: 「散歩すると黒いオーブとして現れます。直すとまちが変わります」
- その後 `setIsQuestBoardOpen(true)`（現行維持）

### 7.3 島上の見た目（最小）

- `fromPost === true` のオーブ: 既存と同色でも可。P1 でリング色 or 小アイコン（📍）。
- `MainGameScene` の bug マーカー分岐。

### 7.4 `WorldMapPanel`（P2・任意）

- `on_island` かつ `mapPin` ありの quest を **未解決ピン** として表示（プレイヤー位置とは別色）。
- 解決済みはグレーアウト。

---

## 8. 実装フェーズ

### Phase B0 — データ基盤（0.5〜1日）

**目的**: 壊さずにフィールドを通す。

- [ ] `bugFactory.normalizeBug` に `sourceQuestId`, `fromPost`
- [ ] `createQuestFromPost` / 定数 `QUEST_STATUS`
- [ ] `App.jsx` Bad投稿時 `isMine: true`, id を string 統一
- [ ] セーブ/load で新フィールド保持（`normalize` on load）
- [ ] 既存 `quests` / `bugs` は status 省略時デフォルト

**受け入れ**: リロード後も `sourceQuestId` が残る。

---

### Phase B1 — 自動出現（1〜1.5日）★核心

**目的**: 手動配置なしで「投稿 → 島に課題」。

- [ ] `questLifecycle.js`（spawn位置・questToBug）
- [ ] `ingestQuestPost` + `spawnQuestOnIsland`
- [ ] `App.jsx` `onPost` を `ingestQuestPost` 経由に変更
- [ ] 出現トースト
- [ ] デモ用 `createDefaultQuests` は `pending_spawn` のまま手動配置可（チュートリアル両立）

**受け入れ**:

1. Bad AR投稿 → クエストボードに「島に出現中」
2. 島を歩くとオーブあり、`sourceQuestId` が一致
3. 手動配置しなくても DIY に入れる

---

### Phase B2 — 解決の返信（1日）★核心

**目的**: FixMyStreet 的「効いた感」。

- [ ] `finishBuildMode` で quest `resolved` + トースト
- [ ] `QuestBoardOverlay` 解決済みUI
- [ ] `buildResolveToast`（コメント抜粋 + プラン名）

**受け入れ**:

1. 投稿由来バグを解決 → 「あなたの投稿が解決されました」系トースト
2. ボード上も resolved 表示
3. 同じ bug を再解決しようとしない（`solved` 既存）

---

### Phase B3 — 研究ログ（0.5日）

- [ ] `postStats.events` / `totalResolved`
- [ ] `awardPostCoins` / spawn / finish でイベント追記
- [ ] 開発用: `TopRightPanel` またはコンソール `exportPostLog()`（任意）

**受け入れ**: 1プレイ後に JSON で post→spawn→resolve の順が読める。

---

### Phase B4 — 磨き（0.5〜1日・任意）

- [ ] 「島で見る」: `mapPlayerPos` / bug.pos へカメラ誘導（`CameraRig` or 一時 `viewMode`）
- [ ] クエストカードに `captureMode` バッジ（doc24 P1）
- [ ] 手動配置フロー削除 or 「上級者モード」に格下げ
- [ ] `docs/03_ゲームの仕様.md`, `docs/16` に1段落追記

---

## 9. ファイル変更一覧

| 優先 | ファイル | 変更 |
|:----:|----------|------|
| P0 | `src/store/helpers/questLifecycle.js` | **新規** |
| P0 | `src/utils/questFeedback.js` | **新規** |
| P0 | `src/store/helpers/bugFactory.js` | normalize 拡張 |
| P0 | `src/store/slices/setterSlice.js` | `ingestQuestPost`, `spawnQuestOnIsland` |
| P0 | `src/store/slices/bugSlice.js` | `finishBuildMode` で quest 解決連動 |
| P0 | `src/App.jsx` | `onPost` 配線 |
| P1 | `src/components/ui/Overlays.jsx` | QuestBoard ステータスUI |
| P1 | `src/components/ui/ARPostingMode.jsx` | 送信後インタースティシャル |
| P2 | `src/components/3d/MainGameScene.jsx` | 投稿由来オーブ見た目 |
| P2 | `src/components/ui/hud/WorldMapPanel.jsx` | 未解決投稿ピン |
| P2 | `src/constants/postingEconomy.js` | コイン文言調整（主動機でない注記） |
| P2 | `docs/25_...md` | 実装後に「プロトタイプで検証した設計」1節 |

**触らない（原則）**: フェリー・建築コア・`barrierActions` 判定ロジック（解決条件は現状維持）。

---

## 10. 受け入れ基準（総合チェックリスト）

### ループの閉じ（必須）

- [ ] Bad投稿後、**手動配置なし**で島に不満が出る
- [ ] その不満に `sourceQuestId` があり、クエストと対応が取れる
- [ ] 解決後、**投稿者向けメッセージ**（トースト or ボード）で「自分の投稿が直った」と分かる
- [ ] 解決後クエストは `resolved` で残る（消えて迷子にならない）

### 研究・デモ

- [ ] 1人プレイで post → spawn → resolve のログが残る
- [ ] コインは投稿時のみ主張せず、解決の主報酬は「変化の可視化」
- [ ] デモ用初期クエスト（手動配置）が壊れていない

### 回帰

- [ ] フリー建築・既存バグ（b1等）・島拡張・フェリー
- [ ] Good投稿 → goodSpots（ループ外）
- [ ] セーブ互換（旧セーブでクラッシュしない）

---

## 11. リスクと対策

| リスク | 対策 |
|--------|------|
| 自動出現位置が海／島外 | `resolveSpawnPosition` で chunk 内クランプ + `getIslandTopYAt` |
| quest.id と bug.id 衝突 | bug id を `bug_q_${questId}` 固定 |
| トースト過多 | 優先度キュー（解決 > spawn > コイン） |
| 手動配置と二重出現 | spawn 後は `pending_spawn` から遷移、配置ボタン非表示 |
| 卒論で「促進を実証した」と言いすぎ | 本文は「設計上応答性を保証」、ユーザー数Nは別途UT |

---

## 12. PR 分割案

| PR | 内容 | レビュー焦点 |
|----|------|--------------|
| **PR-B0** | データモデル + normalize + セーブ | 互換性 |
| **PR-B1** | 自動出現 + ingest | 座標・DIY入れるか |
| **PR-B2** | 解決返信 + QuestBoard | 文言・感情 |
| **PR-B3** | ログ + 任意UI | 卒論エクスポート |

---

## 13. doc24 / docs/25 との関係

```
docs/24（入口）          docs/26（本計画・閉じ）
  現地/地図 2択      →     投稿メタを spawn 位置に使う
  コイン差分         →     主動機にしない（25と整合）
  MapPinPicker       →     mapPin → resolveSpawnPosition

docs/25（根拠）          docs/26（実装）
  応答性+54%         →     finishBuildMode 後フィードバック
  コインcrowding-out →     解決報酬はトースト+可視化
```

---

## 14. 次のアクション

1. **Phase B0 → B1** を先に実装（自動出現だけでデモ価値が大きい）
2. 動かしたら **B2**（解決返信）でループ完成
3. 卒論メモ用に **B3** ログを1セッション分取得

---

*作成: 2026-06 — `docs/25` レビューと現行コード（`App.jsx`, `bugSlice`, `useBuildPointerPlacement`）に基づく。*
