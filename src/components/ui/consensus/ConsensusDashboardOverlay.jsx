import React from 'react';
import { Users, Wheelchair, Baby, UserCircle, Hammer, CheckCircle2 } from 'lucide-react';
import { TRADEOFF_MATRIX } from '../../../constants/tradeoffMatrix';
import { PLAN_LABEL } from '../../../constants/barrierData';

const dashboardStyle = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(5, 10, 20, 0.95)',
  display: 'flex',
  flexDirection: 'column',
  padding: '40px 60px',
  color: 'white',
  zIndex: 100,
  overflowY: 'auto',
  fontFamily: 'sans-serif',
};

const gaugeRowStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '12px',
};

const gaugeLabelStyle = {
  width: '120px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#eceff1',
};

const gaugeBarContainerStyle = {
  flex: 1,
  height: '16px',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  overflow: 'hidden',
  position: 'relative',
  marginRight: '12px',
};

const gaugeBarStyle = (percent, color) => ({
  height: '100%',
  width: `${Math.max(0, Math.min(100, percent))}%`,
  background: color,
  transition: 'width 0.4s ease',
});

const listContainerStyle = {
  marginTop: '20px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  padding: '20px',
};

const questItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '12px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  alignItems: 'center',
};

export const ConsensusDashboardOverlay = ({
  consensusSession,
  quests,
  uiMode,
  setUiMode,
  undoQuestDecision,
  submitCompetitionEntry,
}) => {
  if (uiMode !== 'macro' || !consensusSession) return null;

  const {
    totalSessionBudget,
    remainingSessionBudget,
    islandSatisfaction,
    questDecisions,
  } = consensusSession;

  const activeQuests = quests.filter(q => questDecisions[q.id]);
  const allResolved = activeQuests.every(q => {
    const d = questDecisions[q.id];
    return d?.status === 'resolved' || d?.status === 'ignored';
  });

  const satKeys = [
    { key: 'general', label: '一般・若者', icon: UserCircle, color: '#4fc3f7' },
    { key: 'wheelchair', label: '車椅子', icon: Wheelchair, color: '#ffb74d' },
    { key: 'senior', label: '高齢者', icon: Users, color: '#81c784' },
    { key: 'childcare', label: '子育て', icon: Baby, color: '#f06292' },
  ];

  const minSat = Math.min(...satKeys.map(k => islandSatisfaction[k.key]));
  const canSubmit = allResolved && minSat >= 20;

  return (
    <div style={dashboardStyle}>
      <h1 style={{ fontSize: '24px', marginBottom: '30px', color: '#ffca28', display: 'flex', alignItems: 'center', gap: 10 }}>
        議会ダッシュボード（合意形成）
      </h1>

      <div style={{ display: 'flex', gap: '40px', marginBottom: '30px' }}>
        {/* Budget */}
        <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 202, 40, 0.3)' }}>
          <h2 style={{ fontSize: '16px', color: '#ffd54f', marginBottom: '15px' }}>残り予算</h2>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
            {remainingSessionBudget} <span style={{ fontSize: '16px', color: '#9e9e9e' }}>/ {totalSessionBudget}</span>
          </div>
          <div style={{ ...gaugeBarContainerStyle, marginTop: '10px' }}>
            <div style={gaugeBarStyle((remainingSessionBudget / totalSessionBudget) * 100, '#ffca28')} />
          </div>
        </div>

        {/* Satisfaction */}
        <div style={{ flex: 2, background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '16px', color: '#eceff1', marginBottom: '15px' }}>市民の満足度（20%以上でクリア）</h2>
          {satKeys.map(sat => (
            <div style={gaugeRowStyle} key={sat.key}>
              <div style={gaugeLabelStyle}>
                <sat.icon size={16} color={sat.color} />
                {sat.label}
              </div>
              <div style={gaugeBarContainerStyle}>
                <div style={gaugeBarStyle(islandSatisfaction[sat.key], sat.color)} />
                <div style={{ position: 'absolute', left: '20%', top: 0, bottom: 0, width: '2px', background: 'rgba(255,0,0,0.5)' }} />
              </div>
              <div style={{ width: '40px', textAlign: 'right', fontWeight: 'bold' }}>
                {Math.round(islandSatisfaction[sat.key])}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={listContainerStyle}>
        <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#cfd8dc' }}>不満と対策一覧</h3>
        {activeQuests.map(quest => {
          const decision = questDecisions[quest.id];
          if (!decision) return null;
          return (
            <div style={questItemStyle} key={quest.id}>
              <div style={{ flex: 2 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{quest.comment}</div>
                <div style={{ fontSize: '12px', color: '#90a4ae' }}>
                  タイプ: {decision.needType} / 規模: {decision.scale}
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                {decision.status === 'pending' ? (
                  <span style={{ color: '#ffb74d' }}>未対応</span>
                ) : decision.status === 'ignored' ? (
                  <span style={{ color: '#ef5350' }}>無視した</span>
                ) : (
                  <span style={{ color: '#81c784' }}>{PLAN_LABEL[decision.chosenPlan] ?? decision.chosenPlan}</span>
                )}
              </div>

              <div style={{ flex: 1, textAlign: 'right' }}>
                {decision.status !== 'pending' && (
                  <>
                    <span style={{ color: '#ffca28', marginRight: '15px' }}>
                      コスト: -{decision.planMatrixCostApplied + decision.blockCostSpent}
                    </span>
                    <button
                      onClick={() => undoQuestDecision(quest.id)}
                      style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer' }}
                    >
                      やり直す
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <button
          onClick={() => setUiMode('explore')}
          style={{ padding: '12px 24px', fontSize: '16px', borderRadius: '8px', background: '#455a64', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Hammer size={18} />
          現場（島）に戻る
        </button>

        <button
          disabled={!canSubmit}
          onClick={() => {
            submitCompetitionEntry();
            setUiMode('explore');
          }}
          style={{ padding: '12px 24px', fontSize: '16px', borderRadius: '8px', background: canSubmit ? '#2e7d32' : '#1b5e20', color: canSubmit ? '#fff' : '#81c784', border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed', opacity: canSubmit ? 1 : 0.6, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <CheckCircle2 size={18} />
          コンペに提出する
        </button>
      </div>
    </div>
  );
};
