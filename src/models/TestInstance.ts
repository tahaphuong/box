
import { Rectangle } from ".";

export class TestInstance {
  L: number;
  rectangles: Rectangle[];

  constructor(L: number, rectangles: Rectangle[]) {
    this.L = L;
    this.rectangles = rectangles;
  }

  getTotalArea(): number {
    return this.rectangles.reduce((sum, rect) => sum + rect.getArea(), 0);
  }

  getCount(): number {
    return this.rectangles.length;
  }

  sortByLargerSide() {
    this.rectangles.sort((a, b) => b.getLargerSide() - a.getLargerSide());
  }
  sortByArea() {
    this.rectangles.sort((a, b) => b.getArea() - a.getArea());
  }

}
