import { Rectangle, Box } from "@/models/binpacking";
import { Solution } from "@/models/binpacking";
import { type Neighborhood } from "./Neighborhood";
import { type GreedyPlacement } from "@/core/greedy";
import { BottomLeftFirstFit } from "@/core/greedy/placement/BottomLeftPlacement";

export class GeometryNeighborhood implements Neighborhood<Solution> {
    // refer to current box
    numNeighbors: number;
    totalRectangles: number;
    placement: GreedyPlacement<Rectangle, Solution>;
    randomRate: number;

    constructor(
        numNeighbors: number,
        totalRectangles: number,
        randomRate: number,
    ) {
        this.numNeighbors = numNeighbors;
        this.totalRectangles = totalRectangles;

        // copy from init placement
        this.placement = new BottomLeftFirstFit();
        this.randomRate = randomRate;
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

        const boxes = this.findSortedBoxes(currentSol).slice(
            0,
            this.numNeighbors,
        );
        const picks = getBoxesToUnpack(
            boxes,
            this.numNeighbors,
            this.randomRate,
        );

        if (picks.length === 0) return neighbors;

        for (const box of picks) {
            const neighbor = currentSol.clone((newSol) => {
                const draftBox = newSol.idToBox.get(box.id);
                if (!draftBox) return;
                const rects = [...draftBox.rectangles];
                newSol.removeBox(draftBox.id);

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
function getBoxesToUnpack(boxes: Box[], n: number, randomRate?: number): Box[] {
    if (boxes.length === 0 || n <= 0) return [];
    if (randomRate == undefined || randomRate < 0 || randomRate > 1) {
        return boxes.slice(n);
    }

    const head = boxes.slice(n);
    const takeHead = Math.floor((1 - randomRate) * n); // 70%

    // get from tail
    const sampleHead = head.slice(0, takeHead); // keep order
    const selected = new Map<number, Box>();
    for (const b of sampleHead) selected.set(b.id, b);
    // get random
    for (let i = 0; i < n - takeHead && boxes.length > 0; i++) {
        const b = boxes[Math.floor(Math.random() * boxes.length)];
        if (!selected.has(b.id)) selected.set(b.id, b);
    }

    return [...selected.values()].slice(0, n);
}
