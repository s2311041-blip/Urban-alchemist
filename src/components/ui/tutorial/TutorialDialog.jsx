import React, { useState } from 'react';
import { TUTORIAL_SCENARIO } from '../../../constants/narrativeData';

const OVERLAY_STYLE = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(5, 10, 20, 0.85)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  backdropFilter: 'blur(8px)',
};

const DIALOG_STYLE = {
  background: 'linear-gradient(135deg, rgba(20, 30, 50, 0.95), rgba(15, 20, 35, 0.98))',
  border: '1px solid rgba(0, 229, 255, 0.3)',
  borderRadius: '24px',
  width: 'min(90vw, 540px)',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const HEADER_STYLE = {
  padding: '16px 24px',
  background: 'rgba(0, 0, 0, 0.2)',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const CONTENT_STYLE = {
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  minHeight: '140px',
  justifyContent: 'center',
};

const FOOTER_STYLE = {
  padding: '16px 24px',
  background: 'rgba(0, 0, 0, 0.2)',
  borderTop: '1px solid rgba(255,255,255,0.05)',
  display: 'flex',
  justifyContent: 'flex-end',
};

export const NarrativeDialog = ({ scenario, onClose }) => {
  const [step, setStep] = useState(0);
  const currentLine = scenario?.[step];

  const handleNext = () => {
    if (step < scenario.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  if (!currentLine) return null;

  return (
    <div style={OVERLAY_STYLE}>
      <div style={DIALOG_STYLE}>
        <div style={HEADER_STYLE}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '20px',
            background: currentLine.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: `0 0 15px ${currentLine.color}66`,
            flexShrink: 0
          }}>
            {/* Placeholder icon based on speaker */}
            {currentLine.speaker === '副市長' || currentLine.speaker === 'システム' ? '👔' : 
             currentLine.speaker === '移動' ? '🏃‍♂️' :
             currentLine.speaker === '滞在' ? '☕' :
             currentLine.speaker === '安全' ? '♿' :
             currentLine.speaker === '静穏' ? '👴' : '👤'}
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginBottom: '2px' }}>
              {currentLine.role}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: currentLine.color }}>
              {currentLine.speaker}
            </div>
          </div>
        </div>
        
        <div style={CONTENT_STYLE}>
          <div style={{ 
            fontSize: '17px', 
            lineHeight: 1.6, 
            color: '#eceff1',
            whiteSpace: 'pre-wrap',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            「{currentLine.text}」
          </div>
        </div>

        <div style={FOOTER_STYLE}>
          <button
            onClick={handleNext}
            style={{
              background: 'rgba(0, 229, 255, 0.15)',
              color: '#00e5ff',
              border: '1px solid rgba(0, 229, 255, 0.4)',
              padding: '10px 24px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 229, 255, 0.25)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0, 229, 255, 0.15)'}
          >
            {step < scenario.length - 1 ? '次へ ▶' : '完了'}
          </button>
        </div>
      </div>
    </div>
  );
};
