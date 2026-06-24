# Supabase（クラウド同期）の設定

街歩き中でも LTE 経由で他の人の投稿と同期するには Supabase を使います。

## 1. プロジェクト作成

1. [supabase.com](https://supabase.com) でプロジェクトを作成
2. **Authentication → Providers → Anonymous sign-ins** を **有効化**

## 2. データベース

SQL Editor で以下を順に実行:

- `supabase/migrations/001_ar_annotations.sql`
- `supabase/migrations/002_storage_policies.sql`

## 3. Storage

1. **Storage → New bucket**
2. 名前: `ar-photos`
3. **Public bucket** を ON（読み取りは公開）

## 4. 環境変数

プロジェクトルートに `.env.local` を作成:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

`.env.example` を参照。

## 5. 起動

```bash
npm run dev:mobile
```

ホームの「同期」が **クラウド** と表示されれば OK。

## 優先順位（API モード）

| 条件 | モード |
|------|--------|
| `VITE_SUPABASE_*` あり | **クラウド**（推奨・街歩き向け） |
| `VITE_AR_API_URL` のみ | LAN（`npm run ar:server`） |
| どちらもなし | ローカル（端末内のみ） |

## スパム・江東区外

- DB の CHECK 制約で江東区外の緯度経度を拒否
- 1 ユーザーあたり **1 時間 10 投稿** まで（DB トリガー）
- クライアントでもコメント長・江東区チェック

## 写真

- 投稿時に Storage `ar-photos/{userId}/{id}.jpg` へアップロード
- DB には URL のみ保存（base64 は載せない）

## 本番デプロイ

Supabase 設定後、Vercel へ載せる手順は [32_AR_本番デプロイ_Supabase_Vercel.md](./32_AR_本番デプロイ_Supabase_Vercel.md) を参照。
