# AR 投稿アプリ — 本番デプロイ（Supabase → Vercel）

街歩きワークショップで **Mac なし・LTE 同期** を使うための手順。  
アプリ本体は Vercel、投稿データは Supabase に置く。


| 役割            | サービス         |
| ------------- | ------------ |
| 画面・カメラ UI の配信 | **Vercel**   |
| 投稿・写真・端末間同期   | **Supabase** |


**入口 URL:** `https://<your-project>.vercel.app/ar.html`（`/ar.html` を忘れない）

---

## 0. 前提

- GitHub アカウント
- [Supabase](https://supabase.com) アカウント（Free 枠で可）
- [Vercel](https://vercel.com) アカウント
- このリポジトリを GitHub に push 済み（またはこれから push）

ローカルで動くこと:

```bash
npm install
npm run build   # エラーなく完了すること
```

---

## 1. Supabase プロジェクト作成

### 1.1 プロジェクト

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. リージョンは **Northeast Asia (Tokyo)** 推奨（日本からの latency）
3. DB パスワードを控える（Dashboard 操作には通常不要）

### 1.2 匿名 Auth（必須）

1. **Authentication → Providers**
2. **Anonymous sign-ins** を **Enable**

投稿者はログイン画面なし。端末ごとに匿名ユーザー ID が付与される。

### 1.3 データベース（SQL）

**SQL Editor** で、リポジトリ内のファイルを **この順** で実行:

1. `supabase/migrations/001_ar_annotations.sql`
2. `supabase/migrations/002_storage_policies.sql`

実行後、**Table Editor** に `ar_annotations` テーブルがあることを確認。

### 1.4 Storage バケット

1. **Storage → New bucket**
2. Name: `ar-photos`
3. **Public bucket** を ON
4. Create

`002_storage_policies.sql` で RLS ポリシーは済んでいる。バケット名が `ar-photos` であることだけ確認。

### 1.5 API キーの取得

**Project Settings → API** から控える:


| 項目              | 用途                       |
| --------------- | ------------------------ |
| **Project URL** | `VITE_SUPABASE_URL`      |
| **anon public** | `VITE_SUPABASE_ANON_KEY` |


`service_role` キーは **Vercel に載せない**（サーバー専用・全権限）。

---

## 2. ローカルで Supabase 接続確認

プロジェクトルートに `.env.local` を作成（Git に commit しない）:

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

起動:

```bash
npm run dev:mobile
```

ブラウザで `https://localhost:5173/ar.html` を開き、ホームの同期表示が **クラウド** になれば OK。

**確認項目:**

- [ ] 投稿が成功する（江東区内の GPS）
- [ ] 別ブラウザ（またはシークレット）で同じ投稿が見える
- [ ] 写真付き投稿で Storage にファイルが増える

詳細は [31_AR_Supabase設定.md](./31_AR_Supabase設定.md) も参照。

---

## 3. Vercel デプロイ

### 3.1 リポジトリ連携

1. [vercel.com/new](https://vercel.com/new)
2. GitHub リポジトリ `urban-alchemist` を Import
3. Framework Preset: **Vite**（自動検出される想定）

### 3.2 ビルド設定


| 項目               | 値               |
| ---------------- | --------------- |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |


`vite.config.js` で `ar.html` が build input に入っているため、追加設定は通常不要。

### 3.3 環境変数

Vercel プロジェクト → **Settings → Environment Variables**:


| Name                     | Value                | Environment                      |
| ------------------------ | -------------------- | -------------------------------- |
| `VITE_SUPABASE_URL`      | Supabase Project URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | anon public key      | Production, Preview, Development |


`VITE_AR_API_URL` は **本番では設定しない**（クラウド優先のため）。

### 3.4 デプロイ

**Deploy** を実行。完了後:

```
https://<project-name>.vercel.app/ar.html
```

Production では HTTPS が標準 → iPhone のカメラ・コンパスがそのまま使える。

---

## 4. 本番動作確認チェックリスト

### 4.1 基本

- [ ] `/ar.html` が 404 にならない（ルート `/` はゲーム本体）
- [ ] ホームの同期が **クラウド**
- [ ] iPhone **Safari** で開ける（Google アプリ内ブラウザは不可のことが多い）

### 4.2 権限

- [ ] カメラ許可 → 投稿フローでプレビューが出る
- [ ] 位置情報許可 → GPS パネルに精度が表示される
- [ ] コンパス（向き）→ 現地 AR でピン位置が変わる

### 4.3 同期

- [ ] 端末 A で投稿 → 端末 B（別回線・LTE 可）で **みんな** に表示
- [ ] 写真 URL が Supabase Storage を指している

### 4.4 制限（仕様どおり）

- [ ] 江東区外の座標は投稿拒否
- [ ] 1 時間 10 投稿超は DB で拒否

---

## 5. 参加者への共有

**配る URL（例）:**

```
https://urban-alchemist.vercel.app/ar.html
```

**QR コード:** 上記 URL を QR 化して配布。

**一言説明:**

> Safari で開いて、位置情報・カメラを許可してください。  
> ホーム → ＋新規記録 → 現地で撮影して投稿。  
> みんなの記録は「記録図鑑」→「みんな」。

Mac や同一 Wi‑Fi は **不要**。

---

## 6. よくあるトラブル


| 症状             | 原因                         | 対処                          |
| -------------- | -------------------------- | --------------------------- |
| 同期が「ローカル」のまま   | 環境変数未設定・typo               | Vercel の Env を確認 → Redeploy |
| 投稿は成功するが写真が出ない | Storage バケット未作成 / 非 Public | Dashboard で `ar-photos` を確認 |
| 匿名 Auth エラー    | Anonymous sign-ins OFF     | Authentication → Providers  |
| 江東区外と出る        | GPS 精度 or 圏外               | 江東区内で再試行                    |
| カメラが動かない       | http で開いている                | `https://` の Vercel URL を使う |
| ビルド失敗          | 依存関係                       | ローカルで `npm run build` を先に通す |


---

## 7. 運用メモ（Free 枠）


| 項目          | 目安                               |
| ----------- | -------------------------------- |
| Supabase DB | 500 MB                           |
| Storage     | 1 GB                             |
| egress      | 5 GB/月                           |
| 非アクティブ      | 1 週間で pause（Dashboard から Resume） |


ワークショップ前に Supabase プロジェクトを一度触っておくと pause を避けやすい。

---

## 8. 開発 vs 本番


|       | 開発（Mac + スマホ）                      | 本番（街歩き）                          |
| ----- | ---------------------------------- | -------------------------------- |
| アプリ配信 | `npm run dev:mobile`               | Vercel                           |
| 同期    | Supabase または LAN                   | Supabase                         |
| URL   | `https://192.168.x.x:5173/ar.html` | `https://xxx.vercel.app/ar.html` |
| Mac   | 必要（dev 時）                          | 不要                               |


---

## 関連ドキュメント

- [30_RQ1_AR投稿アプリ.md](./30_RQ1_AR投稿アプリ.md) — 機能・画面構成
- [31_AR_Supabase設定.md](./31_AR_Supabase設定.md) — Supabase 詳細・API モード
- [33_AR_投稿設問の吟味.md](./33_AR_投稿設問の吟味.md) — 設問設計の見直し

