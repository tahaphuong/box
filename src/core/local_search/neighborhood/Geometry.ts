import { Rectangle, Box } from "@/models/binpacking";
import { Solution } from "@/models/binpacking";
import { Move } from "../Move";
import { type Neighborhood } from "./Neighborhood";
import type { BottomLeftFirstFit } from "@/core/greedy/placement/BottomLeftPlacement";

export class GeometryNeighborhood implements Neighborhood<Rectangle, Solution> {
    // refer to current box
    numNeighbors: number;
    totalRectangles: number;

    constructor(numNeighbors: number, totalRectangles: number) {
        this.numNeighbors = numNeighbors;
        this.totalRectangles = totalRectangles;
    }

    // minimize
    evalBoxToUnpack(box: Box) {
        const u = box.fillRatio; // less fill
        const s = box.rectangles.length / this.totalRectangles; // many little rectangles
        return u * u - s;
    }

    findSortedBoxes(solution: Solution): Box[] {
        const boxes = [...solution.idToBox.values()];
        boxes.sort((a, b) => this.evalBoxToUnpack(a) - this.evalBoxToUnpack(b));
        return boxes;
    }

    getAvailableMoves(
        solution: Solution,
        placement: BottomLeftFirstFit,
    ): RelocateRect[] {
        const sortedBoxes = this.findSortedBoxes(solution);
        const moves: RelocateRect[] = [];
        let counter = 0;

        for (let i = 0; i < sortedBoxes.length; i++) {
            const box = sortedBoxes[i];
        }

        return moves;
    }
}

// Between box, using bottom left
export class RelocateRect extends Move<Solution> {
    rect: Rectangle;
    originalBox: Box;
    destBox: Box;
    wantSideway: boolean;
    tempMoveApplied: boolean;

    constructor(
        rect: Rectangle,
        originalBox: Box,
        destBox: Box,
        wantSideway: boolean,
    ) {
        super();
        this.rect = rect;
        this.originalBox = originalBox;
        this.destBox = destBox;
        this.wantSideway = wantSideway;
        this.tempMoveApplied = false;
    }
    
    apply(solution: SOL, isPermanent: boolean): void {
        
    };

    undo(solution: SOL): void { 
        
    };

}
