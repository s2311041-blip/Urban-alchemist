import React from 'react';
import { X, Home, Map, Plus, BookOpen, Heart, Crosshair } from 'lucide-react';
import { AR_HOME } from '../constants/arTheme';

const STEPS = [
  {
    icon: Home,
    title: 'ホーム',
    body: '「今月のお題」「特設のお題（あるときだけ）」「自由投稿」の3つから記録を始められます。お題を選ばずに記録することもできます。',
  },
  {
    icon: Plus,
    title: '記録の始め方',
    body: '① 場所（現在地 / 地図）→ ② 撮影 → ③ 空間注釈（任意）→ ④ 質問に回答。常設お題は毎月自動で切り替わります。',
  },
  {
    icon: Crosshair,
    title: '現在地で場所を決める',
    body: '「この位置で記録できます」と表示されたら刺せます。位置はおおよそで、数十メートルずれることがあります。正確には地図指定がおすすめです。',
  },
  {
    icon: Map,
    title: '地図で見る',
    body: 'みんなのピンを地図で確認できます。タップで記録の詳細を読めます。',
  },
  {
    icon: BookOpen,
    title: '記録図鑑',
    body: '「自分 / みんな」で絞り込み、検索もできます。自分の記録だけ編集・削除できます。',
  },
  {
    icon: Heart,
    title: 'ポイントと共感（いいね）',
    body: '記録するとポイントがもらえます。図鑑で他人の記録に 1 pt を使って「共感」できます。自分の記録には使えません。',
  },
];

export function ArHelpSheet({ onClose }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 12000,
      background: 'rgba(15, 23, 42, 0.35)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }}
    onClick={onClose}
    >
      <div
        style={{
          background: AR_HOME.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: '24px 20px 32px',
          color: AR_HOME.text,
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: AR_HOME.shadowLg,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>使い方</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: AR_HOME.surfaceMuted,
              border: `1px solid ${AR_HOME.border}`,
              borderRadius: 12,
              width: 44,
              height: 44,
              color: AR_HOME.textSecondary,
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <X size={22} />
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
                background: AR_HOME.primarySoft,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
              >
                <Icon size={24} color={AR_HOME.primary} />
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4, color: AR_HOME.text }}>
                  {i + 1}
                  .
                  {step.title}
                </div>
                <div style={{ fontSize: 14, color: AR_HOME.textSecondary, lineHeight: 1.55 }}>{step.body}</div>
              </div>
            </div>
          );
        })}

        <div style={{
          padding: '14px 16px',
          borderRadius: 14,
          background: AR_HOME.surfaceMuted,
          border: `1px solid ${AR_HOME.border}`,
          fontSize: 13,
          lineHeight: 1.55,
          color: AR_HOME.muted,
        }}
        >
          現地カメラ AR は数 m の誤差があります。正確な位置は地図のピンで確認してください。
        </div>
      </div>
    </div>
  );
}
