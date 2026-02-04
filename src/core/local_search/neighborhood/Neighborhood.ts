import { Move } from "../Move";
import type { GreedyPlacement } from "@/core/greedy";
import { type NeighborhoodOptionType, NeighborhoodOption } from "@/models";
import { GeometryShelfNeighborhood } from "./GeometryShelf";

export interface Neighborhood<Item, SOL> {
    getAvailableMoves(
        solution: SOL,
        placement: GreedyPlacement<Item, SOL>,
    ): Move<SOL>[];
}

export function createNeighborhoodBinPack(
    option: NeighborhoodOptionType,
    numNeighbors: number,
    totalRectangles: number,
) {
    switch (option) {
        case NeighborhoodOption.GEOMETRY:
            return new GeometryShelfNeighborhood(numNeighbors, totalRectangles);
        case NeighborhoodOption.RULE:
        case NeighborhoodOption.OVERLAP:
        default:
            return new GeometryShelfNeighborhood(numNeighbors, totalRectangles);
    }
}
