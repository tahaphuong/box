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

    addRectangle(rect: Rectangle, box: Box): void {
        if (this.idToBox.get(box.id) != box) throw new Error("Box is not in solution")
        rect.boxId = box.id;
        box.addRectangle(rect);
    }
    removeRectangle(rect: Rectangle, box: Box): void {
        if (this.idToBox.get(box.id) != box) throw new Error("Box is not in solution")
        rect.boxId = -1;
        box.removeRectangle(rect);
    }
}
