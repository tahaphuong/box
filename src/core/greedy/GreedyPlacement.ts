import type { Box, Rectangle, Solution } from "@/models/binpacking";
import { Shelf } from "./Shelf";
import { PlacementOption, type PlacementOptionType } from "@/models";

export interface GreedyPlacement<Item, SOL> {
  checkThenAdd(item: Item, solution: SOL): boolean;
}

class ShelfFirstFit implements GreedyPlacement<Rectangle, Solution> {
  boxToShelf: Map<number, Shelf[]> // box id to shelf

  constructor() {
    this.boxToShelf = new Map();
  }

  createNewShelfAndAddItem(y: number, item: Rectangle): Shelf {
    // rotate sideway before create and add
    if (!item.isSideway) {
      item.setRotate();
    }
    const sh = new Shelf(y, item.getHeight);
    sh.add(item);
    return sh;
  }

  tryAddItemToShelf(sh: Shelf, item: Rectangle, box: Box, solution: Solution): boolean {
    if (item.isSideway) {
      item.setRotate();
    }
    if (sh.check(item, solution.L)) {
      sh.add(item);
      solution.addRectangle(item, box);
      return true;
    }


    // then try sideway
    item.setRotate();
    if (sh.check(item, solution.L)) {
      sh.add(item);
      solution.addRectangle(item, box);
      return true;
    }

    return false;
  }

  tryAddShelfToBox(shelves: Shelf[], item: Rectangle, box: Box, solution: Solution): boolean {
    const lastShelf = shelves[shelves.length - 1];
    if (lastShelf.y + lastShelf.height + item.getSmallerSide() <= solution.L) {
      const sh = this.createNewShelfAndAddItem(lastShelf.y + lastShelf.height, item)
      shelves.push(sh);
      solution.addRectangle(item, box);
      return true;
    }
    return false
  }

  createNewBoxAndAddShelf(item: Rectangle, solution: Solution): boolean {
    const box: Box = solution.addNewBox();
    const sh = this.createNewShelfAndAddItem(0, item);
    this.boxToShelf.set(box.id, [sh]);
    solution.addRectangle(item, box);
    return true;
  }

  checkThenAdd(item: Rectangle, solution: Solution): boolean {
    try {

      // loop through each of current box
      for (const box of solution.boxes) {

        // skip to next box if there is no area left for new item
        if (box.areaLeft <= item.area) continue

        // get the shelves of this box
        let shelves = this.boxToShelf.get(box.id);
        if (!shelves || shelves.length == 0) throw new Error("Invalid box id");

        // try to add to an existing shelf
        for (const sh of shelves) {
          if (this.tryAddItemToShelf(sh, item, box, solution)) return true;
        }

        // check if can create a new shelf for this box
        if (this.tryAddShelfToBox(shelves, item, box, solution)) return true;
      }

      // ... else, we have to add a new box and a new shelf to that
      return this.createNewBoxAndAddShelf(item, solution);

    } catch (error) {
      console.error(error)
      return false;
    }
  }

}

class ShelfBestAreaFit extends ShelfFirstFit {

  leastWastedBoxHeight: number = -1;
  leastWastedShelfValue: number = -1;

  bestBox: Box | null = null;
  bestShelf: Shelf | null = null;

  calculateWastedShelfValue(sh: Shelf, boxWidth: number, item: Rectangle, box: Box): boolean {
    let wd = sh.getWidthDiff(boxWidth, item.getWidth);
    let hd = sh.getHeightDiff(item.getHeight);
    if (wd >= 0 && hd >= 0) {
      const waste = wd + hd;
      if (this.leastWastedShelfValue < 0 || waste < this.leastWastedShelfValue) {
        this.leastWastedShelfValue = waste;
        this.bestBox = box;
        this.bestShelf = sh;
        return true;
      }
    }
    return false;
  }
  checkThenAdd(item: Rectangle, solution: Solution): boolean {

    this.leastWastedBoxHeight = -1;
    this.leastWastedShelfValue = -1;

    this.bestBox = null;
    this.bestShelf = null;

    try {
      // loop through each of current box

      for (const box of solution.boxes) {
        // skip to next box if there is no area left for new item
        if (box.areaLeft <= item.area) continue
        // get the shelves of this box
        let shelves = this.boxToShelf.get(box.id);
        if (!shelves || shelves.length == 0) throw new Error("Invalid box id");

        // find the perfect shelf
        for (const sh of shelves) {
          // Try first orientation
          this.calculateWastedShelfValue(sh, solution.L, item, box)
          // Try rotated orientation
          item.setRotate();
          // if no better -> rotate back
          if (!this.calculateWastedShelfValue(sh, solution.L, item, box)) item.setRotate();
        }

        // if there is no perfect shelf -> find perfect box
        if (!this.bestShelf && !this.bestBox) {
          if (!item.isSideway) item.setRotate();
          const lastShelf = shelves[shelves.length - 1];
          const wastedHeight = solution.L - (lastShelf.y + lastShelf.height + item.getHeight);
          if (wastedHeight < 0) continue;
          if (this.leastWastedBoxHeight < 0 || wastedHeight < this.leastWastedBoxHeight) {
            this.bestBox = box;
          }
        }
      }

      if (this.bestShelf && this.bestBox) {
        if (this.tryAddItemToShelf(this.bestShelf, item, this.bestBox, solution)) return true;
      } else if (this.bestBox) {
        const shelves = this.boxToShelf.get(this.bestBox.id);
        if (!shelves) throw new Error("Invalid box id");
        if (this.tryAddShelfToBox(shelves, item, this.bestBox, solution)) return true;
      }

      // ... else, we have to add a new box and a new shelf to that
      return this.createNewBoxAndAddShelf(item, solution);
    } catch (error) {
      console.error(error)
      return false;
    }
  }
}


// Greedy Selection handler
export function createGreedyPlacement(option: PlacementOptionType = PlacementOption.SHELF_FIRST_FIT): GreedyPlacement<Rectangle, Solution> {
  switch (option) {
    case PlacementOption.SHELF_BEST_AREA_FIT:
      return new ShelfBestAreaFit();
    case PlacementOption.SHELF_FIRST_FIT:
    default:
      return new ShelfFirstFit();
  }
}
