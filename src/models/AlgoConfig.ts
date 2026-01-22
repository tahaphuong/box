export const Algo = {
  GREEDY: "Greedy",
  LOCAL: "Local Search",
} as const;

export const SelectionOption = {
  LONGEST: "Longest side",
  LARGEST: "Largest area",
} as const;

export const PlacementOption = {
  SHELF_FIRST_FIT: "SFF",
  SHELF_BEST_WIDTH_FIT: "SBWF",
  SHELF_BEST_HEIGHT_FIT: "SBHF",
  SHELF_BEST_AREA_FIT: "SBAF",
} as const;

export const NeighborhoodOption = {
  GEOMETRY: "Geometry",
  RULE: "Rule-based",
  OVERLAP: "Overlap",
} as const;

export type AlgoType = typeof Algo[keyof typeof Algo];
export type PlacementOptionType = typeof PlacementOption[keyof typeof PlacementOption];
export type SelectionOptionType = typeof SelectionOption[keyof typeof SelectionOption];
export type NeighborhoodOptionType = typeof NeighborhoodOption[keyof typeof NeighborhoodOption];

// Local Search Neighborhood handler
export function createLocalSearchNeighborhood(
  option: NeighborhoodOptionType,
) {
  switch (option) {
    case NeighborhoodOption.GEOMETRY:
    case NeighborhoodOption.RULE:
    case NeighborhoodOption.OVERLAP:
    default:
  }
}
