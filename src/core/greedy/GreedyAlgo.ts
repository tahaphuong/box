import { GreedySelection } from "./GreedySelection";
import { type GreedyPlacement } from "./placement/GreedyPlacement";
import type { AlgoInterface, AlgoSolution } from "@/models";

export class GreedyAlgo<
    Item,
    SOL extends AlgoSolution,
> implements AlgoInterface<SOL> {
    selection: GreedySelection<Item>; // Holds list of items, return the next item to evaluate
    placement: GreedyPlacement<Item, SOL>; // Receives the current solution & next item, return if it's possible to add it to solution

    constructor(
        selection: GreedySelection<Item>,
        placement: GreedyPlacement<Item, SOL>,
    ) {
        this.selection = selection;
        this.placement = placement;
    }

    solve(solution: SOL): SOL {
        let item = this.selection.getNextItem();
        while (item) {
            this.placement.checkThenAdd(item, solution, null);
            item = this.selection.getNextItem();
        }
        return solution;
    }
}
