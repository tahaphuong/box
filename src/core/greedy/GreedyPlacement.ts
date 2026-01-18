import type { Box, Rectangle, Solution } from "@/models/binpacking";

export interface GreedyPlacement<Item, SOL> {
  checkThenAdd(item: Item, solution: SOL): boolean;
}

class Shelf {
  x: number;
  rectangles: Rectangle[];
  // heightGaps: number[]; // height gaps of rectangles

  readonly y: number; // position of shelf in box
  readonly height: number;

  constructor(y: number, height: number) {
    this.height = height
    this.y = y;

    this.x = 0;
    this.rectangles = [];
    // this.heightGaps = [];
  }

  check(rect: Rectangle, shelfWidth: number): boolean {
    return rect.getHeight <= this.height && this.x + rect.getWidth <= shelfWidth;
  }

  add(rect: Rectangle): void {
    rect.x = this.x;
    rect.y = this.y;
    this.rectangles.push(rect);
    this.x = this.x + rect.getWidth;
    //this.heightGaps.push(this.height - rect.getHeight);
  }
}

export class ShelfFirstFit implements GreedyPlacement<Rectangle, Solution> {
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

  checkThenAdd(item: Rectangle, solution: Solution): boolean {
    try {

      // loop through each of current box
      for (const box of solution.boxes) {

        // get the shelves of this box
        let shelves = this.boxToShelf.get(box.id);

        // if there is no shelf defined, create a new shelf, add the rect and return true
        if (!shelves || shelves.length == 0) {
          const sh = this.createNewShelfAndAddItem(0, item);
          this.boxToShelf.set(box.id, [sh]);
          solution.addRectangle(item, box);
          return true;
        }
        // ... then we do have shelves defined for this box

        // else loop through each shelf and try to add to a shelf
        for (const sh of shelves) {
          // try upright first
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
        }
        // ... then no current shelf has fit

        // check if can create a new shelf for this box
        // if yes, create new shelf and add the rect sideway into that
        if (!item.isSideway) {
          item.setRotate();
        }
        const lastShelf = shelves[shelves.length - 1];
        if (lastShelf.y + lastShelf.height + item.getHeight <= solution.L) {
          const sh = this.createNewShelfAndAddItem(lastShelf.y + lastShelf.height, item)
          shelves.push(sh);
          solution.addRectangle(item, box);
          return true;
        }
      }
      // ... else, we have to add a new box and a new shelf to that

      const box: Box = solution.addNewBox();
      const sh = this.createNewShelfAndAddItem(0, item);
      this.boxToShelf.set(box.id, [sh]);
      solution.addRectangle(item, box);
      return true
    } catch (error) {
      console.error(error)
      return false;
    }
  }

}
