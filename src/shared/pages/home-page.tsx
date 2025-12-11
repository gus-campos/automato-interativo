"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Connection,
  Controls,
  Edge,
  useEdgesState,
  useNodesState,
  Panel,
  Node,
  NodeChange,
  ReactFlowInstance,
} from "@xyflow/react";
import { automatToReactFlow } from "../utils/automat-to-react-flow";
import { getAutoPositionedNodes } from "../utils/auto-position-nodes";
import FloatingEdge from "../components/FloatingEdge";
import FloatingConnectionLine from "../components/FloatingConnectionLine";
import { LoopEdge } from "../components/LoopEdge";

/*
TODO
- [X] Encontrar forma de indicar estado inicial e finais
- [X] Permitir que sejam adicionados nós com nomes
- [X] Permitir que sejam adicionadas arestas com letra

- [] Ler e exportar o json (última coisa)

Obs: ele deixou explícito que já tem sistema que processa
autômatos de todas as formas, só precisa que visualize.
*/

const initialNfa: NFA = {
  alphabet: ["a", "b"],
  states: ["S", "q1", "q2", "r1", "r2"],
  accept: ["q1", "r1"],
  start: "S",
  transitions: {
    ["S"]: {
      ["a"]: ["q1"],
      ["b"]: ["r1", "q1"],
    },
    ["q1"]: {
      ["a"]: ["q1"],
      ["b"]: ["q2"],
    },
    ["q2"]: {
      ["a"]: ["q1"],
      ["b"]: ["q2"],
    },
    ["r1"]: {
      ["a"]: ["r2"],
      ["b"]: ["r1"],
    },
    ["r2"]: {
      ["a"]: ["r2"],
      ["b"]: ["r1"],
    },
  },
};

const edgeTypes = {
  floating: FloatingEdge,
  loop: LoopEdge,
};

