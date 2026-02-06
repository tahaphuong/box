import { Shelf } from "./Shelf";
import {
    Solution,
    type Box,
    type Position,
    Rectangle,
} from "@/models/binpacking";
import { type GreedyPlacement } from "./GreedyPlacement";
import { create, castDraft } from "mutative";

const mark = (target: object) => {
    if (target instanceof ShelfPlacement) {
        return () => {
            const copy = Object.assign(
                Object.create(Object.getPrototypeOf(target)),
                target,
            );
            const m = new Map<number, Shelf[]>();
            for (const [boxId, shelves] of target.boxToShelf.entries()) {
                m.set(
                    boxId,
                    shelves.map((sh) => {
                        const shelfCopy = Object.assign(
                            Object.create(Object.getPrototypeOf(sh)),
                            sh,
                        );
                        // Share rectangle references with neighbors
                        shelfCopy.rectangles = sh.rectangles;
                        return shelfCopy;
                    }),
                );
            }
            copy.boxToShelf = m;
            return copy;
        };
    }
    if (target instanceof Shelf) {
        return () => {
            const copy = Object.assign(
                Object.create(Object.getPrototypeOf(target)),
                target,
            );
            copy.rectangles = target.rectangles.map((r) =>
                Object.assign(Object.create(Object.getPrototypeOf(r)), r),
            );
            return copy;
        };
    }
};

export abstract class ShelfPlacement implements GreedyPlacement<
    Rectangle,
    Solution
