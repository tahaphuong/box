import { Rectangle } from ".";

export class Instance {
  L: number;
  rectangles: Rectangle[];

  constructor(L: number, rectangles: Rectangle[]) {
    this.L = L;
    this.rectangles = rectangles;
  }
}
