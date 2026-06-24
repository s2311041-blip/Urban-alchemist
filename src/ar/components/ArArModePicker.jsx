import React from 'react';
import { Camera, MapPin, Smartphone, ChevronLeft } from 'lucide-react';
import { AR_THEME } from '../constants/arTheme';
import { AR_MODE_OPTIONS } from '../constants/arGuideSteps';

export function ArArModePicker({ purpose = 'view', onSelect, onClose }) {
  const isPost = purpose === 'post';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 11000,
      background: '#060d18',
      color: AR_THEME.text,
      display: 'flex',
      flexDirection: 'column',
    }}
    >
      <header style={{
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
      >
        <button type="button" onClick={onClose} style={backBtnStyle}>
          <ChevronLeft size={20} />
          戻る
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: AR_THEME.accent }}>
            {isPost ? '記録のしかたを選ぶ' : '見方を選ぶ'}
          </div>
          <div style={{ fontWeight: 'bold', fontSize: 17 }}>どちらを使いますか？</div>
        </div>
      </header>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 16px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
      >
        <p style={{
          margin: 0,
          fontSize: 14,
          lineHeight: 1.6,
          color: AR_THEME.muted,
        }}
        >
          {isPost
            ? '初めての方は「カメラで見る（かんたん）」がおすすめです。'
            : 'ARがうまくいかないときは、地図のピンをタップするだけでも記録を読めます。'}
        </p>

        <ModeCard
          icon={Smartphone}
          option={AR_MODE_OPTIONS.xr}
          accent={AR_THEME.accentWarm}
          onClick={() => onSelect('xr')}
        />
        <ModeCard
          icon={Camera}
          option={AR_MODE_OPTIONS.geo}
          accent={AR_THEME.accent}
          onClick={() => onSelect('geo')}
          recommended={isPost}
        />

        {!isPost && (
          <button type="button" onClick={() => onSelect('map')} style={mapOnlyStyle}>
            <MapPin size={20} />
            地図だけで見る（カメラ不要）
          </button>
        )}
      </div>
    </div>
  );
}

function ModeCard({ icon: Icon, option, accent, onClick, recommended }) {
  return (
    <button type="button" onClick={onClick} style={cardStyle}>
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        background: `${accent}33`,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
      >
        <Icon size={26} color={accent} />
      </div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 'bold', fontSize: 17 }}>{option.title}</span>
          <span style={{
            fontSize: 10,
            fontWeight: 'bold',
            padding: '3px 8px',
            borderRadius: 8,
            background: recommended ? 'rgba(102,187,106,0.25)' : 'rgba(79,195,247,0.2)',
            color: recommended ? '#81c784' : AR_THEME.accent,
          }}
          >
            {recommended ? '初めておすすめ' : option.badge}
          </span>
        </div>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.45, color: AR_THEME.muted }}>
          {option.summary}
        </p>
        <ol style={{
          margin: 0,
          paddingLeft: 18,
          fontSize: 12,
          color: AR_THEME.text,
          lineHeight: 1.5,
        }}
        >
          {option.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </div>
    </button>
  );
}

const backBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  background: 'rgba(255,255,255,0.08)',
  border: 'none',
  borderRadius: 12,
  padding: '8px 12px',
  color: AR_THEME.text,
  cursor: 'pointer',
  fontSize: 14,
};

const cardStyle = {
  display: 'flex',
  gap: 14,
  padding: 16,
  borderRadius: 18,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.04)',
  color: AR_THEME.text,
  cursor: 'pointer',
  textAlign: 'left',
  width: '100%',
};

const mapOnlyStyle = {
  marginTop: 8,
  padding: 14,
  borderRadius: 14,
  border: '1px dashed rgba(255,255,255,0.25)',
  background: 'transparent',
  color: AR_THEME.muted,
  fontSize: 14,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};
