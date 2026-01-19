import { Rectangle } from ".";

export class Box {
  readonly id: number;
  readonly L: number;
  rectangles: Rectangle[]; // list rectangles in this box

  constructor(id: number, L: number) {
    this.id = id;
    this.L = L;
    this.rectangles = [];
  }

  addRectangle(rect: Rectangle): void {
    this.rectangles.push(rect)
  }

}
