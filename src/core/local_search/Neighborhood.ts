import { Rectangle } from "@/models/binpacking/Rectangle";
import { Move, RelocateRectShelf } from "./Move";
import type { Solution } from "@/models/binpacking";
import type { GreedyPlacement, ShelfPlacement } from "../greedy";
import { type NeighborhoodOptionType, NeighborhoodOption } from "@/models";

export interface Neighborhood<Item, SOL> {
    getAvailableMoves(
        solution: SOL,
        placement: GreedyPlacement<Item, SOL>,
    ): Move<SOL>[];
}

// move & rotate a rectangle to another bin
export class GeometryNeighborhood implements Neighborhood<Rectangle, Solution> {
    // refer to current box
    // targetRects: Rectangle[];
    numNeighbors: number;

    constructor(numNeighbors: number) {
        // this.targetRects = [];
        this.numNeighbors = numNeighbors;
    }
    // findTargetRects(solution: Solution): void {
    //     let lowestFillArea = Infinity;
    //     let targetBox = null;

    //     for (const box of solution.idToBox.values()) {
    //         if (box.fillArea < lowestFillArea) {
    //             lowestFillArea = box.fillArea;
    //             targetBox = box;
    //         }
    //     }
    //     if (!targetBox) return;
    //     this.targetRects = targetBox.rectangles;
    // }
    getAvailableMoves(
        solution: Solution,
        placement: ShelfPlacement,
    ): RelocateRectShelf[] {
        const moves = [];

        // get random rect from random box
        //
        const boxes = [...solution.idToBox.values()];

        for (let i = 0; i < this.numNeighbors; i++) {
            const randomBoxIndex1 = Math.floor(Math.random() * boxes.length);
            const randomBoxIndex2 = Math.floor(Math.random() * boxes.length);
            if (randomBoxIndex1 === randomBoxIndex2) continue; // skip the same box

            const randomOriBox = boxes[randomBoxIndex1];
            const randomDestBox = boxes[randomBoxIndex2];

            const randomRect =
                randomOriBox.rectangles[
                    Math.floor(Math.random() * randomOriBox.rectangles.length)
                ];

            // generate random neighbors
            moves.push(
                new RelocateRectShelf(randomRect, randomDestBox.id, placement),
            );
        }
        return moves;
    }
}

// function getRandomBoxIds(map: Map<number, Box>, count: number): number[] {
//     const keys = [...map.keys()];

//     // Fisher-Yates Shuffle
//     for (let i = keys.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [keys[i], keys[j]] = [keys[j], keys[i]];
//     }

//     return keys.slice(0, count);
// }

// Local Search Neighborhood handler
export function createNeighborhoodBinPack(
    option: NeighborhoodOptionType,
    numNeighbors: number,
) {
    switch (option) {
        case NeighborhoodOption.GEOMETRY:
            return new GeometryNeighborhood(numNeighbors);
        case NeighborhoodOption.RULE:
        case NeighborhoodOption.OVERLAP:
        default:
            return new GeometryNeighborhood(numNeighbors);
    }
}
