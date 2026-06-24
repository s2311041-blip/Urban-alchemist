import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { Block } from './Block';
import { buildQuestPlacementPreview } from '../../utils/placePresets';
import { BugOrb } from './BugOrb';

export const QuestPlacementPreview = ({
  quest,
  hoverPosition,
  islandChunks = [],
  placedBlocks = [],
  showOrb = true,
  labelOverride = null,
}) => {
  const preview = useMemo(() => buildQuestPlacementPreview({
    quest,
    basePos: hoverPosition,
    islandChunks,
    existingBlocks: placedBlocks,
  }), [quest, hoverPosition, islandChunks, placedBlocks]);

  if (showOrb && !preview.orbPos) return null;
  if (!showOrb && preview.blocks.length === 0) return null;

  const labelPos = preview.orbPos ?? hoverPosition;
  const labelText = labelOverride
    ?? (preview.reusesSite
      ? '既存サイトにオーブを追加'
      : preview.label
        ? `${preview.label} + オーブ`
        : 'オーブを配置');

  return (
    <group>
      {preview.blocks.map((block) => (
        <Block
          key={`quest-preview-${block.shape}-${block.pos.join('-')}`}
          position={block.pos}
          shape={block.shape}
          material={block.material}
          rotation={block.rotation ?? 0}
          scale={block.scale}
          presetNeedType={block.presetNeedType ?? null}
          isGhost
        />
      ))}
      {showOrb && preview.orbPos && (
        <BugOrb
          bug={{ isMine: quest?.isMine, fromPost: true }}
          position={preview.orbPos}
          phaseKey={quest?.id}
          isGhost
          castShadow={false}
          raycast={() => null}
        />
      )}
      {labelPos && (
        <Html position={[labelPos[0], labelPos[1] + 1.1, labelPos[2]]} center>
          <div style={{
            background: 'rgba(10, 25, 41, 0.9)',
            border: '1px solid #f5a623',
            borderRadius: '10px',
            padding: '6px 12px',
            color: '#fff8e1',
            fontSize: '12px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
          >
            {labelText}
          </div>
        </Html>
      )}
    </group>
  );
};
