import React from 'react';
import {
  RotateCcw, Trash2, MousePointerClick,
  Hammer, Sparkles, Check,
} from 'lucide-react';
import { useGameStore } from '../../../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';

export const BuildBottomBarFooter = (props) => {
  const {
    selectedShape, selectedEditBlockId, diagonalFirstPoint,
    undoStack, handleUndo, redoStack, handleRedo,
    buildMode, finishBuildMode,
  } = props;
  const store = useGameStore(useShallow(state => ({
    finishEditingInStudio: state.finishEditingInStudio,
    submitCompetitionEntry: state.submitCompetitionEntry,
  })));
  return (
    <>
      {/* 3. ガイダンスと操作ガイド */}
      <div style={{ 
        padding: '12px 20px', 
        background: 'rgba(0, 0, 0, 0.3)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        {/* ガイドメッセージ */}
        <div style={{ 
          color: selectedShape === 'eraser' ? '#ff5252' : selectedShape === 'edit' ? '#ffd54f' : '#00e5ff', 
          fontWeight: 'bold', fontSize: '11px', display: 'flex', 
          alignItems: 'center', gap: '6px',
          lineHeight: '1.4'
        }}>
          {selectedShape === 'eraser' ? (
            <>
              <Trash2 size={13} /> 狙いを定めてブロックを【クリック】で消去します
            </>
          ) : selectedShape === 'edit' ? (
            selectedEditBlockId ? (
              <>
                <Check size={13} /> 3Dギズモ（交差構造体）をドラッグしてサイズ・位置を編集できます！
              </>
            ) : (
              <>
                <MousePointerClick size={13} /> 変更したいブロックを【クリック】して選択してください
              </>
            )
          ) : selectedShape === 'diagonal' ? (
            diagonalFirstPoint ? (
              <>
                <Check size={13} /> 2点目のアンカーポイントを選択してください（【Esc】でリセット）
              </>
            ) : (
              <>
                <Hammer size={13} /> 設計画面でアンカーを2点選んで設計します
              </>
            )
          ) : (
            <>
              <Hammer size={13} /> 【地面をクリック】で配置します
            </>
          )}
        </div>

        {selectedShape !== 'eraser' && selectedShape !== 'edit' && selectedShape !== 'diagonal' && (
          <div style={{ fontSize: '10px', color: '#aaa', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span>🔄 【F】で回転</span>
              <span>⏪ 【Q/W/E/R】でショートカット</span>
            </div>
            {(selectedShape === 'hill' || selectedShape === 'mountain') && (
              <span>🏔️ 丘は段差とスロープを登って頂上へ行けます</span>
            )}
            {selectedShape === 'hoverboard_station' && (
              <span>🛹 下のカラーパレットでボード色を選んでから配置できます</span>
            )}
          </div>
        )}
      </div>

      {/* 4. フッター・アクションボタンエリア */}
      <div style={{ 
        padding: '16px 20px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* Undo/Redo */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            disabled={undoStack.length === 0}
            onClick={handleUndo}
            style={{
              flex: 1,
              background: undoStack.length === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
              color: undoStack.length === 0 ? 'rgba(255,255,255,0.2)' : '#00e5ff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: undoStack.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.2s',
            }}
          >
            <RotateCcw size={12} />
            戻す
          </button>
          <button
            disabled={redoStack.length === 0}
            onClick={handleRedo}
            style={{
              flex: 1,
              background: redoStack.length === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
              color: redoStack.length === 0 ? 'rgba(255,255,255,0.2)' : '#00e5ff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: redoStack.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.2s',
            }}
          >
            <RotateCcw size={12} style={{ transform: 'scaleX(-1)' }} />
            やり直す
          </button>
        </div>

        {/* 完了 / 終了ボタン */}
        {selectedShape === 'edit' && selectedEditBlockId ? (
          <button 
            onClick={store.finishEditingInStudio} 
            style={{ 
              width: '100%',
              background: '#00e5ff', color: '#000', border: 'none', 
              padding: '12px', borderRadius: '12px', fontSize: '15px', 
              fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0, 229, 255, 0.4)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#00b8d4'}
            onMouseOut={(e) => e.currentTarget.style.background = '#00e5ff'}
          >
            <Check size={16} /> 編集を確定して島に戻る
          </button>
        ) : (
          <>
            {buildMode !== 'free' && (
              <button
                type="button"
                onClick={() => store.submitCompetitionEntry?.()}
                style={{
                  width: '100%',
                  background: 'rgba(255, 183, 77, 0.18)',
                  color: '#ffe0b2',
                  border: '1px solid rgba(255, 183, 77, 0.35)',
                  padding: '10px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={14} />
                コンペに匿名エントリー
              </button>
            )}
          <button 
            type="button"
            onClick={() => finishBuildMode()}
            style={{ 
              width: '100%',
              background: '#4CAF50', color: 'white', border: 'none', 
              padding: '12px', borderRadius: '12px', fontSize: '15px', 
              fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#43a047'}
            onMouseOut={(e) => e.currentTarget.style.background = '#4CAF50'}
          >
            {buildMode === 'free' ? <Hammer size={16} /> : <Sparkles size={16} />}
            {buildMode === 'free' ? '建築モードを終了する' : '完成させる！'}
          </button>
          </>
        )}
      </div>
    </>
  );
};
