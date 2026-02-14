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
import { BottomLeftFirstFit } from "@/core/greedy/placement/BottomLeftPlacement";

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
    readonly overlapToSolve: (progress: number) => number;
    readonly overloadToSolve: (progress: number) => number;

    private tempCandidates: Rectangle[] = [];

    constructor(maxNeighbors: number, totalRectangles: number, maxIters: number) {
        this.totalRectangles = totalRectangles;
        this.maxNeighbors = maxNeighbors;
        this.maxIters = maxIters;

        this.exploring = (progress: number) => progress <= 0.8;
        this.overlapToSolve = (progress: number) => 0.3 * (1 - progress ** 2);
        this.overloadToSolve = (progress: number) => 1.2 * (1 - progress ** 2);
    }

    getNeighbors(currentSol: Solution, stats: Stats): Solution[] {
        const progress = stats.iteration / this.maxIters;

        if (progress == 1) {
            this.applyBottomLeft(currentSol);
            return [];
        }
        const maxNeighbors = Math.ceil(this.maxNeighbors * (1 - progress));
        // const maxNeighbors = this.maxNeighbors;
        const neighbors: Solution[] = [];
        const exploring = this.exploring(progress);
        const overlapToSolve = this.overlapToSolve(progress);
        const overloadToSolve = this.overloadToSolve(progress);

        let neighborCount = 0;
        const boxes = [...currentSol.idToBox.values()];
        if (boxes.length === 0) return neighbors;

        const index = progress >= 0.2 ? 0 : Math.floor(Math.random() * boxes.length);
        for (let i = index; i < boxes.length; i++) {
            const box = boxes[i];
            if (box.rectangles.length <= 1) continue; // can not overlap

            let moved = false;
            const neighbor = currentSol.clone((draft) => {
                const draftBox = draft.idToBox.get(box.id)!;
                moved ||= this.operateOnOverload(draft, draftBox, exploring, overloadToSolve);
                moved ||= this.operateOnOverlap(draft, draftBox, exploring, overlapToSolve);
            });

            if (moved) {
                neighbors.push(neighbor);
                neighborCount++;
                if (neighborCount >= maxNeighbors) return neighbors;
            }
        }

        return neighbors;
    }

    operateOnOverload(draftSol: Solution, draftBox: Box, exploring: boolean, overloadToSolve: number): boolean {
        if (draftBox.rectangles.length <= 1 || draftBox.areaLeft >= 0) return false;

        while (draftBox.fillRatio > overloadToSolve) {
            this.tempCandidates.length = 0;
            this.tempCandidates.push(...draftBox.rectangles);
            this.tempCandidates.sort((a, b) => b.area - a.area);

            let movedAny = false;
            for (const targetRect of this.tempCandidates) {
                let moved = false;
                if (!moved) moved = moveToExistingEmptyBox(draftSol, targetRect);
                if (!moved) moved = moveToBoxWithSpace(draftSol, targetRect, !exploring);
                if (!moved && Math.random() < 0.3) {
                    const curTotalOverlap = totalOverlapOfRect(targetRect, draftBox);
                    moved = moveToBoxLessOverlap(draftSol, targetRect, curTotalOverlap, !exploring);
                }
                if (!moved && !exploring) moved = moveToNewBox(draftSol, targetRect);
                if (moved) {
                    movedAny = true;
                    if (draftBox.fillRatio <= overloadToSolve) return true;
                }
            }
            if (!movedAny) return false;
        }
        return draftBox.fillRatio <= overloadToSolve;
    }

    operateOnOverlap(draftSol: Solution, draftBox: Box, exploring: boolean, overlapToSolve: number): boolean {
        // return if moved
        const boxRects = draftBox.rectangles;
        if (draftBox.rectangles.length <= 1) return false; // can not overlap

        const overlapPairs: { overlap: number; rectI: Rectangle; rectJ: Rectangle }[] = [];
        for (let i = 0; i < boxRects.length; i++) {
            for (let j = i + 1; j < boxRects.length; j++) {
                const overlap = calOverlapRate(boxRects[i], boxRects[j]);
                if (overlap < overlapToSolve) continue;
                overlapPairs.push({ overlap, rectI: boxRects[i], rectJ: boxRects[j] });
            }
        }

        if (overlapPairs.length == 0) return false;
        let pickedPair = overlapPairs[0];

        if (exploring) {
            const k = Math.min(5, overlapPairs.length);
            pickedPair = overlapPairs[randInt(0, k)];
        }

        const [rectI, rectJ] = [pickedPair.rectI, pickedPair.rectJ];
        const rectsOverlap = pickedPair.overlap;

        let moved = false;
        if (exploring) {
            moved = this.tryRandomImprovement(draftBox, rectI, rectJ, rectsOverlap);
        } else {
            moved = this.tryBestImprovement(draftBox, rectI, rectJ, rectsOverlap);
        }

        if (!moved) {
            let targetRect = rectI.area > rectJ.area ? rectI : rectJ;
            if (exploring) targetRect = Math.random() < 0.5 ? rectI : rectJ;
            if (!moved) moved = moveToExistingEmptyBox(draftSol, targetRect);
            if (!moved && exploring) moved = moveToBoxWithSpace(draftSol, targetRect, !exploring);
            if (!moved && Math.random() < 0.2) {
                const curTotalOverlap = totalOverlapOfRect(targetRect, draftBox);
                moved = moveToBoxLessOverlap(draftSol, targetRect, curTotalOverlap, !exploring);
            }
            if (!moved && !exploring) moved = moveToNewBox(draftSol, targetRect);
        }
        return moved;
    }

    private tryRandomImprovement(draftBox: Box, r1: Rectangle, r2: Rectangle, cur2RectsOverlap: number) {
        const p = Math.random();

        if (p < 0.5) {
            const pos = moveOneRect(draftBox, r1, r2, cur2RectsOverlap, true);
            if (pos) {
                pos.rect.x = pos.x;
                pos.rect.y = pos.y;
                return true;
            }
        }

        if (p < 0.75 && tryRotateRect(draftBox, r1, r2, cur2RectsOverlap) != null) {
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
        const placement = new BottomLeftFirstFit();
        const leftOverRects: Rectangle[] = [];

        for (const box of sol.idToBox.values()) {
            const rects = [...box.rectangles];

            let isOverlap = false;
            checkLoop: for (let i = 0; i < rects.length; i++) {
                for (let j = i + 1; j < rects.length; j++) {
                    isOverlap = isOverlapping(rects[i], rects[j]);
                    if (isOverlap) break checkLoop;
                }
            }

            // if overlap: organize in box
            if (isOverlap) {
                box.empty();
                rects.sort((a, b) => b.area - a.area);

                for (const rect of rects) {
                    rect.reset();
                    const pos = placement.findPositionInBox(rect, box);
                    if (pos) {
                        placement.checkThenAdd(rect, sol, pos);
                    } else {
                        leftOverRects.push(rect);
                    }
                }
                continue;
            }

            // push down
            rects.sort((a, b) => a.y - b.y);
            for (let i = 0; i < rects.length; i++) {
                const x = rects[i].x;
                const width = rects[i].getWidth;

                let newY = 0;
                for (let j = 0; j < i; j++) {
                    if (rects[j].x < x + width && rects[j].x + rects[j].getWidth > x)
                        newY = Math.max(newY, rects[j].y + rects[j].getHeight);
                }
                rects[i].y = newY;
            }

            // push left
            rects.sort((a, b) => a.x - b.x);
            for (let i = 0; i < rects.length; i++) {
                const y = rects[i].y;
                const height = rects[i].getHeight;

                let newX = 0;
                for (let j = 0; j < i; j++) {
                    if (rects[j].y < y + height && rects[j].y + rects[j].getHeight > y)
                        newX = Math.max(newX, rects[j].x + rects[j].getWidth);
                }
                rects[i].x = newX;
            }
        }

        leftOverRects.sort((a, b) => b.area - a.area);
        for (const rect of leftOverRects) {
            placement.checkThenAdd(rect, sol);
        }
    }
}
