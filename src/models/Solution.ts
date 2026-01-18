import { Box, Rectangle, type AlgoConfig } from "@/models";


export class Solution {
  algoConfig: AlgoConfig;
  L: number;
  boxes: Box[];
  rectToBox: Record<number, number>; // an id-to-id dictionary
  // TODO: hover on list => show position on map

  constructor(algoConfig: AlgoConfig, L: number) {
    this.algoConfig = algoConfig;

    this.L = L;
    this.boxes = [];
    this.rectToBox = {};
  }

  addNewBox() {
    const box = new Box(this.boxes.length, this.L)
    this.boxes.push(box);
    return box;
  }

  addRectangle(rect: Rectangle, box: Box) {
    rect.setBoxId(box.id)
    box.addRectangle(rect)
    this.rectToBox[rect.id] = box.id
  }
}
