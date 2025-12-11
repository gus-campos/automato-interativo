import { Position } from "@xyflow/react";

export type NodeLike = {
  id: string;

  measured?: {
    width?: number;
    height?: number;
  };

  internals?: {
    positionAbsolute?: {
      x: number;
      y: number;
    };
  };
};

function getNodeIntersection(
  intersectionNode: any,
  targetNode: any,
  offset: number = 0
) {
  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a

  // Encontra o ponto no qual o

  const { width: intersectionNodeWidth, height: intersectionNodeHeight } =
    intersectionNode.measured;
  const intersectionNodePosition = intersectionNode.internals.positionAbsolute;
  const targetPosition = targetNode.internals.positionAbsolute;

  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;

  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + targetNode.measured.width / 2;
  const y1 = targetPosition.y + targetNode.measured.height / 2;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1) || 1); // evita erro de NaN
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x: x, y: y };
}

function getEdgePosition(node: any, intersectionPoint: any) {
  const n = { ...node.internals.positionAbsolute, ...node };
  const nx = Math.round(n.x);
  const ny = Math.round(n.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + n.measured.width - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= n.y + n.measured.height - 1) {
    return Position.Bottom;
  }

  return Position.Top;
}

export function getFloatingEdgeParams(
  source: NodeLike,
  target: NodeLike,
  offset: number
) {
  const sourceIntersectionPoint = getNodeIntersection(source, target, offset);
  const targetIntersectionPoint = getNodeIntersection(target, source, offset);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}

export function getLoopEdgeParams(source: NodeLike, target: NodeLike) {
  if (!source.internals?.positionAbsolute || !source.measured)
    throw new Error("source e target não têm dados suficientes");

  const sourcePos = source.internals.positionAbsolute;
  const w = source.measured.width!;
  const h = source.measured.height!;

  const centerX = sourcePos.x;
  const centerY = sourcePos.y;

  const rateFromEdge = 3 / 4;

  const rightTarget = {
    ...target,
    internals: {
      positionAbsolute: {
        x: centerX - w, // só para deixar o ponto distante o suficiente
        y: centerY + h * rateFromEdge, // para que ele comece na beirada de cima
      },
    },
    measured: source.measured,
  };

  const topTarget = {
    ...target,
    internals: {
      positionAbsolute: {
        x: centerX - w * rateFromEdge, // para que ele comece na beirada da direita
        y: centerY + h,
      },
    },
    measured: source.measured,
  };

  const sourceIntersection = getNodeIntersection(source, rightTarget);
  const targetIntersection = getNodeIntersection(source, topTarget);

  return {
    sx: sourceIntersection.x,
    sy: sourceIntersection.y,
    tx: targetIntersection.x,
    ty: targetIntersection.y,
    h,
    w,
  };
}
