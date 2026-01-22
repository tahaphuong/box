import { SelectionOption, type SelectionOptionType } from "@/models";
import type { Rectangle } from "@/models/binpacking";

export abstract class GreedySelection<Item> {
  items: Item[]
  index = 0;
  constructor(items: Item[]) {
    this.items = items;
    this.preProcess();
  }
  abstract preProcess(): void;
  abstract getNextItem(): Item | null;
}

export class LargestAreaFirst extends GreedySelection<Rectangle> {
  preProcess(): void {
    this.items.sort((a, b) => b.area - a.area);
  }
  getNextItem(): Rectangle | null {
    if (this.index == this.items.length) {
      return null;
    }
    this.index += 1;
    return this.items[this.index - 1];
  }
}

export class LongestSideFirst extends GreedySelection<Rectangle> {
  preProcess(): void {
    this.items.sort((a, b) => b.getLargerSide() - a.getLargerSide());
  }
  getNextItem(): Rectangle | null {
    if (this.index == this.items.length) {
      return null;
    }
    this.index += 1;
    return this.items[this.index - 1];
  }
}


// Greedy Selection handler
export function createGreedySelection(
  option: SelectionOptionType = SelectionOption.LONGEST,
  items: Rectangle[]
): GreedySelection<Rectangle> {
  switch (option) {
    case SelectionOption.LONGEST:
      return new LongestSideFirst(items);
    case SelectionOption.LARGEST:
      return new LargestAreaFirst(items);
    default: {
      throw new Error(`Unknown greedy option: ${option}`);
    }
  }
}
