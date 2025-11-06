"use client";

import { useCallback } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  MiniMap,
  useEdgesState,
  useNodesState,
} from "reactflow";
import { automatToReactFlow } from "../utils/automat-to-react-flow";
import { getAutoPositionedNodes } from "../utils/auto-position-nodes";

/*
TODO
- [] Centralizar a visualização por padrão (tem opção nativa de centralizar)
- [] Encontrar forma de indicar estado inicial e finais
- [] Permitir que sejam adicionados nós
- [] Adicionar nomes aos nós
- [] Permitir que sejam adicionadas arestas
- [] Adicionar nomes às arestas

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
  states: ["1", "2", "3"],
  accept: ["3"],
  start: "1",
  transitions: {
    ["1"]: {
      ["a"]: ["2", "3"],
    },
    ["2"]: {
      ["b"]: ["3"],
    },
  },
});

const autoPositionedNodes = getAutoPositionedNodes(
  initialNodes,
  initialEdges,
  "TB"
);

export default function HomePage() {
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
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}
