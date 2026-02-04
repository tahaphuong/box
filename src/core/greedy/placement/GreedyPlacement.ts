import { Solution, type Rectangle } from "@/models/binpacking";
import { PlacementOption, type PlacementOptionType } from "@/models";
import { ShelfBestAreaFit, ShelfFirstFit } from "./ShelfPlacement";
import { BottomLeftFirstFit } from "./BottomLeftPlacement";

export interface GreedyPlacement<Item, SOL> {
    checkThenAdd(item: Item, solution: SOL): boolean;
    clonePlacementFrom(other: GreedyPlacement<Item, SOL>): void;
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
