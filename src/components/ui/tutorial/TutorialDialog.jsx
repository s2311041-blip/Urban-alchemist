import React, { useMemo, useState } from 'react';
import { SATISFACTION_ATTRS, SATISFACTION_ATTR_BY_KEY } from '../../../constants/satisfactionAttributes';

const OVERLAY_STYLE = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(5, 10, 20, 0.88)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  backdropFilter: 'blur(8px)',
  padding: '16px',
  boxSizing: 'border-box',
};

function getLineColor(line) {
  if (line?.attributeKey) {
    return SATISFACTION_ATTR_BY_KEY[line.attributeKey]?.color ?? line.color ?? '#90caf9';
  }
  return line?.color ?? '#90caf9';
}

function AttributeIntroGrid() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
      gap: 12,
      minHeight: 'min(58vh, 640px)',
      flex: '1 1 auto',
    }}
    >
      {SATISFACTION_ATTRS.map((attr) => (
        <div
          key={attr.key}
          style={{
            borderRadius: 14,
            overflow: 'hidden',
            border: `1px solid ${attr.color}55`,
            background: 'rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <img
            src={attr.imageSrc}
            alt={attr.label}
            style={{
              width: '100%',
              flex: '1 1 auto',
              minHeight: 0,
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <div style={{
            padding: '6px 10px',
            borderTop: `2px solid ${attr.color}`,
            background: `${attr.color}18`,
            flexShrink: 0,
          }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, color: attr.color, lineHeight: 1.35 }}>
              {attr.label}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.72)', lineHeight: 1.3, marginTop: 2 }}>
              {attr.hint}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AttributeHeroImage({ attributeKey, color }) {
  const attr = SATISFACTION_ATTR_BY_KEY[attributeKey];
  if (!attr?.imageSrc) return null;

  return (
    <div style={{
      borderRadius: 16,
      overflow: 'hidden',
      border: `1px solid ${color}66`,
      boxShadow: `0 8px 28px ${color}33`,
      flex: '1 1 auto',
      minHeight: 'min(52vh, 560px)',
      display: 'flex',
    }}
    >
      <img
        src={attr.imageSrc}
        alt={attr.label}
        style={{
          width: '100%',
          height: '100%',
          minHeight: 'min(52vh, 560px)',
          maxHeight: 'min(68vh, 760px)',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>
  );
}

function SpeakerAvatar({ line, color }) {
  if (line.introAttributes) return <span aria-hidden>🏙️</span>;
  if (line.attributeKey) {
    return (
      <span style={{
        fontSize: 14,
        fontWeight: 800,
        color: '#0d1b2a',
      }}
      >
        {SATISFACTION_ATTR_BY_KEY[line.attributeKey]?.shortLabel?.slice(0, 1) ?? '?'}
      </span>
    );
  }
  if (line.speaker === '副市長' || line.speaker === 'システム') return <span aria-hidden>👔</span>;
  return <span aria-hidden>👤</span>;
}

export const NarrativeDialog = ({ scenario, onClose }) => {
  const [step, setStep] = useState(0);
  const currentLine = scenario?.[step];
  const accentColor = useMemo(() => getLineColor(currentLine), [currentLine]);
  const isVisualStep = Boolean(currentLine?.introAttributes || currentLine?.attributeKey);
  const dialogWidth = isVisualStep ? 'min(96vw, 1200px)' : 'min(90vw, 540px)';

  const handleNext = () => {
    if (step < scenario.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  if (!currentLine) return null;

  return (
    <div style={{
      ...OVERLAY_STYLE,
      padding: isVisualStep ? '8px' : '16px',
    }}
    >
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 30, 50, 0.95), rgba(15, 20, 35, 0.98))',
        border: `1px solid ${accentColor}55`,
        borderRadius: isVisualStep ? '20px' : '24px',
        width: dialogWidth,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: isVisualStep ? '96vh' : '92vh',
      }}
      >
        <div style={{
          padding: '16px 24px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
        }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '20px',
            background: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: `0 0 15px ${accentColor}66`,
            flexShrink: 0,
          }}
          >
            <SpeakerAvatar line={currentLine} color={accentColor} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginBottom: '2px' }}>
              {currentLine.role}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: accentColor }}>
              {currentLine.speaker}
            </div>
          </div>
        </div>

        <div style={{
          padding: isVisualStep ? '16px 20px 20px' : '20px 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: isVisualStep ? '12px' : '16px',
          flex: isVisualStep ? '1 1 auto' : undefined,
          minHeight: isVisualStep ? 0 : '140px',
          justifyContent: isVisualStep ? 'flex-start' : 'center',
          overflowY: 'auto',
        }}
        >
          {currentLine.introAttributes && <AttributeIntroGrid />}
          {currentLine.attributeKey && (
            <AttributeHeroImage attributeKey={currentLine.attributeKey} color={accentColor} />
          )}
          <div style={{
            fontSize: isVisualStep ? '16px' : '17px',
            lineHeight: 1.6,
            color: '#eceff1',
            whiteSpace: 'pre-wrap',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}
          >
            「{currentLine.text}」
          </div>
        </div>

        <div style={{
          padding: '16px 24px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}
        >
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
            {step + 1}
            /
            {scenario.length}
          </div>
          <button
            type="button"
            onClick={handleNext}
            style={{
              background: `${accentColor}22`,
              color: accentColor,
              border: `1px solid ${accentColor}66`,
              padding: '10px 24px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {step < scenario.length - 1 ? '次へ ▶' : '完了'}
          </button>
        </div>
      </div>
    </div>
  );
};
