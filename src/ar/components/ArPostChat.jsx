import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, MapPin, Send, SkipForward, Tag } from 'lucide-react';
import { AR_THEME, chipStyle } from '../constants/arTheme';
import { classifyAnnotation } from '../api/classifyAnnotation';
import {
  classifyMetaFromDraft,
  getSeverityLabel,
  getTimeTagLabel,
  inferPlaceArchetypeFromText,
  PLACE_INPUT_HINTS,
  PLACE_INPUT_HINTS_GOOD,
  WHO_INPUT_HINTS,
} from '../utils/classifyMetaFields';
import { TIME_TAG_OPTIONS, SEVERITY_OPTIONS } from '../../constants/barrierData';
import { Pictogram } from '../../components/ui/Pictogram';
import { getNeedTypeOption } from '../constants/needTypeGroups';
import { ArNeedTypePicker, NeedTypeChoiceButton } from './ArNeedTypePicker';

const BAD_STEPS = ['kind', 'place', 'story', 'who', 'when', 'severity'];
const GOOD_STEPS = ['kind', 'place', 'story'];
const TEXT_INPUT_STEPS = new Set(['story', 'place', 'who']);

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

function ChipOptionButton({ active, onClick, children, accent = AR_THEME.accent }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 52,
        padding: '8px 10px',
        borderRadius: 12,
        border: active ? `2px solid ${accent}` : '1px solid rgba(255,255,255,0.14)',
        background: active ? `${accent}18` : 'rgba(255,255,255,0.04)',
        color: AR_THEME.text,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        fontSize: 14,
        fontWeight: active ? 'bold' : '600',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </button>
  );
}

function HintChips({ hints, onPick, prominent = false }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
      {hints.map((hint) => (
        <button
          key={hint}
          type="button"
          onClick={() => onPick(hint)}
          style={{
            padding: prominent ? '10px 14px' : '6px 10px',
            minHeight: prominent ? 44 : undefined,
            borderRadius: 999,
            border: prominent ? `1px solid ${AR_THEME.accent}66` : '1px solid rgba(255,255,255,0.18)',
            background: prominent ? 'rgba(79,195,247,0.12)' : 'rgba(255,255,255,0.06)',
            color: prominent ? AR_THEME.text : AR_THEME.muted,
            fontSize: prominent ? 14 : 12,
            fontWeight: prominent ? 600 : 400,
            cursor: 'pointer',
          }}
        >
          {hint}
        </button>
      ))}
    </div>
  );
}

