import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { Pictogram } from '../../components/ui/Pictogram';
import { TIME_TAG_OPTIONS, SEVERITY_OPTIONS } from '../../constants/barrierData';
import {
  AR_TARGET_GROUP_OPTIONS,
  AFFECTED_OTHER_LABEL,
  AFFECTED_OTHER_MAX_LEN,
  toggleAffectedGroup,
  isOtherGroupSelected,
} from '../constants/arTargetGroups';
import { KOTO_PLACE_OPTIONS } from '../constants/kotoArea';
import { AR_THEME } from '../constants/arTheme';
import { ArNeedTypePicker } from './ArNeedTypePicker';
import {
  getFormStepIds,
  getStepTitle,
  canProceedStep,
} from '../utils/postFormSteps';

function SectionLabel({ children, optional = false }) {
  return (
    <div style={{
      fontSize: 13,
      fontWeight: 'bold',
      color: AR_THEME.accent,
      margin: '16px 0 8px',
      display: 'flex',
      alignItems: 'baseline',
      gap: 6,
    }}
    >
      <span>{children}</span>
      {optional && (
        <span style={{ fontSize: 11, fontWeight: 'normal', color: AR_THEME.muted }}>任意</span>
      )}
    </div>
  );
}

function OptionButton({
  active,
  onClick,
  children,
  accent = AR_THEME.accent,
  compact = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: compact ? 48 : 60,
        padding: compact ? '8px 10px' : '10px 12px',
        borderRadius: 12,
        border: active ? `2px solid ${accent}` : '1px solid rgba(255,255,255,0.14)',
        background: active ? `${accent}18` : 'rgba(255,255,255,0.04)',
        color: AR_THEME.text,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: compact ? 4 : 6,
        fontSize: compact ? 14 : 15,
        fontWeight: active ? 'bold' : '600',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </button>
  );
}

function OptionGrid({ children, columns = 2 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gap: 8,
    }}
    >
      {children}
    </div>
  );
}

function ContextOptionalSection({ draft, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: 8 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.04)',
          color: AR_THEME.muted,
          fontSize: 14,
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>詳しく（時間帯・深刻度）</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && (
        <div style={{ paddingTop: 4 }}>
          <SectionLabel optional>いつ起きる？</SectionLabel>
          <OptionGrid columns={2}>
            {TIME_TAG_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.id}
                active={(draft.timeTag ?? 'always') === opt.id}
                onClick={() => onChange({ timeTag: opt.id })}
                compact
              >
                <Pictogram src={opt.iconSrc} size={32} alt={opt.label} />
                <span>{opt.label}</span>
              </OptionButton>
            ))}
          </OptionGrid>
          <SectionLabel optional>どのくらい困る？</SectionLabel>
          <OptionGrid columns={3}>
            {SEVERITY_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.id}
                active={(draft.severity ?? 'mid') === opt.id}
                onClick={() => onChange({ severity: opt.id })}
                compact
              >
                <Pictogram src={opt.iconSrc} size={32} alt={opt.label} />
                <span>{opt.label}</span>
              </OptionButton>
            ))}
          </OptionGrid>
        </div>
      )}
    </div>
  );
}

