import { type GreedyPlacement } from "@/core/greedy";
import {
    type NeighborhoodOptionType,
    type PlacementOptionType,
    AlgoSolution,
    NeighborhoodOption,
} from "@/models";
import { GeometryNeighborhood } from "./Geometry";
import type { Instance, Rectangle } from "@/models/binpacking";

export interface Neighborhood<SOL extends AlgoSolution> {
    getNeighbors(solution: SOL): SOL[];
}

export function createNeighborhoodBinPack(
    option: NeighborhoodOptionType,
    numNeighbors: number,
    instance: Instance,
    initialPlacement: GreedyPlacement<Rectangle, AlgoSolution>,
    betterPlacementOption: PlacementOptionType,
) {
    switch (option) {
        case NeighborhoodOption.GEOMETRY:
        case NeighborhoodOption.RULE:
        case NeighborhoodOption.OVERLAP:
        default: {
            return new GeometryNeighborhood(
                numNeighbors,
                instance.rectangles.length,
                initialPlacement,
                betterPlacementOption,
            );
        }
    }
}
