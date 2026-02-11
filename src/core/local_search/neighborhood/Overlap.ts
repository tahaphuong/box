import { Rectangle, Box } from "@/models/binpacking";
import { Solution } from "@/models/binpacking";
// import { type GreedyPlacement } from "@/core/greedy";
import { type Neighborhood } from "./Neighborhood";
// import { RandomOverlapPlacement } from "@/core/greedy/placement/RandomOverlapPlacement";
import type { Stats } from "@/core/local_search/Stats";
import {
    shuffle,
    isOverlapping,
    calOverlapRate,
} from "@/core/local_search/helpers";
import {
    moveToExistingEmptyBox,
    moveToBoxWithSpace,
    moveToRandomBox,
    moveToNewBox,
    pushTwoRects,
    moveTwoRects,
    swapRects,
    rotateRect,
} from "@/core/local_search/helpers";

/**
 * Unpack least util box and try to move them elsewhere
 * in the current placement
 * (Clear 1 bin)
 */
export class OverlapNeighborhood implements Neighborhood<Solution> {
    // refer to current box
    readonly totalRectangles: number;
    readonly maxIters: number;
    readonly maxNeighbors: number;

    constructor(
        maxNeighbors: number,
        totalRectangles: number,
        maxIters: number,
    ) {
        this.totalRectangles = totalRectangles;
        this.maxNeighbors = maxNeighbors;
        this.maxIters = maxIters;
    }

    getNeighbors(currentSol: Solution, stats: Stats): Solution[] {
        void stats;

        const maxNeighbors = this.maxNeighbors;
        const neighbors: Solution[] = [];
        let neighborCount = 0;

        const boxes = shuffle([...currentSol.idToBox.values()]);
        if (boxes.length === 0) return neighbors;

        // "clear 1 bin": each neighbor will try to resolve overlap of 1 box
        for (const box of boxes) {
            if (box.rectangles.length <= 1) continue; // can not overlap
            let moved = false;

            const neighbor = currentSol.clone((draft) => {
                // 1. if current area is too large -> move rectangle to other boxes
                if (box.areaLeft < 0) {
                    const rects = [...box.rectangles].sort(
                        (a, b) => b.area - a.area,
                    );
                    for (const rect of rects) {
                        moved = moveToBoxWithSpace(draft, rect);
                        if (!moved) {
                            moved = moveToExistingEmptyBox(draft, rect);
                        }
                        if (!moved) {
                            moved = moveToNewBox(draft, rect);
                        }
                        if (moved && box.areaLeft >= 0) break;
                    }
                }
                // TODO: check again if moved box & operate on overlap together or not
                // if (moved) return;

                // else: resolve overlap
                moved ||= this.operateOnOverlap(draft, box);
            });

            if (moved) {
                neighbors.push(neighbor);
                neighborCount++;
                if (neighborCount >= maxNeighbors) return neighbors;
            }
        }

        return neighbors;
    }

    operateOnOverlap(draftSol: Solution, box: Box): boolean {
        const boxRects = box.rectangles;
        if (box.rectangles.length <= 1) return false; // can not overlap
        let moved = false;

        for (let i = 0; i < boxRects.length; i++) {
            for (let j = i + 1; j < boxRects.length; j++) {
                if (!isOverlapping(boxRects[i], boxRects[j])) continue;
                if (
                    this.tryMoveOnOverlap(
                        draftSol,
                        box,
                        boxRects[i],
                        boxRects[j],
                    )
                )
                    moved = true;
            }
        }
        return moved;
    }

    private tryMoveOnOverlap(
        draft: Solution,
        currentBox: Box,
        d1: Rectangle,
        d2: Rectangle,
    ): boolean {
        let moved = false;

        // const currentBox = draft.idToBox.get(box.id)!;
        // const d1 = currentBox.rectangles.find((r) => r.id === r1.id);
        // const d2 = currentBox.rectangles.find((r) => r.id === r2.id);
        // if (!d1 || !d2) return false;

        // 1) Overlap resolution
        const L = currentBox.L;
        const overlapRate = calOverlapRate(d1, d2);
        if (overlapRate <= 0.2) {
            moved = moveTwoRects(L, d1, d2);
            if (moved) return true;
        }
        moved = pushTwoRects(L, d1, d2);
        if (moved) return true;

        // 2) Random diversification
        const p = Math.random();
        if (p < 0.3 && swapRects(L, d1, d2)) return (moved = true);
        if (p < 0.6 && rotateRect(L, Math.random() < 0.5 ? d1 : d2))
            return (moved = true);
        moved = moveToRandomBox(draft, Math.random() < 0.5 ? d1 : d2);

        return moved;
    }
}
