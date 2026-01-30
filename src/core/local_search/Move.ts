import type { ShelfPlacement, Shelf } from "@/core/greedy";
import type { ObjectiveFunction } from "./Objective";
import { Solution, Rectangle, Box } from "@/models/binpacking";

export abstract class Move<SOL> {
    abstract apply(solution: SOL): SOL;

    abstract undo(solution: SOL): SOL;

    // Evaluate the score of the move: apply then undo
    getScore(objective: ObjectiveFunction<SOL>, solution: SOL): number | null {
        try {
            const score = objective.score(this.apply(solution));
            this.undo(solution);
            return score;
        } catch (error) {
            console.error(error);
            return null;
        }
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
export class RelocateShelfRect extends Move<Solution> {
    rect: Rectangle;
    originalBoxId: number;
    newBoxId: number;
    currentPlacement: ShelfPlacement;

    originalShelf: Shelf | null;
    newShelf: Shelf | null;

    constructor(
        rect: Rectangle,
        originalBoxId: number,
        newBoxId: number,
        currentPlacement: ShelfPlacement,
    ) {
        super();
        this.rect = rect;
        this.originalBoxId = originalBoxId;
        this.newBoxId = newBoxId;
        this.currentPlacement = currentPlacement;

        this.originalShelf = null;
        this.newShelf = null;
    }

    apply(solution: Solution): Solution {
        // remove from current box
        const [currentBox, currentShelves] = getBoxInfo(
            solution,
            this.originalBoxId,
            this.currentPlacement,
        );
        let removed = false;
        for (const shelf of currentShelves) {
            removed = shelf.remove(this.rect);
            if (removed) {
                this.originalShelf = shelf;
                currentBox.removeRectangle(this.rect);
                break;
            }
        }
        if (!removed) {
            throw new Error(`Rectangle ${this.rect.id} not found in shelf`);
        }

        // add to new box
        const [newBox, newShelves] = getBoxInfo(
            solution,
            this.newBoxId,
            this.currentPlacement,
        );
        let added = false;
        for (const shelf of newShelves) {
            added = this.currentPlacement.tryAddItemToShelf(
                shelf,
                this.rect,
                newBox,
                solution,
            );
            if (added) {
                this.newShelf = shelf;
                newBox.addRectangle(this.rect);
                break;
            }
        }
        if (!added) {
            throw new Error(
                `Rectangle ${this.rect.id} can not be added to box ${newBox.id}`,
            );
        }

        return solution;
    }

    undo(solution: Solution): Solution {
        if (!this.originalShelf || !this.newShelf) {
            throw new Error("Move not yet applied (so can not undo)");
        }
        this.originalShelf.add(this.rect);
        this.newShelf.remove(this.rect);
        const [originalBox] = getBoxInfo(
            solution,
            this.originalBoxId,
            this.currentPlacement,
        );
        originalBox.addRectangle(this.rect);
        const [newBox] = getBoxInfo(
            solution,
            this.newBoxId,
            this.currentPlacement,
        );
        newBox.removeRectangle(this.rect);
        return solution;
    }
}
