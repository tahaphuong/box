import { Rectangle, Box } from "@/models/binpacking";
import { Solution } from "@/models/binpacking";
import { type Neighborhood } from "./Neighborhood";
import { createPlacementBinPack, type GreedyPlacement } from "@/core/greedy";
import type { PlacementOptionType } from "@/models";

export class GeometryNeighborhood implements Neighborhood<Solution> {
    // refer to current box
    numNeighbors: number;
    totalRectangles: number;
    placement: GreedyPlacement<Rectangle, Solution>;

    constructor(
        numNeighbors: number,
        totalRectangles: number,
        initialPlacement: GreedyPlacement<Rectangle, Solution>,
        betterPlacementOption: PlacementOptionType,
    ) {
        this.numNeighbors = numNeighbors;
        this.totalRectangles = totalRectangles;

        // copy from init placement
        const betterPlacement = createPlacementBinPack(betterPlacementOption); // BL
        betterPlacement.copyPlacementState(initialPlacement); // initial is SFF
        this.placement = betterPlacement;
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

    getNeighbors(currentSol: Solution): Solution[] {
        const neighbors: Solution[] = [];

        const picks = this.findSortedBoxes(currentSol).slice(
            0,
            this.numNeighbors,
        );
        if (picks.length === 0) return neighbors;

        for (const box of picks) {
            const neighbor = currentSol.clone((newSol) => {
                const rects = [...box.rectangles];
                newSol.removeBox(box);
                for (const item of rects) {
                    item.reset();
                    this.placement.checkThenAdd(item, newSol, null);
                }
            });
            neighbors.push(neighbor);
        }

        return neighbors;
    }
}

// get randomRate random, rest from tail
// getBoxesToUnpack(boxes: Box[], randomRate: number = 0.3): Box[] {
//     const n = this.numNeighbors;
//     if (boxes.length === 0 || n <= 0) return [];
//     if (randomRate <= 0 || randomRate >= 1) randomRate = 0.3;

//     const tail = boxes.slice(n);
//     const takeTail = Math.floor(randomRate * n); // 70%
//     const takeRandom = n - takeTail;

//     // get from tail
//     const sampleTail = tail.slice(0, Math.min(takeTail, tail.length)); // keep order
//     const selected = new Map<number, Box>();
//     for (const b of sampleTail) selected.set(b.id, b);

//     // get random
//     for (let i = 0; i < takeRandom && boxes.length > 0; i++) {
//         const b = boxes[Math.floor(Math.random() * boxes.length)];
//         if (!selected.has(b.id)) selected.set(b.id, b);
//     }

//     return Array.from(selected.values()).slice(0, n);
// }
