import React from 'react';
import { X, Home, Map, Plus, BookOpen, Cloud, Crosshair } from 'lucide-react';
import { AR_THEME } from '../constants/arTheme';

const STEPS = [
  {
    icon: Home,
    title: 'ホーム',
    body: '「新しく記録する」「地図で見る」「記録図鑑」から選びます。同期はクラウド（Supabase 設定時）・LAN・ローカルのいずれかです。',
  },
  {
    icon: Plus,
    title: '新しく記録する',
    body: '① 場所（現在地 / 地図 / カメラ）→ ② 撮影の説明 → ③ 枠だけの撮影 → ④ 質問に回答。地図指定がいちばん正確です。',
  },
  {
    icon: Crosshair,
    title: '現在地モードの GPS',
    body: '「GPS精度」パネルが良好になるまで屋外で待ってから刺してください。低いときは地図指定を推奨します。',
  },
  {
    icon: Map,
    title: '地図で見る',
    body: '全員のピンを地図で確認。タップで記録を読めます。右上カメラから現地 AR（おおよその方向ガイド）も使えます。',
  },
  {
    icon: BookOpen,
    title: '記録図鑑',
    body: '「自分 / みんな」で絞り込み、タグ・検索もできます。自分の記録だけ編集・削除できます。',
  },
  {
    icon: Cloud,
    title: '同期について',
    body: 'Supabase を設定すると、LTE でも他の人の投稿と同期します（LAN 不要）。未設定時は同一 Wi‑Fi の ar:server または端末内のみ。',
  },
];

export function ArHelpSheet({ onClose }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 12000,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }}
    >
      <div style={{
        background: AR_THEME.panel,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: '24px 20px 32px',
        color: AR_THEME.text,
        maxHeight: '85vh',
        overflowY: 'auto',
      }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 22 }}>使い方</h2>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: AR_THEME.text, cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.title} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'rgba(79,195,247,0.15)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
              >
                <Icon size={24} color={AR_THEME.accent} />
              </div>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{i + 1}. {step.title}</div>
                <div style={{ fontSize: 14, color: AR_THEME.muted, lineHeight: 1.55 }}>{step.body}</div>
              </div>
            </div>
          );
        })}

        <div style={{
          padding: '14px 16px',
          borderRadius: 14,
          background: 'rgba(255,255,255,0.05)',
          fontSize: 13,
          lineHeight: 1.55,
          color: AR_THEME.muted,
        }}
        >
          現地カメラ AR は数 m の誤差があります。正確な位置は地図のピンで確認してください。投稿は江東区内のみ。
        </div>
      </div>
    </div>
  );
}
