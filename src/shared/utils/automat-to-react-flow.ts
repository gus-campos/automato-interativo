import { Edge, MarkerType, Node, Position } from "@xyflow/react";
import { NFA } from "../types/automato";

export const nodeDefaults = {
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

export const terminalNodeDefaults = {
  style: {
    ...nodeDefaults.style,
    outline: "1px solid black",
    outlineOffset: "2px",
  },
};

export const edgeDefaults = {
  interactionWidth: 200,
  style: { strokeWidth: 2, stroke: "#999" },
  markerEnd: {
    type: MarkerType.Arrow,
    color: "black",
    strokeWidth: 1.5,
  },
  type: "floating",
};

export const loopEdgeDefault = {
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
    ([source, transicoes]) =>
      Object.entries(transicoes).flatMap(([letter, targets]) =>
        targets.map((target) => {
          const isLoop = source === target;

          const returnTransitions = nfa.transitions[target]
            ? Object.values(nfa.transitions[target])
            : undefined;

          const hasInverseEdge = returnTransitions
            ? returnTransitions.some((destinos) => destinos.includes(source))
            : false;

          const extraLetter =
            Object.entries(nfa.transitions[source] || {})
              .filter(
                ([letterTrans, destinos]) =>
                  destinos.includes(target) && letterTrans !== letter,
              )
              .map(([extraLetter]) => extraLetter)[0] ?? undefined;

          const rate = 0.5;

          const displacement = hasInverseEdge
            ? source < target
              ? rate
              : -rate
            : extraLetter
              ? extraLetter > letter
                ? rate
                : -rate
              : undefined;

          return {
            ...(isLoop ? loopEdgeDefault : edgeDefaults),
            id: `e-${source}-${target}-${letter}`,
            source: source,
            target: target,
            label: letter,
            data: { displacement: displacement },
          } as Edge;
        }),
      ),
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
