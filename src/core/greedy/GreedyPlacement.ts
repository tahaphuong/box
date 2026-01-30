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
    abstract createNewShelfAndAddItem(
        y: number,
        item: Rectangle,
        width: number,
    ): Shelf;

    abstract tryAddItemToShelf(
        sh: Shelf,
        item: Rectangle,
        box: Box,
        solution: Solution,
    ): boolean;

    abstract tryAddShelfToBox(
        shelves: Shelf[],
        item: Rectangle,
        box: Box,
        solution: Solution,
    ): boolean;

    abstract createNewBoxAndAddShelf(
        item: Rectangle,
        solution: Solution,
    ): boolean;

    abstract checkThenAddToBox(
        item: Rectangle,
        solution: Solution,
        box: Box,
    ): boolean;

    abstract checkThenAdd(item: Rectangle, solution: Solution): boolean;
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

    tryAddItemToShelf(
        sh: Shelf,
        item: Rectangle,
        box: Box,
        solution: Solution,
    ): boolean {
        if (item.isSideway) {
            item.setRotate();
        }
        if (sh.check(item)) {
            sh.add(item);
            solution.addRectangle(item, box);
            return true;
        }

        // then try sideway
        item.setRotate();
        if (sh.check(item)) {
            sh.add(item);
            solution.addRectangle(item, box);
            return true;
        }

        return false;
    }

    tryAddShelfToBox(
        currentShelves: Shelf[],
        item: Rectangle,
        box: Box,
        solution: Solution,
    ): boolean {
        const lastShelf = currentShelves[currentShelves.length - 1];
        if (
            lastShelf.y + lastShelf.height + item.getSmallerSide() <=
            solution.L
        ) {
            const sh = this.createNewShelfAndAddItem(
                lastShelf.y + lastShelf.height,
                item,
                solution.L,
            );
            currentShelves.push(sh);
            solution.addRectangle(item, box);
            return true;
        }
        return false;
    }

    createNewBoxAndAddShelf(item: Rectangle, solution: Solution): boolean {
        const box: Box = solution.addNewBox();
        const sh = this.createNewShelfAndAddItem(0, item, solution.L);
        this.boxToShelf.set(box.id, [sh]);
        solution.addRectangle(item, box);
        return true;
    }

    // checkThenRemoveFromBox(
    //     item: Rectangle,
    //     solution: Solution,
    //     box: Box,
    // ): boolean {
    //     // get the shelves of this box
    //     const shelves = this.boxToShelf.get(box.id);
    //     if (!shelves || shelves.length == 0) throw new Error("Invalid box id");

    //     for (const sh of shelves) {
    //         if (sh.remove(item)) return true;
    //     }

    //     // remove from Box
    //     solution.removeRectangle(item, box);
    //     return false;
    // }

    checkThenAddToBox(item: Rectangle, solution: Solution, box: Box): boolean {
        if (box.areaLeft <= item.area) return false;

        // get the shelves of this box
        const shelves = this.boxToShelf.get(box.id);
        if (!shelves || shelves.length == 0) throw new Error("Invalid box id");

        // try to add to an existing shelf
        for (const sh of shelves) {
            if (this.tryAddItemToShelf(sh, item, box, solution)) return true;
        }

        // check if can create a new shelf for this box
        if (this.tryAddShelfToBox(shelves, item, box, solution)) return true;

        return false;
    }

    checkThenAdd(item: Rectangle, solution: Solution): boolean {
        try {
            // loop through each of current box
            for (const box of solution.idToBox.values()) {
                if (this.checkThenAddToBox(item, solution, box)) return true;
            }
            // ... else, we have to add a new box and a new shelf to that
            return this.createNewBoxAndAddShelf(item, solution);
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}

export class ShelfBestAreaFit extends ShelfFirstFit {
    leastWastedBoxHeight: number = -1;
    leastWastedShelfValue: number = -1;
    bestBox: Box | null = null;
    bestShelf: Shelf | null = null;
    constructor() {
        super();
        this.init();
    }

    init() {
        this.leastWastedBoxHeight = -1;
        this.leastWastedShelfValue = -1;
        this.bestBox = null;
        this.bestShelf = null;
    }

    calculateWastedShelfValue(sh: Shelf, item: Rectangle, box: Box): boolean {
        const wd = sh.getWidthDiff(item.getWidth);
        const hd = sh.getHeightDiff(item.getHeight);
        if (wd >= 0 && hd >= 0) {
            const waste = wd + hd;
            if (
                this.leastWastedShelfValue < 0 ||
                waste < this.leastWastedShelfValue
            ) {
                this.leastWastedShelfValue = waste;
                this.bestBox = box;
                this.bestShelf = sh;
                return true;
            }
        }
        return false;
    }

    checkThenAddToABox(item: Rectangle, solution: Solution, box: Box): boolean {
        this.init();

        if (box.areaLeft <= item.area) return false;
        // get the shelves of this box
        const shelves = this.boxToShelf.get(box.id);
        if (!shelves || shelves.length == 0) throw new Error("Invalid box id");
        for (const sh of shelves) {
            this.calculateWastedShelfValue(sh, item, box);
            item.setRotate();
            if (!this.calculateWastedShelfValue(sh, item, box))
                item.setRotate();
        }
        if (this.bestShelf) {
            if (this.tryAddItemToShelf(this.bestShelf, item, box, solution))
                return true;
        }
        if (this.tryAddShelfToBox(shelves, item, box, solution)) return true;
        return false;
    }

    checkThenAdd(item: Rectangle, solution: Solution): boolean {
        this.init();

        try {
            // loop through each of current box

            for (const box of solution.idToBox.values()) {
                // skip to next box if there is no area left for new item
                if (box.areaLeft <= item.area) continue;
                // get the shelves of this box
                const shelves = this.boxToShelf.get(box.id);
                if (!shelves || shelves.length == 0)
                    throw new Error("Invalid box id");

                // find the perfect shelf
                for (const sh of shelves) {
                    // Try first orientation
                    this.calculateWastedShelfValue(sh, item, box);
                    // Try rotated orientation
                    item.setRotate();
                    // if no better -> rotate back
                    if (!this.calculateWastedShelfValue(sh, item, box))
                        item.setRotate();
                }

                // if there is no perfect shelf -> find perfect box
                if (!this.bestShelf && !this.bestBox) {
                    if (!item.isSideway) item.setRotate();
                    const lastShelf = shelves[shelves.length - 1];
                    const wastedHeight =
                        solution.L -
                        (lastShelf.y + lastShelf.height + item.getHeight);
                    if (wastedHeight < 0) continue;
                    if (
                        this.leastWastedBoxHeight < 0 ||
                        wastedHeight < this.leastWastedBoxHeight
                    ) {
                        this.bestBox = box;
                    }
                }
            }

            if (this.bestShelf && this.bestBox) {
                if (
                    this.tryAddItemToShelf(
                        this.bestShelf,
                        item,
                        this.bestBox,
                        solution,
                    )
                )
                    return true;
            } else if (this.bestBox) {
                const shelves = this.boxToShelf.get(this.bestBox.id);
                if (!shelves) throw new Error("Invalid box id");
                if (
                    this.tryAddShelfToBox(shelves, item, this.bestBox, solution)
                )
                    return true;
            }

            // ... else, we have to add a new box and a new shelf to that
            return this.createNewBoxAndAddShelf(item, solution);
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}

// Greedy Selection handler
export function createGreedyPlacement(
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
