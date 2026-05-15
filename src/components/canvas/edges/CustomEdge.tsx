import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';
import type { ConnectionData } from '../../../types';

export const CustomEdge = memo(function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as ConnectionData | undefined;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const mediaType = edgeData?.mediaType ?? 'ethernet';
  const strokeColor =
    mediaType === 'ethernet' ? '#3b82f6' :
    mediaType === 'serial' ? '#f97316' :
    '#22c55e';
  const strokeDash = mediaType === 'serial' ? '6 3' : undefined;
  const strokeWidth = selected ? 3 : 2;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray: strokeDash,
        }}
      />
      {edgeData && (
        <EdgeLabelRenderer>
          <div
            className="absolute text-[9px] font-mono bg-white border border-border rounded px-1 py-0.5 -translate-x-1/2 -translate-y-1/2 pointer-events-none whitespace-nowrap"
            style={{
              left: labelX,
              top: labelY,
            }}
          >
            <span style={{ color: strokeColor }}>
              {edgeData.speed}
            </span>
            <span className="text-text-muted ml-0.5">
              {mediaType === 'ethernet' ? 'Eth' : mediaType === 'serial' ? 'Ser' : 'Fib'}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
