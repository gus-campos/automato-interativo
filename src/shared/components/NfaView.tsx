"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
import FloatingConnectionLine from "./FloatingConnectionLine";
import { NFA } from "../types/automato";
import FloatingEdge from "./FloatingEdge";
import { LoopEdge } from "./LoopEdge";
import {
  Button,
  Group,
  TextInput,
  Checkbox,
  Paper,
  Stack,
} from "@mantine/core";

const edgeTypes = {
  floating: FloatingEdge,
  loop: LoopEdge,
};

export type NfaViewProps = {
  nfa: NFA;
  setNfa: Dispatch<SetStateAction<NFA>>;
};

export default function NfaView(props: NfaViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [addedLetterTransition, setAddedName] = useState<string | null>(null);
  const [addEdgeMode, setAddMode] = useState<boolean>(false);
  const [edgeBeingAdded, setEdgeBeingAdded] = useState<Edge | null>(null);

  const [addNodeMode, setAddNodeMode] = useState(false);
  const [newNodeName, setNewNodeName] = useState("");
  const [newNodeAccept, setNewNodeAccept] = useState(false);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const reactFlowRef = useRef<ReactFlowInstance | null>(null);
  const nodePositionsRef = useRef<Record<string, { x: number; y: number }>>({});

  useEffect(() => {
    const [unpositionedNodes, initialEdges] = automatToReactFlow(props.nfa);
    const positionedNodes = getAutoPositionedNodes(
      unpositionedNodes,
      initialEdges,
      "TB",
    );
    const nodesWithPositions = positionedNodes.map((node) => ({
      ...node,
      position: nodePositionsRef.current[node.id] ?? node.position,
    }));

    setNodes(nodesWithPositions);
    setEdges(initialEdges);
    reactFlowRef.current?.fitView();
  }, [props.nfa, setEdges, setNodes]);

  const onNodesChangeWrapper = useCallback(
    (changes: NodeChange<Node>[]) => {
      onNodesChange(changes);
      setNodes((nds) => {
        nds.forEach((node) => {
          nodePositionsRef.current[node.id] = { ...node.position };
        });
        return nds;
      });
    },
    [onNodesChange, setNodes],
  );

  // DELETE NODE E EDGE

  const handleSelectionChange = useCallback((nodes: Node[], edges: Edge[]) => {
    setSelectedNodeId(nodes[0]?.id ?? null);
    setSelectedEdgeId(edges[0]?.id ?? null);
  }, []);

  const deleteNodeFromNfa = useCallback(
    (state: string) => {
      props.setNfa((prev) => ({
        ...prev,
        start: prev.start === state ? "" : prev.start,
        states: prev.states.filter((s) => s !== state),
        accept: prev.accept.filter((s) => s !== state),
        transitions: Object.fromEntries(
          Object.entries(prev.transitions)
            .filter(([k]) => k !== state)
            .map(([k, v]) => [
              k,
              Object.fromEntries(
                Object.entries(v).map(([l, targets]) => [
                  l,
                  targets.filter((t) => t !== state),
                ]),
              ),
            ]),
        ),
      }));
    },
    [props],
  );

  const deleteEdgeFromNfa = useCallback(
    (edgeId: string) => {
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;
      const { source, target, label } = edge;

      props.setNfa((prev) => {
        const transitions = { ...prev.transitions };

        // Atualiza a transição source
        if (transitions[source]?.[label as string]) {
          const updatedTargets = transitions[source][label as string].filter(
            (t) => t !== target,
          );

          if (updatedTargets.length === 0) {
            delete transitions[source][label as string];
          } else {
            transitions[source] = {
              ...transitions[source],
              [label as string]: updatedTargets,
            };
          }
        }

        // Verifica se letra ainda existe E tem targets
        const letterStillUsed = Object.values(transitions).some(
          (trans) => trans[label as string]?.length > 0,
        );

        return {
          ...prev,
          transitions,
          alphabet: letterStillUsed
            ? prev.alphabet
            : prev.alphabet.filter((l) => l !== label),
        };
      });
    },
    [edges, props],
  );

  const handleDeleteNodeClicked = useCallback(() => {
    if (!selectedNodeId && !selectedEdgeId) return;

    if (selectedNodeId) deleteNodeFromNfa(selectedNodeId);
    if (selectedEdgeId) deleteEdgeFromNfa(selectedEdgeId);

    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [
    selectedNodeId,
    selectedEdgeId,
    deleteNodeFromNfa,
    deleteEdgeFromNfa,
    setSelectedEdgeId,
    setSelectedNodeId,
  ]);

  const handleConnect = useCallback((params: Edge | Connection) => {
    setEdgeBeingAdded(params as Edge);
    setAddMode(true);
  }, []);

  const isDeleteDisabled = !selectedNodeId && !selectedEdgeId;

  // ADICIONA NODE E EDGE

  const addEdgeToNfa = useCallback(
    (source: string, target: string, letterAdded: string) => {
      const isNewLetter = !props.nfa.alphabet.some(
        (letter) => letter === letterAdded,
      );

      // Transição já adicionada
      if (
        props.nfa.transitions[source]?.[letterAdded]?.some((t) => t === target)
      )
        return;

      props.setNfa((prev) => ({
        ...prev,
        alphabet: isNewLetter ? [...prev.alphabet, letterAdded] : prev.alphabet,
        transitions: {
          ...prev.transitions,
          [source]: {
            ...(prev.transitions[source] ?? {}),
            [letterAdded]: [
              ...(prev.transitions[source]?.[letterAdded] ?? []),
              target,
            ],
          },
        },
      }));
    },
    [props],
  );

  const addNodeToNfa = useCallback(
    (name: string, accept: boolean) => {
      const isStartNode = props.nfa.start === "";
      props.setNfa((prev) => ({
        ...prev,
        start: isStartNode ? name : prev.start,
        states: prev.states.includes(name)
          ? prev.states
          : [...prev.states, name],
        accept: accept ? [...prev.accept, name] : prev.accept,
      }));
    },
    [props],
  );

  const handleAddEdge = useCallback(() => {
    if (!edgeBeingAdded) return;
    const letterAdded = addedLetterTransition!.trim();
    addEdgeToNfa(edgeBeingAdded.source, edgeBeingAdded.target, letterAdded);
    setAddMode(false);
    setAddedName(null);
  }, [edgeBeingAdded, addedLetterTransition, addEdgeToNfa]);

  const handleAddNode = useCallback(() => {
    const name = newNodeName.trim();
    if (!name) return;
    if (!props.nfa.states.includes(name)) addNodeToNfa(name, newNodeAccept);
    setAddNodeMode(false);
    setNewNodeName("");
    setNewNodeAccept(false);
  }, [newNodeName, newNodeAccept, props.nfa.states, addNodeToNfa]);

  const handleCancelAddNode = useCallback(() => {
    setAddNodeMode(false);
    setNewNodeName("");
    setNewNodeAccept(false);
  }, []);

  // EXTRA

  const handleReactFlowInit = useCallback((rfi: ReactFlowInstance) => {
    reactFlowRef.current = rfi;
  }, []);

  const trimmedAddedLetter = addedLetterTransition ?? "";

  console.log(props.nfa);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChangeWrapper}
      onEdgesChange={onEdgesChange}
      onConnect={handleConnect}
      onSelectionChange={({ nodes, edges }) =>
        handleSelectionChange(nodes, edges)
      }
      style={{ width: "100%", height: "100%" }}
      fitView={true}
      edgeTypes={edgeTypes}
      connectionLineComponent={FloatingConnectionLine}
      onInit={handleReactFlowInit}
    >
      <Panel position="top-center">
        {addEdgeMode && (
          <Paper p="md" shadow="md" radius="md" withBorder>
            <Group gap="sm">
              <span>Símbolo da transição:</span>
              <TextInput
                autoFocus
                value={trimmedAddedLetter}
                onChange={(e) => setAddedName(e.target.value)}
                w={120}
              />
              <Button onClick={handleAddEdge} color="green">
                Adicionar
              </Button>
            </Group>
          </Paper>
        )}
      </Panel>

      <Panel position="bottom-center">
        {!addNodeMode ? (
          <Group>
            <Button
              color="red"
              disabled={isDeleteDisabled}
              onClick={handleDeleteNodeClicked}
            >
              Deletar elemento selecionado
            </Button>
            <Button onClick={() => setAddNodeMode(true)}>+ Novo nó</Button>
          </Group>
        ) : (
          <Paper p="md" shadow="md" radius="md" withBorder w={300}>
            <Stack gap="sm">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <strong>Adicionar novo nó</strong>

                <TextInput
                  label="Nome:"
                  autoFocus
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                />

                <Checkbox
                  label="Terminal?"
                  checked={newNodeAccept}
                  my="md"
                  onChange={(e) => setNewNodeAccept(e.currentTarget.checked)}
                />

                <Group gap="sm">
                  <Button
                    onClick={handleCancelAddNode}
                    color="gray"
                    style={{ flex: 1 }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAddNode} style={{ flex: 1 }}>
                    Adicionar
                  </Button>
                </Group>
              </form>
            </Stack>
          </Paper>
        )}
      </Panel>

      <Controls />
      <Background />
    </ReactFlow>
  );
}
