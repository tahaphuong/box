import { type GreedyPlacement } from "./GreedyPlacement";
import { Solution, type Rectangle, type Position } from "@/models/binpacking";
// import { create, castDraft } from "mutative";

// Improved bottom left
export class BottomLeftFirstFit implements GreedyPlacement<
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
        void boxId;
    }

    moveDown(x: number, width: number, rectangles: Rectangle[]): number {
        // min to the bottom
        let targetY = 0;
        for (const rect of rectangles) {
            if (rect.x < x + width && rect.x + rect.getWidth > x) {
                targetY = Math.max(targetY, rect.y + rect.getHeight);
            }
        }
        return targetY;
    }

    moveLeft(y: number, height: number, rectangles: Rectangle[]): number {
        // min to the left
        let targetX = 0;
        for (const rect of rectangles) {
            if (rect.y < y + height && rect.y + rect.getHeight > y) {
                targetX = Math.max(targetX, rect.x + rect.getWidth);
            }
        }
        return targetX;
    }

    // isOverlapped(
    //     x: number,
    //     y: number,
    //     width: number,
    //     height: number,
    //     rectangles: Rectangle[],
    // ): boolean {
    //     for (const rect of rectangles) {
    //         if (rect.x < x + width && rect.x + rect.getWidth > x) {
    //             // x overlap
    //             if (rect.y < y + height && rect.y + rect.getHeight > y) {
    //                 // y overlap
    //                 return true;
    //             }
    //         }
    //     }
    //     return false;
    // }

    isOverflown(
        x: number,
        y: number,
        width: number,
        height: number,
        boxL: number,
    ): boolean {
        return x + width > boxL || y + height > boxL;
    }

    findPosition(item: Rectangle, solution: Solution): Position | null {
        for (const box of solution.idToBox.values()) {
            if (box.areaLeft < item.area) continue;

            let globalX = Infinity;
            let globalY = Infinity;
            let globalSideway = item.isSideway;
            let found = false;

            const boxRects = box.rectangles;

            for (const sideway of [true, false]) {
                const width = sideway ? item.largerSide : item.smallerSide;
                const height = sideway ? item.smallerSide : item.largerSide;

                let bestX = box.L - width;
                let bestY = box.L - height;

                let x = bestX;
                let y = bestY;

                // prune if overflow
                let moved = false;
                do {
                    moved = false;
                    const newY = this.moveDown(x, width, boxRects);
                    if (newY < y) {
                        y = newY;
                        moved = true;
                    }
                    const newX = this.moveLeft(y, height, boxRects);
                    if (newX < x) {
                        x = newX;
                        moved = true;
                    }
                } while (moved);

                if (this.isOverflown(x, y, width, height, box.L)) continue;

                if (y < bestY || (y === bestY && x < bestX)) {
                    bestX = x;
                    bestY = y;
                    found = true;

                    if (
                        bestY < globalY ||
                        (bestY === globalY && bestX < globalX)
                    ) {
                        globalX = bestX;
                        globalY = bestY;
                        globalSideway = sideway;
                    }
                }
            }

            if (found) {
                return {
                    boxId: box.id,
                    x: globalX,
                    y: globalY,
                    isSideway: globalSideway,
                };
            }
        }

        return null;
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

        const newBox = solution.addNewBox();
        item.x = 0;
        item.y = 0;
        solution.addRectangle(item, newBox.id);
        return true;
    }
}
