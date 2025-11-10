type State = string;
type Letter = string;
type Epsilon = "ε";

type DFATransition = Record<State, Record<Letter, State>>;
type NFATransition = Record<State, Record<Letter, State[]>>;

type DFA = {
  states: State[];
  alphabet: Letter[];
  start: State;
  accept: State[];
  transitions: DFATransition;
};

type NFA = {
  states: State[];
  alphabet: Letter[];
  start: State;
  accept: State[];
  transitions: NFATransition;
};

type NFAWithEpsilon = NFA & {
  transitions: Record<State, Record<Letter | Epsilon, State[]>>;
};
