import { Box, Rectangle } from "@/models/binpacking";
import type { AlgoSolution, AlgoConfig } from "@/models";


export class Solution implements AlgoSolution {
  algoConfig: AlgoConfig;
  L: number;
  boxes: Box[];
  rectToBox: Map<number, number>; // an id-to-id dictionary
  // TODO: hover on list => show position on map

  constructor(algoConfig: AlgoConfig, L: number) {
    this.algoConfig = algoConfig;

    this.L = L;
    this.boxes = [];
    this.rectToBox = new Map();
  }

  checkDone(): boolean {
    return true;
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
}
