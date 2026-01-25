import { NFA } from "../types/automato";

export function validateNfa(nfa: NFA): string[] {
  const errors: string[] = [];

  const alphabetSet = new Set(nfa.alphabet);
  const statesSet = new Set(nfa.states);

  // start ∈ states
  if (!statesSet.has(nfa.start)) {
    errors.push(`Estado inicial inválido: ${nfa.start}`);
  }

  // accept ⊆ states
  for (const state of nfa.accept) {
    if (!statesSet.has(state)) {
      errors.push(`Estado de aceitação inválido: ${state}`);
    }
  }

  // transitions
  for (const [fromState, transitionsBySymbol] of Object.entries(
    nfa.transitions as Record<string, unknown>,
  )) {
    if (!statesSet.has(fromState)) {
      errors.push(`Estado de transição inválido: ${fromState}`);
      continue;
    }

    if (
      typeof transitionsBySymbol !== "object" ||
      transitionsBySymbol === null
    ) {
      errors.push(`Transições inválidas para o estado: ${fromState}`);
      continue;
    }

    for (const [symbol, toStates] of Object.entries(
      transitionsBySymbol as Record<string, unknown>,
    )) {
      if (!alphabetSet.has(symbol)) {
        errors.push(
          `Símbolo inválido na transição (${fromState} --${symbol}--> ...)`,
        );
      }

      if (!Array.isArray(toStates)) {
        errors.push(
          `Destino inválido na transição (${fromState} --${symbol}--> ?)`,
        );
        continue;
      }

      for (const toState of toStates) {
        if (typeof toState !== "string" || !statesSet.has(toState)) {
          errors.push(
            `Estado destino inválido na transição (${fromState} --${symbol}--> ${String(
              toState,
            )})`,
          );
        }
      }
    }
  }

  return errors;
}
