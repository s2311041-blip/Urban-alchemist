import React from 'react';
import { Pictogram } from '../../components/ui/Pictogram';
import { AR_THEME } from '../constants/arTheme';
import { PPS_NEED_GROUPS, getNeedTypeOption } from '../constants/needTypeGroups';

/** グループ見出しの補足（参加者向け） */
const GROUP_DESCRIPTIONS = {
  access: '足元・通路・案内 — その場所や行き方の問題',
  uses: '座って休む・待つ場所が足りない',
  comfort: '明るさ・清潔さ・維持管理',
  sociability: '安心感・困ったとき誰に頼れるか',
  other: '上記のどれにも当てはまらない',
};

export function NeedTypeChoiceButton({
  needType,
  active = false,
  onClick,
  accentColor = AR_THEME.accent,
}) {
  const opt = getNeedTypeOption(needType);
  if (!opt) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        padding: '12px 12px',
        borderRadius: 12,
        border: active ? `2px solid ${accentColor}` : '1px solid rgba(255,255,255,0.14)',
        background: active ? `${accentColor}22` : 'rgba(255,255,255,0.04)',
        color: AR_THEME.text,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        textAlign: 'left',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ flexShrink: 0, width: 40, display: 'grid', placeItems: 'center' }}>
        {opt.iconSrc ? (
          <Pictogram src={opt.iconSrc} size={36} alt="" />
        ) : (
          <span style={{ fontSize: 28 }} aria-hidden>💬</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: active ? 'bold' : '600', marginBottom: 4 }}>
          {opt.label}
        </div>
        <div style={{ fontSize: 13, color: AR_THEME.muted, lineHeight: 1.45 }}>
          {opt.hint}
        </div>
      </div>
    </button>
  );
}

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
        いちばん近いものを1つ選んでください。名前の下に具体例があります。
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
          }}
          >
            <div style={{
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
            {GROUP_DESCRIPTIONS[group.id] && (
              <div style={{ fontSize: 12, color: AR_THEME.muted, marginTop: 4, lineHeight: 1.4 }}>
                {GROUP_DESCRIPTIONS[group.id]}
              </div>
            )}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: 10,
          }}
          >
            {group.options.map((needType) => (
              <NeedTypeChoiceButton
                key={needType}
                needType={needType}
                active={value === needType}
                accentColor={group.color}
                onClick={() => onChange(needType)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
