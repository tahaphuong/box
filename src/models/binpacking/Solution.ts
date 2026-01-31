import { Box, Rectangle } from "@/models/binpacking";
import { AlgoSolution } from "@/models";

export class Solution extends AlgoSolution {
    readonly L: number;
    rectToBox: Map<number, number>; // an id-to-id dictionary
    idToBox: Map<number, Box>; // an id-to-Box dictionary
    incId: number;

    constructor(L: number) {
        super();
        this.L = L;
        this.rectToBox = new Map();
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
        rect.setBoxId(box.id);
        box.addRectangle(rect);
        this.rectToBox.set(rect.id, box.id);
    }
    removeRectangle(rect: Rectangle, box: Box): void {
        rect.setBoxId(-1);
        box.removeRectangle(rect);
        this.rectToBox.delete(rect.id);
    }
}
