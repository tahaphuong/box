import { GreedySelection } from "./GreedySelection";
import type { GreedyPlacement } from "./GreedyPlacement";
import type { GreedySolution } from "./GreedySolution";

export class GreedyAlgo<Item> {
  selection: GreedySelection<Item>;
  placement: GreedyPlacement<Item>;
  solution: GreedySolution<Item>;

  constructor(emptySolution: GreedySolution<Item>, selection: GreedySelection<Item>, placement: GreedyPlacement<Item>) {
    // 1. Initialize an empty SolutionSet
    this.solution = emptySolution;
    this.selection = selection; // Sort and pick Item here
    this.placement = placement;
  }


  solve(): GreedySolution<Item> {
    // 2. Iteratively getNextItem and evaluate
    let item = this.selection.getNextItem()
    while (item) {
      // 3. Add if adding to Solution is feasible (doesn't violate constraints)
      if (this.placement.place(item)) {
        this.solution.add(item);
      }
      item = this.selection.getNextItem()
    }
    return this.solution;
  }

}
