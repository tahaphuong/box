import { Box, Rectangle } from "@/models/binpacking";
import { AlgoSolution, type AlgoConfig } from "@/models";


export class Solution extends AlgoSolution {
  readonly algoConfig: AlgoConfig;
  readonly L: number;
  boxes: Box[];
  rectToBox: Map<number, number>; // an id-to-id dictionary

  constructor(algoConfig: AlgoConfig, L: number) {
    super();
    this.algoConfig = algoConfig;
    this.L = L;
    this.boxes = [];
    this.rectToBox = new Map();
  }

  addNewBox(): Box {
    const box = new Box(this.boxes.length, this.L)
    this.boxes.push(box);
    return box;
  }

  addRectangle(rect: Rectangle, box: Box): void {
    rect.setBoxId(box.id)
    box.addRectangle(rect)
    this.rectToBox.set(rect.id, box.id)
  }

  getWastedArea(): number {
    let area = 0;
    for (const box of this.boxes) {
      area += box.areaLeft;
    }
    return area;
  }
}
