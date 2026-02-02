import type { ShelfPlacement } from "@/core/greedy";
import type { ObjectiveFunction } from "./Objective";
import { Solution, Rectangle, Box } from "@/models/binpacking";

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

function getBoxInfo(solution: Solution, boxId: number): Box {
    const currentBox = solution.idToBox.get(boxId);
    if (!currentBox) {
        throw new Error(`Box ${boxId} not found in solution`);
    }
    return currentBox;
}

// Move using ShelfPlacement
export class RelocateRectShelf extends Move<Solution> {
    currentPlacement: ShelfPlacement;
    rect: Rectangle;
    originalBoxId: number;
    isOriginallySideway: boolean;

    newBoxId: number;
    tempMoveApplied: boolean;

    constructor(
        rect: Rectangle,
        newBoxId: number,
        currentPlacement: ShelfPlacement,
    ) {
        super();
        this.currentPlacement = currentPlacement;
        this.rect = rect;
        this.originalBoxId = rect.boxId;
        this.isOriginallySideway = rect.isSideway;
        this.newBoxId = newBoxId;
        this.tempMoveApplied = false;
    }

    apply(solution: Solution, isPermanent: boolean): boolean {
        const currentBox = getBoxInfo(solution, this.originalBoxId);
        const newBox = getBoxInfo(solution, this.newBoxId);

        // check if item fits
        if (!this.currentPlacement.checkItemFitBox(this.rect, newBox)) {
            return false;
        }

        // APPLY TEMPORARY
        if (!isPermanent) {
            solution.removeRectangle(this.rect, currentBox);
            solution.addRectangle(this.rect, newBox);
            this.tempMoveApplied = true;
            return true;
        }

        // APPLY PERMANENT
        // remove rect (and also from placement)
        const removed = this.currentPlacement.checkThenRemoveFromPlacement(
            this.rect,
            currentBox,
        );
        if (!removed) throw new Error("Item not found in placement");
        solution.removeRectangle(this.rect, currentBox);
        if (currentBox.rectangles.length === 0) solution.removeBox(currentBox);
        this.rect.reset(); // reset the rectangle

        // add rect (to placement and to solution)
        const added = this.currentPlacement.tryAddItemToBox(this.rect, newBox);
        if (!added) throw new Error("Item can not added in placement");
        solution.addRectangle(this.rect, newBox);
        return true;
    }

    undo(solution: Solution): boolean {
        // If temp move has not yet been applied
        if (!this.tempMoveApplied) return false;
        const originalBox = getBoxInfo(solution, this.originalBoxId);
        const newBox = getBoxInfo(solution, this.newBoxId);

        solution.removeRectangle(this.rect, newBox);
        if (this.rect.isSideway != this.isOriginallySideway) this.rect.setRotate()
        solution.addRectangle(this.rect, originalBox);

        this.tempMoveApplied = false;
        return true;
    }
}