function NeedTypeConfirmSection({
  draft,
  classification,
  onChange,
}) {
  const [mode, setMode] = useState('badge');
  const needOpt = getNeedTypeOption(draft.needType);
  const rivalOpt = classification?.rivalType ? getNeedTypeOption(classification.rivalType) : null;

  const applyNeedType = (needType, edited = false) => {
    onChange({
      needType,
      classification: {
        ...draft.classification,
        status: edited ? 'user_edited' : (draft.classification?.status ?? 'auto_proposed'),
        editedNeedType: edited ? needType : draft.classification?.editedNeedType,
        suggestedNeedType: draft.classification?.suggestedNeedType ?? classification?.suggestedNeedType ?? needType,
      },
    });
    if (edited) setMode('badge');
  };

  const openChange = () => {
    if (classification?.ambiguous && classification?.rivalType && rivalOpt) {
      setMode('rival');
    } else {
      setMode('pick');
    }
  };

  if (mode === 'pick') {
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: AR_THEME.text, marginBottom: 8, lineHeight: 1.45 }}>
          当てはまるものを1つ選んでください
        </div>
        <ArNeedTypePicker
          value={draft.needType}
          onChange={(needType) => applyNeedType(needType, true)}
        />
        <button
          type="button"
          onClick={() => setMode('badge')}
          style={{
            ...chipStyle(false, AR_THEME.muted),
            width: '100%',
            marginTop: 8,
            padding: 10,
          }}
        >
          もどる
        </button>
      </div>
    );
  }

  if (mode === 'rival') {
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: AR_THEME.text, marginBottom: 8, lineHeight: 1.45 }}>
          どちらに近いですか？
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
          <NeedTypeChoiceButton
            needType={draft.needType}
            active
            accentColor={AR_THEME.accent}
            onClick={() => applyNeedType(draft.needType, true)}
          />
          <NeedTypeChoiceButton
            needType={classification.rivalType}
            accentColor={AR_THEME.accentWarm}
            onClick={() => applyNeedType(classification.rivalType, true)}
          />
        </div>
        <button
          type="button"
          onClick={() => setMode('pick')}
          style={{
            ...chipStyle(false, AR_THEME.muted),
            width: '100%',
            padding: 10,
          }}
        >
          どちらでもない（一覧から選ぶ）
        </button>
      </div>
    );
  }

  if (!needOpt) return null;

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: AR_THEME.muted, marginBottom: 6 }}>
        課題のタイプ（自動で判定しました）
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 12px',
        borderRadius: 12,
        border: `1px solid ${AR_THEME.accent}55`,
        background: 'rgba(79,195,247,0.08)',
      }}
      >
        <Tag size={18} color={AR_THEME.accent} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 'bold', color: AR_THEME.text, lineHeight: 1.35 }}>
            {needOpt.label}
          </div>
        </div>
        <button
          type="button"
          onClick={openChange}
          style={{
            flexShrink: 0,
            border: 'none',
            background: 'transparent',
            color: AR_THEME.accent,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: '4px 0',
          }}
        >
          変更する
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function ConfirmCard({
  draft,
  classification,
  onChange,
  onConfirm,
  onEditLocation,
  isEdit,
  classifying = false,
}) {
  const isBad = draft.postKind === 'bad';
  const canPost = !isBad || Boolean(draft.needType);

  if (classifying) {
    return (
      <div style={{
        marginTop: 8,
        padding: 24,
        borderRadius: 16,
        border: `1px solid ${AR_THEME.accent}55`,
        background: 'rgba(255,255,255,0.04)',
        textAlign: 'center',
      }}
      >
        <Loader2
          size={28}
          color={AR_THEME.accent}
          style={{ animation: 'spin 1s linear infinite', marginBottom: 10 }}
        />
        <div style={{ fontSize: 14, color: AR_THEME.muted }}>内容を整理しています…</div>
      </div>
    );
  }

  return (
    <div style={{
      marginTop: 8,
      padding: 14,
      borderRadius: 16,
      border: `1px solid ${AR_THEME.accent}55`,
      background: 'rgba(255,255,255,0.04)',
    }}
    >
      <div style={{ fontSize: 13, color: AR_THEME.accent, fontWeight: 'bold', marginBottom: 10 }}>
        投稿内容の確認
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

      <div style={{
        margin: '0 0 12px',
        padding: 10,
        borderRadius: 10,
        background: 'rgba(255,255,255,0.04)',
        fontSize: 14,
        lineHeight: 1.55,
        color: AR_THEME.text,
      }}
      >
        {draft.placeText && <div>場所：{draft.placeText}</div>}
        <div>
          {isBad ? '困りごと' : '良いところ'}
          ：
          {draft.comment}
        </div>
        {isBad && draft.whoText && <div>誰にとって：{draft.whoText}</div>}
        {isBad && draft.timeTag && draft.timeTag !== 'always' && (
          <div>いつ：{getTimeTagLabel(draft.timeTag)}</div>
        )}
        {isBad && draft.severity && draft.severity !== 'mid' && (
          <div>度合い：{getSeverityLabel(draft.severity)}</div>
        )}
      </div>

      {isBad && (
        <NeedTypeConfirmSection
          draft={draft}
          classification={classification}
          onChange={onChange}
        />
      )}

      {onEditLocation && (
        <button
          type="button"
          onClick={onEditLocation}
          style={{
            width: '100%',
            marginBottom: 12,
            padding: '10px 12px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.16)',
            background: 'rgba(255,255,255,0.06)',
            color: AR_THEME.text,
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
          }}
        >
          <MapPin size={16} color={AR_THEME.accent} style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ fontSize: 12, lineHeight: 1.45 }}>
            {draft.worldPin
              ? `📍 取得した位置: ${draft.worldPin.lat.toFixed(5)}, ${draft.worldPin.lng.toFixed(5)}（タップして地図で微調整）`
              : '📍 位置を取得中…（タップして地図で指定）'}
          </span>
        </button>
      )}

      <button
        type="button"
        onClick={onConfirm}
        disabled={!canPost || (isBad && !draft.needType)}
        style={{
          width: '100%',
          padding: 14,
          borderRadius: 14,
          border: 'none',
          background: canPost ? AR_THEME.accentWarm : 'rgba(255,255,255,0.12)',
          color: canPost ? '#0d1b2a' : AR_THEME.muted,
          fontWeight: 'bold',
          fontSize: 16,
          cursor: canPost ? 'pointer' : 'not-allowed',
        }}
      >
        {isEdit ? 'この内容で保存' : 'この内容で投稿する'}
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
  headerExtra = null,
}) {
  const postKind = draft.postKind ?? 'bad';
  const isGood = postKind === 'good';
  const stepIds = getStepIds(postKind);

  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState('chat');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [classifying, setClassifying] = useState(false);
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
        appendBot('困りごとですか？ 良い場所ですか？');
        break;
      case 'story':
        appendBot(
          good
            ? 'どんなところが良いと感じましたか？'
            : 'どんなことに困っていますか？',
        );
        break;
      case 'place':
        appendBot('ここはどんな場所ですか？');
        break;
      case 'who':
        appendBot('誰にとって困りそうですか？');
        break;
      case 'when':
        appendBot('いつ困ることが多いですか？');
        break;
      case 'severity':
        appendBot('困りごとの度合いはどのくらいですか？');
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

  const goConfirm = useCallback(async (payload = draft) => {
    const meta = classifyMetaFromDraft(payload);
    const merged = { ...payload, ...meta };

    setPhase('confirm');
    setClassifying(true);

    try {
      if (merged.postKind === 'bad') {
        const result = await classifyAnnotation(merged);
        onChange({
          ...meta,
          needType: result.needType,
          placeArchetype: merged.placeArchetype ?? result.placeArchetype,
          classification: result.classification,
        });
      } else {
        onChange(meta);
      }
      appendBot('投稿内容の確認');
    } catch (err) {
      console.error('[goConfirm] classification failed', err);
      appendBot('投稿内容の確認');
    } finally {
      setClassifying(false);
    }
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
        `${kindLabel}：「${draft.promptTitle}」\n`
        + '気付いたことを教えてください。写真と一言だけでもOKです。',
      );
    }
    promptForStep('kind', postKind);
  }, [appendBot, draft.promptKind, draft.promptTitle, isEdit, postKind, promptForStep]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, phase]);

  useEffect(() => {
    if (phase !== 'chat' || !TEXT_INPUT_STEPS.has(stepId)) return;
    if (stepId === 'story') setInputText(draft.comment ?? '');
    if (stepId === 'place') setInputText(draft.placeText ?? '');
    if (stepId === 'who') setInputText(draft.whoText ?? '');
  }, [phase, stepId, draft.comment, draft.placeText, draft.whoText]);

  const canSendText = useMemo(() => {
    if (stepId === 'who') return true;
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
    if (stepId === 'place') return isGood ? PLACE_INPUT_HINTS_GOOD : PLACE_INPUT_HINTS;
    if (stepId === 'who') return WHO_INPUT_HINTS;
    return [];
  }, [isGood, stepId]);

  const textStepPlaceholder = useMemo(() => {
    if (stepId === 'story') {
      return isGood
        ? '例：日陰があって涼しい、ベンチが多くて休みやすい'
        : '（短くてもOK）例：段差が高い、道が狭い、暗くて怖い';
    }
    if (stepId === 'place') {
      return isGood ? '例：カフェ前、広場、遊歩道' : '例：歩道、公園、駅前';
    }
    if (stepId === 'who') return '例：車いす、ベビーカー、夜の一人歩き';
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
      onChange({ whoText: text });
      appendUser(text || '（スキップ）');
      setInputText('');
      const next = stepIndex + 1;
      if (next >= stepIds.length) {
        goConfirm({ ...draft, whoText: text });
        return;
      }
      advanceToStep(next, postKind);
      return;
    }

  };

  const handleWhenConfirm = (skipped = false) => {
    const timeTag = draft.timeTag ?? 'always';
    onChange({ timeTag });
    appendUser(skipped ? '（スキップ — いつでも）' : getTimeTagLabel(timeTag));
    advanceToStep(stepIndex + 1, postKind);
  };

  const handleSeverityConfirm = (skipped = false) => {
    const timeTag = draft.timeTag ?? 'always';
    const severity = draft.severity ?? 'mid';
    const patch = { timeTag, severity };
    onChange(patch);
    appendUser(skipped ? '（スキップ — 中くらい）' : getSeverityLabel(severity));
    goConfirm({ ...draft, ...patch });
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
  };

  const handleConfirm = () => {
    const classification = {
      ...(draft.classification ?? {}),
      status: draft.classification?.status === 'user_edited' ? 'user_edited' : 'user_confirmed',
      suggestedNeedType: draft.classification?.suggestedNeedType ?? draft.needType,
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
      {headerExtra && (
        <div style={{ padding: '8px 16px 0', flexShrink: 0 }}>{headerExtra}</div>
      )}
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
            {phase === 'confirm'
              ? '確認'
              : `${stepIndex + 1} / ${stepIds.length}${stepIds.length - stepIndex - 1 > 0 ? ` · あと ${stepIds.length - stepIndex - 1} 問` : ''}`}
            {isEdit ? ' · 編集' : ''}
          </div>
          <div style={{ fontWeight: 'bold', fontSize: 18 }}>
            {phase === 'confirm' ? '投稿内容の確認' : 'ピンの内容を決める'}
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
            classifying={classifying}
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

        {phase === 'chat' && stepId === 'when' && (
          <div style={{ marginTop: 4 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 8,
            }}
            >
              {TIME_TAG_OPTIONS.map((opt) => (
                <ChipOptionButton
                  key={opt.id}
                  active={(draft.timeTag ?? 'always') === opt.id}
                  onClick={() => onChange({ timeTag: opt.id })}
                >
                  <Pictogram src={opt.iconSrc} size={32} alt={opt.label} />
                  <span>{opt.label}</span>
                </ChipOptionButton>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => handleWhenConfirm(true)}
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
              <button
                type="button"
                onClick={() => handleWhenConfirm(false)}
                style={{
                  ...actionBtnStyle,
                  flex: 2,
                  background: AR_THEME.accentWarm,
                  color: '#0d1b2a',
                }}
              >
                次へ
              </button>
            </div>
          </div>
        )}

        {phase === 'chat' && stepId === 'severity' && (
          <div style={{ marginTop: 4 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 8,
            }}
            >
              {SEVERITY_OPTIONS.map((opt) => (
                <ChipOptionButton
                  key={opt.id}
                  active={(draft.severity ?? 'mid') === opt.id}
                  onClick={() => onChange({ severity: opt.id })}
                  accent={AR_THEME.accentWarm}
                >
                  <Pictogram src={opt.iconSrc} size={32} alt={opt.label} />
                  <span>{opt.label}</span>
                </ChipOptionButton>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => handleSeverityConfirm(true)}
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
              <button
                type="button"
                onClick={() => handleSeverityConfirm(false)}
                style={{
                  ...actionBtnStyle,
                  flex: 2,
                  background: AR_THEME.accentWarm,
                  color: '#0d1b2a',
                }}
              >
                確認へ
              </button>
            </div>
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
            <HintChips
              hints={textStepHints}
              prominent={stepId === 'place'}
              onPick={stepId === 'place' ? handleTextStepSubmit : appendHint}
            />
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
            {stepId === 'who' && (
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
                flex: stepId === 'who' ? 2 : 1,
                width: stepId === 'who' ? undefined : '100%',
                background: canSendText ? AR_THEME.accentWarm : 'rgba(255,255,255,0.12)',
                color: canSendText ? '#0d1b2a' : AR_THEME.muted,
                cursor: canSendText ? 'pointer' : 'not-allowed',
              }}
            >
              送信
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