export default function HomePage() {
  const [nfa, setNfa] = useState<NFA>(initialNfa);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [addedLetterTransition, setAddedName] = useState<string | null>(null);
  const [addEdgeMode, setAddMode] = useState<boolean>(false);
  const [edgeBeingAdded, setEdgeBeingAdded] = useState<Edge | null>(null);
  const [shouldReposition, setShouldReposition] = useState(false);

  const [addNodeMode, setAddNodeMode] = useState(false);
  const [newNodeName, setNewNodeName] = useState("");
  const [newNodeAccept, setNewNodeAccept] = useState(false);

  const reactFlowRef = useRef<ReactFlowInstance | null>(null);

  // Guarda posições antigas para preservar quando o NFA muda
  const nodePositionsRef = useRef<Record<string, { x: number; y: number }>>({});

  // Inicializa React Flow a partir do NFA, quando ele muda
  useEffect(() => {
    const [unpositionedNodes, initialEdges] = automatToReactFlow(nfa);

    const positionedNodes = getAutoPositionedNodes(
      unpositionedNodes,
      initialEdges,
      "TB"
    );

    // Restaura posições antigas, se existirem (permite mover)
    const nodesWithPositions = positionedNodes.map((node) => ({
      ...node,
      position: nodePositionsRef.current[node.id] ?? node.position,
    }));

    setNodes(nodesWithPositions);
    setEdges(initialEdges);

    reactFlowRef.current?.fitView();
  }, [nfa, setEdges, setNodes]);

  // Atualiza posições ao arrastar nós
  const onNodesChangeWrapper = useCallback(
    (changes: NodeChange<Node>[]) => {
      onNodesChange(changes);
      setNodes((nds) => {
        nds.forEach((node) => {
          nodePositionsRef.current[node.id] = { ...node.position };
        });
        return nds;
      });

      setShouldReposition(false);
    },
    [onNodesChange, setNodes]
  );

  const addEdgeToNfa = (source: string, target: string, letter: string) => {
    setNfa((prev) => ({
      ...prev,
      transitions: {
        ...prev.transitions,
        [source]: {
          ...(prev.transitions[source] ?? {}),
          [letter]: [...(prev.transitions[source]?.[letter] ?? []), target],
        },
      },
    }));
  };

  // Adiciona nó ao NFA
  const addNodeToNfa = (name: string, accept: boolean) => {
    setNfa((prev) => ({
      ...prev,
      states: prev.states.includes(name) ? prev.states : [...prev.states, name],
      accept: accept ? [...prev.accept, name] : prev.accept,
    }));
  };

  const onConnect = useCallback((params: Edge | Connection) => {
    setEdgeBeingAdded(params as Edge);
    setAddMode(true);
  }, []);

  return (
    // Give the ReactFlow container an explicit height so it can render
    <div style={{ width: "1600px", height: "800px" }}>
      <div style={{ width: "100%", height: "100%" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeWrapper}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          style={{ width: "100%", height: "100%" }}
          fitView={true}
          edgeTypes={edgeTypes}
          connectionLineComponent={FloatingConnectionLine}
          onInit={(rfi) => {
            reactFlowRef.current = rfi;
          }}
        >
          <Panel position="top-center">
            {addEdgeMode && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                }}
              >
                <span>Nome da transição:</span>

                <input
                  type="text"
                  autoFocus
                  value={addedLetterTransition ?? ""}
                  onChange={(e) => setAddedName(e.target.value)}
                  style={{
                    padding: "6px 8px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    width: "120px",
                  }}
                />

                <button
                  onClick={() => {
                    if (!edgeBeingAdded) return;

                    // Se pertence ao alfabeto
                    const letterAdded = addedLetterTransition!.trim();

                    if (nfa.alphabet.some((letter) => letter === letterAdded)) {
                      addEdgeToNfa(
                        edgeBeingAdded.source,
                        edgeBeingAdded.target,
                        letterAdded
                      );
                    }

                    setAddMode(false);
                    setAddedName(null);
                    setAddMode(false);
                  }}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "8px",
                    background: "#4caf50",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Adicionar
                </button>
              </div>
            )}
          </Panel>

          {/* Painel sempre visível */}
          <Panel position="bottom-center">
            {!addNodeMode ? (
              // Estado normal: só o botão
              <button
                onClick={() => setAddNodeMode(true)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#1976d2",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                + Novo nó
              </button>
            ) : (
              // Formulário
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  padding: "12px 16px",
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                  width: "200px",
                }}
              >
                <strong>Adicionar novo nó</strong>

                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  Nome:
                  <input
                    type="text"
                    autoFocus
                    value={newNodeName}
                    onChange={(e) => setNewNodeName(e.target.value)}
                    style={{
                      padding: "6px 8px",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                    }}
                  />
                </label>

                <label
                  style={{ display: "flex", gap: "5px", alignItems: "center" }}
                >
                  <input
                    type="checkbox"
                    checked={newNodeAccept}
                    onChange={(e) => setNewNodeAccept(e.target.checked)}
                  />
                  Terminal?
                </label>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => {
                      const name = newNodeName.trim();

                      if (!name) return;

                      // Se label for única, adicionar
                      if (!nfa.states.includes(name))
                        addNodeToNfa(name, newNodeAccept);

                      // Reset
                      setAddNodeMode(false);
                      setNewNodeName("");
                      setNewNodeAccept(false);
                    }}
                    style={{
                      flex: 1,
                      padding: "6px 8px",
                      borderRadius: "8px",
                      background: "#4caf50",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Adicionar
                  </button>

                  <button
                    onClick={() => {
                      setAddNodeMode(false);
                      setNewNodeName("");
                      setNewNodeAccept(false);
                    }}
                    style={{
                      flex: 1,
                      padding: "6px 8px",
                      borderRadius: "8px",
                      background: "#ccc",
                      color: "#333",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </Panel>

          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}
