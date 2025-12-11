import { Edge, MarkerType, Node, Position } from "@xyflow/react";

const nodeDefaults = {
  style: {
    border: "1px solid black",
    borderRadius: "10px",
    width: "100px",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const terminalNodeDefaults = {
  style: {
    ...nodeDefaults.style,
    outline: "1px solid black",
    outlineOffset: "2px",
  },
};

const edgeDefaults = {
  interactionWidth: 200,
  style: { strokeWidth: 2, stroke: "#999" },
  markerEnd: {
    type: MarkerType.Arrow,
    color: "black",
    strokeWidth: 1.5,
  },
  type: "floating",
};

const loopEdgeDefault = {
  ...edgeDefaults,
  type: "loop",
};

export function automatToReactFlow(nfa: NFA): [Node[], Edge[]] {
  const nodes: Node[] = nfa.states.map((state) => {
    const isTerminal = nfa.accept.includes(state);

    return {
      ...(isTerminal ? terminalNodeDefaults : nodeDefaults),
      id: state,
      position: { x: 0, y: 0 },
      data: { label: state },
    };
  });

  const edges: Edge[] = Object.entries(nfa.transitions).flatMap(
    ([origem, transicoes]) =>
      Object.entries(transicoes).flatMap(([letra, alvos]) =>
        alvos.map((alvo) => {
          const isLoop = origem === alvo;

          const returnTransitions = nfa.transitions[alvo]
            ? Object.values(nfa.transitions[alvo])
            : undefined;

          const hasInverseEdge = returnTransitions
            ? returnTransitions.some((destinos) => destinos.includes(origem))
            : false;

          const curvature = hasInverseEdge
            ? origem < alvo
              ? 0.5
              : -0.5
            : undefined;

          console.log(curvature, origem, alvo, returnTransitions);

          return {
            ...(isLoop ? loopEdgeDefault : edgeDefaults),
            id: `e-${origem}-${alvo}`,
            source: origem,
            target: alvo,
            label: letra,
            data: { curvature },
          } as Edge;
        })
      )
  );

  // Usado para criar a seta pro primeiro estado
  const initialNode: Node = {
    ...nodeDefaults,
    id: "INTIAL",
    position: { x: 0, y: 0 },
    data: { label: "" },
    style: {
      border: "none",
      background: "transparent",
      padding: "1px",
      margin: "1px",
      width: "1px",
      height: "1px",
      overflow: "hidden",
    },
  };

  // Idem
  const initialEdge: Edge = {
    ...edgeDefaults,
    id: `e-INTIAL-${nfa.start}`,
    source: "INTIAL",
    target: nfa.start,
  };

  return [
    [initialNode, ...nodes],
    [initialEdge, ...edges],
  ] as const;
}
