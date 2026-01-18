export class Rectangle {
  // INIT: required values for INIT
  id: number;
  width: number;
  length: number;

  // SOLUTION: default to false and -1 when INIT
  rotated: boolean;
  x: number;
  y: number;
  boxId: number;

  constructor(id: number, width: number, length: number) {
    this.id = id;
    this.width = width;
    this.length = length;

    this.rotated = false;
    this.x = -1;
    this.y = -1;
    this.boxId = -1
  }

  // GETTERS
  getArea(): number {
    return this.width * this.length;
  }
  getLargerSide(): number {
    if (this.width >= this.length) {
      return this.width;
    }
    return this.length;
  }

  // SETTERS
  setRotate(rotated: boolean = true) {
    this.rotated = rotated;
    return this;
  }
  setCoords(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }
  setBoxId(boxId: number) {
    this.boxId = boxId;
    return this; // Method chaining?
  }
}
