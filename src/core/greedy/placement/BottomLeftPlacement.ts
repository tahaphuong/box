import { type GreedyPlacement } from "./GreedyPlacement";
import { Solution, type Rectangle, type Position } from "@/models/binpacking";

export class BottomLeftFirstFit implements GreedyPlacement<
    Rectangle,
    Solution
> {
    constructor() {}

    // clone() & copy not necessary for BL
    clone(): GreedyPlacement<Rectangle, Solution> {
        return this;
    }
    copyPlacementState(other: GreedyPlacement<Rectangle, Solution>): void {
        void other;
    }

    moveDown(x: number, width: number, rectangles: Rectangle[]): number {
        let targetY = 0; // Default to the very bottom
        for (const rect of rectangles) {
            // overlap in X with candidate
            if (rect.x < x + width && rect.x + rect.getWidth > x) {
                targetY = Math.max(targetY, rect.y + rect.getHeight);
            }
        }
        return targetY;
    }

    moveLeft(y: number, height: number, rectangles: Rectangle[]): number {
        let targetX = 0; // Default to the very left
        for (const rect of rectangles) {
            // overlap in Y with candidate
            if (rect.y < y + height && rect.y + rect.getHeight > y) {
                targetX = Math.max(targetX, rect.x + rect.getWidth);
            }
        }
        return targetX;
    }

    noOverlap(
        x: number,
        y: number,
        width: number,
        height: number,
        rects: Rectangle[],
    ): boolean {
        for (const r of rects) {
            if (
                x < r.x + r.getWidth &&
                x + width > r.x &&
                y < r.y + r.getHeight &&
                y + height > r.y
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
                const candidateSideway =
                    r === 1 ? !originalSideway : originalSideway;

                // compute candidate width/height without mutating item
                const candidateWidth = candidateSideway
                    ? item.getLargerSide()
                    : item.getSmallerSide();
                const candidateHeight = candidateSideway
                    ? item.getSmallerSide()
                    : item.getLargerSide();

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
                    // start at candidate
                    let cx = c.x;
                    let cy = c.y;

                    // bottom-left projection using locals
                    cy = this.moveDown(cx, candidateWidth, box.rectangles);
                    cx = this.moveLeft(cy, candidateHeight, box.rectangles);

                    // bounds check
                    if (
                        cx < 0 ||
                        cy < 0 ||
                        cx + candidateWidth > solution.L ||
                        cy + candidateHeight > solution.L
                    ) {
                        continue;
                    }

                    // overlap check
                    if (
                        !this.noOverlap(
                            cx,
                            cy,
                            candidateWidth,
                            candidateHeight,
                            box.rectangles,
                        )
                    )
                        continue;

                    // bottom-most, then left-most
                    if (!found || cy < bestY || (cy === bestY && cx < bestX)) {
                        bestX = cx;
                        bestY = cy;
                        bestSideway = candidateSideway;
                        found = true;
                    }
                }
            }

            // item remains unchanged here
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
