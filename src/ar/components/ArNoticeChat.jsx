import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, Loader2, MapPin, Send, SkipForward, Sparkles, Tag } from 'lucide-react';
import { AR_THEME, chipStyle } from '../constants/arTheme';
import { classifyAnnotation } from '../api/classifyAnnotation';
import {
  NOTICE_CATEGORY_GROUPS,
  NOTICE_CATEGORY_OPTIONS,
  NOTICE_INTENSITY_OPTIONS,
  NOTICE_PERSPECTIVE_OPTIONS,
  categoryIdFromAnnotation,
  getNoticeCategory,
  noticeCategoryPatch,
} from '../constants/noticeCategories';
import {
  getSeverityLabel,
  getTimeTagLabel,
  inferPlaceArchetypeFromText,
  PLACE_INPUT_HINTS,
  PLACE_OTHER_LABEL,
} from '../utils/classifyMetaFields';
import { SEVERITY_OPTIONS, TIME_TAG_OPTIONS } from '../../constants/barrierData';
import { getNeedTypeOption } from '../constants/needTypeGroups';
import { Pictogram } from '../../components/ui/Pictogram';

const STEPS = ['place', 'story', 'perspective', 'when', 'intensity'];
const TEXT_INPUT_STEPS = new Set(['place', 'story', 'perspective']);

const QUESTIONS = {
  place: 'ここはどんな場所ですか？',
  story: 'どんなことがあって、どう感じましたか？',
  perspective: '誰の目線（立場）でそう感じましたか？',
  when: 'いつそう感じることが多いですか？',
  intensity: 'その気持ちの強さはどのくらいですか？',
};

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
        whiteSpace: 'pre-wrap',
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

function HintChips({ hints, onPick, prominent = false, activeHint = null, lead = null }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8, alignItems: 'center' }}>
      {lead && (
        <span style={{ fontSize: 13, fontWeight: 700, color: AR_THEME.muted }}>{lead}</span>
      )}
      {hints.map((hint) => {
        const active = hint === activeHint;
        return (
          <button
            key={hint}
            type="button"
            onClick={() => onPick(hint)}
            style={{
              padding: prominent ? '10px 14px' : '6px 10px',
              minHeight: prominent ? 44 : undefined,
              borderRadius: 999,
              border: active
                ? `2px solid ${AR_THEME.accentWarm}`
                : prominent ? `1px solid ${AR_THEME.accent}66` : '1px solid rgba(255,255,255,0.18)',
              background: active
                ? 'rgba(255,183,77,0.22)'
                : prominent ? 'rgba(79,195,247,0.12)' : 'rgba(255,255,255,0.06)',
              color: AR_THEME.text,
              fontSize: prominent ? 14 : 12,
              fontWeight: active || prominent ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {hint}
          </button>
        );
      })}
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

function NoticeConfirmCard({
  draft,
  category,
  onConfirm,
  onManual,
  onEditLocation,
  isEdit,
}) {
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
        気づきの確認
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

      {category && category.id !== 'positive_place' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 12px',
          borderRadius: 12,
          border: `1px solid ${AR_THEME.accent}55`,
          background: 'rgba(79,195,247,0.08)',
          marginBottom: 12,
        }}
        >
          <Tag size={18} color={AR_THEME.accent} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: AR_THEME.muted, marginBottom: 2 }}>整理された気づき</div>
            <div style={{ fontSize: 15, fontWeight: 'bold', lineHeight: 1.35 }}>
              {category.label}
              {category.hint ? (
                <span style={{ fontWeight: 500, color: AR_THEME.muted, fontSize: 13 }}>
                  {' '}
                  （
                  {category.hint}
                  ）
                </span>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <div style={{ fontSize: 13, lineHeight: 1.5, color: AR_THEME.muted, marginBottom: 12 }}>
        <div>場所：{draft.placeText || '—'}</div>
        <div style={{ marginTop: 4 }}>体験：{draft.comment || '—'}</div>
        {draft.whoText ? <div style={{ marginTop: 4 }}>目線：{draft.whoText}</div> : null}
        <div style={{ marginTop: 4 }}>いつ：{getTimeTagLabel(draft.timeTag ?? 'always')}</div>
        <div style={{ marginTop: 4 }}>
          強さ：
          {getSeverityLabel(draft.severity ?? 'low')}
        </div>
      </div>

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
          marginBottom: 8,
        }}
      >
        {isEdit ? 'この内容で保存' : 'この内容で共有する'}
      </button>
      <button
        type="button"
        onClick={onManual}
        style={{
          width: '100%',
          padding: 12,
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.18)',
          background: 'rgba(255,255,255,0.06)',
          color: AR_THEME.text,
          fontWeight: 600,
          fontSize: 15,
          cursor: 'pointer',
        }}
      >
        ちょっと違うかも？（直す）
      </button>
    </div>
  );
}

