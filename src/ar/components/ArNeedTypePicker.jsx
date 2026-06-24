import React from 'react';
import { Pictogram } from '../../components/ui/Pictogram';
import { AR_THEME } from '../constants/arTheme';
import { PPS_NEED_GROUPS, getNeedTypeOption } from '../constants/needTypeGroups';

export function ArNeedTypePicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{
        margin: 0,
        fontSize: 14,
        color: AR_THEME.muted,
        lineHeight: 1.5,
      }}
      >
        タップして1つ選んでください
      </p>
      {PPS_NEED_GROUPS.map((group) => (
        <section
          key={group.id}
          style={{
            borderRadius: 14,
            overflow: 'hidden',
            border: `1px solid ${group.color}44`,
            background: `${group.color}0d`,
          }}
        >
          <div style={{
            padding: '10px 12px',
            background: `${group.color}22`,
            borderLeft: `4px solid ${group.color}`,
            fontSize: 14,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
          >
            <span aria-hidden>{group.emoji}</span>
            <span>{group.label}</span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: group.options.length === 1 ? '1fr' : 'repeat(2, minmax(0, 1fr))',
            gap: 8,
            padding: 10,
          }}
          >
            {group.options.map((needType) => {
              const opt = getNeedTypeOption(needType);
              if (!opt) return null;
              const active = value === needType;
              return (
                <button
                  key={needType}
                  type="button"
                  onClick={() => onChange(needType)}
                  style={{
                    minHeight: 72,
                    padding: '10px 8px',
                    borderRadius: 12,
                    border: active ? `2px solid ${group.color}` : '1px solid rgba(255,255,255,0.14)',
                    background: active ? `${group.color}28` : 'rgba(255,255,255,0.04)',
                    color: AR_THEME.text,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    boxSizing: 'border-box',
                  }}
                >
                  <Pictogram src={opt.iconSrc} size={36} alt={opt.label} />
                  <span style={{ fontSize: 14, fontWeight: active ? 'bold' : '600' }}>{opt.label}</span>
                  <span style={{
                    fontSize: 11,
                    color: AR_THEME.muted,
                    lineHeight: 1.3,
                    textAlign: 'center',
                    padding: '0 4px',
                  }}
                  >
                    {opt.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
