import { Shelf } from "./Shelf";
import { Solution, type Box, type Rectangle } from "@/models/binpacking";
import { type GreedyPlacement } from "./GreedyPlacement";

export abstract class ShelfPlacement implements GreedyPlacement<
    Rectangle,
    Solution
> {
    boxToShelf: Map<number, Shelf[]>; // box id to shelf

    constructor() {
        this.boxToShelf = new Map();
    }

    clonePlacementFrom(other: ShelfPlacement): void {
        this.boxToShelf = new Map(other.boxToShelf);
    }

    abstract createNewShelf(
        boxId: number,
        boxLength: number,
        height: number,
    ): Shelf | null;

    abstract findShelfAndRotate(
        item: Rectangle,
        solution: Solution,
    ): Shelf | null;

    abstract checkThenAdd(item: Rectangle, solution: Solution): boolean;

    abstract compactShelvesOfBox(boxId: number): void;
}

export class ShelfFirstFit extends ShelfPlacement {
    constructor() {
        super();
    }

    getYNextShelf(boxId: number): number {
        const currentShelves = this.boxToShelf.get(boxId);

        let currentY = 0;
        if (currentShelves && currentShelves.length > 0) {
            const lastShelf = currentShelves[currentShelves.length - 1];
            currentY = lastShelf.y + lastShelf.height;
        }
        // add lowest shelf possible -> getSmallerSide
        return currentY;
    }

    createNewShelf(
        boxId: number,
        boxLength: number,
        height: number,
    ): Shelf | null {
        // if (box.areaLeft <= item.area) return null;
        const currentY = this.getYNextShelf(boxId);
        if (currentY + height <= boxLength) {
            const sh = new Shelf(currentY, height, boxLength, boxId);
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

    findShelfAndRotate(item: Rectangle, solution: Solution): Shelf | null {
        let newShelf: Shelf | null = null;
        for (const box of solution.idToBox.values()) {
            if (box.areaLeft <= item.area) continue;
            const shelves = this.boxToShelf.get(box.id);
            if (shelves == undefined) throw new Error("Box not in map");

            for (const sh of shelves) {
                if (sh.checkAndRotate(item)) {
                    return sh;
                }
            }

            newShelf = this.createNewShelf(
                box.id,
                box.L,
                item.getSmallerSide(),
            );
            if (newShelf) {
                if (!item.isSideway) item.setRotate();
                return newShelf;
            }
        }
        return null;
    }

    checkThenAdd(item: Rectangle, solution: Solution): boolean {
        try {
            // loop through each shelf
            let bestShelf = this.findShelfAndRotate(item, solution);

            // if no shelf found, create a new box and shelf
            if (!bestShelf) {
                const newBox: Box = solution.addNewBox();
                if (!item.isSideway) item.setRotate();
                bestShelf = this.createNewShelf(
                    newBox.id,
                    newBox.L,
                    item.getSmallerSide(),
                );
                this.boxToShelf.set(newBox.id, []);
            }
            if (!bestShelf)
                throw new Error("Failed to create new box and new shelf");

            // check if shelf is newly created
            if (bestShelf.rectangles.length == 0) {
                const shelves = this.boxToShelf.get(bestShelf.boxId);
                if (shelves == undefined) throw new Error("Invalid box id");
                shelves.push(bestShelf);
            }
            bestShelf.add(item);
            solution.addRectangle(item, bestShelf.boxId);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}

export class ShelfBestAreaFit extends ShelfFirstFit {
    findShelfAndRotate(item: Rectangle, solution: Solution): Shelf | null {
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
                    const waste = sh.calcWasteOrientation(item, wantSideway);
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
                box.L - this.getYNextShelf(box.id) - item.getSmallerSide();

            if (wastedHeight < 0) continue;
            if (wastedHeight < leastWastedHeight) {
                leastWastedHeight = wastedHeight;
                bestBox = box;
            }
        }

        // if found best shelf
        if (bestShelf != null && bestSideway != null) {
            if (bestSideway != item.isSideway) item.setRotate();
            return bestShelf;
        }

        if (bestBox != null) {
            if (!item.isSideway) item.setRotate();
            bestShelf = this.createNewShelf(
                bestBox.id,
                bestBox.L,
                item.getSmallerSide(),
            );
            return bestShelf;
        }
        return null;
    }
}
