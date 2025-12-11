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
  sourceNode: any,
  targetNode: any,
  displacement: number = 0
) {
  const sourceDimensions = {
    x: sourceNode.measured.width,
    y: sourceNode.measured.height,
  };

  // Calcula o centro do nó source
  const sourceCenter = {
    x: sourceNode.internals.positionAbsolute.x + sourceDimensions.x / 2,
    y: sourceNode.internals.positionAbsolute.y + sourceDimensions.y / 2,
  };

  // Calcula o centro do nó target
  const targetCenter = {
    x: targetNode.internals.positionAbsolute.x + targetNode.measured.width / 2,
    y: targetNode.internals.positionAbsolute.y + targetNode.measured.height / 2,
  };

  // Ponto de partida: centro horizontal deslocado pelo displacement
  const startPoint = {
    x: sourceCenter.x + displacement * (sourceDimensions.x / 2),
    y: sourceCenter.y,
  };

  // Direção do raio (de startPoint para targetCenter)
  const dx = targetCenter.x - startPoint.x;
  const dy = targetCenter.y - startPoint.y;

  // Bordas do retângulo source
  const left = sourceCenter.x - sourceDimensions.x / 2;
  const right = sourceCenter.x + sourceDimensions.x / 2;
  const top = sourceCenter.y - sourceDimensions.y / 2;
  const bottom = sourceCenter.y + sourceDimensions.y / 2;

  let bestT = Infinity;
  let intersection = null;

  // Testa borda esquerda
  if (dx !== 0) {
    const t = (left - startPoint.x) / dx;
    if (t > 0) {
      const y = startPoint.y + t * dy;
      if (y >= top && y <= bottom && t < bestT) {
        bestT = t;
        intersection = { x: left, y };
      }
    }
  }

  // Testa borda direita
  if (dx !== 0) {
    const t = (right - startPoint.x) / dx;
    if (t > 0) {
      const y = startPoint.y + t * dy;
      if (y >= top && y <= bottom && t < bestT) {
        bestT = t;
        intersection = { x: right, y };
      }
    }
  }

  // Testa borda superior
  if (dy !== 0) {
    const t = (top - startPoint.y) / dy;
    if (t > 0) {
      const x = startPoint.x + t * dx;
      if (x >= left && x <= right && t < bestT) {
        bestT = t;
        intersection = { x, y: top };
      }
    }
  }

  // Testa borda inferior
  if (dy !== 0) {
    const t = (bottom - startPoint.y) / dy;
    if (t > 0) {
      const x = startPoint.x + t * dx;
      if (x >= left && x <= right && t < bestT) {
        bestT = t;
        intersection = { x, y: bottom };
      }
    }
  }

  // Fallback: se não encontrou interseção, retorna o centro
  return intersection || sourceCenter;
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
  displacement: number
) {
  const sourceIntersectionPoint = getNodeIntersection(
    source,
    target,
    displacement
  );
  const targetIntersectionPoint = getNodeIntersection(
    target,
    source,
    displacement
  );

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