function ManualCategoryPicker({ currentCategoryId, onChoose }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
      <p style={{ margin: 0, fontSize: 14, color: AR_THEME.muted, lineHeight: 1.5 }}>
        いちばん近いものを1つ選んでください。
      </p>
      {NOTICE_CATEGORY_GROUPS.map((group) => (
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
            <div style={{ fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span aria-hidden>{group.emoji}</span>
              <span>{group.label}</span>
            </div>
            {group.description && (
              <div style={{ fontSize: 12, color: AR_THEME.muted, marginTop: 4, lineHeight: 1.4 }}>
                {group.description}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 10 }}>
            {NOTICE_CATEGORY_OPTIONS
              .filter((option) => option.group === group.id)
              .map((option) => {
                const active = currentCategoryId === option.id;
                const iconSrc = getNeedTypeOption(option.needType)?.iconSrc;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onChoose(option.id)}
                    style={{
                      width: '100%',
                      padding: '12px 12px',
                      borderRadius: 12,
                      border: active ? `2px solid ${group.color}` : '1px solid rgba(255,255,255,0.14)',
                      background: active ? `${group.color}22` : 'rgba(255,255,255,0.04)',
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
                      {iconSrc ? (
                        <Pictogram src={iconSrc} size={36} alt="" />
                      ) : (
                        <Sparkles size={28} color={group.color} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: active ? 'bold' : '600', marginBottom: 4 }}>
                        {option.label}
                      </div>
                      {option.hint && (
                        <div style={{ fontSize: 13, color: AR_THEME.muted, lineHeight: 1.45 }}>
                          {option.hint}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}

export function ArNoticeChat({
  draft,
  onChange,
  onBack,
  onSubmit,
  onEditLocation,
  isEdit = false,
  headerExtra = null,
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState(isEdit ? 'confirm' : 'chat');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [classificationResult, setClassificationResult] = useState(null);
  const [placeOtherOpen, setPlaceOtherOpen] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const bootedRef = useRef(false);
  const positiveTimerRef = useRef(null);

  const stepId = STEPS[stepIndex] ?? 'intensity';
  const canGoBack = phase === 'confirm' || phase === 'manual' || stepIndex > 0;

  useEffect(() => () => {
    if (positiveTimerRef.current) window.clearTimeout(positiveTimerRef.current);
  }, []);

  const currentCategoryId = categoryIdFromAnnotation({
    ...draft,
    categoryId: classificationResult?.categoryId ?? draft.categoryId,
  });
  const currentCategory = getNoticeCategory(currentCategoryId);

  const appendBot = useCallback((text) => {
    setMessages((prev) => [...prev, { role: 'bot', text }]);
  }, []);

  const appendUser = useCallback((text) => {
    setMessages((prev) => [...prev, { role: 'user', text }]);
  }, []);

  const promptForStep = useCallback((id) => {
    const q = QUESTIONS[id];
    if (!q) return;
    if (id === 'perspective') {
      appendBot(`${q}\n（自分の立場について、もし可能であれば詳細に記述してください。例：自転車に乗って通学している若者の目線）`);
      return;
    }
    if (id === 'when') {
      appendBot(`${q}\n（任意です。スキップすると「いつでも」になります）`);
      return;
    }
    if (id === 'intensity') {
      appendBot(`${q}\n（任意の質問です。スキップしても大丈夫です）`);
      return;
    }
    appendBot(q);
  }, [appendBot]);

  const advanceToStep = useCallback((nextIndex) => {
    setStepIndex(nextIndex);
    if (nextIndex < STEPS.length) {
      promptForStep(STEPS[nextIndex]);
    }
  }, [promptForStep]);

  const schedulePositiveSubmit = useCallback((payload) => {
    setPhase('positive');
    if (positiveTimerRef.current) window.clearTimeout(positiveTimerRef.current);
    positiveTimerRef.current = window.setTimeout(() => onSubmit(payload), 2000);
  }, [onSubmit]);

  const runClassification = useCallback(async (payload) => {
    setPhase('classifying');
    appendBot('まちづくりの議題として整理しています…');
    try {
      const result = await classifyAnnotation(payload);
      const categoryId = result.categoryId
        ?? NOTICE_CATEGORY_OPTIONS.find((option) => option.needType === result.needType)?.id;
      const category = getNoticeCategory(categoryId);
      if (!category) {
        setClassificationResult(result);
        setPhase('manual');
        appendBot('一番近い気持ちを選んでください');
        return;
      }
      const patch = noticeCategoryPatch(categoryId, {
        ...result.classification,
        status: 'auto_proposed',
        source: result.classification?.source ?? 'fallback',
        message: result.message,
      }, payload.comment);
      const finalPayload = { ...payload, ...patch };
      setClassificationResult({ ...result, categoryId, category });
      onChange(patch);
      appendBot(patch.classificationMessage);

      if (categoryId === 'positive_place') {
        schedulePositiveSubmit(finalPayload);
      } else {
        setPhase('confirm');
      }
    } catch (error) {
      console.error('[ArNoticeChat] classification failed', error);
      setPhase('manual');
      appendBot('一番近い気持ちを選んでください');
    }
  }, [appendBot, onChange, schedulePositiveSubmit]);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    if (isEdit) {
      setClassificationResult({
        categoryId: draft.categoryId,
        message: draft.classificationMessage,
      });
      setPhase('confirm');
      appendBot('編集内容を確認してください。');
      if (draft.classificationMessage) appendBot(draft.classificationMessage);
      return;
    }
    if (draft.promptTitle && draft.promptKind !== 'free') {
      const kindLabel = draft.promptKind === 'special' ? '特設のお題' : '今月のお題';
      appendBot(
        `${kindLabel}：「${draft.promptTitle}」\n`
        + '街での気づきを、そのまま教えてください。',
      );
    } else {
      appendBot('街の気づきを、一緒に記録していきましょう。');
    }
    promptForStep('place');
  }, [appendBot, draft.classificationMessage, draft.promptKind, draft.promptTitle, isEdit, promptForStep]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, phase]);

  useEffect(() => {
    if (phase !== 'chat' || !TEXT_INPUT_STEPS.has(stepId)) return;
    if (stepId === 'story') setInputText(draft.comment ?? '');
    if (stepId === 'place') {
      const existing = draft.placeText ?? '';
      setInputText(existing);
      const isPreset = PLACE_INPUT_HINTS.includes(existing);
      setPlaceOtherOpen(Boolean(existing) && !isPreset);
    }
    if (stepId === 'perspective') setInputText(draft.whoText ?? '');
  }, [phase, stepId, draft.comment, draft.placeText, draft.whoText]);

  const canSendText = useMemo(() => inputText.trim().length >= 1, [inputText]);

  const textStepPlaceholder = useMemo(() => {
    if (stepId === 'story') {
      return '例：自転車が近くを通ってヒヤッとした\n例：日陰があって涼しくて休めた\n例：暗くて通りづらい';
    }
    if (stepId === 'place') return '例：地下道、駐輪場';
    if (stepId === 'perspective') return '例：自転車に乗って通学している若者の目線';
    return '';
  }, [stepId]);

  const handleTextStepSubmit = (overrideText) => {
    const text = typeof overrideText === 'string' ? overrideText.trim() : inputText.trim();

    if (stepId === 'place') {
      if (!text) return;
      const placeMeta = inferPlaceArchetypeFromText(text);
      const patch = { placeText: text, placeArchetype: placeMeta.placeArchetype };
      onChange(patch);
      appendUser(text);
      setInputText('');
      advanceToStep(stepIndex + 1);
      return;
    }

    if (stepId === 'story') {
      if (!text) return;
      onChange({ comment: text });
      appendUser(text);
      setInputText('');
      advanceToStep(stepIndex + 1);
      return;
    }

    if (stepId === 'perspective') {
      onChange({ whoText: text });
      appendUser(text || '（スキップ）');
      setInputText('');
      advanceToStep(stepIndex + 1);
    }
  };

  const handleWhenConfirm = (skipped = false) => {
    const timeTag = draft.timeTag ?? 'always';
    onChange({ timeTag });
    appendUser(skipped ? '（スキップ — いつでも）' : getTimeTagLabel(timeTag));
    advanceToStep(stepIndex + 1);
  };

  const handleIntensityConfirm = (severity, skipped = false) => {
    const patch = {
      recordKind: 'notice',
      postKind: 'notice',
      severity,
    };
    onChange(patch);
    appendUser(skipped ? '（スキップ — すこし）' : getSeverityLabel(severity));
    runClassification({ ...draft, ...patch });
  };

  const insertPerspective = (label) => {
    setInputText((prev) => {
      const base = prev.trim();
      if (!base) return label;
      if (base.split('、').map((part) => part.trim()).includes(label)) return base;
      return `${base}、${label}`;
    });
    inputRef.current?.focus();
  };

  const confirmIssue = () => {
    const categoryId = currentCategoryId;
    const patch = noticeCategoryPatch(categoryId, {
      ...draft.classification,
      status: draft.classification?.status === 'user_edited' ? 'user_edited' : 'user_confirmed',
      message: draft.classificationMessage || classificationResult?.message,
    }, draft.comment);
    onChange(patch);
    onSubmit({ ...draft, ...patch });
  };

  const chooseCategory = (categoryId) => {
    const previous = draft.classification ?? {};
    const patch = noticeCategoryPatch(categoryId, {
      ...previous,
      status: 'user_edited',
      source: 'user',
      editedCategoryId: categoryId,
      message: undefined,
      classificationMessage: undefined,
    }, draft.comment);
    onChange(patch);
    setClassificationResult((result) => ({
      ...result,
      categoryId,
      category: getNoticeCategory(categoryId),
      message: patch.classificationMessage,
    }));
    appendUser(getNoticeCategory(categoryId)?.label ?? categoryId);
    appendBot(patch.classificationMessage);

    if (categoryId === 'positive_place') {
      schedulePositiveSubmit({ ...draft, ...patch });
      return;
    }
    setPhase('confirm');
  };

  const handleGoBack = () => {
    if (phase === 'manual') {
      setPhase('confirm');
      return;
    }
    if (phase === 'confirm') {
      if (isEdit) {
        onBack();
        return;
      }
      setPhase('chat');
      setStepIndex(STEPS.length - 1);
      setMessages((prev) => {
        const next = [...prev];
        while (next.length && next[next.length - 1].role === 'bot') next.pop();
        if (next.length && next[next.length - 1].role === 'user') next.pop();
        return next;
      });
      promptForStep('intensity');
      return;
    }
    if (stepIndex <= 0) {
      onBack();
      return;
    }
    setMessages((prev) => {
      const next = [...prev];
      if (next.length && next[next.length - 1].role === 'bot') next.pop();
      if (next.length && next[next.length - 1].role === 'user') next.pop();
      return next;
    });
    const prevIndex = stepIndex - 1;
    setStepIndex(prevIndex);
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
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
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
        {phase !== 'positive' && phase !== 'classifying' && (
          <button type="button" onClick={handleGoBack} style={navBtnStyle} aria-label="前へ戻る">
            <ChevronLeft size={22} />
          </button>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: AR_THEME.muted }}>
            街の気づきを記録
            {phase === 'chat' && !isEdit ? ` · ${stepIndex + 1} / ${STEPS.length}` : ''}
            {isEdit ? ' · 編集' : ''}
          </div>
          <div style={{ fontWeight: 'bold', fontSize: 18 }}>
            {phase === 'confirm' ? '気づきの確認'
              : phase === 'manual' ? '一番近い気持ちを選んでください'
                : phase === 'positive' ? '記録しています'
                  : phase === 'classifying' ? '内容を整理しています'
                    : 'ピンの内容を決める'}
          </div>
        </div>
        {canGoBack && phase === 'chat' && stepIndex > 0 && (
          <button
            type="button"
            onClick={handleGoBack}
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

        {phase === 'classifying' && (
          <div style={{ textAlign: 'center', padding: 16 }}>
            <Loader2 size={32} color={AR_THEME.accent} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {phase === 'positive' && (
          <div style={{ textAlign: 'center', padding: '24px 8px' }}>
            <Sparkles size={48} color={AR_THEME.positive} />
          </div>
        )}

        {phase === 'confirm' && currentCategoryId !== 'positive_place' && (
          <NoticeConfirmCard
            draft={draft}
            category={currentCategory}
            onConfirm={confirmIssue}
            onManual={() => {
              setPhase('manual');
              appendBot('一番近い気持ちを選んでください');
            }}
            onEditLocation={onEditLocation}
            isEdit={isEdit}
          />
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

        {phase === 'chat' && stepId === 'intensity' && (
          <div style={{ marginTop: 4 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 8,
            }}
            >
              {SEVERITY_OPTIONS.map((opt) => {
                const label = NOTICE_INTENSITY_OPTIONS.find((o) => o.id === opt.id)?.label ?? opt.label;
                return (
                  <ChipOptionButton
                    key={opt.id}
                    active={(draft.severity ?? 'low') === opt.id}
                    onClick={() => onChange({ severity: opt.id })}
                    accent={AR_THEME.accentWarm}
                  >
                    <Pictogram src={opt.iconSrc} size={32} alt={label} />
                    <span>{label}</span>
                  </ChipOptionButton>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => handleIntensityConfirm('low', true)}
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
                onClick={() => handleIntensityConfirm(draft.severity ?? 'low', false)}
                style={{
                  ...actionBtnStyle,
                  flex: 2,
                  background: AR_THEME.accentWarm,
                  color: '#0d1b2a',
                }}
              >
                整理する
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {phase === 'manual' && (
          <ManualCategoryPicker
            currentCategoryId={currentCategoryId}
            onChoose={chooseCategory}
          />
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
          {stepId === 'perspective' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {NOTICE_PERSPECTIVE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => insertPerspective(option.label)}
                  style={{
                    ...chipStyle(inputText.split('、').map((part) => part.trim()).includes(option.label), AR_THEME.accent),
                    width: 'auto',
                    padding: '10px 14px',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
          {stepId === 'place' && (
            <HintChips
              hints={PLACE_INPUT_HINTS}
              prominent
              activeHint={placeOtherOpen ? PLACE_OTHER_LABEL : null}
              onPick={(hint) => {
                if (hint === PLACE_OTHER_LABEL) {
                  setPlaceOtherOpen(true);
                  inputRef.current?.focus();
                  return;
                }
                setPlaceOtherOpen(false);
                handleTextStepSubmit(hint);
              }}
            />
          )}
          {(stepId === 'place' || stepId === 'perspective') && (
            <p style={{
              margin: '0 0 8px',
              fontSize: 13,
              lineHeight: 1.45,
              color: AR_THEME.text,
              fontWeight: 600,
            }}
            >
              {stepId === 'place'
                ? '上から選ぶか、ここに場所の名前を書いてください'
                : '上から選ぶか、ここに目線（立場）を書いてください'}
            </p>
          )}
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={textStepPlaceholder}
            rows={stepId === 'story' ? 3 : 2}
            maxLength={500}
            style={{
              ...inputStyle,
              minHeight: stepId === 'story' ? 80 : 56,
              resize: 'none',
              marginBottom: 8,
              marginTop: 0,
              border: placeOtherOpen ? `1px solid ${AR_THEME.accentWarm}` : inputStyle.border,
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            {stepId === 'perspective' && (
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
              onClick={() => handleTextStepSubmit()}
              style={{
                ...actionBtnStyle,
                flex: stepId === 'perspective' ? 2 : 1,
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
