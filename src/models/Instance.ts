import { Rectangle } from ".";

export class Instance {
  L: number;
  rectangles: Rectangle[];

  constructor(L: number, rectangles: Rectangle[]) {
    this.L = L;
    this.rectangles = rectangles;
  }

  sortByLargerSide() {
    return [...this.rectangles].sort((a, b) => b.getLargerSide() - a.getLargerSide());
  }
  sortByArea() {
    return [...this.rectangles].sort((a, b) => b.getArea() - a.getArea());
  }

}
