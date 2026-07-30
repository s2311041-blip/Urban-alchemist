import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, Send, SkipForward } from 'lucide-react';
import { Pictogram } from '../../components/ui/Pictogram';
import { NEED_CATEGORY_OPTIONS, TIME_TAG_OPTIONS, SEVERITY_OPTIONS } from '../../constants/barrierData';
import {
  AR_TARGET_GROUP_OPTIONS,
  AFFECTED_OTHER_LABEL,
  AFFECTED_OTHER_MAX_LEN,
  toggleAffectedGroup,
  isOtherGroupSelected,
} from '../constants/arTargetGroups';
import { KOTO_PLACE_OPTIONS } from '../constants/kotoArea';
import { AR_THEME, chipStyle } from '../constants/arTheme';
import { classifyDraft, getPlaceLabel } from '../utils/classifyDraft';
import { PPS_NEED_GROUPS, getNeedTypeOption } from '../constants/needTypeGroups';

const BAD_STEPS = ['kind', 'story', 'place', 'who', 'optional'];
const GOOD_STEPS = ['kind', 'place', 'story'];

function BotBubble({ children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
      <div style={{
        maxWidth: '88%',
        padding: '12px 14px',
        borderRadius: '16px 16px 16px 4px',
        background: 'rgba(79,195,247,0.12)',
        border: '1px solid rgba(79,195,247,0.25)',
        fontSize: 15,
        lineHeight: 1.55,
        color: AR_THEME.text,
      }}
      >
        {children}
      </div>
    </div>
  );
}

function UserBubble({ children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
      <div style={{
        maxWidth: '88%',
        padding: '12px 14px',
        borderRadius: '16px 16px 4px 16px',
        background: 'rgba(255,183,77,0.18)',
        border: '1px solid rgba(255,183,77,0.35)',
        fontSize: 15,
        lineHeight: 1.55,
        color: AR_THEME.text,
        whiteSpace: 'pre-wrap',
      }}
      >
        {children}
      </div>
    </div>
  );
}

function NeedTypeChip({ needType, active, onClick }) {
  const opt = getNeedTypeOption(needType) ?? NEED_CATEGORY_OPTIONS.find((o) => o.needType === needType);
  if (!opt) return null;
  const group = PPS_NEED_GROUPS.find((g) => g.options.includes(needType));
  const color = group?.color ?? '#78909c';

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...chipStyle(active, color),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        minHeight: 72,
        padding: '8px 6px',
      }}
    >
      {opt.iconSrc ? (
        <Pictogram src={opt.iconSrc} size={32} alt={opt.label} />
      ) : (
        <span style={{ fontSize: 24 }} aria-hidden>💬</span>
      )}
      <span style={{ fontSize: 13, fontWeight: active ? 'bold' : '600' }}>{opt.label}</span>
      <span style={{ fontSize: 10, color: AR_THEME.muted, lineHeight: 1.25 }}>{opt.hint}</span>
    </button>
  );
}

