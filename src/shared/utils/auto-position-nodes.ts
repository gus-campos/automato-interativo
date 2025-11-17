import dagre from "@dagrejs/dagre";

import { Node, Edge } from "@xyflow/react";

type Direction = "TB" | "LR" | "BT" | "RL";

const nodeSize = {
  width: 400,
  height: 50,
};

export function getAutoPositionedNodes(
  nodes: Node[],
  edges: Edge[],
  direction: Direction = "TB"
): Node[] {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: nodeSize.width,
      height: nodeSize.height,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeSize.width / 2,
        y: nodeWithPosition.y - nodeSize.height / 2,
      },
    };
  });

  return layoutedNodes;
}
