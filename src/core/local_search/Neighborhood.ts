import { Rectangle } from "@/models/binpacking/Rectangle";
import { Move, RelocateRectShelf } from "./Move";
import type { Solution, Box } from "@/models/binpacking";
import type { GreedyPlacement, ShelfPlacement } from "../greedy";

export interface Neighborhood<Item, SOL> {
    getAvailableMoves(
        solution: SOL,
        placement: GreedyPlacement<Item, SOL>,
    ): Move<SOL>[];
}

// move & rotate a rectangle to another bin
export class GeometryNeighborhood implements Neighborhood<Rectangle, Solution> {
    targetRects: Rectangle[];
    constructor() {
        this.targetRects = [];
    }
    findTargetRects(solution: Solution): void {
        let lowestFillArea = Infinity;
        let targetBox = null;

        for (const box of solution.idToBox.values()) {
            if (box.fillArea < lowestFillArea) {
                lowestFillArea = box.fillArea;
                targetBox = box;
            }
        }
        if (!targetBox) return;
        this.targetRects = targetBox.rectangles;
    }
    getAvailableMoves(
        solution: Solution,
        placement: ShelfPlacement,
    ): RelocateRectShelf[] {
        const moves = [];
        if (this.targetRects.length == 0) this.findTargetRects(solution);

        const randomIndex = Math.floor(Math.random() * this.targetRects.length);
        const randomRect = this.targetRects[randomIndex];

        const randomBoxIds = getRandomBoxIds(solution.idToBox, 5);

        for (const boxId of randomBoxIds) {
            if (boxId === randomRect.boxId) continue;
            moves.push(new RelocateRectShelf(randomRect, boxId, placement));
        }
        return moves;
    }
}

function getRandomBoxIds(map: Map<number, Box>, count: number): number[] {
    const keys = Array.from(map.keys());

    // Fisher-Yates Shuffle
    for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [keys[i], keys[j]] = [keys[j], keys[i]];
    }

    return keys.slice(0, count);
}
