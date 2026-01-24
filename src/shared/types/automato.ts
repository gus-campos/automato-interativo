import { z } from "zod";

/* Primitivos */
const StateSchema = z.string();
const LetterSchema = z.string();
const EpsilonSchema = z.literal("ε");

/* Transições */
const NFATransitionSchema = z.record(
  StateSchema,
  z.record(LetterSchema, z.array(StateSchema)),
);

const DFATransitionSchema = z.record(
  StateSchema,
  z.record(LetterSchema, StateSchema),
);

const NFAWithEpsilonTransitionSchema = z.record(
  StateSchema,
  z.record(z.union([LetterSchema, EpsilonSchema]), z.array(StateSchema)),
);

/* Autômatos */
export const NFASchema = z.object({
  states: z.array(StateSchema),
  alphabet: z.array(LetterSchema),
  start: StateSchema,
  accept: z.array(StateSchema),
  transitions: NFATransitionSchema,
});

const DFASchema = z.object({
  states: z.array(StateSchema),
  alphabet: z.array(LetterSchema),
  start: StateSchema,
  accept: z.array(StateSchema),
  transitions: DFATransitionSchema,
});

const NFAWithEpsilonSchema = z.object({
  states: z.array(StateSchema),
  alphabet: z.array(LetterSchema),
  start: StateSchema,
  accept: z.array(StateSchema),
  transitions: NFAWithEpsilonTransitionSchema,
});

/* Tipos inferidos */
type State = z.infer<typeof StateSchema>;
type Letter = z.infer<typeof LetterSchema>;
type Epsilon = z.infer<typeof EpsilonSchema>;

type NFATransition = z.infer<typeof NFATransitionSchema>;
type DFATransition = z.infer<typeof DFATransitionSchema>;

export type NFA = z.infer<typeof NFASchema>;
type DFA = z.infer<typeof DFASchema>;
type NFAWithEpsilon = z.infer<typeof NFAWithEpsilonSchema>;
