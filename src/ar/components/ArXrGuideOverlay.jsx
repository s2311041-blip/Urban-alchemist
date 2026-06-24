import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { AR_THEME } from '../constants/arTheme';

export function ArXrGuideOverlay({
  steps,
  activeStep = 0,
  compact = false,
}) {
  const [expanded, setExpanded] = useState(!compact);
  const step = steps[activeStep] ?? steps[0];
  const total = steps.length;

  if (!step) return null;

  return (
    <div style={{
      pointerEvents: 'auto',
      position: 'absolute',
      left: 12,
      right: 12,
      top: 64,
      zIndex: 20,
    }}
    >
      <div style={{
        background: 'rgba(0,0,0,0.82)',
        border: '1px solid rgba(79,195,247,0.35)',
        borderRadius: 16,
        overflow: 'hidden',
      }}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: AR_THEME.accent,
            color: '#0d1b2a',
            fontWeight: 'bold',
            fontSize: 14,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
          >
            {activeStep + 1}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: AR_THEME.accent, marginBottom: 2 }}>
              ステップ {activeStep + 1} / {total}
            </div>
            <div style={{ fontWeight: 'bold', fontSize: 15 }}>{step.title}</div>
          </div>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expanded && (
          <div style={{
            padding: '0 14px 14px',
            fontSize: 14,
            lineHeight: 1.55,
            color: '#e0e0e0',
          }}
          >
            <HelpCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4, opacity: 0.7 }} />
            {step.body}
          </div>
        )}
      </div>
    </div>
  );
}

/** 画面中央の照準（地面を合わせる目印） */
export function ArCenterTarget({ ready = false, label = 'ここに合わせる' }) {
  return (
    <div style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      zIndex: 12,
      textAlign: 'center',
    }}
    >
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        border: `3px ${ready ? 'solid' : 'dashed'} ${ready ? '#4fc3f7' : 'rgba(255,255,255,0.65)'}`,
        boxShadow: ready ? '0 0 20px rgba(79,195,247,0.6)' : 'none',
        margin: '0 auto',
        animation: ready ? 'arTargetPulse 1.2s ease-in-out infinite' : undefined,
      }}
      />
      <div style={{
        marginTop: 10,
        fontSize: 14,
        fontWeight: 'bold',
        textShadow: '0 2px 8px #000',
        color: ready ? '#4fc3f7' : '#fff',
      }}
      >
        {ready ? '準備OK — 下のボタンを押す' : label}
      </div>
      <style>{`
        @keyframes arTargetPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
