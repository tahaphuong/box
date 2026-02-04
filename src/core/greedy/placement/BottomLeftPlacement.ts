import { type GreedyPlacement } from "./GreedyPlacement";
import { Solution, type Rectangle } from "@/models/binpacking";

export type Position = {
    boxId: number;
    x: number;
    y: number;
    isSideway: boolean;
};

export class BottomLeftFirstFit implements GreedyPlacement<
    Rectangle,
    Solution
> {
    constructor() {}

    // not necessary for BL
    clonePlacementFrom(other: GreedyPlacement<Rectangle, Solution>): void {
        void other;
    }

    moveDown(item: Rectangle, rectangles: Rectangle[]): number {
        let targetY = 0; // Default to the very bottom
        for (const rect of rectangles) {
            if (
                rect.x < item.x + item.getWidth &&
                rect.x + rect.getWidth > item.x
            ) {
                // if (rect.y + rect.getHeight <= item.y) {}
                targetY = Math.max(targetY, rect.y + rect.getHeight);
            }
        }
        return targetY;
    }

    moveLeft(item: Rectangle, rectangles: Rectangle[]): number {
        let targetX = 0; // Default to the very bottom
        for (const rect of rectangles) {
            if (
                rect.y < item.y + item.getHeight &&
                rect.y + rect.getHeight > item.y
            ) {
                targetX = Math.max(targetX, rect.x + rect.getWidth);
            }
        }
        return targetX;
    }

    noOverlap(item: Rectangle, rects: Rectangle[]): boolean {
        for (const r of rects) {
            if (
                item.x < r.x + r.getWidth &&
                item.x + item.getWidth > r.x &&
                item.y < r.y + r.getHeight &&
                item.y + item.getHeight > r.y
            ) {
                return false;
            }
        }
        return true;
    }

    findPosition(item: Rectangle, solution: Solution): Position | null {
        for (const box of solution.idToBox.values()) {
            if (box.areaLeft < item.area) continue;

            let bestX = Infinity;
            let bestY = Infinity;
            let bestSideway = item.isSideway;
            let found = false;

            const originalSideway = item.isSideway;

            for (let r = 0; r < 2; r++) {
                item.isSideway = r === 1 ? !originalSideway : originalSideway;

                const candidates: Array<{ x: number; y: number }> = [
                    { x: 0, y: 0 },
                ];

                for (const rect of box.rectangles) {
                    candidates.push(
                        { x: rect.x + rect.getWidth, y: rect.y },
                        { x: rect.x, y: rect.y + rect.getHeight },
                    );
                }

                for (const c of candidates) {
                    item.x = c.x;
                    item.y = c.y;

                    // bottom-left projection
                    item.y = this.moveDown(item, box.rectangles);
                    item.x = this.moveLeft(item, box.rectangles);

                    if (
                        item.x < 0 ||
                        item.y < 0 ||
                        item.x + item.getWidth > solution.L ||
                        item.y + item.getHeight > solution.L
                    ) {
                        continue;
                    }

                    if (!this.noOverlap(item, box.rectangles)) continue;

                    if (
                        !found ||
                        item.y < bestY ||
                        (item.y === bestY && item.x < bestX)
                    ) {
                        bestX = item.x;
                        bestY = item.y;
                        bestSideway = item.isSideway;
                        found = true;
                    }
                }
            }

            item.isSideway = originalSideway;

            if (found) {
                return {
                    boxId: box.id,
                    x: bestX,
                    y: bestY,
                    isSideway: bestSideway,
                };
            }
        }

        return null;
    }

    addToPosition(
        item: Rectangle,
        position: Position,
        solution: Solution,
    ): void {
        item.x = position.x;
        item.y = position.y;
        item.isSideway = position.isSideway;
        solution.addRectangle(item, position.boxId);
    }

    checkThenAdd(item: Rectangle, solution: Solution): boolean {
        const pos = this.findPosition(item, solution);

        if (pos) {
            this.addToPosition(item, pos, solution);
            return true;
        }

        const newBox = solution.addNewBox();
        item.x = 0;
        item.y = 0;
        solution.addRectangle(item, newBox.id);
        return true;
    }
}
