import { Box, Rectangle } from "@/models/binpacking";
import { AlgoSolution } from "@/models";

export class Solution extends AlgoSolution {
    readonly L: number;
    idToBox: Map<number, Box>; // an boxId-to-Box dictionary
    incId: number;

    constructor(L: number) {
        super();
        this.L = L;
        this.idToBox = new Map();
        this.incId = 0;
    }

    addNewBox(): Box {
        const box = new Box(this.incId++, this.L);
        this.idToBox.set(box.id, box);
        return box;
    }
    removeBox(box: Box): void {
        this.idToBox.delete(box.id);
    }

    addRectangle(rect: Rectangle, boxId: number): void {
        const box = this.idToBox.get(boxId);
        if (!box)
            throw new Error(
                `Add rect ${rect.id} failed: Box ${boxId} is not in solution`,
            );
        rect.boxId = boxId;
        box.addRectangle(rect);
    }
    removeRectangle(rect: Rectangle, boxId: number): void {
        const box = this.idToBox.get(boxId);
        if (!box)
            throw new Error(
                `Remove rect ${rect.id} failed: Box ${boxId} is not in solution`,
            );
        rect.boxId = -1;
        box.removeRectangle(rect);
    }
}
