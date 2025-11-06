type Estado = string;
type Letra = string;
type Epsilon = "ε";

type DFATransition = Record<Estado, Record<Letra, Estado>>;
type NFATransition = Record<Estado, Record<Letra, Estado[]>>;

type DFA = {
  states: Estado[];
  alphabet: Letra[];
  start: Estado;
  accept: Estado[];
  transitions: DFATransition;
};

type NFA = {
  states: Estado[];
  alphabet: Letra[];
  start: Estado;
  accept: Estado[];
  transitions: NFATransition;
};

type NFAWithEpsilon = NFA & {
  transitions: Record<Estado, Record<Letra | Epsilon, Estado[]>>;
};