export function ArPostForm({
  draft,
  onChange,
  onBack,
  onNext,
  stepIndex,
  isEdit = false,
}) {
  const stepIds = useMemo(() => getFormStepIds(draft.postKind), [draft.postKind]);
  const stepId = stepIds[stepIndex - 1] ?? 'kind';
  const totalSteps = stepIds.length;
  const isGood = draft.postKind === 'good';
  const canNext = canProceedStep(stepId, draft);
  const showOtherField = isOtherGroupSelected(draft.affectedGroups);

  const handleGroupToggle = (label) => {
    const next = toggleAffectedGroup(
      draft.affectedGroups ?? [],
      label,
      draft.affectedOther ?? '',
    );
    onChange(next);
  };

  return (
    <div style={{
      height: '100dvh',
      maxHeight: '100dvh',
      background: AR_THEME.bg,
      color: AR_THEME.text,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}
    >
      <header style={{
        flexShrink: 0,
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
      >
        <button type="button" onClick={onBack} style={navBtnStyle}>
          <ChevronLeft size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: AR_THEME.muted }}>
            {stepIndex} / {totalSteps}
            {isEdit ? ' · 編集' : ''}
          </div>
          <div style={{ fontWeight: 'bold', fontSize: 18 }}>{getStepTitle(stepId)}</div>
        </div>
      </header>

      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: '8px 16px 16px',
        WebkitOverflowScrolling: 'touch',
      }}
      >
        {stepId === 'kind' && (
          <OptionGrid columns={2}>
            <OptionButton
              active={draft.postKind === 'bad'}
              onClick={() => onChange({ postKind: 'bad' })}
              accent={AR_THEME.barrier}
            >
              <span style={{ fontSize: 26 }}>😣</span>
              <span>困りごと</span>
            </OptionButton>
            <OptionButton
              active={draft.postKind === 'good'}
              onClick={() => onChange({ postKind: 'good' })}
              accent={AR_THEME.positive}
            >
              <span style={{ fontSize: 26 }}>✨</span>
              <span>良い場所</span>
            </OptionButton>
          </OptionGrid>
        )}

        {stepId === 'needPlace' && (
          <>
            <SectionLabel>どんな困りごと？</SectionLabel>
            <ArNeedTypePicker
              value={draft.needType}
              onChange={(needType) => onChange({ needType })}
            />
            <SectionLabel>どんな場所？</SectionLabel>
            <OptionGrid columns={2}>
              {KOTO_PLACE_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.id}
                  active={draft.placeArchetype === opt.id}
                  onClick={() => onChange({ placeArchetype: opt.id })}
                  compact
                >
                  <span>{opt.label}</span>
                </OptionButton>
              ))}
            </OptionGrid>
          </>
        )}

        {stepId === 'context' && (
          <>
            <SectionLabel optional>誰にとって？</SectionLabel>
            <OptionGrid columns={2}>
              {AR_TARGET_GROUP_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.id}
                  active={draft.affectedGroups?.includes(opt.label)}
                  onClick={() => handleGroupToggle(opt.label)}
                >
                  {opt.iconSrc ? (
                    <Pictogram src={opt.iconSrc} size={36} alt={opt.label} />
                  ) : (
                    <span style={{ fontSize: 22 }}>✏️</span>
                  )}
                  <span>{opt.label}</span>
                </OptionButton>
              ))}
            </OptionGrid>
            {showOtherField && (
              <>
                <SectionLabel>{AFFECTED_OTHER_LABEL}（具体例）</SectionLabel>
                <input
                  type="text"
                  value={draft.affectedOther ?? ''}
                  maxLength={AFFECTED_OTHER_MAX_LEN}
                  onChange={(e) => onChange({ affectedOther: e.target.value })}
                  placeholder="例：チャリ、観光客、夜勤の人"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.05)',
                    color: AR_THEME.text,
                    fontSize: 16,
                    boxSizing: 'border-box',
                  }}
                />
                <p style={{ margin: '6px 0 0', fontSize: 12, color: AR_THEME.muted }}>
                  {AFFECTED_OTHER_MAX_LEN}字以内
                </p>
              </>
            )}
            <ContextOptionalSection draft={draft} onChange={onChange} />
          </>
        )}

        {stepId === 'place' && (
          <OptionGrid columns={2}>
            {KOTO_PLACE_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.id}
                active={draft.placeArchetype === opt.id}
                onClick={() => onChange({ placeArchetype: opt.id })}
                compact
              >
                <span>{opt.label}</span>
              </OptionButton>
            ))}
          </OptionGrid>
        )}

        {stepId === 'story' && (
          <>
            <p style={{ fontSize: 14, color: AR_THEME.muted, margin: '0 0 10px', lineHeight: 1.5 }}>
              {isGood
                ? 'なぜ良い場所だと感じましたか？'
                : 'どう感じたか・なぜ困るかを書いてください（10字以上）'}
            </p>
            <textarea
              value={draft.comment ?? ''}
              onChange={(e) => onChange({ comment: e.target.value })}
              placeholder={
                isGood
                  ? '例：ベンチがあって休みやすい'
                  : '例：段差が高くて車椅子では一人では上がれない。誰にとって：車いす利用者'
              }
              style={{
                width: '100%',
                minHeight: 160,
                maxHeight: 240,
                padding: 16,
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: AR_THEME.text,
                fontSize: 16,
                lineHeight: 1.55,
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </>
        )}
      </div>

      <div style={{
        flexShrink: 0,
        padding: `10px 16px ${AR_THEME.safeBottom}`,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(10,22,40,0.98)',
      }}
      >
        <button
          type="button"
          disabled={!canNext}
          onClick={onNext}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 14,
            border: 'none',
            background: canNext ? AR_THEME.accentWarm : 'rgba(255,255,255,0.12)',
            color: canNext ? '#0d1b2a' : AR_THEME.muted,
            fontWeight: 'bold',
            fontSize: 16,
            cursor: canNext ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            minHeight: 48,
          }}
        >
          {stepIndex < totalSteps ? '次へ' : (isEdit ? '保存する' : 'ピンを刺す')}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

const navBtnStyle = {
  background: 'rgba(255,255,255,0.08)',
  border: 'none',
  borderRadius: 12,
  width: 44,
  height: 44,
  color: AR_THEME.text,
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
};
