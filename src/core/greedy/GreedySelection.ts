import type { Rectangle } from "@/models";

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
    this.items.sort((a, b) => b.getArea() - a.getArea());
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
