import React from 'react';
import { X, Camera, Eye, Heart, Map, Smartphone, List } from 'lucide-react';
import { AR_HOME } from '../constants/arTheme';

const VIEW_WAYS = [
  {
    icon: Smartphone,
    title: 'かざして見る',
    body: '実際の風景の中に浮かぶピンを探せます。',
  },
  {
    icon: Map,
    title: '地図で見る',
    body: 'マップ上で街全体のピンを探せます。',
  },
  {
    icon: List,
    title: '一覧で見る',
    body: '投稿をじっくり読んだり、自分の記録を管理できます。',
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
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>アプリの使い方</h2>
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

        <HelpBlock
          n={1}
          icon={Camera}
          title="街の気になるところを「記録する」"
        >
          <p style={styles.body}>
            気になる場所で写真を撮り、簡単な質問に答えるだけで、街の地図にピンを残せます。
          </p>
          <p style={styles.note}>
            ※場所は自動で取得されますが、後から地図で微調整もできます。
          </p>
        </HelpBlock>

        <HelpBlock
          n={2}
          icon={Eye}
          title="街のみんなの声を「見る」"
        >
          <p style={styles.body}>
            街の中に集まった声は、3つの方法で楽しめます。
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {VIEW_WAYS.map((way) => {
              const Icon = way.icon;
              return (
                <div key={way.title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Icon size={18} color={AR_HOME.primary} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: AR_HOME.text }}>
                      {way.title}
                    </div>
                    <div style={{ fontSize: 13, color: AR_HOME.textSecondary, lineHeight: 1.5 }}>
                      {way.body}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </HelpBlock>

        <HelpBlock
          n={3}
          icon={Heart}
          title="「共感」で街を応援しよう"
        >
          <p style={{ ...styles.body, marginBottom: 0 }}>
            記録を投稿するとポイントがもらえます。共感できる投稿を見つけたら、ポイントを使って応援してみましょう！
          </p>
        </HelpBlock>

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
          ※かざして見るピンの位置は電波状況により多少ずれることがあります。正確な場所は「地図で見る」をご確認ください。
        </div>
      </div>
    </div>
  );
}

function HelpBlock({ n, icon: Icon, title, children }) {
  return (
    <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
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
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, marginBottom: 6, color: AR_HOME.text, fontSize: 16, lineHeight: 1.35 }}>
          {n}
          .
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}

const styles = {
  body: {
    margin: '0 0 8px',
    fontSize: 14,
    color: AR_HOME.textSecondary,
    lineHeight: 1.55,
  },
  note: {
    margin: 0,
    fontSize: 13,
    color: AR_HOME.textSecondary,
    lineHeight: 1.5,
    fontWeight: 600,
  },
};
