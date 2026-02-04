import type { ShelfPlacement } from "@/core/greedy";
import type { ObjectiveFunction } from "./Objective";
import { Solution, Rectangle } from "@/models/binpacking";
import { Shelf } from "@/core/greedy/Shelf";

export abstract class Move<SOL> {
    abstract apply(solution: SOL, isPermanent: boolean): boolean;

    abstract undo(solution: SOL): boolean;

    // Evaluate the score of the move: apply then undo
    getScore(objective: ObjectiveFunction<SOL>, solution: SOL): number | null {
        const applied = this.apply(solution, false);
        if (!applied) {
            return null;
        }
        const score = objective.score(solution);
        this.undo(solution);
        return score;
    }
}

// Move using ShelfPlacement
export class RelocateRectShelf extends Move<Solution> {
    currentPlacement: ShelfPlacement;
    rect: Rectangle;
    originalShelf: Shelf;
    // isOriginallySideway: boolean;

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
        // this.isOriginallySideway = rect.isSideway;

        this.destShelf = destShelf;
        this.wantSideway = wantSideway;
        this.tempMoveApplied = false;
    }

    apply(solution: Solution, isPermanent: boolean): boolean {
        if (!isPermanent) {
            solution.removeRectangle(this.rect, this.originalShelf.boxId);
            solution.addRectangle(this.rect, this.destShelf.boxId);
            this.tempMoveApplied = true;
            return true;
        }
        // apply permanently
        //
        // remove first
        this.originalShelf.remove(this.rect);
        const oriBoxId = this.originalShelf.boxId;
        this.currentPlacement.compactShelvesOfBox(oriBoxId);
        solution.removeRectangle(this.rect, oriBoxId);

        // can remove box?
        const originalBox = solution.idToBox.get(oriBoxId);
        if (!originalBox)
            throw new Error(`Box ${oriBoxId} not found in solution`);
        if (originalBox.rectangles.length === 0)
            solution.removeBox(originalBox);
        this.rect.reset(); // reset the rectangle

        // then add
        if (this.rect.isSideway != this.wantSideway) this.rect.setRotate();
        this.destShelf.add(this.rect);
        solution.addRectangle(this.rect, this.destShelf.boxId);

        return true;
    }

    undo(solution: Solution): boolean {
        // If temp move has not yet been applied
        if (!this.tempMoveApplied) return false;

        solution.removeRectangle(this.rect, this.destShelf.boxId);
        // if (this.rect.isSideway != this.isOriginallySideway)
        //     this.rect.setRotate();
        solution.addRectangle(this.rect, this.originalShelf.boxId);
        this.tempMoveApplied = false;
        return true;
    }
}