function ConfirmCard({
  draft,
  classification,
  onChange,
  onConfirm,
  isEdit,
}) {
  const needOpt = getNeedTypeOption(draft.needType) ?? NEED_CATEGORY_OPTIONS.find((o) => o.needType === draft.needType);
  const confidencePct = Math.round((classification?.confidence ?? 0) * 100);
  const isLow = (classification?.confidence ?? 0) < 0.55;

  return (
    <div style={{
      marginTop: 8,
      padding: 14,
      borderRadius: 16,
      border: `1px solid ${isLow ? AR_THEME.accentWarm : AR_THEME.accent}55`,
      background: 'rgba(255,255,255,0.04)',
    }}
    >
      <div style={{ fontSize: 13, color: AR_THEME.accent, fontWeight: 'bold', marginBottom: 10 }}>
        確認 — この内容で投稿しますか？
      </div>

      {draft.photo && (
        <img
          src={draft.photo}
          alt=""
          style={{
            width: '100%',
            maxHeight: 140,
            objectFit: 'cover',
            borderRadius: 12,
            marginBottom: 10,
          }}
        />
      )}

      <p style={{ margin: '0 0 8px', fontSize: 14, lineHeight: 1.5, color: AR_THEME.muted }}>
        {draft.comment}
      </p>

      {draft.postKind === 'bad' && (
        <>
          <div style={{ fontSize: 12, color: AR_THEME.muted, marginBottom: 6 }}>
            困りの型
            {classification?.ambiguous && classification?.rivalType && (
              <span style={{ color: AR_THEME.accentWarm }}>
                {' '}
                ·
                {NEED_CATEGORY_OPTIONS.find((o) => o.needType === classification.rivalType)?.label}
                とも近い
              </span>
            )}
            {!isLow && (
              <span style={{ color: AR_THEME.muted }}>
                {' '}
                · 一致度
                {confidencePct}
                %
              </span>
            )}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 6,
            marginBottom: 12,
          }}
          >
            {NEED_CATEGORY_OPTIONS.map((opt) => (
              <NeedTypeChip
                key={opt.needType}
                needType={opt.needType}
                active={draft.needType === opt.needType}
                onClick={() => onChange({
                  needType: opt.needType,
                  classification: {
                    ...draft.classification,
                    status: 'user_edited',
                    editedNeedType: opt.needType,
                  },
                })}
              />
            ))}
          </div>
          {isLow && (
            <p style={{ margin: '0 0 10px', fontSize: 12, color: AR_THEME.accentWarm }}>
              自動判定の確信度が低いです。当てはまる型を選んでください。
            </p>
          )}
        </>
      )}

      <div style={{ fontSize: 12, color: AR_THEME.muted, marginBottom: 6 }}>場所</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 6,
        marginBottom: 12,
      }}
      >
        {KOTO_PLACE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange({ placeArchetype: opt.id })}
            style={chipStyle(draft.placeArchetype === opt.id, AR_THEME.accentWarm)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {(draft.affectedGroups?.length > 0 || draft.affectedOther) && (
        <p style={{ margin: '0 0 10px', fontSize: 13, color: AR_THEME.muted }}>
          誰にとって:
          {' '}
          {[...(draft.affectedGroups ?? []), draft.affectedOther].filter(Boolean).join(' · ')}
        </p>
      )}

      {draft.postKind === 'bad' && needOpt && (
        <p style={{ margin: '0 0 12px', fontSize: 12, color: AR_THEME.muted }}>
          選択中:
          {' '}
          <strong style={{ color: AR_THEME.text }}>{needOpt.label}</strong>
          {' '}
          /
          {' '}
          {getPlaceLabel(draft.placeArchetype)}
        </p>
      )}

      <button
        type="button"
        onClick={onConfirm}
        disabled={draft.postKind === 'bad' && !draft.needType}
        style={{
          width: '100%',
          padding: 14,
          borderRadius: 14,
          border: 'none',
          background: AR_THEME.accentWarm,
          color: '#0d1b2a',
          fontWeight: 'bold',
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        {isEdit ? 'この内容で保存' : 'この内容で投稿'}
      </button>
    </div>
  );
}

export function ArPostChat({
  draft,
  onChange,
  onBack,
  onSubmit,
  isEdit = false,
}) {
  const isGood = draft.postKind === 'good';
  const stepIds = isGood ? GOOD_STEPS : BAD_STEPS;
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState('chat');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [showOptional, setShowOptional] = useState(false);
  const scrollRef = useRef(null);
  const bootedRef = useRef(false);

  const stepId = stepIds[stepIndex] ?? 'confirm';

  const appendBot = useCallback((text) => {
    setMessages((prev) => [...prev, { role: 'bot', text }]);
  }, []);

  const appendUser = useCallback((text) => {
    setMessages((prev) => [...prev, { role: 'user', text }]);
  }, []);

  const goConfirm = useCallback(() => {
    if (draft.postKind === 'bad') {
      const result = classifyDraft(draft);
      onChange({
        needType: result.needType,
        placeArchetype: draft.placeArchetype ?? result.placeArchetype,
        classification: result.classification,
      });
    }
    appendBot('内容を整理しました。下のカードで確認・修正してから投稿してください。');
    setPhase('confirm');
  }, [appendBot, draft, onChange]);

  const promptForStep = useCallback((id) => {
    switch (id) {
      case 'kind':
        appendBot('記録の種類を選んでください。困りごとですか？それとも良い場所ですか？');
        break;
      case 'story':
        appendBot(
          isGood
            ? 'なぜ良い場所だと感じましたか？'
            : 'どんなことが困っていますか？\n（10字以上で、段差・暗さ・案内など具体的に）',
        );
        break;
      case 'place':
        appendBot('どんな場所ですか？当てはまるものを選んでください。');
        break;
      case 'who':
        appendBot('誰にとって困りますか？\n（任意 — スキップもできます）');
        break;
      case 'optional':
        appendBot('時間帯や深刻度を追加しますか？\n（任意 — スキップできます）');
        break;
      default:
        break;
    }
  }, [appendBot, isGood]);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    if (isEdit) {
      setPhase('confirm');
      appendBot('編集内容を確認してください。');
      return;
    }
    promptForStep(stepIds[0]);
  }, [appendBot, isEdit, promptForStep, stepIds]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, phase, showOptional]);

  const canSendStory = useMemo(() => {
    const len = inputText.trim().length;
    return isGood ? len >= 1 : len >= 10;
  }, [inputText, isGood]);

  const handleKind = (kind) => {
    onChange({ postKind: kind });
    appendUser(kind === 'good' ? '✨ 良い場所' : '😣 困りごと');
    const next = stepIndex + 1;
    setStepIndex(next);
    promptForStep(stepIds[next]);
  };

  const handlePlace = (placeId) => {
    const label = KOTO_PLACE_OPTIONS.find((o) => o.id === placeId)?.label ?? placeId;
    onChange({ placeArchetype: placeId });
    appendUser(label);
    const next = stepIndex + 1;
    if (next >= stepIds.length) {
      goConfirm();
      return;
    }
    setStepIndex(next);
    promptForStep(stepIds[next]);
  };

  const handleStorySubmit = () => {
    const text = inputText.trim();
    if (!canSendStory) return;
    onChange({ comment: text });
    appendUser(text);
    setInputText('');
    const next = stepIndex + 1;
    setStepIndex(next);
    if (next >= stepIds.length) {
      goConfirm();
      return;
    }
    promptForStep(stepIds[next]);
  };

  const handleWhoToggle = (label) => {
    const next = toggleAffectedGroup(
      draft.affectedGroups ?? [],
      label,
      draft.affectedOther ?? '',
    );
    onChange(next);
  };

  const handleWhoDone = () => {
    const labels = draft.affectedGroups ?? [];
    const extra = draft.affectedOther?.trim();
    if (labels.length || extra) {
      appendUser([...labels, extra].filter(Boolean).join(' · ') || '（未選択）');
    } else {
      appendUser('（スキップ）');
    }
    const next = stepIndex + 1;
    setStepIndex(next);
    if (next >= stepIds.length) {
      goConfirm();
      return;
    }
    promptForStep(stepIds[next]);
  };

  const handleOptionalDone = () => {
    appendUser('（スキップ）');
    goConfirm();
  };

  const handleConfirm = () => {
    const classification = {
      ...(draft.classification ?? {}),
      status: draft.classification?.status === 'user_edited' ? 'user_edited' : 'user_confirmed',
      confirmedAt: Date.now(),
    };
    onSubmit({
      ...draft,
      classification,
    });
  };

  const showOtherField = isOtherGroupSelected(draft.affectedGroups);

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
            {phase === 'confirm' ? '確認' : `${stepIndex + 1} / ${stepIds.length}`}
            {isEdit ? ' · 編集' : ''}
          </div>
          <div style={{ fontWeight: 'bold', fontSize: 18 }}>
            {phase === 'confirm' ? '内容の確認' : '投稿を記録'}
          </div>
        </div>
      </header>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '12px 16px 16px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {messages.map((msg, i) => (
          msg.role === 'bot'
            ? <BotBubble key={`b-${i}`}>{msg.text}</BotBubble>
            : <UserBubble key={`u-${i}`}>{msg.text}</UserBubble>
        ))}

        {phase === 'confirm' && (
          <ConfirmCard
            draft={draft}
            classification={draft.classification}
            onChange={onChange}
            onConfirm={handleConfirm}
            isEdit={isEdit}
          />
        )}

        {phase === 'chat' && stepId === 'kind' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
            <button type="button" onClick={() => handleKind('bad')} style={chipStyle(draft.postKind === 'bad', AR_THEME.barrier)}>
              😣 困りごと
            </button>
            <button type="button" onClick={() => handleKind('good')} style={chipStyle(draft.postKind === 'good', AR_THEME.positive)}>
              ✨ 良い場所
            </button>
          </div>
        )}

        {phase === 'chat' && stepId === 'place' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginTop: 4 }}>
            {KOTO_PLACE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handlePlace(opt.id)}
                style={chipStyle(draft.placeArchetype === opt.id, AR_THEME.accentWarm)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {phase === 'chat' && stepId === 'who' && (
          <div style={{ marginTop: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
              {AR_TARGET_GROUP_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleWhoToggle(opt.label)}
                  style={chipStyle(draft.affectedGroups?.includes(opt.label), AR_THEME.accent)}
                >
                  {opt.iconSrc ? (
                    <Pictogram src={opt.iconSrc} size={28} alt={opt.label} />
                  ) : (
                    <span>✏️</span>
                  )}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
            {showOtherField && (
              <input
                type="text"
                value={draft.affectedOther ?? ''}
                maxLength={AFFECTED_OTHER_MAX_LEN}
                onChange={(e) => onChange({ affectedOther: e.target.value })}
                placeholder="例：チャリ、観光客"
                style={inputStyle}
              />
            )}
            <button
              type="button"
              onClick={handleWhoDone}
              style={{ ...actionBtnStyle, marginTop: 10 }}
            >
              {draft.affectedGroups?.length ? '次へ' : 'スキップ'}
              <SkipForward size={18} />
            </button>
          </div>
        )}

        {phase === 'chat' && stepId === 'optional' && (
          <div style={{ marginTop: 4 }}>
            <button
              type="button"
              onClick={() => setShowOptional((v) => !v)}
              style={{ ...actionBtnStyle, background: 'rgba(255,255,255,0.06)', color: AR_THEME.text }}
            >
              {showOptional ? '詳細を閉じる' : '時間帯・深刻度を指定'}
            </button>
            {showOptional && (
              <>
                <div style={{ fontSize: 12, color: AR_THEME.muted, margin: '12px 0 6px' }}>時間帯</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                  {TIME_TAG_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChange({ timeTag: opt.id })}
                      style={chipStyle((draft.timeTag ?? 'always') === opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: AR_THEME.muted, margin: '12px 0 6px' }}>深刻度</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {SEVERITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChange({ severity: opt.id })}
                      style={chipStyle((draft.severity ?? 'mid') === opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            <button type="button" onClick={handleOptionalDone} style={{ ...actionBtnStyle, marginTop: 10 }}>
              確認へ進む
              <SkipForward size={18} />
            </button>
          </div>
        )}
      </div>

      {phase === 'chat' && stepId === 'story' && (
        <div style={{
          flexShrink: 0,
          padding: `10px 16px ${AR_THEME.safeBottom}`,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(10,22,40,0.98)',
        }}
        >
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isGood
                ? '例：ベンチがあって休みやすい'
                : '例：段差が高くて車いすでは一人では上がれない'
            }
            rows={3}
            style={{
              ...inputStyle,
              minHeight: 80,
              resize: 'none',
              marginBottom: 8,
            }}
          />
          <button
            type="button"
            disabled={!canSendStory}
            onClick={handleStorySubmit}
            style={{
              ...actionBtnStyle,
              width: '100%',
              background: canSendStory ? AR_THEME.accentWarm : 'rgba(255,255,255,0.12)',
              color: canSendStory ? '#0d1b2a' : AR_THEME.muted,
              cursor: canSendStory ? 'pointer' : 'not-allowed',
            }}
          >
            送信
            <Send size={18} />
          </button>
        </div>
      )}
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

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.05)',
  color: AR_THEME.text,
  fontSize: 16,
  boxSizing: 'border-box',
  marginTop: 8,
};

const actionBtnStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 12,
  border: 'none',
  background: AR_THEME.accentWarm,
  color: '#0d1b2a',
  fontWeight: 'bold',
  fontSize: 15,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};
