import { Rectangle, Box } from "@/models/binpacking";
import { Solution } from "@/models/binpacking";
// import { type GreedyPlacement } from "@/core/greedy";
import { type Neighborhood } from "./Neighborhood";
// import { RandomOverlapPlacement } from "@/core/greedy/placement/RandomOverlapPlacement";
import type { Stats } from "@/core/local_search/Stats";
import {
    shuffle,
    calOverlapRate,
    centerOf,
    normalizeDiscrete,
    clampInt,
    randInt,
    isOverflow,
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

    operateOnOverlap(
        box: Box,
        operatorFn?: (rect1: Rectangle, rect2: Rectangle) => boolean,
    ): boolean {
        const boxRects = box.rectangles;

        for (let i = 0; i < boxRects.length; i++) {
            for (let j = i + 1; j < boxRects.length; j++) {
                const overlap = calOverlapRate(boxRects[i], boxRects[j]);
                if (overlap > 0 && operatorFn) {
                    const stop = operatorFn(boxRects[i], boxRects[j]);
                    if (stop) return true;
                }
            }
        }
        return false;
    }

    // Moves
    moveToEmptyBox(draftSol: Solution, d1: Rectangle, d2: Rectangle): boolean {
        const rectToMove = d1.area > d2.area ? d1 : d2;

        // add to empty box
        for (const box of draftSol.idToBox.values()) {
            if (box.rectangles.length == 0) {
                draftSol.removeRectangle(rectToMove);
                rectToMove.x = 0;
                rectToMove.y = 0;
                draftSol.addRectangle(rectToMove, box.id);
                return true;
            }
        }

        return false;
    }

    swapRects(L: number, d1: Rectangle, d2: Rectangle): boolean {
        [d1.x, d2.x] = [d2.x, d1.x];
        [d1.y, d2.y] = [d2.y, d1.y];

        if (isOverflow(d1, L) || isOverflow(d2, L)) {
            [d1.x, d2.x] = [d2.x, d1.x];
            [d1.y, d2.y] = [d2.y, d1.y];
            return false;
        }
        return true;
    }

    moveRect(d: Rectangle, L: number, step: number): boolean {
        const oldX = d.x;
        const oldY = d.y;

        d.x = clampInt(d.x + randInt(-step, step), 0, L - d.getWidth);
        d.y = clampInt(d.y + randInt(-step, step), 0, L - d.getHeight);

        if (isOverflow(d, L)) {
            d.x = oldX;
            d.y = oldY;
            return false;
        }
        return true;
    }

    pushOneRect(
        L: number,
        step: number,
        d1: Rectangle,
        d2: Rectangle,
    ): boolean {
        const d = Math.random() < 0.5 ? d1 : d2;

        const c1 = centerOf(d1);
        const c2 = centerOf(d2);
        const { nx, ny } = normalizeDiscrete(c1.cx - c2.cx, c1.cy - c2.cy);

        // "push away"
        const oldX = d.x;
        const oldY = d.y;
        d.x = clampInt(d.x + nx * step, 0, L - d.getWidth);
        d.y = clampInt(d.y + ny * step, 0, L - d.getHeight);

        // check bound
        if (isOverflow(d, L)) {
            d.x = oldX;
            d.y = oldY;
            return false;
        }
        return true;
    }

    moveToRandomBox(sol: Solution, rect: Rectangle): boolean {
        const boxes = [...sol.idToBox.values()];
        const targetBox =
            boxes[Math.min(randInt(0, boxes.length), boxes.length - 1)];
        if (!targetBox || targetBox.id === rect.boxId) return false;

        sol.removeRectangle(rect);
        // rect.x = 0; // TODO: check this again
        // rect.y = 0;
        sol.addRectangle(rect, targetBox.id);
        return true;
    }

    rotateRect(L: number, d1: Rectangle, d2: Rectangle): boolean {
        const d = Math.random() < 0.5 ? d1 : d2;
        // compute target orientation

        d.isSideway = !d.isSideway;

        // check bound
        if (isOverflow(d, L)) {
            d.isSideway = !d.isSideway;
            return false;
        }

        return true;
    }

    getNeighbors(currentSol: Solution, stats: Stats): Solution[] {
        const progress = stats.iteration / this.maxIters;
        const numNb = 1 + Math.floor(this.maxNeighbors * (1 - progress));
        const step = Math.max(1, Math.floor(currentSol.L * (1 - progress)));

        const neighbors: Solution[] = [];

        // check random boxes
        const boxes = shuffle<Box>([...currentSol.idToBox.values()]);
        if (boxes.length === 0) return neighbors;
        let generated = 0;

        for (const box of boxes) {
            const stopped = this.operateOnOverlap(box, (r1, r2) => {
                if (generated >= numNb) return true;

                let moved = false;

                const neighbor = currentSol.clone((draft) => {
                    const currentBox = draft.idToBox.get(box.id)!;
                    const getRect = (rect: Rectangle) =>
                        currentBox.rectangles.find((r) => r.id === rect.id);

                    const d1 = getRect(r1);
                    const d2 = getRect(r2);
                    if (!d1 || !d2) return;

                    // moved to a new box directly if overlaps exceed current box area
                    if (d1.area + d2.area > currentBox.area) {
                        moved = this.moveToEmptyBox(draft, d1, d2);
                        if (moved) return;
                    }

                    const p = Math.random();
                    const L = currentBox.L;

                    // TODO: Implement the logic for the remaining cases
                    if (p < 0.2) {
                        moved = this.rotateRect(L, d1, d2);
                        if (moved) return;
                    }
                    if (p < 0.6) {
                        // Random local move
                        const pick = Math.random() < 0.5 ? d1 : d2;
                        moved = this.moveRect(pick, L, step);
                        if (moved) return;
                    }
                    if (p < 0.85) {
                        // Push one rect away from the other
                        moved = this.pushOneRect(L, step, d1, d2);
                        if (moved) return;
                    }

                    if (p < 0.95) {
                        // Swap positions
                        moved = this.swapRects(L, d1, d2);
                        if (moved) return;
                    }
                    moved = this.moveToRandomBox(
                        draft,
                        Math.random() < 0.5 ? d1 : d2,
                    );
                });

                if (neighbor && moved) {
                    neighbors.push(neighbor);
                    generated++;
                }
                return generated >= numNb;
            });

            if (stopped) break;
        }
        if (neighbors.length === 0) {
            const box = boxes[0];
            const r =
                box.rectangles[
                    Math.min(
                        randInt(0, box.rectangles.length),
                        box.rectangles.length - 1,
                    )
                ];
            const neighbor = currentSol.clone((draft) => {
                const b = draft.idToBox.get(box.id)!;
                const d = b.rectangles.find((x) => x.id === r.id);
                if (!d) return;
                this.moveRect(d, b.L, step);
            });
            if (neighbor) neighbors.push(neighbor);
        }

        // TODO: Implement Finalization (-> to non-overlapping solution)
        return neighbors;
    }
}
