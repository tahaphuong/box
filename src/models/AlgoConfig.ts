export const ALGOS = {
  greedy: {
    label: "Greedy",
    optionLabel: "Selection strategy",
    options: {
      longest: "Longest side",
      largest: "Largest area",
    },
  },
  local: {
    label: "Local Search",
    optionLabel: "Neighborhood",
    options: {
      geometry: "Geometry-based",
      rule: "Rule-based",
      overlap: "Overlap",
    },
  },
} as const;

export type Algo = keyof typeof ALGOS;
export type AlgoOption<A extends Algo> =
  keyof typeof ALGOS[A]["options"];

export type AlgoConfig<A extends Algo = Algo> = {
  algo: A;
  option: AlgoOption<A>;
};
