import { type GreedyPlacement } from "./GreedyPlacement";
import { Solution, type Rectangle, type Position } from "@/models/binpacking";
// import { create, castDraft } from "mutative";

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
        let targetY = 0;
        for (const rect of rectangles) {
            if (rect.x < x + width && rect.x + rect.getWidth > x) {
                targetY = Math.max(targetY, rect.y + rect.getHeight);
            }
        }
        return targetY;
    }

    moveLeft(
        y: number,
        height: number,
        width: number,
        rectangles: Rectangle[],
    ): number {
        let targetX = 0;
        for (const rect of rectangles) {
            if (rect.y < y + height && rect.y + rect.getHeight > y) {
                targetX = Math.max(targetX, rect.x + rect.getWidth);
                const xOverlap =
                    targetX < rect.x + rect.getWidth &&
                    targetX + width > rect.x;
                if (xOverlap) break;
            }
        }
        return targetX;
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
                    ? item.largerSide
                    : item.smallerSide;
                const candidateHeight = candidateSideway
                    ? item.smallerSide
                    : item.largerSide;

                const candidates: Array<{ x: number; y: number }> = [
                    { x: 0, y: 0 },
                ];

                const boxRects = box.rectangles;

                for (const rect of boxRects) {
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
                    cy = this.moveDown(cx, candidateWidth, boxRects);
                    if (cy < 0 || cy + candidateHeight > solution.L) continue;
                    cx = this.moveLeft(
                        cy,
                        candidateHeight,
                        candidateWidth,
                        boxRects,
                    );
                    // final bounds check
                    if (cx < 0 || cx + candidateWidth > solution.L) continue;

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
