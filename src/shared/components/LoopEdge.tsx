import { useInternalNode } from "@xyflow/react";
import { getLoopEdgeParams } from "./util";
import React from "react";

type LoopEdgeProps = {
  id: string;
  source: string;
  target: string;
  markerEnd?: string;
  style?: React.CSSProperties;
  label?: any;
};

export const LoopEdge = ({
  id,
  source,
  target,
  markerEnd,
  style,
  label,
}: LoopEdgeProps) => {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) return null;

  const { sx, sy, tx, ty, h, w } = getLoopEdgeParams(sourceNode, targetNode);

  // Cria uma bezier cúbica manual para uma curva mais redonda

  const distRate = 0.25;

  const cp1x = sx - w * distRate;
  const cp1y = sy + h * distRate;

  const cp2x = tx - w * distRate;
  const cp2y = ty + w * distRate;

  const edgePath = `M ${sx},${sy} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${tx},${ty}`;

  const mx = 0.125 * sx + 0.375 * cp1x + 0.375 * cp2x + 0.125 * tx;
  const my = 0.125 * sy + 0.375 * cp1y + 0.375 * cp2y + 0.125 * ty;

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
            x={mx - 5}
            y={my - 5}
            width={10}
            height={10}
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
};
