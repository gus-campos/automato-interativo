import React from "react";
import { getBezierPath, useInternalNode, Position } from "@xyflow/react";
import { getFloatingEdgeParams } from "./util";

type FloatingEdgeProps = {
  id: string;
  source: string;
  target: string;
  markerEnd?: string;
  style?: React.CSSProperties;
  label?: any;
  curvature?: number;
  data: any;
};

function FloatingEdge({
  id,
  source,
  target,
  markerEnd,
  style,
  label,
  data,
}: FloatingEdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) return null;

  const curvature = data?.curvature || 0;
  const offsetMagnitude = curvature ? (curvature < 0 ? -0.5 : +0.5) : 0;

  const { sx, sy, tx, ty, sourcePos, targetPos } = getFloatingEdgeParams(
    sourceNode,
    targetNode,
    offsetMagnitude
  );

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos as Position,
    targetPosition: targetPos as Position,
    targetX: tx,
    targetY: ty,
  });

  const mx = (sx + tx) / 2;
  const my = (sy + ty) / 2;

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={style}
      />
      {label && (
        <>
          <rect
            x={mx - 10}
            y={my - 10}
            width={20}
            height={20}
            fill="white"
            rx={4}
          />
          <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle">
            {label}
          </text>
        </>
      )}
    </>
  );
}

export default FloatingEdge;
