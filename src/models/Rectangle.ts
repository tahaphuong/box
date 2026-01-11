export class Rectangle {
  width: number;
  length: number;

  constructor(width: number, length: number) {
    this.width = width;
    this.length = length;
  }
  getArea(): number {
    return this.width * this.length;
  }
  getLargerSide(): number {
    if (this.width >= this.length) {
      return this.width
    }
    return this.length
  }
  getPerimeter(): number {
    return 2 * (this.width + this.length);
  }
}
