import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, MapPin, Send, SkipForward } from 'lucide-react';
import { Pictogram } from '../../components/ui/Pictogram';
import { NEED_CATEGORY_OPTIONS } from '../../constants/barrierData';
import { KOTO_PLACE_OPTIONS } from '../constants/kotoArea';
import { AR_THEME, chipStyle } from '../constants/arTheme';
import { classifyDraft, getPlaceLabel } from '../utils/classifyDraft';
import {
  classifyMetaFromDraft,
  CONTEXT_INPUT_HINTS,
  getPlaceDisplayLabel,
  getSeverityLabel,
  getTimeTagLabel,
  inferPlaceArchetypeFromText,
  PLACE_INPUT_HINTS,
  WHO_INPUT_HINTS,
} from '../utils/classifyMetaFields';
import { PPS_NEED_GROUPS, getNeedTypeOption } from '../constants/needTypeGroups';

const BAD_STEPS = ['kind', 'story', 'place', 'who', 'optional'];
const GOOD_STEPS = ['kind', 'place', 'story'];
const TEXT_INPUT_STEPS = new Set(['story', 'place', 'who', 'optional']);

const getStepIds = (postKind) => (postKind === 'good' ? GOOD_STEPS : BAD_STEPS);

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

function HintChips({ hints, onPick }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
      {hints.map((hint) => (
        <button
          key={hint}
          type="button"
          onClick={() => onPick(hint)}
          style={{
            padding: '6px 10px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.06)',
            color: AR_THEME.muted,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          {hint}
        </button>
      ))}
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
  onEditLocation,
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

      {(draft.placeText || draft.whoText || draft.contextText) && (
        <div style={{
          margin: '0 0 12px',
          padding: 10,
          borderRadius: 10,
          background: 'rgba(255,255,255,0.04)',
          fontSize: 13,
          lineHeight: 1.5,
          color: AR_THEME.muted,
        }}
        >
          {draft.placeText && <div>場所: {draft.placeText}</div>}
          {draft.whoText && <div>誰にとって: {draft.whoText}</div>}
          {draft.contextText && <div>時間・程度: {draft.contextText}</div>}
        </div>
      )}

      {draft.postKind === 'bad' && (
        <>
          <div style={{ fontSize: 12, color: AR_THEME.muted, marginBottom: 6 }}>
            困りの型
            <span style={{ display: 'block', fontWeight: 'normal', marginTop: 4, lineHeight: 1.45 }}>
              投稿内容から自動で選んでいます。違う場合はタップして選び直してください。
            </span>
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

      <div style={{ fontSize: 12, color: AR_THEME.muted, marginBottom: 6 }}>場所（入力）</div>
      <p style={{ margin: '0 0 8px', fontSize: 14, color: AR_THEME.text }}>
        {getPlaceDisplayLabel(draft.placeArchetype, draft.placeText)}
        {draft.placeArchetype && draft.placeArchetype !== 'none' && (
          <span style={{ color: AR_THEME.muted, fontSize: 12 }}>
            {' '}
            →
            {getPlaceLabel(draft.placeArchetype)}
          </span>
        )}
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 6,
        marginBottom: 12,
      }}
      >
        {KOTO_PLACE_OPTIONS.filter((o) => o.id !== 'none').map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange({ placeArchetype: opt.id, placeText: opt.label })}
            style={chipStyle(draft.placeArchetype === opt.id, AR_THEME.accentWarm)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {(draft.whoText || draft.affectedGroups?.length > 0) && (
        <p style={{ margin: '0 0 8px', fontSize: 13, color: AR_THEME.muted }}>
          誰にとって:
          {' '}
          {draft.whoText || [...(draft.affectedGroups ?? []), draft.affectedOther].filter(Boolean).join(' · ')}
        </p>
      )}

      {(draft.contextText || draft.timeTag || draft.severity) && (
        <p style={{ margin: '0 0 12px', fontSize: 13, color: AR_THEME.muted }}>
          時間・深刻度:
          {' '}
          {draft.contextText || `${getTimeTagLabel(draft.timeTag)} · ${getSeverityLabel(draft.severity)}`}
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

      {isEdit && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: AR_THEME.muted, marginBottom: 6 }}>記録した位置（ピン）</div>
          {draft.worldPin ? (
            <p style={{ margin: '0 0 8px', fontSize: 13, color: AR_THEME.text }}>
              {draft.placementMode === 'map' ? '地図で指定' : '現在地'}
              {' · '}
              {draft.worldPin.lat.toFixed(5)}
              ,
              {' '}
              {draft.worldPin.lng.toFixed(5)}
            </p>
          ) : (
            <p style={{ margin: '0 0 8px', fontSize: 13, color: AR_THEME.accentWarm }}>
              位置情報がありません。地図で指定してください。
            </p>
          )}
          {onEditLocation && (
            <button
              type="button"
              onClick={onEditLocation}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 12,
                border: `1px solid ${AR_THEME.accent}`,
                background: 'rgba(79,195,247,0.12)',
                color: AR_THEME.text,
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <MapPin size={18} color={AR_THEME.accent} />
              地図で位置を修正
            </button>
          )}
        </div>
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
  onEditLocation,
  isEdit = false,
}) {
  const postKind = draft.postKind ?? 'bad';
  const isGood = postKind === 'good';
  const stepIds = getStepIds(postKind);

  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState('chat');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [showOptional, setShowOptional] = useState(false);
  const scrollRef = useRef(null);
  const bootedRef = useRef(false);

  const stepId = stepIds[stepIndex] ?? 'confirm';
  const canGoBack = phase === 'confirm' || stepIndex > 0;

  const appendBot = useCallback((text) => {
    setMessages((prev) => [...prev, { role: 'bot', text }]);
  }, []);

  const appendUser = useCallback((text) => {
    setMessages((prev) => [...prev, { role: 'user', text }]);
  }, []);

  const promptForStep = useCallback((id, kind) => {
    const good = kind === 'good';
    switch (id) {
      case 'kind':
        appendBot('記録の種類を選んでください。困りごとですか？それとも良い場所ですか？');
        break;
      case 'story':
        appendBot(
          good
            ? 'なぜ良い場所だと感じましたか？\n（短くても大丈夫です）'
            : 'どんなことが困っていますか？\n（短くてもOK — 段差・暗さ・案内など書ける範囲で）',
        );
        break;
      case 'place':
        appendBot('どんな場所ですか？\n（自由記述 — 例の言葉をタップしてもOK）');
        break;
      case 'who':
        appendBot('誰にとって困りますか？\n（自由記述 — 任意・スキップ可）');
        break;
      case 'optional':
        appendBot('いつ・どのくらい困りますか？\n（例：夜、深刻 — 任意・スキップ可）');
        break;
      default:
        break;
    }
  }, [appendBot]);

  const advanceToStep = useCallback((nextIndex, kind) => {
    const steps = getStepIds(kind);
    setStepIndex(nextIndex);
    if (nextIndex < steps.length) {
      promptForStep(steps[nextIndex], kind);
    }
  }, [promptForStep]);

  const goConfirm = useCallback((payload = draft) => {
    const meta = classifyMetaFromDraft(payload);
    const merged = { ...payload, ...meta };

    if (merged.postKind === 'bad') {
      const result = classifyDraft(merged);
      onChange({
        ...meta,
        needType: result.needType,
        placeArchetype: merged.placeArchetype ?? result.placeArchetype,
        classification: result.classification,
      });
    } else {
      onChange(meta);
    }
    appendBot('内容を整理しました。下のカードで確認・修正してから投稿してください。');
    setPhase('confirm');
  }, [appendBot, draft, onChange]);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    if (isEdit) {
      setPhase('confirm');
      appendBot('編集内容を確認してください。');
      return;
    }
    if (draft.promptTitle && draft.promptKind !== 'free') {
      const kindLabel = draft.promptKind === 'special' ? '特設のお題' : '今月のお題';
      appendBot(
        `${kindLabel}「${draft.promptTitle}」について記録してください。\n`
        + '困りごとでも、良い場所でも、写真と一言で構いません。',
      );
    }
    promptForStep('kind', postKind);
  }, [appendBot, draft.promptKind, draft.promptTitle, isEdit, postKind, promptForStep]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, phase, showOptional]);

  useEffect(() => {
    if (phase !== 'chat' || !TEXT_INPUT_STEPS.has(stepId)) return;
    if (stepId === 'story') setInputText(draft.comment ?? '');
    if (stepId === 'place') setInputText(draft.placeText ?? '');
    if (stepId === 'who') setInputText(draft.whoText ?? '');
    if (stepId === 'optional') setInputText(draft.contextText ?? '');
  }, [phase, stepId, draft.comment, draft.placeText, draft.whoText, draft.contextText]);

  const canSendText = useMemo(() => {
    if (stepId === 'who' || stepId === 'optional') return true;
    return inputText.trim().length >= 1;
  }, [inputText, stepId]);

  const appendHint = (hint) => {
    setInputText((prev) => {
      const base = prev.trim();
      if (!base) return hint;
      if (base.includes(hint)) return base;
      return `${base}、${hint}`;
    });
  };

  const textStepHints = useMemo(() => {
    if (stepId === 'place') return PLACE_INPUT_HINTS;
    if (stepId === 'who') return WHO_INPUT_HINTS;
    if (stepId === 'optional') return CONTEXT_INPUT_HINTS;
    return [];
  }, [stepId]);

  const textStepPlaceholder = useMemo(() => {
    if (stepId === 'story') {
      return isGood
        ? '例：ベンチがあって休みやすい'
        : '例：段差が高い / 歩道が狭い / 暗くて見えない';
    }
    if (stepId === 'place') return '例：駅前、歩道、公園…';
    if (stepId === 'who') return '例：車いす、高齢者、みんな…';
    if (stepId === 'optional') return '例：夜、軽い、深刻…';
    return '';
  }, [isGood, stepId]);

  const handleKindSelect = (kind) => {
    onChange({ postKind: kind });
  };

  const handleKindConfirm = () => {
    if (!draft.postKind) return;
    const kind = draft.postKind;
    appendUser(kind === 'good' ? '✨ 良い場所' : '😣 困りごと');
    advanceToStep(1, kind);
  };

  const handleTextStepSubmit = (overrideText) => {
    const text = typeof overrideText === 'string' ? overrideText.trim() : inputText.trim();
    if (stepId === 'story') {
      if (!text) return;
      onChange({ comment: text });
      appendUser(text);
      setInputText('');
      const next = stepIndex + 1;
      if (next >= stepIds.length) {
        goConfirm({ ...draft, comment: text });
        return;
      }
      advanceToStep(next, postKind);
      return;
    }

    if (stepId === 'place') {
      if (!text) return;
      const placeMeta = inferPlaceArchetypeFromText(text);
      const patch = { placeText: text, placeArchetype: placeMeta.placeArchetype };
      onChange(patch);
      appendUser(text);
      setInputText('');
      const next = stepIndex + 1;
      if (next >= stepIds.length) {
        goConfirm({ ...draft, ...patch });
        return;
      }
      advanceToStep(next, postKind);
      return;
    }

    if (stepId === 'who') {
      const meta = classifyMetaFromDraft({ ...draft, whoText: text });
      onChange({
        whoText: text,
        affectedGroups: meta.affectedGroups,
        affectedOther: meta.affectedOther,
      });
      appendUser(text || '（スキップ）');
      setInputText('');
      const next = stepIndex + 1;
      if (next >= stepIds.length) {
        goConfirm({ ...draft, whoText: text, ...meta });
        return;
      }
      advanceToStep(next, postKind);
      return;
    }

    if (stepId === 'optional') {
      const meta = classifyMetaFromDraft({ ...draft, contextText: text });
      onChange({
        contextText: text,
        timeTag: meta.timeTag,
        severity: meta.severity,
      });
      appendUser(text || '（スキップ）');
      goConfirm({ ...draft, contextText: text, timeTag: meta.timeTag, severity: meta.severity });
    }
  };

  const handleGoBackStep = () => {
    if (phase === 'confirm') {
      setPhase('chat');
      setMessages((prev) => {
        const next = [...prev];
        if (next.length && next[next.length - 1].role === 'bot') next.pop();
        return next;
      });
      setStepIndex(stepIds.length - 1);
      const lastStep = stepIds[stepIds.length - 1];
      if (TEXT_INPUT_STEPS.has(lastStep)) {
        if (lastStep === 'story') setInputText(draft.comment ?? '');
        if (lastStep === 'place') setInputText(draft.placeText ?? '');
        if (lastStep === 'who') setInputText(draft.whoText ?? '');
        if (lastStep === 'optional') setInputText(draft.contextText ?? '');
      }
      return;
    }

    if (stepIndex <= 0) return;

    setMessages((prev) => {
      const next = [...prev];
      if (next.length && next[next.length - 1].role === 'bot') next.pop();
      if (next.length && next[next.length - 1].role === 'user') next.pop();
      return next;
    });

    const prevIndex = stepIndex - 1;
    setStepIndex(prevIndex);
    const prevStep = stepIds[prevIndex];
    if (prevStep === 'story') setInputText(draft.comment ?? '');
    if (prevStep === 'place') setInputText(draft.placeText ?? '');
    if (prevStep === 'who') setInputText(draft.whoText ?? '');
    if (prevStep === 'optional') setInputText(draft.contextText ?? '');
    if (prevStep === 'optional') {
      setShowOptional(false);
    }
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
        <button type="button" onClick={onBack} style={navBtnStyle} aria-label="撮影に戻る">
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
        {canGoBack && (
          <button
            type="button"
            onClick={handleGoBackStep}
            style={{
              ...navBtnStyle,
              width: 'auto',
              padding: '0 12px',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            前の質問
          </button>
        )}
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
            onEditLocation={onEditLocation}
            isEdit={isEdit}
          />
        )}

        {phase === 'chat' && stepId === 'kind' && (
          <div style={{ marginTop: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                type="button"
                onClick={() => handleKindSelect('bad')}
                style={chipStyle(draft.postKind === 'bad', AR_THEME.barrier)}
              >
                😣 困りごと
              </button>
              <button
                type="button"
                onClick={() => handleKindSelect('good')}
                style={chipStyle(draft.postKind === 'good', AR_THEME.positive)}
              >
                ✨ 良い場所
              </button>
            </div>
            <button
              type="button"
              disabled={!draft.postKind}
              onClick={handleKindConfirm}
              style={{
                ...actionBtnStyle,
                marginTop: 10,
                background: draft.postKind ? AR_THEME.accentWarm : 'rgba(255,255,255,0.12)',
                color: draft.postKind ? '#0d1b2a' : AR_THEME.muted,
                cursor: draft.postKind ? 'pointer' : 'not-allowed',
              }}
            >
              この内容で次へ
            </button>
          </div>
        )}

      </div>

      {phase === 'chat' && TEXT_INPUT_STEPS.has(stepId) && (
        <div style={{
          flexShrink: 0,
          padding: `10px 16px ${AR_THEME.safeBottom}`,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(10,22,40,0.98)',
        }}
        >
          {textStepHints.length > 0 && (
            <HintChips hints={textStepHints} onPick={appendHint} />
          )}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={textStepPlaceholder}
            rows={stepId === 'story' ? 3 : 2}
            style={{
              ...inputStyle,
              minHeight: stepId === 'story' ? 80 : 56,
              resize: 'none',
              marginBottom: 8,
              marginTop: 0,
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            {(stepId === 'who' || stepId === 'optional') && (
              <button
                type="button"
                onClick={() => handleTextStepSubmit('')}
                style={{
                  ...actionBtnStyle,
                  flex: 1,
                  background: 'rgba(255,255,255,0.12)',
                  color: AR_THEME.text,
                }}
              >
                スキップ
                <SkipForward size={18} />
              </button>
            )}
            <button
              type="button"
              disabled={!canSendText}
              onClick={handleTextStepSubmit}
              style={{
                ...actionBtnStyle,
                flex: stepId === 'who' || stepId === 'optional' ? 2 : 1,
                width: stepId === 'who' || stepId === 'optional' ? undefined : '100%',
                background: canSendText ? AR_THEME.accentWarm : 'rgba(255,255,255,0.12)',
                color: canSendText ? '#0d1b2a' : AR_THEME.muted,
                cursor: canSendText ? 'pointer' : 'not-allowed',
              }}
            >
              {stepId === 'optional' ? '確認へ' : '送信'}
              <Send size={18} />
            </button>
          </div>
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
