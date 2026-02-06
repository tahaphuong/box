import {
    type NeighborhoodOptionType,
    AlgoSolution,
    NeighborhoodOption,
} from "@/models";
import { GeometryNeighborhood } from "./Geometry";
import { Instance, Rectangle, Solution } from "@/models/binpacking";
import { PermutationNeighborhood } from "./Permutation";
import type { GreedyPlacement } from "@/core/greedy";

export interface Neighborhood<SOL extends AlgoSolution> {
    getNeighbors(solution: SOL): SOL[];
}

export function createNeighborhoodBinPack(
    option: NeighborhoodOptionType,
    numNeighbors: number,
    instance: Instance,
    placement: GreedyPlacement<Rectangle, Solution>,
    randomRate: number = 0,
) {
    switch (option) {
        case NeighborhoodOption.GEOMETRY:
            return new GeometryNeighborhood(
                numNeighbors,
                instance.rectangles.length,
                randomRate,
            );
        case NeighborhoodOption.PERMUTATION:
            return new PermutationNeighborhood(numNeighbors, placement);
        case NeighborhoodOption.OVERLAP:
        default: {
            return new GeometryNeighborhood(
                numNeighbors,
                instance.rectangles.length,
                randomRate,
            );
        }
    }
}
