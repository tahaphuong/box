import { GreedySelection } from "./GreedySelection";
import { type GreedyPlacement } from "./GreedyPlacement";
import type { AlgoInterface, AlgoSolution } from "@/models";

export class GreedyAlgo<Item, SOL extends AlgoSolution> implements AlgoInterface<SOL> {
  selection: GreedySelection<Item>; // Holds list of items, return the next item to evaluate
  placement: GreedyPlacement<Item, SOL>; // Receives the current solution & next item, return if it's possible to add it to solution
  solution: SOL; // the main solution

  constructor(emptySolution: SOL, selection: GreedySelection<Item>, placement: GreedyPlacement<Item, SOL>) {
    this.solution = emptySolution;
    this.selection = selection;
    this.placement = placement;
  }

  solve(): SOL {
    const start = performance.now();

    let item = this.selection.getNextItem();
    while (item) {
      this.placement.checkThenAdd(item, this.solution);
      item = this.selection.getNextItem();
    }

    const runtime = performance.now() - start;
    this.solution.setRunTime(runtime);
    return this.solution;
  }
}
