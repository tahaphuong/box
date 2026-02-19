import { SelectionOption, type SelectionOptionType } from "@/models";
import type { Rectangle } from "@/models/binpacking";

export interface GreedySelection<Item> {
    items: Item[];
    getNextItem(): Item | null;
}
abstract class OrderingSelection<Item> implements GreedySelection<Item> {
    items: Item[];
    index: number;
    constructor(items: Item[]) {
        this.items = items;
        this.index = 0;
        this.preProcess();
    }
    abstract preProcess(): void;

    getNextItem(): Item | null {
        if (this.index == this.items.length) {
            return null;
        }
        this.index += 1;
        return this.items[this.index - 1];
    }
}

export class LargestAreaFirst extends OrderingSelection<Rectangle> {
    preProcess(): void {
        this.items.sort((a, b) => b.area - a.area);
    }
}

export class LongestSideFirst extends OrderingSelection<Rectangle> {
    preProcess(): void {
        this.items.sort((a, b) => b.largerSide - a.largerSide);
    }
}

export class OriginalSelection extends OrderingSelection<Rectangle> {
    preProcess(): void {}
}

// Greedy Selection handler
export function createSelectionBinPack(
    option: SelectionOptionType = SelectionOption.LONGEST,
    items: Rectangle[],
): GreedySelection<Rectangle> {
    switch (option) {
        case SelectionOption.LONGEST:
            return new LongestSideFirst(items);
        case SelectionOption.LARGEST:
            return new LargestAreaFirst(items);
        case SelectionOption.ORIGINAL:
            return new OriginalSelection(items);
        default: {
            throw new Error(`Unknown greedy option: ${option}`);
        }
    }
}
