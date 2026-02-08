import {
    type NeighborhoodOptionType,
    AlgoSolution,
    NeighborhoodOption,
} from "@/models";
import { Rectangle, Solution } from "@/models/binpacking";
import { GeometryNeighborhood } from "./Geometry";
import { PermutationNeighborhood } from "./Permutation";
import { OverlapNeighborhood } from "./Overlap";
import { type GreedyPlacement, GreedySelection } from "@/core/greedy";
import type { Stats } from "@/core/local_search/Stats";

export interface Neighborhood<SOL extends AlgoSolution> {
    getNeighbors(solution: SOL, stats?: Stats): SOL[];
}

export function createNeighborhoodBinPack(
    option: NeighborhoodOptionType,
    numNeighbors: number,
    placement: GreedyPlacement<Rectangle, Solution>,
    selection: GreedySelection<Rectangle>,
    randomRate: number = 0,
    maxIters: number,
) {
    switch (option) {
        case NeighborhoodOption.GEOMETRY:
            return new GeometryNeighborhood(
                numNeighbors,
                selection.items.length,
                randomRate,
                placement,
            );
        case NeighborhoodOption.PERMUTATION:
            return new PermutationNeighborhood(
                numNeighbors,
                selection.items.length,
                randomRate,
                placement,
                selection,
            );
        case NeighborhoodOption.OVERLAP:
            return new OverlapNeighborhood(
                numNeighbors,
                selection.items.length,
                maxIters,
            );
        default: {
            return new GeometryNeighborhood(
                numNeighbors,
                selection.items.length,
                randomRate,
                placement,
            );
        }
    }
}
