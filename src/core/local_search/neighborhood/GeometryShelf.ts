// move & rotate a "high" rectangle of selected neighbor shelves and try to place in a best fit
import { Rectangle } from "@/models/binpacking/Rectangle";
import { Solution } from "@/models/binpacking";
import { Move } from "../Move";
import { type Neighborhood } from "./Neighborhood";
import type { ShelfPlacement, Shelf } from "@/core/greedy";

export class GeometryShelfNeighborhood implements Neighborhood<
    Rectangle,
    Solution
> {
    // refer to current box
    numNeighbors: number;
    totalRectangles: number;

    constructor(numNeighbors: number, totalRectangles: number) {
        this.numNeighbors = numNeighbors;
        this.totalRectangles = totalRectangles;
    }

    // Minimize
    evalShelfToUnpack(sh: Shelf) {
        const w = sh.currentWidth / sh.maxWidth; // less width -> easier to unpack
        const u = sh.util; // less fill
        const h = sh.height / sh.maxWidth; // big height but small util
        const s = sh.rectangles.length / this.totalRectangles; // many small items
        return w + u * u - h - s;
    }

    // Sort increasing
    findSortedShelves(placement: ShelfPlacement): Shelf[] {
        const shelves = Array.from(placement.boxToShelf.values()).flat(1);
        shelves.sort(
            (a, b) => this.evalShelfToUnpack(a) - this.evalShelfToUnpack(b),
        );
        return shelves;
    }

    getAvailableMoves(
        solution: Solution,
        placement: ShelfPlacement,
    ): RelocateRectShelf[] {
        const sortedShelves = this.findSortedShelves(placement);
        const neighborShelves = sortedShelves.slice(0, this.numNeighbors);
        const sourceRects: Rectangle[] = [];
        const sourceShelves: Shelf[] = [];

        for (const sh of neighborShelves) {
            let highestRect = null;
            for (const rect of sh.rectangles) {
                if (!highestRect || rect.getHeight > highestRect.getHeight) {
                    highestRect = rect;
                }
            }
            if (highestRect) {
                sourceRects.push(highestRect);
                sourceShelves.push(sh);
            }
        }

        // pick SBAF
        const moves: RelocateRectShelf[] = [];
        for (let i = 0; i < sourceRects.length; i++) {
            // document original & wantside
            const oriSideway = sourceRects[i].isSideway;
            const destShelf = placement.findShelfAndRotate(
                sourceRects[i],
                solution,
            );
            const wantSideway = sourceRects[i].isSideway;
            // rotate back to original
            if (sourceRects[i].isSideway != oriSideway) {
                sourceRects[i].isSideway = oriSideway;
            }

            if (!destShelf) continue;
            moves.push(
                new RelocateRectShelf(
                    placement,
                    sourceRects[i],
                    sourceShelves[i],
                    destShelf,
                    wantSideway,
                ),
            );
        }

        return moves;
    }
}

// Move using ShelfPlacement
export class RelocateRectShelf extends Move<Solution> {
    currentPlacement: ShelfPlacement;
    rect: Rectangle;
    originalShelf: Shelf;

    destShelf: Shelf;
    wantSideway: boolean;
    tempMoveApplied: boolean;

    constructor(
        currentPlacement: ShelfPlacement,
        rect: Rectangle,
        originalShelf: Shelf,
        destShelf: Shelf,
        wantSideway: boolean,
    ) {
        super();
        this.currentPlacement = currentPlacement;
        this.rect = rect;
        this.originalShelf = originalShelf;

        this.destShelf = destShelf;
        this.wantSideway = wantSideway;
        this.tempMoveApplied = false;
    }

    apply(solution: Solution, isPermanent: boolean): void {
        if (!isPermanent) {
            solution.removeRectangle(this.rect, this.originalShelf.boxId);
            solution.addRectangle(this.rect, this.destShelf.boxId);
            this.tempMoveApplied = true;
            return;
        }
        // apply permanently

        // remove first
        this.originalShelf.remove(this.rect);
        const oriBoxId = this.originalShelf.boxId;
        this.currentPlacement.compactShelvesOfBox(oriBoxId);
        solution.removeRectangle(this.rect, oriBoxId);
        // remove box if empty
        const originalBox = solution.idToBox.get(oriBoxId);
        if (!originalBox)
            throw new Error(`Box ${oriBoxId} not found in solution`);
        if (originalBox.rectangles.length === 0)
            solution.removeBox(originalBox);
        this.rect.reset(); // reset the rectangle

        // then add
        // check if shelf is newly created
        if (this.destShelf.rectangles.length == 0) {
            const shelves = this.currentPlacement.boxToShelf.get(
                this.destShelf.boxId,
            );
            if (shelves == undefined) throw new Error("Invalid box id");
            shelves.push(this.destShelf);
        }
        if (this.rect.isSideway != this.wantSideway) this.rect.setRotate();
        this.destShelf.add(this.rect);
        solution.addRectangle(this.rect, this.destShelf.boxId);
    }

    undo(solution: Solution): void {
        // If temp move has not yet been applied
        if (!this.tempMoveApplied) throw new Error("Temp move not applied");
        solution.removeRectangle(this.rect, this.destShelf.boxId);
        solution.addRectangle(this.rect, this.originalShelf.boxId);
        this.tempMoveApplied = false;
    }
}
