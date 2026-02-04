import { Rectangle } from "@/models/binpacking/Rectangle";
import { Move, RelocateRectShelf } from "./Move";
import type { Solution } from "@/models/binpacking";
import type { GreedyPlacement, ShelfPlacement, Shelf } from "@/core/greedy";
import { type NeighborhoodOptionType, NeighborhoodOption } from "@/models";

export interface Neighborhood<Item, SOL> {
    getAvailableMoves(placement: GreedyPlacement<Item, SOL>): Move<SOL>[];
}

// Minimize
function evalShelfToUnpack(sh: Shelf) {
    const w = sh.currentWidth / sh.maxWidth; // less width -> easier to unpack
    const u = sh.util; // less fill
    const h = sh.height / sh.maxWidth; // big height but small util
    return w + u - h;
}

// move & rotate a rectangle to another bin
export class GeometryNeighborhood implements Neighborhood<Rectangle, Solution> {
    // refer to current box
    numNeighbors: number;

    constructor(numNeighbors: number) {
        this.numNeighbors = numNeighbors;
    }

    // Sort increasing
    findSortedShelves(placement: ShelfPlacement): Shelf[] {
        const shelves = Array.from(placement.boxToShelf.values()).flat(1);
        shelves.sort((a, b) => evalShelfToUnpack(a) - evalShelfToUnpack(b));
        return shelves;
    }

    getAvailableMoves(placement: ShelfPlacement): RelocateRectShelf[] {
        const sortedShelves = this.findSortedShelves(placement);
        const neighborShelves = sortedShelves.slice(0, this.numNeighbors);
        const sourceRects: Rectangle[] = [];
        const sourceShelves: Shelf[] = [];

        // pick highest rectangle in each neighbor shelf
        for (const sh of neighborShelves) {
            let highestRect: Rectangle | null = null;
            for (const rect of sh.rectangles) {
                if (!highestRect || rect.getHeight > highestRect.getHeight) {
                    highestRect = rect;
                }
            }
            if (!highestRect) continue;
            sourceRects.push(highestRect);
            sourceShelves.push(sh);
        }

        // pick SBAF
        const moves: RelocateRectShelf[] = [];
        for (let i = sourceRects.length - 1; i >= 0; i--) {
            let sbaf: Shelf | null = null;
            let leastWaste = Infinity;
            let wantSideway = sourceRects[i].isSideway;

            // try both direction
            for (const sh of sortedShelves) {
                if (sh == sourceShelves[i]) continue; // skip current shelf
                for (const ori of [false, true]) {
                    const waste = sh.calcWasteOrientation(sourceRects[i], ori);
                    if (waste == null) continue;
                    if (waste < leastWaste) {
                        leastWaste = waste;
                        sbaf = sh;
                        wantSideway = ori;
                    }
                }
            }

            if (!sbaf) continue;
            moves.push(
                new RelocateRectShelf(
                    placement,
                    sourceRects[i],
                    sourceShelves[i],
                    sbaf,
                    wantSideway,
                ),
            );
        }

        return moves;
    }
}

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
