"use client";

import { useEffect, useState } from "react";
import NfaView from "../components/NfaView";
import { NFA, NFASchema } from "../types/automato";
import { Button, Group, Modal, Stack, Textarea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ZodError } from "zod";
import { validateNfa as validateNfa } from "../utils/is-valid-nfa";
import { downloadString } from "../utils/download-string";

/*
TODO
- [] Ler e exportar o json
*/

const initialNfa: NFA = {
  alphabet: ["a", "b"],
  states: ["S", "q1", "q2", "r1", "r2"],
  accept: ["q1", "r1"],
  start: "S",
  transitions: {
    S: { a: ["q1"], b: ["r1", "q1"] },
    q1: { a: [], b: ["q2"] },
    q2: { a: ["q1"], b: ["q2"] },
    r1: { a: ["r2"], b: ["r1"] },
    r2: { a: ["r2"], b: ["r1"] },
  },
};

export function HomePage() {
  const [baseNfa, setBaseNfa] = useState<NFA>(initialNfa);
  const [opened, { open, close }] = useDisclosure(false);
  const [jsonText, setJsonText] = useState(JSON.stringify(initialNfa, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  // useEffect(() => {}, [baseNfa])

  console.log(baseNfa);

  const handleJson = () => {
    // Tentar parsear o json
    let obj;
    try {
      obj = JSON.parse(jsonText);
    } catch (error: unknown) {
      setJsonError(
        error instanceof SyntaxError ? error.message : JSON.stringify(error),
      );
      return;
    }

    // Tentar parsear o nfa
    let nfa;
    try {
      nfa = NFASchema.parse(obj);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join("\n");
        setJsonError(message);
      }
      return;
    }

    // Verificar error semântica
    const errors = validateNfa(nfa);
    if (errors.length > 0) {
      setJsonError(errors.join("\n"));
      return;
    }

    setBaseNfa(nfa);
    setJsonError(null);
    close();
  };

  const handleClose = () => {
    close();
    setJsonError(null);
  };

  const handleDownloadJson = () => {
    downloadString(jsonText, "automato.json");
  };

  const downloadDisabled = !!jsonError;

  return (
    <>
      <div
        style={{
          width: "95vw",
          height: "95vh",
          position: "fixed",
          inset: 0,
          zIndex: 1,
        }}
      >
        <div style={{ width: "100%", height: "100%" }}>
          <NfaView nfa={baseNfa} setNfa={setBaseNfa} />
        </div>
      </div>

      <Group
        gap="sm"
        style={{ position: "relative", zIndex: 10, top: "10px", left: "10px" }}
      >
        <Button radius="lg" onClick={open}>
          Manipular JSON
        </Button>

        <Button
          radius="lg"
          onClick={handleDownloadJson}
          disabled={downloadDisabled}
        >
          Baixar JSON
        </Button>
      </Group>

      <Modal
        title="Manipular JSON do autômato"
        opened={opened}
        onClose={handleClose}
      >
        <Textarea
          label="JSON do autômato"
          error={jsonError}
          autosize
          minRows={20}
          value={jsonText}
          onChange={(e) => setJsonText(e.currentTarget.value)}
        />
        <Stack mt="sm">
          <Button onClick={handleJson}>Confirmar</Button>
        </Stack>
      </Modal>
    </>
  );
}
