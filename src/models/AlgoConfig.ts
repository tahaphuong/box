export const Algo = {
    GREEDY: "Greedy",
    LOCAL: "Local Search",
} as const;

export const SelectionOption = {
    LONGEST: "Longest side",
    LARGEST: "Largest area",
    ORIGINAL: "Original",
} as const;

export const PlacementOption = {
    SHELF_FIRST_FIT: "SFF",
    SHELF_BEST_AREA_FIT: "SBAF",
    BOTTOM_LEFT: "BL",
} as const;

export const NeighborhoodOption = {
    GEOMETRY: "Geometry",
    PERMUTATION: "Permutation",
    OVERLAP: "Overlap",
} as const;

export type AlgoType = (typeof Algo)[keyof typeof Algo];
export type PlacementOptionType =
    (typeof PlacementOption)[keyof typeof PlacementOption];
export type SelectionOptionType =
    (typeof SelectionOption)[keyof typeof SelectionOption];
export type NeighborhoodOptionType =
    (typeof NeighborhoodOption)[keyof typeof NeighborhoodOption];
