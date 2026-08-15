# AR 困り型分類（LLM）— 運用者向けセットアップ手順

投稿確認画面で LLM が困り型を提案し、参加者は **「合っていますか？ はい / 違う」** だけ答えます。  
LLM が使えないときは、自動で辞書フォールバックに切り替わります（投稿自体は止まりません）。

---

## 0. 全体像（先に読む）

### 役割分担


| 誰             | 何をする                                        |
| ------------- | ------------------------------------------- |
| **あなた（運用者）**  | LLM API キー取得、Supabase 設定、Edge Function デプロイ |
| **アプリ（実装済み）** | 固定質問 → 分類 API 呼び出し → 確認 UI → Supabase へ保存   |


### データの流れ

```
参加者が困りごとを入力
  → アプリが Supabase Edge Function を呼ぶ
  → Edge Function が LLM API を叩く（キーはサーバー側のみ）
  → 「歩きにくい」等を提案
  → 参加者が「はい」or「違う」
  → 投稿データ（classification 付き）を Supabase DB に保存
```

### 重要：キーを置く場所


| 置く場所                   | 入れるもの                                         | 入れないもの   |
| ---------------------- | --------------------------------------------- | -------- |
| **Supabase Secrets**   | `LLM_API_KEY` など                              | —        |
| `.env.local`**（ローカル）** | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | ❌ LLM キー |
| **Vercel 環境変数（本番）**    | 上と同じ Supabase 2 つ                             | ❌ LLM キー |


LLM キーを `.env.local` や Vercel に入れると、ブラウザから漏れる可能性があります。**必ず Supabase Secrets のみ**に置いてください。

### 所要時間の目安


| 状況                     | 目安      |
| ---------------------- | ------- |
| Supabase 未設定 → 全部やる    | 60〜90 分 |
| Supabase 済み → LLM だけ追加 | 20〜30 分 |


---



## 1. 事前チェックリスト

以下が **すべて ✅** になってから LLM 設定に進んでください。

