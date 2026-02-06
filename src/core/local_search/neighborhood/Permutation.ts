import { Rectangle, Box } from "@/models/binpacking";
import { Solution } from "@/models/binpacking";
import { type Neighborhood } from "./Neighborhood";
import {
    type GreedyPlacement,
    GreedySelection,
    GreedyAlgo,
} from "@/core/greedy";
import { getBoxesToUnpack } from "./helpers";

/**
 * Reorganize packing order
 * Pack the rectangles of less util box (clear 1 box) and put them first in the packing order
 * At rate `randomRate`=0.2 i.e. 20% of the neighbors are randomly chosen boxes and not from less util
 */

export class PermutationNeighborhood implements Neighborhood<Solution> {
    // refer to current box
    readonly totalRectangles: number;
    readonly numNeighbors: number;
    readonly randomRate: number;

    placement: GreedyPlacement<Rectangle, Solution>;
    selection: GreedySelection<Rectangle>; // current packing order
    greedyAlgo: GreedyAlgo<Rectangle, Solution>; // Greedy algorithm instance

    constructor(
        numNeighbors: number,
        totalRectangles: number,
        randomRate: number,

        placement: GreedyPlacement<Rectangle, Solution>,
        selection: GreedySelection<Rectangle>,
    ) {
        this.totalRectangles = totalRectangles;
        this.numNeighbors = numNeighbors;
        this.randomRate = randomRate;

        this.placement = placement;
        this.selection = selection; // current selection
        this.greedyAlgo = new GreedyAlgo(this.selection, this.placement);
    }

    // minimize (any other functions?? ಥ_ಥ)
    evalBoxToUnpack(box: Box) {
        const u = box.fillRatio; // less fill
        const s = box.rectangles.length / this.totalRectangles; // many little rectangles
        return u * u - s;
    }
    // low -> high
    findSortedBoxes(solution: Solution): Box[] {
        const boxes = [...solution.idToBox.values()];
        boxes.sort((a, b) => this.evalBoxToUnpack(a) - this.evalBoxToUnpack(b));
        return boxes;
    }

    // move movedRects to beginning of fullRects
    pullRects(fullRects: Rectangle[], movedRects: Rectangle[]) {
        const moved = new Set(movedRects.map((r) => r.id));
        const res = new Array<Rectangle>(fullRects.length);

        let k = 0;
        for (const r of movedRects) res[k++] = r;
        for (const r of fullRects) {
            if (!moved.has(r.id)) res[k++] = r;
        }
        return res;
    }

    getNeighbors(currentSol: Solution): Solution[] {
        const neighbors: Solution[] = [];

        const boxes = this.findSortedBoxes(currentSol);
        const picks = getBoxesToUnpack(
            boxes,
            this.numNeighbors,
            this.randomRate,
        );

        if (picks.length === 0) return neighbors;

        // clear 1 bin attempt
        for (const box of picks) {
            // reset placement
            this.placement.clearState();
            const cloned = this.selection.items.map((item) => item.cloneNew());
            const pulled = box.rectangles.map((item) => item.cloneNew());

            // reset selection
            this.selection.items = this.pullRects(cloned, pulled);
            this.selection.index = 0;

            // solve
            const neighbor = new Solution(currentSol.L);
            this.greedyAlgo.placement = this.placement;
            this.greedyAlgo.selection = this.selection;
            this.greedyAlgo.solve(neighbor);

            neighbors.push(neighbor);
        }

        return neighbors;
    }
}
