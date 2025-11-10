import { Edge, MarkerType, Node, Position } from "reactflow";

const nodeDefaults = {
  style: {
    border: "1px solid black",
    borderRadius: "10px",
  },
};

const terminalNodeDefaults = {
  style: {
    ...nodeDefaults,
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
};

export function automatToReactFlow(nfa: NFA): [Node[], Edge[]] {
  const isTerminal = (state: State) => nfa.accept.includes(state);

  const nodes: Node[] = nfa.states.map((state) => {
    return {
      ...(isTerminal(state) ? terminalNodeDefaults : nodeDefaults),
      id: state,
      position: { x: 0, y: 0 },
      data: { label: state },
    };
  });

  const edges: Edge[] = Object.entries(nfa.transitions).flatMap(
    ([origem, transicoes]) =>
      Object.entries(transicoes).flatMap(([letra, alvos]) =>
        alvos.map((alvo) => {
          return {
            ...edgeDefaults,
            id: `e-${origem}-${alvo}`,
            source: origem,
            target: alvo,
            label: letra,
          } as Edge;
        })
      )
  );

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
