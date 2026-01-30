import type { ShelfPlacement, Shelf } from "@/core/greedy";
import type { ObjectiveFunction } from "./Objective";
import { Solution, Rectangle, Box } from "@/models/binpacking";

export abstract class Move<SOL> {
    abstract apply(solution: SOL): boolean;

    abstract undo(solution: SOL): boolean;

    // Evaluate the score of the move: apply then undo
    getScore(objective: ObjectiveFunction<SOL>, solution: SOL): number | null {
        const applied = this.apply(solution);
        if (!applied) {
            return null;
        }
        const score = objective.score(solution);
        this.undo(solution);
        return score;
    }
}

function getBoxInfo(
    solution: Solution,
    boxId: number,
    placement: ShelfPlacement,
): [Box, Shelf[]] {
    const currentBox = solution.idToBox.get(boxId);
    if (!currentBox) {
        throw new Error(`Box ${boxId} not found in solution`);
    }
    const currentShelves = placement.boxToShelf.get(boxId);
    if (!currentShelves) {
        throw new Error(`Box ${boxId} not found in placement`);
    }
    return [currentBox, currentShelves];
}

// from original to new box
export class RelocateRectShelf extends Move<Solution> {
    rect: Rectangle;
    originalBoxId: number;
    newBoxId: number;
    currentPlacement: ShelfPlacement;

    originalShelf: Shelf | null;
    newShelf: Shelf | null;

    constructor(
        rect: Rectangle,
        newBoxId: number,
        currentPlacement: ShelfPlacement,
    ) {
        super();
        this.rect = rect;
        this.originalBoxId = rect.boxId;
        this.newBoxId = newBoxId;
        this.currentPlacement = currentPlacement;

        this.originalShelf = null;
        this.newShelf = null;
    }

    apply(solution: Solution): boolean {
        // remove from current box
        const [currentBox, currentShelves] = getBoxInfo(
            solution,
            this.rect.boxId,
            this.currentPlacement,
        );
        let removed = false;
        for (const shelf of currentShelves) {
            removed = shelf.remove(this.rect);
            if (removed) {
                this.originalShelf = shelf;
                solution.removeRectangle(this.rect, currentBox);
                break;
            }
        }
        if (!removed) return false;
        // throw new Error(`Rectangle ${this.rect.id} not found in shelf`);

        // add to new box
        const [newBox, newShelves] = getBoxInfo(
            solution,
            this.newBoxId,
            this.currentPlacement,
        );
        const added = this.currentPlacement.checkThenAddToBox(
            this.rect,
            solution,
            newBox,
        );
        if (!added) return false;
        // throw new Error(`Rectangle ${this.rect.id} can not be added to box ${newBox.id}`);

        for (const shelf of newShelves) {
            if (shelf.rectangles.includes(this.rect)) {
                this.newShelf = shelf;
                break;
            }
        }

        return true;
    }

    undo(solution: Solution): boolean {
        if (!this.originalShelf || !this.newShelf) {
            // throw new Error("Move not yet applied (so can not undo)");
            return false;
        }
        const [originalBox] = getBoxInfo(
            solution,
            this.originalBoxId,
            this.currentPlacement,
        );
        const [newBox] = getBoxInfo(
            solution,
            this.newBoxId,
            this.currentPlacement,
        );
        this.newShelf.remove(this.rect);
        solution.removeRectangle(this.rect, newBox);

        this.originalShelf.add(this.rect);
        solution.addRectangle(this.rect, originalBox);

        return true;
    }
}
