import { Box, Rectangle } from "@/models/binpacking";
import { AlgoSolution } from "@/models";
import { create, castDraft } from "mutative";

const mark = (target: object) => {
    if (target instanceof Solution) {
        return () => {
            const copy = Object.assign(
                Object.create(Object.getPrototypeOf(target)),
                target,
            );

            // Replace idToBox with a new Map of cloned Boxes
            copy.idToBox = new Map();
            for (const [id, box] of target.idToBox.entries()) {
                copy.idToBox.set(id, mark(box)!());
            }

            return copy;
        };
    }

    if (target instanceof Box) {
        return () => {
            const copy = Object.assign(
                Object.create(Object.getPrototypeOf(target)),
                target,
            );
            copy.rectangles = target.rectangles;
            return copy;
        };
    }

    if (target instanceof Rectangle) {
        return () => {
            // Shallow copy is enough for primitives in Rectangle
            return Object.assign(
                Object.create(Object.getPrototypeOf(target)),
                target,
            );
        };
    }
};

export class Solution extends AlgoSolution {
    readonly L: number;
    idToBox: Map<number, Box>; // an boxId-to-Box dictionary
    incId: number;

    constructor(L: number) {
        super();
        this.L = L;
        this.idToBox = new Map();
        this.incId = 0;
    }

    clone(updateFn?: (draft: Solution) => void): Solution {
        return create(
            this,
            (draft) => {
                if (updateFn) updateFn(castDraft(draft) as Solution);
            },
            { mark, strict: false, enableAutoFreeze: false },
        );
    }

    addNewBox(): Box {
        const box = new Box(this.incId++, this.L);
        this.idToBox.set(box.id, box);
        return box;
    }
    removeBox(boxId: number): void {
        const box = this.idToBox.get(boxId);
        if (!box)
            throw new Error(
                `Remove box ${boxId} failed: Box ${boxId} is not in solution`,
            );
        this.idToBox.delete(boxId);
    }

    addRectangle(rect: Rectangle, boxId: number): void {
        const box = this.idToBox.get(boxId);
        if (!box)
            throw new Error(
                `Add rect ${rect.id} failed: Box ${boxId} is not in solution`,
            );
        rect.boxId = boxId;
        box.addRectangle(rect);
    }
    removeRectangle(rect: Rectangle): void {
        const box = this.idToBox.get(rect.boxId);
        if (box == undefined)
            throw new Error(
                `Remove rect ${rect.id} failed: Box ${rect.boxId} is not in solution`,
            );
        rect.boxId = -1;
        box.removeRectangle(rect);
    }
}
