"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  MiniMap,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { automatToReactFlow } from "../utils/automat-to-react-flow";
import { getAutoPositionedNodes } from "../utils/auto-position-nodes";
import FloatingEdge from "../components/FloatingEdge";
import FloatingConnectionLine from "../components/FloatingConnectionLine";

/*
TODO
- [X] Encontrar forma de indicar estado inicial e finais
- [] Permitir que sejam adicionados nós com nomes
- [] Permitir que sejam adicionadas arestas com letra

- [] Ler e exportar o json (última coisa)

EXTRA

- [] Validar se é determinístico
- [] Converter para determinístico
- []

Obs: ele deixou explícito que já tem sistema que processa
autômatos de todas as formas, só precisa que visualize.

EXTRA DO EXTRA

- [] Verificar se palavra é aceita
- [] Mostrar palavra sendo processada através de highlighting e campo de texto
*/

const [initialNodes, initialEdges] = automatToReactFlow({
  alphabet: ["a", "b"],
  states: ["I", "A", "B"],
  accept: ["B"],
  start: "A",
  transitions: {
    ["I"]: {
      ["a"]: ["A"],
    },
    ["A"]: {
      ["b"]: ["B"],
    },
    ["B"]: {
      ["a"]: ["A", "I"],
    },
  },
});

const autoPositionedNodes = getAutoPositionedNodes(
  initialNodes,
  initialEdges,
  "TB"
);

const edgeTypes = {
  floating: FloatingEdge,
};

export default function HomePage() {
  console.log(initialEdges, initialNodes);

  const [nodes, setNodes, onNodesChange] = useNodesState(autoPositionedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    // Give the ReactFlow container an explicit height so it can render
    <div style={{ width: "1600px", height: "800px" }}>
      <div style={{ width: "100%", height: "100%" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          style={{ width: "100%", height: "100%" }}
          fitView={true}
          edgeTypes={edgeTypes}
          connectionLineComponent={FloatingConnectionLine}
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}
