import { Rectangle, Box } from "@/models/binpacking";
import { Solution } from "@/models/binpacking";
// import { type GreedyPlacement } from "@/core/greedy";
import { type Neighborhood } from "./Neighborhood";
// import { RandomOverlapPlacement } from "@/core/greedy/placement/RandomOverlapPlacement";
import type { Stats } from "@/core/local_search/Stats";
import { calOverlapRate, totalOverlapOfRect, randInt, isOverlapping } from "@/core/local_search/helpers";
import {
    moveToExistingEmptyBox,
    moveToBoxLessOverlap,
    moveToBoxWithSpace,
    moveToNewBox,
    moveOneRect,
    swapRects,
    trySwapRects,
    rotateRect,
    tryRotateRect,
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
    readonly exploring: (progress: number) => boolean;

    constructor(maxNeighbors: number, totalRectangles: number, maxIters: number) {
        this.totalRectangles = totalRectangles;
        this.maxNeighbors = maxNeighbors;
        this.maxIters = maxIters;

        this.exploring = (progress: number) => progress >= 0.2 && progress <= 0.8;
    }

    getNeighbors(currentSol: Solution, stats: Stats): Solution[] {
        const progress = stats.iteration / this.maxIters;
        if (progress == 1) {
            this.applyBottomLeft(currentSol);
            return [];
        }
        const maxNeighbors = Math.ceil(this.maxNeighbors * (1 - progress));
        const neighbors: Solution[] = [];
        const exploring = this.exploring(progress);
        let neighborCount = 0;

        const boxes = [...currentSol.idToBox.values()];
        if (boxes.length === 0) return neighbors;

        if (Math.random() < 0.2) {
            boxes.reverse();
        }

        for (const box of boxes) {
            if (box.rectangles.length <= 1) continue; // can not overlap
            if (Math.random() < 0.5) continue; // random skip

            let moved = false;
            const neighbor = currentSol.clone((draft) => {
                const draftBox = draft.idToBox.get(box.id)!;
                // 1. to make the rectangles distribute more "evenly"
                moved ||= this.operateOnOverload(draft, draftBox, exploring);
                // 2. to minimize overlap
                moved ||= this.operateOnOverlap(draft, draftBox, exploring);
            });

            if (moved) {
                neighbors.push(neighbor);
                neighborCount++;
                if (neighborCount >= maxNeighbors) return neighbors;
            }
        }

        return neighbors;
    }

    operateOnOverload(draftSol: Solution, draftBox: Box, exploring: boolean): boolean {
        if (draftBox.rectangles.length <= 1 || draftBox.areaLeft >= 0) return false;

        while (draftBox.areaLeft < 0) {
            const candidates = [...draftBox.rectangles];
            candidates.sort((a, b) => b.area - a.area);

            let movedAny = false;

            for (const targetRect of candidates) {
                let moved = false;
                if (!moved) moved = moveToExistingEmptyBox(draftSol, targetRect);
                if (!moved) moved = moveToBoxWithSpace(draftSol, targetRect, !exploring);
                if (!moved && Math.random() < 0.1) {
                    const curTotalOverlap = totalOverlapOfRect(targetRect, draftBox);
                    moved = moveToBoxLessOverlap(draftSol, targetRect, curTotalOverlap, !exploring);
                }
                if (!moved && !exploring) moved = moveToNewBox(draftSol, targetRect);
                if (moved) {
                    movedAny = true;
                    if (draftBox.areaLeft >= 0) return true;
                }
            }
            if (!movedAny) return false;
        }
        return draftBox.areaLeft >= 0;
    }

    operateOnOverlap(draftSol: Solution, draftBox: Box, exploring: boolean): boolean {
        // return if moved
        const boxRects = draftBox.rectangles;
        if (draftBox.rectangles.length <= 1) return false; // can not overlap

        const overlapPairs: { overlap: number; rectI: Rectangle; rectJ: Rectangle }[] = [];
        for (let i = 0; i < boxRects.length; i++) {
            for (let j = i + 1; j < boxRects.length; j++) {
                const overlap = calOverlapRate(boxRects[i], boxRects[j]);
                if (overlap == 0) continue;
                overlapPairs.push({ overlap, rectI: boxRects[i], rectJ: boxRects[j] });
            }
        }

        if (overlapPairs.length == 0) return false;
        let pickedPair = overlapPairs[0];

        if (exploring) {
            overlapPairs.sort((a, b) => b.overlap - a.overlap);
            const k = Math.min(5, overlapPairs.length);
            pickedPair = overlapPairs[randInt(0, k)];
        }

        const [rectI, rectJ] = [pickedPair.rectI, pickedPair.rectJ];
        const rectsOverlap = pickedPair.overlap;

        // first vs best improvement
        const useFirstImprovement =
            exploring || // Early phase
            rectsOverlap > 0.8; // Large overlap (need quick fix)

        let moved = false;
        if (useFirstImprovement) {
            moved = this.tryRandomImprovement(draftBox, rectI, rectJ, rectsOverlap);
        } else {
            moved = this.tryBestImprovement(draftBox, rectI, rectJ, rectsOverlap);
        }

        if (!moved) {
            let targetRect = rectI.area > rectJ.area ? rectI : rectJ;
            if (exploring) targetRect = Math.random() < 0.5 ? rectI : rectJ;
            if (!moved) moved = moveToExistingEmptyBox(draftSol, targetRect);
            if (!moved) moved = moveToBoxWithSpace(draftSol, targetRect, exploring);
            if (!moved && Math.random() < 0.3) {
                const curTotalOverlap = totalOverlapOfRect(targetRect, draftBox);
                moved = moveToBoxLessOverlap(draftSol, targetRect, curTotalOverlap, !exploring);
            }
            if (!moved && !exploring) moved = moveToNewBox(draftSol, targetRect);
        }
        return moved;
    }

    private tryRandomImprovement(draftBox: Box, r1: Rectangle, r2: Rectangle, cur2RectsOverlap: number) {
        const p = Math.random();

        if (p < 0.55) {
            const pos = moveOneRect(draftBox, r1, r2, cur2RectsOverlap, true);
            if (pos) {
                pos.rect.x = pos.x;
                pos.rect.y = pos.y;
                return true;
            }
        }

        if (p < 0.65 && tryRotateRect(draftBox, r1, r2, cur2RectsOverlap) != null) {
            rotateRect(r1);
            return true;
        }

        if (p < 0.85 && tryRotateRect(draftBox, r2, r1, cur2RectsOverlap) != null) {
            rotateRect(r2);
            return true;
        }

        if (trySwapRects(draftBox, r1, r2, cur2RectsOverlap) != null) {
            swapRects(r1, r2);
            return true;
        }

        return false;
    }

    private tryBestImprovement(draftBox: Box, r1: Rectangle, r2: Rectangle, cur2RectsOverlap: number) {
        let move: "move" | "swap" | "rotate" | null = null;
        let targetRect: Rectangle | null = null;
        let leastOverlap = Infinity;

        // 1. Try moving 1 rectangle
        const pos = moveOneRect(draftBox, r1, r2, cur2RectsOverlap, true);
        if (pos && pos.overlap < leastOverlap) {
            move = "move";
            targetRect = pos.rect;
            leastOverlap = pos.overlap;

            if (pos.overlap === 0) {
                // if move create no (box) overlap -> execute
                pos.rect.x = pos.x;
                pos.rect.y = pos.y;
                return true;
            }
        }

        // 2. Try rotating 1 rectangle
        let overlap = tryRotateRect(draftBox, r1, r2, cur2RectsOverlap);
        if (overlap != null && overlap < leastOverlap) {
            move = "rotate";
            targetRect = r1;
            leastOverlap = overlap;
            if (overlap === 0) {
                rotateRect(targetRect!);
                return true;
            }
        }
        overlap = tryRotateRect(draftBox, r2, r1, cur2RectsOverlap);
        if (overlap != null && overlap < leastOverlap) {
            move = "rotate";
            targetRect = r2;
            leastOverlap = overlap;
            if (overlap === 0) {
                rotateRect(targetRect!);
                return true;
            }
        }
        overlap = trySwapRects(draftBox, r1, r2, cur2RectsOverlap);
        if (overlap != null && overlap < leastOverlap) {
            move = "swap";
            leastOverlap = overlap;
            if (overlap === 0) {
                swapRects(r1, r2);
                return true;
            }
        }

        switch (move) {
            case "move":
                targetRect!.x = pos!.x;
                targetRect!.y = pos!.y;
                return true;
            case "rotate":
                rotateRect(targetRect!);
                return true;
            case "swap":
                swapRects(r1, r2);
                return true;
        }
        return false;
    }

    private applyBottomLeft(sol: Solution): void {
        for (const box of sol.idToBox.values()) {
            const rects = box.rectangles;
            if (rects.length <= 1) {
                if (rects.length === 1) {
                    rects[0].x = 0;
                    rects[0].y = 0;
                }
                continue;
            }

            // Skip boxes with overlaps
            if (rects.some((r1, i) => rects.slice(i + 1).some((r2) => isOverlapping(r1, r2)))) continue;

            // Bottom-left sorting: bottom-most, left-most
            rects.sort((a, b) => a.y - b.y || a.x - b.x);

            for (const r of rects) {
                const rw = r.getWidth,
                    rh = r.getHeight;

                // Slide down as far as possible
                let floorY = 0;
                for (const o of rects) {
                    if (o === r) continue;
                    const ow = o.getWidth,
                        oh = o.getHeight;
                    const xOverlap = r.x < o.x + ow && r.x + rw > o.x;
                    if (!xOverlap) continue;
                    floorY = Math.max(floorY, o.y + oh);
                }
                r.y = floorY;

                // Slide left as far as possible
                let wallX = 0;
                for (const o of rects) {
                    if (o === r) continue;
                    const ow = o.getWidth,
                        oh = o.getHeight;
                    const yOverlap = r.y < o.y + oh && r.y + rh > o.y;
                    if (!yOverlap) continue;
                    wallX = Math.max(wallX, o.x + ow);
                }
                r.x = wallX;
            }
        }
    }
}
