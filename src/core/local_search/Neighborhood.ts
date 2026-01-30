import { Rectangle } from "@/models/binpacking/Rectangle";
import type { Move } from "./Move";
import type { Solution } from "@/models/binpacking";

export interface Neighborhood<SOL> {
    getAvailableMoves(solution: SOL): Move<SOL>[];
}

// move & rotate a rectangle to another bin
export class GeometryNeighborhood implements Neighborhood<Solution> {
    rectsToMove: Rectangle[];

    constructor() {
        this.rectsToMove = [];
    }

    findTargetRects(solution: Solution): Rectangle[] {
        return [];
    }
    getAvailableMoves(solution: Solution): Move<Solution>[] {
        return [];
    }
}