> {
    boxToShelf: Map<number, Shelf[]>; // box id to shelf

    constructor() {
        this.boxToShelf = new Map();
    }
    removeBox(boxId: number): void {
        this.boxToShelf.delete(boxId);
    }
    clearState(): void {
        this.boxToShelf.clear();
    }
    copyPlacementState(other: GreedyPlacement<Rectangle, Solution>): void {
        if (!(other instanceof ShelfPlacement))
            throw new Error("Unsupported type");

        this.boxToShelf = new Map(other.boxToShelf);
    }
    // clone when changes
    clone(
        updateFn?: (draft: GreedyPlacement<Rectangle, Solution>) => void,
    ): GreedyPlacement<Rectangle, Solution> {
        return create(
            this,
            (draft) => {
                if (updateFn)
                    updateFn(
                        castDraft(draft) as GreedyPlacement<
                            Rectangle,
                            Solution
                        >,
                    );
            },
            { mark, strict: false, enableAutoFreeze: false },
        );
    }

    abstract createNewShelf(
        boxId: number,
        boxLength: number,
        height: number,
    ): Shelf | null;

    abstract compactShelvesOfBox(boxId: number): void;

    // abstract removeItem(item: Rectangle, solution: Solution): boolean;

    abstract findPosition(item: Rectangle, solution: Solution): Position | null;

    abstract checkThenAdd(
        item: Rectangle,
        solution: Solution,
        indicatedPos: Position | null,
    ): boolean;
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

    findPosition(item: Rectangle, solution: Solution): Position | null {
        for (const box of solution.idToBox.values()) {
            if (box.areaLeft <= item.area) continue;

            const shelves = this.boxToShelf.get(box.id);
            if (shelves == undefined) throw new Error("Box not in map");

            for (let i = 0; i < shelves.length; i++) {
                const sh = shelves[i];
                for (const sideway of [false, true]) {
                    if (sh.check(item, sideway)) {
                        const pos = sh.getNextPosition();

                        return {
                            boxId: box.id,
                            x: pos.x,
                            y: pos.y,
                            isSideway: sideway,

                            shelfIndex: i, // -1 means new shelf in boxId
                        };
                    }
                }
            }

            const currentY = this.getYNextShelf(box.id);
            const newShelfHeight = item.smallerSide;

            if (currentY + newShelfHeight <= box.L) {
                return {
                    boxId: box.id,
                    x: 0,
                    y: currentY,
                    isSideway: true,

                    shelfIndex: -1, // -1 means new shelf in boxId
                };
            }
        }
        return null; // need new box
    }

    checkThenAdd(
        item: Rectangle,
        solution: Solution,
        indicatedPos: Position | null,
    ): boolean {
        try {
            // loop through each shelf
            const pos = indicatedPos ?? this.findPosition(item, solution);

            if (pos && pos.shelfIndex != undefined) {
                const shelves = this.boxToShelf.get(pos.boxId);
                if (shelves == undefined) throw new Error("Invalid box id");

                let bestShelf: Shelf | null = null;

                if (pos.shelfIndex >= 0) {
                    bestShelf = shelves[pos.shelfIndex];
                } else {
                    bestShelf = this.createNewShelf(
                        pos.boxId,
                        solution.L,
                        item.smallerSide,
                    );
                }

                if (!bestShelf) throw new Error("Failed to create new shelf");
                if (pos.shelfIndex == -1) shelves.push(bestShelf);

                item.isSideway = pos.isSideway;
                bestShelf.add(item);
                solution.addRectangle(item, bestShelf.boxId);
                return true;
            }

            // if no shelf found, create a new box and shelf
            if (!pos) {
                const newBox: Box = solution.addNewBox();
                const bestShelf = this.createNewShelf(
                    newBox.id,
                    newBox.L,
                    item.smallerSide,
                );
                if (!bestShelf)
                    throw new Error("Failed to create new box and new shelf");
                this.boxToShelf.set(newBox.id, [bestShelf]);

                item.isSideway = true;
                bestShelf.add(item);
                solution.addRectangle(item, bestShelf.boxId);
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
    findPosition(item: Rectangle, solution: Solution): Position | null {
        let leastWastedArea: number = Infinity;
        let bestShelf: Shelf | null = null;
        let bestShelfIndex: number = -1;
        let bestSideway: boolean | null = null;

        let leastWastedHeight: number = Infinity;
        let bestBox: Box | null = null;

        for (const box of solution.idToBox.values()) {
            if (box.areaLeft <= item.area) continue;
            const shelves = this.boxToShelf.get(box.id);
            if (shelves == undefined) throw new Error("Box not in map");

            for (let i = 0; i < shelves.length; i++) {
                const sh = shelves[i];
                for (const wantSideway of [false, true]) {
                    const waste = sh.calcWasteOrientation(item, wantSideway);
                    if (waste >= 0 && waste < leastWastedArea) {
                        leastWastedArea = waste;
                        bestShelf = sh;
                        bestShelfIndex = i;
                        bestSideway = wantSideway;
                    }
                }
            }

            if (bestShelf != null && bestSideway != null) continue;
            // if no best shelf found, find best box
            const wastedHeight =
                box.L - this.getYNextShelf(box.id) - item.smallerSide;

            if (wastedHeight < 0) continue;
            if (wastedHeight < leastWastedHeight) {
                leastWastedHeight = wastedHeight;
                bestBox = box;
            }
        }

        // if found best shelf
        if (bestShelf != null && bestSideway != null) {
            // if (bestSideway != item.isSideway) item.isSideway = bestSideway;
            return {
                boxId: bestShelf.boxId,
                x: 0,
                y: bestShelf.y,
                isSideway: bestSideway,

                shelfIndex: bestShelfIndex, // -1 means new shelf in boxId
            };
        }

        if (bestBox != null) {
            const currentY = this.getYNextShelf(bestBox.id);
            const newShelfHeight = item.smallerSide;

            if (currentY + newShelfHeight <= bestBox.L) {
                return {
                    boxId: bestBox.id,
                    x: 0,
                    y: currentY,
                    isSideway: true,

                    shelfIndex: -1, // -1 means new shelf in boxId
                };
            }
        }
        return null;
    }
}

// removeItem(item: Rectangle, solution: Solution): boolean {
//     const shelves = this.boxToShelf.get(item.boxId);
//     if (shelves == undefined) throw new Error("Invalid box id");

//     let removed = false;
//     for (const sh of shelves) {
//         if (sh.remove(item)) {
//             sh.compact(item);
//             removed = true;
//             break;
//         }
//     }
//     if (!removed) return false;
//     solution.removeRectangle(item);
//     this.compactShelvesOfBox(item.boxId);
//     return true;
// }
