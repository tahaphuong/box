import { Rectangle } from ".";

export class Box {
  readonly id: number;
  readonly L: number;

  fillArea: number;
  rectangles: Rectangle[]; // list rectangles in this box

  constructor(id: number, L: number) {
    this.id = id;
    this.L = L;

    this.fillArea = 0;
    this.rectangles = [];
  }

  addRectangle(rect: Rectangle): void {
    this.rectangles.push(rect);
    this.fillArea += rect.area;
  }

  getFillPercentage(): number {
    return this.fillArea / (this.L * this.L);
  }
}
