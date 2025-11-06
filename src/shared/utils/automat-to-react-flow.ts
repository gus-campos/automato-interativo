import { Edge, Node } from "reactflow";

export function automatToReactFlow(nfa: NFA): [Node[], Edge[]] {
  const nodes: Node[] = nfa.states.map((state) => {
    return { id: state, position: { x: 0, y: 0 }, data: { label: state } };
  });

  const edges: Edge[] = Object.entries(nfa.transitions).flatMap(
    ([origem, transicoes]) =>
      Object.entries(transicoes).flatMap(([letra, alvos]) =>
        alvos.map((alvo) => {
          return {
            id: `e${origem}-${alvo}`,
            source: origem,
            target: alvo,
            label: letra,
          };
        })
      )
  );

  return [nodes, edges] as const;
}
