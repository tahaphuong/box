export const Algo = {
  GREEDY: "greedy",
  LOCAL: "local",
} as const;

export const GreedyOption = {
  LONGEST: "longest",
  LARGEST: "largest",
};

export const LocalOption = {
  GEOMETRY: "geometry",
  RULE: "rule",
  OVERLAP: "overlap",
};

export const ALGOS = {
  [Algo.GREEDY]: {
    label: "Greedy",
    optionLabel: "Selection strategy",
    options: {
      [GreedyOption.LONGEST]: "Longest side",
      [GreedyOption.LARGEST]: "Largest area",
    },
  },
  [Algo.LOCAL]: {
    label: "Local Search",
    optionLabel: "Neighborhood",
    options: {
      [LocalOption.GEOMETRY]: "Geometry-based",
      [LocalOption.RULE]: "Rule-based",
      [LocalOption.OVERLAP]: "Overlap",
    },
  },
} as const;


export type AlgoType = typeof Algo[keyof typeof Algo];
export type GreedyOptionType = typeof GreedyOption[keyof typeof GreedyOption];
export type LocalOptionType = typeof LocalOption[keyof typeof LocalOption];
export type AlgoConfig =
  | { algo: typeof Algo.GREEDY; option: GreedyOptionType }
  | { algo: typeof Algo.LOCAL; option: LocalOptionType };


// Local Search Neighborhood handler
export function createLocalSearchNeighborhood(
  option: LocalOptionType,
) {
  switch (option) {
    case LocalOption.GEOMETRY:
    case LocalOption.RULE:
    case LocalOption.OVERLAP:
    default:
  }
}
