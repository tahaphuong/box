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

    getShelvesFromBox(boxId: number): Shelf[] {
        const currentShelves = this.boxToShelf.get(boxId);
        if (currentShelves == undefined) throw new Error("Invalid box id");
        return currentShelves;
    }

    abstract createNewShelfAndAddItem(
        y: number,
        item: Rectangle,
        width: number,
    ): Shelf;

    abstract addItemToNewShelfOfNewBox(item: Rectangle, box: Box): boolean;

    abstract checkItemFitShelf(sh: Shelf, item: Rectangle): boolean;

    // for local search
    abstract checkItemFitBox(item: Rectangle, box: Box): boolean;

    abstract tryAddItemToShelf(
        sh: Shelf,
        item: Rectangle,
        box: Box,
        solution: Solution,
    ): boolean;

    abstract tryAddItemToNewShelfOfBox(item: Rectangle, box: Box): Shelf | null;

    abstract tryAddItemToBox(item: Rectangle, box: Box): Shelf | null;

    abstract checkThenAdd(item: Rectangle, solution: Solution): boolean;

    abstract checkThenRemoveFromPlacement(item: Rectangle, box: Box): boolean;
}

export class ShelfFirstFit extends ShelfPlacement {
    constructor() {
        super();
    }

    createNewShelfAndAddItem(y: number, item: Rectangle, width: number): Shelf {
        // rotate sideway before create and add
        if (!item.isSideway) {
            item.setRotate();
        }
        const sh = new Shelf(y, item.getHeight, width);
        sh.add(item);
        return sh;
    }

    // check both orientations if fit in shelf
    checkItemFitShelf(sh: Shelf, item: Rectangle): boolean {
        // try upright first
        const isOriginallySideway = item.isSideway;

        if (item.isSideway) item.setRotate();
        if (sh.check(item)) return true;
        // then try sideway
        item.setRotate();
        if (sh.check(item)) return true;

        // restore original orientation if can't fit
        if (item.isSideway != isOriginallySideway) item.setRotate();

        return false;
    }

    tryAddItemToShelf(sh: Shelf, item: Rectangle): boolean {
        if (this.checkItemFitShelf(sh, item)) {
            sh.add(item);
            return true;
        }
        return false;
    }

    tryAddItemToNewShelfOfBox(item: Rectangle, box: Box): Shelf | null {
        const currentShelves = this.getShelvesFromBox(box.id);
        let currentY = 0;
        if (currentShelves.length > 0) {
            const lastShelf = currentShelves[currentShelves.length - 1];
            currentY = lastShelf.y + lastShelf.height;
        }

        // add lowest shelf possible -> getSmallerSide
        if (currentY + item.getSmallerSide() <= box.L) {
            // rotate item sideway and add
            const sh = this.createNewShelfAndAddItem(currentY, item, box.L);
            currentShelves.push(sh);
            return sh;
        }
        return null;
    }

    addItemToNewShelfOfNewBox(item: Rectangle, box: Box): boolean {
        const sh = this.createNewShelfAndAddItem(0, item, box.L);
        this.boxToShelf.set(box.id, [sh]);
        return true;
    }

    checkThenRemoveFromPlacement(item: Rectangle, box: Box): boolean {
        // get the shelves of this box
        const shelves = this.getShelvesFromBox(box.id);

        let removed = false;
        for (const sh of shelves) {
            if (sh.rectangles.includes(item)) {
                removed = sh.remove(item);
                break;
            }
        }
        if (!removed) throw new Error("Item not found in any shelf/not in box");

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
            for (const rect of shelf.rectangles) rect.y = y 
            y += shelf.height;
        }

