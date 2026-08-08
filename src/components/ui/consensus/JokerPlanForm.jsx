import React, { useMemo, useState } from 'react';
import { SATISFACTION_ATTRS } from '../../../constants/satisfactionAttributes';
import {
  JOKER_BUDGET_OPTIONS,
  JOKER_BUDGET_MAX,
  JOKER_BUDGET_MIN,
  createEmptyJokerDeltas,
  getJokerPlusBudgetCap,
  validateJokerPlan,
} from '../../../utils/jokerPlan';
import { PlanSatisfactionDeltas } from './SatisfactionGaugePanel';

const fieldStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(0,0,0,0.35)',
  color: '#fff',
  fontSize: 14,
  marginBottom: 10,
};

const labelStyle = {
  display: 'block',
  fontSize: 12,
  color: '#ffcc80',
  marginBottom: 6,
  fontWeight: 700,
};

export function JokerPlanForm({
  jokerAlreadyUsed = false,
  remainingBudget = 0,
  onSubmit,
  onCancel,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budgetCost, setBudgetCost] = useState(20);
  const [deltas, setDeltas] = useState(createEmptyJokerDeltas);
  const [error, setError] = useState('');

  const plusCap = useMemo(() => getJokerPlusBudgetCap(budgetCost), [budgetCost]);
  const validation = useMemo(
    () => validateJokerPlan({ title, description, budgetCost, deltas }),
    [title, description, budgetCost, deltas],
  );

  const handleDeltaChange = (key, raw) => {
    const parsed = raw === '' || raw === '-' ? 0 : Number(raw);
    setDeltas((prev) => ({
      ...prev,
      [key]: Number.isFinite(parsed) ? parsed : 0,
    }));
  };

  const handleSubmit = () => {
    if (jokerAlreadyUsed) {
      setError('このセッションではジョーカー施策は1回までです。');
      return;
    }
    if (budgetCost > remainingBudget) {
      setError(`残り予算（${remainingBudget}）を超えています。`);
      return;
    }
    if (!validation.ok) {
      setError(validation.message);
      return;
    }
    setError('');
    onSubmit?.(validation.payload);
  };

  return (
    <div style={{
      padding: '14px',
      borderRadius: 12,
      background: 'rgba(106, 27, 154, 0.22)',
      border: '1px solid rgba(186, 104, 200, 0.45)',
      marginBottom: 14,
    }}
    >
      <div style={{ fontSize: 15, fontWeight: 700, color: '#e1bee7', marginBottom: 8 }}>
        ジョーカー施策（参加者オリジナル案）
      </div>
      <div style={{ fontSize: 12, color: '#cfd8dc', lineHeight: 1.5, marginBottom: 12 }}>
        8つの型に当てはまらない困りごと用です。予算と満足度の増減を話し合って決め、DIYなしで確定します。
        {jokerAlreadyUsed && (
          <span style={{ display: 'block', color: '#ef9a9a', marginTop: 6 }}>
            ※ このセッションでは既にジョーカーを使用済みです。
          </span>
        )}
      </div>

      <label style={labelStyle}>案の名前</label>
      <input
        style={fieldStyle}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="例: 週1のよろず相談デー"
        maxLength={40}
      />

      <label style={labelStyle}>具体的な内容</label>
      <textarea
        style={{ ...fieldStyle, minHeight: 72, resize: 'vertical' }}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="例: 住民が集まって相談できる場を月1で設ける"
        maxLength={200}
      />

      <label style={labelStyle}>
        消費予算（
        {JOKER_BUDGET_MIN}
        〜
        {JOKER_BUDGET_MAX}
        ）— プラス上限
        {' '}
        {plusCap}
        {' '}
        pt
      </label>
      <select
        style={fieldStyle}
        value={budgetCost}
        onChange={(e) => setBudgetCost(Number(e.target.value))}
      >
        {JOKER_BUDGET_OPTIONS.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>

      <label style={labelStyle}>4属性の増減（整数・副作用必須）</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        {SATISFACTION_ATTRS.map((attr) => (
          <div key={attr.key}>
            <div style={{ fontSize: 11, color: '#b0bec5', marginBottom: 4 }}>{attr.shortLabel}</div>
            <input
              type="number"
              min={-25}
              max={25}
              step={1}
              style={{ ...fieldStyle, marginBottom: 0 }}
              value={deltas[attr.key] === 0 ? '' : deltas[attr.key]}
              onChange={(e) => handleDeltaChange(attr.key, e.target.value)}
              placeholder="0"
            />
          </div>
        ))}
      </div>

      <PlanSatisfactionDeltas deltas={deltas} />

      {error && (
        <div style={{ color: '#ef9a9a', fontSize: 12, marginTop: 10, lineHeight: 1.4 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: 10,
            border: 'none',
            background: '#455a64',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          戻る
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={jokerAlreadyUsed}
          style={{
            flex: 2,
            padding: '12px',
            borderRadius: 10,
            border: 'none',
            background: jokerAlreadyUsed ? '#616161' : '#8e24aa',
            color: '#fff',
            fontWeight: 700,
            cursor: jokerAlreadyUsed ? 'not-allowed' : 'pointer',
          }}
        >
          この案で確定する（DIYなし）
        </button>
      </div>
    </div>
  );
}
