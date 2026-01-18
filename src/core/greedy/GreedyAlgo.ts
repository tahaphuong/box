import { GreedySelection } from "./GreedySelection";
import { type GreedyPlacement } from "./GreedyPlacement";
import type { AlgoInterface, AlgoSolution } from "@/models";

export class GreedyAlgo<Item, SOL extends AlgoSolution> implements AlgoInterface<SOL> {
  selection: GreedySelection<Item>; // Holds list of items, return the next item to evaluate
  placement: GreedyPlacement<Item, SOL>; // Receives the current solution & next item, return if it's possible to add it to solution
  solution: SOL; // the main solution

  constructor(emptySolution: SOL, selection: GreedySelection<Item>, placement: GreedyPlacement<Item, SOL>) {
    this.solution = emptySolution; // Init empty solution here
    this.selection = selection;
    this.placement = placement;
  }

  solve(): SOL {
    // 2. Iteratively getNextItem and evaluate
    let item = this.selection.getNextItem();
    while (item) {
      // 3. Add if adding to Solution is feasible (doesn't violate constraints)
      this.placement.checkThenAdd(item, this.solution);
      item = this.selection.getNextItem();
    }
    return this.solution;
  }

}
