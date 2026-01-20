export const Algo = {
  GREEDY: "greedy",
  LOCAL: "local",
} as const;

export const GreedyOption = {
  LONGEST: "longest",
  LARGEST: "largest",
} as const;

export const PlacementOption = {
  SHELF_FIRST_FIT: "SFF",
  SHELF_BEST_WIDTH_FIT: "SBWF",
  SHELF_BEST_HEIGHT_FIT: "SBHF",
  SHELF_BEST_AREA_FIT: "SBAF",
} as const;

export const LocalOption = {
  GEOMETRY: "geometry",
  RULE: "rule",
  OVERLAP: "overlap",
} as const;

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
export type PlacementOptionType = typeof PlacementOption[keyof typeof PlacementOption];
export type GreedyOptionType = typeof GreedyOption[keyof typeof GreedyOption];
export type LocalOptionType = typeof LocalOption[keyof typeof LocalOption];

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