- [ ] [supabase.com](https://supabase.com) でプロジェクトを作成済み
- [ ] **Authentication → Providers → Anonymous sign-ins** が **Enable**
- [ ] SQL を実行済み（`supabase/migrations/001_ar_annotations.sql`, `002_storage_policies.sql` など）
- [ ] Storage バケット `ar-photos` を **Public** で作成済み
- [ ] プロジェクトルートに `.env.local` があり、Supabase URL / anon key を設定済み
- [ ] `npm run dev:mobile` で AR アプリが開き、同期が **クラウド** 表示になる

Supabase 未設定の場合は先に [31_AR_Supabase設定.md](./31_AR_Supabase設定.md) を完了してください。

---



## 2. LLM API キーを取得する

**OpenAI 互換**の Chat Completions API なら何でも動きます。  
迷ったら **OpenAI + gpt-4o-mini** が一番手順が少ないです。

### 2-A. OpenAI を使う場合（推奨・初心者向け）

1. [platform.openai.com](https://platform.openai.com/) にログイン（アカウント作成）
2. 左メニュー **API keys** → **Create new secret key**
3. 名前は例: `urban-alchemist-ar`
4. 表示された `sk-...` を **コピーして安全な場所に保存**（再表示不可）
5. **Billing** で支払い方法を登録（未登録だと API が 429/402 になる）

**このあと使う Secrets:**

```text
LLM_API_KEY=sk-...（コピーしたキー）
LLM_MODEL=gpt-4o-mini
（LLM_API_BASE_URL は不要 — OpenAI デフォルト）
```



### 2-B. OpenRouter 等を使う場合

1. 各サービスで API キーを発行
2. モデル名をドキュメントで確認（例: `openai/gpt-4o-mini`）
3. Base URL が OpenAI と違う場合は Secrets に追加

```text
LLM_API_KEY=（サービスのキー）
LLM_MODEL=openai/gpt-4o-mini
LLM_API_BASE_URL=https://openrouter.ai/api/v1
```

### 2-C. Google Gemini を使う場合（OK）

Gemini も **OpenAI 互換エンドポイント** があるので、そのまま使えます。  
コード変更は不要で、Secrets だけ差し替えます。

1. [Google AI Studio](https://aistudio.google.com/) にログイン
2. **Get API key** → 新しいキーを作成
3. 表示されたキーをコピー（`AIza...` 形式）

**Supabase Secrets に入れる値:**

```text
LLM_API_KEY=AIza...（AI Studio のキー）
LLM_MODEL=gemini-2.5-flash
LLM_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
```

登録コマンド例:

```bash
supabase secrets set LLM_API_KEY=AIzaxxxxxxxx
supabase secrets set LLM_MODEL=gemini-2.5-flash
supabase secrets set LLM_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
supabase functions deploy classify-annotation
```

**モデル名の例**（AI Studio で利用可能なものを選ぶ）:

| モデル | 特徴 |
|--------|------|
| `gemini-2.5-flash` | **推奨** — 2.0 Flash の後継・ワークショップ向け |
| `gemini-3.6-flash` | より新しい Flash（分類タスクにも可） |
| `gemini-2.5-pro` | 精度重視（やや遅い・高め） |

> ⚠️ `gemini-2.0-flash` は **2026年6月に提供終了** しています。使うと HTTP 404 になります。

公式: [Gemini OpenAI compatibility](https://ai.google.dev/gemini-api/docs/openai) · [Deprecations](https://ai.google.dev/gemini-api/docs/deprecations)

**OpenRouter 経由で Gemini を使う方法**（Google キーを Supabase に直接入れたくない場合）:

```text
LLM_API_KEY=（OpenRouter のキー）
LLM_MODEL=google/gemini-2.5-flash
LLM_API_BASE_URL=https://openrouter.ai/api/v1
```

**注意:** Gemini の無料枠にはレート制限があります。本番ワークショップ前に 1 件テスト投稿して、Edge Function Logs で `source: llm` になることを確認してください。

---



## 3. Supabase CLI を入れる（Mac）

ターミナルで:

```bash
brew install supabase/tap/supabase
```

Homebrew がない場合: [Supabase CLI 公式](https://supabase.com/docs/guides/cli/getting-started) を参照。

バージョン確認:

```bash
supabase --version
```

---



## 4. Supabase にログイン & プロジェクトをリンク



### 4.1 ログイン

```bash
supabase login
```

ブラウザが開く → Supabase アカウントで許可。

### 4.2 Project Ref を調べる

1. [supabase.com/dashboard](https://supabase.com/dashboard) を開く
2. 対象プロジェクトをクリック
3. **Project Settings**（歯車）→ **General**
4. **Reference ID** をコピー（例: `abcdefghijklmnop`）



### 4.3 リポジトリでリンク

プロジェクトフォルダ（`urban-alchemist`）で:

```bash
cd /path/to/urban-alchemist
supabase link --project-ref ここにReferenceID
```

DB パスワードを聞かれたら、プロジェクト作成時のパスワードを入力。

---



## 5. LLM 用 Secrets を登録する



### 方法 A: ターミナル（推奨）

```bash
supabase secrets set LLM_API_KEY=sk-あなたのキー
supabase secrets set LLM_MODEL=gpt-4o-mini
```

OpenAI 以外を使う場合のみ:

```bash
supabase secrets set LLM_API_BASE_URL=https://openrouter.ai/api/v1
```

登録確認:

```bash
supabase secrets list
```

`LLM_API_KEY`, `LLM_MODEL` が表示されれば OK（値そのものは表示されません）。

### 方法 B: Dashboard

1. Supabase Dashboard → **Project Settings**
2. **Edge Functions** → **Secrets**（または **Manage secrets**）
3. **Add secret** で上記 2〜3 個を追加


| Secret 名           | 必須          | 例                              |
| ------------------ | ----------- | ------------------------------ |
| `LLM_API_KEY`      | ✅           | `sk-...`                       |
| `LLM_MODEL`        | ✅ 推奨        | `gpt-4o-mini`                  |
| `LLM_API_BASE_URL` | OpenAI 以外のみ | `https://openrouter.ai/api/v1` |


---



## 6. Edge Function をデプロイする

リポジトリ直下で:

```bash
supabase functions deploy classify-annotation
```

成功すると末尾に URL っぽい表示が出ます。  
Dashboard → **Edge Functions** に `classify-annotation` が増えていれば OK。

### デプロイ後の確認

Dashboard → **Edge Functions** → **classify-annotation** → **Details**

- Status: Active
- Verify JWT: **ON のまま**（匿名 Auth 経由で呼ぶ想定）

---



## 7. ローカル環境変数（再確認）

プロジェクトルートの `.env.local`:

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

**取得場所:** Dashboard → **Project Settings** → **API**  

- Project URL → `VITE_SUPABASE_URL`  
- anon public → `VITE_SUPABASE_ANON_KEY`

`.env.local` を変更したら **dev サーバーを再起動**:

```bash
npm run dev:mobile
```

---



## 8. 動作確認（この順で）



### 8.1 アプリがクラウドモードか

1. ブラウザで AR アプリを開く（通常 `https://localhost:5173/ar.html` など）
2. 同期表示が **クラウド** になっていること



### 8.2 困りごと投稿テスト

1. **困りごと** を選ぶ
2. 例: 「段差が高くて車いすでは上がれない」と入力
3. 場所などを進めて **確認画面** へ
4. 次が表示されれば UI は OK:
  - 提案された困り型（例: **歩きにくい** + 説明文）
  - **はい** / **違う**



### 8.3 LLM が動いているか

**Supabase Dashboard** → **Edge Functions** → **classify-annotation** → **Logs**

- 投稿の確認画面に進んだタイミングで **Invoke** ログが出る
- エラーがなければ LLM 経由で分類成功

**投稿データの確認:**  
**Table Editor** → `ar_annotations` → 最新行 → `payload` → `classification`


| `classification.source` | 意味                   |
| ----------------------- | -------------------- |
| `llm`                   | ✅ LLM 分類成功           |
| `fallback`              | 辞書のみ（LLM 未設定 or エラー） |




### 8.4 確認用コマンド（任意・上級者）

匿名セッション取得後に Function を直接叩く方法もありますが、**8.2 + 8.3 で十分**です。

---



## 9. 本番（Vercel）に載せる場合

Vercel の **Environment Variables** に入れるのは **Supabase 2 つだけ**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

LLM キーは **Vercel に入れない**。Edge Function は Supabase 上で動くので、Secrets はそのまま本番でも使われます。

詳細: [32_AR_本番デプロイ_Supabase_Vercel.md](./32_AR_本番デプロイ_Supabase_Vercel.md)

---



## 10. うまくいっているか早見表


| 見た目・データ                              | 状態                               |
| ------------------------------------ | -------------------------------- |
| 確認画面に「はい / 違う」                       | UI OK                            |
| `classification.source` = `llm`      | ✅ 完全成功                           |
| `classification.source` = `fallback` | 動くが LLM 未使用 → セクション 11 へ         |
| Edge Function Logs に 503             | Secrets or API キー or 課金          |
| Edge Function Logs に 401             | 匿名 Auth 無効                       |
| Logs に何も出ない                          | Supabase 未リンク / `.env.local` 未設定 |


---



## 11. トラブルシュート



### 常に `fallback` になる

1. `supabase secrets list` で `LLM_API_KEY` があるか
2. `supabase functions deploy classify-annotation` を再実行
3. Edge Function Logs のエラーメッセージを読む
4. OpenAI の場合: Billing 登録済みか



### `401 Unauthorized`

1. Dashboard → **Authentication → Providers**
2. **Anonymous sign-ins** を **Enable**
3. アプリをリロードして再投稿



### LLM が遅い（確認画面の「整理中…」が長い）

1. `LLM_MODEL` を軽量モデルに（`gpt-4o-mini` 等）
2. ワークショップ前日に 1 投稿テストして体感を確認



### 分類精度が低い

- プロンプト調整: `supabase/functions/classify-annotation/index.ts`
- 変更後は再デプロイ: `supabase functions deploy classify-annotation`
- 参加者の「違う」修正率は `classification.status === 'user_edited'` で分析可能

---



## 12. やらなくてよいこと

- ❌ LLM キーを GitHub / `.env.local` / Vercel にコミット
- ❌ 参加者に API キーを配る
- ❌ 8 型を参加者に暗記させる（UI が確認を担う）
- ❌ 全投稿をファシリが手動チェック（`user_edited` だけ事後確認で可）

---



## 13. コスト目安

- 1 困りごと投稿 ≒ LLM 1 回（短い JSON 応答）
- 50 人 × 3 投稿 = 150 回
- `gpt-4o-mini` なら **数セント〜数十セント程度** が目安（要: OpenAI 料金表確認）

---



## 14. 最短コマンドまとめ（Supabase 済みの人向け）

```bash
# 1. CLI
brew install supabase/tap/supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# 2. Secrets（OpenAI の例）
supabase secrets set LLM_API_KEY=sk-xxxxxxxx
supabase secrets set LLM_MODEL=gpt-4o-mini

# 3. デプロイ
supabase functions deploy classify-annotation

# 4. ローカル起動（.env.local 設定済み前提）
npm run dev:mobile
```

その後、困りごと 1 件投稿 → Logs で `llm` → 完了。