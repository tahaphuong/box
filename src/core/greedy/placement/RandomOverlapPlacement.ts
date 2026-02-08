import { type GreedyPlacement } from "./GreedyPlacement";
import { Solution, type Rectangle, type Position } from "@/models/binpacking";
import { randInt } from "@/core/local_search/helpers";

// Create for Overlap strategy
export class RandomOverlapPlacement implements GreedyPlacement<
    Rectangle,
    Solution
> {
    constructor() {}
    clearState(): void {}
    clone(
        updateFn?: (draft: GreedyPlacement<Rectangle, Solution>) => void,
    ): GreedyPlacement<Rectangle, Solution> {
        if (updateFn) updateFn(this);
        return this;
    }
    copyPlacementState(other: GreedyPlacement<Rectangle, Solution>): void {
        void other;
    }
    removeBox(boxId: number): void {
        // remove box out of placement (not out of solution)
        void boxId;
    }

    findPosition(item: Rectangle, solution: Solution): Position | null {
        const randomBoxId = [...solution.idToBox.keys()][
            randInt(0, solution.idToBox.size)
        ];
        const randomSideway = Math.random() < 0.5;
        const randomX = randInt(
            0,
            solution.L - item.getWidthWith(randomSideway) + 1,
        );
        const randomY = randInt(
            0,
            solution.L - item.getHeightWith(randomSideway) + 1,
        );

        return {
            x: randomX,
            y: randomY,
            isSideway: randomSideway,
            boxId: randomBoxId,
        };
    }

    checkThenAdd(
        item: Rectangle,
        solution: Solution,
        indicatedPos: Position | null = null,
    ): boolean {
        const pos = indicatedPos ?? this.findPosition(item, solution);

        if (pos) {
            // apply only final placement
            item.x = pos.x;
            item.y = pos.y;
            item.isSideway = pos.isSideway;
            solution.addRectangle(item, pos.boxId);
            return true;
        }
        return false;
    }
}
