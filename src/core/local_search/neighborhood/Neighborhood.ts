import {
    type NeighborhoodOptionType,
    AlgoSolution,
    NeighborhoodOption,
} from "@/models";
import { GeometryNeighborhood } from "./Geometry";
import { Rectangle, Solution } from "@/models/binpacking";
import { PermutationNeighborhood } from "./Permutation";
import { type GreedyPlacement, GreedySelection } from "@/core/greedy";

export interface Neighborhood<SOL extends AlgoSolution> {
    getNeighbors(solution: SOL): SOL[];
}

export function createNeighborhoodBinPack(
    option: NeighborhoodOptionType,
    numNeighbors: number,
    placement: GreedyPlacement<Rectangle, Solution>,
    selection: GreedySelection<Rectangle>,
    randomRate: number = 0,
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
