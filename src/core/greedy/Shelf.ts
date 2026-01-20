import type { Rectangle } from "@/models/binpacking";

export class Shelf {
  currentWidth: number;
  rectangles: Rectangle[];

  readonly y: number; // position of shelf in box
  readonly height: number;

  constructor(y: number, height: number) {
    this.height = height
    this.y = y;

    this.currentWidth = 0;
    this.rectangles = [];
  }

  check(rect: Rectangle, boxWidth: number): boolean {
    return rect.getHeight <= this.height && this.currentWidth + rect.getWidth <= boxWidth;
  }

  getHeightDiff(rectHeight: number): number {
    return this.height - rectHeight;
  }

  getWidthDiff(boxWidth: number, rectWidth: number): number {
    return boxWidth - this.currentWidth - rectWidth;
  }

  add(rect: Rectangle): void {
    rect.x = this.currentWidth;
    rect.y = this.y;

    this.currentWidth = this.currentWidth + rect.getWidth;
    this.rectangles.push(rect);
  }
};
