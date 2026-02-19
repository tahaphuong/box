import { Rectangle, Box } from "@/models/binpacking";
import { Solution } from "@/models/binpacking";
import { type GreedyPlacement } from "@/core/greedy";
import { type Neighborhood } from "./Neighborhood";
import { getBoxesToUnpack } from "@/core/local_search/helpers";
/**
 * Unpack least util box and try to move them elsewhere
 * in the current placement
 * (Clear 1 bin)
 */
export class GeometryNeighborhood implements Neighborhood<Solution> {
    // refer to current box
    readonly totalRectangles: number;
    readonly numNeighbors: number;
    readonly randomRate: number;

    placement: GreedyPlacement<Rectangle, Solution>;
    built: Array<{
        sol: Solution;
        placement: GreedyPlacement<Rectangle, Solution>;
    }>;

    constructor(
        numNeighbors: number,
        totalRectangles: number,
        randomRate: number,
        placement: GreedyPlacement<Rectangle, Solution>,
    ) {
        this.totalRectangles = totalRectangles;
        this.numNeighbors = numNeighbors;
        this.randomRate = randomRate;

        this.placement = placement;
        this.built = [];
    }

    // lesser is worse
    evalBoxToUnpack(box: Box) {
        const u = box.fillRatio; // less fill
        const s = box.rectangles.length / this.totalRectangles; // many little rectangles
        return u * u - s;
    }

    // order smallest to largest -> pick from head
    findSortedBoxes(solution: Solution): Box[] {
        const boxes = [...solution.idToBox.values()];
        boxes.sort((a, b) => this.evalBoxToUnpack(a) - this.evalBoxToUnpack(b));
        return boxes;
    }

    getNeighbors(currentSol: Solution): Solution[] {
        if (this.built.length !== 0) {
            const match = this.built.find((item) => item.sol == currentSol);
            if (!match) throw new Error("Placement state not found");

            this.placement = match.placement;
            this.built = []; // throw away old builts
        }
        // save current state
        this.built.push({ sol: currentSol, placement: this.placement });

        const neighbors: Solution[] = [];
        const boxes = this.findSortedBoxes(currentSol).slice(0, this.numNeighbors);
        const picks = getBoxesToUnpack(boxes, this.numNeighbors, this.randomRate);

        if (picks.length === 0) return neighbors;

        for (const box of picks) {
            // 1. build neighbor
            let placementClone = this.placement;
            let moved = false;

            const neighbor = currentSol.clone((newSol) => {
                const draftBox = newSol.idToBox.get(box.id);
                if (!draftBox) return;

                const rects = [...draftBox.rectangles];
                newSol.removeBox(draftBox.id);

                // 2. create placement clone and do mutations inside the draft
                placementClone = this.placement.clone((draftPlacement) => {
                    draftPlacement.removeBox(draftBox.id);
                    for (const item of rects) {
                        const placed = draftPlacement.checkThenAdd(item, newSol, null);
                        moved = moved || placed;
                    }
                });
            });

            if (!moved) continue;
            this.built.push({ sol: neighbor, placement: placementClone });
            neighbors.push(neighbor);
        }
        return neighbors;
    }
}
