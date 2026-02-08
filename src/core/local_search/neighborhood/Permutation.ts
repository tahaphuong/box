import { Rectangle, Box } from "@/models/binpacking";
import { Solution } from "@/models/binpacking";
import { type Neighborhood } from "./Neighborhood";
import {
    GreedyAlgo,
    type GreedyPlacement,
    GreedySelection,
    OriginalSelection,
} from "@/core/greedy";
import { getBoxesToUnpack } from "@/core/local_search/helpers";

/**
 * Reorganize packing order
 * Pack the rectangles of less util box ("clear 1 box") and put them first in the packing order
 * At rate `randomRate`=0.2 i.e. 20% of the neighbors are randomly chosen boxes and not from less util
 */
export class PermutationNeighborhood implements Neighborhood<Solution> {
    // refer to current box
    readonly totalRectangles: number;
    readonly numNeighbors: number;
    readonly randomRate: number;

    placement: GreedyPlacement<Rectangle, Solution>;
    selection: GreedySelection<Rectangle>;
    built: Array<{
        sol: Solution;
        selection: GreedySelection<Rectangle>;
    }>;

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

        this.placement = placement; // is shared
        this.selection = selection; // current (best) selection
        this.built = [];
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
        if (this.built.length !== 0) {
            const match = this.built.find((item) => item.sol == currentSol);
            if (!match) throw new Error("Current selection state not found");

            this.selection = match.selection;
            this.built = []; // throw away old builts
        }
        // save current selection state
        this.built.push({ sol: currentSol, selection: this.selection });
        const neighbors: Solution[] = [];

        // unpack and rearange
        const boxes = this.findSortedBoxes(currentSol);
        const picks = getBoxesToUnpack(
            boxes,
            this.numNeighbors,
            this.randomRate,
        );
        if (picks.length === 0) return neighbors;

        // clear 1 bin attempt
        for (const box of picks) {
            this.placement.clearState();
            const cloned = this.selection.items.map((item) => item.cloneNew());
            const pulled = box.rectangles.map((item) => item.cloneNew());
            const orderedItems = this.pullRects(cloned, pulled);
            const newSelection = new OriginalSelection(orderedItems);

            const greedyAlgo = new GreedyAlgo(newSelection, this.placement);
            let neighbor = new Solution(currentSol.L);
            neighbor = greedyAlgo.solve(neighbor);

            this.built.push({ sol: neighbor, selection: newSelection });
            neighbors.push(neighbor);
        }
        return neighbors;
    }
}
