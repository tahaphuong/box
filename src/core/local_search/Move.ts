import type { ShelfPlacement, Shelf } from "@/core/greedy";
import type { ObjectiveFunction } from "./Objective";
import { Solution, Rectangle, Box } from "@/models/binpacking";

export abstract class Move<SOL> {
    abstract apply(solution: SOL, accept: boolean): boolean;

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
    originalRotated: boolean;
    originalX: number;
    originalY: number;

    newBoxId: number;
    newShelf: Shelf | null;

    constructor(
        rect: Rectangle,
        newBoxId: number,
        currentPlacement: ShelfPlacement,
    ) {
        super();
        this.currentPlacement = currentPlacement;
        this.rect = rect;
        this.originalBoxId = rect.boxId;

        this.originalRotated = rect.rotated;
        this.originalX = rect.x;
        this.originalY = rect.y;

        this.newBoxId = newBoxId;
        this.newShelf = null;
    }

    apply(solution: Solution, accept: boolean): boolean {
        const currentBox = getBoxInfo(solution, this.originalBoxId);
        const newBox = getBoxInfo(solution, this.newBoxId);

        // try add to the indicated box if possible
        this.newShelf = this.currentPlacement.checkThenAddToBox(
            this.rect,
            solution,
            newBox,
        );

        if (!this.newShelf) return false; // safely return false because no action is performed

        // if apply is temporary
        if (!accept) {
            solution.removeRectangle(this.rect, currentBox);
            solution.addRectangle(this.rect, newBox);
            return true;
        }

        // remove rect from box (for real for real)

        // if the only rect in box is moved -> remove empty box in placement
        if (currentBox.rectangles.length == 1) {
            this.currentPlacement.boxToShelf.delete(currentBox.id);
            solution.removeBox(currentBox);
            return true;
        }

        this.currentPlacement.checkThenRemoveFromPlacement(
            this.rect,
            currentBox,
        );

        solution.removeRectangle(this.rect, currentBox);
        solution.addRectangle(this.rect, newBox);

        return true;
    }

    undo(solution: Solution): boolean {
        // can only undo temporary (not accepted) moves

        // If temp move has not yet been applied
        if (!this.newShelf) return false;
        const originalBox = getBoxInfo(solution, this.originalBoxId);
        const newBox = getBoxInfo(solution, this.newBoxId);

        this.newShelf.revertAdd(
            this.rect,
            this.originalX,
            this.originalY,
            this.originalRotated,
        );
        solution.removeRectangle(this.rect, newBox);
        solution.addRectangle(this.rect, originalBox);
        return true;
    }
}