        // If no shelves left, delete box mapping
        if (shelves.length === 0) {
            this.boxToShelf.delete(box.id);
        }
        return true;
    }

    tryAddItemToBox(item: Rectangle, box: Box): Shelf | null {
        if (box.areaLeft <= item.area) return null;

        // get the shelves of this box
        const shelves = this.getShelvesFromBox(box.id);

        // try to add to an existing shelf (first fit)
        for (const sh of shelves) {
            if (this.tryAddItemToShelf(sh, item)) return sh;
        }

        // try to add to a new shelf of this box
        return this.tryAddItemToNewShelfOfBox(item, box);
    }

    checkItemFitBox(item: Rectangle, box: Box): boolean {
        if (box.areaLeft <= item.area) return false;

        // get the shelves of this box
        const shelves = this.getShelvesFromBox(box.id);

        // check if item fits to an existing shelf (first fit)
        for (const sh of shelves) {
            if (this.checkItemFitShelf(sh, item)) return true;
        }

        // check if item fits to a new shelf of this box
        let currentY = 0;
        if (shelves.length > 0) {
            const lastShelf = shelves[shelves.length - 1];
            currentY = lastShelf.y + lastShelf.height;
        }

        return currentY + item.getSmallerSide() <= box.L;
    }

    checkThenAdd(item: Rectangle, solution: Solution): boolean {
        try {
            // loop through each of current box
            for (const box of solution.idToBox.values()) {
                if (this.tryAddItemToBox(item, box) != null) {
                    solution.addRectangle(item, box);
                    return true;
                }
            }

            // ... else, we have to add a new box and a new shelf to that
            const newBox: Box = solution.addNewBox();
            if (this.addItemToNewShelfOfNewBox(item, newBox)) {
                solution.addRectangle(item, newBox);
                return true;
            }
            return false;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}

export class ShelfBestAreaFit extends ShelfFirstFit {
    leastWastedBoxHeight: number = Infinity;
    leastWastedShelfValue: number = Infinity;
    bestBox: Box | null = null;
    bestShelf: Shelf | null = null;
    bestSideway: boolean | null = null; // Track orientation of the best shelf

    constructor() {
        super();
        this.init();
    }

    init() {
        this.leastWastedBoxHeight = Infinity;
        this.leastWastedShelfValue = Infinity;
        this.bestBox = null;
        this.bestShelf = null;
        this.bestSideway = null;
    }

    // Evaluate a shelf for an explicit orientation without leaving the item rotated.
    // If it's globally best, record shelf/box/orientation.
    private evaluateShelfForOrientation(
        sh: Shelf,
        item: Rectangle,
        box: Box,
        wantSideway: boolean,
    ): boolean {
        const originalSideway = item.isSideway;

        // Rotate to requested orientation if needed
        if (item.isSideway !== wantSideway) item.setRotate();

        // Compute fit/waste with current getters
        const wd = sh.getWidthDiff(item.getWidth);
        const hd = sh.getHeightDiff(item.getHeight);
        let foundGlobalBest = false;

        if (wd >= 0 && hd >= 0) {
            const waste = wd + hd; // lower is better
            if (waste < this.leastWastedShelfValue) {
                this.leastWastedShelfValue = waste;
                this.bestBox = box;
                this.bestShelf = sh;
                this.bestSideway = wantSideway;
                foundGlobalBest = true;
            }
        }

        // Restore original orientation
        if (item.isSideway !== originalSideway) item.setRotate();
        return foundGlobalBest;
    }

    // best fit
    // try add to BEST SHELF IN A BOX -> for local search
    tryAddItemToBox(item: Rectangle, box: Box): Shelf | null {
        this.init();

        if (box.areaLeft <= item.area) return null;

        // get the shelves of this box
        const shelves = this.getShelvesFromBox(box.id);


        for (const sh of shelves) {
            // upright (wantSideway = false)
            this.evaluateShelfForOrientation(sh, item, box, false);
            // sideway (wantSideway = true)
            this.evaluateShelfForOrientation(sh, item, box, true);
            
        }

        if (this.bestSideway != null && this.bestShelf != null) {
            if (this.tryAddItemToShelf(this.bestShelf, item)) return this.bestShelf;
        }

        return this.tryAddItemToNewShelfOfBox(item, box);
    }

    checkThenAdd(item: Rectangle, solution: Solution): boolean {
        this.init();

        try {
            // loop through each of current box
            for (const box of solution.idToBox.values()) {
                if (box.areaLeft <= item.area) continue;
                const shelves = this.getShelvesFromBox(box.id);

                // find the perfect shelf by evaluating both orientations
                for (const sh of shelves) {
                    // upright (wantSideway = false)
                    this.evaluateShelfForOrientation(sh, item, box, false);
                    // sideway (wantSideway = true)
                    this.evaluateShelfForOrientation(sh, item, box, true);
                }

                // if there no perfect shelf yet -> find perfect gap in box
                if (this.bestShelf == null) {
                    let wastedHeight = box.L - item.getSmallerSide();
                    if (shelves.length > 0) {
                        const lastShelf = shelves[shelves.length - 1];
                        wastedHeight -= lastShelf.y + lastShelf.height;
                    }

                    if (wastedHeight < 0) continue;
                    if (wastedHeight < this.leastWastedBoxHeight) {
                        this.bestBox = box;
                    }
                }
            }

            if (
                this.bestSideway != null &&
                this.bestShelf != null &&
                this.bestBox != null
            ) {
                if (this.bestSideway != item.isSideway) item.setRotate();
                if (this.bestShelf.check(item)) {
                    this.bestShelf.add(item);
                    solution.addRectangle(item, this.bestBox);
                    return true;
                }
            } else if (this.bestBox != null) {
                if (this.tryAddItemToNewShelfOfBox(item, this.bestBox)) {
                    solution.addRectangle(item, this.bestBox);
                    return true;
                }
            }

            // ... else, we have to add a new box and a new shelf to that
            const newBox = solution.addNewBox();
            if (this.addItemToNewShelfOfNewBox(item, newBox)) {
                solution.addRectangle(item, newBox);
                return true;
            }
            return false;
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
