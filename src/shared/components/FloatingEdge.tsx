import React from "react";
import {
  getBezierPath,
  useInternalNode,
  Position,
  EdgeProps,
} from "@xyflow/react";

import { getEdgeParams } from "./util";

type FloatingEdgeProps = {
  id: string;
  source: string;
  target: string;
  markerEnd?: string;
  style?: React.CSSProperties;
};

function FloatingEdge({
  id,
  source,
  target,
  markerEnd,
  style,
}: FloatingEdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) return null;

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode
  );

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos as Position,
    targetPosition: targetPos as Position,
    targetX: tx,
    targetY: ty,
  });

  return (
    <path
      id={id}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
      style={style}
    />
  );
}

export default FloatingEdge;
