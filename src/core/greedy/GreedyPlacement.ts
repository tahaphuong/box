import type { Box, Rectangle, Solution } from "@/models/binpacking";
import { Shelf } from "./Shelf";
import { PlacementOption, type PlacementOptionType } from "@/models";

export interface GreedyPlacement<Item, SOL> {
    checkThenAdd(item: Item, solution: SOL): boolean;
}

export abstract class ShelfPlacement implements GreedyPlacement<
    Rectangle,
    Solution
> {
    boxToShelf: Map<number, Shelf[]>; // box id to shelf

    constructor() {
        this.boxToShelf = new Map();
    }

    abstract createNewShelf(item: Rectangle, box: Box): Shelf | null;

    abstract checkThenAdd(item: Rectangle, solution: Solution): boolean;

    abstract compactShelvesOfBox(boxId: number): void;
}

export class ShelfFirstFit extends ShelfPlacement {
    constructor() {
        super();
    }

    getYNextShelf(box: Box): number {
        const currentShelves = this.boxToShelf.get(box.id);

        let currentY = 0;
        if (currentShelves && currentShelves.length > 0) {
            const lastShelf = currentShelves[currentShelves.length - 1];
            currentY = lastShelf.y + lastShelf.height;
        }
        // add lowest shelf possible -> getSmallerSide
        return currentY;
    }

    createNewShelf(item: Rectangle, box: Box): Shelf | null {
        if (box.areaLeft <= item.area) return null;
        const currentY = this.getYNextShelf(box);
        if (currentY + item.getSmallerSide() <= box.L) {
            const sh = new Shelf(
                currentY,
                item.getSmallerSide(),
                box.L,
                box.id,
            );
            return sh;
        }
        return null;
    }

    compactShelvesOfBox(boxId: number): void {
        // get the shelves of this box
        const shelves = this.boxToShelf.get(boxId);
        if (shelves == undefined) throw new Error("Invalid box id");

        // remove empty shelves
        for (let i = shelves.length - 1; i >= 0; i--) {
            if (shelves[i].rectangles.length === 0) {
                shelves.splice(i, 1);
            }
        }

        // Recompute shelf Y positions for shelf and its rectangles
        let y = 0;
        for (const shelf of shelves) {
            shelf.y = y;
            for (const rect of shelf.rectangles) rect.y = y;
            y += shelf.height;
        }

        // If no shelves left, delete box mapping
        if (shelves.length === 0) {
            this.boxToShelf.delete(boxId);
        }
    }

    checkThenAdd(item: Rectangle, solution: Solution): boolean {
        try {
            // loop through each shelf

            let newShelf: Shelf | null = null;
            for (const box of solution.idToBox.values()) {
                if (box.areaLeft <= item.area) continue;
                const shelves = this.boxToShelf.get(box.id);
                if (shelves == undefined) throw new Error("Box not in map");

                for (const sh of shelves) {
                    if (sh.checkAndRotate(item)) {
                        // if found then add directly
                        sh.add(item);
                        solution.addRectangle(item, sh.boxId);
                        return true;
                    }
                }

                newShelf = this.createNewShelf(item, box);
                if (newShelf) break;
            }

            // if no shelf found, create a new box and shelf
            if (!newShelf) {
                const newBox: Box = solution.addNewBox();
                newShelf = this.createNewShelf(item, newBox);
                this.boxToShelf.set(newBox.id, []);
            }
            if (!newShelf)
                throw new Error("Failed to create new box and new shelf");

            // add item
            const curShelves = this.boxToShelf.get(newShelf.boxId);
            if (curShelves == undefined) throw new Error("Invalid box id");

            if (!item.isSideway) item.setRotate();
            newShelf.add(item);
            curShelves.push(newShelf);
            solution.addRectangle(item, newShelf.boxId);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}

export class ShelfBestAreaFit extends ShelfFirstFit {
    checkThenAdd(item: Rectangle, solution: Solution): boolean {
        try {
            let leastWastedArea: number = Infinity;
            let bestShelf: Shelf | null = null;
            let bestSideway: boolean | null = null;

            let leastWastedHeight: number = Infinity;
            let bestBox: Box | null = null;

            for (const box of solution.idToBox.values()) {
                if (box.areaLeft <= item.area) continue;
                const shelves = this.boxToShelf.get(box.id);
                if (shelves == undefined) throw new Error("Box not in map");

                for (const sh of shelves) {
                    for (const wantSideway of [false, true]) {
                        const waste = sh.calcWasteOrientation(
                            item,
                            wantSideway,
                        );
                        if (waste != null && waste < leastWastedArea) {
                            leastWastedArea = waste;
                            bestShelf = sh;
                            bestSideway = wantSideway;
                        }
                    }
                }

                if (bestShelf != null && bestSideway != null) continue;

                // if no best shelf found, find best box
                const wastedHeight =
                    box.L - this.getYNextShelf(box) - item.getSmallerSide();

                if (wastedHeight < 0) continue;
                if (wastedHeight < leastWastedHeight) {
                    leastWastedHeight = wastedHeight;
                    bestBox = box;
                }
            }

            // if found best shelf
            if (bestShelf != null && bestSideway != null) {
                if (bestSideway != item.isSideway) item.setRotate();
                bestShelf.add(item);
                solution.addRectangle(item, bestShelf.boxId);
                return true;
            }

            // if no best box found, create a new one
            if (!bestBox) {
                bestBox = solution.addNewBox();
                this.boxToShelf.set(bestBox.id, []);
            }
            bestShelf = this.createNewShelf(item, bestBox);
            if (!bestShelf)
                throw new Error("Failed to create new box and new shelf");

            const curShelves = this.boxToShelf.get(bestBox.id);
            if (curShelves == undefined) throw new Error("Invalid box id");

            if (!item.isSideway) item.setRotate();
            bestShelf.add(item);
            curShelves.push(bestShelf);
            solution.addRectangle(item, bestBox.id);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}

// Greedy Selection handler
export function createPlacementBinPack(
    option: PlacementOptionType = PlacementOption.SHELF_FIRST_FIT,
): GreedyPlacement<Rectangle, Solution> {
    switch (option) {
        case PlacementOption.SHELF_BEST_AREA_FIT:
            return new ShelfBestAreaFit();
        case PlacementOption.SHELF_FIRST_FIT:
        default:
            return new ShelfFirstFit();
    }
}
