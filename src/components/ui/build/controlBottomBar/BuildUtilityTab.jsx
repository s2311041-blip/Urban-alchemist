import React from 'react';
import {
  RotateCcw, Star, Sparkles,
} from 'lucide-react';
import { ENABLE_FREE_BUILD_PLACE_PRESETS } from '../../../../constants/buildFeatureFlags';
import { MATERIAL_COLORS } from '../../../../constants/gameData';
import { PLACE_ARCHETYPE_OPTIONS } from '../../../../utils/placePresets';

export const BuildUtilityTab = (props) => {
  const {
    favorites, setFavorites,
    selectedShape, selectedMaterial, selectedScale, blockRotation,
    handleSelectShape, setSelectedMaterial, setSelectedScale, setBlockRotation,
    recentBlocks,
    buildMode,
    onSpawnPreset,
  } = props;
  return (
    <>
            {buildMode === 'free' && ENABLE_FREE_BUILD_PLACE_PRESETS && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#4fc3f7', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Sparkles size={14} color="#4fc3f7" /> 場所プリセット配置
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {PLACE_ARCHETYPE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onSpawnPreset?.(option.id)}
                      style={{
                        background: 'rgba(79,195,247,0.1)',
                        color: '#e1f5fe',
                        border: '1px solid rgba(79,195,247,0.35)',
                        borderRadius: '8px',
                        padding: '8px 6px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(79,195,247,0.22)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(79,195,247,0.1)'; }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* お気に入りセクション */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffd54f', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Star size={14} color="#ffd54f" /> お気に入り
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {favorites.map((slot, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      onClick={() => {
                        if (slot) {
                          handleSelectShape(slot.shape);
                          setSelectedMaterial(slot.material);
                          setSelectedScale(slot.scale);
                          setBlockRotation(slot.rotation);
                        }
                      }}
                      style={{
                        background: slot ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.02)',
                        border: slot ? '1px solid rgba(255,213,79,0.3)' : '1px dashed rgba(255,255,255,0.1)', 
                        borderRadius: '8px',
                        color: slot ? 'white' : '#666', 
                        height: '42px',
                        fontSize: '9px', fontWeight: 'bold',
                        cursor: slot ? 'pointer' : 'default', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', padding: '4px',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => { if (slot) e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                      onMouseOut={(e) => { if (slot) e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                    >
                      <span style={{ fontSize: '10px' }}>★ {idx + 1}</span>
                      <span style={{ fontSize: '7px', color: '#ffd54f', marginTop: '2px', display: slot ? 'block' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>{slot?.label}</span>
                    </button>
                    <button
                      onClick={() => {
                        const name = prompt("お気に入りの名前を入力してください:", selectedShape === 'eraser' ? '消しゴム' : `${selectedMaterial}の${selectedShape}`);
                        if (name) {
                          const newFavs = [...favorites];
                          newFavs[idx] = {
                            id: Date.now(),
                            label: name.slice(0, 5),
                            shape: selectedShape,
                            material: selectedMaterial,
                            scale: [...selectedScale],
                            rotation: blockRotation
                          };
                          setFavorites(newFavs);
                        }
                      }}
                      style={{
                        background: 'rgba(255,213,79,0.08)', color: '#ffd54f', border: '1px solid rgba(255,213,79,0.2)',
                        borderRadius: '6px', fontSize: '8px', cursor: 'pointer', padding: '4px 0', fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,213,79,0.18)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,213,79,0.08)'}
                    >
                      登録
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 直近履歴セクション */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#00e5ff', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <RotateCcw size={14} color="#00e5ff" /> 直近履歴 (Recent)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {Array.from({ length: 3 }).map((_, idx) => {
                  const block = recentBlocks[idx];
                  return (
                    <button
                      key={idx}
                      disabled={!block}
                      onClick={() => {
                        if (block) {
                          handleSelectShape(block.shape);
                          setSelectedMaterial(block.material);
                          setSelectedScale(block.scale || [1, 1, 1]);
                          setBlockRotation(block.rotation || 0);
                        }
                      }}
                      style={{
                        background: block ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.02)',
                        border: block ? '1px solid rgba(0,229,255,0.2)' : '1px dashed rgba(255,255,255,0.1)', 
                        borderRadius: '8px',
                        color: block ? 'white' : '#555', 
                        height: '52px',
                        fontSize: '9px', fontWeight: 'bold',
                        cursor: block ? 'pointer' : 'default', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', padding: '4px',
                        transition: 'all 0.2s',
                      }}
                      onMouseOver={(e) => { if (block) e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                      onMouseOut={(e) => { if (block) e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                    >
                      {block ? (
                        <>
                          <div style={{ 
                            width: '10px', height: '10px', 
                            background: MATERIAL_COLORS[block.material] || '#fff', 
                            borderRadius: '50%', marginBottom: '4px',
                            border: '1px solid rgba(0,0,0,0.2)'
                          }} />
                          <span style={{ fontSize: '9px', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {block.shape === 'diagonal'    ? '斜め' :
                             block.shape === 'half'         ? 'ハーフ' :
                             block.shape === 'slope'        ? '階段' :
                             block.shape === 'pole'         ? '丸柱' :
                             block.shape === 'path'         ? '歩道' :
                             block.shape === 'leaf'         ? '葉っぱ' :
                             block.shape === 'rail'         ? '線路' :
                             block.shape === 'door'         ? 'ゲート' :
                             block.shape === 'bench'        ? 'ベンチ' :
                             block.shape === 'light_pole'   ? '街灯' :
                             block.shape === 'sign_post'    ? '案内看板' :
                             block.shape === 'ferry_dock'   ? 'フェリー停' :
                             block.shape === 'hoverboard_station' ? '乗り物台' :
                             block.shape === 'flower'       ? '草花' :
                             block.shape === 'shrub'        ? '低木' :
                             block.shape === 'turf'         ? '芝生' :
                             block.shape === 'hedge'        ? '垣根' :
                             block.shape === 'street_tree'  ? '街路樹' :
                             block.shape === 'canopy_tree'  ? '日陰樹' :
                             block.shape === 'farm_plot'    ? '畑' :
                             block.shape === 'rice_paddy'   ? '田んぼ' :
                             block.shape === 'garden_bed'   ? '菜園' :
                             block.shape === 'pond_tile'    ? '池' :
                             block.shape === 'stream_tile'  ? '小川' :
                             block.shape === 'waterfall'    ? '滝' :
                             block.shape === 'hill'         ? '丘' :
                             block.shape === 'beach_tile'   ? '砂浜' :
                             block.shape === 'bog_tile'     ? '沼地' :
                             block.shape === 'cliff_face'   ? '崖' :
                             block.shape === 'rock_field'   ? '岩場' :
                             block.shape === 'mountain'     ? '丘' : '立方体'}
                          </span>
                          <span style={{ fontSize: '7px', color: '#aaa', marginTop: '2px' }}>
                            {block.scale[0].toFixed(1)}x{block.scale[1].toFixed(1)}
                          </span>
                        </>
                      ) : (
                        <span style={{ color: '#444' }}>空</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
    </>
  );
};
