import React from 'react';
import { X, Home, Camera, Eye, Map, BookOpen, Heart } from 'lucide-react';
import { AR_HOME } from '../constants/arTheme';

const STEPS = [
  {
    icon: Home,
    title: 'ホームは2つだけ',
    body: '「記録する」か「みんなの声を見る」を選びます。記録するを押すと、お題か自由かを選べます。',
  },
  {
    icon: Camera,
    title: '記録する',
    body: '① 撮影する → ② 写真の気になるところをタップ → ③ 質問に答えて送信。位置は撮影中に自動で取得し、最後に地図で直せます。',
  },
  {
    icon: Eye,
    title: 'みんなの声を見る',
    body: 'カメラをかざして探す、地図から探す、一覧リストで見る、の3つから選べます。カメラでは近くのピンを探せます。',
  },
  {
    icon: Map,
    title: '地図から探す',
    body: 'マップ上で場所を確認しながら、投稿を見ることができます。',
  },
  {
    icon: BookOpen,
    title: '一覧リストで見る',
    body: '「みんな / 自分」で絞り込み、検索もできます。自分の記録だけ編集・削除できます。',
  },
  {
    icon: Heart,
    title: '共感ポイント',
    body: '記録するとポイントが増えます。記録一覧で他人の投稿に 1pt 使って「共感」できます。自分の記録には使えません。',
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
          color: AR_HOME.textSecondary,
          fontWeight: 600,
        }}
        >
          位置はおおよそです。かざして見るピンがずれることがあります。正確な位置は地図で確認してください。
        </div>
      </div>
    </div>
  );
}
