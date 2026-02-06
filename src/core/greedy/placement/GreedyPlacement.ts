import { Solution, type Position, type Rectangle } from "@/models/binpacking";
import {
    AlgoSolution,
    PlacementOption,
    type PlacementOptionType,
} from "@/models";
import { ShelfBestAreaFit, ShelfFirstFit } from "./ShelfPlacement";
import { BottomLeftFirstFit } from "./BottomLeftPlacement";

export interface GreedyPlacement<Item, SOL extends AlgoSolution> {
    findPosition(item: Item, solution: SOL): Position | null;
    checkThenAdd(
        item: Item,
        solution: SOL,
        indicatedPos: Position | null,
    ): boolean;
    // removeItem(item: Item, solution: SOL): boolean;
    removeBox(boxId: number): void;
    clone(
        updateFn?: (draft: GreedyPlacement<Item, SOL>) => void,
    ): GreedyPlacement<Item, SOL>;
    copyPlacementState(other: GreedyPlacement<Item, SOL>): void;
    clearState(): void;
}

// Greedy Selection handler
export function createPlacementBinPack(
    option: PlacementOptionType = PlacementOption.SHELF_FIRST_FIT,
): GreedyPlacement<Rectangle, Solution> {
    switch (option) {
        case PlacementOption.SHELF_BEST_AREA_FIT:
            return new ShelfBestAreaFit();
        case PlacementOption.BOTTOM_LEFT:
            return new BottomLeftFirstFit();
        case PlacementOption.SHELF_FIRST_FIT:
        default:
            return new ShelfFirstFit();
    }
}
